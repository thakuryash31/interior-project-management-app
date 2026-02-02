import React, { useState } from 'react';
import { supabase } from './supabase';
import { 
  Loader2, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle 
} from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', mobile: '', password: '', confirmPassword: ''
  });

  // --- Validation Logic ---
  const validate = () => {
    let newErrors = {};
    
    // Email regex
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    
    if (isSignUp) {
      if (form.firstName.length < 2) newErrors.firstName = "Name too short";
      if (form.lastName.length < 1) newErrors.lastName = "Last name required";
      
      // Indian Mobile validation (10 digits)
      if (!/^[6-9]\d{9}$/.test(form.mobile)) newErrors.mobile = "Invalid 10-digit mobile number";
      
      if (form.password.length < 6) newErrors.password = "Password must be 6+ chars";
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
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });

        if (authError) throw authError;

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
          alert("Registration successful! Check your email for verification.");
        }
      } else {
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
          <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Please enter your details</p>
        </div>

        <form onSubmit={handleAuth} style={formStyle}>
          {isSignUp && (
            <div style={grid2}>
              <div style={inputGroup}>
                <label style={label}>First Name</label>
                <input required style={input(errors.firstName)} placeholder="John" 
                  onChange={e => setForm({...form, firstName: e.target.value})} />
                {errors.firstName && <span style={errText}>{errors.firstName}</span>}
              </div>
              <div style={inputGroup}>
                <label style={label}>Last Name</label>
                <input required style={input(errors.lastName)} placeholder="Doe" 
                  onChange={e => setForm({...form, lastName: e.target.value})} />
              </div>
            </div>
          )}

          <div style={inputGroup}>
            <label style={label}>Email Address</label>
            <input type="email" required style={input(errors.email)} placeholder="email@example.com" 
              onChange={e => setForm({...form, email: e.target.value})} />
            {errors.email && <span style={errText}>{errors.email}</span>}
          </div>

          {isSignUp && (
            <div style={inputGroup}>
              <label style={label}>Mobile Number</label>
              <input type="tel" required style={input(errors.mobile)} placeholder="9876543210" 
                onChange={e => setForm({...form, mobile: e.target.value})} />
              {errors.mobile && <span style={errText}>{errors.mobile}</span>}
            </div>
          )}

          <div style={inputGroup}>
            <label style={label}>Password</label>
            <div style={passWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                style={{...input(errors.password), width:'100%'}} 
                placeholder="••••••••" 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtn}>
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            {errors.password && <span style={errText}>{errors.password}</span>}
          </div>

          {isSignUp && (
            <div style={inputGroup}>
              <label style={label}>Confirm Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                style={input(errors.confirmPassword)} 
                placeholder="••••••••" 
                onChange={e => setForm({...form, confirmPassword: e.target.value})} 
              />
              {errors.confirmPassword && <span style={errText}>{errors.confirmPassword}</span>}
            </div>
          )}

          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20}/> : (isSignUp ? "Register" : "Sign In")}
          </button>
        </form>

        <button onClick={() => {setIsSignUp(!isSignUp); setErrors({});}} style={toggleBtn}>
          {isSignUp ? "Already have an account? Login" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---
const authContainer = { display: 'flex', justifyContent: 'center', padding: '40px 20px' };
const authCard = { background: '#fff', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '18px' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' };
const label = { fontSize: '12px', fontWeight: 'bold', color: '#475569' };
const input = (hasError) => ({ padding: '12px', borderRadius: '10px', border: hasError ? '1px solid #ef4444' : '1px solid #e2e8f0', outline: 'none', fontSize: '14px', transition:'0.2s' });
const passWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const eyeBtn = { position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' };
const submitBtn = { background: '#1e293b', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', marginTop: '10px' };
const toggleBtn = { background: 'none', border: 'none', color: '#2563eb', marginTop: '25px', cursor: 'pointer', fontSize: '14px', width: '100%', fontWeight: '600' };
const errText = { color: '#ef4444', fontSize: '11px', fontWeight: '600' };