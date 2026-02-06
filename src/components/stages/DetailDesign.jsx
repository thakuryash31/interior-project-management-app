import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { Upload, CheckCircle2, ChevronRight, FileText, ClipboardCheck, Wallet, Plus, Check, Loader2 } from 'lucide-react';

export default function DetailDesign({ project, updateProject }) {
  const [uploading, setUploading] = useState(false);
  const sub = project.current_sub_step || 1;

  const totalVal = Number(project.total_quote) || 0;
  const initialPaid = Number(project.initial_paid) || 0; 
  const stage2Paid = Number(project.detail_stage_paid) || 0;

  // Formula: $$Target = (Total \times 0.5) - Initial$$
  const fiftyPercentTarget = totalVal * 0.5;
  const dueForProduction = fiftyPercentTarget - initialPaid;
  const milestoneBalance = Math.max(0, dueForProduction - stage2Paid);
  const finalProjectBalance = totalVal - (initialPaid + stage2Paid);

  const handleGenericUpload = async (e, fieldName, nextStep) => {
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

  const handleQuoteUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const versionNumber = (project.quote_versions?.length || 0) + 1;
    const filePath = `${project.project_id}/quotes/v${versionNumber}_${Date.now()}`;
    try {
      const { error } = await supabase.storage.from('project-files').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);
      const newQuoteObj = { name: `Quote V${versionNumber}`, url: publicUrl };
      const updatedList = [...(project.quote_versions || []), newQuoteObj];
      await updateProject({ quote_versions: updatedList }); 
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p style={subtitle}>Stage 2: Detail Design Phase</p>

      {/* 1. SITE MEASUREMENT */}
      <div style={taskBox(sub >= 1, sub === 1)}>
        <div style={taskHeader}><h4>1. Site Measurement</h4>{sub > 1 && <CheckCircle2 color="#22c55e" />}</div>
        {sub === 1 && (
          <label style={uploadBtn}>
            {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16} />}
            Upload Measurement
            <input type="file" hidden onChange={(e) => handleGenericUpload(e, 'site_measurement_url', 2)} />
          </label>
        )}
        {project.site_measurement_url && <a href={project.site_measurement_url} target="_blank" rel="noreferrer" style={fileBadge}><FileText size={14}/> View Measurement</a>}
      </div>

      {/* 2. QUOTE VERSIONS */}
      <div style={taskBox(sub >= 2, sub === 2)}>
        <div style={taskHeader}><h4>2. Quote Versions & Selection</h4>{sub > 2 && <CheckCircle2 color="#22c55e" />}</div>
        {sub === 2 && (
          <div style={{marginTop: 10}}>
            <label style={uploadBtnSecondary}>
              {uploading ? <Loader2 className="animate-spin" size={16}/> : <Plus size={16} />} Upload New Version
              <input type="file" hidden onChange={handleQuoteUpload} />
            </label>
            <div style={{marginTop: 10, display:'flex', flexDirection:'column', gap: 5}}>
              {(project.quote_versions || []).map((q, i) => (
                <div key={i} style={quoteRow}>
                  <a href={q.url} target="_blank" rel="noreferrer" style={linkStyle}><FileText size={12}/> {q.name}</a>
                  <button style={selectBtn(project.final_quote_url === q.url)} onClick={() => updateProject({ final_quote_url: q.url })}>
                    {project.final_quote_url === q.url ? <Check size={12}/> : "Select"}
                  </button>
                </div>
              ))}
            </div>
            {project.final_quote_url && <button style={btn} onClick={() => updateProject({}, 3)}>Continue</button>}
          </div>
        )}
      </div>

      {/* 3. 2D LAYOUT */}
      <div style={taskBox(sub >= 3, sub === 3)}>
        <div style={taskHeader}><h4>3. 2D Layout</h4>{sub > 3 && <CheckCircle2 color="#22c55e" />}</div>
        {sub === 3 && <label style={uploadBtn}><Upload size={16} /> Upload Layout <input type="file" hidden onChange={(e) => handleGenericUpload(e, 'layout_2d_url', 4)} /></label>}
        {project.layout_2d_url && <a href={project.layout_2d_url} target="_blank" rel="noreferrer" style={fileBadge}><FileText size={14}/> View Layout</a>}
      </div>

      {/* 4. BOQ */}
      <div style={taskBox(sub >= 4, sub === 4)}>
        <div style={taskHeader}><h4>4. BOQ</h4>{sub > 4 && <CheckCircle2 color="#22c55e" />}</div>
        {sub === 4 && <label style={uploadBtn}><Upload size={16} /> Upload BOQ <input type="file" hidden onChange={(e) => handleGenericUpload(e, 'boq_url', 5)} /></label>}
        {project.boq_url && <a href={project.boq_url} target="_blank" rel="noreferrer" style={fileBadge}><FileText size={14}/> View BOQ</a>}
      </div>

      {/* 5. QC */}
      <div style={taskBox(sub >= 5, sub === 5)}>
        <div style={taskHeader}><h4>5. Design QC Approval</h4>{sub > 5 && <CheckCircle2 color="#22c55e" />}</div>
        {sub === 5 && <button style={btn} onClick={() => updateProject({ design_qc_approved: true }, 6)}>Approve Design</button>}
      </div>

      {/* 6. 50% PAYMENT */}
      {sub >= 6 && (
        <div style={{ ...taskBox(true, true), border: '2px solid #8b5cf6' }}>
          <h4>6. Production Payment (50%)</h4>
          <div style={financeGrid}>
            <div style={valBox}>
              <label style={miniLabel}>Final Value</label>
              <input type="number" style={cleanInput} value={project.total_quote || ''} onChange={(e) => updateProject({ total_quote: e.target.value })} />
            </div>
            <div style={valBox}>
              <label style={miniLabel}>Paid This Stage</label>
              <input type="number" style={cleanInput} value={project.detail_stage_paid || ''} onChange={(e) => updateProject({ detail_stage_paid: e.target.value })} />
            </div>
            <div style={valBox}>
              <label style={miniLabel}>Milestone Target</label>
              <p style={calcValue}>₹{dueForProduction.toLocaleString()}</p>
            </div>
            <div style={valBox}>
              <label style={miniLabel}>Milestone Balance</label>
              <p style={{ ...calcValue, color: milestoneBalance > 0 ? '#ef4444' : '#10b981' }}>₹{milestoneBalance.toLocaleString()}</p>
            </div>
          </div>
          <button style={milestoneBalance > 0 ? disabledBtn : btn} disabled={milestoneBalance > 0} onClick={() => updateProject({}, 1, 3)}>
            Start Production <ChevronRight size={16}/>
          </button>
        </div>
      )}
    </div>
  );
}

const subtitle = { color: '#94a3b8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: 20 };
const taskBox = (u, a) => ({ padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 15, background: a ? '#fff' : '#f8fafc', opacity: u ? 1 : 0.5 });
const taskHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const uploadBtn = { background: '#f5f3ff', color: '#8b5cf6', border: '1px dashed #8b5cf6', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'bold', marginTop: 10, width: 'fit-content' };
const uploadBtnSecondary = { ...uploadBtn, background: '#fff', border: '1px solid #cbd5e1', color: '#475569' };
const btn = { background: '#1e293b', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 8, cursor: 'pointer', marginTop: 15, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' };
const disabledBtn = { ...btn, background: '#cbd5e1', cursor: 'not-allowed' };
const quoteRow = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px', background:'#fff', borderRadius:8, border:'1px solid #e2e8f0' };
const selectBtn = (isFinal) => ({ background: isFinal ? '#10b981' : '#f1f5f9', color: isFinal ? '#fff' : '#475569', border: 'none', padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' });
const financeGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 15 };
const valBox = { background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' };
const miniLabel = { fontSize: 10, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' };
const cleanInput = { width: '100%', border: 'none', borderBottom: '2px solid #8b5cf6', background: 'transparent', fontSize: 16, fontWeight: 'bold', outline: 'none' };
const calcValue = { fontSize: 18, fontWeight: 'bold', margin: '5px 0 0 0' };
const fileBadge = { display:'flex', alignItems:'center', gap: 5, fontSize: 12, color: '#8b5cf6', background: '#f5f3ff', padding: '6px 12px', borderRadius: 20, width: 'fit-content', marginTop: 10, fontWeight:'bold', textDecoration:'none' };
const linkStyle = { display:'flex', alignItems:'center', gap: 5, color:'#334155', textDecoration:'none', fontSize:12 };