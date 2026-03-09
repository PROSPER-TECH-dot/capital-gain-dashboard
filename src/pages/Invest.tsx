import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { TrendingUp, RefreshCw, Wallet, Info } from 'lucide-react';
import Notification from '@/components/Notification';
import { supabase } from '@/integrations/supabase/client';

async function creditReferralCommissions(userId: string, investmentAmount: number) {
  try {
    // Get user's profile to find upline
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('upline_user_id')
      .eq('user_id', userId)
      .single();

    if (!userProfile?.upline_user_id) return;

    // Level 1: 25% commission
    const l1UserId = userProfile.upline_user_id;
    const l1Commission = Math.floor(investmentAmount * 25 / 100);
    if (l1Commission > 0) {
      const { data: l1Profile } = await supabase
        .from('profiles')
        .select('account_balance, cumulative_income')
        .eq('user_id', l1UserId)
        .single();

      if (l1Profile) {
        await supabase.from('profiles').update({
          account_balance: Number(l1Profile.account_balance) + l1Commission,
          cumulative_income: Number(l1Profile.cumulative_income) + l1Commission,
        }).eq('user_id', l1UserId);

        await supabase.from('transactions').insert({
          user_id: l1UserId,
          type: 'referral',
          amount: l1Commission,
          status: 'completed',
          description: `L1 referral commission from investment of ${investmentAmount.toLocaleString()} UGX`,
        });
      }
    }

    // Level 2: 3% commission
    const { data: l1Profile2 } = await supabase
      .from('profiles')
      .select('upline_user_id')
      .eq('user_id', l1UserId)
      .single();

    if (!l1Profile2?.upline_user_id) return;

    const l2UserId = l1Profile2.upline_user_id;
    const l2Commission = Math.floor(investmentAmount * 3 / 100);
    if (l2Commission > 0) {
      const { data: l2Profile } = await supabase
        .from('profiles')
        .select('account_balance, cumulative_income')
        .eq('user_id', l2UserId)
        .single();

      if (l2Profile) {
        await supabase.from('profiles').update({
          account_balance: Number(l2Profile.account_balance) + l2Commission,
          cumulative_income: Number(l2Profile.cumulative_income) + l2Commission,
        }).eq('user_id', l2UserId);

        await supabase.from('transactions').insert({
          user_id: l2UserId,
          type: 'referral',
          amount: l2Commission,
          status: 'completed',
          description: `L2 referral commission from investment of ${investmentAmount.toLocaleString()} UGX`,
        });
      }
    }

    // Level 3: 1% commission
    const { data: l2Profile2 } = await supabase
      .from('profiles')
      .select('upline_user_id')
      .eq('user_id', l2UserId)
      .single();

    if (!l2Profile2?.upline_user_id) return;

    const l3UserId = l2Profile2.upline_user_id;
    const l3Commission = Math.floor(investmentAmount * 1 / 100);
    if (l3Commission > 0) {
      const { data: l3Profile } = await supabase
        .from('profiles')
        .select('account_balance, cumulative_income')
        .eq('user_id', l3UserId)
        .single();

      if (l3Profile) {
        await supabase.from('profiles').update({
          account_balance: Number(l3Profile.account_balance) + l3Commission,
          cumulative_income: Number(l3Profile.cumulative_income) + l3Commission,
        }).eq('user_id', l3UserId);

        await supabase.from('transactions').insert({
          user_id: l3UserId,
          type: 'referral',
          amount: l3Commission,
          status: 'completed',
          description: `L3 referral commission from investment of ${investmentAmount.toLocaleString()} UGX`,
        });
      }
    }
  } catch (err) {
    console.error('Referral commission error:', err);
  }
}

const InvestPage = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { settings, addInvestment, addTransaction, investments } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'recharge' | 'reinvest'>('recharge');
  const [notification, setNotification] = useState<string | null>(null);

  if (!user || !profile) return null;

  const userInvestments = investments.filter(i => i.user_id === user.id);

  const handleInvest = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < settings.min_investment) {
      setNotification(`Minimum investment is ${settings.min_investment.toLocaleString()} UGX`); return;
    }
    if (source === 'recharge' && amt > profile.recharge_balance) {
      setNotification('Insufficient recharge balance'); return;
    }
    if (source === 'reinvest' && amt > profile.account_balance) {
      setNotification('Insufficient account balance'); return;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + settings.investment_period);

    await addInvestment({
      user_id: user.id, amount: amt, daily_return: settings.daily_earnings,
      start_date: new Date().toISOString(), end_date: endDate.toISOString(),
    });

    if (source === 'recharge') {
      await updateProfile(user.id, {
        recharge_balance: profile.recharge_balance - amt,
        account_balance: profile.account_balance - amt,
      });
    } else {
      await updateProfile(user.id, { account_balance: profile.account_balance - amt });
    }

    await addTransaction({
      user_id: user.id, type: 'investment', amount: amt, status: 'completed',
      description: `Investment of ${amt.toLocaleString()} UGX for ${settings.investment_period} days`,
    });

    // Credit referral commissions on investment (not deposit)
    await creditReferralCommissions(user.id, amt);

    await refreshProfile();
    setAmount('');
    setNotification(`Successfully invested ${amt.toLocaleString()} UGX!`);
  };

  const dailyReturn = parseInt(amount || '0') * settings.daily_earnings / 100;
  const totalReturn = dailyReturn * settings.investment_period;

  return (
    <div className="min-h-screen pb-20 bg-background">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-6 pb-10 rounded-b-3xl">
        <h1 className="text-xl font-bold font-heading text-primary-foreground">Invest</h1>
        <p className="text-xs text-primary-foreground/70 mt-1">Earn {settings.daily_earnings}% daily returns</p>
      </div>
      <div className="px-4 -mt-6 space-y-4">
        {/* Balance Card */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} className="text-primary" />
            <h2 className="text-sm font-semibold font-heading text-foreground">Available Balance</h2>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Recharge Balance</p>
              <p className="text-xl font-bold text-primary">{profile.recharge_balance.toLocaleString()} UGX</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Account Balance</p>
              <p className="text-xl font-bold text-foreground">{profile.account_balance.toLocaleString()} UGX</p>
            </div>
          </div>
        </div>

        {/* New Investment */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="text-sm font-semibold font-heading text-foreground">New Investment</h2>
          </div>
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-2 block">Investment Source</label>
            <div className="flex gap-2">
              <button onClick={() => setSource('recharge')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  source === 'recharge' 
                    ? 'gradient-primary text-primary-foreground shadow-lg -translate-y-1' 
                    : 'glass text-foreground'
                }`}>
                Recharge Balance
              </button>
              <button onClick={() => setSource('reinvest')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1 ${
                  source === 'reinvest' 
                    ? 'gradient-primary text-primary-foreground shadow-lg -translate-y-1' 
                    : 'glass text-foreground'
                }`}>
                <RefreshCw size={12} /> Re-invest
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1 block">Amount (UGX)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={`Min ${settings.min_investment.toLocaleString()}`} />
          </div>
          {parseInt(amount) > 0 && (
            <div className="glass rounded-xl p-3 mb-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Daily Return ({settings.daily_earnings}%)</span>
                <span className="font-semibold text-primary">{dailyReturn.toLocaleString()} UGX</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Period</span>
                <span className="font-semibold text-foreground">{settings.investment_period} days</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-border/30">
                <span className="text-muted-foreground">Total Return</span>
                <span className="font-bold text-primary">{totalReturn.toLocaleString()} UGX</span>
              </div>
            </div>
          )}
          <button onClick={handleInvest} className="w-full btn-accent py-3 text-sm">Invest Now</button>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-primary" />
            <h2 className="text-sm font-semibold font-heading text-foreground">How to Invest</h2>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <p><span className="text-foreground font-medium">Recharge your account</span> — Go to the Recharge page and deposit funds. The minimum deposit is {settings.min_deposit.toLocaleString()} UGX.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <p><span className="text-foreground font-medium">Choose your source</span> — Select "Recharge Balance" to invest from deposits, or "Re-invest" to use your earnings.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <p><span className="text-foreground font-medium">Enter amount</span> — The minimum investment is {settings.min_investment.toLocaleString()} UGX.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <p><span className="text-foreground font-medium">Earn daily returns</span> — You earn {settings.daily_earnings}% daily on your investment for {settings.investment_period} days.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
              <p><span className="text-foreground font-medium">Withdraw earnings</span> — Your daily earnings are added to your account balance and can be withdrawn anytime (min {settings.min_withdrawal.toLocaleString()} UGX).</p>
            </div>
          </div>
        </div>

        {/* My Investments */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold font-heading text-foreground">My Investments</h3>
            <button onClick={() => navigate('/my-investments')} className="text-xs text-primary font-medium hover:text-primary/80">View All</button>
          </div>
          {userInvestments.length > 0 ? (
            <div className="space-y-2">
              {userInvestments.slice(0, 2).map(inv => {
                const daysLeft = Math.max(0, Math.ceil((new Date(inv.end_date).getTime() - Date.now()) / 86400000));
                return (
                  <div key={inv.id} className="glass rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{Number(inv.amount).toLocaleString()} UGX</p>
                      <p className="text-[10px] text-muted-foreground">{daysLeft} days remaining</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-primary">+{(Number(inv.amount) * Number(inv.daily_return) / 100).toLocaleString()}/day</p>
                      <p className={`text-[10px] ${inv.active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {inv.active ? 'Active' : 'Completed'}
                      </p>
                    </div>
                  </div>
                );
              })}
              {userInvestments.length > 2 && (
                <div className="text-center pt-2">
                  <button onClick={() => navigate('/my-investments')} className="text-xs text-primary font-medium hover:text-primary/80">
                    +{userInvestments.length - 2} more investments
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No investments yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start investing to see your portfolio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestPage;
