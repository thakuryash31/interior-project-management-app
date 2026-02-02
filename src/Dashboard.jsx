import React, { useState } from 'react';
import { supabase } from './supabase';
import { LogIn, UserPlus, Loader2, User, Mail, Phone, Lock } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: ''
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Sign Up the user in Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });

        if (authError) throw authError;

        // 2. Insert extra details into 'profiles' table
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              first_name: form.firstName,
              last_name: form.lastName,
              mobile_number: form.mobile,
              email: form.email
            }]);
          
          if (profileError) throw profileError;
          alert("Registration successful! Please check your email for verification.");
        }
      } else {
        // Login Logic
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });
        if (error) throw error;
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainer}>
      <div style={authCard}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0 }}>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {isSignUp ? "Register to manage your interior projects" : "Sign in to your dashboard"}
          </p>
        </div>

        <form onSubmit={handleAuth} style={formStyle}>
          {isSignUp && (
            <div style={grid2}>
              <div style={inputGroup}>
                <label style={label}>First Name</label>
                <input required style={input} placeholder="John" 
                  onChange={e => setForm({...form, firstName: e.target.value})} />
              </div>
              <div style={inputGroup}>
                <label style={label}>Last Name</label>
                <input required style={input} placeholder="Doe" 
                  onChange={e => setForm({...form, lastName: e.target.value})} />
              </div>
            </div>
          )}

          <div style={inputGroup}>
            <label style={label}>Email Address</label>
            <input type="email" required style={input} placeholder="john@example.com" 
              onChange={e => setForm({...form, email: e.target.value})} />
          </div>

          {isSignUp && (
            <div style={inputGroup}>
              <label style={label}>Mobile Number</label>
              <input type="tel" required style={input} placeholder="+91 00000 00000" 
                onChange={e => setForm({...form, mobile: e.target.value})} />
            </div>
          )}

          <div style={inputGroup}>
            <label style={label}>Password</label>
            <input type="password" required style={input} placeholder="••••••••" 
              onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20}/> : (isSignUp ? "Create Account" : "Login")}
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} style={toggleBtn}>
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---
const authContainer = { display: 'flex', justifyContent: 'center', padding: '40px 20px' };
const authCard = { background: '#fff', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const label = { fontSize: '12px', fontWeight: 'bold', color: '#475569' };
const input = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' };
const submitBtn = { background: '#1e293b', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', marginTop: '10px' };
const toggleBtn = { background: 'none', border: 'none', color: '#2563eb', marginTop: '25px', cursor: 'pointer', fontSize: '14px', width: '100%', fontWeight: '600' };