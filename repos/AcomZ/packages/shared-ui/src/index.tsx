import React, { useState, useEffect, createContext, useContext } from 'react';
import PocketBase from 'pocketbase';
import './styles.css';

const PB_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PB_URL) || 'http://localhost:8090';
export const pb = new PocketBase(PB_URL);


// --- Theme & Language Contexts ---

export const ThemeContext = createContext<{ theme: string; toggleTheme: () => void } | null>(null);
export const LangContext = createContext<{ lang: string; toggleLang: () => void; t: (key: string) => string } | null>(null);

const dictionary: Record<string, Record<string, string>> = {
  en: {
    welcome: "Welcome back",
    login: "AcomZ SSO Login",
    logout: "Sign Out",
    powered: "Powered by AcomZ Inc.",
    portal: "AcomZ Portal",
    chat: "HUDHUD CHAT",
    riyadh: "HUDHUD PIXEL"
  },
  ar: {
    welcome: "مرحباً ",
    login: "دخول",
    logout: "خروج",
    powered: "بدعم من شركة AcomZ",
    portal: "بوابة AcomZ",
    chat: "هدهد شات",
    riyadh: "هدهد بيكسل"
  }
};

// --- SSO Provider ---

export const SSOContext = createContext<{
  user: any;
  login: (name: string) => void;
  logout: () => void;
} | null>(null);

export const AppProviders = ({ children, hideFooter = false }: { children: React.ReactNode, hideFooter?: boolean }) => {
  const [user, setUser] = useState<{ id: string; name: string; app_metadata: any } | null>(null);

  // Set Arabic and Dark Mode as defaults
  const [theme, setTheme] = useState(localStorage.getItem('acomz_theme') || 'dark');
  const [lang, setLang] = useState(localStorage.getItem('acomz_lang') || 'ar');

  // SSO Sync with PocketBase
  useEffect(() => {
    setUser(pb.authStore.isValid ? pb.authStore.model as any : null);

    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser(pb.authStore.isValid ? model as any : null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('acomz_theme', theme);
  }, [theme]);

  // Lang Sync
  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('acomz_lang', lang);
  }, [lang]);

  const login = (name: string) => {
    // This is a mocked login. In production, use pb.collection('users').authWithPassword(...)
    const newUser = { id: 'usr_' + Date.now(), name, app_metadata: {}, postCount: 100 };
    pb.authStore.save('mock-token', newUser as any);
  };

  const logout = () => {
    pb.authStore.clear();
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');
  const t = (key: string) => dictionary[lang][key] || key;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <LangContext.Provider value={{ lang, toggleLang, t }}>
        <SSOContext.Provider value={{ user, login, logout }}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <main style={{ flex: 1 }}>{children}</main>
            {!hideFooter && <GlobalFooter />}
          </div>
        </SSOContext.Provider>
      </LangContext.Provider>
    </ThemeContext.Provider>
  );
};

export const useSSO = () => {
  const context = useContext(SSOContext);
  if (!context) throw new Error("useSSO must be used within AppProviders");
  return context;
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAppTheme must be used within AppProviders");
  return context;
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within AppProviders");
  return context;
};

// --- Unified Header ---

// Global Footer Component
function GlobalFooter() {
  const { lang } = useContext(LangContext)!;
  return (
    <footer style={{
      textAlign: 'center', padding: '2rem', marginTop: 'auto',
      color: 'var(--text-secondary)', fontSize: '0.85rem', opacity: 0.6,
      borderTop: '1px solid var(--border-color)', background: 'var(--bg-color)', zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <img src="/acomz.png" alt="AcomZ" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
        <span style={{ fontWeight: 600 }}>An AcomZ Company</span>
      </div>
      <div>&copy; {new Date().getFullYear()} AcomZ Inc. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</div>
    </footer>
  );
}

export const UnifiedHeader = ({ appNameKey }: { appNameKey: string }) => {
  const { user, login, logout } = useSSO();
  const { theme, toggleTheme } = useAppTheme();
  const { lang, toggleLang, t } = useLang();

  let appIcon = '/acomz.png';
  if (appNameKey === 'chat') appIcon = '/hudhud.png';
  if (appNameKey === 'map') appIcon = '/riyadh.png';

  return (
    <header className="unified-header">
      <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src={appIcon} alt="App Icon" style={{ width: '40px', height: '40px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
        <div>
          <h1 className="brand-title">{t(appNameKey)}</h1>
          <span className="brand-subtitle">{t('powered')}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Toggles */}
        <button className="icon-btn" onClick={toggleLang} title="Toggle Language" style={{ fontFamily: 'sans-serif' }}>
          {lang === 'en' ? 'ع' : 'EN'}
        </button>
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme" style={{ fontFamily: 'sans-serif' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginInlineStart: '1rem' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              {t('welcome')}, <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>
            </span>
            <button className="btn-outline" onClick={logout} style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>
              {t('logout')}
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={() => login('Demo User')}>
            {t('login')}
          </button>
        )}
      </div>
    </header>
  );
};
