import React from 'react';
import './App.css';
import { useAppLogic } from './hooks/useAppLogic';
import Dashboard from './components/Dashboard';
import ProjectDetails from './components/ProjectDetails';
import { 
  X, MapPin, User, Loader2, Building, Copy, 
  Layout, Settings, LogOut, CheckCircle2 
} from 'lucide-react';

export default function App() {
  const {
    selectedProject, setSelectedProject,
    showCreateModal, setShowCreateModal,
    loading,
    form, setForm,
    locationOptions, availableStates,
    handleCityChange, copyBillingToSite,
    handleUpdateProject, handleCreateProject
  } = useAppLogic();

  return (
    <div className="app-wrapper">
      
      {/* 1. SAAS SIDEBAR */}
      <aside className="sidebar">
        <div className="brand-container">
          <div className="brand-logo"><Layout size={20} /></div>
          <span className="brand-name">ProjectFlow</span>
        </div>

        <div className="nav-links">
          <div className={`nav-item ${!selectedProject ? 'active' : ''}`} onClick={() => setSelectedProject(null)}>
            <Layout size={18} /> Dashboard
          </div>
          <div className="nav-item">
            <CheckCircle2 size={18} /> My Tasks
          </div>
          <div className="nav-item">
            <Settings size={18} /> Settings
          </div>
        </div>

        <div style={{marginTop: 'auto'}}>
          <div className="nav-item">
            <LogOut size={18} /> Logout
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="main-content">
        {!selectedProject ? (
          <Dashboard 
            onSelectProject={setSelectedProject} 
            onCreateNew={() => setShowCreateModal(true)} 
          />
        ) : (
          <ProjectDetails 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)} 
            updateProjectData={handleUpdateProject} 
          />
        )}
      </main>

      {/* 3. CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title">
                <h2>Create New Project</h2>
                <p>Fill in the details to initialize the workspace</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="btn-ghost" style={{padding:8}}><X size={20}/></button>
            </div>
            
            <form id="createForm" onSubmit={handleCreateProject} className="modal-body">
              
              {/* SECTION A: CLIENT */}
              <div className="input-group">
                <div className="label-header">
                   <span className="field-label"><User size={14} color="#6366f1"/> Client Details</span>
                </div>
                <div className="form-grid-2">
                   <input required className="saas-input" placeholder="Project Name (e.g. Villa Renovation)" value={form.projectName} onChange={e => setForm({...form, projectName: e.target.value})} />
                   <input required className="saas-input" placeholder="Client Full Name" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
                </div>
                <div className="form-grid-2" style={{marginTop: 15}}>
                   <input required type="email" className="saas-input" placeholder="Client Email" value={form.customerEmail} onChange={e => setForm({...form, customerEmail: e.target.value})} />
                   <input required type="tel" className="saas-input" placeholder="Client Phone" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} />
                </div>
              </div>

              {/* SECTION B: BILLING */}
              <div className="input-group">
                <div className="label-header">
                   <span className="field-label"><Building size={14} color="#6366f1"/> Billing Address</span>
                </div>
                <input required className="saas-input" style={{marginBottom: 15}} placeholder="Street Address / Flat No." value={form.billingAddress} onChange={e => setForm({...form, billingAddress: e.target.value})} />
                
                <div className="form-grid-3">
                  <select required className="saas-input" value={form.billingCity} onChange={e => handleCityChange('billing', e.target.value)}>
                    <option value="">Select City</option>
                    {locationOptions.map(l => <option key={l.city_name} value={l.city_name}>{l.city_name}</option>)}
                  </select>
                  <select required className="saas-input" value={form.billingState} onChange={e => setForm({...form, billingState: e.target.value})}>
                    <option value="">Select State</option>
                    {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input required className="saas-input" placeholder="Pincode" value={form.billingPincode} onChange={e => setForm({...form, billingPincode: e.target.value})} />
                </div>
              </div>

              {/* SECTION C: SITE */}
              <div className="input-group">
                <div className="label-header">
                   <span className="field-label"><MapPin size={14} color="#6366f1"/> Site Location</span>
                   <button type="button" onClick={copyBillingToSite} className="copy-btn"><Copy size={12}/> Copy from Billing</button>
                </div>
                <input required className="saas-input" style={{marginBottom: 15}} placeholder="Site Street Address" value={form.projectAddress} onChange={e => setForm({...form, projectAddress: e.target.value})} />
                
                <div className="form-grid-3">
                  <select required className="saas-input" value={form.projectCity} onChange={e => handleCityChange('project', e.target.value)}>
                    <option value="">Select City</option>
                    {locationOptions.map(l => <option key={l.city_name} value={l.city_name}>{l.city_name}</option>)}
                  </select>
                  <select required className="saas-input" value={form.projectState} onChange={e => setForm({...form, projectState: e.target.value})}>
                    <option value="">Select State</option>
                    {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input required className="saas-input" placeholder="Pincode" value={form.projectPincode} onChange={e => setForm({...form, projectPincode: e.target.value})} />
                </div>
              </div>

            </form>

            <div className="modal-footer">
               <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
               <button type="submit" form="createForm" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18}/> : "Create Project"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}