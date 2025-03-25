const express = require('express')
const router = express.Router()
const Stall = require('../models/Stall')
const Barn = require('../models/Barn')
const Pig = require('../models/Pig')
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

// Apply rate limiter to all requests
router.use(limiter)

// GET all stalls with barn and farm details
router.get('/', async (req, res) => {
  try {
    const stalls = await Stall.find({})
      .populate({
        path: 'barnId',
        select: 'name'
      })
      .populate({
        path: 'farmId',
        select: 'name'
      })
      .sort({ name: 1 })

    // Add pig counts to each stall
    const stallsWithCounts = await Promise.all(stalls.map(async stall => {
      const pigCount = await Pig.countDocuments({ 
        'currentLocation.stallId': stall._id,
        active: true
      })
      
      return {
        ...stall.toObject(),
        pigCount
      }
    }))

    res.json(stallsWithCounts)
  } catch (error) {
    console.error('Error fetching stalls:', error)
    res.status(500).json({ error: 'Failed to fetch stalls' })
  }
})

// GET stalls by barn ID
router.get('/barn/:barnId', async (req, res) => {
  try {
    const stalls = await Stall.find({ barnId: req.params.barnId })
      .populate({
        path: 'barnId',
        select: 'name'
      })
      .sort({ name: 1 })

    res.json(stalls)
  } catch (error) {
    console.error('Error fetching stalls by barn:', error)
    res.status(500).json({ error: 'Failed to fetch stalls' })
  }
})
router.get('/health', async (req, res) => {
  try {
      const { filter } = req.query;
      
      const matchStage = {
          active: true
      };

      // Add optional filtering based on the request
      if (filter === 'region1') {
          matchStage['location.region'] = 'Region 1';
      } else if (filter === 'region2') {
          matchStage['location.region'] = 'Region 2';
      }
      // Add more filters as needed

      const stalls = await Stall.aggregate([
          {
              $lookup: {
                  from: 'pigs',
                  let: { stallId: '$_id' },
                  pipeline: [
                      {
                          $match: {
                              $expr: {
                                  $and: [
                                      { $eq: ['$currentLocation.stallId', '$$stallId'] },
                                      { $eq: ['$active', true] }
                                  ]
                              }
                          }
                      }
                  ],
                  as: 'pigs'
              }
          },
          {
              $match: matchStage
          },
          {
              $project: {
                  name: 1,
                  healthy: {
                      $size: {
                          $filter: {
                              input: '$pigs',
                              as: 'pig',
                              cond: { $eq: ['$$pig.healthStatus', 'healthy'] }
                          }
                      }
                  },
                  unhealthy: {
                      $size: {
                          $filter: {
                              input: '$pigs',
                              as: 'pig',
                              cond: { $ne: ['$$pig.healthStatus', 'healthy'] }
                          }
                      }
                  },
                  total: {
                      $size: '$pigs'
                  }
              }
          },
          { 
              $sort: { 
                  // Sort by most unhealthy first to highlight problem areas
                  unhealthy: -1,
                  name: 1 
              } 
          },
          { $limit: 10 } // Limit to top 10 stalls for the chart
      ]);

      res.json(stalls);
  } catch (error) {
      console.error('Error fetching stall health:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Reuse the same calculateDateRange function
function calculateDateRange(range) {
  const now = new Date();
  let startDate = new Date();
  
  switch(range) {
      case '30-days':
          startDate.setDate(now.getDate() - 30);
          break;
      case '90-days':
          startDate.setDate(now.getDate() - 90);
          break;
      case '180-days':
          startDate.setDate(now.getDate() - 180);
          break;
      default: // 365-days
          startDate.setDate(now.getDate() - 365);
  }
  
  return { start: startDate };
}


// GET single stall with detailed info
router.get('/:id', async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id)
      .populate({
        path: 'barnId',
        select: 'name farmId',
        populate: {
          path: 'farmId',
          select: 'name'
        }
      })

    if (!stall) {
      return res.status(404).json({ error: 'Stall not found' })
    }

    // Get pig count and recent pigs
    const [pigCount, pigs] = await Promise.all([
      Pig.countDocuments({ 'currentLocation.stallId': stall._id, active: true }),
      Pig.find({ 'currentLocation.stallId': stall._id, active: true })
        .select('pigId breed age')
        .limit(10)
    ])

    res.json({
      ...stall.toObject(),
      pigCount,
      recentPigs: pigs
    })
  } catch (error) {
    console.error('Error fetching stall:', error)
    res.status(500).json({ error: 'Failed to fetch stall' })
  }
})

// CREATE stall with validation
router.post('/', async (req, res) => {
  try {
    const { name, barnId, farmId } = req.body

    if (!name || !barnId || !farmId) {
      return res.status(400).json({ error: 'Name, barnId and farmId are required' })
    }

    const newStall = await Stall.create({ 
      name,
      barnId,
      farmId
    })

    res.status(201).json(newStall)
  } catch (error) {
    console.error('Error creating stall:', error)
    res.status(500).json({ error: 'Failed to create stall' })
  }
})

// UPDATE stall
router.put('/:id', async (req, res) => {
  try {
    const { name, barnId, farmId } = req.body

    if (!name || !barnId || !farmId) {
      return res.status(400).json({ error: 'Name, barnId and farmId are required' })
    }

    const updatedStall = await Stall.findByIdAndUpdate(
      req.params.id,
      { name, barnId, farmId },
      { new: true, runValidators: true }
    )

    if (!updatedStall) {
      return res.status(404).json({ error: 'Stall not found' })
    }

    res.json(updatedStall)
  } catch (error) {
    console.error('Error updating stall:', error)
    res.status(500).json({ error: 'Failed to update stall' })
  }
})

// DELETE stall with pig reassignment
router.delete('/:id', async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id)
    if (!stall) {
      return res.status(404).json({ error: 'Stall not found' })
    }

    // Reassign pigs to null or another stall
    await Pig.updateMany(
      { 'currentLocation.stallId': stall._id },
      { $set: { 'currentLocation.stallId': null } }
    )

    await stall.deleteOne()
    res.json({ message: 'Stall deleted successfully' })
  } catch (error) {
    console.error('Error deleting stall:', error)
    res.status(500).json({ error: 'Failed to delete stall' })
  }
})

// GET stall analytics with pig health data
router.get('/:id/analytics', async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id)
      .populate({
        path: 'barnId',
        select: 'name'
      })

    if (!stall) {
      return res.status(404).json({ error: 'Stall not found' })
    }

    const pigs = await Pig.find({ 'currentLocation.stallId': stall._id, active: true })
      .select('pigId breed age healthStatus')
      .populate('healthStatus')

    // Health status distribution
    const healthStatusCount = {
      healthy: 0,
      critical: 0,
      atRisk: 0,
      noMovement: 0
    }

    pigs.forEach(pig => {
      const status = pig.healthStatus?.status || 'healthy'
      healthStatusCount[status]++
    })

    res.json({
      stall: {
        name: stall.name,
        barn: stall.barnId.name
      },
      pigCount: pigs.length,
      healthStatus: healthStatusCount,
      recentPigs: pigs.slice(0, 10)
    })
  } catch (error) {
    console.error('Error fetching stall analytics:', error)
    res.status(500).json({ error: 'Failed to fetch stall analytics' })
  }
})

module.exports = router