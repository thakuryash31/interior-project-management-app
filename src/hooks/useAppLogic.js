import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useAppLogic() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);

  const initialFormState = {
    projectName: '', customerName: '', customerEmail: '', customerPhone: '',
    billingAddress: '', billingCity: '', billingState: '', billingPincode: '', billingCountry: 'India',
    projectAddress: '', projectCity: '', projectState: '', projectPincode: '', projectCountry: 'India'
  };
  const [form, setForm] = useState(initialFormState);

  // 1. Fetch Locations
  useEffect(() => {
    async function fetchMasterLocations() {
      try {
        const { data, error } = await supabase
          .from('master_locations')
          .select('city_name, state_name')
          .eq('is_active', true)
          .order('city_name');

        if (error) throw error;
        setLocationOptions(data);
        const uniqueStates = [...new Set(data.map(item => item.state_name))];
        setAvailableStates(uniqueStates.sort());
      } catch (err) {
        console.error("Error loading locations:", err.message);
      }
    }
    fetchMasterLocations();
  }, []);

  const handleCityChange = (fieldPrefix, city) => {
    const selectedLoc = locationOptions.find(l => l.city_name === city);
    setForm(prev => ({
      ...prev,
      [`${fieldPrefix}City`]: city,
      [`${fieldPrefix}State`]: selectedLoc ? selectedLoc.state_name : prev[`${fieldPrefix}State`]
    }));
  };

  const copyBillingToSite = () => {
    setForm(prev => ({
      ...prev,
      projectAddress: prev.billingAddress,
      projectCity: prev.billingCity,
      projectState: prev.billingState,
      projectPincode: prev.billingPincode
    }));
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select(`*, customers (*), site_location:locations!site_location_id (*), billing_location:locations!billing_location_id (*)`)
        .single();

      if (error) throw error;
      if (selectedProject?.id === projectId) setSelectedProject(data);
      return data;
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  // --- UPDATED CREATE LOGIC ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // A. Create Customer
      const { data: custData, error: custError } = await supabase
        .from('customers')
        .insert([{ full_name: form.customerName, email: form.customerEmail, phone: form.customerPhone }])
        .select().single();
      if (custError) throw new Error(custError.message);

      // B. Create Billing Location
      const { data: billData, error: billError } = await supabase
        .from('locations')
        .insert([{
          address_line: form.billingAddress,
          city: form.billingCity,
          state: form.billingState,
          pincode: form.billingPincode,
          country: form.billingCountry,
          type: 'billing'
        }]).select().single();
      if (billError) throw new Error(billError.message);

      // C. Create Site Location
      const { data: siteData, error: siteError } = await supabase
        .from('locations')
        .insert([{
          address_line: form.projectAddress,
          city: form.projectCity,
          state: form.projectState,
          pincode: form.projectPincode,
          country: form.projectCountry,
          type: 'site'
        }]).select().single();
      if (siteError) throw new Error(siteError.message);

      // --- D. GENERATE SEQUENTIAL ID ---
      // 1. Get the prefix (First 3 chars of city, UPPERCASE)
      const prefix = (form.projectCity || "PRJ").substring(0, 3).toUpperCase();
      
      // 2. Fetch the LAST created project to get its number
      const { data: lastProject } = await supabase
        .from('projects')
        .select('project_id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 3. Calculate next number (Default start: 1000000001)
      let nextNumber = 1000000001; 
      
      if (lastProject && lastProject.project_id) {
        // ID format is usually "ABC-1000000001"
        const parts = lastProject.project_id.split('-');
        if (parts.length === 2) {
          const lastNum = parseInt(parts[1], 10);
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      }

      const customId = `${prefix}-${nextNumber}`; // e.g., MUM-1000000001

      // E. Create Project
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .insert([{
          project_id: customId,
          project_name: form.projectName,
          customer_id: custData.id,
          billing_location_id: billData.id,
          site_location_id: siteData.id,
          current_stage: 1
        }])
        .select(`*, customers (*), site_location:locations!site_location_id (*), billing_location:locations!billing_location_id (*)`)
        .single();

      if (projError) throw new Error(projError.message);

      setShowCreateModal(false);
      setSelectedProject(projData);
      setForm(initialFormState);

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
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