import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: UserData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  college: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: UserData) => {
    try {
      console.log("🔐 [AUTH CONTEXT] Starting signup process for:", email);
      console.log("🔐 [AUTH CONTEXT] User metadata being saved:", userData);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: userData.username,
            first_name: userData.firstName,
            last_name: userData.lastName,
            college: userData.college,
          }
        }
      });

      console.log("🔐 [AUTH CONTEXT] Supabase auth response:", { data, error });

      if (error) {
        console.error('🔐 [AUTH CONTEXT] Sign up error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Additional verification: Check if user was created and college was saved
        if (data.user) {
          console.log("🔐 [AUTH CONTEXT] User created successfully:", data.user.id);
          console.log("🔐 [AUTH CONTEXT] User metadata:", data.user.user_metadata);
          console.log("🔐 [AUTH CONTEXT] College in metadata:", data.user.user_metadata?.college);
          
          // Verify college was saved to database (with a delay for DB trigger)
          setTimeout(async () => {
            try {
              const { data: userDbData, error: fetchError } = await supabase
                .from('users')
                .select('college')
                .eq('id', data.user.id)
                .single();
              
              console.log("🔐 [AUTH CONTEXT] Database verification result:", { userDbData, fetchError });
              if (userDbData?.college) {
                console.log("✅ [AUTH CONTEXT] Campus saved successfully to database:", userDbData.college);
              } else {
                console.warn("⚠️ [AUTH CONTEXT] Campus NOT found in database!");
              }
            } catch (dbError) {
              console.error("🔐 [AUTH CONTEXT] Database verification failed:", dbError);
            }
          }, 2000);
        }

        toast({
          title: "Welcome to RateUrCoffee!",
          description: `Campus set to: ${userData.college}. Your account has been created successfully.`
        });
      }

      return { error };
    } catch (error: any) {
      console.error('🔐 [AUTH CONTEXT] Unexpected sign up error:', error);
      const errorMessage = error?.message || "An unexpected error occurred";
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      }

      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || "An unexpected error occurred";
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};