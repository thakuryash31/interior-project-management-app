import { supabase } from '../supabase';

export const adminService = {
  // SUPER ADMIN ONLY: Create a new Company + Admin
  async createOrganization({ orgName, adminName, adminEmail, adminPassword }) {
    // 1. Create Org
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: orgName }])
      .select()
      .single();
    if (orgError) throw orgError;

    // 2. Create Auth User (The Org Admin)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
    });
    if (authError) throw authError;

    // 3. Create Profile linked to Org
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        organization_id: org.id,
        full_name: adminName,
        email: adminEmail,
        role: 'admin'
      }]);
    if (profileError) throw profileError;

    return org;
  },

  // ORG ADMIN: Add a team member
  async addTeamMember({ adminId, name, email, password, role }) {
    // 1. Get Admin's Org ID
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', adminId)
      .single();

    if (!adminProfile) throw new Error("Admin profile not found");

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    if (authError) throw authError;

    // 3. Link Profile to SAME Org
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: authData.user.id,
      organization_id: adminProfile.organization_id,
      full_name: name,
      email,
      role
    }]);
    if (profileError) throw profileError;
    
    return true;
  },

  // ORG ADMIN: Get List of Employees
  async getTeamMembers() {
    // RLS in database handles the filtering automatically!
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data;
  }
};