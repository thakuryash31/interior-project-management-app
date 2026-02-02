import React, { useState } from 'react';
import { db } from './firebase';
import { doc, updateDoc } from "firebase/firestore";
import { PROJECT_STAGES } from './workflowConfig';
import { 
  ArrowLeft, CheckCircle2, ClipboardList, Info, 
  Calendar, ChevronRight, Layout, Upload, Plus, X, Search
} from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  const [activeStageIndex, setActiveStageIndex] = useState(project.currentStageIndex || 0);
  const [updating, setUpdating] = useState(false);
  const [reqSearch, setReqSearch] = useState("");

  const requirementsList = [
    "Modular furniture", "Movable Furniture", "False Ceiling", 
    "Flooring", "Electrical Work", "Plumbing work"
  ];

  // Helper to update specific project data
  const updateProjectField = async (data) => {
    setUpdating(true);
    try {
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, { ...data, lastUpdated: new Date() });
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  // Logic to handle requirements (Movable, Modular etc)
  const toggleRequirement = (req) => {
    const current = project.selectedRequirements || [];
    const updated = current.includes(req) ? current.filter(r => r !== req) : [...current, req];
    updateProjectField({ selectedRequirements: updated });
  };

  return (
    <div style={{ padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={backBtnStyle}><ArrowLeft size={20} /> Dashboard</button>
        <div style={{ fontSize: '14px', color: '#64748b' }}>Project: <span style={{fontWeight: '700', color: '#1e293b'}}>{project.projectName}</span></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
        
        <div style={mainCardStyle}>
          {/* Stage Tracker */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            {PROJECT_STAGES.map((stage, index) => (
              <div key={stage.id} onClick={() => setActiveStageIndex(index)} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', opacity: activeStageIndex === index ? 1 : 0.4 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: index <= (project.currentStageIndex || 0) ? '#2563eb' : '#e2e8f0', margin: '0 auto', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{index + 1}</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '8px', color: '#1e293b' }}>{stage.name}</div>
              </div>
            ))}
          </div>

          {/* DYNAMIC CONTENT FOR INITIAL DESIGN PHASE */}
          {activeStageIndex === 0 ? (
            <div style={{ display: 'grid', gap: '25px' }}>
              
              {/* 1. Floor Plan Upload */}
              <div style={taskRowStyle}>
                <div>
                  <h4 style={taskTitleStyle}>1. Floor Plan</h4>
                  <p style={taskDescStyle}>Upload the site measurement drawing.</p>
                </div>
                <label style={uploadBtnStyle}>
                  <Upload size={18} /> {project.floorPlanUrl ? 'Update Plan' : 'Upload PDF/Img'}
                  <input type="file" style={{ display: 'none' }} />
                </label>
              </div>

              {/* 2. Requirement Gathering */}
              <div style={taskRowStyle}>
                <div style={{ width: '100%' }}>
                  <h4 style={taskTitleStyle}>2. Customer Requirement Gathering</h4>
                  <textarea 
                    placeholder="Type specific customer notes here..."
                    style={textAreaStyle}
                    value={project.customerNotes || ""}
                    onBlur={(e) => updateProjectField({ customerNotes: e.target.value })}
                  />
                  
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ position: 'relative', marginBottom: '10px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                      <input 
                        placeholder="Search services (Modular, Flooring...)" 
                        style={searchInputStyle}
                        onChange={(e) => setReqSearch(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {requirementsList.filter(r => r.toLowerCase().includes(reqSearch.toLowerCase())).map(req => (
                        <button 
                          key={req}
                          onClick={() => toggleRequirement(req)}
                          style={project.selectedRequirements?.includes(req) ? tagStyleActive : tagStyle}
                        >
                          {req} {project.selectedRequirements?.includes(req) ? <X size={12}/> : <Plus size={12}/>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Quotation Section */}
              <div style={taskRowStyle}>
                <div style={{ width: '100%' }}>
                  <h4 style={taskTitleStyle}>3. Quotation & Payments</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <div>
                      <label style={miniLabel}>Total Quote (₹)</label>
                      <input type="number" placeholder="0" style={miniInput} onBlur={(e) => updateProjectField({ totalQuote: e.target.value })} defaultValue={project.totalQuote} />
                    </div>
                    <div>
                      <label style={miniLabel}>Initial Paid (₹)</label>
                      <input type="number" placeholder="0" style={miniInput} onBlur={(e) => updateProjectField({ initialPaid: e.target.value })} defaultValue={project.initialPaid} />
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
                      <label style={miniLabel}>Balance Payment</label>
                      <div style={{ fontWeight: 'bold', color: '#ef4444' }}>₹ {(project.totalQuote || 0) - (project.initialPaid || 0)}</div>
                    </div>
                  </div>
                  <label style={{ ...uploadBtnStyle, marginTop: '15px', width: 'fit-content' }}>
                    <Upload size={18} /> Upload Quote PDF
                    <input type="file" style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <button 
                onClick={() => updateProjectField({ currentStageIndex: 1 })}
                style={promoteBtnStyle}
              >
                Complete Initial Phase & Move to Details <ChevronRight size={18} />
              </button>

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
              Details for {PROJECT_STAGES[activeStageIndex].name} are being processed.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={mainCardStyle}>
            <h4 style={taskTitleStyle}>Project Summary</h4>
            <div style={{ marginTop: '15px', fontSize: '14px' }}>
              <div style={summaryRow}><span>Phase:</span> <strong>{PROJECT_STAGES[project.currentStageIndex || 0].name}</strong></div>
              <div style={summaryRow}><span>City:</span> <strong>{project.projectCity}</strong></div>
              <div style={summaryRow}><span>Progress:</span> <strong>{project.progress || 0}%</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const mainCardStyle = { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const taskRowStyle = { padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' };
const taskTitleStyle = { margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: '700' };
const taskDescStyle = { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' };
const uploadBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#475569' };
const textAreaStyle = { width: '100%', marginTop: '10px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', fontFamily: 'inherit' };
const searchInputStyle = { width: '100%', padding: '8px 8px 8px 35px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' };
const tagStyle = { display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' };
const tagStyleActive = { ...tagStyle, background: '#2563eb', color: '#fff', border: '1px solid #2563eb' };
const miniLabel = { fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' };
const miniInput = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '5px' };
const promoteBtnStyle = { width: '100%', padding: '15px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' };