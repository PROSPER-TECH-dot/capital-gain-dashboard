import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, ArrowUpCircle, Phone, Info, Wallet } from 'lucide-react';
import Notification from '@/components/Notification';

const WithdrawalPage = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { settings, addTransaction, investments } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!user || !profile) return null;

  const userActiveInvestments = investments.filter(i => i.user_id === user.id && i.active);
  const hasActiveInvestment = userActiveInvestments.length > 0;
  const withdrawalFee = (settings as any).withdrawal_fee ?? 15;
  const amt = parseInt(amount) || 0;
  const feeAmount = amt * withdrawalFee / 100;
  const amountAfterFee = amt - feeAmount;

  const handleWithdraw = async () => {
    if (!hasActiveInvestment) {
      setNotification('You need an active investment to withdraw funds'); return;
    }
    if (!amt || amt < settings.min_withdrawal) {
      setNotification(`Minimum withdrawal is ${settings.min_withdrawal.toLocaleString()} UGX`); return;
    }
    if (amt > profile.account_balance) {
      setNotification('Insufficient balance'); return;
    }
    if (!phone || phone.length < 10) {
      setNotification('Please enter a valid phone number'); return;
    }
    await updateProfile(user.id, { account_balance: profile.account_balance - amt });
    await addTransaction({ user_id: user.id, type: 'withdrawal', amount: amountAfterFee, status: 'completed', description: `Withdrawal to ${phone} (Fee: ${withdrawalFee}%)` });
    await refreshProfile();
    setAmount('');
    setPhone('');
    setNotification(`Withdrew ${amountAfterFee.toLocaleString()} UGX successfully! (${withdrawalFee}% fee deducted)`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Withdrawal</h1>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        {/* Available Balance */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Available Balance</h2>
          </div>
          <p className="text-2xl font-bold text-primary">{profile.account_balance.toLocaleString()} UGX</p>
          <p className="text-xs text-muted-foreground mt-1">Active Investments: {userActiveInvestments.length}</p>
        </div>

        {/* Withdraw Form */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle size={20} className="text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Withdraw Funds</h2>
          </div>
          {!hasActiveInvestment ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full glass flex items-center justify-center mx-auto mb-4">
                <ArrowUpCircle size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Active Investment Required</h3>
              <p className="text-xs text-muted-foreground mb-4">You need to have an active investment to withdraw funds</p>
              <button onClick={() => navigate('/invest')} className="btn-accent px-6 py-2 text-xs">Start Investing</button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-1 block">Withdrawal Amount (UGX)</label>
                <input 
                  type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={`Min ${settings.min_withdrawal.toLocaleString()} UGX`} 
                />
              </div>

              {amt > 0 && (
                <div className="glass rounded-xl p-3 mb-4 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Withdrawal Amount</span>
                    <span className="font-semibold text-foreground">{amt.toLocaleString()} UGX</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Fee ({withdrawalFee}%)</span>
                    <span className="font-semibold text-destructive">-{feeAmount.toFixed(2)} UGX</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-border/30">
                    <span className="text-muted-foreground font-medium">You will receive</span>
                    <span className="font-bold text-primary">{amountAfterFee.toFixed(2)} UGX</span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={14} className="text-primary" />
                  <label className="text-xs text-muted-foreground">Phone Number to withdraw to</label>
                </div>
                <input 
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter mobile money number e.g. 0771234567" 
                />
              </div>

              <button onClick={handleWithdraw} className="w-full btn-accent py-3 text-sm">Withdraw Now</button>
            </>
          )}
        </div>

        {/* Withdrawal Instructions */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-primary" />
            <h2 className="text-sm font-semibold font-heading text-foreground">Withdrawal Instructions</h2>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <p><span className="text-foreground font-medium">Active investment required</span> — You must have at least one active investment to withdraw funds.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <p><span className="text-foreground font-medium">Enter amount</span> — Minimum withdrawal is {settings.min_withdrawal.toLocaleString()} UGX. Enter the amount you want to withdraw.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <p><span className="text-foreground font-medium">Withdrawal fee</span> — A {withdrawalFee}% fee is deducted from your withdrawal amount. The actual amount you receive is shown before confirming.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <p><span className="text-foreground font-medium">Enter phone number</span> — Provide the mobile money number where you want to receive the funds.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
              <p><span className="text-foreground font-medium">Receive funds</span> — After confirming, the funds will be sent to your mobile money account.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPage;
