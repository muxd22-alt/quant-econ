import { useState, useEffect } from 'react';
import { AppProviders, UnifiedHeader, useSSO, useLang, useAppTheme } from '@startup/shared-ui';
// @ts-ignore
import { MapContainer, TileLayer, Polygon, ImageOverlay, LayerGroup, useMapEvents } from 'react-leaflet';
import rawBlocks from './blocks.json';

// Initialize the grid pixel blocks with our economy rules
const INITIAL_LANDS = rawBlocks.map((b, index) => {
  return {
    id: b.id,
    displayId: index + 1,
    bounds: b.bounds as [[number, number], [number, number]],
    coords: b.coords,
    ownerId: null as string | null,
    ownerName: null as string | null,
    imageUrl: null as string | null,
    price: 1, // "all lands have a value of one riyal"
    forSale: true,
  };
});

// Pre-fill some lands for demo
if (INITIAL_LANDS.length > 45) {
  INITIAL_LANDS[45].ownerId = 'usr_demo';
  INITIAL_LANDS[45].ownerName = 'Demo User';
  INITIAL_LANDS[45].imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Square_logo.svg/120px-Square_logo.svg.png';
  INITIAL_LANDS[45].forSale = false;
}

if (INITIAL_LANDS.length > 120) {
  INITIAL_LANDS[120].ownerId = 'usr_1';
  INITIAL_LANDS[120].ownerName = 'Brand X';
  INITIAL_LANDS[120].imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/120px-Amazon_logo.svg.png';
  INITIAL_LANDS[120].forSale = false;
}

// Sub-component to handle map culling for performance
function VisibleLands({ lands, setSelectedLand }: { lands: any[], setSelectedLand: any }) {
  const [bounds, setBounds] = useState<any>(null);
  
  const map = useMapEvents({
    moveend: () => setBounds(map.getBounds()),
    zoomend: () => setBounds(map.getBounds()),
  });

  useEffect(() => {
    setBounds(map.getBounds());
  }, [map]);

  if (!bounds) return null;

  // Frustum culling: only render polygons that are within the viewport bounds
  // bounds: minLat, minLng -> maxLat, maxLng
  const visibleLands = lands.filter(land => {
    const [l_min, l_max] = land.bounds;
    return (
      l_max[0] >= bounds.getSouth() &&
      l_min[0] <= bounds.getNorth() &&
      l_max[1] >= bounds.getWest() &&
      l_min[1] <= bounds.getEast()
    );
  });

  return (
    <LayerGroup>
      {visibleLands.map((land) => (
        land.imageUrl ? (
          <ImageOverlay
            key={`img-${land.id}`}
            bounds={land.bounds}
            url={land.imageUrl}
            interactive={true}
            eventHandlers={{ click: () => setSelectedLand(land) }}
          />
        ) : (
          <Polygon
            key={`poly-${land.id}`}
            positions={land.coords}
            pathOptions={{ 
              color: land.ownerId ? 'var(--hudhud-orange)' : 'var(--primary-color)',
              weight: 1,
              fillColor: land.ownerId ? 'var(--hudhud-orange)' : 'var(--primary-color)',
              fillOpacity: 0.6 
            }}
            eventHandlers={{ click: () => setSelectedLand(land) }}
          />
        )
      ))}
    </LayerGroup>
  );
}

function MapInterface() {
  const { user } = useSSO();
  const { lang } = useLang();
  const { theme } = useAppTheme();
  const [lands, setLands] = useState(INITIAL_LANDS);
  const [selectedLand, setSelectedLand] = useState<any>(null);
  const [imgInput, setImgInput] = useState('');

  const isAr = lang === 'ar';
  
  // Dynamic map tiles based on theme
  const tileUrl = theme === 'dark' 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";

  if (!user) {
    return (
      <div className="app-container">
        <div className="glass-panel" style={{ textAlign: 'center', marginTop: '10vh' }}>
          <h2>{isAr ? 'تم رفض الوصول' : 'Access Denied'}</h2>
          <p>{isAr ? 'يرجى تسجيل الدخول.' : 'Please login via SSO.'}</p>
        </div>
      </div>
    );
  }

  const handleBuy = () => {
    if (!selectedLand) return;
    const updated = [...lands];
    const index = lands.findIndex(l => l.id === selectedLand.id);
    if (index !== -1) {
      updated[index] = {
        ...selectedLand,
        ownerId: user.id,
        ownerName: user.name,
        forSale: false
      };
      setLands(updated);
      setSelectedLand(updated[index]);
    }
  };

  const handleUpload = () => {
    if (!selectedLand || !imgInput) return;
    const updated = [...lands];
    const index = lands.findIndex(l => l.id === selectedLand.id);
    if (index !== -1) {
      updated[index] = {
        ...selectedLand,
        imageUrl: imgInput
      };
      setLands(updated);
      setSelectedLand(updated[index]);
      setImgInput('');
    }
  };

  const handleSell = () => {
    if (!selectedLand) return;
    const updated = [...lands];
    const index = lands.findIndex(l => l.id === selectedLand.id);
    if (index !== -1) {
      updated[index] = {
        ...selectedLand,
        forSale: true,
        price: selectedLand.price + 1
      };
      setLands(updated);
      setSelectedLand(updated[index]);
    }
  };

  const availableLandsCount = lands.filter(l => l.forSale).length;
  const yourLandsCount = lands.filter(l => l.ownerId === user.id).length;

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      
      {/* Full Screen Map */}
      <MapContainer 
        center={[24.7200, 46.6800]} 
        zoom={14} 
        minZoom={13}
        maxZoom={18}
        maxBounds={[[24.670, 46.630], [24.770, 46.730]]} // Lock to the pixelated area
        style={{ height: '100%', width: '100%', background: 'var(--bg-color)', zIndex: 1 }}
        zoomControl={false}
        preferCanvas={true} // High performance rendering
      >
        <TileLayer
          key={theme} 
          url={tileUrl}
          attribution='&copy; CARTO'
        />
        <VisibleLands lands={lands} setSelectedLand={setSelectedLand} />
      </MapContainer>

      {/* Floating HUD: Top Left (Title & Nav) */}
      <div style={{ position: 'absolute', top: '1.5rem', left: isAr ? 'auto' : '1.5rem', right: isAr ? '1.5rem' : 'auto', zIndex: 1000, pointerEvents: 'none' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', pointerEvents: 'auto', backdropFilter: 'blur(20px)', animation: 'fadeIn 0.5s ease-out' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '2rem', fontWeight: 800 }}>
            {isAr ? 'أراضي الرياض الرقمية' : 'Riyadh Digital Lands'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.5rem' }}>
            {lands.length} {isAr ? 'قطعة استراتيجية حصرية.' : 'exclusive strategic blocks.'}
          </p>
          <a href="/" className="btn-outline" style={{ textDecoration: 'none', display: 'inline-block', fontSize: '0.9rem', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            {isAr ? '← العودة إلى البوابة' : '← Back to Portal'}
          </a>
        </div>
      </div>

      {/* Floating HUD: Top Right (Stats) */}
      <div style={{ position: 'absolute', top: '1.5rem', right: isAr ? 'auto' : '1.5rem', left: isAr ? '1.5rem' : 'auto', zIndex: 1000, pointerEvents: 'none' }}>
        <div className="glass-panel" style={{ padding: '1rem 2rem', pointerEvents: 'auto', display: 'flex', gap: '3rem', backdropFilter: 'blur(20px)', animation: 'fadeIn 0.5s ease-out 0.2s both' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{isAr ? 'الأراضي المتاحة' : 'Available Lands'}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--hudhud-green)' }}>{availableLandsCount}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{isAr ? 'أراضيك' : 'Your Lands'}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-color)' }}>{yourLandsCount}</div>
          </div>
        </div>
      </div>

      {/* Floating HUD: Bottom Center (Selected Land Actions) */}
      {selectedLand && (
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, pointerEvents: 'none', width: '100%', maxWidth: '450px' }}>
          <div className="glass-panel" style={{ pointerEvents: 'auto', backdropFilter: 'blur(25px)', border: '1px solid var(--primary-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem', margin: 0 }}>
                {isAr ? 'القطعة' : 'Block'} #{selectedLand.displayId}
              </h3>
              <button onClick={() => setSelectedLand(null)} className="icon-btn" style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '0.25rem' }}>✕</button>
            </div>
            
            {selectedLand.ownerId ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.2rem', fontSize: '0.9rem' }}>{isAr ? 'المالك الحالي' : 'Current Owner'}</p>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)' }}>{selectedLand.ownerName}</div>
                  </div>
                  <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.2rem', fontSize: '0.9rem' }}>{isAr ? 'القيمة' : 'Value'}</p>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--hudhud-green)' }}>{selectedLand.price} {isAr ? 'ريال' : 'SAR'}</div>
                  </div>
                </div>
                
                {selectedLand.imageUrl && (
                  <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', height: '120px' }}>
                    <img src={selectedLand.imageUrl} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {selectedLand.ownerId === user.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {isAr ? 'رابط صورتك المكسلة' : 'Your Pixel Ad Image URL'}
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        value={imgInput}
                        onChange={(e) => setImgInput(e.target.value)}
                        style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                      />
                      <button onClick={handleUpload} className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '6px' }}>
                        {isAr ? 'تحديث' : 'Update'}
                      </button>
                    </div>
                    {!selectedLand.forSale && (
                      <button onClick={handleSell} className="btn-outline" style={{ borderColor: 'var(--hudhud-orange)', color: 'var(--hudhud-orange)', marginTop: '0.5rem', width: '100%' }}>
                        {isAr ? 'عرض للبيع بـ' : 'Resell for'} {selectedLand.price + 1} {isAr ? 'ريال' : 'SAR'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {selectedLand.forSale ? (
                      <button onClick={handleBuy} className="btn-primary" style={{ width: '100%', background: 'var(--hudhud-green)', padding: '1rem', fontSize: '1.1rem' }}>
                        {isAr ? 'شراء بـ' : 'Buy for'} {selectedLand.price} {isAr ? 'ريال' : 'SAR'}
                      </button>
                    ) : (
                      <p style={{ color: 'var(--hudhud-orange)', fontWeight: 700, textAlign: 'center', padding: '0.75rem', background: 'rgba(255,153,8,0.1)', borderRadius: '8px', margin: 0 }}>
                        {isAr ? 'غير معروض للبيع' : 'Not for sale'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    {isAr ? 'هذه القطعة الاستراتيجية متاحة للبيع.' : 'This strategic block is available.'}
                  </p>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--hudhud-green)' }}>
                    {selectedLand.price} {isAr ? 'ريال' : 'SAR'}
                  </span>
                </div>
                <button onClick={handleBuy} className="btn-primary" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}>
                  {isAr ? 'شراء هذه القطعة' : 'Buy This Block'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AppProviders>
      <UnifiedHeader appNameKey="riyadh" />
      <MapInterface />
    </AppProviders>
  );
}

export default App;
