import React, { useState } from 'react';
import { db } from './firebase';
import { doc, updateDoc } from "firebase/firestore";
import { PROJECT_STAGES } from './workflowConfig';
import { 
  ArrowLeft, CheckCircle2, Circle, 
  Layout, ClipboardList, Info, 
  CheckSquare, Calendar 
} from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Function to handle toggling sub-stages and saving to Firebase
  const handleToggleSubStage = async (subStageName) => {
    setUpdating(true);
    const currentCompleted = project.completedSubStages || [];
    let updatedList;

    // Toggle logic
    if (currentCompleted.includes(subStageName)) {
      updatedList = currentCompleted.filter(item => item !== subStageName);
    } else {
      updatedList = [...currentCompleted, subStageName];
    }

    // Calculate Progress Percentage across ALL stages
    const totalSubStages = PROJECT_STAGES.reduce((acc, stage) => acc + stage.subStages.length, 0);
    const newProgress = Math.round((updatedList.length / totalSubStages) * 100);

    try {
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, {
        completedSubStages: updatedList,
        progress: newProgress,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error("Error updating sub-stage:", error);
      alert("Failed to update task. Check your permissions.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={onBack} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
          <Calendar size={16} /> Created: {project.createdAt?.toDate().toLocaleDateString() || 'Recently'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        
        {/* LEFT COLUMN: Main Workflow */}
        <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '8px' }}>{project.projectName}</h2>
          <p style={{ color: '#64748b', marginBottom: '40px' }}>ID: {project.projectId} • {project.customerName}</p>

          {/* --- STAGE PROGRESS TRACKER --- */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '50px' }}>
            <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '2px', background: '#f1f5f9', zIndex: 0 }}></div>
            
            {PROJECT_STAGES.map((stage, index) => {
              const isSelected = activeStageIndex === index;
              const isCompleted = stage.subStages.every(s => project.completedSubStages?.includes(s));

              return (
                <div 
                  key={stage.id} 
                  onClick={() => setActiveStageIndex(index)}
                  style={{ zIndex: 1, textAlign: 'center', flex: 1, cursor: 'pointer' }}
                >
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto',
                    background: isSelected ? '#2563eb' : (isCompleted ? '#10b981' : '#fff'),
                    border: `2px solid ${isSelected ? '#2563eb' : (isCompleted ? '#10b981' : '#e2e8f0')}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: (isSelected || isCompleted) ? '#fff' : '#94a3b8',
                    transition: '0.3s'
                  }}>
                    {isCompleted ? <CheckCircle2 size={20} /> : index + 1}
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: '700', marginTop: '12px', color: isSelected ? '#2563eb' : '#64748b' }}>
                    {stage.name}
                  </p>
                </div>
              );
            })}
          </div>

          {/* --- SUB-STAGES CHECKLIST --- */}
          <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
              <ClipboardList color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '18px' }}>{PROJECT_STAGES[activeStageIndex].name} Checklist</h3>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {PROJECT_STAGES[activeStageIndex].subStages.map((sub, i) => {
                const isDone = project.completedSubStages?.includes(sub);
                return (
                  <div 
                    key={i} 
                    onClick={() => handleToggleSubStage(sub)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '15px', padding: '18px', 
                      background: isDone ? '#fff' : '#fff', 
                      borderRadius: '12px', border: isDone ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      opacity: updating ? 0.6 : 1,
                      transition: '0.2s hover',
                      boxShadow: isDone ? '0 4px 12px rgba(37, 99, 235, 0.08)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      border: `2px solid ${isDone ? '#2563eb' : '#cbd5e1'}`,
                      background: isDone ? '#2563eb' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isDone && <CheckCircle2 size={14} color="#fff" />}
                    </div>
                    <span style={{ fontWeight: '500', color: isDone ? '#1e293b' : '#64748b', fontSize: '15px' }}>{sub}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Project Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={sidebarCard}>
            <h4 style={sidebarTitle}><Info size={16} /> Status Summary</h4>
            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>TOTAL PROGRESS</span>
                  <span style={{ color: '#2563eb' }}>{project.progress || 0}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '10px' }}>
                  <div style={{ width: `${project.progress || 0}%`, height: '100%', background: '#2563eb', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                </div>
            </div>
          </div>

          <div style={sidebarCard}>
            <h4 style={sidebarTitle}><Layout size={16} /> Site Details</h4>
            <div style={{ marginTop: '15px', display: 'grid', gap: '12px', fontSize: '14px' }}>
              <div>
                <label style={labelStyle}>Project Address</label>
                <div style={valueStyle}>{project.projectAddress}</div>
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <div style={valueStyle}>{project.projectCity}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal Styles ---
const sidebarCard = {
  background: '#fff',
  padding: '24px',
  borderRadius: '20px',
  border: '1px solid #e2e8f0'
};

const sidebarTitle = {
  margin: 0,
  fontSize: '14px',
  color: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const labelStyle = { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' };
const valueStyle = { color: '#334155', marginTop: '4px', fontWeight: '500', lineHeight: '1.4' };