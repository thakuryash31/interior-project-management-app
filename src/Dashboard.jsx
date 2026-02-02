import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Plus, Folder, MapPin, Trash2, Loader2, Search } from 'lucide-react';

export default function Dashboard({ onSelectProject, onCreateNew }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- RESET DATABASE LOGIC ---
  const handleResetDatabase = async () => {
    const confirmReset = window.confirm("⚠️ DANGER: This will delete ALL projects and reset your ID sequence. Are you sure?");
    if (!confirmReset) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('projects').delete().neq('id', 0); // Deletes all rows
      if (error) throw error;
      
      setProjects([]);
      alert("Database reset successfully. Your next project ID will start fresh.");
    } catch (err) {
      alert("Error resetting: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.project_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{margin:0, color:'#1e293b'}}>Project Registry</h1>
          <p style={{color:'#64748b', fontSize:'14px'}}>Manage your interior design workflows</p>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <button onClick={handleResetDatabase} style={resetBtn} title="Reset All Data">
            <Trash2 size={18} />
          </button>
          <button onClick={onCreateNew} style={createBtn}>
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      <div style={searchBar}>
        <Search size={18} color="#94a3b8" />
        <input 
          style={searchInput} 
          placeholder="Search by ID or Name..." 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={loaderBox}><Loader2 className="animate-spin" /> Fetching projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div style={emptyState}>
          <Folder size={48} color="#cbd5e1" />
          <p>No projects found. Create one to get started.</p>
        </div>
      ) : (
        <div style={projectGrid}>
          {filteredProjects.map((project) => (
            <div key={project.id} style={projectCard} onClick={() => onSelectProject(project)}>
              <div style={cardHeader}>
                <span style={idTag}>{project.project_id}</span>
                <div style={statusDot} />
              </div>
              <h3 style={projName}>{project.project_name}</h3>
              <div style={metaInfo}>
                <MapPin size={12} /> {project.project_city}, {project.project_state}
              </div>
              <div style={cardFooter}>
                <span style={clientName}>{project.customer_name}</span>
                <span style={dateText}>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const createBtn = { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const resetBtn = { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer' };
const searchBar = { background: '#fff', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' };
const searchInput = { border: 'none', outline: 'none', width: '100%', fontSize: '14px' };
const projectGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
const projectCard = { background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: '0.2s transform', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const idTag = { fontSize: '11px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '6px' };
const statusDot = { width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' };
const projName = { margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' };
const metaInfo = { fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' };
const cardFooter = { marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const clientName = { fontSize: '12px', fontWeight: 'bold', color: '#475569' };
const dateText = { fontSize: '11px', color: '#94a3b8' };
const emptyState = { textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '24px', border: '2px dashed #e2e8f0' };
const loaderBox = { textAlign: 'center', padding: '50px', color: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' };