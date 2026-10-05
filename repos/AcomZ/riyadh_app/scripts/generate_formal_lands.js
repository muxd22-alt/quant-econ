const fs = require('fs');
const turf = require('@turf/turf');

async function generate() {
  console.log("Fetching roads from OpenStreetMap (Larger area)...");
  // Expanding the bounding box to cover a large chunk of Central/North Riyadh
  const query = `
    [out:json][timeout:60];
    (
      way["highway"](24.6800,46.6400,24.7600,46.7200);
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
    
    const lines = [];
    for (const element of json.elements) {
      if (element.geometry && element.geometry.length > 1) {
        const coords = element.geometry.map(p => [p.lon, p.lat]);
        lines.push(turf.lineString(coords));
      }
    }
    
    console.log(`Fetched ${lines.length} road segments. Polygonizing...`);
    const fc = turf.featureCollection(lines);
    const polygons = turf.polygonize(fc);
    console.log(`Generated ${polygons.features.length} raw blocks.`);
    
    const lands = [];
    let idCounter = 1;
    
    // We want formal, unified lands. Let's aim for plots of roughly 100m x 100m.
    // 1 degree lat is ~111km. 100m is ~0.0009 degrees.
    const PLOT_SIZE_DEG = 0.0009;
    
    for (const feature of polygons.features) {
      const area = turf.area(feature); // in square meters
      
      // Filter out tiny slivers (< 2000 sqm), huge deserts (> 1,000,000 sqm)
      if (area > 2000 && area < 1000000) {
        const bbox = turf.bbox(feature); // [minLng, minLat, maxLng, maxLat]
        
        // Subdivide the bounding box into formal uniform plots
        const minLng = bbox[0];
        const minLat = bbox[1];
        const maxLng = bbox[2];
        const maxLat = bbox[3];
        
        const widthDeg = maxLng - minLng;
        const heightDeg = maxLat - minLat;
        
        const cols = Math.max(1, Math.floor(widthDeg / PLOT_SIZE_DEG));
        const rows = Math.max(1, Math.floor(heightDeg / PLOT_SIZE_DEG));
        
        const stepLng = widthDeg / cols;
        const stepLat = heightDeg / rows;
        
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const pMinLng = minLng + (c * stepLng);
            const pMinLat = minLat + (r * stepLat);
            const pMaxLng = pMinLng + stepLng;
            const pMaxLat = pMinLat + stepLat;
            
            // Check if this plot is actually inside the block (using its center)
            const centerPt = turf.point([pMinLng + (stepLng/2), pMinLat + (stepLat/2)]);
            if (turf.booleanPointInPolygon(centerPt, feature)) {
              
              // Add a 5% padding gap inside the plot to simulate local streets between lands
              const padLng = stepLng * 0.05;
              const padLat = stepLat * 0.05;
              
              const finalMinLng = pMinLng + padLng;
              const finalMinLat = pMinLat + padLat;
              const finalMaxLng = pMaxLng - padLng;
              const finalMaxLat = pMaxLat - padLat;
              
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
      }
    }
    
    fs.writeFileSync('riyadh_app/src/blocks.json', JSON.stringify(lands, null, 2));
    console.log(`Saved ${lands.length} formal, unified, road-aligned lands!`);
    
  } catch(e) {
    console.error("Error generating blocks:", e);
  }
}

generate();
