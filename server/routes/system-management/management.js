const express = require('express');
const router = express.Router();
const Farm = require('../../models/Farm');
const Barn = require('../../models/Barn');
const Stall = require('../../models/Stall');
const Pig = require('../../models/Pig');

router.get('/', async (req, res) => {
  try {
    const results = await Stall.aggregate([
      // Join with pigs collection
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
      // Join with barns collection
      {
        $lookup: {
          from: 'barns',
          localField: 'barnId',
          foreignField: '_id',
          as: 'barn'
        }
      },
      {
        $unwind: '$barn'
      },
      // Calculate metrics
      {
        $addFields: {
          totalPigs: { $size: '$pigs' },
          pigsToBreed: {
            $size: {
              $filter: {
                input: '$pigs',
                as: 'pig',
                cond: { $eq: ['$$pig.healthStatus', 'breeding'] }
              }
            }
          },
          unhealthyPigs: {
            $size: {
              $filter: {
                input: '$pigs',
                as: 'pig',
                cond: { $eq: ['$$pig.healthStatus', 'unhealthy'] }
              }
            }
          },
          status: {
            $cond: [
              { $eq: [{ $size: '$pigs' }, 0] },
              'Off',
              {
                $cond: [
                  { $gt: ['$unhealthyPigs', 0] },
                  'Needs Attention',
                  'Active'
                ]
              }
            ]
          }
        }
      },
      // Group by barn first
      {
        $group: {
          _id: '$barnId',
          barnName: { $first: '$barn.name' },
          farmId: { $first: '$farmId' },
          stalls: {
            $push: {
              name: '$name',
              totalPigs: '$totalPigs',
              pigsToBreed: '$pigsToBreed',
              unhealthyPigs: '$unhealthyPigs',
              status: '$status'
            }
          }
        }
      },
      // Then group by farm
      {
        $group: {
          _id: '$farmId',
          barns: {
            $push: {
              name: '$barnName',
              stalls: '$stalls'
            }
          }
        }
      },
      // Lookup farm details
      {
        $lookup: {
          from: 'farms',
          localField: '_id',
          foreignField: '_id',
          as: 'farm'
        }
      },
      {
        $unwind: '$farm'
      },
      // Format output
      {
        $project: {
          _id: 0,
          region: '$farm.name',
          barns: 1,
          project: {
            $reduce: {
              input: '$barns',
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  {
                    $map: {
                      input: '$$this.stalls',
                      as: 'stall',
                      in: {
                        company: '$farm.name',
                        barn: '$$this.name',
                        size: '$$stall.totalPigs',
                        probability: { $concat: [{ $toString: '$$stall.pigsToBreed' }, ' to breed'] },
                        duration: { $concat: [{ $toString: '$$stall.unhealthyPigs' }, ' unhealthy'] },
                        assigned: [],
                        status: '$$stall.status'
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    res.json(results);
  } catch (error) {
    console.error('Error fetching stall data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;