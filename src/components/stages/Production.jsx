import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { 
  Upload, Calendar, CheckCircle2, FileText, 
  Loader2, Truck, Factory, Hammer 
} from 'lucide-react';

export default function Production({ project, updateProject }) {
  const [uploading, setUploading] = useState(false);
  const [dates, setDates] = useState({}); 
  
  // Safety check: ensure current_sub_step exists
  const sub = project.current_sub_step || 1;

  // --- 1. FILE UPLOAD HANDLER ---
  const handleFile = async (e, fieldName, nextStep) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create a unique file path
      const filePath = `${project.project_id}/production/${fieldName}_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error } = await supabase.storage.from('project-files').upload(filePath, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);
      
      // Update the specific field and move to next step
      await updateProject({ [fieldName]: publicUrl }, nextStep);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 2. DATE SAVE HANDLER ---
  // We added 'nextStage' parameter to handle the jump to Stage 4 at the end
  const handleDateSave = async (fields, nextStep, nextStage = null) => {
    await updateProject(fields, nextStep, nextStage);
  };

  // --- 3. STATUS ICON HELPER ---
  const StatusIcon = ({ stepNumber }) => {
    if (sub > stepNumber) return <CheckCircle2 className="text-primary" size={20} color="var(--primary)"/>;
    if (sub === stepNumber) return <Loader2 className="animate-spin" size={20} color="var(--primary)"/>;
    return <div style={{width:18, height:18, borderRadius:'50%', border:'2px solid var(--border)'}} />;
  };

  return (
    <div>
      <h2 style={{margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700'}}>Stage 3: Production & Execution</h2>

      <div className="steps-container">
        
        {/* STEP 1: UPLOAD BOM */}
        <div className={`step-item ${sub >= 1 ? 'visible' : ''}`}>
          <div className="step-icon"><FileText size={18}/></div>
          <div className="step-content">
            <h4>1. Upload BOM (Bill of Materials)</h4>
            {sub === 1 && (
               <label className="btn btn-primary" style={{marginTop:10}}>
                 {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} 
                 Upload BOM
                 <input type="file" hidden onChange={(e) => handleFile(e, 'bom_url', 2)} />
               </label>
            )}
            {project.bom_url && (
              <a href={project.bom_url} target="_blank" rel="noreferrer" className="file-link">View BOM Document</a>
            )}
          </div>
          <StatusIcon stepNumber={1} />
        </div>

        {/* STEP 2: UPLOAD DRAWING */}
        <div className={`step-item ${sub >= 2 ? 'visible' : ''}`}>
          <div className="step-icon"><FileText size={18}/></div>
          <div className="step-content">
            <h4>2. Upload Production Drawing</h4>
            {sub === 2 && (
               <label className="btn btn-primary" style={{marginTop:10}}>
                 {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} 
                 Upload Drawing
                 <input type="file" hidden onChange={(e) => handleFile(e, 'production_drawing_url', 3)} />
               </label>
            )}
            {project.production_drawing_url && (
              <a href={project.production_drawing_url} target="_blank" rel="noreferrer" className="file-link">View Drawings</a>
            )}
          </div>
          <StatusIcon stepNumber={2} />
        </div>

        {/* STEP 3: PROCUREMENT DATES */}
        <div className={`step-item ${sub >= 3 ? 'visible' : ''}`}>
          <div className="step-icon"><Calendar size={18}/></div>
          <div className="step-content">
            <h4>3. Material Procurement</h4>
            {sub === 3 ? (
              <div className="form-grid-2" style={{marginTop:10}}>
                <div>
                    <span className="field-label">Start Date</span>
                    <input type="date" className="saas-input" onChange={e => setDates({...dates, start: e.target.value})} />
                </div>
                <div>
                    <span className="field-label">End Date</span>
                    <input type="date" className="saas-input" onChange={e => setDates({...dates, end: e.target.value})} />
                </div>
                <button 
                  className="btn btn-primary" 
                  disabled={!dates.start || !dates.end}
                  onClick={() => handleDateSave({ procurement_start_date: dates.start, procurement_end_date: dates.end }, 4)}
                >
                  Confirm Dates
                </button>
              </div>
            ) : (
               project.procurement_start_date && <p className="step-meta">Scheduled: {project.procurement_start_date} to {project.procurement_end_date}</p>
            )}
          </div>
          <StatusIcon stepNumber={3} />
        </div>

        {/* STEP 4: ON SITE WORK START */}
        <div className={`step-item ${sub >= 4 ? 'visible' : ''}`}>
          <div className="step-icon"><Hammer size={18}/></div>
          <div className="step-content">
            <h4>4. On-Site Work Start</h4>
            {sub === 4 ? (
               <div style={{marginTop:10, display:'flex', gap:10}}>
                 <input type="date" className="saas-input" onChange={e => setDates({...dates, siteStart: e.target.value})} />
                 <button className="btn btn-primary" onClick={() => handleDateSave({ site_work_start_date: dates.siteStart }, 5)}>Start Site Work</button>
               </div>
            ) : project.site_work_start_date && <p className="step-meta">Started: {project.site_work_start_date}</p>}
          </div>
          <StatusIcon stepNumber={4} />
        </div>

        {/* STEP 5: MATERIAL REACH */}
        <div className={`step-item ${sub >= 5 ? 'visible' : ''}`}>
          <div className="step-icon"><Truck size={18}/></div>
          <div className="step-content">
            <h4>5. Material Reached Factory</h4>
            {sub === 5 ? (
               <div style={{marginTop:10, display:'flex', gap:10}}>
                 <input type="date" className="saas-input" onChange={e => setDates({...dates, matReach: e.target.value})} />
                 <button className="btn btn-primary" onClick={() => handleDateSave({ material_reach_date: dates.matReach }, 6)}>Confirm Arrival</button>
               </div>
            ) : project.material_reach_date && <p className="step-meta">Reached: {project.material_reach_date}</p>}
          </div>
          <StatusIcon stepNumber={5} />
        </div>

        {/* STEP 6: PRODUCTION START */}
        <div className={`step-item ${sub >= 6 ? 'visible' : ''}`}>
          <div className="step-icon"><Factory size={18}/></div>
          <div className="step-content">
            <h4>6. Production Start</h4>
            {sub === 6 ? (
               <div style={{marginTop:10, display:'flex', gap:10}}>
                 <input type="date" className="saas-input" onChange={e => setDates({...dates, prodStart: e.target.value})} />
                 <button className="btn btn-primary" onClick={() => handleDateSave({ production_start_date: dates.prodStart }, 7)}>Begin Production</button>
               </div>
            ) : project.production_start_date && <p className="step-meta">Started: {project.production_start_date}</p>}
          </div>
          <StatusIcon stepNumber={6} />
        </div>

        {/* STEP 7: PRODUCTION END */}
        <div className={`step-item ${sub >= 7 ? 'visible' : ''}`}>
          <div className="step-icon"><CheckCircle2 size={18}/></div>
          <div className="step-content">
            <h4>7. Production End</h4>
            {sub === 7 ? (
               <div style={{marginTop:10, display:'flex', gap:10}}>
                 <input type="date" className="saas-input" onChange={e => setDates({...dates, prodEnd: e.target.value})} />
                 <button className="btn btn-primary" onClick={() => handleDateSave({ production_end_date: dates.prodEnd }, 8)}>Mark Completed</button>
               </div>
            ) : project.production_end_date && <p className="step-meta">Ended: {project.production_end_date}</p>}
          </div>
          <StatusIcon stepNumber={7} />
        </div>

        {/* STEP 8: SITE WORK END */}
        <div className={`step-item ${sub >= 8 ? 'visible' : ''}`}>
          <div className="step-icon"><Hammer size={18}/></div>
          <div className="step-content">
            <h4>8. On-Site Work End</h4>
            {sub === 8 ? (
               <div style={{marginTop:10, display:'flex', gap:10}}>
                 <input type="date" className="saas-input" onChange={e => setDates({...dates, siteEnd: e.target.value})} />
                 <button className="btn btn-primary" onClick={() => handleDateSave({ site_work_end_date: dates.siteEnd }, 9)}>Finish Site Work</button>
               </div>
            ) : project.site_work_end_date && <p className="step-meta">Finished: {project.site_work_end_date}</p>}
          </div>
          <StatusIcon stepNumber={8} />
        </div>

        {/* STEP 9: DISPATCH & TRANSITION TO STAGE 4 */}
        <div className={`step-item ${sub >= 9 ? 'visible' : ''}`}>
          <div className="step-icon"><Truck size={18}/></div>
          <div className="step-content">
            <h4>9. Dispatch</h4>
            {sub === 9 ? (
               <div style={{marginTop:10, display:'flex', gap:10}}>
                 <input type="date" className="saas-input" onChange={e => setDates({...dates, dispatch: e.target.value})} />
                 <button 
                   className="btn btn-primary" 
                   disabled={!dates.dispatch}
                   // ✅ CRITICAL: This moves the project to Stage 4 (Installation), Sub-step 1
                   onClick={() => handleDateSave({ dispatch_date: dates.dispatch }, 1, 4)}
                 >
                   Confirm Dispatch & Start Installation
                 </button>
               </div>
            ) : project.dispatch_date && <p className="step-meta">Dispatched: {project.dispatch_date}</p>}
          </div>
          <StatusIcon stepNumber={9} />
        </div>

      </div>
      
      {/* LOCAL STYLES FOR TIMELINE */}
      <style jsx>{`
        .steps-container { display: flex; flex-direction: column; position: relative; }
        .steps-container::before { 
          content:''; position: absolute; left: 24px; top: 20px; bottom: 20px; width: 2px; background: var(--border); z-index: 0;
        }
        .step-item { 
          display: flex; gap: 20px; padding-bottom: 30px; position: relative; z-index: 1; 
          transition: all 0.3s ease; opacity: 0.4;
        }
        .step-item.visible { opacity: 1; }
        
        .step-icon {
          width: 50px; height: 50px; background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary); box-shadow: var(--shadow-sm); flex-shrink: 0;
        }
        .step-content { flex: 1; padding-top: 12px; }
        .step-content h4 { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-main); }
        .file-link { display: block; margin-top: 6px; font-size: 13px; color: var(--primary); text-decoration: none; font-weight: 500; }
        .step-meta { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
      `}</style>
    </div>
  );
}