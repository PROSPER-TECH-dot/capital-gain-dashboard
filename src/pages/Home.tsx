import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Wallet, ArrowDownCircle, ArrowUpCircle, CalendarCheck, Clock, ChevronRight } from 'lucide-react';
import LiveTicker from '@/components/LiveTicker';
import Notification from '@/components/Notification';

const heroImages = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1553729459-uj8ax09dq67?w=800&h=300&fit=crop',
];

const HomePage = () => {
  const { user, updateUser } = useAuth();
  const { transactions, settings, checkedInToday, checkIn, addTransaction } = useApp();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (!user) return null;

  const handleCheckIn = () => {
    if (checkedInToday(user.id)) {
      setNotification('You have already checked in today!');
      return;
    }
    checkIn(user.id);
    updateUser(user.id, { accountBalance: user.accountBalance + settings.checkInAmount });
    addTransaction({ userId: user.id, type: 'checkin', amount: settings.checkInAmount, status: 'completed', description: 'Daily check-in bonus' });
    setNotification(`Check-in successful! +${settings.checkInAmount} UGX`);
  };

  const userTransactions = transactions.filter(t => t.userId === user.id);

  const formatAmount = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen pb-20 bg-background">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}

      {/* Header with sliding images */}
      <div className="relative w-full h-44 overflow-hidden rounded-b-3xl">
        {heroImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="Investment"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl font-bold font-heading text-primary-foreground drop-shadow-lg">
            {settings.websiteName}
          </h1>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Balance Cards */}
        <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={20} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Account Balance</span>
            </div>
          </div>
          <p className="text-3xl font-bold font-heading text-foreground">{formatAmount(user.accountBalance)} <span className="text-sm font-normal text-muted-foreground">UGX</span></p>
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
            <p className="text-lg font-bold font-heading text-foreground mt-1">{formatAmount(user.rechargeBalance)}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground font-medium">Cumulative Income</p>
            <p className="text-lg font-bold font-heading text-primary mt-1">{formatAmount(user.cumulativeIncome)}</p>
          </div>
        </div>

        {/* Live Ticker */}
        <LiveTicker />

        {/* Check-in */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <CalendarCheck size={20} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Daily Check-in</p>
              <p className="text-xs text-muted-foreground">Earn {settings.checkInAmount} UGX daily</p>
            </div>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={checkedInToday(user.id)}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              checkedInToday(user.id)
                ? 'bg-muted text-muted-foreground'
                : 'btn-accent'
            }`}
          >
            {checkedInToday(user.id) ? 'Done ✓' : 'Check In'}
          </button>
        </div>

        {/* Transaction History */}
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      tx.type === 'recharge' ? 'bg-primary/10 text-primary' :
                      tx.type === 'withdrawal' ? 'bg-accent/10 text-accent' :
                      tx.type === 'earning' ? 'bg-primary/10 text-primary' :
                      'bg-secondary/20 text-secondary'
                    }`}>
                      {tx.type[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground capitalize">{tx.type}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${
                      ['recharge', 'earning', 'checkin', 'referral', 'gift'].includes(tx.type) ? 'text-primary' : 'text-accent'
                    }`}>
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
