import React from 'react';
import { Layout, ClipboardList, DollarSign, CheckCircle } from 'lucide-react';
import { PROJECTS_DATA } from './ProjectData';

export default function Dashboard() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50' }}>Interior PM Dashboard</h1>
        <p style={{ color: '#7f8c8d' }}>Managing active design workflows</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {PROJECTS_DATA.map(project => (
          <div key={project.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{project.client}</h2>
              <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '20px', backgroundColor: '#e8f4fd', color: '#3498db' }}>{project.status}</span>
            </div>
            
            <div style={{ margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px' }}>
                <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: '#2ecc71', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#95a5a6' }}>Spent</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>${project.spent.toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#95a5a6' }}>Budget</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>${project.budget.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}