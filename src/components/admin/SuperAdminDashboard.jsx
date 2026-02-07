import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import { Building, ShieldAlert, Loader2 } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [form, setForm] = useState({ orgName:'', adminName:'', adminEmail:'', adminPassword:'' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.createOrganization(form);
      alert("Organization & Admin Created Successfully!");
      setForm({ orgName:'', adminName:'', adminEmail:'', adminPassword:'' });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding: 40, maxWidth: 800, margin: '0 auto'}}>
      <h1 className="page-title"><ShieldAlert color="red" size={28}/> Super Admin Console</h1>
      
      <div className="main-card">
        <h3><Building size={18}/> Onboard New Organization</h3>
        <form onSubmit={handleCreate} style={{display:'grid', gap:15, marginTop:20}}>
          <input className="saas-input" placeholder="Organization Name" value={form.orgName} onChange={e => setForm({...form, orgName:e.target.value})} required/>
          <div className="form-grid-2">
            <input className="saas-input" placeholder="Admin Name" value={form.adminName} onChange={e => setForm({...form, adminName:e.target.value})} required/>
            <input className="saas-input" placeholder="Admin Email" type="email" value={form.adminEmail} onChange={e => setForm({...form, adminEmail:e.target.value})} required/>
          </div>
          <input className="saas-input" placeholder="Password" type="password" value={form.adminPassword} onChange={e => setForm({...form, adminPassword:e.target.value})} required/>
          
          <button className="btn btn-primary" disabled={loading}>
            {loading ? <Loader2 className="animate-spin"/> : 'Create Organization'}
          </button>
        </form>
      </div>
    </div>
  );
}