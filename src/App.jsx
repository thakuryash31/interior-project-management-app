import React, { useState } from 'react';
import Dashboard from './Dashboard';
import CreateProject from './CreateProject';

function App() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="App" style={{ fontFamily: 'sans-serif' }}>
      <nav style={{ padding: '15px 40px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', gap: '20px' }}>
        <button onClick={() => setTab('dashboard')} style={tab === 'dashboard' ? activeTabStyle : tabStyle}>Dashboard</button>
        <button onClick={() => setTab('create')} style={tab === 'create' ? activeTabStyle : tabStyle}>+ New Project</button>
      </nav>

      {tab === 'dashboard' ? <Dashboard /> : <CreateProject />}
    </div>
  );
}

const tabStyle = { background: 'none', border: 'none', padding: '10px', cursor: 'pointer', color: '#666' };
const activeTabStyle = { ...tabStyle, borderBottom: '2px solid #000', color: '#000', fontWeight: 'bold' };

export default App;