import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Settings } from 'lucide-react';
import Notification from '@/components/Notification';

const AdminSettings = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useApp();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<string | null>(null);
  const [form, setForm] = useState(settings);

  if (!user?.isAdmin) { navigate('/'); return null; }

  const handleSave = () => {
    updateSettings(form);
    setNotification('Settings saved!');
  };

  const fields = [
    { label: 'Website Name', key: 'websiteName', type: 'text' },
    { label: 'WhatsApp Group Link', key: 'whatsappGroup', type: 'text' },
    { label: 'Support 1 Number', key: 'support1', type: 'text' },
    { label: 'Support 2 Number', key: 'support2', type: 'text' },
    { label: 'Minimum Withdrawal (UGX)', key: 'minWithdrawal', type: 'number' },
    { label: 'Minimum Deposit (UGX)', key: 'minDeposit', type: 'number' },
    { label: 'Daily Earnings (%)', key: 'dailyEarnings', type: 'number' },
    { label: 'Minimum Investment (UGX)', key: 'minInvestment', type: 'number' },
    { label: 'Investment Period (days)', key: 'investmentPeriod', type: 'number' },
    { label: 'Check-in Amount (UGX)', key: 'checkInAmount', type: 'number' },
    { label: 'Message Popup Style', key: 'messagePopupStyle', type: 'text' },
  ];

  const getValue = (key: string) => {
    if (key === 'support1') return form.supportNumbers[0]?.number || '';
    if (key === 'support2') return form.supportNumbers[1]?.number || '';
    return (form as any)[key];
  };

  const setValue = (key: string, value: string) => {
    if (key === 'support1') {
      setForm(f => ({ ...f, supportNumbers: [{ name: 'Support 1', number: value }, f.supportNumbers[1]] }));
    } else if (key === 'support2') {
      setForm(f => ({ ...f, supportNumbers: [f.supportNumbers[0], { name: 'Support 2', number: value }] }));
    } else {
      const numFields = ['minWithdrawal', 'minDeposit', 'dailyEarnings', 'minInvestment', 'investmentPeriod', 'checkInAmount'];
      setForm(f => ({ ...f, [key]: numFields.includes(key) ? parseInt(value) || 0 : value }));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Settings</h1>
      </div>
      <div className="px-4 -mt-4">
        <div className="glass-card rounded-2xl p-5 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Platform Settings</h2>
          </div>
          {fields.map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <input type={type} value={getValue(key)} onChange={e => setValue(key, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          ))}
          <button onClick={handleSave} className="w-full btn-accent py-3 text-sm mt-2">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
