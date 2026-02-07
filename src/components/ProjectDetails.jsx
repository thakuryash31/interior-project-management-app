import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ChevronLeft, Calendar, Settings, Loader2, AlertCircle } from 'lucide-react';

import InitialDesign from './stages/InitialDesign';
import DetailDesign from './stages/DetailDesign';
import Production from './stages/Production';
import Installation from './stages/Installation'; 

export default function ProjectDetails({ project, onBack, updateProjectData }) {
  const [stageData, setStageData] = useState({});
  const [loadingStage, setLoadingStage] = useState(false);
  const [error, setError] = useState(null);

  // 1. Safety Check
  if (!project) return null;

  const currentStage = project.current_stage || 1;

  // 2. Table Mapping
  const getTableName = (stage) => {
    if (stage === 1) return 'stage_1_initial';
    if (stage === 2) return 'stage_2_detail';
    if (stage === 3) return 'stage_3_production';
    if (stage === 4) return 'stage_4_installation';
    return null;
  };

  // 3. Fetch Data on Load
  useEffect(() => {
    const fetchStageData = async () => {
      setLoadingStage(true);
      setError(null);
      const tableName = getTableName(currentStage);
      
      if (!tableName) {
        setLoadingStage(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('project_id', project.id)
          .maybeSingle(); 

        if (error) throw error;
        setStageData(data || {});
      } catch (err) {
        console.error("Stage Fetch Error:", err);
        setError("Could not load stage data.");
      } finally {
        setLoadingStage(false);
      }
    };

    fetchStageData();
  }, [project.id, currentStage]);

  // 4. THE FIX IS HERE (handleStageUpdate)
  const handleStageUpdate = async (updates, nextSubStep = null, nextStage = null) => {
    const tableName = getTableName(currentStage);
    if (!tableName) return;

    try {
      // ✅ CRITICAL FIX: The second argument { onConflict: 'project_id' } 
      // tells Supabase to UPDATE if the row exists, instead of failing.
      const { error: stageError } = await supabase
        .from(tableName)
        .upsert(
          { project_id: project.id, ...stageData, ...updates },
          { onConflict: 'project_id' } 
        );

      if (stageError) throw stageError;

      // Update local state instantly
      setStageData(prev => ({ ...prev, ...updates }));

      // Handle Step/Stage Transitions
      if (nextSubStep || nextStage) {
        const mainUpdates = {};
        if (nextSubStep) mainUpdates.current_sub_step = nextSubStep;
        if (nextStage) mainUpdates.current_stage = nextStage;
        
        // Reset sub-step if moving to a completely new stage
        if (nextStage && nextStage !== currentStage) {
             mainUpdates.current_sub_step = 1; 
        }

        await updateProjectData(project.id, mainUpdates);
      }

    } catch (err) {
      console.error("Save Error:", err);
      alert("Save failed: " + err.message);
    }
  };

  const mergedProjectData = { ...project, ...stageData };

  return (
    <div className="details-container">
      {/* HEADER */}
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
        {/* MAIN CONTENT CARD */}
        <div className="main-card">
          {loadingStage ? (
            <div style={{textAlign:'center', padding:50, color:'#94a3b8'}}>
              <Loader2 className="animate-spin" /> Loading...
            </div>
          ) : error ? (
            <div style={{color: 'red', padding: 20}}>
               <AlertCircle /> {error}
            </div>
          ) : (
            <>
              {currentStage === 1 && <InitialDesign project={mergedProjectData} updateProject={handleStageUpdate} />}
              {currentStage === 2 && <DetailDesign project={mergedProjectData} updateProject={handleStageUpdate} />}
              {currentStage === 3 && <Production project={mergedProjectData} updateProject={handleStageUpdate} />}
              {currentStage === 4 && <Installation project={mergedProjectData} updateProject={handleStageUpdate} />}
              
              {currentStage === 5 && (
                <div style={{textAlign:'center', padding:60}}>
                  <div style={{fontSize:40, marginBottom:20}}>🎉</div>
                  <h2 style={{color: 'var(--text-main)'}}>Project Completed!</h2>
                  <p style={{color: 'var(--text-secondary)'}}>This project has been successfully handed over.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* INFO SIDEBAR */}
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
                <div className="info-value" style={{color: 'var(--primary)'}}>
                  {currentStage === 5 ? 'Completed' : `Stage ${currentStage}`}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}