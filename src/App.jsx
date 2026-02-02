import React, { useState } from 'react';
import Dashboard from './Dashboard';
import ProjectDetails from './ProjectDetails';
import { supabase } from './supabase';
import { X, Loader2 } from 'lucide-react';

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newProject, setNewProject] = useState({
    projectName: '',
    projectCity: '',
    customerName: ''
  });

  // --- LOGIC: Generate Custom Sequential ID ---
  const generateCustomID = async (city) => {
    try {
      // 1. Get the 3-letter prefix (e.g., MUMBAI -> MUM)
      const prefix = city.substring(0, 3).toUpperCase();

      // 2. Find the highest number used so far across ALL cities
      const { data } = await supabase
        .from('projects')
        .select('project_id')
        .order('created_at', { ascending: false })
        .limit(1);

      let nextNum;
      if (data && data.length > 0) {
        // Extract the number part from "MUM-1000000001"
        const lastFullId = data[0].project_id;
        const lastNum = parseInt(lastFullId.split('-')[1]);
        nextNum = lastNum + 1;
      } else {
        // First ever project starts at 10-digit baseline
        nextNum = 1000000001; 
      }

      return `${prefix}-${nextNum}`;
    } catch (err) {
      return `ERR-${Date.now()}`;
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const customId = await generateCustomID(newProject.projectCity);

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          project_name: newProject.projectName,
          project_id: customId, // e.g., "MUM-1000000001"
          project_city: newProject.projectCity,
          customer_name: newProject.customerName,
          current_stage_index: 0,
          current_sub_step: 1
        }])
        .select();

      if (error) throw error;

      setShowCreateModal(false);
      if (data) setSelectedProject(data[0]);
      setNewProject({ projectName: '', projectCity: '', customerName: '' });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
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

      {showCreateModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3>Reset & Start New Project</h3>
              <button onClick={() => setShowCreateModal(false)} style={closeBtn}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateProject} style={formStyle}>
              <div style={inputGroup}>
                <label style={label}>City Name (for ID Prefix)</label>
                <input 
                  required
                  style={input} 
                  placeholder="e.g. Mumbai" 
                  value={newProject.projectCity}
                  onChange={(e) => setNewProject({...newProject, projectCity: e.target.value})}
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Project Name</label>
                <input 
                  required
                  style={input} 
                  value={newProject.projectName}
                  onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Customer Name</label>
                <input 
                  required
                  style={input} 
                  value={newProject.customerName}
                  onChange={(e) => setNewProject({...newProject, customerName: e.target.value})}
                />
              </div>

              <button type="submit" style={submitBtn} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Create & Open Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: '35px', borderRadius: '24px', width: '400px' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const label = { fontSize: '12px', fontWeight: 'bold', color: '#64748b' };
const input = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' };
const submitBtn = { background: '#1e293b', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display:'flex', justifyContent:'center' };