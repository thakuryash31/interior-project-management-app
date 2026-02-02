import React, { useState } from 'react';
import { db, storage } from './firebase';
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PROJECT_STAGES } from './workflowConfig';
import { 
  ArrowLeft, CheckCircle2, ClipboardList, Info, 
  Calendar, ChevronRight, Layout, Upload, Plus, X, Search, FileText, Loader2
} from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  const [activeStageIndex, setActiveStageIndex] = useState(project.currentStageIndex || 0);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(null); // Tracks which field is uploading
  const [reqSearch, setReqSearch] = useState("");

  const requirementsList = [
    "Modular furniture", "Movable Furniture", "False Ceiling", 
    "Flooring", "Electrical Work", "Plumbing work"
  ];

  // Logic: Upload File to Firebase Storage
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(fieldName);
    try {
      const storageRef = ref(storage, `projects/${project.projectId}/${fieldName}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Save the URL to Firestore
      await updateProjectField({ [fieldName]: downloadURL });
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Check Firebase Storage rules.");
    } finally {
      setUploading(null);
    }
  };

  const updateProjectField = async (data) => {
    setUpdating(true);
    try {
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, { ...data, lastUpdated: new Date() });
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  const toggleRequirement = (req) => {
    const current = project.selectedRequirements || [];
    const updated = current.includes(req) ? current.filter(r => r !== req) : [...current, req];
    updateProjectField({ selectedRequirements: updated });
  };

  return (
    <div style={{ padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={backBtnStyle}><ArrowLeft size={20} /> Dashboard</button>
        <div style={{ fontSize: '14px', color: '#64748b' }}>Project: <span style={{fontWeight: '700', color: '#1e293b'}}>{project.projectName}</span></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
        <div style={mainCardStyle}>
          {/* Stage Tracker */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            {PROJECT_STAGES.map((stage, index) => (
              <div key={stage.id} onClick={() => setActiveStageIndex(index)} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', opacity: activeStageIndex === index ? 1 : 0.4 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: index <= (project.currentStageIndex || 0) ? '#2563eb' : '#e2e8f0', margin: '0 auto', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{index + 1}</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '8px', color: '#1e293b' }}>{stage.name}</div>
              </div>
            ))}
          </div>

          {activeStageIndex === 0 ? (
            <div style={{ display: 'grid', gap: '25px' }}>
              
              {/* 1. Floor Plan Upload */}
              <div style={taskRowStyle}>
                <div>
                  <h4 style={taskTitleStyle}>1. Floor Plan</h4>
                  <p style={taskDescStyle}>Measurement drawing upload.</p>
                  {project.floorPlanUrl && (
                    <a href={project.floorPlanUrl} target="_blank" rel="noreferrer" style={fileLinkStyle}>
                      <FileText size={14} /> View Current Plan
                    </a>
                  )}
                </div>
                <label style={uploadBtnStyle}>
                  {uploading === 'floorPlanUrl' ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  {project.floorPlanUrl ? 'Change Plan' : 'Upload'}
                  <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'floorPlanUrl')} />
                </label>
              </div>

              {/* 2. Requirement Gathering */}
              <div style={taskRowStyle}>
                <div style={{ width: '100%' }}>
                  <h4 style={taskTitleStyle}>2. Customer Requirement Gathering</h4>
                  <textarea 
                    placeholder="Type notes here..."
                    style={textAreaStyle}
                    defaultValue={project.customerNotes || ""}
                    onBlur={(e) => updateProjectField({ customerNotes: e.target.value })}
                  />
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ position: 'relative', marginBottom: '10px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                      <input placeholder="Search services..." style={searchInputStyle} onChange={(e) => setReqSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {requirementsList.filter(r => r.toLowerCase().includes(reqSearch.toLowerCase())).map(req => (
                        <button key={req} onClick={() => toggleRequirement(req)} style={project.selectedRequirements?.includes(req) ? tagStyleActive : tagStyle}>
                          {req} {project.selectedRequirements?.includes(req) ? <X size={12}/> : <Plus size={12}/>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Quotation Section */}
              <div style={taskRowStyle}>
                <div style={{ width: '100%' }}>
                  <h4 style={taskTitleStyle}>3. Quotation & Payments</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <div>
                      <label style={miniLabel}>Total Quote (₹)</label>
                      <input type="number" style={miniInput} onBlur={(e) => updateProjectField({ totalQuote: Number(e.target.value) })} defaultValue={project.totalQuote} />
                    </div>
                    <div>
                      <label style={miniLabel}>Initial Paid (₹)</label>
                      <input type="number" style={miniInput} onBlur={(e) => updateProjectField({ initialPaid: Number(e.target.value) })} defaultValue={project.initialPaid} />
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
                      <label style={miniLabel}>Balance</label>
                      <div style={{ fontWeight: 'bold', color: '#ef4444' }}>₹ {(project.totalQuote || 0) - (project.initialPaid || 0)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <label style={uploadBtnStyle}>
                      {uploading === 'quoteUrl' ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                      Upload Quote PDF
                      <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'quoteUrl')} />
                    </label>
                    {project.quoteUrl && (
                      <a href={project.quoteUrl} target="_blank" rel="noreferrer" style={fileLinkStyle}>View Quote</a>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={() => updateProjectField({ currentStageIndex: 1 })} style={promoteBtnStyle}>
                Complete Initial Phase <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Phase Content Loading...</div>
          )}
        </div>

        <div style={mainCardStyle}>
           <h4 style={taskTitleStyle}>Site Details</h4>
           <p style={{fontSize: '14px', color: '#475569'}}>{project.projectAddress}</p>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const mainCardStyle = { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: 'fit-content' };
const taskRowStyle = { padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const backBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' };
const taskTitleStyle = { margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: '700' };
const taskDescStyle = { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' };
const uploadBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#fff' };
const fileLinkStyle = { display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px', fontSize: '12px', color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' };
const textAreaStyle = { width: '100%', marginTop: '10px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', fontFamily: 'inherit' };
const searchInputStyle = { width: '100%', padding: '8px 8px 8px 35px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' };
const tagStyle = { display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' };
const tagStyleActive = { ...tagStyle, background: '#2563eb', color: '#fff', border: '1px solid #2563eb' };
const miniLabel = { fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' };
const miniInput = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '5px' };
const promoteBtnStyle = { width: '100%', padding: '15px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' };