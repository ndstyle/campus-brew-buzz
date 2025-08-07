import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserCampus = () => {
  const [campus, setCampus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    const fetchCampus = async () => {
      if (!user || !session) {
        console.log('🏫 [USER CAMPUS] No user or session available');
        setLoading(false);
        return;
      }

      try {
        console.log(`🏫 [USER CAMPUS] Getting campus for user: ${user.id}`);
        console.log('🏫 [USER CAMPUS] Auth metadata:', user.user_metadata);

        // First, try to get campus from auth metadata
        const authCampus = user.user_metadata?.college;
        console.log('🏫 [USER CAMPUS] Auth metadata college:', authCampus);

        if (authCampus) {
          console.log('🏫 [USER CAMPUS] Found campus in auth metadata:', authCampus);
          setCampus(authCampus);
          setLoading(false);
          return;
        }

        // Fallback: Check users table
        console.log('🏫 [USER CAMPUS] No campus in auth metadata, checking users table...');
        const { data: userData, error } = await supabase
          .from('users')
          .select('college')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ [USER CAMPUS] Error fetching user data:', error);
          console.log('⚠️ [USER CAMPUS] Setting fallback campus due to error');
          setCampus('University of California, Los Angeles'); // Default fallback
        } else if (userData?.college) {
          console.log('✅ [USER CAMPUS] Found campus in users table:', userData.college);
          setCampus(userData.college);
        } else {
          console.log('⚠️ [USER CAMPUS] No campus found in users table, using default');
          
          // CRITICAL FIX: Update users table with college from auth metadata
          if (authCampus) {
            console.log('🔄 [USER CAMPUS] Updating users table with auth metadata college');
            const { error: updateError } = await supabase
              .from('users')
              .update({ college: authCampus })
              .eq('id', user.id);
              
            if (updateError) {
              console.error('❌ [USER CAMPUS] Failed to update users table:', updateError);
            } else {
              console.log('✅ [USER CAMPUS] Successfully updated users table with college');
              setCampus(authCampus);
              setLoading(false);
              return;
            }
          }
          
          setCampus('University of California, Los Angeles'); // Default fallback
        }
      } catch (error) {
        console.error('❌ [USER CAMPUS] Error in fetchCampus:', error);
        setCampus('University of California, Los Angeles'); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCampus();
  }, [user, session]);

  return { campus, loading };
};