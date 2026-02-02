import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { 
  Building2, MapPin, Hash, Loader2, Plus, 
  ArrowUpRight, Clock, Search, ArrowLeft 
} from 'lucide-react';
import ProjectDetails from './ProjectDetails';
import { PROJECT_STAGES } from './workflowConfig';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null); // Store ID instead of Object
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Real-time listener for the entire projects collection
  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsArr = [];
      querySnapshot.forEach((doc) => {
        projectsArr.push({ ...doc.data(), id: doc.id });
      });
      setProjects(projectsArr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Find the latest version of the selected project from the projects array
  const currentProject = projects.find(p => p.id === selectedProjectId);

  // 3. Filter Projects for the Grid
  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.projectId.includes(searchQuery)
  );

  // --- VIEW 1: PROJECT DETAILS ---
  if (currentProject) {
    return (
      <ProjectDetails 
        project={currentProject} 
        onBack={() => setSelectedProjectId(null)} 
      />
    );
  }

  // --- VIEW 2: MAIN GRID ---
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="animate-spin" size={40} color="#2563eb" />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Project Workspace</h1>
          <p style={{ color: '#64748b' }}>Manage your interior design pipeline</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={18} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchStyle}
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div style={emptyStateStyle}>
          <Plus size={40} color="#2563eb" />
          <h3>No projects found</h3>
          <p>Create a new project to start tracking stages.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredProjects.map((project) => {
            const stageIndex = project.currentStageIndex || 0;
            const stageName = PROJECT_STAGES[stageIndex]?.name || "Initial Stage";

            return (
              <div 
                key={project.id} 
                onClick={() => setSelectedProjectId(project.id)}
                style={cardStyle}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={badgeStyle}>
                    <Hash size={12} /> {project.projectId}
                  </div>
                  <div style={{ ...badgeStyle, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                    {project.progress || 0}% Done
                  </div>
                </div>

                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1e293b' }}>{project.projectName}</h3>
                
                <div style={{ display: 'grid', gap: '8px', marginBottom: '20px' }}>
                  <div style={infoRow}><Building2 size={16} color="#2563eb" /> {project.customerName}</div>
                  <div style={infoRow}><MapPin size={16} color="#2563eb" /> {project.projectCity}</div>
                </div>

                <div style={stageIndicator}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '5px' }}>CURRENT PHASE</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>{stageName}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const searchStyle = {
  width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
  border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px'
};

const cardStyle = {
  background: '#fff', padding: '25px', borderRadius: '20px',
  border: '1px solid #e2e8f0', cursor: 'pointer', transition: '0.2s',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const badgeStyle = {
  background: '#eff6ff', color: '#2563eb', padding: '5px 12px',
  borderRadius: '20px', fontSize: '11px', fontWeight: '800',
  display: 'inline-flex', alignItems: 'center', gap: '5px'
};

const infoRow = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' };

const stageIndicator = {
  marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f5f9'
};

const emptyStateStyle = {
  textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '24px',
  border: '2px dashed #e2e8f0', color: '#64748b'
};