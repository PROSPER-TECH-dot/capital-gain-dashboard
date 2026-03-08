import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, User, Phone, Hash, UserCheck } from 'lucide-react';

const ProfileView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/'); return null; }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Profile</h1>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        <div className="glass-card rounded-2xl p-6 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/30">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary">{user.username[0].toUpperCase()}</span>
            )}
          </div>
          <h2 className="text-lg font-bold font-heading text-foreground">{user.username}</h2>
          <p className="text-xs text-muted-foreground">Code: {user.referralCode}</p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          {[
            { icon: User, label: 'Username', value: user.username },
            { icon: Hash, label: 'Referral Code', value: user.referralCode },
            { icon: Phone, label: 'Phone', value: user.phone || 'Not set' },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={label} className={`flex items-center gap-3 px-5 py-4 ${i < 2 ? 'border-b border-border/30' : ''}`}>
              <Icon size={16} className="text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {user.upline && (
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck size={18} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Upline</h3>
            </div>
            <div className="glass rounded-xl p-3 space-y-1">
              <p className="text-sm font-semibold text-foreground">{user.upline.username}</p>
              <p className="text-xs text-muted-foreground">{user.upline.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
