import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Users, ArrowUpDown, Settings, Gift, Menu, X, BarChart3, ChevronRight, Ban, CheckCircle, Edit3, RotateCcw, Search } from 'lucide-react';

const AdminDashboard = () => {
  const { user, users, updateUser } = useAuth();
  const { transactions, giftCodes, settings } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [search, setSearch] = useState('');

  if (!user?.isAdmin) { navigate('/'); return null; }

  const nonAdminUsers = users.filter(u => !u.isAdmin);
  const filteredUsers = nonAdminUsers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toDateString();
  const yesterdayDate = new Date(Date.now() - 86400000).toDateString();
  const todayUsers = nonAdminUsers.filter(u => new Date(u.createdAt).toDateString() === today).length;
  const yesterdayUsers = nonAdminUsers.filter(u => new Date(u.createdAt).toDateString() === yesterdayDate).length;
  const totalDeposits = transactions.filter(t => t.type === 'recharge').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);

  const handleUpdateBalance = (userId: string, field: string, value: number) => {
    updateUser(userId, { [field]: value } as any);
    setEditField(null);
    setEditValue('');
  };

  const menuPages = [
    { label: 'Overview', icon: BarChart3, path: '/admin' },
    { label: 'Transactions', icon: ArrowUpDown, path: '/admin/transactions' },
    { label: 'Gift Codes', icon: Gift, path: '/admin/gift-codes' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Side menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 glass-card h-full p-5 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold font-heading text-foreground">Admin Menu</h2>
              <button onClick={() => setMenuOpen(false)}><X size={20} className="text-foreground" /></button>
            </div>
            {menuPages.map(({ label, icon: Icon, path }) => (
              <button key={path} onClick={() => { navigate(path); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 transition-colors text-left">
                <Icon size={18} className="text-primary" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
            <div className="pt-4 border-t border-border/30">
              <button onClick={() => navigate('/home')} className="w-full px-4 py-3 text-sm text-muted-foreground text-left">
                ← Back to App
              </button>
            </div>
          </div>
          <div className="flex-1 bg-foreground/20" onClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Header */}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(true)}><Menu size={22} className="text-primary-foreground" /></button>
          <h1 className="text-lg font-bold font-heading text-primary-foreground">Admin Panel</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Users', value: nonAdminUsers.length },
            { label: "Today's Users", value: todayUsers },
            { label: "Yesterday's", value: yesterdayUsers },
            { label: 'Total Deposits', value: `${(totalDeposits / 1000).toFixed(0)}k` },
            { label: 'Total Withdrawals', value: `${(totalWithdrawals / 1000).toFixed(0)}k` },
            { label: 'Gift Codes', value: giftCodes.length },
          ].map(({ label, value }) => (
            <div key={label} className="glass-card rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="text-lg font-bold font-heading text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* User search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search users..." />
        </div>

        {/* Users list */}
        <div className="space-y-2">
          {filteredUsers.map(u => (
            <div key={u.id} className="glass-card rounded-2xl p-4">
              <button onClick={() => setSelectedUser(selectedUser === u.id ? null : u.id)}
                className="w-full flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{u.username}</p>
                  <p className="text-[10px] text-muted-foreground">{u.email} • {u.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.isBanned && <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Banned</span>}
                  <ChevronRight size={16} className={`text-muted-foreground transition-transform ${selectedUser === u.id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {selectedUser === u.id && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Account', field: 'accountBalance', value: u.accountBalance },
                      { label: 'Recharge', field: 'rechargeBalance', value: u.rechargeBalance },
                      { label: 'Income', field: 'cumulativeIncome', value: u.cumulativeIncome },
                    ].map(({ label, field, value }) => (
                      <div key={field} className="glass rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-xs font-bold text-foreground">{value.toLocaleString()}</p>
                        <button onClick={() => { setEditField(`${u.id}-${field}`); setEditValue(value.toString()); }}
                          className="text-[10px] text-primary mt-1 flex items-center gap-0.5 mx-auto">
                          <Edit3 size={10} /> Edit
                        </button>
                        {editField === `${u.id}-${field}` && (
                          <div className="mt-1">
                            <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                              className="w-full px-2 py-1 rounded text-xs glass text-foreground" />
                            <button onClick={() => handleUpdateBalance(u.id, field, parseInt(editValue) || 0)}
                              className="mt-1 text-[10px] btn-accent px-2 py-0.5 rounded">Save</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => updateUser(u.id, { isBanned: !u.isBanned })}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 ${
                        u.isBanned ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                      }`}>
                      {u.isBanned ? <><CheckCircle size={12} /> Unban</> : <><Ban size={12} /> Ban</>}
                    </button>
                    <button className="flex-1 py-2 rounded-xl text-xs font-semibold bg-secondary/10 text-secondary flex items-center justify-center gap-1">
                      <RotateCcw size={12} /> Reset Pwd
                    </button>
                  </div>

                  <div className="text-[10px] text-muted-foreground">
                    <p>Referral Code: {u.referralCode}</p>
                    <p>Referrals: {users.filter(x => x.upline?.username === u.username).length}</p>
                    <p>Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
