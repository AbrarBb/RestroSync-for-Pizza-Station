
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export type UserRole = "admin" | "staff" | "customer";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  isSupabaseConnected: boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const supabase = getSupabase();
      setIsSupabaseConnected(true);
      
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Get user role from local storage if exists
        if (session?.user) {
          const storedRole = localStorage.getItem(`userRole_${session.user.id}`);
          setUserRole(storedRole as UserRole || "customer");
        }
        
        setIsLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Get user role when auth state changes
          if (session?.user) {
            const storedRole = localStorage.getItem(`userRole_${session.user.id}`);
            setUserRole(storedRole as UserRole || "customer");
          } else {
            setUserRole(null);
          }
          
          setIsLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error("Supabase connection error:", error);
      setIsSupabaseConnected(false);
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string, role: UserRole = "customer") => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Store role in local storage
        localStorage.setItem(`userRole_${data.user.id}`, role);
        setUserRole(role);
        
        toast({
          title: "Welcome back!",
          description: `You've successfully signed in as ${role}.`,
        });
        
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = "customer") => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Store role in local storage
        localStorage.setItem(`userRole_${data.user.id}`, role);
        setUserRole(role);
        
        toast({
          title: "Account created",
          description: "Please check your email for verification.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      // Clear role from local storage
      if (user?.id) {
        localStorage.removeItem(`userRole_${user.id}`);
      }
      setUserRole(null);
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isAdmin = () => userRole === "admin";

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        session, 
        userRole,
        isLoading, 
        signIn, 
        signUp, 
        signOut, 
        isSupabaseConnected,
        isAdmin 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
