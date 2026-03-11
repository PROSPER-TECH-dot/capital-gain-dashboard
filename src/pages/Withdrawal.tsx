import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, ArrowUpCircle, Phone, Info, Wallet, Clock } from 'lucide-react';
import Notification from '@/components/Notification';
import { supabase } from '@/integrations/supabase/client';

const WithdrawalPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { settings, investments, refreshTransactions } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

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
      setNotification('Insufficient balance. Your account balance is not enough for this withdrawal.'); return;
    }
    if (!phone || phone.length < 10) {
      setNotification('Please enter a valid phone number'); return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: { phone, amount: amt, fee_percent: withdrawalFee },
      });

      if (error || !data?.success) {
        // Show user-friendly error messages
        const errMsg = data?.error || error?.message || '';
        const errLower = errMsg.toLowerCase();
        if (errLower.includes('insufficient') || errLower.includes('balance')) {
          setNotification('Insufficient balance. Your account balance is not enough for this withdrawal.');
        } else if (errLower.includes('active investment')) {
          setNotification('You need an active investment to withdraw funds.');
        } else if (errLower.includes('edge function') || errLower.includes('2xx') || errLower.includes('non-2xx')) {
          setNotification('Withdrawal failed. Please try again later.');
        } else if (errMsg) {
          setNotification(errMsg);
        } else {
          setNotification('Withdrawal failed. Please try again later.');
        }
        setProcessing(false);
        return;
      }

      await refreshProfile();
      await refreshTransactions();
      setAmount('');
      setPhone('');
      setProcessing(false);
      setNotification(data.message || `Withdrew ${amountAfterFee.toLocaleString()} UGX successfully!`);
      setTimeout(() => navigate('/home'), 2000);
    } catch (e: unknown) {
      setProcessing(false);
      setNotification('Withdrawal failed. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Withdrawal</h1>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Available Balance</h2>
          </div>
          <p className="text-2xl font-bold text-primary">{profile.account_balance.toLocaleString()} UGX</p>
          <p className="text-xs text-muted-foreground mt-1">Active Investments: {userActiveInvestments.length}</p>
        </div>

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

              {processing && (
                <div className="glass rounded-xl p-3 mb-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-medium text-primary">Processing withdrawal...</p>
                  </div>
                </div>
              )}

              <button onClick={handleWithdraw} disabled={processing}
                className="w-full btn-accent py-3 text-sm disabled:opacity-50">
                {processing ? 'Processing...' : 'Withdraw Now'}
              </button>

              <button onClick={() => navigate('/history?filter=withdrawal')}
                className="w-full mt-3 flex items-center justify-center gap-2 text-primary text-xs font-medium hover:text-primary/80 transition-colors">
                <Clock size={14} /> View Withdrawal History
              </button>

              <p className="text-[10px] text-center text-muted-foreground mt-2">
                Powered by Capital Gain Pay™ • Instant Withdrawals
              </p>
            </>
          )}
        </div>

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
              <p><span className="text-foreground font-medium">Enter amount</span> — Minimum withdrawal is {settings.min_withdrawal.toLocaleString()} UGX.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <p><span className="text-foreground font-medium">Withdrawal fee</span> — A {withdrawalFee}% fee is deducted from your withdrawal amount.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <p><span className="text-foreground font-medium">Enter phone number</span> — Provide the mobile money number where you want to receive the funds.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
              <p><span className="text-foreground font-medium">Instant withdrawal</span> — Funds are sent instantly to your mobile money number via Capital Gain Pay™.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPage;
