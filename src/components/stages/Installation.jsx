import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { 
  Calendar, CheckCircle2, AlertTriangle, Truck, 
  Wrench, FileText, Loader2, Upload, PartyPopper 
} from 'lucide-react';

export default function Installation({ project, updateProject }) {
  const [dates, setDates] = useState({});
  const [uploading, setUploading] = useState(false);
  
  const sub = project.current_sub_step || 1;

  // --- HANDLER: SAVE DATES ---
  const handleDateSave = async (fields, nextStep) => {
    await updateProject(fields, nextStep);
  };

  // --- HANDLER: UPLOAD NPS FILE ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${project.project_id}/installation/nps_${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('project-files').upload(filePath, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(filePath);
      
      // Update NPS URL and Date, mark Step 13 (Done)
      await updateProject({ 
        nps_document_url: publicUrl,
        nps_received_date: new Date().toISOString().split('T')[0] 
      }, 13);
      
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- HANDLER: MARK PROJECT COMPLETE ---
  const handleCompleteProject = async () => {
    if(!window.confirm("Are you sure? This will archive the project.")) return;
    
    // We update the MAIN project table to set stage to 5 (Completed)
    await updateProject({}, 1, 5); 
  };

  // --- UI HELPER ---
  const StatusIcon = ({ stepNumber }) => {
    if (sub > stepNumber) return <CheckCircle2 size={20} color="var(--primary)"/>;
    if (sub === stepNumber) return <Loader2 className="animate-spin" size={20} color="var(--primary)"/>;
    return <div style={{width:18, height:18, borderRadius:'50%', border:'2px solid var(--border)'}} />;
  };

  // --- DATE INPUT COMPONENT ---
  const DateStep = ({ step, title, dbField, icon: Icon }) => (
    <div className={`step-item ${sub >= step ? 'visible' : ''}`}>
      <div className="step-icon"><Icon size={18}/></div>
      <div className="step-content">
        <h4>{step}. {title}</h4>
        {sub === step ? (
          <div style={{marginTop:10, display:'flex', gap:10}}>
            <input type="date" className="saas-input" onChange={e => setDates({...dates, [dbField]: e.target.value})} />
            <button className="btn btn-primary" onClick={() => handleDateSave({ [dbField]: dates[dbField] }, step + 1)}>Confirm</button>
          </div>
        ) : (
          project[dbField] && <p className="step-meta">Date: {project[dbField]}</p>
        )}
      </div>
      <StatusIcon stepNumber={step} />
    </div>
  );

  return (
    <div>
      <h2 style={{margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700'}}>Stage 4: Installation & Handover</h2>
      
      <div className="steps-container">

        {/* 1. MATERIAL RECEIVED */}
        <DateStep step={1} title="Material Received at Site" dbField="material_received_date" icon={Truck} />

        {/* 2. INSTALLATION START */}
        <DateStep step={2} title="Installation Start Date" dbField="installation_start_date" icon={Wrench} />

        {/* 3. MISSING & DAMAGE RAISED */}
        <DateStep step={3} title="Missing & Damage (M&D) Raised" dbField="missing_damage_raised_date" icon={AlertTriangle} />

        {/* 4. M&D PROCUREMENT START */}
        <DateStep step={4} title="M&D Procurement Start" dbField="md_procurement_start_date" icon={Calendar} />

        {/* 5. M&D PROCUREMENT END */}
        <DateStep step={5} title="M&D Procurement Completion" dbField="md_procurement_end_date" icon={CheckCircle2} />

        {/* 6. M&D PRODUCTION START */}
        <DateStep step={6} title="M&D Production Start" dbField="md_production_start_date" icon={Wrench} />

        {/* 7. M&D PRODUCTION END */}
        <DateStep step={7} title="M&D Production Completion" dbField="md_production_end_date" icon={CheckCircle2} />

        {/* 8. M&D DISPATCH */}
        <DateStep step={8} title="M&D Dispatch Date" dbField="md_dispatch_date" icon={Truck} />

        {/* 9. M&D RECEIVED */}
        <DateStep step={9} title="M&D Received at Site" dbField="md_received_date" icon={Truck} />

        {/* 10. INSTALLATION COMPLETION */}
        <DateStep step={10} title="Installation Completion" dbField="installation_end_date" icon={PartyPopper} />

        {/* 11. HANDOVER START/END */}
        <div className={`step-item ${sub >= 11 ? 'visible' : ''}`}>
          <div className="step-icon"><FileText size={18}/></div>
          <div className="step-content">
            <h4>11. Handover Duration</h4>
            {sub === 11 ? (
               <div className="form-grid-2" style={{marginTop:10}}>
                 <div><span className="field-label">Start</span><input type="date" className="saas-input" onChange={e => setDates({...dates, hStart: e.target.value})} /></div>
                 <div><span className="field-label">End</span><input type="date" className="saas-input" onChange={e => setDates({...dates, hEnd: e.target.value})} /></div>
                 <button className="btn btn-primary" onClick={() => handleDateSave({ handover_start_date: dates.hStart, handover_end_date: dates.hEnd }, 12)}>Save Duration</button>
               </div>
            ) : project.handover_start_date && <p className="step-meta">{project.handover_start_date} to {project.handover_end_date}</p>}
          </div>
          <StatusIcon stepNumber={11} />
        </div>

        {/* 12. NPS & COMPLETION */}
        <div className={`step-item ${sub >= 12 ? 'visible' : ''}`}>
          <div className="step-icon"><PartyPopper size={18}/></div>
          <div className="step-content">
            <h4>12. NPS & Project Closure</h4>
            {sub === 12 && (
               <div style={{marginTop:10}}>
                 <label className="btn btn-secondary">
                   {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} Upload NPS Form
                   <input type="file" hidden onChange={handleFileUpload} />
                 </label>
               </div>
            )}
            {project.nps_document_url && (
              <div style={{marginTop:10}}>
                <a href={project.nps_document_url} target="_blank" rel="noreferrer" className="file-link">View NPS Document</a>
                {sub === 13 && (
                  <button className="btn btn-primary" style={{marginTop:15, width:'100%'}} onClick={handleCompleteProject}>
                    Mark Project as Completed
                  </button>
                )}
              </div>
            )}
          </div>
          <StatusIcon stepNumber={12} />
        </div>

      </div>

      <style jsx>{`
        .steps-container { display: flex; flex-direction: column; position: relative; }
        .steps-container::before { content:''; position: absolute; left: 24px; top: 20px; bottom: 20px; width: 2px; background: var(--border); z-index: 0; }
        .step-item { display: flex; gap: 20px; padding-bottom: 30px; position: relative; z-index: 1; opacity: 0.4; transition: all 0.3s; }
        .step-item.visible { opacity: 1; }
        .step-icon { width: 50px; height: 50px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); box-shadow: var(--shadow-sm); flex-shrink: 0; }
        .step-content { flex: 1; padding-top: 12px; }
        .step-content h4 { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-main); }
        .file-link { display: block; margin-top: 6px; font-size: 13px; color: var(--primary); text-decoration: none; font-weight: 500; }
        .step-meta { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
      `}</style>
    </div>
  );
}