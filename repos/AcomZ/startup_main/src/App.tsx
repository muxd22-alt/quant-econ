import { useState } from 'react';
import { AppProviders, UnifiedHeader, useSSO, useLang } from '@startup/shared-ui';

function PortalHome({ setShowDash }: { setShowDash: (b: boolean) => void }) {
  const { user } = useSSO();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', textAlign: 'center', gap: '3rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', zIndex: 0, filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255, 153, 8, 0.15) 0%, transparent 70%)', zIndex: 0, filter: 'blur(60px)' }}></div>

      {user && user.role === 'admin' && (
        <button onClick={() => setShowDash(true)} className="btn-outline" style={{ position: 'absolute', top: '20px', right: '2rem', borderColor: 'var(--hudhud-purple)', color: 'var(--hudhud-purple)', zIndex: 10, backdropFilter: 'blur(10px)' }}>
          {isAr ? 'لوحة تحكم المشرف' : 'Admin Dash'}
        </button>
      )}

      <div style={{ zIndex: 1, marginTop: '2rem' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 10px 30px rgba(255,255,255,0.1)' }}>
          AcomZ
        </h1>
        <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          {isAr ? 'بوابتك الذكية للمجتمعات الرقمية المتقدمة. اكتشف وتواصل وامتلك.' : 'Your smart gateway to advanced digital communities. Discover, connect, and own.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1, paddingBottom: '2rem' }}>
        
        <a href="/chat/" className="glass-panel" style={{ textDecoration: 'none', color: 'inherit', width: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem 2rem' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255, 153, 8, 0.2)'; e.currentTarget.style.borderColor = 'rgba(255, 153, 8, 0.5)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
          <img src="/hudhud.png" alt="Hudhud App" style={{ width: '140px', height: '140px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'white' }}>{isAr ? 'هدهد شات' : 'HUDHUD CHAT'}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{isAr ? 'تواصل مع من حولك بشفافية وأمان في مجتمعك المحلي.' : 'Connect with those around you safely in your local community.'}</p>
          </div>
        </a>

        <a href="/riyadh/" className="glass-panel" style={{ textDecoration: 'none', color: 'inherit', width: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem 2rem' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59, 130, 246, 0.2)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
          <img src="/riyadh.png" alt="Riyadh Lands App" style={{ width: '140px', height: '140px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'white' }}>{isAr ? 'هدهد بيكسل' : 'HUDHUD PIXEL'}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{isAr ? 'امتلك مساحتك الرقمية الحصرية في خريطة الرياض الذكية.' : 'Own your exclusive digital space in the smart map of Riyadh.'}</p>
          </div>
        </a>

      </div>
    </div>
  );
}

function AdminDash({ setShowDash }: { setShowDash: (b: boolean) => void }) {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  
  const [modLimit, setModLimit] = useState(50);

  return (
    <div className="app-container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => setShowDash(false)} className="btn-outline" style={{ marginBottom: '2rem' }}>
        {isAr ? '← العودة للبوابة' : '← Back to Portal'}
      </button>

      <h1 style={{ color: 'var(--hudhud-purple)' }}>{isAr ? 'لوحة تحكم AcomZ' : 'AcomZ Dashboard'}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Traffic Stats */}
        <div className="glass-panel">
          <h3>{isAr ? 'زيارات التطبيقات (اليوم)' : 'App Traffic (Today)'}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <span>{isAr ? 'مجتمع هدهد' : 'Hudhud Community'}</span>
            <span style={{ fontWeight: 800, color: 'var(--hudhud-orange)' }}>12,450</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <span>{isAr ? 'أراضي الرياض' : 'Riyadh Lands'}</span>
            <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>8,920</span>
          </div>
        </div>

        {/* Global Settings */}
        <div className="glass-panel">
          <h3>{isAr ? 'إعدادات المجتمع' : 'Community Settings'}</h3>
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {isAr ? 'عدد المنشورات لترقية المستخدم إلى مشرف' : 'Posts required for Moderator status'}
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="number" 
                value={modLimit} 
                onChange={(e) => setModLimit(Number(e.target.value))}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
              <button className="btn-primary" style={{ background: 'var(--hudhud-purple)' }}>
                {isAr ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Server Status */}
        <div className="glass-panel">
          <h3>{isAr ? 'حالة الخوادم' : 'Server Status'}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--hudhud-green)' }}></div>
            <span>Turso DB (Drizzle) - {isAr ? 'متصل' : 'Connected'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--hudhud-green)' }}></div>
            <span>Cloudflare Edge - {isAr ? 'متصل' : 'Connected'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function MainApp() {
  const [showDash, setShowDash] = useState(false);

  return (
    <AppProviders>
      <UnifiedHeader appNameKey="portal" />
      {showDash ? <AdminDash setShowDash={setShowDash} /> : <PortalHome setShowDash={setShowDash} />}
    </AppProviders>
  );
}

export default MainApp;
