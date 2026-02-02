import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import Dashboard from './Dashboard';
import CreateProject from './CreateProject';
import LandingPage from './LandingPage';

function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    // Listen for login/logout changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <LandingPage onLoginSuccess={() => setTab('dashboard')} />;
  }

  return (
    <div className="App" style={{ fontFamily: 'sans-serif' }}>
      <nav style={{ padding: '15px 40px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setTab('dashboard')} style={tab === 'dashboard' ? activeTabStyle : tabStyle}>Dashboard</button>
          <button onClick={() => setTab('create')} style={tab === 'create' ? activeTabStyle : tabStyle}>+ New Project</button>
        </div>
        <button onClick={() => signOut(auth)} style={{ background: 'none', border: '1px solid #ddd', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </nav>

      {tab === 'dashboard' ? <Dashboard /> : <CreateProject />}
    </div>
  );
}

const tabStyle = { background: 'none', border: 'none', padding: '10px', cursor: 'pointer', color: '#666' };
const activeTabStyle = { ...tabStyle, borderBottom: '2px solid #000', color: '#000', fontWeight: 'bold' };

export default App;