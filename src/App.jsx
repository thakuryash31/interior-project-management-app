import React, { useState } from 'react';
import { supabase } from './supabase';
import Dashboard from './Dashboard';
import ProjectDetails from './ProjectDetails';
import { X, MapPin, User, Globe, Loader2 } from 'lucide-react';

// --- DATA LISTS ---
const COUNTRIES = ["India", "UAE", "USA", "UK", "Singapore"];
const INDIAN_STATES = ["Maharashtra", "Karnataka", "Delhi", "Gujarat", "Tamil Nadu", "Telangana", "West Bengal", "Other"];
// You can expand this list or use an API, but here are the majors for the dropdown:
const POPULAR_CITIES = ["Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Surat", "Jaipur", "Lucknow", "Other"];

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    projectName: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    billingAddress: '',
    billingCity: 'Mumbai',
    billingState: 'Maharashtra',
    billingPincode: '',
    billingCountry: 'India',
    projectCity: 'Mumbai',
    projectState: 'Maharashtra',
    projectPincode: '',
    projectCountry: 'India'
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Generate Prefix-ID (e.g., MUM-1000000001)
      const prefix = form.projectCity.substring(0, 3).toUpperCase();
      const { data: lastProjects } = await supabase
        .from('projects')
        .select('project_id')
        .order('created_at', { ascending: false })
        .limit(1);

      let nextNum = 1000000001;
      if (lastProjects && lastProjects[0]?.project_id.includes('-')) {
        nextNum = parseInt(lastProjects[0].project_id.split('-')[1]) + 1;
      }
      const customId = `${prefix}-${nextNum}`;

      // 2. Insert ALL fields to Supabase
      const { data, error } = await supabase
        .from('projects')
        .insert([{
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
          current_stage_index: 0,
          current_sub_step: 1
        }])
        .select();

      if (error) throw error;

      setShowCreateModal(false);
      if (data) setSelectedProject(data[0]);
    } catch (err) {
      alert("Error saving to database: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
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

      {showCreateModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h2 style={{margin:0, fontSize:'18px'}}>Create New Project</h2>
              <button onClick={() => setShowCreateModal(false)} style={closeBtn}><X /></button>
            </div>

            <form onSubmit={handleCreateProject} style={formBody}>
              {/* SECTION: CLIENT */}
              <div style={sectionLabel}><User size={14}/> Client Info</div>
              <div style={grid2}>
                <input required placeholder="Project Name" style={input} onChange={e => setForm({...form, projectName: e.target.value})} />
                <input required placeholder="Customer Name" style={input} onChange={e => setForm({...form, customerName: e.target.value})} />
                <input required type="email" placeholder="Email Address" style={input} onChange={e => setForm({...form, customerEmail: e.target.value})} />
                <input required type="tel" placeholder="Phone Number" style={input} onChange={e => setForm({...form, customerPhone: e.target.value})} />
              </div>

              {/* SECTION: BILLING */}
              <div style={sectionLabel}><Globe size={14}/> Billing Details</div>
              <input required placeholder="Billing Address" style={input} onChange={e => setForm({...form, billingAddress: e.target.value})} />
              <div style={grid2}>
                <select style={input} value={form.billingCity} onChange={e => setForm({...form, billingCity: e.target.value})}>
                  {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select style={input} value={form.billingState} onChange={e => setForm({...form, billingState: e.target.value})}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input required placeholder="Pincode" style={input} onChange={e => setForm({...form, billingPincode: e.target.value})} />
                <select style={input} value={form.billingCountry} onChange={e => setForm({...form, billingCountry: e.target.value})}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* SECTION: PROJECT SITE */}
              <div style={sectionLabel}><MapPin size={14}/> Project Site Details</div>
              <div style={grid2}>
                <select style={input} value={form.projectCity} onChange={e => setForm({...form, projectCity: e.target.value})}>
                  {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select style={input} value={form.projectState} onChange={e => setForm({...form, projectState: e.target.value})}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input required placeholder="Site Pincode" style={input} onChange={e => setForm({...form, projectPincode: e.target.value})} />
                <select style={input} value={form.projectCountry} onChange={e => setForm({...form, projectCountry: e.target.value})}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button type="submit" style={submitBtn} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20}/> : "Save Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const modalOverlay = { position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(15, 23, 42, 0.7)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 };
const modalContent = { background:'#fff', width:'550px', maxHeight:'85vh', borderRadius:'20px', display:'flex', flexDirection:'column', overflow:'hidden' };
const modalHeader = { padding:'20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' };
const formBody = { padding:'20px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px' };
const sectionLabel = { fontSize:'10px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginTop:'10px', display:'flex', alignItems:'center', gap:'5px' };
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' };
const input = { padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'13px', outline:'none' };
const submitBtn = { padding:'14px', background:'#1e293b', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', marginTop:'15px', display:'flex', justifyContent:'center' };
const closeBtn = { background:'none', border:'none', cursor:'pointer' };