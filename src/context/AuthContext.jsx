import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Fetch Profile (REAL MODE)
  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      // 1. Get the real profile from the database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.warn("[Auth] Profile fetch warning:", error.message);
        // If no profile exists, we might be a new user, so don't crash.
      }
      
      if (data) {
        console.log("[Auth] Profile loaded:", data.role);
        setProfile(data);
      }
    } catch (err) {
      console.error("[Auth] Profile Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. SAFETY VALVE: Force stop loading after 3 seconds
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.error("⚠️ CRITICAL: Supabase timed out. Forcing app to load.");
        setLoading(false); 
      }
    }, 3000);

    const initAuth = async () => {
      try {
        console.log("[Auth] Checking Session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          console.log("[Auth] Session found for:", session.user.email);
          setUser(session.user);
          // We await this, but if it hangs, the timer above saves us
          await fetchProfile(session.user.id);
        } else {
          console.log("[Auth] No session found.");
        }
      } catch (err) {
        console.error("[Auth] Initialization failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] Event:", event);
      if (session?.user) {
        setUser(session.user);
        if (!profile) await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    role: profile?.role,
    orgId: profile?.organization_id,
    logout: async () => {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    },
    isAdmin: profile?.role === 'super_admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);