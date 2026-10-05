const fs = require('fs');
const turf = require('@turf/turf');

async function generate() {
  console.log("Fetching roads from OpenStreetMap...");
  const query = `
    [out:json];
    (
      way["highway"](24.6900,46.6500,24.7500,46.7100);
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
        // Turf uses [longitude, latitude]
        const coords = element.geometry.map(p => [p.lon, p.lat]);
        lines.push(turf.lineString(coords));
      }
    }
    
    console.log(`Fetched ${lines.length} road segments. Polygonizing...`);
    
    const fc = turf.featureCollection(lines);
    // polygonize takes a feature collection of lines and returns polygons enclosed by them
    const polygons = turf.polygonize(fc);
    
    console.log(`Generated ${polygons.features.length} raw bounded polygons.`);
    
    const blocks = [];
    let idCounter = 1;
    
    for (const feature of polygons.features) {
      const area = turf.area(feature); // area in square meters
      
      // Filter out tiny traffic islands (< 500 sqm) and massive empty areas (> 200,000 sqm)
      if (area > 2000 && area < 150000) {
        // Get bounding box
        const bbox = turf.bbox(feature); // [minLng, minLat, maxLng, maxLat]
        
        // Convert coords back to [lat, lng] for Leaflet
        const coords = feature.geometry.coordinates[0].map(p => [p[1], p[0]]);
        
        blocks.push({
          id: idCounter++,
          coords: coords,
          bounds: [[bbox[1], bbox[0]], [bbox[3], bbox[2]]],
          area: area
        });
      }
    }
    
    fs.writeFileSync('riyadh_app/src/blocks.json', JSON.stringify(blocks, null, 2));
    console.log(`Saved ${blocks.length} perfect city blocks bounded by roads.`);
    
  } catch(e) {
    console.error("Error generating blocks:", e);
  }
}

generate();
