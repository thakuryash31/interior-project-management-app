import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { 
  Building2, MapPin, Hash, Loader2, Plus, 
  ArrowUpRight, Clock, Search, ArrowLeft, CheckCircle2 
} from 'lucide-react';
import { PROJECT_STAGES } from './workflowConfig';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Listen to Firebase Data
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

  // 2. Filter Projects based on Search
  const filteredProjects = projects.filter(p => 
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.projectId.includes(searchQuery)
  );

  // --- VIEW 1: PROJECT DETAILS (4 STAGES) ---
  if (selectedProject) {
    return (
      <div style={{ padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <button 
          onClick={() => setSelectedProject(null)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', marginBottom: '30px' }}
        >
          <ArrowLeft size={20} /> Back to All Projects
        </button>

        <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '40px' }}>
            <span style={badgeStyle}>Active Project</span>
            <h2 style={{ fontSize: '32px', margin: '10px 0', color: '#1e293b' }}>{selectedProject.projectName}</h2>
            <p style={{ color: '#64748b' }}>Client: {selectedProject.customerName} | Site: {selectedProject.projectAddress}, {selectedProject.projectCity}</p>
          </div>

          {/* --- STEPPED PROGRESS BAR --- */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '60px' }}>
            <div style={{ position: 'absolute', top: '20px', left: '5%', right: '5%', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
            
            {PROJECT_STAGES.map((stage, index) => {
              const isActive = index === 0; // Defaulting first stage as active for demo
              return (
                <div key={stage.id} style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto',
                    background: isActive ? '#2563eb' : '#fff',
                    border: '2px solid #2563eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#fff' : '#2563eb',
                    fontWeight: 'bold', boxShadow: isActive ? '0 0 0 5px #dbeafe' : 'none'
                  }}>
                    {index === 0 ? <CheckCircle2 size={20} /> : index + 1}
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '700', marginTop: '15px', color: '#1e293b' }}>{stage.name}</p>
                </div>
              );
            })}
          </div>

          {/* --- SUB-STAGES CONTENT --- */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {PROJECT_STAGES[0].subStages.map((sub, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <span style={{ fontWeight: '500', color: '#334155' }}>{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: MAIN DASHBOARD GRID ---
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="animate-spin" size={40} color="#2563eb" />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* --- HEADER & SEARCH --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Project Workspace</h1>
          <p style={{ color: '#64748b' }}>Track stages and installation progress</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
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
          <p>Create a new project to start managing your workflow.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              style={cardStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={badgeStyle}>
                  <Hash size={12} /> {project.projectId}
                </div>
                <ArrowUpRight size={20} color="#94a3b8" />
              </div>

              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1e293b' }}>{project.projectName}</h3>
              
              <div style={{ display: 'grid', gap: '8px', marginBottom: '20px' }}>
                <div style={infoRow}><Building2 size={16} color="#2563eb" /> {project.customerName}</div>
                <div style={infoRow}><MapPin size={16} color="#2563eb" /> {project.projectCity}</div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', fontSize: '13px', color: '#64748b' }}>
                <strong>Current Stage:</strong> Initial Design
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const searchStyle = {
  width: '100%',
  padding: '12px 12px 12px 40px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  outline: 'none',
  fontSize: '14px',
  boxSizing: 'border-box'
};

const cardStyle = {
  background: '#fff',
  padding: '25px',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const badgeStyle = {
  background: '#eff6ff',
  color: '#2563eb',
  padding: '5px 12px',
  borderRadius: '20px',
  fontSize: '11px',
  fontWeight: '800',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px'
};

const infoRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  color: '#475569'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '80px',
  background: '#fff',
  borderRadius: '24px',
  border: '2px dashed #e2e8f0',
  color: '#64748b'
};