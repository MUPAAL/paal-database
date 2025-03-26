// routes/farm.js
const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const Barn = require('../models/Barn');
const Stall = require('../models/Stall');
const Pig = require('../models/Pig');
const Device = require('../models/Device');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Apply rate limiter to all requests
router.use(limiter);

// GET all farms with counts and basic analytics
router.get('/', async (req, res) => {
  try {
    const farms = await Farm.find({})
      .sort({ name: 1 });

    // Enhance with counts for barns, stalls, pigs, and devices
    const farmsWithCounts = await Promise.all(farms.map(async farm => {
      const [barns, stalls, pigs, devices] = await Promise.all([
        Barn.find({ farmId: farm._id }).select('_id'),
        Stall.find({ farmId: farm._id }).select('_id'),
        Pig.find({ 'currentLocation.farmId': farm._id, active: true }).select('_id'),
        Device.find({ farmId: farm._id }).select('_id')
      ]);

      return {
        ...farm.toObject(),
        counts: {
          barns: barns.length,
          stalls: stalls.length,
          pigs: pigs.length,
          devices: devices.length
        }
      };
    }));

    res.json(farmsWithCounts);
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
});router.get('/distribution', async (req, res) => {
  try {
    const { filter } = req.query;
    
    // Set up base match conditions
    const matchConditions = { active: true };
    
    // Add optional filtering
    if (filter === 'active') {
      matchConditions.status = 'active';
    } else if (filter === 'breeding') {
      matchConditions.healthStatus = 'breeding';
    } else if (filter === 'healthy') {
      matchConditions.healthStatus = 'healthy';
    }
    // Add more filters as needed

    // Get all farms first (to ensure we return all farms even with no pigs)
    const allFarms = await Farm.find().lean();
    
    // Get current pig distribution per farm
    const farmsWithPigs = await Farm.aggregate([
      {
        $lookup: {
          from: 'pigs',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$currentLocation.farmId', '$$farmId'] },
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
        $project: {
          _id: 1,
          name: 1,
          pigCount: { $size: '$pigs' },
          healthyPigs: {
            $size: {
              $filter: {
                input: '$pigs',
                as: 'pig',
                cond: { $eq: ['$$pig.healthStatus', 'healthy'] }
              }
            }
          },
          breedingPigs: {
            $size: {
              $filter: {
                input: '$pigs',
                as: 'pig',
                cond: { $eq: ['$$pig.healthStatus', 'breeding'] }
              }
            }
          }
        }
      }
    ]);

    // Calculate total pigs
    const totalPigs = farmsWithPigs.reduce((sum, farm) => sum + farm.pigCount, 0);

    // Merge with all farms to ensure complete dataset
    const distribution = allFarms.map(farm => {
      const farmData = farmsWithPigs.find(f => f._id.equals(farm._id)) || {
        pigCount: 0,
        healthyPigs: 0,
        breedingPigs: 0
      };
      
      return {
        id: farm._id,
        name: farm.name,
        pigCount: farmData.pigCount,
        healthyCount: farmData.healthyPigs,
        breedingCount: farmData.breedingPigs,
        percentage: totalPigs > 0 ? (farmData.pigCount / totalPigs) * 100 : 0,
        healthPercentage: farmData.pigCount > 0 ? 
          (farmData.healthyPigs / farmData.pigCount) * 100 : 0
      };
    }).sort((a, b) => b.pigCount - a.pigCount);

    res.json({
      success: true,
      data: distribution,
      meta: {
        totalPigs,
        totalFarms: allFarms.length,
        farmsWithPigs: distribution.filter(f => f.pigCount > 0).length,
        averageHealthPercentage: totalPigs > 0 ? 
          distribution.reduce((sum, f) => sum + f.healthyCount, 0) / totalPigs * 100 : 0
      }
    });

  } catch (error) {
    console.error('Error fetching farm distribution:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});
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

// GET single farm with detailed information
router.get('/:id', async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Get all related data in parallel
    const [barns, stalls, pigs, devices] = await Promise.all([
      Barn.find({ farmId: farm._id }).select('name _id'),
      Stall.find({ farmId: farm._id }).select('name barnId _id'),
      Pig.find({ 'currentLocation.farmId': farm._id, active: true })
        .select('pigId breed age healthStatus')
        .populate('healthStatus'),
      Device.find({ farmId: farm._id }).select('name type status')
    ]);

    // Calculate health status distribution
    const healthStatusCount = {
      healthy: 0,
      critical: 0,
      atRisk: 0,
      noMovement: 0
    };

    pigs.forEach(pig => {
      const status = pig.healthStatus?.status || 'healthy';
      healthStatusCount[status]++;
    });

    res.json({
      ...farm.toObject(),
      counts: {
        barns: barns.length,
        stalls: stalls.length,
        pigs: pigs.length,
        devices: devices.length
      },
      healthStatus: healthStatusCount,
      barns: barns,
      recentPigs: pigs.slice(0, 10),
      devices: devices.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ error: 'Failed to fetch farm' });
  }
});

// CREATE new farm
router.post('/', async (req, res) => {
  try {
    const name = req.body;
    const location = ""; 
    
    if (!name) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    const newFarm = await Farm.create({ name, location });
    res.status(201).json(newFarm);
  } catch (error) {
    console.error('Error creating farm:', error);
    res.status(500).json({ error: 'Failed to create farm' });
  }
});

// UPDATE farm
router.put('/:id', async (req, res) => {
  try {
    const { name, location } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }

    const updatedFarm = await Farm.findByIdAndUpdate(
      req.params.id,
      { name, location },
      { new: true, runValidators: true }
    );

    if (!updatedFarm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json(updatedFarm);
  } catch (error) {
    console.error('Error updating farm:', error);
    res.status(500).json({ error: 'Failed to update farm' });
  }
});

// DELETE farm (with cascade option)
router.delete('/:id', async (req, res) => {
  try {
    const { cascade } = req.query; // Add ?cascade=true to delete associated data

    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    if (cascade === 'true') {
      // Find all related data
      const [barns, stalls] = await Promise.all([
        Barn.find({ farmId: farm._id }),
        Stall.find({ farmId: farm._id })
      ]);
      
      const barnIds = barns.map(b => b._id);
      const stallIds = stalls.map(s => s._id);

      // Delete all related data in parallel
      await Promise.all([
        Barn.deleteMany({ _id: { $in: barnIds } }),
        Stall.deleteMany({ _id: { $in: stallIds } }),
        Device.deleteMany({ farmId: farm._id }),
        Pig.updateMany(
          { 'currentLocation.farmId': farm._id },
          { $set: { active: false } }
        )
      ]);
    }

    await farm.deleteOne();
    res.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Error deleting farm:', error);
    res.status(500).json({ error: 'Failed to delete farm' });
  }
});

// GET farm hierarchy (barns and stalls structure)
router.get('/:id/hierarchy', async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    const barns = await Barn.find({ farmId: farm._id })
      .populate({
        path: 'stalls',
        select: 'name _id pigCount',
        options: { sort: { name: 1 } }
      })
      .sort({ name: 1 });

    res.json({
      farm: {
        _id: farm._id,
        name: farm.name,
        location: farm.location
      },
      barns: barns.map(barn => ({
        _id: barn._id,
        name: barn.name,
        stalls: barn.stalls
      }))
    });
  } catch (error) {
    console.error('Error fetching farm hierarchy:', error);
    res.status(500).json({ error: 'Failed to fetch farm hierarchy' });
  }
});

// GET farm analytics with time-series data
router.get('/:id/analytics/time-series', async (req, res) => {
  try {
    const { period = 'daily' } = req.query; // daily, weekly, or monthly
    const farm = await Farm.findById(req.params.id);
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'daily') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === 'weekly') {
      startDate.setDate(endDate.getDate() - 90);
    } else if (period === 'monthly') {
      startDate.setMonth(endDate.getMonth() - 12);
    }

    // Get time-series data
    const [pigData, healthData] = await Promise.all([
      // Pig count over time
      Pig.aggregate([
        {
          $match: {
            'currentLocation.farmId': farm._id,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Health status over time
      Pig.aggregate([
        {
          $match: {
            'currentLocation.farmId': farm._id,
            'healthStatus.timestamp': { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$healthStatus.timestamp' } },
              status: '$healthStatus.status'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ])
    ]);

    // Format time-series data
    const timeSeriesData = {};
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      
      // Initialize date entry
      timeSeriesData[dateKey] = {
        date: dateKey,
        pigs: 0,
        healthStatus: {
          healthy: 0,
          critical: 0,
          atRisk: 0,
          noMovement: 0
        }
      };

      // Move to next period
      if (period === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (period === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (period === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Populate pig counts
    pigData.forEach(entry => {
      if (timeSeriesData[entry._id]) {
        timeSeriesData[entry._id].pigs = entry.count;
      }
    });

    // Populate health status
    healthData.forEach(entry => {
      if (timeSeriesData[entry._id.date] && entry._id.status) {
        timeSeriesData[entry._id.date].healthStatus[entry._id.status] = entry.count;
      }
    });

    res.json(Object.values(timeSeriesData));
  } catch (error) {
    console.error('Error fetching time-series analytics:', error);
    res.status(500).json({ error: 'Failed to fetch time-series analytics' });
  }
});

module.exports = router;