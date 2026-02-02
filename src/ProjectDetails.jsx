import React, { useState } from 'react';
import { supabase } from './supabase';
import { PROJECT_STAGES } from './workflowConfig';
import { 
  ArrowLeft, Upload, ChevronRight, Loader2, 
  FileText, CheckCircle2, Plus, X, Search 
} from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  // --- ADDED THIS LINE TO FIX THE ERROR ---
  const [activeStageIndex, setActiveStageIndex] = useState(project.current_stage_index || 0);
  
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [reqSearch, setReqSearch] = useState("");

  const requirementsList = [
    "Modular furniture", "Movable Furniture", "False Ceiling", 
    "Flooring", "Electrical Work", "Plumbing work"
  ];

  // --- DATABASE UPDATE LOGIC ---
  const updateProjectField = async (updatedData) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(updatedData)
        .eq('id', project.id);
      
      if (error) throw error;
    } catch (err) {
      console.error("Update Error:", err.message);
    } finally {
      setUpdating(false);
    }
  };

  // --- FILE UPLOAD LOGIC ---
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(fieldName);
    const fileExt = file.name.split('.').pop();
    const filePath = `${project.project_id}/${fieldName}_${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      await updateProjectField({ [fieldName]: publicUrl });
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(null);
    }
  };

  const toggleRequirement = (req) => {
    const current = project.selected_requirements || [];
    const updated = current.includes(req) 
      ? current.filter(r => r !== req) 
      : [...current, req];
    
    updateProjectField({ selected_requirements: updated });
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button onClick={onBack} style={backBtn}><ArrowLeft size={18} /> Back to Dashboard</button>
        <div style={statusBadge}>Phase {activeStageIndex + 1}: {PROJECT_STAGES[activeStageIndex].name}</div>
      </div>

      <div style={mainGrid}>
        <div style={cardStyle}>
          <h2 style={{margin: '0 0 20px 0'}}>{project.project_name}</h2>

          {/* 1. Floor Plan Section */}
          <div style={sectionBox}>
            <div style={sectionHeader}>
              <h4>1. Floor Plan & Measurements</h4>
              <label style={uploadBtn(uploading === 'floor_plan_url')}>
                {uploading === 'floor_plan_url' ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}
                Upload Plan
                <input type="file" hidden onChange={(e) => handleFileUpload(e, 'floor_plan_url')} />
              </label>
            </div>
            {project.floor_plan_url && (
              <a href={project.floor_plan_url} target="_blank" rel="noreferrer" style={fileLink}>
                <FileText size={16} /> View Uploaded Floor Plan
              </a>
            )}
          </div>

          {/* 2. Requirements Section */}
          <div style={sectionBox}>
            <h4>2. Customer Requirements</h4>
            <textarea 
              style={textArea} 
              placeholder="Add specific customer notes..."
              defaultValue={project.customer_notes}
              onBlur={(e) => updateProjectField({ customer_notes: e.target.value })}
            />
            <div style={tagCloud}>
              {requirementsList.map(req => (
                <button 
                  key={req} 
                  onClick={() => toggleRequirement(req)}
                  style={project.selected_requirements?.includes(req) ? activeTag : inactiveTag}
                >
                  {req} {project.selected_requirements?.includes(req) ? <X size={12}/> : <Plus size={12}/>}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Finance Section */}
          <div style={sectionBox}>
            <h4>3. Quotation & Payments</h4>
            <div style={financeGrid}>
              <div>
                <label style={miniLabel}>Total Quote (₹)</label>
                <input 
                  type="number" 
                  style={input} 
                  defaultValue={project.total_quote}
                  onBlur={(e) => updateProjectField({ total_quote: Number(e.target.value) })}
                />
              </div>
              <div>
                <label style={miniLabel}>Paid Amount (₹)</label>
                <input 
                  type="number" 
                  style={input} 
                  defaultValue={project.initial_paid}
                  onBlur={(e) => updateProjectField({ initial_paid: Number(e.target.value) })}
                />
              </div>
              <div style={balanceBox}>
                <label style={miniLabel}>Balance Due</label>
                <div style={balanceText}>₹ {(project.total_quote || 0) - (project.initial_paid || 0)}</div>
              </div>
            </div>
          </div>

          <button 
            style={promoteBtn}
            onClick={() => {
                const nextIndex = (project.current_stage_index || 0) + 1;
                updateProjectField({ current_stage_index: nextIndex });
                setActiveStageIndex(nextIndex);
            }}
          >
            Move to Next Stage <ChevronRight size={18} />
          </button>
        </div>

        {/* Sidebar Info */}
        <div style={sidebar}>
           <div style={cardStyle}>
              <h4 style={miniLabel}>Project Location</h4>
              <p style={{margin: '5px 0 0 0', fontWeight: 'bold'}}>{project.project_city}</p>
              <hr style={hr} />
              <h4 style={miniLabel}>Client Name</h4>
              <p style={{margin: '5px 0 0 0', fontWeight: 'bold'}}>{project.customer_name}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLES (Keep existing) ---
const containerStyle = { padding: '30px 5%', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' };
const backBtn = { border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };
const statusBadge = { background: '#dbeafe', color: '#1e40af', padding: '6px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const sectionBox = { marginBottom: '25px', padding: '20px', border: '1px solid #f1f5f9', borderRadius: '15px' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const uploadBtn = (load) => ({ background: load ? '#94a3b8' : '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' });
const fileLink = { color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px' };
const textArea = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', marginTop: '10px' };
const tagCloud = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' };
const inactiveTag = { padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
const activeTag = { ...inactiveTag, background: '#2563eb', color: '#fff', border: '#2563eb' };
const financeGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' };
const input = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const miniLabel = { fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' };
const balanceBox = { background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2' };
const balanceText = { color: '#b91c1c', fontWeight: 'bold', fontSize: '16px' };
const promoteBtn = { width: '100%', padding: '16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' };
const sidebar = { display: 'flex', flexDirection: 'column', gap: '20px' };
const hr = { border: '0', borderTop: '1px solid #f1f5f9', margin: '15px 0' };