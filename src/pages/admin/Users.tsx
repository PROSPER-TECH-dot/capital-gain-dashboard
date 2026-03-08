import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Search, Edit3, Ban, CheckCircle, ChevronRight, Plus, Minus } from 'lucide-react';
import Notification from '@/components/Notification';

const AdminUsers = () => {
  const { user, isAdmin, profiles, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditField, setCreditField] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isAdmin) { navigate('/'); return null; }

  const nonAdminProfiles = profiles.filter(p => p.user_id !== user?.id);
  const filtered = nonAdminProfiles.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const handleCredit = async (userId: string, field: string, amount: number) => {
    const prof = profiles.find(p => p.user_id === userId);
    if (!prof) return;
    const current = Number((prof as any)[field]) || 0;
    const newVal = current + amount;
    if (newVal < 0) { setNotification('Balance cannot go below 0'); return; }
    await updateProfile(userId, { [field]: newVal } as any);
    setCreditAmount('');
    setCreditField(null);
    setNotification(`${amount > 0 ? 'Credited' : 'Debited'} ${Math.abs(amount).toLocaleString()} UGX`);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Manage Users</h1>
        <span className="ml-auto text-xs text-primary-foreground/70">{nonAdminProfiles.length} users</span>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search by name, email, or phone..." />
        </div>

        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="glass-card rounded-2xl p-4">
              <button onClick={() => setSelectedUser(selectedUser === u.user_id ? null : u.user_id)}
                className="w-full flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{u.username}</p>
                  <p className="text-[10px] text-muted-foreground">{u.email}</p>
                  <p className="text-[10px] text-muted-foreground">{u.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_banned && <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Banned</span>}
                  <ChevronRight size={16} className={`text-muted-foreground transition-transform ${selectedUser === u.user_id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {selectedUser === u.user_id && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-3 animate-fade-in">
                  {/* Balance overview */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Account', field: 'account_balance', value: Number(u.account_balance) },
                      { label: 'Recharge', field: 'recharge_balance', value: Number(u.recharge_balance) },
                      { label: 'Income', field: 'cumulative_income', value: Number(u.cumulative_income) },
                    ].map(({ label, field, value }) => (
                      <div key={field} className="glass rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-xs font-bold text-foreground">{value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Credit / Debit controls */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground font-semibold">Credit / Debit Balance</p>
                    <div className="flex gap-2">
                      {['account_balance', 'recharge_balance'].map(f => (
                        <button key={f} onClick={() => setCreditField(creditField === `${u.user_id}-${f}` ? null : `${u.user_id}-${f}`)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                            creditField === `${u.user_id}-${f}` ? 'bg-primary text-primary-foreground' : 'glass text-foreground'
                          }`}>
                          {f === 'account_balance' ? 'Account' : 'Recharge'}
                        </button>
                      ))}
                    </div>

                    {creditField?.startsWith(u.user_id) && (
                      <div className="flex gap-2 items-center">
                        <input type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl glass text-sm text-foreground focus:outline-none"
                          placeholder="Amount" />
                        <button onClick={() => handleCredit(u.user_id, creditField.split('-').slice(1).join('-'), parseInt(creditAmount) || 0)}
                          className="p-2 rounded-xl bg-primary/10 text-primary"><Plus size={16} /></button>
                        <button onClick={() => handleCredit(u.user_id, creditField.split('-').slice(1).join('-'), -(parseInt(creditAmount) || 0))}
                          className="p-2 rounded-xl bg-destructive/10 text-destructive"><Minus size={16} /></button>
                      </div>
                    )}
                  </div>

                  {/* Ban toggle */}
                  <button onClick={() => updateProfile(u.user_id, { is_banned: !u.is_banned })}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 ${
                      u.is_banned ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
                    }`}>
                    {u.is_banned ? <><CheckCircle size={12} /> Unban User</> : <><Ban size={12} /> Ban User</>}
                  </button>

                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <p>Referral: {u.referral_code}</p>
                    <p>Joined: {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
