import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useAppLogic() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State for "Create Project"
  const [form, setForm] = useState({
    projectName: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPincode: '',
    projectAddress: '',
    projectCity: '',
    projectState: '',
    projectPincode: ''
  });

  // Dropdown Data
  const locationOptions = [
    { city_name: "Bangalore", state: "Karnataka" },
    { city_name: "Mumbai", state: "Maharashtra" },
    { city_name: "Delhi", state: "Delhi" },
    { city_name: "Hyderabad", state: "Telangana" },
    { city_name: "Chennai", state: "Tamil Nadu" }
  ];

  const availableStates = [
    "Karnataka", "Maharashtra", "Delhi", "Telangana", "Tamil Nadu", "Kerala", "Gujarat"
  ];

  // --- HANDLER: City Selection Auto-fills State ---
  const handleCityChange = (type, city) => {
    const loc = locationOptions.find(l => l.city_name === city);
    const state = loc ? loc.state : '';
    
    if (type === 'billing') {
      setForm(prev => ({ ...prev, billingCity: city, billingState: state }));
    } else {
      setForm(prev => ({ ...prev, projectCity: city, projectState: state }));
    }
  };

  // --- HANDLER: Copy Address Button ---
  const copyBillingToSite = () => {
    setForm(prev => ({
      ...prev,
      projectAddress: prev.billingAddress,
      projectCity: prev.billingCity,
      projectState: prev.billingState,
      projectPincode: prev.billingPincode
    }));
  };

  // --- HANDLER: Create New Project ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create/Find Customer
      // (In a real app, you might check if email exists first)
      const { data: customer, error: custError } = await supabase
        .from('customers')
        .insert([{
          full_name: form.customerName,
          email: form.customerEmail,
          phone: form.customerPhone,
          billing_address: form.billingAddress,
          city: form.billingCity,
          state: form.billingState,
          pincode: form.billingPincode
        }])
        .select()
        .single();

      if (custError) throw custError;

      // 2. Create Site Location
      const { data: location, error: locError } = await supabase
        .from('locations')
        .insert([{
          address_line_1: form.projectAddress,
          city: form.projectCity,
          state: form.projectState,
          pincode: form.projectPincode
        }])
        .select()
        .single();

      if (locError) throw locError;

      // 3. Create Project
      // We grab the current user to set the 'owner' (handled by RLS usually, but good to be explicit)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch Org ID for the user
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const { error: projError } = await supabase
        .from('projects')
        .insert([{
          project_name: form.projectName,
          customer_id: customer.id,
          site_location_id: location.id,
          project_status: 'Active',
          current_stage: 1,
          organization_id: profile?.organization_id // Link to Org
        }]);

      if (projError) throw projError;

      // Reset & Close
      setShowCreateModal(false);
      setForm({
        projectName: '', customerName: '', customerEmail: '', customerPhone: '',
        billingAddress: '', billingCity: '', billingState: '', billingPincode: '',
        projectAddress: '', projectCity: '', projectState: '', projectPincode: ''
      });
      
      // Optional: Trigger a refresh or alert
      alert("Project created successfully!");
      // window.location.reload(); // Simple way to refresh dashboard

    } catch (err) {
      alert("Error creating project: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: Update Project Data ---
  const handleUpdateProject = async (projectId, updates) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;
      
      // Update local state if the selected project is the one being updated
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(prev => ({ ...prev, ...updates }));
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update project.");
    }
  };

  return {
    selectedProject, setSelectedProject,
    showCreateModal, setShowCreateModal,
    loading,
    form, setForm,
    locationOptions, availableStates,
    handleCityChange, copyBillingToSite,
    handleUpdateProject, handleCreateProject
  };
}