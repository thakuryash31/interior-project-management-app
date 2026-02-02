import React, { useState } from 'react';
import { supabase } from './supabase';
import Dashboard from './Dashboard'; // Ensure these paths are correct
import ProjectDetails from './ProjectDetails';
import { X, MapPin, User, Globe, Phone, Mail, Loader2 } from 'lucide-react';

// Simplified lists for the dropdowns
const INDIAN_STATES = ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Gujarat", "West Bengal", "Others"];
const COUNTRIES = ["India", "United States", "United Kingdom", "UAE", "Australia"];

export default function App() {
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic for the ID MUM-1000000001
      const prefix = form.projectCity.substring(0, 3).toUpperCase();
      const { data: lastProjects } = await supabase.from('projects').select('project_id').order('created_at', { ascending: false }).limit(1);
      const lastNum = lastProjects?.[0] ? parseInt(lastProjects[0].project_id.split('-')[1]) : 1000000000;
      const customId = `${prefix}-${lastNum + 1}`;

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
      }]).select();

      if (error) throw error;
      setShowCreateModal(false);
      // setProjects(prev => [data[0], ...prev]);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ... Dashboard code ... */}
      
      {showCreateModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3>Create New Project</h3>
              <button onClick={() => setShowCreateModal(false)}><X /></button>
            </div>

            <form onSubmit={handleCreate} style={formScrollBody}>
              {/* Section 1: Client Info */}
              <h4 style={secHeader}><User size={14}/> Client Details</h4>
              <div style={inputGrid}>
                <input required placeholder="Project Name" style={input} onChange={e => setForm({...form, projectName: e.target.value})} />
                <input required placeholder="Customer Name" style={input} onChange={e => setForm({...form, customerName: e.target.value})} />
                <input required type="email" placeholder="Email ID" style={input} onChange={e => setForm({...form, customerEmail: e.target.value})} />
                <input required type="tel" placeholder="Contact Number" style={input} onChange={e => setForm({...form, customerPhone: e.target.value})} />
              </div>

              {/* Section 2: Billing Address */}
              <h4 style={secHeader}><Globe size={14}/> Billing Address</h4>
              <input required placeholder="Address Line" style={input} onChange={e => setForm({...form, billingAddress: e.target.value})} />
              <div style={inputGrid}>
                <input required placeholder="City" style={input} onChange={e => setForm({...form, billingCity: e.target.value})} />
                <select style={input} onChange={e => setForm({...form, billingState: e.target.value})}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input required placeholder="Pincode" style={input} onChange={e => setForm({...form, billingPincode: e.target.value})} />
                <select style={input} value={form.billingCountry} onChange={e => setForm({...form, billingCountry: e.target.value})}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Section 3: Project Site Address */}
              <h4 style={secHeader}><MapPin size={14}/> Project Site Address</h4>
              <div style={inputGrid}>
                <input required placeholder="Project City" style={input} onChange={e => setForm({...form, projectCity: e.target.value})} />
                <select style={input} onChange={e => setForm({...form, projectState: e.target.value})}>
                   <option value="">Select State</option>
                   {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input required placeholder="Project Pincode" style={input} onChange={e => setForm({...form, projectPincode: e.target.value})} />
                <select style={input} value={form.projectCountry} onChange={e => setForm({...form, projectCountry: e.target.value})}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button type="submit" style={submitBtn} disabled={loading}>
                {loading ? "Processing..." : "Create Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const modalOverlay = { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000 };
const modalContent = { background:'#fff', borderRadius:'20px', width:'600px', maxHeight:'90vh', display:'flex', flexDirection:'column' };
const modalHeader = { padding:'20px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' };
const formScrollBody = { padding:'20px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'15px' };
const inputGrid = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' };
const input = { padding:'12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' };
const secHeader = { margin:'10px 0 5px 0', fontSize:'12px', color:'#666', textTransform:'uppercase', display:'flex', alignItems:'center', gap:'5px' };
const submitBtn = { padding:'15px', background:'#1e293b', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', marginTop:'10px' };