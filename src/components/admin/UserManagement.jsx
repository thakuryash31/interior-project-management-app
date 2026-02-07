import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { UserPlus, Loader2 } from 'lucide-react';

const ROLES = [
  'designer', 'design_manager', 'relationship_manager', 'store_manager', 
  'regional_manager', 'sales_head', 'site_supervisor', 'project_manager', 
  'project_head', 'order_processing_engineer', 'order_processing_manager', 
  'order_processing_head', 'planning_engineer', 'planning_manager', 
  'planning_head', 'dispatch_executive', 'dispatch_manager', 'dispatch_head'
];

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'designer' });

  useEffect(() => {
    if(user) loadTeam();
  }, [user]);

  const loadTeam = async () => {
    const data = await adminService.getTeamMembers();
    setUsers(data || []);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.addTeamMember({ adminId: user.id, ...form });
      alert("User added!");
      setForm({ name:'', email:'', password:'', role:'designer' });
      loadTeam();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding: 40}}>
      <h1 className="page-title">Manage Team</h1>
      
      {/* ADD USER FORM */}
      <div className="main-card" style={{marginBottom:30}}>
         <h3><UserPlus size={18}/> Add Employee</h3>
         <form onSubmit={handleAdd} style={{display:'grid', gap:15, marginTop:15}}>
            <div className="form-grid-2">
               <input className="saas-input" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
               <input className="saas-input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
            </div>
            <div className="form-grid-2">
               <input className="saas-input" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
               <select className="saas-input" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                 {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g,' ').toUpperCase()}</option>)}
               </select>
            </div>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin"/> : 'Add User'}
            </button>
         </form>
      </div>

      {/* USER LIST */}
      <div className="project-grid">
         {users.map(u => (
           <div key={u.id} className="project-card">
              <h4 style={{margin:0}}>{u.full_name}</h4>
              <p style={{color:'var(--text-secondary)', fontSize:13}}>{u.email}</p>
              <span className="status-badge status-1" style={{marginTop:8, display:'inline-block'}}>
                {u.role.replace(/_/g,' ').toUpperCase()}
              </span>
           </div>
         ))}
      </div>
    </div>
  );
}