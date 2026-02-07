import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { 
  Upload, FileText, CheckCircle2, 
  Loader2, Plus, X 
} from 'lucide-react';

export default function DetailDesign({ project, updateProject }) {
  const [uploading, setUploading] = useState(false);
  const sub = project.current_sub_step || 1;

  // --- 1. GENERIC FILE UPLOAD ---
  const handleFile = async (e, fieldName, nextStep) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${project.project_id}/detail/${fieldName}_${Date.now()}.${file.name.split('.').pop()}`;
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

  // --- 2. QUOTE VERSION UPLOAD (The missing piece) ---
  const handleQuoteUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${project.project_id}/quotes/quote_v${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('project-files').upload(filePath, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);

      // Get existing versions or start empty
      const currentVersions = project.quote_versions || [];
      const newVersion = {
        name: file.name,
        url: publicUrl,
        date: new Date().toISOString().split('T')[0]
      };

      // Save new array to JSONB column
      await updateProject({ 
        quote_versions: [...currentVersions, newVersion] 
      });

    } catch (err) {
      alert("Quote upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 3. APPROVE QUOTE ---
  const handleApproveQuote = async () => {
    if(!window.confirm("Confirm this is the final approved quote?")) return;
    await updateProject({}, 4); // Move to Step 4 (BOQ)
  };

  const StatusIcon = ({ stepNumber }) => {
    if (sub > stepNumber) return <CheckCircle2 className="text-primary" size={20} color="var(--primary)"/>;
    if (sub === stepNumber) return <Loader2 className="animate-spin" size={20} color="var(--primary)"/>;
    return <div style={{width:18, height:18, borderRadius:'50%', border:'2px solid var(--border)'}} />;
  };

  return (
    <div>
      <h2 style={{margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700'}}>Stage 2: Detail Design</h2>

      <div className="steps-container">

        {/* STEP 1: SITE MEASUREMENTS */}
        <div className={`step-item ${sub >= 1 ? 'visible' : ''}`}>
          <div className="step-icon"><FileText size={18}/></div>
          <div className="step-content">
            <h4>1. Site Measurements</h4>
            {sub === 1 && (
               <label className="btn btn-primary" style={{marginTop:10}}>
                 {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} 
                 Upload PDF/IMG
                 <input type="file" hidden onChange={(e) => handleFile(e, 'site_measurement_url', 2)} />
               </label>
            )}
            {project.site_measurement_url && <a href={project.site_measurement_url} target="_blank" rel="noreferrer" className="file-link">View Measurements</a>}
          </div>
          <StatusIcon stepNumber={1} />
        </div>

        {/* STEP 2: 2D LAYOUT */}
        <div className={`step-item ${sub >= 2 ? 'visible' : ''}`}>
          <div className="step-icon"><FileText size={18}/></div>
          <div className="step-content">
            <h4>2. 2D Layout Finalization</h4>
            {sub === 2 && (
               <label className="btn btn-primary" style={{marginTop:10}}>
                 {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} 
                 Upload Layout
                 <input type="file" hidden onChange={(e) => handleFile(e, 'layout_2d_url', 3)} />
               </label>
            )}
            {project.layout_2d_url && <a href={project.layout_2d_url} target="_blank" rel="noreferrer" className="file-link">View 2D Layout</a>}
          </div>
          <StatusIcon stepNumber={2} />
        </div>

        {/* STEP 3: QUOTE ITERATIONS */}
        <div className={`step-item ${sub >= 3 ? 'visible' : ''}`}>
          <div className="step-icon"><FileText size={18}/></div>
          <div className="step-content">
            <h4>3. Quotation Approval</h4>
            
            {/* List Previous Versions */}
            <div style={{margin: '10px 0', display:'flex', flexDirection:'column', gap:8}}>
              {(project.quote_versions || []).map((v, i) => (
                <div key={i} style={{fontSize:13, padding:8, background:'var(--bg-app)', borderRadius:6, display:'flex', justifyContent:'space-between'}}>
                  <a href={v.url} target="_blank" rel="noreferrer" style={{color:'var(--text-main)', textDecoration:'none'}}>
                    📄 {v.name} <span style={{color:'var(--text-secondary)', fontSize:11}}>({v.date})</span>
                  </a>
                </div>
              ))}
            </div>

            {sub === 3 && (
              <div style={{display:'flex', gap:10, marginTop:10}}>
                 <label className="btn btn-secondary">
                   {uploading ? <Loader2 className="animate-spin" size={16}/> : <Plus size={16}/>} 
                   New Version
                   <input type="file" hidden onChange={handleQuoteUpload} />
                 </label>
                 
                 {(project.quote_versions || []).length > 0 && (
                   <button className="btn btn-primary" onClick={handleApproveQuote}>
                     Approve Final Quote
                   </button>
                 )}
              </div>
            )}
          </div>
          <StatusIcon stepNumber={3} />
        </div>

        {/* STEP 4: BOQ & QC */}
        <div className={`step-item ${sub >= 4 ? 'visible' : ''}`}>
          <div className="step-icon"><CheckCircle2 size={18}/></div>
          <div className="step-content">
            <h4>4. BOQ & Design QC</h4>
            {sub === 4 && (
               <div style={{marginTop:10, display:'flex', gap:10}}>
                 <label className="btn btn-secondary">
                   {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} 
                   Upload BOQ
                   <input type="file" hidden onChange={(e) => handleFile(e, 'boq_url', 4)} />
                 </label>
                 {project.boq_url && (
                   <button 
                     className="btn btn-primary" 
                     // Moves to Stage 3 (Production), Step 1
                     onClick={() => updateProject({ design_qc_approved: true }, 1, 3)}
                   >
                     Approve & Start Production
                   </button>
                 )}
               </div>
            )}
            {project.boq_url && <a href={project.boq_url} target="_blank" rel="noreferrer" className="file-link">View Final BOQ</a>}
          </div>
          <StatusIcon stepNumber={4} />
        </div>

      </div>
    </div>
  );
}