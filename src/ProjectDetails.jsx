import React, { useState } from 'react';
import { supabase } from './supabase';
import { PROJECT_STAGES } from './workflowConfig';
import { ArrowLeft, Upload, ChevronRight, Loader2, FileText, CheckCircle2 } from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(null);

  const requirementsList = ["Modular Kitchen", "False Ceiling", "Flooring", "Electrical", "Plumbing"];

  // --- DATABASE UPDATE ---
  const updateProjectField = async (updatedData) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(updatedData)
        .eq('id', project.id); // 'id' is the primary key UUID from SQL
      
      if (error) throw error;
    } catch (err) {
      alert("Database error: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // --- FILE UPLOAD TO SUPABASE STORAGE ---
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(fieldName);
    const fileExt = file.name.split('.').pop();
    const fileName = `${project.project_id}/${fieldName}_${Date.now()}.${fileExt}`;

    try {
      // 1. Upload to 'project-files' bucket
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(fileName, file);

      if (error) throw error;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName);

      // 3. Update the database table with the new URL
      await updateProjectField({ [fieldName]: publicUrl });
      alert("Upload Successful!");
    } catch (err) {
      alert("Upload failed. Make sure your bucket 'project-files' is PUBLIC.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={18} /> Back</button>
      
      <div style={cardStyle}>
        <h2>{project.project_name} <span style={idBadge}>{project.project_id}</span></h2>
        <hr style={divider} />

        {/* Floor Plan Upload Section */}
        <section style={sectionStyle}>
          <h4>1. Site Measurement & Floor Plan</h4>
          <div style={uploadRow}>
            {project.floor_plan_url ? (
              <a href={project.floor_plan_url} target="_blank" rel="noreferrer" style={fileLink}>
                <FileText size={16} /> View Floor Plan
              </a>
            ) : <p style={hint}>No file uploaded yet</p>}
            
            <label style={uploadBtn(uploading === 'floor_plan_url')}>
              {uploading === 'floor_plan_url' ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}
              {project.floor_plan_url ? "Change File" : "Upload Plan"}
              <input type="file" hidden onChange={(e) => handleFileUpload(e, 'floor_plan_url')} />
            </label>
          </div>
        </section>

        {/* Finance Section */}
        <section style={sectionStyle}>
          <h4>2. Quotation & Payments</h4>
          <div style={grid}>
            <div>
              <label style={label}>Total Quote (₹)</label>
              <input 
                type="number" 
                style={input} 
                defaultValue={project.total_quote} 
                onBlur={(e) => updateProjectField({ total_quote: Number(e.target.value) })} 
              />
            </div>
            <div>
              <label style={label}>Paid Amount (₹)</label>
              <input 
                type="number" 
                style={input} 
                defaultValue={project.initial_paid} 
                onBlur={(e) => updateProjectField({ initial_paid: Number(e.target.value) })} 
              />
            </div>
          </div>
        </section>

        {/* Stage Advancement */}
        <button 
          style={promoteBtn} 
          disabled={updating}
          onClick={() => updateProjectField({ current_stage_index: 1 })}
        >
          {updating ? "Saving..." : "Move to Next Stage"} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// --- MINIMAL STYLES ---
const containerStyle = { padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const backBtn = { border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' };
const idBadge = { fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '5px', marginLeft: '10px' };
const sectionStyle = { marginBottom: '30px' };
const uploadRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '10px' };
const uploadBtn = (isLoading) => ({
  background: isLoading ? '#94a3b8' : '#2563eb', color: '#fff', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
});
const input = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '5px' };
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const label = { fontSize: '12px', fontWeight: 'bold', color: '#64748b' };
const promoteBtn = { width: '100%', padding: '15px', background: '#1e293b', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' };
const divider = { border: '0', borderTop: '1px solid #e2e8f0', margin: '20px 0' };
const fileLink = { color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' };
const hint = { fontSize: '13px', color: '#94a3b8', margin: 0 };