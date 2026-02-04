import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Dashboard from './Dashboard';
import ProjectDetails from './ProjectDetails';
import { X, MapPin, User, Globe, Loader2, HardDrive } from 'lucide-react';

// --- CONSTANTS ---
const INDIAN_STATES = ["Maharashtra", "Karnataka", "Delhi", "Gujarat", "Tamil Nadu", "Telangana", "West Bengal", "Other"];
const COUNTRIES = ["India", "UAE", "USA", "UK", "Singapore"];
const POPULAR_CITIES = ["Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Surat", "Jaipur", "Lucknow", "Other"];

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    projectName: '', customerName: '', customerEmail: '', customerPhone: '',
    billingAddress: '', billingCity: 'Mumbai', billingState: 'Maharashtra', billingPincode: '', billingCountry: 'India',
    projectCity: 'Mumbai', projectState: 'Maharashtra', projectPincode: '', projectCountry: 'India'
  });

  // --- LOGIC: Create Project with Sequential ID ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prefix = (form.projectCity || "PRJ").substring(0, 3).toUpperCase();
      
      // Get the last ID to increment
      const { data: lastProjects } = await supabase
        .from('projects')
        .select('project_id')
        .order('created_at', { ascending: false })
        .limit(1);

      let nextNum = 1000000001;
      if (lastProjects && lastProjects.length > 0) {
        const lastFullId = lastProjects[0].project_id;
        if (lastFullId.includes('-')) {
          nextNum = parseInt(lastFullId.split('-')[1]) + 1;
        }
      }
      const customId = `${prefix}-${nextNum}`;

      const { data, error } = await supabase.from('projects').insert([{
        project_id: customId,
        project_name: form.projectName,
        customer_name: form.customerName,
        customer_email: form.customerEmail,
        customer_phone: form.customerPhone,
        billing_address: form.billingAddress,
        billing_city: form.billingCity,
        billing_state: form.billingState,
        billing_pincode: form.billingPincode,
        billing_country: form.billingCountry,
        project_city: form.projectCity,
        project_state: form.projectState,
        project_pincode: form.projectPincode,
        project_country: form.projectCountry,
        current_sub_step: 1
        // Removed user_id requirement for now
      }]).select();

      if (error) throw error;
      setShowCreateModal(false);
      if (data) setSelectedProject(data[0]);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* HEADER BAR */}
      <nav style={navStyle}>
        <div style={{fontWeight:'900', fontSize:'20px', color:'#1e293b'}}>ProjectFlow <span style={devTag}>DEV MODE</span></div>
      </nav>

      {!selectedProject ? (
        <Dashboard 
          onSelectProject={(proj) => setSelectedProject(proj)} 
          onCreateNew={() => setShowCreateModal(true)} 
        />
      ) : (
        <ProjectDetails 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h2 style={{margin:0, fontSize:'18px'}}>Create New Project</h2>
              <button onClick={() => setShowCreateModal(false)} style={closeBtn}><X /></button>
            </div>

            <form onSubmit={handleCreateProject} style={formBody}>
              <div style={sectionLabel}><User size={14}/> Client Information</div>
              <div style={grid2}>
                <input required placeholder="Project Name" style={input} onChange={e => setForm({...form, projectName: e.target.value})} />
                <input required placeholder="Customer Name" style={input} onChange={e => setForm({...form, customerName: e.target.value})} />
                <input required type="email" placeholder="Email Address" style={input} onChange={e => setForm({...form, customerEmail: e.target.value})} />
                <input required type="tel" placeholder="Phone Number" style={input} onChange={e => setForm({...form, customerPhone: e.target.value})} />
              </div>

              <div style={sectionLabel}><Globe size={14}/> Billing Address</div>
              <input required placeholder="Address Line" style={input} onChange={e => setForm({...form, billingAddress: e.target.value})} />
              <div style={grid2}>
                <select style={input} value={form.billingCity} onChange={e => setForm({...form, billingCity: e.target.value})}>
                  {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select style={input} value={form.billingState} onChange={e => setForm({...form, billingState: e.target.value})}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input required placeholder="Pincode" style={input} onChange={e => setForm({...form, billingPincode: e.target.value})} />
              </div>

              <div style={sectionLabel}><MapPin size={14}/> Project Site Address</div>
              <div style={grid2}>
                <select style={input} value={form.projectCity} onChange={e => setForm({...form, projectCity: e.target.value})}>
                  {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select style={input} value={form.projectState} onChange={e => setForm({...form, projectState: e.target.value})}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input required placeholder="Site Pincode" style={input} onChange={e => setForm({...form, projectPincode: e.target.value})} />
              </div>

              <button type="submit" style={submitBtn} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20}/> : "Initialize Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const navStyle = { padding: '15px 5%', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' };
const devTag = { fontSize: '10px', background: '#fefce8', color: '#854d0e', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px', border: '1px solid #fef08a' };
const modalOverlay = { position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(15, 23, 42, 0.7)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 };
const modalContent = { background:'#fff', width:'550px', maxHeight:'85vh', borderRadius:'20px', display:'flex', flexDirection:'column', overflow:'hidden' };
const modalHeader = { padding:'20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' };
const formBody = { padding:'20px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px' };
const sectionLabel = { fontSize:'10px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginTop:'10px', display:'flex', alignItems:'center', gap:'5px' };
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' };
const input = { padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'13px', outline:'none' };
const submitBtn = { padding:'16px', background:'#1e293b', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', marginTop:'15px', display:'flex', justifyContent:'center' };
const closeBtn = { background:'none', border:'none', cursor:'pointer' };