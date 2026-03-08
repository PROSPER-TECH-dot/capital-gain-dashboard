import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Settings } from 'lucide-react';
import Notification from '@/components/Notification';

const AdminSettings = () => {
  const { isAdmin } = useAuth();
  const { settings, updateSettings } = useApp();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<string | null>(null);
  const [form, setForm] = useState(settings);

  useEffect(() => { setForm(settings); }, [settings]);

  if (!isAdmin) { navigate('/'); return null; }

  const handleSave = async () => {
    await updateSettings(form);
    setNotification('Settings saved!');
  };

  const supportNumbers = Array.isArray(form.support_numbers) ? form.support_numbers : [];

  const fields = [
    { label: 'Website Name', key: 'website_name', type: 'text' },
    { label: 'WhatsApp Group Link', key: 'whatsapp_group', type: 'text' },
    { label: 'Support 1 Number', key: 'support1', type: 'text' },
    { label: 'Support 2 Number', key: 'support2', type: 'text' },
    { label: 'Minimum Withdrawal (UGX)', key: 'min_withdrawal', type: 'number' },
    { label: 'Minimum Deposit (UGX)', key: 'min_deposit', type: 'number' },
    { label: 'Daily Earnings (%)', key: 'daily_earnings', type: 'number' },
    { label: 'Minimum Investment (UGX)', key: 'min_investment', type: 'number' },
    { label: 'Investment Period (days)', key: 'investment_period', type: 'number' },
    { label: 'Check-in Amount (UGX)', key: 'check_in_amount', type: 'number' },
    { label: 'Message Popup Style', key: 'message_popup_style', type: 'text' },
  ];

  const getValue = (key: string) => {
    if (key === 'support1') return supportNumbers[0]?.number || '';
    if (key === 'support2') return supportNumbers[1]?.number || '';
    return (form as any)[key];
  };

  const setValue = (key: string, value: string) => {
    if (key === 'support1') {
      setForm(f => ({ ...f, support_numbers: [{ name: 'Support 1', number: value }, supportNumbers[1] || { name: 'Support 2', number: '' }] }));
    } else if (key === 'support2') {
      setForm(f => ({ ...f, support_numbers: [supportNumbers[0] || { name: 'Support 1', number: '' }, { name: 'Support 2', number: value }] }));
    } else {
      const numFields = ['min_withdrawal', 'min_deposit', 'daily_earnings', 'min_investment', 'investment_period', 'check_in_amount'];
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
