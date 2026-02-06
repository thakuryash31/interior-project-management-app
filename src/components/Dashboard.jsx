import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Plus, Search, LayoutDashboard, MapPin, Trash2, Loader2, Folder } from 'lucide-react';

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
        .select(`*, customers (full_name), site_location:locations!site_location_id (city, state)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedData = data.map(p => ({
        ...p,
        customer_name: p.customers?.full_name || 'Unknown',
        project_city: p.site_location?.city || 'Unknown',
        project_state: p.site_location?.state || ''
      }));
      setProjects(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getStageInfo = (stage) => {
    const s = Number(stage);
    if (s === 1) return { text: 'Initial Design', cls: 'status-1' };
    if (s === 2) return { text: 'Detail Design', cls: 'status-2' };
    if (s === 3) return { text: 'Production', cls: 'status-3' };
    return { text: 'Draft', cls: 'status-1' };
  };

  const getProgress = (p) => {
    const stage = Number(p.current_stage) || 1;
    const sub = Number(p.current_sub_step) || 1;
    const weights = { 1: 4, 2: 6, 3: 5 };
    const base = ((stage - 1) / 3) * 100;
    const inc = (sub / (weights[stage] || 5)) * (100 / 3);
    return Math.min(Math.round(base + inc), 100);
  };

  const filteredProjects = projects.filter(p => 
    p.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title"><LayoutDashboard size={22}/> Dashboard</h1>
          <p className="page-subtitle">Manage your design pipeline</p>
        </div>
        <button onClick={onCreateNew} className="btn btn-primary"><Plus size={16} /> New Project</button>
      </div>

      <div className="search-bar">
        <Search size={18} color="#737373" />
        <input className="search-input" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div style={{textAlign:'center', padding:40, color:'#737373'}}><Loader2 className="animate-spin" /> Loading...</div>
      ) : filteredProjects.length === 0 ? (
        <div style={{textAlign:'center', padding:80, color:'#737373'}}><Folder size={48} style={{opacity:0.3}}/> <p>No projects found</p></div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project) => {
            const progress = getProgress(project);
            const stageInfo = getStageInfo(project.current_stage);
            return (
              <div key={project.id} className="project-card" onClick={() => onSelectProject(project)}>
                <div className="card-header">
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <span className="id-tag">{project.project_id}</span>
                    <span className={`status-badge ${stageInfo.cls}`}>{stageInfo.text}</span>
                  </div>
                </div>
                <h3 className="card-title">{project.project_name}</h3>
                <div className="card-meta"><MapPin size={12} /> {project.project_city}</div>
                <div className="progress-wrapper">
                  <div className="progress-header"><span>Progress</span><span>{progress}%</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                </div>
                <div className="card-footer">
                  <span className="client-name">{project.customer_name}</span>
                  <span className="card-meta">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}