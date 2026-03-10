import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  phone: string;
  referral_code: string;
  upline_user_id: string | null;
  profile_photo: string | null;
  account_balance: number;
  recharge_balance: number;
  cumulative_income: number;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  profiles: Profile[];
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: RegisterData) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (userId: string, updates: Partial<Profile>) => Promise<void>;
  updatePassword: (newPass: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) setProfile(data as Profile);
    return data as Profile | null;
  };

  const fetchIsAdmin = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const refreshProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setProfiles(data as Profile[]);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        await Promise.all([fetchProfile(u.id), fetchIsAdmin(u.id), refreshProfiles()]);
      }
      if (mounted) setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        // Fire and forget — don't await inside auth callback
        fetchProfile(u.id);
        fetchIsAdmin(u.id);
        refreshProfiles();
      } else {
        setProfile(null);
        setIsAdmin(false);
        setProfiles([]);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    const identifier = emailOrUsername.trim();

    const { data, error } = await supabase.functions.invoke('username-login', {
      body: { identifier, password },
    });

    if (error) return { error: error.message };

    const session = (data as any)?.session;
    if (!session?.access_token || !session?.refresh_token) {
      return { error: (data as any)?.error || 'Login failed' };
    }

    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (setSessionError) return { error: setSessionError.message };
    return {};
  };

  const register = async (data: RegisterData) => {
    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', data.username)
      .maybeSingle();
    if (existing) return { error: 'Username already exists' };

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          phone: data.phone,
          referral_code: data.referralCode || '',
        },
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) {
      console.error('updateProfile error:', error);
      throw error;
    }
    // Refresh
    if (userId === user?.id) await fetchProfile(userId);
    await refreshProfiles();
  };

  const updatePassword = async (newPass: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) return { error: error.message };
    return {};
  };

  return (
    <AuthContext.Provider value={{
      user, profile, profiles, isAdmin, loading,
      login, register, logout, updateProfile, updatePassword,
      refreshProfile, refreshProfiles,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
