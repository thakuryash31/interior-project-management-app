import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Dashboard from './Dashboard';
import ProjectDetails from './ProjectDetails';
import { X, MapPin, User, Globe, Phone, Mail, Loader2, Plus } from 'lucide-react';

// Dropdown Constants
const INDIAN_STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const COUNTRIES = ["India", "UAE", "USA", "UK", "Australia", "Singapore"];

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
    billingCity: '',
    billingState: '',
    billingPincode: '',
    billingCountry: 'India',
    projectCity: '',
    projectState: '',
    projectPincode: '',
    projectCountry: 'India'
  });

  // --- LOGIC: Create Project with Sequential ID ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Generate ID: Prefix (3 letters) + Series (10 digits)
      const prefix = (form.projectCity || "PRJ").substring(0, 3).toUpperCase();
      
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

      // 2. Insert into Supabase
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
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%' }}>
      {/* Navigation Router */}
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

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h2 style={{margin:0, fontSize:'20px'}}>New Project Intake</h2>
              <button onClick={() => setShowCreateModal(false)} style={closeBtn}><X /></button>
            </div>

            <form onSubmit={handleCreateProject} style={formBody}>
              {/* SECTION: CLIENT */}
              <div style={sectionLabel}><User size={14}/> Client Information</div>
              <div style={grid2}>
                <input required placeholder="Project Name" style={input} onChange={e => setForm({...form, projectName: e.target.value})} />
                <input required placeholder="Customer Full Name" style={input} onChange={e => setForm({...form, customerName: e.target.value})} />
                <input required type="email" placeholder="Customer Email" style={input} onChange={e => setForm({...form, customerEmail: e.target.value})} />
                <input required type="tel" placeholder="Contact Number" style={input} onChange={e => setForm({...form, customerPhone: e.target.value})} />
              </div>

              {/* SECTION: BILLING */}
              <div style={sectionLabel}><Globe size={14}/> Billing Address</div>
              <input required placeholder="Full Billing Address" style={input} onChange={e => setForm({...form, billingAddress: e.target.value})} />
              <div style={grid2}>
                <input required placeholder="Billing City" style={input} onChange={e => setForm({...form, billingCity: e.target.value})} />
                <select required style={input} onChange={e => setForm({...form, billingState: e.target.value})}>
                  <option value="">Select State</option>
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
                <input required placeholder="Project City (Required for ID)" style={input} onChange={e => setForm({...form, projectCity: e.target.value})} />
                <select required style={input} onChange={e => setForm({...form, projectState: e.target.value})}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input required placeholder="Project Pincode" style={input} onChange={e => setForm({...form, projectPincode: e.target.value})} />
                <select style={input} value={form.projectCountry} onChange={e => setForm({...form, projectCountry: e.target.value})}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button type="submit" style={submitBtn} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20}/> : "Create Project & Open"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const modalOverlay = { position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15, 23, 42, 0.7)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000, backdropFilter: 'blur(4px)' };
const modalContent = { background:'#fff', width:'600px', maxHeight:'90vh', borderRadius:'24px', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)' };
const modalHeader = { padding:'25px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' };
const formBody = { padding:'25px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'15px' };
const sectionLabel = { fontSize:'11px', fontWeight:'800', color:'#64748b', textTransform:'uppercase', letterSpacing:'1px', display:'flex', alignItems:'center', gap:'8px', marginTop:'10px' };
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' };
const input = { padding:'12px', borderRadius:'10px', border:'1px solid #e2e8f0', fontSize:'14px', outline:'none', background:'#f8fafc' };
const submitBtn = { padding:'16px', background:'#1e293b', color:'#fff', border:'none', borderRadius:'12px', fontWeight:'bold', cursor:'pointer', marginTop:'20px', display:'flex', justifyContent:'center' };
const closeBtn = { background:'none', border:'none', cursor:'pointer', color:'#94a3b8' };