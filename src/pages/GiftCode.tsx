import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Gift } from 'lucide-react';
import Notification from '@/components/Notification';

const GiftCodePage = () => {
  const { user, updateUser } = useAuth();
  const { redeemGiftCode, addTransaction } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!user) { navigate('/'); return null; }

  const handleRedeem = () => {
    if (!code.trim()) { setNotification('Please enter a gift code'); return; }
    const amount = redeemGiftCode(code.trim(), user.id);
    if (amount === null) { setNotification('Invalid or already used gift code'); return; }
    updateUser(user.id, { accountBalance: user.accountBalance + amount });
    addTransaction({ userId: user.id, type: 'gift', amount, status: 'completed', description: `Gift code redeemed: ${code}` });
    setCode('');
    setNotification(`Gift code redeemed! +${amount.toLocaleString()} UGX`);
  };

  return (
    <div className="min-h-screen bg-background">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Gift Code</h1>
      </div>
      <div className="px-4 -mt-4">
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Gift size={20} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Redeem Gift Code</h2>
          </div>
          <p className="text-xs text-muted-foreground">Enter your gift code to receive a bonus</p>
          <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-xl glass text-foreground text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
            placeholder="Enter code" />
          <button onClick={handleRedeem} className="w-full btn-accent py-3 text-sm">Redeem</button>
        </div>
      </div>
    </div>
  );
};

export default GiftCodePage;
