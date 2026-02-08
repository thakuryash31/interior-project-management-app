import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { Building, UserPlus, Loader2 } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orgName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // CALL THE MAGIC SQL FUNCTION
      const { data, error } = await supabase.rpc('create_org_and_admin', {
        org_name: formData.orgName,
        admin_email: formData.adminEmail,
        admin_password: formData.adminPassword,
        admin_name: formData.adminName
      });

      if (error) throw error;

      alert(`Success! Organization "${formData.orgName}" created.\nUser ${formData.adminEmail} can now log in.`);
      
      // Reset Form
      setFormData({ orgName: '', adminName: '', adminEmail: '', adminPassword: '' });

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding: 40, maxWidth: 800, margin: '0 auto'}}>
      <h1 style={{fontSize: 28, marginBottom: 10}}>Super Admin Console</h1>
      <p style={{color: '#64748b', marginBottom: 40}}>Create Organizations and assign their first Administrator.</p>

      <div className="card" style={{padding: 30}}>
        <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 20, borderBottom:'1px solid #e2e8f0', paddingBottom:15}}>
          <Building color="#4f46e5"/>
          <h2 style={{fontSize: 18}}>Onboard New Organization</h2>
        </div>

        <form onSubmit={handleCreateOrg}>
          <div style={{marginBottom: 20}}>
            <label style={{display:'block', marginBottom: 8, fontSize: 13, fontWeight:600}}>Organization Name</label>
            <input required className="saas-input" placeholder="e.g. Acme Interiors" 
              value={formData.orgName} onChange={e => setFormData({...formData, orgName: e.target.value})} />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 20, marginBottom: 20}}>
            <div>
              <label style={{display:'block', marginBottom: 8, fontSize: 13, fontWeight:600}}>Admin Name</label>
              <input required className="saas-input" placeholder="John Doe" 
                value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} />
            </div>
            <div>
              <label style={{display:'block', marginBottom: 8, fontSize: 13, fontWeight:600}}>Admin Email</label>
              <input required type="email" className="saas-input" placeholder="john@acme.com" 
                value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
            </div>
          </div>

          <div style={{marginBottom: 30}}>
            <label style={{display:'block', marginBottom: 8, fontSize: 13, fontWeight:600}}>Default Password</label>
            <input required type="text" className="saas-input" placeholder="Set a temporary password" 
              value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
          </div>

          <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center'}} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} style={{marginRight:8}}/> : <><UserPlus size={18} style={{marginRight:8}}/> Create Organization & Admin</>}
          </button>
        </form>
      </div>
    </div>
  );
}