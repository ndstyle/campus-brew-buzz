import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCampus } from "@/hooks/useUserCampus";
import { supabase } from "@/integrations/supabase/client";
import { getSchoolCoordinates } from "@/utils/schoolCoordinates";

const CampusDebugger = () => {
  const { user } = useAuth();
  const { campus, loading } = useUserCampus();

  useEffect(() => {
    const runDiagnostics = async () => {
      console.log("🔬 [CAMPUS DEBUGGER] === COMPREHENSIVE CAMPUS DIAGNOSTIC ===");
      
      // Step 1: Check user authentication
      console.log("🔬 [CAMPUS DEBUGGER] Step 1 - User Authentication:");
      console.log("🔬 [CAMPUS DEBUGGER] User ID:", user?.id);
      console.log("🔬 [CAMPUS DEBUGGER] User Email:", user?.email);
      console.log("🔬 [CAMPUS DEBUGGER] User Metadata:", user?.user_metadata);
      
      // Step 2: Check auth metadata college
      console.log("🔬 [CAMPUS DEBUGGER] Step 2 - Auth Metadata College:");
      const authCollege = user?.user_metadata?.college;
      console.log("🔬 [CAMPUS DEBUGGER] Auth metadata college:", authCollege);
      console.log("🔬 [CAMPUS DEBUGGER] Auth metadata college type:", typeof authCollege);
      
      // Step 3: Check users table college  
      if (user?.id) {
        console.log("🔬 [CAMPUS DEBUGGER] Step 3 - Users Table Query:");
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('id, email, college, username, first_name, last_name')
            .eq('id', user.id)
            .single();
          
          console.log("🔬 [CAMPUS DEBUGGER] Users table query result:", { userData, error });
          console.log("🔬 [CAMPUS DEBUGGER] Users table college:", userData?.college);
          console.log("🔬 [CAMPUS DEBUGGER] Users table college type:", typeof userData?.college);
          
          if (!userData?.college && !authCollege) {
            console.warn("🚨 [CAMPUS DEBUGGER] CRITICAL: No college found in auth metadata OR users table!");
          }
        } catch (dbError) {
          console.error("🔬 [CAMPUS DEBUGGER] Users table query failed:", dbError);
        }
      }
      
      // Step 4: Check useUserCampus hook result
      console.log("🔬 [CAMPUS DEBUGGER] Step 4 - useUserCampus Hook:");
      console.log("🔬 [CAMPUS DEBUGGER] Hook campus result:", campus);
      console.log("🔬 [CAMPUS DEBUGGER] Hook loading:", loading);
      console.log("🔬 [CAMPUS DEBUGGER] Hook campus type:", typeof campus);
      
      // Step 5: Check coordinate mapping
      if (campus) {
        console.log("🔬 [CAMPUS DEBUGGER] Step 5 - Coordinate Mapping:");
        const coordinates = getSchoolCoordinates(campus);
        console.log("🔬 [CAMPUS DEBUGGER] Campus for lookup:", campus);
        console.log("🔬 [CAMPUS DEBUGGER] Coordinates result:", coordinates);
        console.log("🔬 [CAMPUS DEBUGGER] Expected for UIUC: { lat: 40.1020, lng: -88.2272, zoom: 15 }");
        console.log("🔬 [CAMPUS DEBUGGER] Expected for UCLA: { lat: 34.0689, lng: -118.4452, zoom: 15 }");
        
        if (campus.toLowerCase().includes('illinois') || campus.toLowerCase().includes('uiuc')) {
          if (coordinates.lat !== 40.1020 || coordinates.lng !== -88.2272) {
            console.error("🚨 [CAMPUS DEBUGGER] COORDINATE MISMATCH: UIUC should map to Illinois coordinates!");
          } else {
            console.log("✅ [CAMPUS DEBUGGER] UIUC coordinates correct");
          }
        }
        
        if (campus.toLowerCase().includes('ucla') || campus.toLowerCase().includes('los angeles')) {
          if (coordinates.lat !== 34.0689 || coordinates.lng !== -118.4452) {
            console.error("🚨 [CAMPUS DEBUGGER] COORDINATE MISMATCH: UCLA should map to California coordinates!");
          } else {
            console.log("✅ [CAMPUS DEBUGGER] UCLA coordinates correct");
          }
        }
      }
      
      console.log("🔬 [CAMPUS DEBUGGER] === END DIAGNOSTIC ===");
    };

    if (user && !loading) {
      runDiagnostics();
    }
  }, [user, campus, loading]);

  // This component is invisible, just for debugging
  return null;
};

export default CampusDebugger;