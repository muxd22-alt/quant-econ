const fs = require('fs');

// Generate an even, uniform grid of 'pixels' over Riyadh
// User requested: "draw pixels evenly... no less than xbyx"
const START_LAT = 24.6800;
const END_LAT = 24.7800;
const START_LNG = 46.6000;
const END_LNG = 46.7500;

// Grid size
const ROWS = 50;
const COLS = 40;

const LAT_STEP = (END_LAT - START_LAT) / ROWS;
const LNG_STEP = (END_LNG - START_LNG) / COLS;

const blocks = [];

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const minLat = START_LAT + (r * LAT_STEP);
    const minLng = START_LNG + (c * LNG_STEP);
    
    // 10% gap to simulate roads between the blocks
    const maxLat = minLat + (LAT_STEP * 0.90);
    const maxLng = minLng + (LNG_STEP * 0.90);

    const coords = [
      [minLat, minLng],
      [maxLat, minLng],
      [maxLat, maxLng],
      [minLat, maxLng]
    ];

    blocks.push({
      id: `block_${r}_${c}`,
      coords: coords,
      bounds: [[minLat, minLng], [maxLat, maxLng]]
    });
  }
}

fs.writeFileSync('riyadh_app/src/blocks.json', JSON.stringify(blocks, null, 2));
console.log(`Saved ${blocks.length} grid pixel blocks.`);
