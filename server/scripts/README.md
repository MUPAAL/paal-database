# Data Generation Scripts

This directory contains scripts for generating realistic test data for the application.

## Posture Data Generation

The `generatePostureData.js` script creates realistic posture data for all pigs in the database. This ensures that the application displays real data from the API instead of mock or fake data.

### How to Run

1. Make sure MongoDB is running and accessible
2. Make sure you have created some pigs in the database
3. Run the script:

```bash
cd server
node scripts/generatePostureData.js
```

### What the Script Does

- Connects to the MongoDB database
- Finds all pigs in the database
- For each pig, generates realistic posture data from July 21, 2022 to August 25, 2022
- Creates approximately 48 records per day (one every 30 minutes)
- Uses realistic patterns based on time of day:
  - Morning (0-8h): Mostly standing and moving
  - Midday (8-16h): Mostly lying and sitting
  - Evening (16-24h): Mixed behaviors
- Saves all data to the database

### Posture Score Meanings

- 1: Standing
- 2: Lying
- 3: Sitting
- 4: Moving
- 5: Other

### Customizing the Script

You can modify the script to change:
- The date range for generated data
- The number of records per day
- The behavior patterns for different times of day

## Important Notes

- Running the script will delete all existing posture data for the pigs
- The script generates deterministic but realistic data
- The data is designed to show patterns over time that would be expected in real pig behavior
