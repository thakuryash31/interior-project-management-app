import React, { useState } from 'react';
import { supabase } from './supabase';
import { LogIn, UserPlus, Loader2, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      if (isSignUp) alert("Check your email for the confirmation link!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainer}>
      <div style={authCard}>
        <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
        <p style={{color:'#64748b', marginBottom:'20px'}}>
          {isSignUp ? "Join our project management suite" : "Login to manage your projects"}
        </p>

        <form onSubmit={handleAuth} style={formStyle}>
          <input 
            type="email" placeholder="Email Address" required style={input}
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required style={input}
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20}/> : (isSignUp ? "Sign Up" : "Login")}
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} style={toggleBtn}>
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}

const authContainer = { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' };
const authCard = { background:'#fff', padding:'40px', borderRadius:'24px', width:'100%', maxWidth:'400px', boxShadow:'0 10px 25px rgba(0,0,0,0.05)' };
const formStyle = { display:'flex', flexDirection:'column', gap:'15px' };
const input = { padding:'12px', borderRadius:'10px', border:'1px solid #e2e8f0', outline:'none' };
const submitBtn = { background:'#1e293b', color:'#fff', padding:'14px', borderRadius:'10px', border:'none', fontWeight:'bold', cursor:'pointer', display:'flex', justifyContent:'center' };
const toggleBtn = { background:'none', border:'none', color:'#2563eb', marginTop:'20px', cursor:'pointer', fontSize:'14px' };