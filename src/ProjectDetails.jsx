import React, { useState } from 'react';
import { supabase } from './supabase';
import { PROJECT_STAGES } from './workflowConfig';
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, Circle } from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  const [activeStageIndex, setActiveStageIndex] = useState(project.current_stage_index || 0);
  const [updating, setUpdating] = useState(false);
  const currentStage = PROJECT_STAGES[activeStageIndex];

  const updateProjectField = async (updatedData) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(updatedData)
        .eq('id', project.id);
      
      if (error) throw error;
      alert("✅ Progress Saved!"); // Success Message
    } catch (err) {
      console.error("Update Error:", err.message);
      alert("❌ Save Failed: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const toggleSubStage = (subStageName) => {
    const current = project.completed_sub_stages || [];
    const updated = current.includes(subStageName)
      ? current.filter(s => s !== subStageName)
      : [...current, subStageName];
    
    updateProjectField({ completed_sub_stages: updated });
  };

  const handleNextStage = () => {
    if (activeStageIndex < PROJECT_STAGES.length - 1) {
      const nextIndex = activeStageIndex + 1;
      updateProjectField({ current_stage_index: nextIndex });
      setActiveStageIndex(nextIndex);
    } else {
      alert("Project is already in the final stage!");
    }
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={18} /> Dashboard</button>

      {/* 4-Stage Progress Stepper */}
      <div style={stepperContainer}>
        {PROJECT_STAGES.map((stage, index) => (
          <div key={stage.id} style={stepItem(index <= activeStageIndex)}>
            <div style={stepCircle(index <= activeStageIndex)}>
              {index < activeStageIndex ? <CheckCircle2 size={16}/> : index + 1}
            </div>
            <span style={stepLabel}>{stage.name}</span>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2>{currentStage.name}</h2>
          {updating && <Loader2 className="spin" size={20} color="#2563eb" />}
        </div>
        <p style={subtitle}>Complete the sub-stages below to move forward.</p>

        {/* Sub-Stages Checklist */}
        <div style={checklistGrid}>
          {currentStage.subStages.map((sub) => (
            <div 
              key={sub} 
              onClick={() => toggleSubStage(sub)}
              style={checkItem(project.completed_sub_stages?.includes(sub))}
            >
              {project.completed_sub_stages?.includes(sub) ? 
                <CheckCircle2 size={20} color="#2563eb" /> : 
                <Circle size={20} color="#cbd5e1" />
              }
              <span>{sub}</span>
            </div>
          ))}
        </div>

        <button 
          style={primaryBtn} 
          onClick={handleNextStage}
          disabled={updating}
        >
          Move to Next Stage <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px 10%', background: '#f8fafc', minHeight: '100vh' };
const backBtn = { border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' };
const stepperContainer = { display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' };
const stepItem = (active) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: active ? 1 : 0.3 });
const stepCircle = (active) => ({ width: '32px', height: '32px', borderRadius: '50%', background: active ? '#2563eb' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '8px' });
const stepLabel = { fontSize: '12px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center' };
const cardStyle = { background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' };
const subtitle = { color: '#64748b', fontSize: '14px', marginBottom: '30px' };
const checklistGrid = { display: 'grid', gap: '12px', marginBottom: '40px' };
const checkItem = (done) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', border: `1px solid ${done ? '#2563eb' : '#e2e8f0'}`, background: done ? '#eff6ff' : '#fff', cursor: 'pointer', transition: '0.2s', fontWeight: done ? '600' : '400' });
const primaryBtn = { width: '100%', padding: '18px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' };