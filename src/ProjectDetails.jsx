import React, { useState } from 'react';
import { supabase } from './supabase';
import { 
  ArrowLeft, Upload, CheckCircle2, Lock, 
  FileText, Loader2, Plus, X 
} from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(null);

  // --- 1. Financial Logic ---
  const totalQuote = Number(project.total_quote) || 0;
  const bookingTarget = totalQuote * 0.10; // 10% auto-calculated
  const actualPaid = Number(project.initial_paid) || 0;
  const bookingBalance = bookingTarget - actualPaid > 0 ? bookingTarget - actualPaid : 0;
  const finalBalance = totalQuote - actualPaid;

  const currentSubStep = project.current_sub_step || 1;
  const scopeOptions = ["Modular Furniture", "Movable Furniture", "False Ceiling", "Flooring", "Paint", "Electrical", "Plumbing"];

  // --- 2. Update Helper ---
  const updateData = async (fields, nextStep = null) => {
    setUpdating(true);
    const payload = { ...fields };
    if (nextStep) payload.current_sub_step = nextStep;

    try {
      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', project.id);
      
      if (error) throw error;
      alert("Progress Saved!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // --- 3. Upload Handler ---
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

      await updateData({ [fieldName]: publicUrl }, nextStep);
    } catch (err) {
      alert("Upload Failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const toggleScope = (item) => {
    const current = project.selected_scope || [];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    updateData({ selected_scope: updated });
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={18} /> Dashboard / {project.project_id}</button>
      
      <div style={cardStyle}>
        <h2>{project.project_name}</h2>
        <p style={subtitle}>Initial Design Stage</p>

        {/* TASK 1: FLOOR PLAN */}
        <div style={taskBox(currentSubStep >= 1, currentSubStep === 1)}>
          <div style={taskHeader}>
            <h4>1. Upload Floor Plan</h4>
            {currentSubStep > 1 && <CheckCircle2 color="#22c55e" size={20} />}
          </div>
          {currentSubStep === 1 && (
            <label style={uploadBtn(uploading === 'floor_plan_url')}>
              {uploading === 'floor_plan_url' ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16} />}
              Upload Floor Plan
              <input type="file" hidden onChange={(e) => handleFileUpload(e, 'floor_plan_url', 2)} />
            </label>
          )}
          {project.floor_plan_url && <a href={project.floor_plan_url} target="_blank" style={linkStyle}><FileText size={14}/> View Plan</a>}
        </div>

        {/* TASK 2: SCOPE OF WORK */}
        <div style={taskBox(currentSubStep >= 2, currentSubStep === 2)}>
          <div style={taskHeader}>
            <h4>2. Customer Needs & Scope</h4>
            {currentSubStep < 2 ? <Lock size={16} color="#94a3b8" /> : currentSubStep > 2 ? <CheckCircle2 color="#22c55e" size={20}/> : null}
          </div>
          {currentSubStep === 2 && (
            <div>
              <textarea 
                style={input} 
                placeholder="Type customer requirements here..." 
                defaultValue={project.customer_notes}
                onBlur={(e) => updateData({ customer_notes: e.target.value })}
              />
              <div style={tagGrid}>
                {scopeOptions.map(item => (
                  <button 
                    key={item} 
                    onClick={() => toggleScope(item)}
                    style={project.selected_scope?.includes(item) ? activeTag : inactiveTag}
                  >
                    {item} {project.selected_scope?.includes(item) ? <X size={12}/> : <Plus size={12}/>}
                  </button>
                ))}
              </div>
              <button style={nextBtn} onClick={() => updateData({}, 3)}>Save & Unlock Task 3</button>
            </div>
          )}
        </div>

        {/* TASK 3: QUOTATION UPLOAD */}
        <div style={taskBox(currentSubStep >= 3, currentSubStep === 3)}>
          <div style={taskHeader}>
            <h4>3. Upload Quotation</h4>
            {currentSubStep < 3 ? <Lock size={16} color="#94a3b8" /> : currentSubStep > 3 ? <CheckCircle2 color="#22c55e" size={20}/> : null}
          </div>
          {currentSubStep === 3 && (
            <label style={uploadBtn(uploading === 'quote_url')}>
              {uploading === 'quote_url' ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16} />}
              Upload Quote PDF
              <input type="file" hidden onChange={(e) => handleFileUpload(e, 'quote_url', 4)} />
            </label>
          )}
          {project.quote_url && <a href={project.quote_url} target="_blank" style={linkStyle}><FileText size={14}/> View Quote</a>}
        </div>

        {/* TASK 4: FINANCE SUMMARY */}
        <div style={taskBox(currentSubStep >= 4, currentSubStep === 4)}>
          <div style={taskHeader}>
            <h4>4. Final Quote & Booking Payment</h4>
            {currentSubStep < 4 && <Lock size={16} color="#94a3b8" />}
          </div>
          {currentSubStep === 4 && (
            <div style={financeGrid}>
              <div style={valBox}>
                <label style={miniLabel}>Total Quote Value (₹)</label>
                <input type="number" style={input} defaultValue={totalQuote} onBlur={(e) => updateData({total_quote: Number(e.target.value)})} />
              </div>
              <div style={valBox}>
                <label style={miniLabel}>10% Booking Target</label>
                <div style={autoVal}>₹ {bookingTarget.toLocaleString()}</div>
              </div>
              <div style={valBox}>
                <label style={miniLabel}>Customer Paid (₹)</label>
                <input type="number" style={input} defaultValue={actualPaid} onBlur={(e) => updateData({initial_paid: Number(e.target.value)})} />
              </div>
              <div style={valBox}>
                <label style={miniLabel}>Booking Balance Due</label>
                <div style={{...autoVal, color: bookingBalance > 0 ? '#ef4444' : '#22c55e'}}>₹ {bookingBalance.toLocaleString()}</div>
              </div>
              <div style={totalBox}>
                <label style={{color:'#94a3b8', fontSize:'12px'}}>Final Overall Balance</label>
                <div style={{fontSize:'24px', fontWeight:'800'}}>₹ {finalBalance.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px 10%', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const backBtn = { border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };
const cardStyle = { background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const subtitle = { color: '#64748b', marginBottom: '30px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' };
const taskBox = (unlocked, active) => ({
  padding: '25px', borderRadius: '18px', border: active ? '2px solid #2563eb' : '1px solid #e2e8f0', marginBottom: '20px',
  background: active ? '#fff' : unlocked ? '#f8fafc' : '#f1f5f9',
  opacity: unlocked ? 1 : 0.6,
  transition: '0.3s'
});
const taskHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const input = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px', outline: 'none' };
const uploadBtn = (load) => ({ background: load ? '#94a3b8' : '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px', fontSize: '14px', fontWeight: '600' });
const financeGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' };
const valBox = { background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const autoVal = { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '8px' };
const totalBox = { gridColumn: 'span 2', background: '#1e293b', color: '#fff', padding: '25px', borderRadius: '15px', textAlign: 'center' };
const nextBtn = { width: '100%', marginTop: '20px', padding: '14px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const tagGrid = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' };
const inactiveTag = { padding: '8px 15px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const activeTag = { ...inactiveTag, background: '#2563eb', color: '#fff', border: '1px solid #2563eb' };
const miniLabel = { fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' };
const linkStyle = { color: '#2563eb', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', fontWeight: '600' };