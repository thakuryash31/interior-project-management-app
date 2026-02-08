import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Layout, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Toggle State
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // --- SIGN UP LOGIC (New Super Admin) ---
        // 1. Create Auth User
        const { data: { user }, error: authError } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        if (authError) throw authError;

        // 2. Create Profile (As Super Admin)
        // Note: For a real app, you'd hide this or require a secret code.
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: user.id,
          email: email,
          full_name: fullName,
          role: 'super_admin', // <--- Creates you as Super Admin
          organization_id: '00000000-0000-0000-0000-000000000000' // System Org
        }]);
        
        if (profileError) throw profileError;
        alert("Account created! Please Log In.");
        setIsLogin(true); // Switch to login view
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9'}}>
      <div className="modal-card" style={{width: 400, padding: 40}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:30}}>
          <div style={{background: '#4f46e5', padding: 10, borderRadius: 12, marginBottom: 15}}>
            <Layout color="white" size={28}/>
          </div>
          <h1 style={{fontSize: 24, fontWeight: 700, color: '#0f172a'}}>ProjectFlow</h1>
          <p style={{color: '#64748b'}}>{isLogin ? 'Welcome back, Admin' : 'Create Super Admin Account'}</p>
        </div>

        <form onSubmit={handleAuth} style={{display:'flex', flexDirection:'column', gap: 15}}>
          {!isLogin && (
            <input required placeholder="Full Name" className="saas-input" value={fullName} onChange={e => setFullName(e.target.value)} />
          )}
          <input required type="email" placeholder="Email Address" className="saas-input" value={email} onChange={e => setEmail(e.target.value)} />
          <input required type="password" placeholder="Password" className="saas-input" value={password} onChange={e => setPassword(e.target.value)} />
          
          <button type="submit" className="btn btn-primary" style={{justifyContent:'center'}} disabled={loading}>
            {loading ? <Loader2 className="animate-spin"/> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{marginTop: 20, textAlign: 'center', fontSize: 14, color: '#64748b'}}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{color: '#4f46e5', fontWeight: 600, cursor: 'pointer'}}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </div>
      </div>
    </div>
  );
}