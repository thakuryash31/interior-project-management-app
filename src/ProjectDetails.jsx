import React, { useState } from 'react';
import { supabase } from './supabase';
import { PROJECT_STAGES } from './workflowConfig';
import { ArrowLeft, Upload, CheckCircle2, Lock, FileText, IndianRupee } from 'lucide-react';

export default function ProjectDetails({ project, onBack }) {
  const [updating, setUpdating] = useState(false);
  const currentSubStep = project.current_sub_step || 1;

  // --- Financial Calculations ---
  const totalQuote = project.total_quote || 0;
  const bookingTarget = totalQuote * 0.10; // 10% Auto-calculated
  const actualPaid = project.initial_paid || 0;
  const bookingBalance = bookingTarget - actualPaid > 0 ? bookingTarget - actualPaid : 0;
  const finalBalance = totalQuote - actualPaid;

  const updateAndAdvance = async (data, nextStep) => {
    setUpdating(true);
    const updateData = { ...data };
    if (nextStep) updateData.current_sub_step = nextStep;
    
    try {
      const { error } = await supabase.from('projects').update(updateData).eq('id', project.id);
      if (error) throw error;
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={18} /> Dashboard / {project.project_id}</button>
      
      <div style={cardStyle}>
        <h2>{project.project_name}</h2>
        <p style={subtitle}>Phase 1: Initial Design Stage</p>

        {/* TASK 1: FLOOR PLAN */}
        <div style={taskBox(currentSubStep >= 1, currentSubStep === 1)}>
          <div style={taskHeader}>
            <h4>1. Upload Floor Plan</h4>
            {currentSubStep > 1 && <CheckCircle2 color="#22c55e" />}
          </div>
          {currentSubStep === 1 ? (
            <label style={uploadBtn}>
              <Upload size={16} /> Select Floor Plan
              <input type="file" hidden onChange={(e) => {/* Handle upload then updateAndAdvance({}, 2) */}} />
            </label>
          ) : <p style={doneText}>{project.floor_plan_url ? "File Uploaded" : "Skipped"}</p>}
        </div>

        {/* TASK 2: REQUIREMENTS & SCOPE */}
        <div style={taskBox(currentSubStep >= 2, currentSubStep === 2)}>
          <div style={taskHeader}>
            <h4>2. Need Gathering & Scope</h4>
            {currentSubStep < 2 ? <Lock size={16} color="#94a3b8" /> : currentSubStep > 2 ? <CheckCircle2 color="#22c55e" /> : null}
          </div>
          {currentSubStep === 2 && (
            <div>
              <textarea style={input} placeholder="Describe customer needs..." onBlur={(e) => updateAndAdvance({customer_notes: e.target.value})} />
              <div style={tagGrid}>
                {["Modular Furniture", "False Ceiling", "Flooring", "Paint", "Electrical"].map(item => (
                   <button key={item} style={tagStyle}>{item}</button>
                ))}
              </div>
              <button style={nextBtn} onClick={() => updateAndAdvance({}, 3)}>Complete Scope</button>
            </div>
          )}
        </div>

        {/* TASK 3: QUOTATION UPLOAD */}
        <div style={taskBox(currentSubStep >= 3, currentSubStep === 3)}>
          <div style={taskHeader}>
            <h4>3. Upload Quotation</h4>
            {currentSubStep < 3 ? <Lock size={16} color="#94a3b8" /> : null}
          </div>
          {currentSubStep === 3 && (
            <label style={uploadBtn}>
               <Upload size={16} /> Upload Quote PDF
               <input type="file" hidden onChange={() => updateAndAdvance({quote_url: '...'}, 4)} />
            </label>
          )}
        </div>

        {/* TASK 4: FINAL VALUES & BOOKING */}
        <div style={taskBox(currentSubStep >= 4, currentSubStep === 4)}>
          <div style={taskHeader}>
            <h4>4. Payment & Booking Summary</h4>
            {currentSubStep < 4 ? <Lock size={16} color="#94a3b8" /> : null}
          </div>
          {currentSubStep === 4 && (
            <div style={financeGrid}>
              <div style={valBox}>
                <label>Total Quote</label>
                <input type="number" style={input} defaultValue={totalQuote} onBlur={(e) => updateAndAdvance({total_quote: Number(e.target.value)})} />
              </div>
              <div style={valBox}>
                <label>Booking Amount (10%)</label>
                <div style={autoVal}>₹ {bookingTarget.toLocaleString()}</div>
              </div>
              <div style={valBox}>
                <label>Actual Customer Paid</label>
                <input type="number" style={input} defaultValue={actualPaid} onBlur={(e) => updateAndAdvance({initial_paid: Number(e.target.value)})} />
              </div>
              <div style={valBox}>
                <label>Booking Balance</label>
                <div style={autoVal}>₹ {bookingBalance.toLocaleString()}</div>
              </div>
              <div style={totalBox}>
                <label>Final Balance Due</label>
                <div style={{fontSize: '20px', fontWeight: '800'}}>₹ {finalBalance.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: '40px 10%', background: '#f8fafc', minHeight: '100vh' };
const backBtn = { border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' };
const cardStyle = { background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0' };
const subtitle = { color: '#64748b', marginBottom: '30px', fontSize: '14px' };
const taskBox = (unlocked, active) => ({
  padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px',
  background: active ? '#fff' : unlocked ? '#f8fafc' : '#f1f5f9',
  opacity: unlocked ? 1 : 0.5,
  boxShadow: active ? '0 10px 15px -3px rgba(37, 99, 235, 0.1)' : 'none',
  borderLeft: active ? '6px solid #2563eb' : '1px solid #e2e8f0'
});
const taskHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' };
const input = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px' };
const uploadBtn = { background: '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: '8px', display: 'inline-flex', gap: '10px', cursor: 'pointer', marginTop: '10px', fontSize: '14px' };
const financeGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' };
const valBox = { background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' };
const autoVal = { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' };
const totalBox = { gridColumn: 'span 2', background: '#1e293b', color: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center' };
const nextBtn = { width: '100%', marginTop: '20px', padding: '12px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const tagGrid = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' };
const tagStyle = { padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '12px' };
const doneText = { fontSize: '13px', color: '#22c55e', fontWeight: 'bold' };