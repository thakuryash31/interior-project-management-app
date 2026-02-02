import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Plus, Folder, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function Dashboard({ onSelectProject, onCreateNew }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from Supabase
  useEffect(() => {
    async function fetchProjects() {
      try {
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
    fetchProjects();
  }, []);

  if (loading) return <div style={loaderStyle}>Loading your projects...</div>;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>My Projects</h1>
        <button onClick={onCreateNew} style={createBtn}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={emptyState}>
          <Folder size={48} color="#cbd5e1" />
          <p>No projects found in the new database.</p>
          <button onClick={onCreateNew} style={secondaryBtn}>Create your first project</button>
        </div>
      ) : (
        <div style={projectGrid}>
          {projects.map((project) => (
            <div key={project.id} style={projectCard} onClick={() => onSelectProject(project)}>
              <div style={cardHeader}>
                <h3 style={{margin: 0}}>{project.project_name}</h3>
                <span style={idTag}>#{project.project_id}</span>
              </div>
              <p style={locationText}><MapPin size={14} /> {project.project_city}</p>
              <div style={cardFooter}>
                <span style={dateText}>Updated: {new Date(project.last_updated).toLocaleDateString()}</span>
                <ArrowRight size={16} color="#2563eb" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const containerStyle = { padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const createBtn = { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const projectGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
const projectCard = { background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: '0.2s' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' };
const idTag = { fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' };
const locationText = { fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' };
const cardFooter = { marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #f1f5f9' };
const dateText = { fontSize: '12px', color: '#94a3b8' };
const emptyState = { textAlign: 'center', padding: '100px 0', background: '#fff', borderRadius: '20px', border: '2px dashed #e2e8f0' };
const secondaryBtn = { background: 'none', border: '1px solid #2563eb', color: '#2563eb', padding: '10px 20px', borderRadius: '8px', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold' };
const loaderStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#64748b' };