import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Make sure this path is correct for your project
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  // We can use the fetchProfile from context if needed, but doing it directly here is often safer for login
  const { fetchProfile } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate with Supabase
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!user) {
        throw new Error("No user returned from login.");
      }

      // 2. Check the User's Role immediately
      // We fetch this directly to know where to redirect BEFORE the context updates
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn("Could not fetch profile role:", profileError);
        // Fallback: Send to dashboard if we can't read the role
        navigate('/dashboard');
        return;
      }

      // 3. The "Traffic Cop" - Redirect based on Role
      if (profile?.role === 'super_admin') {
        console.log("Welcome Super Admin. Redirecting to Admin Panel...");
        navigate('/admin/users'); // CHANGE THIS to your actual admin route
      } else {
        console.log("Welcome User. Redirecting to Dashboard...");
        navigate('/'); 
      }

    } catch (err) {
      console.error("Login Failed:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login to ProjectFlow
        </h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-700" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Signing In...' : 'Login'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;