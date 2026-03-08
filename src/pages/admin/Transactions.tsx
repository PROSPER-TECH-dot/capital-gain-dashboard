import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';

const AdminTransactions = () => {
  const { isAdmin } = useAuth();
  const { transactions } = useApp();
  const navigate = useNavigate();

  if (!isAdmin) { navigate('/'); return null; }

  const formatAmount = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Transactions</h1>
      </div>
      <div className="px-4 -mt-4 space-y-2">
        {transactions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          transactions.slice(0, 50).map(tx => (
            <div key={tx.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground capitalize">{tx.type}</p>
                <p className="text-[10px] text-muted-foreground">{tx.user_id.slice(0, 12)}... • {new Date(tx.created_at).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{tx.description}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${['recharge', 'earning', 'checkin', 'gift'].includes(tx.type) ? 'text-primary' : 'text-accent'}`}>
                  {['recharge', 'earning', 'checkin', 'gift'].includes(tx.type) ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                </p>
                <p className={`text-[10px] ${tx.status === 'completed' ? 'text-primary' : 'text-accent'}`}>{tx.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
