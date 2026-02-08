import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { usePermission } from '../hooks/usePermission'; // <--- Import Permission Hook
import { 
  Plus, Search, LayoutDashboard, MapPin, 
  Loader2, Folder, Trash2, AlertCircle 
} from 'lucide-react';

export default function Dashboard({ onSelectProject, onCreateNew }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { can } = usePermission(); // <--- Check Permissions

  useEffect(() => {
    // fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      // Fetch projects (RLS policies will automatically filter by Organization)
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customers (full_name),
          site_location:locations!site_location_id (city, state)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map(p => ({
        ...p,
        customer_name: p.customers?.full_name || 'Unknown Client',
        project_city: p.site_location?.city || '',
        project_state: p.site_location?.state || ''
      }));
      setProjects(formattedData);
    } catch (err) {
      console.error("Dashboard Error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- DELETE FUNCTION ---
  const handleDelete = async (e, projectId) => {
    e.stopPropagation(); // Stop card click event
    
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      
      // Remove from UI immediately
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  // --- HELPERS ---
  const getStageInfo = (stage) => {
    const s = Number(stage);
    if (s === 1) return { text: 'Initial Design', cls: 'status-1' };
    if (s === 2) return { text: 'Detail Design', cls: 'status-2' };
    if (s === 3) return { text: 'Production', cls: 'status-3' };
    if (s === 4) return { text: 'Installation', cls: 'status-2' };
    if (s === 5) return { text: 'Completed', cls: 'status-3' };
    return { text: 'Draft', cls: 'status-1' };
  };

  const getProgress = (p) => {
    const stage = Number(p.current_stage) || 1;
    const sub = Number(p.current_sub_step) || 1;
    // Stage 1 (3 steps), Stage 2 (4 steps), Stage 3 (9 steps), Stage 4 (12 steps)
    const weights = { 1: 3, 2: 4, 3: 9, 4: 12 }; 
    const totalStages = 4;
    
    if (stage >= 5) return 100;

    const base = ((stage - 1) / totalStages) * 100;
    const stageWeight = weights[stage] || 5;
    const inc = (sub / stageWeight) * (100 / totalStages);
    return Math.min(Math.round(base + inc), 99);
  };

  const filteredProjects = projects.filter(p => 
    (p.project_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title"><LayoutDashboard size={26} style={{color: 'var(--primary)'}}/> Dashboard</h1>
          <p className="page-subtitle">Manage your design pipeline</p>
        </div>
        {/* Only allow Create if permission exists */}
        {can('create_projects') && (
          <button onClick={onCreateNew} className="btn btn-primary"><Plus size={16} /> New Project</button>
        )}
      </div>

      {/* SEARCH */}
      <div className="search-bar">
        <Search size={18} color="var(--text-secondary)" />
        <input 
          className="search-input" 
          placeholder="Search projects by name or client..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      {/* LIST */}
      {loading ? (
        <div style={{textAlign:'center', padding:60, color:'var(--text-secondary)'}}>
           <Loader2 className="animate-spin" size={32} style={{marginBottom:10}}/> 
           <div>Loading Projects...</div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{textAlign:'center', padding:80, color:'var(--text-secondary)', border:'2px dashed var(--border)', borderRadius:12}}>
           <Folder size={48} style={{opacity:0.3, marginBottom:10}}/> 
           <p>No projects found.</p>
        </div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project) => {
            const progress = getProgress(project);
            const stageInfo = getStageInfo(project.current_stage);
            
            return (
              <div key={project.id} className="project-card" onClick={() => onSelectProject(project)}>
                <div className="card-header">
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <span className="id-tag">{project.project_id || 'ID'}</span>
                    <span className={`status-badge ${stageInfo.cls}`}>{stageInfo.text}</span>
                  </div>
                  
                  {/* DELETE BUTTON (Protected) */}
                  {can('delete_projects') && (
                    <button 
                      className="btn-ghost" 
                      style={{padding:4, color:'#ef4444'}}
                      onClick={(e) => handleDelete(e, project.id)}
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <h3 className="card-title">{project.project_name || 'Untitled Project'}</h3>
                <div className="card-meta"><MapPin size={12} /> {project.project_city}</div>

                <div className="progress-wrapper">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="card-footer">
                  <span className="client-name">{project.customer_name}</span>
                  <span className="card-meta">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}