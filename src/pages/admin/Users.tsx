import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Search, Ban, CheckCircle, ChevronRight, Plus, Minus, KeyRound } from 'lucide-react';
import Notification from '@/components/Notification';
import { supabase } from '@/integrations/supabase/client';

const AdminUsers = () => {
  const { isAdmin, profiles, updateProfile, refreshProfiles } = useAuth();
  const { addTransaction } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditField, setCreditField] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [newPasswordResult, setNewPasswordResult] = useState<string | null>(null);

  if (!isAdmin) { navigate('/'); return null; }

  const allProfiles = profiles;
  const filtered = allProfiles.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const handleCredit = async (userId: string, field: string, amount: number) => {
    if (!amount || amount === 0) { setNotification('Please enter an amount'); return; }
    const prof = profiles.find(p => p.user_id === userId);
    if (!prof) return;

    try {
      if (field === 'account_balance') {
        const currentBalance = Number(prof.account_balance) || 0;
        const currentIncome = Number(prof.cumulative_income) || 0;
        const newBalance = currentBalance + amount;
        if (newBalance < 0) { setNotification('Balance cannot go below 0'); return; }

        const updates: any = { account_balance: newBalance };
        // Credit to account_balance also updates cumulative_income
        if (amount > 0) {
          updates.cumulative_income = currentIncome + amount;
        }
        await updateProfile(userId, updates);
      } else if (field === 'recharge_balance') {
        const currentRecharge = Number(prof.recharge_balance) || 0;
        const currentBalance = Number(prof.account_balance) || 0;
        const newRecharge = currentRecharge + amount;
        const newBalance = currentBalance + amount;
        if (newRecharge < 0) { setNotification('Recharge balance cannot go below 0'); return; }
        if (newBalance < 0) { setNotification('Account balance cannot go below 0'); return; }

        await updateProfile(userId, {
          recharge_balance: newRecharge,
          account_balance: newBalance,
        } as any);
      }

      // Log transaction
      const txType = amount > 0 ? 'admin_credit' : 'admin_debit';
      const fieldLabel = field === 'account_balance' ? 'account balance' : 'recharge balance';
      const txDesc = amount > 0
        ? `Admin credited ${Math.abs(amount).toLocaleString()} UGX to ${fieldLabel}`
        : `Admin debited ${Math.abs(amount).toLocaleString()} UGX from ${fieldLabel}`;

      await addTransaction({
        user_id: userId,
        type: txType,
        amount: Math.abs(amount),
        status: 'completed',
        description: txDesc,
      });

      await refreshProfiles();
      setCreditAmount('');
      setCreditField(null);
      setNotification(`${amount > 0 ? 'Credited' : 'Debited'} ${Math.abs(amount).toLocaleString()} UGX successfully!`);
    } catch (err: any) {
      setNotification(`Failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    try {
      await updateProfile(userId, { is_banned: !currentlyBanned });
      await refreshProfiles();
      setNotification(currentlyBanned ? 'User unbanned successfully!' : 'User banned successfully!');
    } catch (err: any) {
      setNotification(`Failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleResetPassword = async (userId: string, username: string) => {
    setResettingPassword(userId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { target_user_id: userId },
      });

      if (error || !data?.success) {
        setNotification(data?.error || error?.message || 'Password reset failed');
        setResettingPassword(null);
        return;
      }

      setNewPasswordResult(`New password for ${username}: ${data.new_password}`);
      setNotification(`Password reset for ${username} successful!`);
    } catch (err: any) {
      setNotification(`Failed: ${err.message || 'Unknown error'}`);
    }
    setResettingPassword(null);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Manage Users</h1>
        <span className="ml-auto text-xs text-primary-foreground/70">{allProfiles.length} users</span>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search by name, email, or phone..." />
        </div>

        {/* Password Result Banner */}
        {newPasswordResult && (
          <div className="glass-card rounded-2xl p-4 border-2 border-primary/30 bg-primary/5">
            <p className="text-xs font-bold text-primary mb-1">🔑 Password Reset Result</p>
            <p className="text-sm font-mono text-foreground break-all">{newPasswordResult}</p>
            <button onClick={() => {
              navigator.clipboard.writeText(newPasswordResult.split(': ').pop() || '');
              setNotification('Password copied!');
            }} className="mt-2 text-xs text-primary font-semibold">📋 Copy Password</button>
            <button onClick={() => setNewPasswordResult(null)} className="mt-2 ml-4 text-xs text-muted-foreground">Dismiss</button>
          </div>
        )}

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
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Account', value: Number(u.account_balance) },
                      { label: 'Recharge', value: Number(u.recharge_balance) },
                      { label: 'Income', value: Number(u.cumulative_income) },
                    ].map(({ label, value }) => (
                      <div key={label} className="glass rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="text-xs font-bold text-foreground">{value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

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

                  {/* Reset Password */}
                  <button
                    onClick={() => handleResetPassword(u.user_id, u.username)}
                    disabled={resettingPassword === u.user_id}
                    className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 bg-secondary/20 text-foreground disabled:opacity-50">
                    <KeyRound size={12} />
                    {resettingPassword === u.user_id ? 'Resetting...' : 'Reset Password'}
                  </button>

                  {/* Ban/Unban */}
                  <button onClick={() => handleBanToggle(u.user_id, u.is_banned)}
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
