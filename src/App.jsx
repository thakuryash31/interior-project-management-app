import React, { useState } from 'react';
import Dashboard from './Dashboard';
import ProjectDetails from './ProjectDetails';
import { supabase } from './supabase';
import { Plus, X } from 'lucide-react';

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    projectName: '',
    projectId: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
    projectCity: '',
    customerName: ''
  });

  // --- LOGIC: Save New Project to Supabase ---
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
          current_stage_index: 0
        }])
        .select();

      if (error) throw error;

      // Close modal and refresh (Dashboard will re-fetch via its useEffect)
      setShowCreateModal(false);
      setNewProject({
        projectName: '',
        projectId: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        projectCity: '',
        customerName: ''
      });
      
      // Optional: Automatically open the newly created project
      if (data) setSelectedProject(data[0]);
    } catch (err) {
      alert("Error creating project: " + err.message);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Navigation Logic */}
      {!selectedProject ? (
        <Dashboard 
          onSelectProject={(proj) => setSelectedProject(proj)} 
          onCreateNew={() => setShowCreateModal(true)} 
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
              <h3>Create New Project</h3>
              <button onClick={() => setShowCreateModal(false)} style={closeBtn}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateProject} style={formStyle}>
              <div style={inputGroup}>
                <label style={label}>Project Name</label>
                <input 
                  required
                  style={input} 
                  placeholder="e.g. Sharma Residence" 
                  value={newProject.projectName}
                  onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Project City</label>
                <input 
                  required
                  style={input} 
                  placeholder="e.g. Mumbai" 
                  value={newProject.projectCity}
                  onChange={(e) => setNewProject({...newProject, projectCity: e.target.value})}
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Customer Name</label>
                <input 
                  required
                  style={input} 
                  placeholder="Full Name" 
                  value={newProject.customerName}
                  onChange={(e) => setNewProject({...newProject, customerName: e.target.value})}
                />
              </div>

              <div style={idInfo}>
                Project ID will be generated: <strong>{newProject.projectId}</strong>
              </div>

              <button type="submit" style={submitBtn}>Create Project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: '30px', borderRadius: '20px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const label = { fontSize: '12px', fontWeight: 'bold', color: '#64748b' };
const input = { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' };
const idInfo = { fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' };
const submitBtn = { background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };