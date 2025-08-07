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
      console.log("🏫 [USER CAMPUS] Auth metadata:", user.user_metadata);
      console.log("🏫 [USER CAMPUS] Auth metadata college:", user.user_metadata?.college);

      // Try to get campus from auth metadata first
      const authMetadataCollege = user.user_metadata?.college;
      if (authMetadataCollege) {
        console.log("🏫 [USER CAMPUS] Found campus in auth metadata:", authMetadataCollege);
        setCampus(authMetadataCollege);
        setLoading(false);
        return;
      }

      // Fallback: Try to get from users table
      console.log("🏫 [USER CAMPUS] No campus in auth metadata, checking users table...");
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('college')
          .eq('id', user.id)
          .single();

        console.log("🏫 [USER CAMPUS] Users table query result:", { userData, error });

        if (error) {
          console.warn("🏫 [USER CAMPUS] Error fetching user data:", error);
          // Don't throw here, just use fallback
        }

        if (userData?.college) {
          console.log("🏫 [USER CAMPUS] Found campus in users table:", userData.college);
          setCampus(userData.college);
        } else {
          console.log("🏫 [USER CAMPUS] No campus found anywhere, using default UCLA");
          // Default campus for testing - make sure it's UCLA
          setCampus('University of California, Los Angeles');
        }
      } catch (error) {
        console.error("🏫 [USER CAMPUS] Unexpected error:", error);
        // Use default campus as fallback
        console.log("🏫 [USER CAMPUS] Using fallback campus: University of California, Los Angeles");
        setCampus('University of California, Los Angeles');
      }

      setLoading(false);
    };

    getUserCampus();
  }, [user, session]);

  return { campus, loading };
};