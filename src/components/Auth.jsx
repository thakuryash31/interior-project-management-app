import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // The AuthContext in App.jsx will automatically detect the login 
      // and switch the view to Dashboard.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: 'var(--bg-app)'
    }}>
      <div style={{
        width: '100%', 
        maxWidth: '400px', 
        padding: '40px', 
        background: 'var(--bg-surface)', 
        borderRadius: 'var(--radius-lg)', 
        boxShadow: 'var(--shadow-float)',
        border: '1px solid var(--border)'
      }}>
        
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: 30}}>
          <div style={{
            width: 48, height: 48, background: 'var(--primary)', 
            borderRadius: 12, margin: '0 auto 15px auto', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: 24
          }}>
            P
          </div>
          <h2 style={{margin: '0 0 5px 0', fontSize: 24, fontWeight: 700}}>Welcome back</h2>
          <p style={{margin: 0, color: 'var(--text-secondary)'}}>Sign in to your workspace</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', 
            borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '13px',
            marginBottom: '20px', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          
          <div style={{marginBottom: 20}}>
            <label style={{display:'block', fontSize:12, fontWeight:600, marginBottom:8, color:'var(--text-secondary)'}}>
              EMAIL ADDRESS
            </label>
            <div style={{position: 'relative'}}>
              <Mail size={16} color="var(--text-secondary)" style={{position: 'absolute', left: 12, top: 12}} />
              <input 
                type="email" 
                required
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '10px 10px 10px 38px', 
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                  outline: 'none', fontSize: 14, boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{marginBottom: 25}}>
            <label style={{display:'block', fontSize:12, fontWeight:600, marginBottom:8, color:'var(--text-secondary)'}}>
              PASSWORD
            </label>
            <div style={{position: 'relative'}}>
              <Lock size={16} color="var(--text-secondary)" style={{position: 'absolute', left: 12, top: 12}} />
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%', padding: '10px 10px 10px 38px', 
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                  outline: 'none', fontSize: 14, boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: 'var(--primary)', 
              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={18}/> : <>Sign In <ArrowRight size={18}/></>}
          </button>

        </form>
        
        <div style={{marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)'}}>
          Need an account? Contact your Organization Admin.
        </div>
      </div>
    </div>
  );
}