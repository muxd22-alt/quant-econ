const fs = require('fs');

async function generatePixels() {
  const START_LAT = 24.7000;
  const END_LAT = 24.7400;
  const START_LNG = 46.6600;
  const END_LNG = 46.7000;

  // 1. Fetch roads in this area
  const query = `
    [out:json];
    way["highway"](24.7000,46.6600,24.7400,46.7000);
    out geom;
  `;
  
  console.log("Fetching roads...");
  let roads = [];
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    
    for (const element of json.elements) {
      if (element.geometry) {
        roads.push(element.geometry.map(p => [p.lat, p.lon]));
      }
    }
    console.log(`Fetched ${roads.length} roads.`);
  } catch(e) {
    console.error(e);
    return;
  }

  // Helper to check if a point is near a line segment (road)
  function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return dist2(p, [ v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]) ]);
  }
  function dist2(v, w) { return Math.pow(v[0] - w[0], 2) + Math.pow(v[1] - w[1], 2) }

  // 2. Generate fine grid (e.g., 60x60 = 3600 pixels)
  const ROWS = 60;
  const COLS = 60;
  const LAT_STEP = (END_LAT - START_LAT) / ROWS;
  const LNG_STEP = (END_LNG - START_LNG) / COLS;
  
  const blocks = [];
  let idCounter = 1;

  // We want to leave a buffer around roads
  const ROAD_BUFFER_SQ = 0.000000005; // Adjust based on visual

  console.log("Generating pixels and removing those on roads...");
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const minLat = START_LAT + (r * LAT_STEP);
      const minLng = START_LNG + (c * LNG_STEP);
      const maxLat = minLat + LAT_STEP * 0.95; // 5% gap between pixels
      const maxLng = minLng + LNG_STEP * 0.95;
      
      const center = [minLat + (LAT_STEP/2), minLng + (LNG_STEP/2)];
      
      // Check intersection with any road
      let hitsRoad = false;
      for (const road of roads) {
        for (let i = 0; i < road.length - 1; i++) {
          if (distToSegmentSquared(center, road[i], road[i+1]) < ROAD_BUFFER_SQ) {
            hitsRoad = true;
            break;
          }
        }
        if (hitsRoad) break;
      }

      if (!hitsRoad) {
        blocks.push({
          id: idCounter++,
          coords: [
            [minLat, minLng],
            [maxLat, minLng],
            [maxLat, maxLng],
            [minLat, maxLng]
          ],
          bounds: [[minLat, minLng], [maxLat, maxLng]]
        });
      }
    }
  }

  // Keep top 1000 or whatever
  fs.writeFileSync('riyadh_app/src/blocks.json', JSON.stringify(blocks, null, 2));
  console.log(`Saved ${blocks.length} pixels avoiding roads.`);
}

generatePixels();
