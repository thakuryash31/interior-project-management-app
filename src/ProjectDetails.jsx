import React, { useState } from 'react';
import { PROJECT_STAGES } from './workflowConfig';
import { CheckCircle2, Circle, ChevronRight, ArrowLeft } from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '10px' }}>{project.projectName}</h2>
        <p style={{ color: '#64748b' }}>Project ID: {project.projectId} | Client: {project.customerName}</p>

        {/* --- STAGE PROGRESS BAR --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', position: 'relative' }}>
          {/* Connecting Line */}
          <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
          
          {PROJECT_STAGES.map((stage, index) => (
            <div key={stage.id} onClick={() => setActiveStage(index)} style={{ zIndex: 1, textAlign: 'center', cursor: 'pointer', flex: 1 }}>
              <div style={{ 
                width: '30px', height: '30px', borderRadius: '50%', margin: '0 auto',
                background: index <= activeStage ? '#2563eb' : '#fff',
                border: index <= activeStage ? '2px solid #2563eb' : '2px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: index <= activeStage ? '#fff' : '#e2e8f0'
              }}>
                {index < activeStage ? <CheckCircle2 size={18} /> : <span>{index + 1}</span>}
              </div>
              <p style={{ fontSize: '12px', fontWeight: '700', marginTop: '10px', color: index <= activeStage ? '#1e293b' : '#94a3b8' }}>{stage.name}</p>
            </div>
          ))}
        </div>

        {/* --- SUB-STAGES CHECKLIST --- */}
        <div style={{ marginTop: '50px', background: '#f8fafc', padding: '25px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>{PROJECT_STAGES[activeStage].name} - Checklist</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {PROJECT_STAGES[activeStage].subStages.map((sub, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}