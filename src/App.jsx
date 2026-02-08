import React, { useState } from 'react';
import './App.css'; 

// 1. Context & Hooks
import { AuthProvider, useAuth } from './context/AuthContext';
import { useAppLogic } from './hooks/useAppLogic';
import { usePermission } from './hooks/usePermission'; 

// 2. Components
import Dashboard from './components/Dashboard';
import ProjectDetails from './components/ProjectDetails';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import UserManagement from './components/admin/UserManagement';
import Auth from './components/Auth';

// 3. Icons
import { 
  X, MapPin, User, Loader2, Building, Copy, 
  Layout, Settings, LogOut, CheckCircle2, Users, RefreshCw 
} from 'lucide-react';

// --- MAIN CONTENT COMPONENT ---
function MainAppContent() {
  // Get Auth State & Dev Tools
  const { user, role, loading: authLoading, logout, toggleRole } = useAuth();
  const { can } = usePermission(); // Keep permission checks
  
  // Local View State
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'users'

  // App Logic (Project Management)
  const {
    selectedProject, setSelectedProject,
    showCreateModal, setShowCreateModal,
    loading: appLoading,
    form, setForm,
    locationOptions, availableStates,
    handleCityChange, copyBillingToSite,
    handleUpdateProject, handleCreateProject
  } = useAppLogic();

  // --- FLOATING DEV BUTTON COMPONENT ---
  const DevSwitcher = () => (
    <div 
      onClick={toggleRole}
      style={{
        position: 'fixed', bottom: 20, right: 20, 
        background: '#0f172a', color: '#fff', padding: '10px 16px', 
        borderRadius: 30, cursor: 'pointer', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        display: 'flex', alignItems: 'center', gap: 10, 
        fontSize: 13, fontWeight: 600, zIndex: 9999,
        border: '1px solid #334155'
      }}
    >
      <div style={{
        width: 10, height: 10, borderRadius: '50%', 
        background: role === 'super_admin' ? '#ef4444' : '#22c55e',
        boxShadow: role === 'super_admin' ? '0 0 8px #ef4444' : '0 0 8px #22c55e'
      }}></div>
      <span>{role === 'super_admin' ? 'Mode: Super Admin' : 'Mode: Manager'}</span>
      <RefreshCw size={14} style={{opacity: 0.7}}/>
    </div>
  );

  // 1. LOADING STATE
  if (authLoading) {
    return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b'}}>
        <Loader2 className="animate-spin" size={32} style={{marginRight: 10}}/>
        <span>Loading Application...</span>
      </div>
    );
  }

  // 2. UNAUTHENTICATED STATE (Show Login)
  if (!user) {
    return <Auth />;
  }

  // 3. SUPER ADMIN STATE (Separate Dashboard)
  if (role === 'super_admin') {
    return (
      <div className="app-wrapper">
         <SuperAdminDashboard />
         
         {/* Super Admin Logout */}
         <div style={{position:'fixed', bottom: 20, left: 20, zIndex: 100}}>
            <button className="btn btn-secondary" onClick={logout}>
              <LogOut size={16} style={{marginRight:8}}/> Sign Out
            </button>
         </div>

         {/* Dev Switcher */}
         <DevSwitcher />
      </div>
    );
  }

  // 4. STANDARD APP STATE (Managers, Designers, etc.)
  return (
    <div className="app-wrapper">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand-container">
          <div className="brand-logo"><Layout size={20} /></div>
          <span className="brand-name">ProjectFlow</span>
        </div>

        <div className="nav-links">
          {/* Dashboard Link */}
          <div 
            className={`nav-item ${currentView === 'dashboard' && !selectedProject ? 'active' : ''}`} 
            onClick={() => { setCurrentView('dashboard'); setSelectedProject(null); }}
          >
            <Layout size={18} /> Dashboard
          </div>

          {/* Team Management Link (Only if allowed) */}
          {(can('manage_users') || role === 'admin') && (
            <div 
              className={`nav-item ${currentView === 'users' ? 'active' : ''}`} 
              onClick={() => { setCurrentView('users'); setSelectedProject(null); }}
            >
              <Users size={18} /> Manage Team
            </div>
          )}

          <div className="nav-item">
            <CheckCircle2 size={18} /> My Tasks
          </div>
          <div className="nav-item">
            <Settings size={18} /> Settings
          </div>
        </div>

        <div style={{marginTop: 'auto'}}>
          <div className="nav-item" onClick={logout}>
            <LogOut size={18} /> Logout
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* VIEW 1: TEAM MANAGEMENT */}
        {currentView === 'users' ? (
          <UserManagement />
        ) 
        
        /* VIEW 2: PROJECT DETAILS */
        : selectedProject ? (
          <ProjectDetails 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)} 
            updateProjectData={handleUpdateProject} 
          />
        ) 
        
        /* VIEW 3: DASHBOARD */
        : (
          <Dashboard 
            onSelectProject={setSelectedProject} 
            // Check permission or role for "Create" button
            onCreateNew={(can('create_projects') || role === 'admin') ? () => setShowCreateModal(true) : undefined} 
          />
        )}
      </main>

      {/* Dev Switcher */}
      <DevSwitcher />

      {/* CREATE PROJECT MODAL */}
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
                   <input required className="saas-input" placeholder="Project Name" value={form.projectName} onChange={e => setForm({...form, projectName: e.target.value})} />
                   <input required className="saas-input" placeholder="Client Name" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
                </div>
                <div className="form-grid-2" style={{marginTop: 15}}>
                   <input required type="email" className="saas-input" placeholder="Email" value={form.customerEmail} onChange={e => setForm({...form, customerEmail: e.target.value})} />
                   <input required type="tel" className="saas-input" placeholder="Phone" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} />
                </div>
              </div>

              {/* SECTION B: BILLING */}
              <div className="input-group">
                <div className="label-header">
                   <span className="field-label"><Building size={14} color="#6366f1"/> Billing Address</span>
                </div>
                <input required className="saas-input" style={{marginBottom: 15}} placeholder="Street Address" value={form.billingAddress} onChange={e => setForm({...form, billingAddress: e.target.value})} />
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
                <input required className="saas-input" style={{marginBottom: 15}} placeholder="Site Address" value={form.projectAddress} onChange={e => setForm({...form, projectAddress: e.target.value})} />
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
               <button type="submit" form="createForm" className="btn btn-primary" disabled={appLoading}>
                {appLoading ? <Loader2 className="animate-spin" size={18}/> : "Create Project"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- ROOT APP EXPORT ---
export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}