import { useState, useEffect, useCallback } from 'react';
import BottomNav from './components/BottomNav';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import Today from './pages/Today';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { startSync, stopSync } from './sync/syncManager';
import { getSetting, putSetting } from './db/idb';
import { getAuth, logout } from './api/client';

export default function App() {
  const [tab, setTab] = useState('today');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [auth, setAuth] = useState(getAuth);

  useEffect(() => {
    const handleExpired = () => setAuth(null);
    window.addEventListener('auth-expired', handleExpired);
    return () => window.removeEventListener('auth-expired', handleExpired);
  }, []);

  useEffect(() => {
    if (!auth) return;
    startSync();
    getSetting('weightUnit').then(unit => {
      if (unit) setWeightUnit(unit);
    });
    return () => stopSync();
  }, [auth]);

  const handleLogin = useCallback((data) => {
    setAuth({ token: data.token, userId: data.userId, username: data.username });
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    stopSync();
    setAuth(null);
    setTab('today');
  }, []);

  const handleWeightUnitChange = (unit) => {
    setWeightUnit(unit);
    putSetting('weightUnit', unit);
  };

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Header - mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-surface-600">
        <div className="font-display font-bold text-base tracking-wide text-white">
          LIMINAL GAINS
        </div>
        <SyncStatusIndicator />
      </header>

      {/* Header - desktop (inside sidebar area) */}
      <div className="hidden md:flex fixed top-0 left-56 right-0 h-12 items-center justify-end px-5 border-b border-surface-600 bg-surface-900 z-20">
        <SyncStatusIndicator />
      </div>

      <BottomNav active={tab} onChange={setTab} />

      {/* Main content */}
      <main className="md:ml-56 md:pt-12">
        {tab === 'today' && <Today weightUnit={weightUnit} />}
        {tab === 'history' && <History weightUnit={weightUnit} />}
        {tab === 'settings' && (
          <Settings
            weightUnit={weightUnit}
            onWeightUnitChange={handleWeightUnitChange}
            username={auth.username}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}
