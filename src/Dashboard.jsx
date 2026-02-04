import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Plus, Folder, MapPin, Trash2, Loader2, Search, LayoutDashboard } from 'lucide-react';

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
      // Fetching all projects since RLS is disabled
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Reset Logic (Wipes table for testing) ---
  const handleResetDatabase = async () => {
    const confirmReset = window.confirm("⚠️ DEV ACTION: Delete ALL projects in the database?");
    if (!confirmReset) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('projects').delete().neq('id', 0);
      if (error) throw error;
      setProjects([]);
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
      {/* HEADER SECTION */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            <LayoutDashboard size={28} color="#2563eb" />
            Main Dashboard
          </h1>
          <p style={subtitleStyle}>Overview of all active interior design projects</p>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <button onClick={handleResetDatabase} style={resetBtn} title="Clear Database">
            <Trash2 size={18} />
          </button>
          <button onClick={onCreateNew} style={createBtn}>
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div style={searchBar}>
        <Search size={18} color="#94a3b8" />
        <input 
          style={searchInput} 
          placeholder="Search by Project ID or Client Name..." 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* PROJECTS GRID */}
      {loading ? (
        <div style={loaderBox}>
          <Loader2 className="animate-spin" />
          <span>Synchronizing with database...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={emptyState}>
          <Folder size={48} color="#cbd5e1" />
          <p>No projects found. Click "New Project" to create your first workflow.</p>
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
                <MapPin size={12} /> {project.project_city || 'Not Specified'}
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
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const titleStyle = { margin:0, color:'#1e293b', display:'flex', alignItems:'center', gap:'12px', fontSize: '28px', fontWeight: '800' };
const subtitleStyle = { color:'#64748b', fontSize:'14px', marginTop:'4px' };
const createBtn = { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const resetBtn = { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer' };
const searchBar = { background: '#fff', padding: '14px 20px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const searchInput = { border: 'none', outline: 'none', width: '100%', fontSize: '15px' };
const projectGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' };
const projectCard = { background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const idTag = { fontSize: '11px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '5px 12px', borderRadius: '8px', border: '1px solid #dbeafe' };
const statusDot = { width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' };
const projName = { margin: '0 0 10px 0', fontSize: '20px', color: '#1e293b', fontWeight: '700' };
const metaInfo = { fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' };
const cardFooter = { marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const clientName = { fontSize: '13px', fontWeight: '600', color: '#475569' };
const dateText = { fontSize: '12px', color: '#94a3b8' };
const emptyState = { textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '30px', border: '2px dashed #e2e8f0', color: '#94a3b8' };
const loaderBox = { textAlign: 'center', padding: '100px', color: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' };