import React, { useState } from 'react';
import { supabase } from './supabase';
import { 
  Loader2, Mail, Phone, Lock, Eye, EyeOff, User, AlertCircle 
} from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  // --- Client-Side Validation ---
  const validate = () => {
    let newErrors = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email address";
    
    if (isSignUp) {
      if (form.firstName.trim().length < 2) newErrors.firstName = "First name required";
      if (!/^[6-9]\d{9}$/.test(form.mobile)) newErrors.mobile = "Invalid 10-digit mobile";
      if (form.password.length < 6) newErrors.password = "Min 6 characters required";
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      if (isSignUp) {
        // 1. Create the Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });

        if (authError) throw authError;

        // 2. Immediate Profile Creation
        // Note: This relies on "Confirm Email" being OFF in Supabase settings
        if (authData?.user) {
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
          alert("Account created successfully!");
        }
      } else {
        // Login Logic
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });
        if (loginError) throw loginError;
      }
    } catch (err) {
      // Catch RLS or Rate Limit errors
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authWrapper}>
      <div style={authCard}>
        <div style={header}>
          <h2 style={title}>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p style={subtitle}>{isSignUp ? "Register your design firm" : "Login to your project hub"}</p>
        </div>

        <form onSubmit={handleAuth} style={formBox}>
          {isSignUp && (
            <div style={row}>
              <div style={inputGroup}>
                <label style={label}>First Name</label>
                <input 
                  style={input(errors.firstName)} 
                  placeholder="John"
                  onChange={e => setForm({...form, firstName: e.target.value})} 
                />
              </div>
              <div style={inputGroup}>
                <label style={label}>Last Name</label>
                <input 
                  style={input(errors.lastName)} 
                  placeholder="Doe"
                  onChange={e => setForm({...form, lastName: e.target.value})} 
                />
              </div>
            </div>
          )}

          <div style={inputGroup}>
            <label style={label}>Email Address</label>
            <input 
              type="email" 
              style={input(errors.email)} 
              placeholder="name@company.com"
              onChange={e => setForm({...form, email: e.target.value})} 
            />
            {errors.email && <span style={errText}>{errors.email}</span>}
          </div>

          {isSignUp && (
            <div style={inputGroup}>
              <label style={label}>Mobile Number</label>
              <input 
                type="tel" 
                style={input(errors.mobile)} 
                placeholder="9876543210"
                onChange={e => setForm({...form, mobile: e.target.value})} 
              />
              {errors.mobile && <span style={errText}>{errors.mobile}</span>}
            </div>
          )}

          <div style={inputGroup}>
            <label style={label}>Password</label>
            <div style={{position:'relative'}}>
              <input 
                type={showPassword ? "text" : "password"} 
                style={input(errors.password)} 
                placeholder="••••••••"
                onChange={e => setForm({...form, password: e.target.value})} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtn}>
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {errors.password && <span style={errText}>{errors.password}</span>}
          </div>

          {isSignUp && (
            <div style={inputGroup}>
              <label style={label}>Confirm Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                style={input(errors.confirmPassword)} 
                placeholder="••••••••"
                onChange={e => setForm({...form, confirmPassword: e.target.value})} 
              />
              {errors.confirmPassword && <span style={errText}>{errors.confirmPassword}</span>}
            </div>
          )}

          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20}/> : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <button onClick={() => {setIsSignUp(!isSignUp); setErrors({});}} style={toggleBtn}>
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---
const authWrapper = { display: 'flex', justifyContent: 'center', padding: '50px 20px' };
const authCard = { background: '#fff', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' };
const header = { textAlign: 'center', marginBottom: '30px' };
const title = { margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#1e293b' };
const subtitle = { color: '#64748b', fontSize: '14px' };
const formBox = { display: 'flex', flexDirection: 'column', gap: '18px' };
const row = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const label = { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' };
const input = (err) => ({ padding: '12px', borderRadius: '10px', border: err ? '1px solid #ef4444' : '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '14px', width: '100%' });
const eyeBtn = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' };
const submitBtn = { background: '#1e293b', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', marginTop: '10px' };
const toggleBtn = { background: 'none', border: 'none', color: '#2563eb', marginTop: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', width: '100%' };
const errText = { color: '#ef4444', fontSize: '11px', fontWeight: '600' };