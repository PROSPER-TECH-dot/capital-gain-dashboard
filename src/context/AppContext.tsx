import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Transaction {
  id: string;
  userId: string;
  type: 'recharge' | 'withdrawal' | 'investment' | 'earning' | 'checkin' | 'referral' | 'gift';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  description: string;
}

export interface Investment {
  id: string;
  userId: string;
  amount: number;
  dailyReturn: number;
  startDate: string;
  endDate: string;
  totalEarned: number;
  active: boolean;
}

export interface GiftCode {
  id: string;
  code: string;
  minAmount: number;
  maxAmount: number;
  usedBy: string[];
  active: boolean;
}

interface AppSettings {
  websiteName: string;
  whatsappGroup: string;
  supportNumbers: { name: string; number: string }[];
  minWithdrawal: number;
  minDeposit: number;
  dailyEarnings: number;
  minInvestment: number;
  checkInAmount: number;
  investmentPeriod: number;
  messagePopupStyle: string;
}

interface AppContextType {
  transactions: Transaction[];
  investments: Investment[];
  giftCodes: GiftCode[];
  settings: AppSettings;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  addInvestment: (i: Omit<Investment, 'id' | 'totalEarned' | 'active'>) => void;
  addGiftCode: (g: Omit<GiftCode, 'id' | 'usedBy' | 'active'>) => GiftCode;
  redeemGiftCode: (code: string, userId: string) => number | null;
  updateSettings: (s: Partial<AppSettings>) => void;
  checkedInToday: (userId: string) => boolean;
  checkIn: (userId: string) => void;
}

const defaultSettings: AppSettings = {
  websiteName: 'CAPITAL GAIN INVESTMENT',
  whatsappGroup: 'https://chat.whatsapp.com/JyFXB1oYULyGLYo1KbaDg1?mode=gi_t',
  supportNumbers: [
    { name: 'Support 1', number: '0730576396' },
    { name: 'Support 2', number: '0727846660' },
  ],
  minWithdrawal: 5000,
  minDeposit: 10000,
  dailyEarnings: 12,
  minInvestment: 10000,
  checkInAmount: 350,
  investmentPeriod: 60,
  messagePopupStyle: 'slide',
};

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [checkIns, setCheckIns] = useState<Record<string, string>>({});

  useEffect(() => {
    const s = localStorage.getItem('cgi_transactions');
    if (s) setTransactions(JSON.parse(s));
    const i = localStorage.getItem('cgi_investments');
    if (i) setInvestments(JSON.parse(i));
    const g = localStorage.getItem('cgi_giftcodes');
    if (g) setGiftCodes(JSON.parse(g));
    const st = localStorage.getItem('cgi_settings');
    if (st) setSettings(JSON.parse(st));
    const ci = localStorage.getItem('cgi_checkins');
    if (ci) setCheckIns(JSON.parse(ci));
  }, []);

  useEffect(() => { localStorage.setItem('cgi_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('cgi_investments', JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem('cgi_giftcodes', JSON.stringify(giftCodes)); }, [giftCodes]);
  useEffect(() => { localStorage.setItem('cgi_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('cgi_checkins', JSON.stringify(checkIns)); }, [checkIns]);

  const addTransaction = (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev => [{
      ...t,
      id: 'tx-' + Date.now(),
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  const addInvestment = (i: Omit<Investment, 'id' | 'totalEarned' | 'active'>) => {
    setInvestments(prev => [...prev, {
      ...i,
      id: 'inv-' + Date.now(),
      totalEarned: 0,
      active: true,
    }]);
  };

  const addGiftCode = (g: Omit<GiftCode, 'id' | 'usedBy' | 'active'>) => {
    const gc: GiftCode = { ...g, id: 'gc-' + Date.now(), usedBy: [], active: true };
    setGiftCodes(prev => [...prev, gc]);
    return gc;
  };

  const redeemGiftCode = (code: string, userId: string): number | null => {
    const gc = giftCodes.find(g => g.code === code && g.active && !g.usedBy.includes(userId));
    if (!gc) return null;
    const amount = Math.floor(Math.random() * (gc.maxAmount - gc.minAmount + 1)) + gc.minAmount;
    setGiftCodes(prev => prev.map(g => g.id === gc.id ? { ...g, usedBy: [...g.usedBy, userId] } : g));
    return amount;
  };

  const updateSettings = (s: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  };

  const checkedInToday = (userId: string) => {
    const today = new Date().toDateString();
    return checkIns[userId] === today;
  };

  const checkIn = (userId: string) => {
    const today = new Date().toDateString();
    setCheckIns(prev => ({ ...prev, [userId]: today }));
  };

  return (
    <AppContext.Provider value={{ transactions, investments, giftCodes, settings, addTransaction, addInvestment, addGiftCode, redeemGiftCode, updateSettings, checkedInToday, checkIn }}>
      {children}
    </AppContext.Provider>
  );
};
