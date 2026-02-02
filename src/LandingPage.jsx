import React from 'react';
import { CheckCircle, Zap, Shield, ArrowRight } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={landingStyle}>
      <nav style={navStyle}>
        <div style={logoStyle}>ProjectFlow</div>
        <button onClick={onGetStarted} style={navBtn}>Login</button>
      </nav>

      <section style={heroStyle}>
        <h1 style={title}>Design Projects, <br/><span style={{color:'#2563eb'}}>Simplified.</span></h1>
        <p style={tagline}>From floor plans to final handover. Track every stage of your interior design business in one powerful dashboard.</p>
        <button onClick={onGetStarted} style={ctaBtn}>
          Get Started Now <ArrowRight size={20}/>
        </button>
      </section>

      <div style={featuresGrid}>
        <Feature icon={<Zap color="#2563eb"/>} title="Fast Setup" desc="Create projects with sequential IDs in seconds." />
        <Feature icon={<Shield color="#2563eb"/>} title="Secure" desc="Your data is protected with enterprise-grade auth." />
        <Feature icon={<CheckCircle color="#2563eb"/>} title="Gated Workflow" desc="Never miss a step with our task-locking system." />
      </div>
    </div>
  );
}

function Feature({icon, title, desc}) {
  return (
    <div style={featCard}>
      {icon}
      <h4 style={{margin:'10px 0'}}>{title}</h4>
      <p style={{fontSize:'14px', color:'#64748b'}}>{desc}</p>
    </div>
  );
}

const landingStyle = { background:'#f8fafc', minHeight:'100vh' };
const navStyle = { display:'flex', justifyContent:'space-between', padding:'20px 10%', alignItems:'center' };
const logoStyle = { fontSize:'24px', fontWeight:'800', color:'#1e293b' };
const navBtn = { padding:'8px 20px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#fff', fontWeight:'bold', cursor:'pointer' };
const heroStyle = { textAlign:'center', padding:'100px 20%', display:'flex', flexDirection:'column', alignItems:'center' };
const title = { fontSize:'64px', fontWeight:'900', color:'#1e293b', lineHeight:'1.1' };
const tagline = { fontSize:'20px', color:'#64748b', margin:'30px 0', lineHeight:'1.6' };
const ctaBtn = { padding:'18px 36px', background:'#1e293b', color:'#fff', borderRadius:'15px', fontSize:'18px', fontWeight:'bold', cursor:'pointer', display:'flex', gap:'12px', border:'none' };
const featuresGrid = { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'30px', padding:'0 10% 100px 10%' };
const featCard = { background:'#fff', padding:'30px', borderRadius:'20px', border:'1px solid #e2e8f0' };