import React, { useState } from 'react';
import { supabase } from './supabase';
import { 
  ArrowLeft, Upload, CheckCircle2, FileText, Loader2, Save,
  Layout, PencilRuler, Factory, Home, ChevronRight
} from 'lucide-react';

// Define the 4 Main Stages
const STAGES = [
  { id: 1, name: "Initial Design", icon: <Layout size={18}/>, color: "#3b82f6" },
  { id: 2, name: "Detail Design", icon: <PencilRuler size={18}/>, color: "#8b5cf6" },
  { id: 3, name: "Production", icon: <Factory size={18}/>, color: "#f59e0b" },
  { id: 4, name: "Installation & Handover", icon: <Home size={18}/>, color: "#10b981" }
];

export default function ProjectDetails({ project: initialProject, onBack }) {
  const [project, setProject] = useState(initialProject);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(null);

  // We track two levels: Main Stage (1-4) and Sub-Step (1-4 within a stage)
  const currentStage = project.current_stage || 1;
  const currentSubStep = project.current_sub_step || 1;
  const scopeOptions = ["Modular Furniture", "Movable Furniture", "False Ceiling", "Flooring", "Paint", "Electrical", "Plumbing"];

  // --- Financial Calculations (Keep your existing logic) ---
  const totalQuote = Number(project.total_quote) || 0;
  const bookingTarget = totalQuote * 0.10;
  const actualPaid = Number(project.initial_paid) || 0;
  const bookingBalance = Math.max(0, bookingTarget - actualPaid);
  const finalBalance = totalQuote - actualPaid;

  const updateProjectState = async (updates, nextSubStep = null, nextMainStage = null) => {
    setUpdating(true);
    const payload = { ...updates };
    if (nextSubStep) payload.current_sub_step = nextSubStep;
    if (nextMainStage) {
        payload.current_stage = nextMainStage;
        payload.current_sub_step = 1; // Reset sub-step for new stage
    }

    try {
      const { error } = await supabase.from('projects').update(payload).eq('id', project.id);
      if (error) throw error;
      setProject(prev => ({ ...prev, ...payload }));
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(fieldName);
    const filePath = `${project.project_id}/${fieldName}_${Date.now()}`;
    try {
      const { data, error } = await supabase.storage.from('project-files').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);
      await updateProjectState({ [fieldName]: publicUrl });
    } catch (err) {
      alert("Upload Failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={18} /> Dashboard / {project.project_id}</button>
      
      {/* --- NEW: STAGE STEPPER --- */}
      <div style={stepperContainer}>
        {STAGES.map((s) => (
          <div key={s.id} style={stepItem(currentStage === s.id, currentStage > s.id)}>
            <div style={stepIcon(currentStage === s.id, currentStage > s.id, s.color)}>
              {currentStage > s.id ? <CheckCircle2 size={16}/> : s.icon}
            </div>
            <span style={stepLabel}>{s.name}</span>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={headerRow}>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
             <div style={{background: STAGES[currentStage-1].color, padding:'8px', borderRadius:'8px', color:'#fff'}}>
                {STAGES[currentStage-1].icon}
             </div>
             <h2>{project.project_name}</h2>
          </div>
          {updating && <Loader2 className="animate-spin" color="#2563eb" />}
        </div>
        <p style={subtitle}>{STAGES[currentStage-1].name} Stage</p>

        {/* --- RENDER STAGE 1 (YOUR EXISTING CODE) --- */}
        {currentStage === 1 && (
          <>
            <div style={taskBox(currentSubStep >= 1, currentSubStep === 1)}>
              <div style={taskHeader}>
                <h4>1. Floor Plan Upload</h4>
                {currentSubStep > 1 && <CheckCircle2 color="#22c55e" size={20} />}
              </div>
              {currentSubStep === 1 && (
                <div style={actionArea}>
                  <label style={uploadBtn(uploading === 'floor_plan_url')}>
                    {uploading === 'floor_plan_url' ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16} />}
                    {project.floor_plan_url ? "Change Floor Plan" : "Upload Floor Plan"}
                    <input type="file" hidden onChange={(e) => handleFileUpload(e, 'floor_plan_url')} />
                  </label>
                  {project.floor_plan_url && (
                    <button style={saveBtn} onClick={() => updateProjectState({}, 2)}>
                      Save & Continue <Save size={16}/>
                    </button>
                  )}
                </div>
              )}
              {project.floor_plan_url && <a href={project.floor_plan_url} target="_blank" style={linkStyle}><FileText size={14}/> floor_plan.pdf</a>}
            </div>

            {currentSubStep >= 2 && (
                <div style={taskBox(currentSubStep >= 2, currentSubStep === 2)}>
                    <div style={taskHeader}>
                        <h4>2. Scope & Requirements</h4>
                        {currentSubStep > 2 && <CheckCircle2 color="#22c55e" size={20} />}
                    </div>
                    {currentSubStep === 2 && (
                        <div>
                        <textarea style={input} placeholder="Enter requirements..." defaultValue={project.customer_notes} onBlur={(e) => updateProjectState({ customer_notes: e.target.value })} />
                        <div style={tagGrid}>
                            {scopeOptions.map(item => (
                            <button key={item} onClick={() => {
                                const current = project.selected_scope || [];
                                const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
                                updateProjectState({ selected_scope: updated });
                            }} style={project.selected_scope?.includes(item) ? activeTag : inactiveTag}>{item}</button>
                            ))}
                        </div>
                        <button style={saveBtn} onClick={() => updateProjectState({}, 3)}>Lock Scope <Save size={16}/></button>
                        </div>
                    )}
                </div>
            )}

            {currentSubStep >= 3 && (
                <div style={taskBox(currentSubStep >= 4, true)}>
                    <div style={taskHeader}><h4>3. Payment Tracking</h4></div>
                    <div style={financeGrid}>
                        <div style={valBox}><label style={miniLabel}>Total Quote</label><input type="number" style={input} value={totalQuote} onChange={(e) => updateProjectState({total_quote: Number(e.target.value)})} /></div>
                        <div style={valBox}><label style={miniLabel}>Paid</label><input type="number" style={input} value={actualPaid} onChange={(e) => updateProjectState({initial_paid: Number(e.target.value)})} /></div>
                        <div style={totalBox}>
                            <label style={{color:'#94a3b8', fontSize:'12px'}}>Balance: ₹ {finalBalance.toLocaleString()}</label>
                            {finalBalance === 0 && (
                                <button style={{...saveBtn, margin:'10px auto'}} onClick={() => updateProjectState({}, 1, 2)}>
                                    Proceed to Stage 2: Detailed Design <ChevronRight size={16}/>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
          </>
        )}

        {/* --- RENDER STAGES 2, 3, 4 (Placeholders) --- */}
        {currentStage > 1 && (
            <div style={{textAlign:'center', padding:'50px'}}>
                <Loader2 size={40} color={STAGES[currentStage-1].color} className="animate-spin" />
                <h3>{STAGES[currentStage-1].name} Stage</h3>
                <p>Stage content modules for this section are under construction.</p>
                <button style={saveBtn} onClick={() => updateProjectState({}, 1, currentStage + 1)}>
                    Demo: Move to Next Stage
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

// --- NEW STYLES FOR STEPPER ---
const stepperContainer = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', background: '#fff', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0' };
const stepItem = (active, done) => ({ display: 'flex', alignItems: 'center', gap: '10px', opacity: active || done ? 1 : 0.4 });
const stepIcon = (active, done, color) => ({
    width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: done ? '#dcfce7' : active ? color : '#f1f5f9',
    color: done ? '#16a34a' : active ? '#fff' : '#64748b'
});
const stepLabel = { fontSize: '13px', fontWeight: '700', color: '#1e293b' };

// --- KEEP YOUR EXISTING STYLES ---
const containerStyle = { padding: '40px 10%', background: '#f8fafc', minHeight: '100vh' };
const backBtn = { border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'10px' };
const cardStyle = { background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const subtitle = { color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '30px' };
const taskBox = (unlocked, active) => ({ padding: '25px', borderRadius: '18px', border: active ? '2px solid #2563eb' : '1px solid #e2e8f0', marginBottom: '20px', background: active ? '#fff' : '#f8fafc' });
const taskHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const actionArea = { display: 'flex', gap: '15px', alignItems: 'center' };
const uploadBtn = (load) => ({ background: load ? '#94a3b8' : '#eff6ff', color: '#2563eb', padding: '12px 20px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', border: '1px dashed #2563eb' });
const saveBtn = { background: '#1e293b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const input = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px', background: '#f8fafc' };
const tagGrid = { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '20px 0' };
const inactiveTag = { padding: '8px 15px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '12px', cursor: 'pointer' };
const activeTag = { ...inactiveTag, background: '#2563eb', color: '#fff' };
const financeGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const valBox = { background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const totalBox = { gridColumn: 'span 2', background: '#1e293b', color: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center' };
const miniLabel = { fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' };
const linkStyle = { color: '#2563eb', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' };