import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    billingAddress: '',
    billingCity: 'Bangalore',
    billingState: 'Karnataka',
    billingZip: '',
    siteAddress: '',
    siteCity: 'Bangalore',
    siteState: 'Karnataka',
    siteZip: '',
    projectName: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Helper: Generate Random Project ID
  const generateProjectID = () => `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCopyBilling = () => {
    setFormData(prev => ({
      ...prev,
      siteAddress: prev.billingAddress,
      siteCity: prev.billingCity,
      siteState: prev.billingState,
      siteZip: prev.billingZip
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. CREATE CUSTOMER (No address here!)
      const { data: customer, error: custError } = await supabase
        .from('customers')
        .insert([{
          full_name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          // Removed: billing_address (Because it doesn't exist anymore!)
        }])
        .select()
        .single();

      if (custError) throw new Error(`Customer Error: ${custError.message}`);

      // 2. CREATE BILLING LOCATION
      const { data: billingLoc, error: billError } = await supabase
        .from('locations')
        .insert([{
          address_line: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          pincode: formData.billingZip,
          type: 'billing'
        }])
        .select()
        .single();

      if (billError) throw new Error(`Billing Loc Error: ${billError.message}`);

      // 3. CREATE SITE LOCATION
      const { data: siteLoc, error: siteError } = await supabase
        .from('locations')
        .insert([{
          address_line: formData.siteAddress,
          city: formData.siteCity,
          state: formData.siteState,
          pincode: formData.siteZip,
          type: 'site'
        }])
        .select()
        .single();

      if (siteError) throw new Error(`Site Loc Error: ${siteError.message}`);

      // 4. CREATE PROJECT (Link everything together)
      const { data: project, error: projError } = await supabase
        .from('projects')
        .insert([{
          project_id: generateProjectID(),
          project_name: formData.projectName,
          customer_id: customer.id,
          billing_location_id: billingLoc.id,
          site_location_id: siteLoc.id,
          organization_id: user?.user_metadata?.organization_id || null, // Safety Check
          current_stage: 1,
          status: 'active',
          start_date: formData.startDate
        }])
        .select()
        .single();

      if (projError) throw new Error(`Project Error: ${projError.message}`);

      // 5. Initialize Stage 1
      await supabase.from('stage_1_initial').insert([{ project_id: project.id }]);

      alert('Project Created Successfully!');
      navigate('/');

    } catch (err) {
      console.error("Submission Failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Project</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Simplified Form for brevity - Add all your inputs back here */}
        <div className="grid grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Client Name" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required />
          <input className="border p-2 rounded" placeholder="Project Name" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} required />
        </div>
        
        {/* Billing Inputs */}
        <div className="grid grid-cols-2 gap-4">
           <input className="border p-2 rounded" placeholder="Billing Address" value={formData.billingAddress} onChange={e => setFormData({...formData, billingAddress: e.target.value})} />
           <input className="border p-2 rounded" placeholder="Billing City" value={formData.billingCity} onChange={e => setFormData({...formData, billingCity: e.target.value})} />
        </div>

        {/* Site Inputs */}
        <div className="grid grid-cols-2 gap-4">
           <input className="border p-2 rounded" placeholder="Site Address" value={formData.siteAddress} onChange={e => setFormData({...formData, siteAddress: e.target.value})} />
           <input className="border p-2 rounded" placeholder="Site City" value={formData.siteCity} onChange={e => setFormData({...formData, siteCity: e.target.value})} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
};

export default CreateProject;