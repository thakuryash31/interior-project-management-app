import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Layout, Building2, MapPin, Hash, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Reference the 'projects' collection and order by newest first
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));

    // 2. Set up a real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsArr = [];
      querySnapshot.forEach((doc) => {
        projectsArr.push({ ...doc.data(), id: doc.id });
      });
      setProjects(projectsArr);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      setLoading(false);
    });

    // 3. Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin" size={40} color="#666" />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#1a1a1a' }}>Project Pipeline</h1>
        <p style={{ color: '#666' }}>Showing {projects.length} active interior design projects</p>
      </header>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '12px' }}>
          <p style={{ color: '#999' }}>No projects found. Go to the "New Project" tab to add one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map((project) => (
            <div key={project.id} style={{ 
              backgroundColor: '#fff', 
              borderRadius: '16px', 
              padding: '24px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
              border: '1px solid #eee' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#2c3e50' }}>{project.projectName}</h3>
                <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Hash size={12} /> {project.projectId}
                </span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} /> <strong>Client:</strong> {project.customerName}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> <strong>Location:</strong> {project.projectCity}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '15px', marginTop: '15px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Site Address</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#444', lineHeight: '1.4' }}>
                  {project.projectAddress || 'No address provided'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}