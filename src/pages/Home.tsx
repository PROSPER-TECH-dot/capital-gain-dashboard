import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Wallet, ArrowDownCircle, ArrowUpCircle, CalendarCheck, Clock } from 'lucide-react';
import LiveTicker from '@/components/LiveTicker';
import Notification from '@/components/Notification';

const heroImages = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1553729459-uj8ax09dq67?w=800&h=300&fit=crop',
];

const HomePage = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { transactions, settings, checkedInToday, checkIn, addTransaction } = useApp();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDir('left');
      setCurrentImage(prev => (prev + 1) % heroImages.length);
    }, 2300);
    return () => clearInterval(interval);
  }, []);

  if (!user || !profile) return null;

  const handleCheckIn = async () => {
    if (checkedInToday(user.id)) {
      setNotification('You have already checked in today!');
      return;
    }
    await checkIn(user.id);
    await updateProfile(user.id, { account_balance: profile.account_balance + settings.check_in_amount });
    await addTransaction({ user_id: user.id, type: 'checkin', amount: settings.check_in_amount, status: 'completed', description: 'Daily check-in bonus' });
    await refreshProfile();
    setNotification(`Check-in successful! +${settings.check_in_amount} UGX`);
  };

  const userTransactions = transactions.filter(t => t.user_id === user.id);
  const formatAmount = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen pb-20 bg-background">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}

      <div className="relative w-full h-44 overflow-hidden rounded-b-3xl z-0">
        {heroImages.map((img, i) => {
          const isActive = i === currentImage;
          const isPrev = i === (currentImage - 1 + heroImages.length) % heroImages.length;
          return (
            <img key={i} src={img} alt="Investment"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isActive ? 'translateX(0%)' : isPrev ? 'translateX(-100%)' : 'translateX(100%)',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
          );
        })}
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl font-bold font-heading text-primary-foreground drop-shadow-lg flex items-baseline justify-center">
            🪙{settings.website_name}
          </h1>
        </div>
      </div>

      <div className="relative z-10 px-4 -mt-6 space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={20} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Account Balance</span>
            </div>
          </div>
          <p className="text-3xl font-bold font-heading text-foreground">{formatAmount(profile.account_balance)} <span className="text-sm font-normal text-muted-foreground">UGX</span></p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/recharge')} className="flex-1 btn-accent py-2.5 text-xs flex items-center justify-center gap-1.5 rounded-xl">
              <ArrowDownCircle size={16} /> Recharge
            </button>
            <button onClick={() => navigate('/withdrawal')} className="flex-1 btn-accent py-2.5 text-xs flex items-center justify-center gap-1.5 rounded-xl">
              <ArrowUpCircle size={16} /> Withdraw
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground font-medium">Recharge Balance</p>
            <p className="text-lg font-bold font-heading text-foreground mt-1">{formatAmount(profile.recharge_balance)}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground font-medium">Cumulative Income</p>
            <p className="text-lg font-bold font-heading text-primary mt-1">{formatAmount(profile.cumulative_income)}</p>
          </div>
        </div>

        <LiveTicker />

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <CalendarCheck size={20} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Daily Check-in</p>
              <p className="text-xs text-muted-foreground">Earn {settings.check_in_amount} UGX daily</p>
            </div>
          </div>
          <button onClick={handleCheckIn} disabled={checkedInToday(user.id)}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${checkedInToday(user.id) ? 'bg-muted text-muted-foreground' : 'btn-accent'}`}>
            {checkedInToday(user.id) ? 'Done ✓' : 'Check In'}
          </button>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold font-heading text-foreground">Transaction History</h3>
            <Clock size={16} className="text-muted-foreground" />
          </div>
          {userTransactions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No transactions yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userTransactions.slice(0, 20).map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'recharge' ? 'bg-primary/10 text-primary' :
                      tx.type === 'withdrawal' ? 'bg-accent/10 text-accent' :
                      tx.type === 'earning' ? 'bg-primary/10 text-primary' :
                      tx.type === 'checkin' ? 'bg-primary/10 text-primary' :
                      tx.type === 'gift' ? 'bg-secondary/20 text-secondary' :
                      tx.type === 'referral' ? 'bg-primary/10 text-primary' :
                      'bg-secondary/20 text-secondary'
                    }`}>
                      {tx.type === 'recharge' ? <ArrowDownCircle size={16} /> :
                       tx.type === 'withdrawal' ? <ArrowUpCircle size={16} /> :
                       tx.type === 'earning' ? <TrendingUp size={16} /> :
                       tx.type === 'checkin' ? <CalendarCheck size={16} /> :
                       tx.type === 'gift' ? <Gift size={16} /> :
                       tx.type === 'referral' ? <Users size={16} /> :
                       <Wallet size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground capitalize">{tx.type}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${['recharge', 'earning', 'checkin', 'referral', 'gift'].includes(tx.type) ? 'text-primary' : 'text-accent'}`}>
                      {['recharge', 'earning', 'checkin', 'referral', 'gift'].includes(tx.type) ? '+' : '-'}{formatAmount(tx.amount)}
                    </p>
                    <p className={`text-[10px] ${tx.status === 'completed' ? 'text-primary' : tx.status === 'pending' ? 'text-accent' : 'text-destructive'}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
