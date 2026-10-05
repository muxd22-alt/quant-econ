const fs = require('fs');

async function getBuildings() {
  // Riyadh broad bounding box
  const query = `[out:json];way["building"](24.500,46.500,24.900,46.900);out geom 30000;`;
  
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'data=' + encodeURIComponent(query)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    let buildings = [];
    
    for (const element of json.elements) {
      if (element.type === 'way' && element.geometry) {
        const coords = element.geometry.map(p => [p.lat, p.lon]);
        
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        coords.forEach(p => {
          if (p[0] < minLat) minLat = p[0];
          if (p[0] > maxLat) maxLat = p[0];
          if (p[1] < minLng) minLng = p[1];
          if (p[1] > maxLng) maxLng = p[1];
        });
        
        // Rough area approximation (lat/lng degree differences)
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const area = latDiff * lngDiff;
        
        buildings.push({
          id: element.id,
          coords: coords,
          bounds: [[minLat, minLng], [maxLat, maxLng]],
          area: area
        });
      }
    }
    
    // Sort by area descending to get the largest/most prominent buildings
    buildings.sort((a, b) => b.area - a.area);
    
    // Filter out very tiny buildings (villas, small shops) and keep top 5000 largest
    // Area threshold roughly equates to mid-sized commercial buildings
    buildings = buildings.filter(b => b.area > 0.0000005);
    
    // Limit to 5000 max to keep browser memory reasonable
    if (buildings.length > 5000) buildings = buildings.slice(0, 5000);
    
    fs.writeFileSync('riyadh_app/src/buildings.json', JSON.stringify(buildings, null, 2));
    console.log(`Saved ${buildings.length} large strategic buildings across Riyadh.`);
  } catch(e) {
    console.error(e);
  }
}

getBuildings();
