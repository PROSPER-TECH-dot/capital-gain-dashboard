import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  amount: number;
  daily_return: number;
  start_date: string;
  end_date: string;
  total_earned: number;
  active: boolean;
}

export interface GiftCode {
  id: string;
  code: string;
  min_amount: number;
  max_amount: number;
  max_redemptions: number;
  active: boolean;
  created_at: string;
}

export interface AppSettings {
  id: string;
  website_name: string;
  whatsapp_group: string;
  support_numbers: { name: string; number: string }[];
  min_withdrawal: number;
  min_deposit: number;
  daily_earnings: number;
  min_investment: number;
  check_in_amount: number;
  investment_period: number;
  message_popup_style: string;
}

interface AppContextType {
  transactions: Transaction[];
  investments: Investment[];
  giftCodes: GiftCode[];
  settings: AppSettings;
  addTransaction: (t: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  addInvestment: (i: { user_id: string; amount: number; daily_return: number; start_date: string; end_date: string }) => Promise<void>;
  addGiftCode: (g: { code: string; min_amount: number; max_amount: number; max_redemptions: number }) => Promise<void>;
  toggleGiftCode: (id: string, active: boolean) => Promise<void>;
  redeemGiftCode: (code: string, userId: string) => Promise<number | null>;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
  checkedInToday: (userId: string) => boolean;
  checkIn: (userId: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshInvestments: () => Promise<void>;
  refreshGiftCodes: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  id: '',
  website_name: 'CAPITAL GAIN INVESTMENT',
  whatsapp_group: 'https://chat.whatsapp.com/JyFXB1oYULyGLYo1KbaDg1?mode=gi_t',
  support_numbers: [
    { name: 'Support 1', number: '0730576396' },
    { name: 'Support 2', number: '0727846660' },
  ],
  min_withdrawal: 5000,
  min_deposit: 10000,
  daily_earnings: 12,
  min_investment: 10000,
  check_in_amount: 350,
  investment_period: 60,
  message_popup_style: 'slide',
};

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [todayCheckIns, setTodayCheckIns] = useState<Set<string>>(new Set());

  const refreshTransactions = async () => {
    if (!user) return;
    const { data } = isAdmin
      ? await supabase.from('transactions').select('*').order('created_at', { ascending: false })
      : await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setTransactions(data as Transaction[]);
  };

  const refreshInvestments = async () => {
    if (!user) return;
    const { data } = isAdmin
      ? await supabase.from('investments').select('*').order('created_at', { ascending: false })
      : await supabase.from('investments').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setInvestments(data as Investment[]);
  };

  const refreshGiftCodes = async () => {
    const { data } = await supabase.from('gift_codes').select('*').order('created_at', { ascending: false });
    if (data) setGiftCodes(data as GiftCode[]);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').limit(1).single();
    if (data) setSettings(data as unknown as AppSettings);
  };

  const fetchTodayCheckIns = async () => {
    if (!user) return;
    // Use East Africa Time (UTC+3) for midnight reset
    const now = new Date();
    const eatOffset = 3 * 60; // EAT = UTC+3
    const eatDate = new Date(now.getTime() + eatOffset * 60000);
    const today = eatDate.toISOString().split('T')[0];
    const { data } = await supabase
      .from('check_ins')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('check_in_date', today);
    if (data) setTodayCheckIns(new Set(data.map(d => d.user_id)));
  };

  useEffect(() => {
    if (user) {
      refreshTransactions();
      refreshInvestments();
      refreshGiftCodes();
      fetchSettings();
      fetchTodayCheckIns();
    }
  }, [user, isAdmin]);

  const addTransaction = async (t: Omit<Transaction, 'id' | 'created_at'>) => {
    await supabase.from('transactions').insert(t);
    await refreshTransactions();
  };

  const addInvestment = async (i: { user_id: string; amount: number; daily_return: number; start_date: string; end_date: string }) => {
    await supabase.from('investments').insert({ ...i, total_earned: 0, active: true });
    await refreshInvestments();
  };

  const addGiftCode = async (g: { code: string; min_amount: number; max_amount: number; max_redemptions: number }) => {
    await supabase.from('gift_codes').insert(g as any);
    await refreshGiftCodes();
  };

  const toggleGiftCode = async (id: string, active: boolean) => {
    await supabase.from('gift_codes').update({ active } as any).eq('id', id);
    await refreshGiftCodes();
  };

  const redeemGiftCode = async (code: string, userId: string): Promise<number | null> => {
    // Find the gift code
    const { data: gc } = await supabase
      .from('gift_codes')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .single();
    if (!gc) return null;

    // Check if already redeemed
    const { data: existing } = await supabase
      .from('gift_code_redemptions')
      .select('id')
      .eq('gift_code_id', gc.id)
      .eq('user_id', userId)
      .maybeSingle();
    if (existing) return null;

    const amount = Math.floor(Math.random() * (Number(gc.max_amount) - Number(gc.min_amount) + 1)) + Number(gc.min_amount);

    await supabase.from('gift_code_redemptions').insert({
      gift_code_id: gc.id,
      user_id: userId,
      amount,
    });

    return amount;
  };

  const updateSettings = async (s: Partial<AppSettings>) => {
    if (!settings.id) return;
    await supabase.from('settings').update(s).eq('id', settings.id);
    await fetchSettings();
  };

  const checkedInToday = (userId: string) => todayCheckIns.has(userId);

  const checkIn = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('check_ins').insert({ user_id: userId, check_in_date: today });
    setTodayCheckIns(prev => new Set([...prev, userId]));
  };

  return (
    <AppContext.Provider value={{
      transactions, investments, giftCodes, settings,
      addTransaction, addInvestment, addGiftCode, toggleGiftCode, redeemGiftCode,
      updateSettings, checkedInToday, checkIn,
      refreshTransactions, refreshInvestments, refreshGiftCodes,
    }}>
      {children}
    </AppContext.Provider>
  );
};
