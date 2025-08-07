import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserCampus = () => {
  const [campus, setCampus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    const getUserCampus = async () => {
      if (!user) {
        console.log("🏫 [USER CAMPUS] No user found, clearing campus");
        setCampus(null);
        setLoading(false);
        return;
      }

      console.log("🏫 [USER CAMPUS] Getting campus for user:", user.id);

      // Try to get campus from auth metadata first
      const authMetadataCollege = user.user_metadata?.college;
      if (authMetadataCollege) {
        console.log("🏫 [USER CAMPUS] Found campus in auth metadata:", authMetadataCollege);
        setCampus(authMetadataCollege);
        setLoading(false);
        return;
      }

      // Fallback: Try to get from users table
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('college')
          .eq('id', user.id)
          .single();

        if (error) {
          console.warn("🏫 [USER CAMPUS] Error fetching user data:", error);
          // Don't throw here, just use fallback
        }

        if (userData?.college) {
          console.log("🏫 [USER CAMPUS] Found campus in users table:", userData.college);
          setCampus(userData.college);
        } else {
          console.log("🏫 [USER CAMPUS] No campus found, using default");
          // Default campus for testing
          setCampus('UCLA');
        }
      } catch (error) {
        console.error("🏫 [USER CAMPUS] Unexpected error:", error);
        // Use default campus as fallback
        setCampus('UCLA');
      }

      setLoading(false);
    };

    getUserCampus();
  }, [user, session]);

  return { campus, loading };
};