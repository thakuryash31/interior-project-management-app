import { useAuth } from '../context/AuthContext';

// Define what each role is allowed to do
const ROLE_PERMISSIONS = {
  super_admin: ['all'],
  admin: ['manage_users', 'view_projects', 'edit_projects', 'delete_projects', 'create_projects'],
  
  // Managers
  design_manager: ['view_projects', 'approve_designs', 'assign_designers', 'edit_projects'],
  project_manager: ['view_projects', 'edit_projects', 'manage_timeline', 'create_projects'],
  
  // Heads
  sales_head: ['view_analytics', 'view_all_sales'],
  project_head: ['view_all_projects', 'approve_budgets'],
  
  // Individual Contributors (Limited Access)
  designer: ['view_assigned_projects', 'upload_designs'],
  site_supervisor: ['view_assigned_projects', 'update_site_status'],
  dispatch_executive: ['view_dispatch', 'update_dispatch'],
  
  // Add more specific permissions for other 21 roles here as you need them
};

export function usePermission() {
  const { role } = useAuth();
  const permissions = ROLE_PERMISSIONS[role] || [];

  const can = (action) => {
    if (permissions.includes('all')) return true;
    return permissions.includes(action);
  };

  return { can, role };
}