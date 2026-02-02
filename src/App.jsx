import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import Dashboard from './Dashboard';
import CreateProject from './CreateProject';
import LandingPage from './LandingPage';
import { Layers, LogOut, LayoutGrid, PlusSquare } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  if (!user) return <LandingPage />;

  return (
    <div className="App" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* --- SaaS HEADER --- */}
      <nav style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '18px', color: '#2563eb' }}>
            <Layers size={24} /> InteriorPM
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setTab('dashboard')} style={tab === 'dashboard' ? activeTab : inactiveTab}>
              <LayoutGrid size={18} /> Dashboard
            </button>
            <button onClick={() => setTab('create')} style={tab === 'create' ? activeTab : inactiveTab}>
              <PlusSquare size={18} /> New Project
            </button>
          </div>
        </div>

        <button onClick={() => signOut(auth)} style={logoutBtn}>
          <LogOut size={16} /> Logout
        </button>
      </nav>

      {tab === 'dashboard' ? <Dashboard /> : <CreateProject />}
    </div>
  );
}

// --- Nav Styles ---
const navStyle = {
  padding: '12px 5%',
  background: '#1e293b', // Deep Navy Sidebar/Header feel
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  zIndex: 100
};

const inactiveTab = {
  background: 'none',
  border: 'none',
  padding: '8px 16px',
  cursor: 'pointer',
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: '600',
  fontSize: '14px',
  borderRadius: '8px'
};

const activeTab = {
  ...inactiveTab,
  color: '#fff',
  backgroundColor: '#334155'
};

const logoutBtn = {
  background: 'none',
  border: '1px solid #334155',
  color: '#94a3b8',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px'
};

export default App;