import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Filter } from 'lucide-react';
import { useState } from 'react';

const filters = ['all', 'recharge', 'withdrawal', 'earning', 'checkin', 'gift', 'referral', 'investment'] as const;

const AdminTransactions = () => {
  const { isAdmin, profiles } = useAuth();
  const { transactions } = useApp();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  if (!isAdmin) { navigate('/'); return null; }

  const profileMap = new Map(profiles.map(p => [p.user_id, p]));

  const filtered = transactions
    .filter(t => activeFilter === 'all' || t.type === activeFilter)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Transactions</h1>
        <span className="ml-auto text-xs text-primary-foreground/70">{filtered.length}</span>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === f ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'
              }`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          filtered.slice(0, 100).map(tx => {
            const prof = profileMap.get(tx.user_id);
            return (
              <div key={tx.id} className="glass-card rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground capitalize">{tx.type}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${['recharge', 'earning', 'checkin', 'gift', 'referral'].includes(tx.type) ? 'text-primary' : 'text-accent'}`}>
                      {['recharge', 'earning', 'checkin', 'gift', 'referral'].includes(tx.type) ? '+' : '-'}{Number(tx.amount).toLocaleString()} UGX
                    </p>
                    <p className={`text-[10px] ${tx.status === 'completed' ? 'text-primary' : 'text-accent'}`}>{tx.status}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/20">
                  <div className="text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground">{prof?.username || 'Unknown'}</span>
                    {prof?.phone && <span className="ml-2">{prof.phone}</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
