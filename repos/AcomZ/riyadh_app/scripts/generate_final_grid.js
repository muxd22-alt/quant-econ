const fs = require('fs');
const turf = require('@turf/turf');

async function generate() {
  console.log("Fetching structural roads from OpenStreetMap...");
  
  // We fetch ONLY structural roads to prevent tiny footpaths from fragmenting the blocks.
  // We'll cover a large area of Riyadh to hit a massive number of lands.
  const START_LAT = 24.6800;
  const END_LAT = 24.7600;
  const START_LNG = 46.6400;
  const END_LNG = 46.7200;
  
  const query = `
    [out:json][timeout:90];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary|residential"](${START_LAT},${START_LNG},${END_LAT},${END_LNG});
    );
    out geom;
  `;
  
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    
    const roadLines = [];
    for (const element of json.elements) {
      if (element.geometry && element.geometry.length > 1) {
        const coords = element.geometry.map(p => [p.lon, p.lat]);
        roadLines.push(turf.lineString(coords));
      }
    }
    
    console.log(`Fetched ${roadLines.length} structural roads. Building spatial index...`);
    
    // Instead of polygonizing, we will generate a massive strict grid and cull cells that hit roads.
    // To do this efficiently, we don't buffer the roads (too slow for 20k roads in JS).
    // We just use an R-Tree / bounding box check for each road.
    
    // Algorithmic control: PLOT_SIZE_DEG
    // ~75m x 75m plots
    const PLOT_SIZE_DEG = 0.00065; 
    
    const widthDeg = END_LNG - START_LNG;
    const heightDeg = END_LAT - START_LAT;
    
    const cols = Math.floor(widthDeg / PLOT_SIZE_DEG);
    const rows = Math.floor(heightDeg / PLOT_SIZE_DEG);
    
    console.log(`Generating a grid of ${cols} x ${rows} = ${cols * rows} potential plots...`);
    
    const lands = [];
    let idCounter = 1;
    
    // Calculate bounding boxes for all roads for fast intersection
    const roadsBBox = roadLines.map(line => {
      const bbox = turf.bbox(line);
      // Expand road bbox slightly to give roads "width" (~10 meters = ~0.0001 deg)
      const roadWidthDeg = 0.00015;
      return {
        minLng: bbox[0] - roadWidthDeg,
        minLat: bbox[1] - roadWidthDeg,
        maxLng: bbox[2] + roadWidthDeg,
        maxLat: bbox[3] + roadWidthDeg,
        line: line
      };
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pMinLng = START_LNG + (c * PLOT_SIZE_DEG);
        const pMinLat = START_LAT + (r * PLOT_SIZE_DEG);
        const pMaxLng = pMinLng + PLOT_SIZE_DEG;
        const pMaxLat = pMinLat + PLOT_SIZE_DEG;
        
        // Add 5% internal padding to create nice visible gaps between lands
        const padLng = PLOT_SIZE_DEG * 0.05;
        const padLat = PLOT_SIZE_DEG * 0.05;
        
        const finalMinLng = pMinLng + padLng;
        const finalMinLat = pMinLat + padLat;
        const finalMaxLng = pMaxLng - padLng;
        const finalMaxLat = pMaxLat - padLat;
        
        const plotPoly = turf.polygon([[
          [finalMinLng, finalMinLat],
          [finalMaxLng, finalMinLat],
          [finalMaxLng, finalMaxLat],
          [finalMinLng, finalMaxLat],
          [finalMinLng, finalMinLat]
        ]]);
        
        const plotBBox = turf.bbox(plotPoly);
        
        // Check intersection with any road
        let intersectsRoad = false;
        
        for (const rBox of roadsBBox) {
          // Fast AABB collision check first
          if (
            plotBBox[0] <= rBox.maxLng &&
            plotBBox[2] >= rBox.minLng &&
            plotBBox[1] <= rBox.maxLat &&
            plotBBox[3] >= rBox.minLat
          ) {
            // If bounding boxes collide, do strict geometry check
            if (turf.booleanIntersects(plotPoly, rBox.line)) {
              intersectsRoad = true;
              break;
            }
          }
        }
        
        if (!intersectsRoad) {
          // It's a clean plot!
          // Leaflet expects [lat, lng]
          const coords = [
            [finalMinLat, finalMinLng],
            [finalMaxLat, finalMinLng],
            [finalMaxLat, finalMaxLng],
            [finalMinLat, finalMaxLng]
          ];
          
          lands.push({
            id: idCounter++,
            coords: coords,
            bounds: [[finalMinLat, finalMinLng], [finalMaxLat, finalMaxLng]],
          });
        }
      }
    }
    
    fs.writeFileSync('riyadh_app/src/blocks.json', JSON.stringify(lands, null, 2));
    console.log(`Successfully generated ${lands.length} formal, non-overlapping lands strictly avoiding structural roads!`);
    
  } catch(e) {
    console.error("Error generating final grid:", e);
  }
}

generate();
