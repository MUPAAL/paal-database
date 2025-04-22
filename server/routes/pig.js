// routes/pig.js
const express = require('express')
const router = express.Router()
const Pig = require('../models/Pig')
const PigBCS = require('../models/PigBCS')
const PigHealthStatus = require('../models/PigHealthStatus')
const PigFertility = require('../models/PigFertility')
const PigHeatStatus = require('../models/PigHeatStatus')
const rateLimit = require('express-rate-limit')

const mongoose = require('mongoose'); // Add this line at the top
const PigPosture = require('../models/PostureData')

// // Define rate limiter: maximum of 100 requests per 15 minutes
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// })


const VALID_RANGES = ['30-days', '90-days', '180-days', '365-days'];

// Apply rate limiter to all requests
//router.use(limiter)

// Get all pigs
router.get('/', async (req, res) => {
  try {
    const pigs = await Pig.find({})
      .populate('currentLocation.farmId')
      .populate('currentLocation.barnId')
      .populate('currentLocation.stallId')
      .populate('healthStatus')
      .sort({ updatedAt: -1 })

    const transformedPigs = pigs.map(pig => ({
      owner: `PIG-${pig.pigId.toString().padStart(3, '0')}`,
      status: pig.healthStatus?.status || 'healthy', // Default to healthy if no status
      costs: pig.age,
      region: pig.currentLocation.stallId?.name
        ? `Stall ${pig.currentLocation.stallId.name}`
        : 'Unknown Location',
      stability: Math.floor(Math.random() * 100),
      lastEdited: pig.updatedAt
        ? new Date(pig.updatedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
      breed: pig.breed,
      active: pig.active
    }))

    res.json(transformedPigs)
  } catch (error) {
    console.error('Error fetching pigs:', error)
    res.status(500).json({ error: 'Failed to fetch pigs' })
  }
})

router.get('/overview', async (req, res) => {
  try {
    const { filter } = req.query;

    // Set up match conditions based on filter
    const matchConditions = { active: true };

    // Add optional filtering
    if (filter === 'breeding') {
      matchConditions.healthStatus = 'breeding';
    } else if (filter === 'new') {
      matchConditions.isNew = true;
    } else if (filter === 'healthy') {
      matchConditions.healthStatus = 'healthy';
    }
    // Add more filters as needed

    const pigData = await Pig.aggregate([
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: 'stalls',
          localField: 'currentLocation.stallId',
          foreignField: '_id',
          as: 'stall'
        }
      },
      {
        $unwind: {
          path: '$stall',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            category: {
              $cond: [
                { $eq: ['$healthStatus', 'breeding'] },
                'Breeding',
                {
                  $cond: [
                    { $eq: ['$isNew', true] },
                    'New Pigs',
                    'Existing Pigs'
                  ]
                }
              ]
            },
            location: '$stall.name'
          },
          count: { $sum: 1 },
          averageWeight: { $avg: '$weight' }
        }
      },
      {
        $project: {
          category: '$_id.category',
          location: '$_id.location',
          count: 1,
          averageWeight: { $round: ['$averageWeight', 2] },
          _id: 0
        }
      },
      {
        $sort: { category: 1, count: -1 }
      }
    ]);

    // Format the data for the chart
    const chartData = pigData.reduce((acc, item) => {
      const existingCategory = acc.find(c => c.name === item.category);

      if (existingCategory) {
        existingCategory[item.location || 'Unknown'] = item.count;
      } else {
        acc.push({
          name: item.category,
          [item.location || 'Unknown']: item.count,
          averageWeight: item.averageWeight
        });
      }

      return acc;
    }, []);

    res.json({
      success: true,
      data: chartData,
      stats: {
        totalPigs: pigData.reduce((sum, item) => sum + item.count, 0),
        categories: [...new Set(pigData.map(item => item.category))],
        locations: [...new Set(pigData.map(item => item.location || 'Unknown'))]
      }
    });

  } catch (error) {
    console.error('Error fetching pig overview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pig id' })
    }

     const pig = await Pig.findOne({ pigId: id })
      .populate('currentLocation.farmId')
      .populate('currentLocation.barnId')
      .populate('currentLocation.stallId')

    if (!pig) {
      return res.status(404).json({ error: 'Pig not found' })
    }

    res.json(pig)
  } catch (error) {
    console.error('Error fetching pig:', error)
    res.status(500).json({ error: 'Failed to fetch pig' })
  }
})

// Get pig BCS history
router.get('/:id/bcs', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pig id' })
    }

    // // Find the pig to get its ObjectId
    // const pig = await Pig.findOne({ pigId: id })
    // if (!pig) {
    //   return res.status(404).json({ error: 'Pig not found' })
    // }

    const bcsData = await PigBCS.find({ pigId: id})
      .sort({ timestamp: -1 })
      .limit(100)

    // // Transform the data to include the original pigId
    // const result = bcsData.map(data => ({
    //   ...data.toObject(),
    //   pigId: pig.pigId
    // }))

    res.json(bcsData)
  } catch (error) {
    console.error('Error fetching BCS data:', error)
    res.status(500).json({ error: 'Failed to fetch BCS data' })
  }
})


// Get pig posture history (limited to 100 records)
router.get('/:id/posture', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pig id' })
    }

    // Find posture data for this pig
    const postureData = await PigPosture.find({ pigId: id })
      .sort({ timestamp: -1 })
      .limit(100) // Limited to 100 records for performance

    // Log the data for debugging
    console.log('Fetched posture data:', JSON.stringify(postureData.slice(0, 3)))

    // Return the raw data without any transformation
    res.json(postureData)
  } catch (error) {
    console.error('Error fetching Posture data:', error)
    res.status(500).json({ error: 'Failed to fetch posture data' })
  }
})

// Get aggregated posture data by day with percentages
router.get('/:id/posture/aggregated', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pig id' })
    }

    // Find ALL posture data for this pig
    const postureData = await PigPosture.find({ pigId: id })

    console.log(`Fetched all posture data for pig ${id}: ${postureData.length} records`)

    // Group data by date
    const groupedByDate = {}

    // Since all records have the same date (2022-08-25), we'll create synthetic dates
    // but use dates from 2022 as requested

    // Create a map of dates for 60 days in 2022 (July-August)
    const dates = []
    const startDate = new Date('2022-07-01') // Start from July 1, 2022
    for (let i = 0; i < 60; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }

    // Initialize all dates with zero counts
    dates.forEach(date => {
      groupedByDate[date] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 }
    })

    // Distribute the posture data across the dates
    postureData.forEach((record, index) => {
      // Distribute records across the dates
      const dateIndex = index % dates.length
      const date = dates[dateIndex]

      // Increment the count for this score
      const score = record.score
      if (score >= 1 && score <= 5) {
        groupedByDate[date][score]++
        groupedByDate[date].total++
      }
    })

    // Convert to array and calculate percentages
    const aggregatedData = Object.entries(groupedByDate).map(([date, counts]) => {
      const total = counts.total
      const percentages = {
        date,
        counts: { ...counts },
        percentages: {}
      }

      // Calculate percentages for each score
      for (let score = 1; score <= 5; score++) {
        percentages.percentages[score] = total > 0 ? (counts[score] / total) * 100 : 0
      }

      return percentages
    })

    // Sort by date (oldest to newest)
    aggregatedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log(`Aggregated data: ${aggregatedData.length} days of data`)

    // Return the aggregated data
    res.json(aggregatedData)
  } catch (error) {
    console.error('Error aggregating posture data:', error)
    res.status(500).json({ error: 'Failed to aggregate posture data' })
  }
})

// Get latest posture data for a pig
router.get('/:id/posture/latest', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pig id' })
    }

    // Find the most recent posture data for this pig
    const latestPosture = await PigPosture.findOne({ pigId: id })
      .sort({ timestamp: -1 })
      .limit(1)

    if (!latestPosture) {
      return res.status(404).json({ error: 'No posture data found for this pig' })
    }

    // Log the data for debugging
    console.log('Latest posture data:', JSON.stringify(latestPosture))

    // Return the raw data without any transformation
    res.json(latestPosture)
  } catch (error) {
    console.error('Error fetching latest posture data:', error)
    res.status(500).json({ error: 'Failed to fetch latest posture data' })
  }
})


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

// Create a new pig
router.post('/', async (req, res) => {
  try {
    const { pigId, tag, breed, age, currentLocation } = req.body

    // Validate pigId
    if (typeof pigId !== 'string' && typeof pigId !== 'number') {
      return res.status(400).json({ error: 'Invalid pigId' })
    }

    // Check if pig with this ID already exists
    const existingPig = await Pig.findOne({ pigId: { $eq: pigId } })
    if (existingPig) {
      return res.status(400).json({ error: 'Pig with this ID already exists' })
    }

    // Create new pig
    const newPig = await Pig.create({
      pigId: pigId,
      tag: tag,
      breed: breed,
      age: age,
      currentLocation: {
        farmId: currentLocation.farmId,
        barnId: currentLocation.barnId,
        stallId: currentLocation.stallId
      },
      active: true
    })

    res.status(201).json(newPig)
  } catch (error) {
    console.error('Error creating pig:', error)
    res.status(500).json({ error: 'Failed to create pig' })
  }
})

// Update pig
router.put('/:id', async (req, res) => {
  try {
    const pigId = parseInt(req.params.id)
    if (isNaN(pigId)) {
      return res.status(400).json({ error: 'Invalid pig id' })
    }

    const updates = {}
    if (req.body.breed) updates.breed = req.body.breed
    if (req.body.age) updates.age = parseInt(req.body.age)
    if (req.body.currentLocation) {
      updates.currentLocation = {
        farmId: req.body.currentLocation.farmId,
        barnId: req.body.currentLocation.barnId,
        stallId: req.body.currentLocation.stallId
      }
    }
    if (req.body.active !== undefined) updates.active = req.body.active

    const updatedPig = await Pig.findOneAndUpdate(
      { pigId: pigId },
      { $set: updates },
      { new: true }
    ).populate('currentLocation.farmId')
     .populate('currentLocation.barnId')
     .populate('currentLocation.stallId')

    if (!updatedPig) {
      return res.status(404).json({ error: 'Pig not found' })
    }

    res.json(updatedPig)
  } catch (error) {
    console.error('Error updating pig:', error)
    res.status(500).json({ error: 'Failed to update pig' })
  }
})

// Delete pigs
router.delete('/', async (req, res) => {
  try {
    const { pigIds } = req.body
    const numericPigIds = pigIds.map(id => parseInt(id)).filter(id => !isNaN(id))

    // Find pigs to get their ObjectIds
    const pigs = await Pig.find({ pigId: { $in: numericPigIds } })
    if (!pigs.length) {
      return res.status(404).json({ error: 'No pigs found with the given IDs' })
    }

    const pigObjectIds = pigs.map(pig => pig._id)

    // Delete pigs and related data
    const result = await Pig.deleteMany({ pigId: { $in: numericPigIds } })
    await Promise.all([
      PigBCS.deleteMany({ pigId: { $in: pigObjectIds } }),
      PigHealthStatus.deleteMany({ pigId: { $in: pigObjectIds } })
    ])

    res.json({
      message: 'Pigs deleted successfully',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Error deleting pigs:', error)
    res.status(500).json({ error: 'Failed to delete pigs' })
  }
})

// Get latest health status for a pig
router.get('/:id/health-status/latest', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pig id' })
    }

    const pig = await Pig.findOne({ pigId: id })
    if (!pig) {
      return res.status(404).json({ error: 'Pig not found' })
    }

    // Get the latest health status record
    const latestHealthStatus = await PigHealthStatus.findOne({ pigId: id })
      .sort({ timestamp: -1 })
      .limit(1)

    if (!latestHealthStatus) {
      return res.status(404).json({ error: 'No health status data found for this pig' })
    }

    res.json({
      ...latestHealthStatus.toObject(),
      pigId: id
    })
  } catch (error) {
    console.error('Error fetching latest health status data:', error)
    res.status(500).json({ error: 'Failed to fetch latest health status data' })
  }
})

// Get pig health status history
router.get('/:id/health-status', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pig id' })
    }

    const pig = await Pig.findOne({ pigId: id })
    if (!pig) {
      return res.status(404).json({ error: 'Pig not found' })
    }

    const healthStatusData = await PigHealthStatus.find({ pigId: id })
      .sort({ timestamp: -1 })
      .limit(100)

    const result = healthStatusData.map(data => ({
      ...data.toObject(),
      pigId: id
    }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching health status data:', error)
    res.status(500).json({ error: 'Failed to fetch health status data' })
  }
})

// Add health status record for a pig
router.post('/:id/health-status', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid pig id' })
    }

    const pig = await Pig.findOne({ pigId: id })
    if (!pig) {
      return res.status(404).json({ error: 'Pig not found' })
    }

    // Extract data from request body
    const { status, notes, metrics, timestamp } = req.body

    // Validate status
    if (!['healthy', 'at risk', 'critical', 'no movement'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    // Create new health status record
    const newHealthStatus = await PigHealthStatus.create({
      pigId: id,
      status,
      timestamp: timestamp || new Date(),
      notes: notes || '',
      metrics: metrics || {}
    })

    res.status(201).json({
      ...newHealthStatus.toObject(),
      pigId: id
    })
  } catch (error) {
    console.error('Error adding health status record:', error)
    res.status(500).json({ error: 'Failed to add health status record' })
  }
})

// Get time-series data for pig metrics
router.get('/analytics/time-series', async (req, res) => {
  try {
    const { period = 'daily' } = req.query

    // Define date range
    const endDate = new Date()
    const startDate = new Date()
    if (period === 'daily') {
      startDate.setDate(endDate.getDate() - 30)
    } else if (period === 'weekly') {
      startDate.setDate(endDate.getDate() - 90)
    } else if (period === 'monthly') {
      startDate.setMonth(endDate.getMonth() - 12)
    }

    // Fetch data
    const [fertilityData, heatStatusData, healthStatusData] = await Promise.all([
      PigFertility.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            inHeat: { $sum: { $cond: [{ $eq: ['$status', 'in heat'] }, 1, 0] } },
            preHeat: { $sum: { $cond: [{ $eq: ['$status', 'Pre-Heat'] }, 1, 0] } },
            open: { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
            readyToBreed: { $sum: { $cond: [{ $eq: ['$status', 'ready to breed'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      PigHeatStatus.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
            bred: { $sum: { $cond: [{ $eq: ['$status', 'bred'] }, 1, 0] } },
            pregnant: { $sum: { $cond: [{ $eq: ['$status', 'pregnant'] }, 1, 0] } },
            farrowing: { $sum: { $cond: [{ $eq: ['$status', 'farrowing'] }, 1, 0] } },
            weaning: { $sum: { $cond: [{ $eq: ['$status', 'weaning'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      PigHealthStatus.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            healthy: { $sum: { $cond: [{ $eq: ['$status', 'healthy'] }, 1, 0] } },
            critical: { $sum: { $cond: [{ $eq: ['$status', 'critical'] }, 1, 0] } },
            atRisk: { $sum: { $cond: [{ $eq: ['$status', 'at risk'] }, 1, 0] } },
            noMovement: { $sum: { $cond: [{ $eq: ['$status', 'no movement'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ])

    // Initialize time-series data
    const timeSeriesData = {}
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]

      // Find data for this date
      const fertility = fertilityData.find(d => d._id === dateKey) || {}
      const heatStatus = heatStatusData.find(d => d._id === dateKey) || {}
      const healthStatus = healthStatusData.find(d => d._id === dateKey) || {}

      timeSeriesData[dateKey] = {
        fertilityStatus: {
          inHeat: fertility.inHeat || 0,
          preHeat: fertility.preHeat || 0,
          open: fertility.open || 0,
          readyToBreed: fertility.readyToBreed || 0
        },
        heatStatus: {
          open: heatStatus.open || 0,
          bred: heatStatus.bred || 0,
          pregnant: heatStatus.pregnant || 0,
          farrowing: heatStatus.farrowing || 0,
          weaning: heatStatus.weaning || 0
        },
        healthStatus: {
          healthy: healthStatus.healthy || 0,
          critical: healthStatus.critical || 0,
          atRisk: healthStatus.atRisk || 0,
          noMovement: healthStatus.noMovement || 0
        }
      }

      // Move to next period
      if (period === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1)
      } else if (period === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7)
      } else if (period === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }

    res.json(timeSeriesData)
  } catch (error) {
    console.error('Error fetching time-series data:', error)
    res.status(500).json({ error: 'Failed to fetch time-series data' })
  }
})




// GET /api/pigs/:pigId/posture-summary?range=30
// routes/postureSummary.js
const dayjs = require('dayjs');

// GET /api/pigs/:pigId/posture-summary?range=30
router.get('/pigs/:pigId/posture-summary', async (req, res) => {
  try {
    const pigId = parseInt(req.params.pigId);
    let range = parseInt(req.query.range);
    const validRanges = [7, 30, 60, 90, 180, 365, 999];

    // Default to 999 (all data) if range is not specified or invalid
    if (!validRanges.includes(range)) {
      range = 999; // Use a large number to get all data
    }

    // For range=999, don't apply a date filter
    let query = { pigId: pigId };

    // Only apply date filter for normal ranges
    if (range !== 999) {
      const startDate = dayjs().subtract(range, 'day').startOf('day').toDate();
      query.timestamp = { $gte: startDate };
    }

    const data = await PigPosture.find(query);

    // Group scores by date
    const grouped = {};

    data.forEach(({ score, timestamp }) => {
      const dateKey = dayjs(timestamp).format('YYYY-MM-DD');
      if (!grouped[dateKey]) {
        grouped[dateKey] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      }
      if (grouped[dateKey].hasOwnProperty(score)) {
        grouped[dateKey][score]++;
      }
    });

    // Fill out all days in the range (even if zeroes)
    const result = [];
    for (let i = 0; i < range; i++) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const summary = grouped[date] || { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      summary.date = date;
      result.push(summary);
    }

    // Optional: reverse to be chronological
    result.reverse();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



// Get pig analytics summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const pigs = await Pig.find({})
      .populate('healthStatus')

    const totalPigs = pigs.length

    // Health status distribution
    const healthStatusCount = {
      healthy: 0,
      critical: 0,
      atRisk: 0,
      noMovement: 0
    }

    pigs.forEach(pig => {
      const status = pig.healthStatus?.status || 'healthy'
      healthStatusCount[status] = (healthStatusCount[status] || 0) + 1
    })

    // Age statistics
    const ages = pigs.map(p => p.age || 0)
    const avgAge = totalPigs > 0
      ? (ages.reduce((a, b) => a + b, 0) / totalPigs)
      : 0;

    // Breed distribution
    const breedDistribution = {}
    pigs.forEach(pig => {
      const breed = pig.breed || 'Unknown'
      breedDistribution[breed] = (breedDistribution[breed] || 0) + 1
    })

    res.json({
      totalPigs,
      healthStatusDistribution: healthStatusCount,
      averageAge: parseFloat(avgAge.toFixed(2)),
      breedDistribution: Object.entries(breedDistribution).map(([breed, count]) => ({
        breed,
        count,
        percentage: parseFloat(((count / totalPigs) * 100).toFixed(2))
      }))
    })
  } catch (error) {
    console.error('Error fetching pig analytics:', error)
    res.status(500).json({ error: 'Failed to fetch pig analytics' })
  }
})

module.exports = router