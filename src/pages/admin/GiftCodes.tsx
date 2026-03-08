import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Gift, Plus } from 'lucide-react';
import Notification from '@/components/Notification';

const AdminGiftCodes = () => {
  const { user } = useAuth();
  const { giftCodes, addGiftCode } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [minAmt, setMinAmt] = useState('100');
  const [maxAmt, setMaxAmt] = useState('1500');
  const [notification, setNotification] = useState<string | null>(null);

  if (!user?.isAdmin) { navigate('/'); return null; }

  const handleCreate = () => {
    if (!code.trim()) { setNotification('Enter a code'); return; }
    const min = parseInt(minAmt) || 100;
    const max = parseInt(maxAmt) || 1500;
    addGiftCode({ code: code.trim().toUpperCase(), minAmount: min, maxAmount: max });
    setCode('');
    setNotification('Gift code created!');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Gift Codes</h1>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        <div className="glass-card rounded-2xl p-5 animate-fade-in space-y-3">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Create Gift Code</h2>
          </div>
          <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-xl glass text-foreground text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Gift code" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">Min Amount</label>
              <input type="number" value={minAmt} onChange={e => setMinAmt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass text-sm text-foreground focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Max Amount</label>
              <input type="number" value={maxAmt} onChange={e => setMaxAmt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass text-sm text-foreground focus:outline-none" />
            </div>
          </div>
          <button onClick={handleCreate} className="w-full btn-accent py-3 text-sm">Create Code</button>
        </div>

        <div className="space-y-2">
          {giftCodes.map(gc => (
            <div key={gc.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground tracking-widest">{gc.code}</p>
                <p className="text-[10px] text-muted-foreground">{gc.minAmount}-{gc.maxAmount} UGX • {gc.usedBy.length} used</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${gc.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {gc.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminGiftCodes;
