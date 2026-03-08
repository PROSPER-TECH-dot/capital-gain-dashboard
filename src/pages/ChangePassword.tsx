import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Lock } from 'lucide-react';
import Notification from '@/components/Notification';
import { supabase } from '@/integrations/supabase/client';

const ChangePassword = () => {
  const { user, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPass || !newPass || !confirmPass) { setNotification('Fill all fields'); return; }
    if (newPass !== confirmPass) { setNotification('Passwords do not match'); return; }
    if (newPass.length < 6) { setNotification('Password must be at least 6 characters'); return; }

    setLoading(true);

    // Verify old password by re-authenticating
    const email = user?.email;
    if (!email) { setNotification('Unable to verify account'); setLoading(false); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPass,
    });

    if (signInError) {
      setNotification('Current password is incorrect');
      setLoading(false);
      return;
    }

    const result = await updatePassword(newPass);
    setLoading(false);
    if (result.error) setNotification(result.error);
    else {
      setNotification('Password changed successfully!');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Change Password</h1>
      </div>
      <div className="px-4 -mt-4">
        <form onSubmit={handleChange} className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Update Password</h2>
          </div>
          {[
            { label: 'Current Password', value: oldPass, set: setOldPass },
            { label: 'New Password', value: newPass, set: setNewPass },
            { label: 'Confirm New Password', value: confirmPass, set: setConfirmPass },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <input type="password" value={value} onChange={e => set(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={label} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full btn-accent py-3 text-sm disabled:opacity-50">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
