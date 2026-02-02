import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from "firebase/firestore";
import { PlusCircle, Hash } from 'lucide-react';

export default function CreateProject() {
  const [formData, setFormData] = useState({
    projectName: '',
    customerName: '',
    projectCity: '',
    projectAddress: '',
    customerCity: '',
    customerAddress: ''
  });

  // Function to generate a random 10-digit ID
  const generateID = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectId = generateID();
    
    try {
      await addDoc(collection(db, "projects"), {
        ...formData,
        projectId: projectId,
        createdAt: new Date()
      });
      alert(`Project Created Successfully! ID: ${projectId}`);
      setFormData({ projectName: '', customerName: '', projectCity: '', projectAddress: '', customerCity: '', customerAddress: '' });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><PlusCircle /> Create New Project</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
        <input required placeholder="Project Name" value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} style={inputStyle} />
        <input required placeholder="Customer Name" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} style={inputStyle} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input required placeholder="Project City" value={formData.projectCity} onChange={(e) => setFormData({...formData, projectCity: e.target.value})} style={inputStyle} />
          <input required placeholder="Customer City" value={formData.customerCity} onChange={(e) => setFormData({...formData, customerCity: e.target.value})} style={inputStyle} />
        </div>

        <textarea placeholder="Project Address" value={formData.projectAddress} onChange={(e) => setFormData({...formData, projectAddress: e.target.value})} style={inputStyle} />
        <textarea placeholder="Customer Address" value={formData.customerAddress} onChange={(e) => setFormData({...formData, customerAddress: e.target.value})} style={inputStyle} />
        
        <button type="submit" style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Save Project to Database
        </button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' };