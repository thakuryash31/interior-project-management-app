import React, { useState, useMemo } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { indiaData } from './indiaData';
import { Layout, CheckCircle, Search, Shield, ArrowRight, Loader2, BarChart3, Globe, Layers } from 'lucide-react';

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', email: '', 
    password: '', city: '', state: '', country: 'India'
  });
  const [citySearch, setCitySearch] = useState('');

  const availableCities = useMemo(() => {
    if (!formData.state) return [];
    return indiaData[formData.state].filter(c => 
      c.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [formData.state, citySearch]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          ...formData,
          role: 'designer',
          createdAt: new Date()
        });
      }
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ backgroundColor: '#fff', color: '#1e293b', fontFamily: "'Inter', sans-serif" }}>
      
      {/* --- NAVIGATION --- */}
      <nav style={{ padding: '20px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '20px', color: '#2563eb' }}>
          <Layers size={28} /> Interior<span style={{ color: '#1e293b' }}>PM</span>
        </div>
        <button onClick={() => setIsLogin(true)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}>Login</button>
      </nav>

      {/* --- HERO SECTION --- */}
      <section style={{ display: 'flex', flexWrap: 'wrap', minHeight: '85vh', alignItems: 'center', padding: '0 5%', background: 'radial-gradient(circle at top right, #eff6ff, #ffffff)' }}>
        <div style={{ flex: '1', minWidth: '350px', padding: '40px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#2563eb', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
            NEW: AI-Powered Budgeting
          </div>
          <h1 style={{ fontSize: '3.8rem', lineHeight: '1.1', marginBottom: '24px', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Smart Management for <span style={{ color: '#2563eb' }}>Interior Studios.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '35px', maxWidth: '550px', lineHeight: '1.6' }}>
            The all-in-one OS for your design firm. Automate project IDs, secure site data, and track client approvals in real-time.
          </p>
          
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
             <StatItem label="Active Designers" value="2,400+" />
             <StatItem label="Projects Tracked" value="10k+" />
          </div>
        </div>

        {/* --- BLUE AUTH CARD --- */}
        <div style={{ flex: '1', minWidth: '350px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '460px', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
            <h2 style={{ marginBottom: '10px', fontSize: '24px', fontWeight: '700' }}>{isLogin ? 'Sign in to InteriorPM' : 'Get started for free'}</h2>
            <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '14px' }}>Free forever for small studios.</p>
            
            <form onSubmit={handleAuth} style={{ display: 'grid', gap: '16px' }}>
              {!isLogin && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input required placeholder="First Name" onChange={e => setFormData({...formData, firstName: e.target.value})} style={inputStyle} />
                  <input required placeholder="Last Name" onChange={e => setFormData({...formData, lastName: e.target.value})} style={inputStyle} />
                </div>
              )}

              <input type="email" required placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
              
              {!isLogin && (
                <>
                  <input type="tel" required placeholder="Mobile Number" onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <select required onChange={e => setFormData({...formData, state: e.target.value, city: ''})} style={inputStyle}>
                      <option value="">Select State</option>
                      {Object.keys(indiaData).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div style={{ position: 'relative' }}>
                      <input placeholder="Search City..." disabled={!formData.state} value={citySearch} onChange={e => setCitySearch(e.target.value)} style={inputStyle} />
                      {citySearch && !formData.city && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', zIndex: 10, maxHeight: '140px', overflowY: 'auto', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                          {availableCities.map(c => (
                            <div key={c} onClick={() => { setFormData({...formData, city: c}); setCitySearch(c); }} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>{c}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <input type="password" required placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} />

              <button type="submit" disabled={loading} style={mainBtnStyle}>
                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login to Dashboard' : 'Create My Account')}
              </button>
            </form>

            <button 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ width: '100%', background: 'none', border: 'none', color: '#2563eb', marginTop: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            >
              {isLogin ? "New here? Sign up for free" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </section>

      {/* --- BLUE ICON FEATURES --- */}
      <section style={{ padding: '100px 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '60px' }}>Everything you need in one tab.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <SaaSFeature icon={<BarChart3 color="#2563eb" />} title="Financial Tracking" desc="Monitor site expenses against client budgets automatically." />
          <SaaSFeature icon={<Globe color="#2563eb" />} title="Regional Logistics" desc="Handle multiple project cities across India with local address tracking." />
          <SaaSFeature icon={<Shield color="#2563eb" />} title="Enterprise Security" desc="Bank-grade encryption for all your client contracts and floor plans." />
        </div>
      </section>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: '14px', color: '#64748b' }}>{label}</div>
    </div>
  );
}

function SaaSFeature({ icon, title, desc }) {
  return (
    <div style={{ padding: '40px', borderRadius: '24px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', transition: '0.3s' }}>
      <div style={{ background: '#fff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 25px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.1)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>{title}</h3>
      <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>{desc}</p>
    </div>
  );
}

const inputStyle = { padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', width: '100%', boxSizing: 'border-box', fontSize: '15px', transition: 'border-color 0.2s' };
const mainBtnStyle = { background: '#2563eb', color: '#fff', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', border: 'none', transition: 'background 0.2s', marginTop: '10px' };