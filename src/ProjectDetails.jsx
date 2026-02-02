import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, updateDoc } from "firebase/firestore";
import { PROJECT_STAGES } from './workflowConfig';
import { 
  ArrowLeft, CheckCircle2, ClipboardList, Info, 
  Calendar, ChevronRight, Layout, CheckSquare 
} from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  // Use the saved stage index from the database, or default to 0
  const [activeStageIndex, setActiveStageIndex] = useState(project.currentStageIndex || 0);
  const [updating, setUpdating] = useState(false);

  // Calculate if the CURRENTLY VIEWED stage is fully finished
  const currentViewSubStages = PROJECT_STAGES[activeStageIndex].subStages;
  const isCurrentViewFinished = currentViewSubStages.every(s => 
    project.completedSubStages?.includes(s)
  );

  // --- LOGIC: Toggle Sub-Stages ---
  const handleToggleSubStage = async (subStageName) => {
    setUpdating(true);
    const currentCompleted = project.completedSubStages || [];
    let updatedList;

    if (currentCompleted.includes(subStageName)) {
      updatedList = currentCompleted.filter(item => item !== subStageName);
    } else {
      updatedList = [...currentCompleted, subStageName];
    }

    // Calculate Progress Percentage across ALL 4 stages
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
    } finally {
      setUpdating(false);
    }
  };

  // --- LOGIC: Move to Next Major Stage ---
  const handleMoveToNextStage = async () => {
    if (activeStageIndex < PROJECT_STAGES.length - 1) {
      const nextIndex = activeStageIndex + 1;
      setUpdating(true);
      try {
        const projectRef = doc(db, "projects", project.id);
        await updateDoc(projectRef, {
          currentStageIndex: nextIndex,
          lastStageUpdate: new Date()
        });
        setActiveStageIndex(nextIndex);
      } catch (error) {
        console.error("Error moving stage:", error);
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <div style={{ padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={onBack} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
          <Calendar size={16} /> Last Update: {project.lastUpdated?.toDate().toLocaleDateString() || 'Recently'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        
        {/* LEFT COLUMN: Main Workflow */}
        <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', color: '#1e293b', margin: '0 0 8px 0' }}>{project.projectName}</h2>
            <p style={{ color: '#64748b', margin: 0 }}>ID: {project.projectId} • Client: {project.customerName}</p>
          </div>

          {/* --- STAGE PROGRESS TRACKER (THE 4 MAIN STAGES) --- */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '50px' }}>
            <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '2px', background: '#f1f5f9', zIndex: 0 }}></div>
            
            {PROJECT_STAGES.map((stage, index) => {
              const isCompleted = index < (project.currentStageIndex || 0);
              const isCurrent = index === (project.currentStageIndex || 0);
              const isSelectedView = activeStageIndex === index;

              return (
                <div 
                  key={stage.id} 
                  onClick={() => setActiveStageIndex(index)}
                  style={{ zIndex: 1, textAlign: 'center', flex: 1, cursor: 'pointer' }}
                >
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto',
                    background: isCompleted ? '#22c55e' : (isCurrent ? '#2563eb' : '#fff'),
                    border: `2px solid ${isCompleted ? '#22c55e' : (isCurrent ? '#2563eb' : '#e2e8f0')}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: (isCompleted || isCurrent) ? '#fff' : '#94a3b8',
                    boxShadow: isSelectedView ? '0 0 0 4px #dbeafe' : 'none',
                    transition: '0.3s'
                  }}>
                    {isCompleted ? <CheckCircle2 size={20} /> : index + 1}
                  </div>
                  <p style={{ 
                    fontSize: '11px', fontWeight: '700', marginTop: '12px', 
                    color: isSelectedView ? '#2563eb' : (isCompleted ? '#22c55e' : '#64748b'),
                    textTransform: 'uppercase'
                  }}>
                    {stage.name}
                  </p>
                </div>
              );
            })}
          </div>

          {/* --- NEXT STAGE ACTION CARD --- */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: '30px', padding: '20px', borderRadius: '16px',
            background: isCurrentViewFinished ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${isCurrentViewFinished ? '#22c55e' : '#e2e8f0'}`,
          }}>
            <div>
              <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px' }}>Stage Status</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                {isCurrentViewFinished 
                  ? "All tasks in this stage are complete." 
                  : "Complete all sub-stages below to proceed."}
              </p>
            </div>
            {activeStageIndex === (project.currentStageIndex || 0) && activeStageIndex < PROJECT_STAGES.length - 1 && (
              <button 
                disabled={!isCurrentViewFinished || updating}
                onClick={handleMoveToNextStage}
                style={{
                  padding: '10px 20px', borderRadius: '10px', border: 'none',
                  background: isCurrentViewFinished ? '#22c55e' : '#cbd5e1',
                  color: '#fff', fontWeight: 'bold', cursor: isCurrentViewFinished ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s'
                }}
              >
                Promote to Next Stage <ChevronRight size={18} />
              </button>
            )}
          </div>

          {/* --- SUB-STAGES CHECKLIST --- */}
          <div style={{ display: 'grid', gap: '12px' }}>
            {PROJECT_STAGES[activeStageIndex].subStages.map((sub, i) => {
              const isDone = project.completedSubStages?.includes(sub);
              return (
                <div 
                  key={i} 
                  onClick={() => !updating && handleToggleSubStage(sub)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '15px', padding: '18px', 
                    background: '#fff', borderRadius: '12px', 
                    border: isDone ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    cursor: updating ? 'not-allowed' : 'pointer',
                    transition: '0.2s',
                    boxShadow: isDone ? '0 4px 12px rgba(37, 99, 235, 0.05)' : 'none'
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
                  <span style={{ 
                    fontWeight: '500', color: isDone ? '#1e293b' : '#64748b', fontSize: '15px',
                    textDecoration: isDone ? 'line-through' : 'none'
                  }}>
                    {sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Summary Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={sidebarCard}>
            <h4 style={sidebarTitle}><Layout size={16} /> Overall Progress</h4>
            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>TOTAL PROJECT</span>
                  <span style={{ color: '#2563eb' }}>{project.progress || 0}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '10px' }}>
                  <div style={{ width: `${project.progress || 0}%`, height: '100%', background: '#2563eb', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                </div>
            </div>
          </div>

          <div style={sidebarCard}>
            <h4 style={sidebarTitle}><Info size={16} /> Site Location</h4>
            <div style={{ marginTop: '15px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              <strong>{project.projectCity}</strong><br />
              {project.projectAddress}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sidebarCard = { background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const sidebarTitle = { margin: 0, fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' };