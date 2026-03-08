import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, ArrowUpCircle } from 'lucide-react';
import Notification from '@/components/Notification';

const WithdrawalPage = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { settings, addTransaction, investments } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!user || !profile) return null;

  const userActiveInvestments = investments.filter(i => i.user_id === user.id && i.active);
  const hasActiveInvestment = userActiveInvestments.length > 0;

  const handleWithdraw = async () => {
    if (!hasActiveInvestment) {
      setNotification('You need an active investment to withdraw funds'); return;
    }
    
    const amt = parseInt(amount);
    if (!amt || amt < settings.min_withdrawal) {
      setNotification(`Minimum withdrawal is ${settings.min_withdrawal.toLocaleString()} UGX`); return;
    }
    if (amt > profile.account_balance) {
      setNotification('Insufficient balance'); return;
    }
    await updateProfile(user.id, { account_balance: profile.account_balance - amt });
    await addTransaction({ user_id: user.id, type: 'withdrawal', amount: amt, status: 'completed', description: 'Withdrawal' });
    await refreshProfile();
    setAmount('');
    setNotification(`Withdrew ${amt.toLocaleString()} UGX successfully!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Withdrawal</h1>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
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
              <button 
                onClick={() => navigate('/invest')}
                className="btn-accent px-6 py-2 text-xs"
              >
                Start Investing
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mb-4">
                Available: {profile.account_balance.toLocaleString()} UGX • 
                Active Investments: {userActiveInvestments.length}
              </p>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
                placeholder={`Min ${settings.min_withdrawal.toLocaleString()} UGX`} 
              />
              <button onClick={handleWithdraw} className="w-full btn-accent py-3 text-sm">
                Withdraw Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalPage;
