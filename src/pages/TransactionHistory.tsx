import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, Gift, CalendarCheck, TrendingUp, Users, Filter, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

const typeConfig: Record<string, { icon: typeof Gift; label: string; colorClass: string; bgClass: string; sign: string }> = {
  recharge: { icon: ArrowDownCircle, label: 'Recharge', colorClass: 'text-primary', bgClass: 'bg-primary/10', sign: '+' },
  withdrawal: { icon: ArrowUpCircle, label: 'Withdrawal', colorClass: 'text-accent', bgClass: 'bg-accent/10', sign: '-' },
  earning: { icon: TrendingUp, label: 'Earning', colorClass: 'text-primary', bgClass: 'bg-primary/10', sign: '+' },
  checkin: { icon: CalendarCheck, label: 'Check-in', colorClass: 'text-primary', bgClass: 'bg-primary/10', sign: '+' },
  referral: { icon: Users, label: 'Referral', colorClass: 'text-primary', bgClass: 'bg-primary/10', sign: '+' },
  gift: { icon: Gift, label: 'Gift', colorClass: 'text-primary', bgClass: 'bg-primary/10', sign: '+' },
  investment: { icon: TrendingUp, label: 'Investment', colorClass: 'text-accent', bgClass: 'bg-accent/10', sign: '-' },
  admin_credit: { icon: Wallet, label: 'Admin Credit', colorClass: 'text-primary', bgClass: 'bg-primary/10', sign: '+' },
  admin_debit: { icon: Wallet, label: 'Admin Debit', colorClass: 'text-destructive', bgClass: 'bg-destructive/10', sign: '-' },
};

const filters = ['all', 'recharge', 'withdrawal', 'earning', 'checkin', 'gift', 'referral', 'investment'] as const;

const TransactionHistory = () => {
  const { user } = useAuth();
  const { transactions } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f) setActiveFilter(f);
  }, [searchParams]);

  if (!user) return null;

  const userTx = transactions
    .filter(t => t.user_id === user.id)
    .filter(t => activeFilter === 'all' || t.type === activeFilter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatAmount = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="gradient-hero p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <ArrowLeft size={18} className="text-primary-foreground" />
          </button>
          <h1 className="text-lg font-bold font-heading text-primary-foreground">
            {activeFilter === 'withdrawal' ? 'Withdrawal History' : 'Transaction History'}
          </h1>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === f
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground'
              }`}>
              {f === 'all' ? 'All' : (typeConfig[f]?.label || f)}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{userTx.length} record{userTx.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {userTx.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {userTx.map(tx => {
              const config = typeConfig[tx.type] || { icon: Gift, label: tx.type, colorClass: 'text-muted-foreground', bgClass: 'bg-muted', sign: '' };
              const Icon = config.icon;
              return (
                <div key={tx.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bgClass}`}>
                      <Icon size={18} className={config.colorClass} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{config.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{tx.description || '—'}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${config.sign === '+' ? 'text-primary' : 'text-accent'}`}>
                      {config.sign}{formatAmount(tx.amount)} <span className="text-[10px] font-normal">UGX</span>
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'completed' ? 'bg-primary/10 text-primary' :
                      tx.status === 'pending' ? 'bg-accent/10 text-accent' :
                      'bg-destructive/10 text-destructive'
                    }`}>{tx.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
