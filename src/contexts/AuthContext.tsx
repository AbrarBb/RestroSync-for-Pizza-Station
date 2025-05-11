
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Define user roles
export type UserRole = 'admin' | 'staff' | 'customer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null; 
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  updateUserProfile: (profile: { [key: string]: any }) => Promise<void>;
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Helper function to determine user role
  const determineUserRole = (email: string): UserRole => {
    if (email.includes('admin')) {
      return 'admin';
    } else if (email.includes('staff')) {
      return 'staff';
    } else {
      return 'customer';
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Determine role based on email
        if (session?.user) {
          const email = session.user.email || '';
          const role = determineUserRole(email);
          setUserRole(role);
          console.log('Set user role:', role);
        } else {
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Got existing session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Determine role based on email
      if (session?.user) {
        const email = session.user.email || '';
        const role = determineUserRole(email);
        setUserRole(role);
        console.log('Set user role from existing session:', role);
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Determine role based on email
      const role = determineUserRole(email);
      console.log('Signed in with role:', role);
      
      toast({
        title: 'Sign in successful',
        description: `Welcome back, you've signed in as ${role}`,
      });
      
      // Redirect based on role
      if (role === 'customer') {
        navigate('/customer-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = 'customer') => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role,
          }
        }
      });
      if (error) throw error;
      toast({
        title: 'Sign up successful',
        description: 'Please check your email to confirm your account.',
      });
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Update user profile/metadata
  const updateUserProfile = async (profile: { [key: string]: any }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: profile
      });
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      
      // Update the local user state with new metadata
      if (user) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...profile
          }
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        title: 'Profile update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Add isAdmin helper function
  const isAdmin = () => {
    return userRole === 'admin';
  };
  
  // Add isStaff helper function
  const isStaff = () => {
    return userRole === 'staff';
  };

  const value = {
    user,
    session,
    userRole,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isStaff,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
