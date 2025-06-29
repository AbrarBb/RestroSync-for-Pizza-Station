
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'staff' | 'customer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoading: boolean;
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
  const [loading, setLoading] = useState(true);

  const determineUserRole = (email: string | undefined): UserRole => {
    if (!email) return 'customer';
    
    if (email === 'admin@pizzastation.com') return 'admin';
    if (email === 'staff@pizzastation.com') return 'staff';
    if (email.includes('@pizzastation.com')) return 'staff';
    
    return 'customer';
  };

  const logSecurityEvent = (eventType: string, details: any) => {
    console.log(`[SECURITY] ${eventType}:`, details);
    // In a real application, you would send this to your logging service
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Log authentication events for security monitoring
        if (event === 'SIGNED_IN') {
          logSecurityEvent('USER_SIGNED_IN', {
            user_email: session?.user?.email,
            timestamp: new Date().toISOString()
          });
        } else if (event === 'SIGNED_OUT') {
          logSecurityEvent('USER_SIGNED_OUT', {
            timestamp: new Date().toISOString()
          });
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const role = determineUserRole(session.user.email);
          setUserRole(role);
          console.log('User role determined:', role);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = determineUserRole(session.user.email);
        setUserRole(role);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Basic input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        logSecurityEvent('FAILED_SIGN_IN_ATTEMPT', {
          email: email.toLowerCase().trim(),
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      if (data.user) {
        const role = determineUserRole(data.user.email);
        toast({
          title: "Welcome back!",
          description: `Signed in successfully as ${role}`,
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: string = 'customer') => {
    try {
      setLoading(true);
      
      // Enhanced input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role
          }
        }
      });

      if (error) {
        logSecurityEvent('FAILED_SIGN_UP_ATTEMPT', {
          email: email.toLowerCase().trim(),
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      logSecurityEvent('USER_SIGNED_UP', {
        email: email.toLowerCase().trim(),
        role: role,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Clear state immediately
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      
      // Redirect to home page after successful signout
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    userRole,
    signIn,
    signUp,
    signOut,
    loading,
    isLoading: loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
