import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import LandingPage from './LandingPage';
import Auth from './Auth';
import Dashboard from './Dashboard';
import ProjectDetails from './ProjectDetails';
import { X, MapPin, User, Globe, Loader2, LogOut } from 'lucide-react';

// --- CONSTANTS ---
const INDIAN_STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const COUNTRIES = ["India", "UAE", "USA", "UK", "Australia", "Singapore"];
const POPULAR_CITIES = ["Mumbai", "Bengaluru", "Delhi", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Surat", "Jaipur", "Lucknow", "Other"];

export default function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    projectName: '', customerName: '', customerEmail: '', customerPhone: '',
    billingAddress: '', billingCity: 'Mumbai', billingState: 'Maharashtra', billingPincode: '', billingCountry: 'India',
    projectCity: 'Mumbai', projectState: 'Maharashtra', projectPincode: '', projectCountry: 'India'
  });

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    // Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- LOGIC: Create Project with Sequential ID ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        current_sub_step: 1,
        user_id: session.user.id // Tie project to the logged-in user
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

  // --- ROUTING LOGIC ---
  if (!session) {
    return showAuth ? (
      <div style={authWrapper}>
        <button onClick={() => setShowAuth(false)} style={backBtn}>← Back to Home</button>
        <Auth />
      </div>
    ) : (
      <LandingPage onGetStarted={() => setShowAuth(true)} />
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <button onClick={() => supabase.auth.signOut()} style={logoutBtn}>
        <LogOut size={16} /> Logout
      </button>

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
                <select style={input} value={form.billingCountry} onChange={e => setForm({...form, billingCountry: e.target.value})}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
                <select style={input} value={form.projectCountry} onChange={e => setForm({...form, projectCountry: e.target.value})}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
const authWrapper = { background: '#f8fafc', minHeight: '100vh', padding: '20px' };
const backBtn = { border:'none', background:'none', fontWeight:'bold', cursor:'pointer', marginBottom:'20px', color:'#64748b' };
const logoutBtn = { position:'fixed', top:'20px', right:'20px', padding:'10px 18px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', display:'flex', gap:'8px', alignItems:'center', zIndex:100 };
const modalOverlay = { position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(15, 23, 42, 0.7)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000 };
const modalContent = { background:'#fff', width:'550px', maxHeight:'85vh', borderRadius:'20px', display:'flex', flexDirection:'column', overflow:'hidden' };
const modalHeader = { padding:'20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' };
const formBody = { padding:'20px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px' };
const sectionLabel = { fontSize:'10px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginTop:'10px', display:'flex', alignItems:'center', gap:'5px' };
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' };
const input = { padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'13px', outline:'none' };
const submitBtn = { padding:'16px', background:'#1e293b', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', marginTop:'15px', display:'flex', justifyContent:'center' };
const closeBtn = { background:'none', border:'none', cursor:'pointer' };