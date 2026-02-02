import React, { useState, useMemo } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { indiaData } from './indiaData';
import { Layout, CheckCircle, Search, Users, Shield, ArrowRight, Loader2, PenTool, Clipboard } from 'lucide-react';

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
    <div style={{ backgroundColor: '#fff', color: '#1a1a1a', fontFamily: "'Inter', sans-serif" }}>
      
      {/* --- HERO SECTION --- */}
      <section style={{ display: 'flex', flexWrap: 'wrap', minHeight: '90vh', alignItems: 'center', padding: '0 5%' }}>
        <div style={{ flex: '1', minWidth: '350px', padding: '40px' }}>
          <div style={{ color: '#d4af37', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px', letterSpacing: '2px' }}>INTERIOR PM v1.0</div>
          <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '20px' }}>Elevate your design <span style={{ color: '#666' }}>workflow.</span></h1>
          <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '30px', maxWidth: '500px' }}>
            The definitive management platform for Indian interior designers. Track site progress, client details, and budgets in a single workspace.
          </p>
          
          <div style={{ display: 'flex', gap: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#888' }}>
                <CheckCircle size={16} color="#2ecc71" /> Cloud Sync
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#888' }}>
                <CheckCircle size={16} color="#2ecc71" /> Project IDs
             </div>
          </div>
        </div>

        {/* --- DYNAMIC AUTH FORM --- */}
        <div style={{ flex: '1', minWidth: '350px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', backgroundColor: '#fff', border: '1px solid #f0f0f0' }}>
            <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>{isLogin ? 'Welcome Back' : 'Join the Community'}</h2>
            
            <form onSubmit={handleAuth} style={{ display: 'grid', gap: '15px' }}>
              {!isLogin && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input required placeholder="First Name" onChange={e => setFormData({...formData, firstName: e.target.value})} style={inputStyle} />
                  <input required placeholder="Last Name" onChange={e => setFormData({...formData, lastName: e.target.value})} style={inputStyle} />
                </div>
              )}

              <input type="email" required placeholder="Business Email" onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
              
              {!isLogin && (
                <>
                  <input type="tel" required placeholder="Phone Number" onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select required onChange={e => setFormData({...formData, state: e.target.value, city: ''})} style={inputStyle}>
                      <option value="">Select State</option>
                      {Object.keys(indiaData).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div style={{ position: 'relative' }}>
                      <input placeholder="Search City..." disabled={!formData.state} value={citySearch} onChange={e => setCitySearch(e.target.value)} style={inputStyle} />
                      {citySearch && !formData.city && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', zIndex: 10, maxHeight: '120px', overflowY: 'auto', borderRadius: '8px' }}>
                          {availableCities.map(c => (
                            <div key={c} onClick={() => { setFormData({...formData, city: c}); setCitySearch(c); }} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '13px' }}>{c}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <input type="password" required placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} />

              <button type="submit" disabled={loading} style={mainBtnStyle}>
                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In to Dashboard' : 'Get Started Free')}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
              {isLogin ? "Don't have an account?" : "Already use Interior PM?"} 
              <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#000', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline', marginLeft: '5px' }}>
                {isLogin ? 'Create one now' : 'Log in here'}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section style={{ backgroundColor: '#fdfdfd', padding: '100px 5%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px' }}>Why Designers Choose Us</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          <BenefitCard 
            icon={<PenTool size={32} color="#d4af37" />} 
            title="Design-First Logic" 
            desc="Built by designers, for designers. We understand the chaos of site addresses and vendor management." 
          />
          <BenefitCard 
            icon={<Clipboard size={32} color="#d4af37" />} 
            title="Auto-Generated IDs" 
            desc="Never lose a project folder again. Every site gets a unique 10-digit ID automatically." 
          />
          <BenefitCard 
            icon={<Shield size={32} color="#d4af37" />} 
            title="Secure Database" 
            desc="Keep your client contact info and project budgets safely stored in our encrypted cloud." 
          />
        </div>
      </section>
    </div>
  );
}

function BenefitCard({ icon, title, desc }) {
  return (
    <div style={{ padding: '30px', borderRadius: '16px', background: '#fff', border: '1px solid #f0f0f0', textAlign: 'center' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <h3 style={{ marginBottom: '15px' }}>{title}</h3>
      <p style={{ color: '#666', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}

const inputStyle = { padding: '14px', border: '1px solid #e0e0e0', borderRadius: '12px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fcfcfc' };
const mainBtnStyle = { background: '#000', color: '#fff', padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' };