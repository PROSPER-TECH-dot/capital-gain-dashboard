import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  referralCode: string;
  upline?: { username: string; phone: string };
  profilePhoto?: string;
  accountBalance: number;
  rechargeBalance: number;
  cumulativeIncome: number;
  isBanned: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (usernameOrEmail: string, password: string) => boolean;
  register: (data: RegisterData) => boolean;
  logout: () => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  updatePassword: (oldPass: string, newPass: string) => boolean;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
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

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const ADMIN_USER: User = {
  id: 'admin-001',
  username: 'admin',
  email: 'admin@capitalgain.com',
  phone: '0000000000',
  referralCode: 'ADMIN1',
  accountBalance: 0,
  rechargeBalance: 0,
  cumulativeIncome: 0,
  isBanned: false,
  isAdmin: true,
  createdAt: new Date().toISOString(),
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([ADMIN_USER]);
  const [passwords, setPasswords] = useState<Record<string, string>>({ 'admin-001': 'admin123' });

  useEffect(() => {
    const stored = localStorage.getItem('cgi_users');
    const storedPw = localStorage.getItem('cgi_passwords');
    const storedUser = localStorage.getItem('cgi_current_user');
    if (stored) setUsers(JSON.parse(stored));
    if (storedPw) setPasswords(JSON.parse(storedPw));
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('cgi_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cgi_passwords', JSON.stringify(passwords));
  }, [passwords]);

  useEffect(() => {
    if (user) localStorage.setItem('cgi_current_user', JSON.stringify(user));
    else localStorage.removeItem('cgi_current_user');
  }, [user]);

  const login = (usernameOrEmail: string, password: string) => {
    const found = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail));
    if (!found) return false;
    if (found.isBanned) return false;
    if (passwords[found.id] !== password) return false;
    setUser(found);
    return true;
  };

  const register = (data: RegisterData) => {
    if (users.find(u => u.username === data.username || u.email === data.email)) return false;
    const id = 'user-' + Date.now();
    let upline: User['upline'] = undefined;
    if (data.referralCode) {
      const referrer = users.find(u => u.referralCode === data.referralCode);
      if (referrer) upline = { username: referrer.username, phone: referrer.phone };
    }
    const newUser: User = {
      id,
      username: data.username,
      email: data.email,
      phone: data.phone,
      referralCode: generateCode(),
      upline,
      accountBalance: 0,
      rechargeBalance: 0,
      cumulativeIncome: 0,
      isBanned: false,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    setPasswords(prev => ({ ...prev, [id]: data.password }));
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (user?.id === id) setUser(prev => prev ? { ...prev, ...updates } : prev);
  };

  const updatePassword = (oldPass: string, newPass: string) => {
    if (!user) return false;
    if (passwords[user.id] !== oldPass) return false;
    setPasswords(prev => ({ ...prev, [user.id]: newPass }));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, updateUser, updatePassword, setUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
