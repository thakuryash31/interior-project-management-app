import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Building2, MapPin, Hash, Loader2, Plus, ArrowUpRight, Clock } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="#2563eb" />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* --- DASHBOARD HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Active Workspace</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>You have {projects.length} ongoing design projects.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
           <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16}/> Last updated: Just now</span>
        </div>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
          <div style={{ background: '#eff6ff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
            <Plus color="#2563eb" />
          </div>
          <h3 style={{ color: '#1e293b' }}>No projects found</h3>
          <p style={{ color: '#64748b' }}>Start by creating your first interior project in the "New Project" tab.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {projects.map((project) => (
            <div key={project.id} style={cardStyle}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={badgeStyle}>
                   <Hash size={12} /> {project.projectId}
                </div>
                <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <ArrowUpRight size={18} />
                </button>
              </div>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
                {project.projectName}
              </h3>

              <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                <div style={infoRow}>
                  <Building2 size={16} color="#2563eb" /> 
                  <span style={{ color: '#475569'