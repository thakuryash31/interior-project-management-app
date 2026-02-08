import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Ensure this path is correct
import { useAuth } from '../context/AuthContext';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Client
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    
    // Billing Location
    billingAddress: '',
    billingCity: 'Bangalore',
    billingState: 'Karnataka',
    billingZip: '',
    
    // Site Location
    siteAddress: '',
    siteCity: 'Bangalore',
    siteState: 'Karnataka',
    siteZip: '',
    
    // Project
    projectName: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Helper: Generate ID like "PRJ-4821"
  const generateProjectID = () => {
    return `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
  };

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
      console.log("Starting Project Creation...");

      // 1. CREATE CUSTOMER (Only basic info now)
      const { data: customer, error: custError } = await supabase
        .from('customers')
        .insert([{
          full_name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone
        }])
        .select()
        .single();

      if (custError) throw new Error(`Customer Error: ${custError.message}`);
      console.log("Customer Created:", customer.id);

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

      // 4. CREATE PROJECT (Linking everything)
      const newProjectId = generateProjectID();
      
      const { data: project, error: projError } = await supabase
        .from('projects')
        .insert([{
          project_id: newProjectId,
          project_name: formData.projectName,
          customer_id: customer.id,
          billing_location_id: billingLoc.id,
          site_location_id: siteLoc.id,
          organization_id: user?.user_metadata?.organization_id || '00000000-0000-0000-0000-000000000000', // Fallback
          current_stage: 1,
          status: 'active',
          start_date: formData.startDate
        }])
        .select()
        .single();

      if (projError) throw new Error(`Project Error: ${projError.message}`);
      
      console.log("Project Created:", project.id);

      // 5. INITIALIZE STAGE 1 (Optional)
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
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Client Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Full Name" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required />
            <input className="border p-2 rounded" placeholder="Email" type="email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Phone" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} />
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Billing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded md:col-span-2" placeholder="Street Address" value={formData.billingAddress} onChange={e => setFormData({...formData, billingAddress: e.target.value})} />
            <input className="border p-2 rounded" placeholder="City" value={formData.billingCity} onChange={e => setFormData({...formData, billingCity: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Pincode" value={formData.billingZip} onChange={e => setFormData({...formData, billingZip: e.target.value})} />
          </div>
        </div>

        {/* Site Location */}
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <h3 className="text-lg font-medium text-gray-900">Site Location</h3>
            <button type="button" onClick={handleCopyBilling} className="text-blue-600 text-sm hover:underline">Copy from Billing</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded md:col-span-2" placeholder="Site Address" value={formData.siteAddress} onChange={e => setFormData({...formData, siteAddress: e.target.value})} />
            <input className="border p-2 rounded" placeholder="City" value={formData.siteCity} onChange={e => setFormData({...formData, siteCity: e.target.value})} />
            <input className="border p-2 rounded" placeholder="Pincode" value={formData.siteZip} onChange={e => setFormData({...formData, siteZip: e.target.value})} />
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Project Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" placeholder="Project Name" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} required />
            <input className="border p-2 rounded" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Creating Project...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
};

export default CreateProject;