import React from 'react';
import { ChevronLeft, Calendar, Settings } from 'lucide-react';
import InitialDesign from './stages/InitialDesign';
import DetailDesign from './stages/DetailDesign';

export default function ProjectDetails({ project, onBack, updateProjectData }) {
  const currentStage = project.current_stage || 1;

  const handleStepUpdate = async (updates, nextSubStep = null, nextStage = null) => {
    const finalUpdates = { ...updates };
    if (nextSubStep) finalUpdates.current_sub_step = nextSubStep;
    if (nextStage) finalUpdates.current_stage = nextStage;
    await updateProjectData(project.id, finalUpdates);
  };

  return (
    <div className="details-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{padding:8}}><ChevronLeft size={20} /></button>
          <div>
            <h1 className="page-title">{project.project_name}</h1>
            <p className="page-subtitle">{project.project_city} • {project.customer_name}</p>
          </div>
        </div>
        <button className="btn btn-secondary"><Settings size={16} /> Options</button>
      </div>

      <div className="details-grid">
        <div className="main-card">
          {currentStage === 1 && <InitialDesign project={project} updateProject={handleStepUpdate} />}
          {currentStage === 2 && <DetailDesign project={project} updateProject={handleStepUpdate} />}
          {currentStage === 3 && <div style={{textAlign:'center', padding:50, color:'#737373'}}><h3>Production</h3><p>Coming Soon</p></div>}
        </div>

        <div className="info-sidebar">
            <div className="info-box">
                <span className="info-label">Project ID</span>
                <div className="info-value">{project.project_id}</div>
            </div>
            <div className="info-box">
                <span className="info-label">Created Date</span>
                <div className="info-value"><Calendar size={14} /> {new Date(project.created_at).toLocaleDateString()}</div>
            </div>
            <div className="info-box">
                <span className="info-label">Current Status</span>
                <div className="info-value">Stage {currentStage}</div>
            </div>
        </div>
      </div>
    </div>
  );
}