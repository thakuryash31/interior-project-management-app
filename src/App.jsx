import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { usePermission } from './hooks/usePermission';
import { supabase } from './supabase';
import './App.css';

// Logic Hook
import { useAppLogic } from './hooks/useAppLogic';

// Components
import Dashboard from './components/Dashboard';
import ProjectDetails from './components/ProjectDetails';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import UserManagement from './components/admin/UserManagement';
import Auth from './components/Auth'; // Ensure you have a login component

// Icons
import { 
  X, MapPin, User, Loader2, Building, Copy, 
  Layout, Settings, LogOut, CheckCircle2, Users
} from 'lucide-react';

function MainAppContent() {
  const { user, loading: authLoading } = useAuth();
  const { role, can } = usePermission();
  
  // State for switching views (Dashboard vs Team vs Settings)
  const [currentView, setCurrentView] = useState('dashboard');

  // Your existing app logic (Preserved)
  const {
    selectedProject, setSelectedProject,
    showCreateModal, setShowCreateModal,
    loading: appLoading,
    form, setForm,
    locationOptions, availableStates,
    handleCityChange, copyBillingToSite,
    handleUpdateProject, handleCreateProject
  } = useAppLogic();

  // 1. LOADING SCREEN
  if (authLoading) return <div className="loading-screen"><Loader2 className="animate-spin" /> Loading App...</div>;

  // 2. LOGIN SCREEN (If not logged in)
  if (!user) return <Auth />;

  // 3. SUPER ADMIN VIEW (Completely separate interface)
  if (role === 'super_admin') {
    return (
      <div className="app-wrapper">
         <SuperAdminDashboard />
         {/* Simple Logout for Super Admin */}
         <div style={{position:'fixed', bottom:20, left:20}}>
            <button className="btn btn-secondary" onClick={() => supabase.auth.signOut()}>Sign Out</button>
         </div>
      </div>
    );
  }

  // 4. STANDARD WORKSPACE (Designers, Managers, Admins)
  return (
    <div className="app-wrapper">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand-container">
          <div className="brand-logo"><Layout size={20} /></div>
          <span className="brand-name">ProjectFlow</span>
        </div>

        <div className="nav-links">
          {/* Dashboard Tab */}
          <div 
            className={`nav-item ${currentView === 'dashboard' && !selectedProject ? 'active' : ''}`} 
            onClick={() => { setCurrentView('dashboard'); setSelectedProject(null); }}
          >
            <Layout size={18} /> Dashboard
          </div>

          {/* NEW: Team Tab (Only for Admins) */}
          {can('manage_users') && (
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
          <div className="nav-item" onClick={() => supabase.auth.signOut()}>
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
            // Only allow creating projects if they have permission
            onCreateNew={can('create_projects') ? () => setShowCreateModal(true) : undefined} 
          />
        )}
      </main>

      {/* CREATE PROJECT MODAL (Preserved from your code) */}
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

// 5. ROOT COMPONENT (Wraps everything in Context)
export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}