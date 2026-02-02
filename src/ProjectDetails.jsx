import React, { useState } from 'react';
import { supabase } from './supabase';
import { 
  ArrowLeft, Upload, CheckCircle2, Lock, 
  FileText, Loader2, Plus, X, Save 
} from 'lucide-react';

export default function ProjectDetails({ project: initialProject, onBack }) {
  // Use local state for the project so the UI updates instantly
  const [project, setProject] = useState(initialProject);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(null);

  const currentSubStep = project.current_sub_step || 1;
  const scopeOptions = ["Modular Furniture", "Movable Furniture", "False Ceiling", "Flooring", "Paint", "Electrical", "Plumbing"];

  // --- Financial Calculations ---
  const totalQuote = Number(project.total_quote) || 0;
  const bookingTarget = totalQuote * 0.10;
  const actualPaid = Number(project.initial_paid) || 0;
  const bookingBalance = Math.max(0, bookingTarget - actualPaid);
  const finalBalance = totalQuote - actualPaid;

  // --- Core Update Function ---
  const updateProjectState = async (updates, nextStep = null) => {
    setUpdating(true);
    const payload = { ...updates };
    if (nextStep) payload.current_sub_step = nextStep;

    try {
      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', project.id);
      
      if (error) throw error;

      // UPDATE LOCAL STATE IMMEDIATELY (No reload needed)
      setProject(prev => ({ ...prev, ...payload }));
      
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (e, fieldName, nextStep) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(fieldName);
    const filePath = `${project.project_id}/${fieldName}_${Date.now()}.${file.name.split('.').pop()}`;

    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      await updateProjectState({ [fieldName]: publicUrl }, nextStep);
    } catch (err) {
      alert("Upload Failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={18} /> Dashboard / {project.project_id}</button>
      
      <div style={cardStyle}>
        <div style={headerRow}>
          <h2>{project.project_name}</h2>
          {updating && <Loader2 className="animate-spin" color="#2563eb" />}
        </div>
        <p style={subtitle}>Initial Design Stage</p>

        {/* --- TASK 1: FLOOR PLAN --- */}
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

        {/* --- TASK 2: SCOPE OF WORK (Hidden until Task 1 Done) --- */}
        {currentSubStep >= 2 && (
          <div style={taskBox(currentSubStep >= 2, currentSubStep === 2)}>
            <div style={taskHeader}>
              <h4>2. Scope & Requirements</h4>
              {currentSubStep > 2 && <CheckCircle2 color="#22c55e" size={20} />}
            </div>
            {currentSubStep === 2 && (
              <div>
                <textarea 
                  style={input} 
                  placeholder="Enter detailed requirements..." 
                  defaultValue={project.customer_notes}
                  onBlur={(e) => updateProjectState({ customer_notes: e.target.value })}
                />
                <div style={tagGrid}>
                  {scopeOptions.map(item => (
                    <button 
                      key={item} 
                      onClick={() => {
                        const current = project.selected_scope || [];
                        const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
                        updateProjectState({ selected_scope: updated });
                      }}
                      style={project.selected_scope?.includes(item) ? activeTag : inactiveTag}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <button style={saveBtn} onClick={() => updateProjectState({}, 3)}>
                  Lock Scope & Move to Quote <Save size={16}/>
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- TASK 3: QUOTATION (Hidden until Task 2 Done) --- */}
        {currentSubStep >= 3 && (
          <div style={taskBox(currentSubStep >= 3, currentSubStep === 3)}>
            <div style={taskHeader}>
              <h4>3. Official Quotation</h4>
              {currentSubStep > 3 && <CheckCircle2 color="#22c55e" size={20} />}
            </div>
            {currentSubStep === 3 && (
              <div style={actionArea}>
                <label style={uploadBtn(uploading === 'quote_url')}>
                  <Upload size={16} /> Upload Quote PDF
                  <input type="file" hidden onChange={(e) => handleFileUpload(e, 'quote_url')} />
                </label>
                {project.quote_url && (
                  <button style={saveBtn} onClick={() => updateProjectState({}, 4)}>
                    Finalize Quote <Save size={16}/>
                  </button>
                )}
              </div>
            )}
            {project.quote_url && <a href={project.quote_url} target="_blank" style={linkStyle}><FileText size={14}/> quotation_final.pdf</a>}
          </div>
        )}

        {/* --- TASK 4: FINANCE (Hidden until Task 3 Done) --- */}
        {currentSubStep >= 4 && (
          <div style={taskBox(currentSubStep === 4, true)}>
            <div style={taskHeader}>
              <h4>4. Payment Tracking</h4>
            </div>
            <div style={financeGrid}>
              <div style={valBox}>
                <label style={miniLabel}>Total Quote Value</label>
                <input type="number" style={input} value={totalQuote} onChange={(e) => updateProjectState({total_quote: Number(e.target.value)})} />
              </div>
              <div style={valBox}>
                <label style={miniLabel}>10% Booking Goal</label>
                <div style={autoVal}>₹ {bookingTarget.toLocaleString()}</div>
              </div>
              <div style={valBox}>
                <label style={miniLabel}>Amount Paid by Client</label>
                <input type="number" style={input} value={actualPaid} onChange={(e) => updateProjectState({initial_paid: Number(e.target.value)})} />
              </div>
              <div style={valBox}>
                <label style={miniLabel}>Booking Balance</label>
                <div style={{...autoVal, color: bookingBalance > 0 ? '#ef4444' : '#22c55e'}}>₹ {bookingBalance.toLocaleString()}</div>
              </div>
              <div style={totalBox}>
                <label style={{color:'#94a3b8', fontSize:'12px'}}>Final Project Balance</label>
                <div style={{fontSize:'24px', fontWeight:'800'}}>₹ {finalBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px 10%', background: '#f8fafc', minHeight: '100vh' };
const backBtn = { border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const cardStyle = { background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const subtitle = { color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '30px' };
const taskBox = (unlocked, active) => ({
  padding: '25px', borderRadius: '18px', border: active ? '2px solid #2563eb' : '1px solid #e2e8f0', marginBottom: '20px',
  background: active ? '#fff' : '#f8fafc'
});
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
const autoVal = { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' };
const totalBox = { gridColumn: 'span 2', background: '#1e293b', color: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center' };
const miniLabel = { fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' };
const linkStyle = { color: '#2563eb', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' };