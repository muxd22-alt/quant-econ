const fs = require('fs');

async function getCityBlocks() {
  const query = `
    [out:json][timeout:25];
    (
      way["landuse"](24.680,46.650,24.750,46.720);
      relation["landuse"](24.680,46.650,24.750,46.720);
    );
    out geom;
  `;
  
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
    let blocks = [];
    
    for (const element of json.elements) {
      if (element.geometry) {
        const coords = element.geometry.map(p => [p.lat, p.lon]);
        
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        coords.forEach(p => {
          if (p[0] < minLat) minLat = p[0];
          if (p[0] > maxLat) maxLat = p[0];
          if (p[1] < minLng) minLng = p[1];
          if (p[1] > maxLng) maxLng = p[1];
        });
        
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const area = latDiff * lngDiff;

        // "make buildings no less than xbyx to prevent some tiny buildings"
        if (area > 0.000002) {
          blocks.push({
            id: element.id,
            coords: coords,
            bounds: [[minLat, minLng], [maxLat, maxLng]],
            area: area
          });
        }
      }
    }
    
    fs.writeFileSync('riyadh_app/src/blocks.json', JSON.stringify(blocks, null, 2));
    console.log(`Saved ${blocks.length} landuse city blocks.`);
  } catch(e) {
    console.error(e);
  }
}

getCityBlocks();
