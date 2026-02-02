import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import ProjectDetails from './ProjectDetails';
import { supabase } from './supabase';
import { X, Loader2 } from 'lucide-react';

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingId, setLoadingId] = useState(false);
  
  const [newProject, setNewProject] = useState({
    projectName: '',
    projectId: '', // Will be fetched from DB
    projectCity: '',
    customerName: ''
  });

  // --- LOGIC: Fetch Next Sequential ID ---
  const prepareNewProject = async () => {
    setLoadingId(true);
    setShowCreateModal(true);
    try {
      // Get the highest project_id from the database
      const { data, error } = await supabase
        .from('projects')
        .select('project_id')
        .order('project_id', { ascending: false })
        .limit(1);

      if (error) throw error;

      // If no projects exist, start at 1001. Otherwise, increment by 1.
      const lastId = data.length > 0 ? parseInt(data[0].project_id) : 1000;
      const nextId = (lastId + 1).toString();

      setNewProject(prev => ({ ...prev, projectId: nextId }));
    } catch (err) {
      console.error("Error generating ID:", err.message);
      setNewProject(prev => ({ ...prev, projectId: "Error" }));
    } finally {
      setLoadingId(false);
    }
  };

  // --- LOGIC: Save to Supabase ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          project_name: newProject.projectName,
          project_id: newProject.projectId,
          project_city: newProject.projectCity,
          customer_name: newProject.customerName,
          current_stage_index: 0,
          current_sub_step: 1, // Start at Task 1 (Floor Plan)
          completed_sub_stages: []
        }])
        .select();

      if (error) throw error;

      setShowCreateModal(false);
      // Open the new project immediately
      if (data) setSelectedProject(data[0]);
      
      // Reset form
      setNewProject({ projectName: '', projectId: '', projectCity: '', customerName: '' });
    } catch (err) {
      alert("Error creating project: " + err.message);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {!selectedProject ? (
        <Dashboard 
          onSelectProject={(proj) => setSelectedProject(proj)} 
          onCreateNew={prepareNewProject} 
        />
      ) : (
        <ProjectDetails 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3>New Project Setup</h3>
              <button onClick={() => setShowCreateModal(false)} style={closeBtn}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateProject} style={formStyle}>
              <div style={inputGroup}>
                <label style={label}>Project Name</label>
                <input 
                  required
                  style={input} 
                  placeholder="e.g. Skyline Apartment" 
                  value={newProject.projectName}
                  onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>City</label>
                <input 
                  required
                  style={input} 
                  placeholder="e.g. Bangalore" 
                  value={newProject.projectCity}
                  onChange={(e) => setNewProject({...newProject, projectCity: e.target.value})}
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Client Name</label>
                <input 
                  required
                  style={input} 
                  placeholder="Full Name" 
                  value={newProject.customerName}
                  onChange={(e) => setNewProject({...newProject, customerName: e.target.value})}
                />
              </div>

              <div style={idInfo}>
                {loadingId ? (
                  <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                    <Loader2 className="animate-spin" size={14} /> Generating ID...
                  </div>
                ) : (
                  <>Assigning Project ID: <strong>{newProject.projectId}</strong></>
                )}
              </div>

              <button type="submit" style={submitBtn} disabled={loadingId}>
                Initialize Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContent = { background: '#fff', padding: '35px', borderRadius: '24px', width: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '18px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const label = { fontSize: '13px', fontWeight: '700', color: '#475569' };
const input = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' };
const idInfo = { fontSize: '12px', color: '#2563eb', background: '#eff6ff', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px dashed #bfdbfe' };
const submitBtn = { background: '#1e293b', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s' };