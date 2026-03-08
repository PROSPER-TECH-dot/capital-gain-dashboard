import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, ArrowDownCircle } from 'lucide-react';
import Notification from '@/components/Notification';

const RechargePage = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { settings, addTransaction } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!user || !profile) return null;

  const handleRecharge = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < settings.min_deposit) {
      setNotification(`Minimum deposit is ${settings.min_deposit.toLocaleString()} UGX`); return;
    }
    await updateProfile(user.id, {
      recharge_balance: profile.recharge_balance + amt,
      account_balance: profile.account_balance + amt,
    });
    await addTransaction({ user_id: user.id, type: 'recharge', amount: amt, status: 'completed', description: 'Account recharge' });
    await refreshProfile();
    setAmount('');
    setNotification(`Recharged ${amt.toLocaleString()} UGX successfully!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Recharge</h1>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownCircle size={20} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Recharge Amount</h2>
          </div>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl glass text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
            placeholder={`Min ${settings.min_deposit.toLocaleString()} UGX`} />
          <div className="flex flex-wrap gap-2 mb-4">
            {[10000, 20000, 50000, 100000, 200000, 500000].map(v => (
              <button key={v} onClick={() => setAmount(v.toString())}
                className="px-3 py-1.5 rounded-lg glass text-xs font-medium text-foreground hover:bg-primary/10 transition-colors">
                {v.toLocaleString()}
              </button>
            ))}
          </div>
          <button onClick={handleRecharge} className="w-full btn-accent py-3 text-sm">Recharge Now</button>
        </div>
      </div>
    </div>
  );
};

export default RechargePage;
