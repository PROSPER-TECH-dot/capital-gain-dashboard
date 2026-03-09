import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Gift, Info } from 'lucide-react';
import Notification from '@/components/Notification';

const GiftCodePage = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { redeemGiftCode, addTransaction } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!user || !profile) return null;

  const handleRedeem = async () => {
    if (!code.trim()) { setNotification('Please enter a gift code'); return; }
    const amount = await redeemGiftCode(code.trim(), user.id);
    if (amount === null) { setNotification('Invalid or already used gift code'); return; }
    await updateProfile(user.id, { 
      account_balance: profile.account_balance + amount,
      cumulative_income: profile.cumulative_income + amount,
    });
    await addTransaction({ user_id: user.id, type: 'gift', amount, status: 'completed', description: `Gift code redeemed: ${code}` });
    await refreshProfile();
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
      <div className="px-4 -mt-4 space-y-4">
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

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-primary" />
            <h2 className="text-sm font-semibold font-heading text-foreground">How to Redeem Gift Codes</h2>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <p><span className="text-foreground font-medium">Get a gift code</span> — Gift codes are shared by admins during promotions, giveaways, or special events on WhatsApp group.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <p><span className="text-foreground font-medium">Enter the code</span> — Type or paste the gift code exactly as received in the input field above.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <p><span className="text-foreground font-medium">Tap "Redeem"</span> — Click the redeem button to claim your bonus. The amount will be added to your account balance.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <p><span className="text-foreground font-medium">Receive bonus</span> — Once redeemed, the bonus amount (random between min and max) is instantly credited to your account.</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl glass">
            <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">Note:</span> Each gift code can only be redeemed once per user. Codes may have limited redemptions available.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCodePage;
