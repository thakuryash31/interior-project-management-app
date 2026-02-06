import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { Upload, CheckCircle2, ChevronRight, Plus, FileText, Loader2 } from 'lucide-react';

export default function InitialDesign({ project, updateProject }) {
  const [uploading, setUploading] = useState(false);
  const sub = project.current_sub_step || 1;

  const totalVal = Number(project.total_quote) || 0;
  const initialPaid = Number(project.initial_paid) || 0;
  const bookingRequired = totalVal * 0.10;
  const bookingBalance = Math.max(0, bookingRequired - initialPaid);

  const handleFile = async (e, fieldName, nextStep) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const filePath = `${project.project_id}/${fieldName}_${Date.now()}`;
    try {
      const { error } = await supabase.storage.from('project-files').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);
      await updateProject({ [fieldName]: publicUrl }, nextStep);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p style={subtitle}>Stage 1: Initial Design Phase</p>

      {/* 1. FLOOR PLAN */}
      <div style={taskBox(sub >= 1, sub === 1)}>
        <div style={taskHeader}>
          <h4>1. Floor Plan Upload</h4>
          {sub > 1 && <CheckCircle2 color="#22c55e" />}
        </div>
        {sub === 1 && (
          <label style={uploadBtn}>
            {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16} />}
            Upload Floor Plan
            <input type="file" hidden onChange={(e) => handleFile(e, 'floor_plan_url', 2)} />
          </label>
        )}
        {project.floor_plan_url && (
          <a href={project.floor_plan_url} target="_blank" rel="noreferrer" style={fileLink}>
            <FileText size={14}/> View Floor Plan
          </a>
        )}
      </div>

      {/* 2. SCOPE */}
      <div style={taskBox(sub >= 2, sub === 2)}>
        <div style={taskHeader}>
          <h4>2. Scope & Requirements</h4>
          {sub > 2 && <CheckCircle2 color="#22c55e" />}
        </div>
        {sub === 2 && (
          <div>
            <textarea 
              style={input} 
              placeholder="Requirements..." 
              defaultValue={project.selected_scope_details}
              onBlur={(e) => updateProject({ selected_scope_details: e.target.value })}
            />
            <button style={btn} onClick={() => updateProject({}, 3)}>Lock Scope</button>
          </div>
        )}
      </div>

      {/* 3. INITIAL QUOTE */}
      <div style={taskBox(sub >= 3, sub === 3)}>
        <div style={taskHeader}>
          <h4>3. Initial Quotation</h4>
          {sub > 3 && <CheckCircle2 color="#22c55e" />}
        </div>
        {sub === 3 && (
          <label style={uploadBtn}>
            {uploading ? <Loader2 className="animate-spin" size={16}/> : <Plus size={16} />}
            Upload Quote
            <input type="file" hidden onChange={(e) => handleFile(e, 'selected_quote_url', 4)} />
          </label>
        )}
      </div>

      {/* 4. FINANCE */}
      {sub >= 4 && (
        <div style={{ ...taskBox(true, true), border: '2px solid #3b82f6' }}>
          <h4>4. Booking Payment (10%)</h4>
          <div style={financeGrid}>
            <div style={valBox}>
              <label style={miniLabel}>Total Value</label>
              <input type="number" style={cleanInput} value={project.total_quote || ''} onChange={(e) => updateProject({ total_quote: e.target.value })} />
            </div>
            <div style={valBox}>
              <label style={miniLabel}>Paid Amount</label>
              <input type="number" style={cleanInput} value={project.initial_paid || ''} onChange={(e) => updateProject({ initial_paid: e.target.value })} />
            </div>
            <div style={valBox}>
              <label style={miniLabel}>10% Target</label>
              <p style={calcValue}>₹{bookingRequired.toLocaleString()}</p>
            </div>
            <div style={valBox}>
              <label style={miniLabel}>Balance</label>
              <p style={{ ...calcValue, color: bookingBalance > 0 ? '#ef4444' : '#10b981' }}>₹{bookingBalance.toLocaleString()}</p>
            </div>
          </div>
          <button style={bookingBalance > 0 ? disabledBtn : btn} disabled={bookingBalance > 0} onClick={() => updateProject({}, 1, 2)}>
            Move to Stage 2 <ChevronRight size={16}/>
          </button>
        </div>
      )}
    </div>
  );
}

const subtitle = { color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: 20 };
const taskBox = (u, a) => ({ padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 15, background: a ? '#fff' : '#f8fafc', opacity: u ? 1 : 0.5 });
const taskHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const uploadBtn = { background: '#eff6ff', color: '#2563eb', border: '1px dashed #2563eb', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'bold', marginTop: 10, width: 'fit-content' };
const btn = { background: '#1e293b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 8, cursor: 'pointer', marginTop: 15, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 };
const disabledBtn = { ...btn, background: '#94a3b8', cursor: 'not-allowed' };
const input = { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', marginTop: 10 };
const financeGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 15 };
const valBox = { background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' };
const miniLabel = { fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' };
const cleanInput = { width: '100%', border: 'none', borderBottom: '2px solid #3b82f6', background: 'transparent', fontSize: 16, fontWeight: 'bold', outline: 'none' };
const calcValue = { fontSize: 18, fontWeight: 'bold', margin: '5px 0 0 0' };
const fileLink = { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#2563eb', marginTop: 10, fontWeight: '600', textDecoration: 'none' };