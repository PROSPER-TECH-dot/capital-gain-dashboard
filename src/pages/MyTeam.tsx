import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, Copy, Check, Link2 } from 'lucide-react';
import Notification from '@/components/Notification';

const MyTeamPage = () => {
  const { user, profile, profiles } = useAuth();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  if (!user || !profile) return null;

  // Build referral tree using profiles
  const l1 = profiles.filter(p => p.upline_user_id === user.id);
  const l2 = l1.flatMap(u => profiles.filter(p => p.upline_user_id === u.user_id));
  const l3 = l2.flatMap(u => profiles.filter(p => p.upline_user_id === u.user_id));

  const levels = [
    { level: 1, users: l1, earning: 25 },
    { level: 2, users: l2, earning: 3 },
    { level: 3, users: l3, earning: 1 },
  ];

  const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    else { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
    setNotification('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-6 pb-10 rounded-b-3xl">
        <h1 className="text-xl font-bold font-heading text-primary-foreground">My Team</h1>
        <p className="text-xs text-primary-foreground/70 mt-1">Earn from referrals on 3 levels</p>
      </div>
      <div className="px-4 -mt-6 space-y-4">
        {levels.map(({ level, users: levelUsers, earning }) => (
          <div key={level} className="glass-card rounded-2xl p-4 animate-fade-in">
            <button onClick={() => setExpandedLevel(expandedLevel === level ? null : level)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-bold">L{level}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Level {level}</p>
                  <p className="text-xs text-muted-foreground">{levelUsers.length} members • {earning}% earning</p>
                </div>
              </div>
              <ChevronRight size={20} className={`text-muted-foreground transition-transform ${expandedLevel === level ? 'rotate-90' : ''}`} />
            </button>
            {expandedLevel === level && (
              <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                {levelUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">No subordinates yet</p>
                ) : (
                  levelUsers.map(u => (
                    <div key={u.id} className="glass rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{u.username}</p>
                        <p className="text-[10px] text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xs font-semibold text-primary">
                        +{((u.cumulative_income || 0) * earning / 100).toLocaleString()} UGX
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-primary" />
            <h3 className="text-sm font-semibold font-heading text-foreground">Your Referral</h3>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Referral Link</label>
            <div className="flex gap-2">
              <input readOnly value={referralLink} className="flex-1 px-3 py-2.5 rounded-xl glass text-xs text-foreground truncate" />
              <button onClick={() => copyToClipboard(referralLink, 'link')} className="btn-copy text-xs flex items-center gap-1">
                {copiedLink ? <Check size={14} /> : <Copy size={14} />} {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Referral Code</label>
            <div className="flex gap-2">
              <input readOnly value={profile.referral_code} className="flex-1 px-3 py-2.5 rounded-xl glass text-sm font-bold text-foreground tracking-widest" />
              <button onClick={() => copyToClipboard(profile.referral_code, 'code')} className="btn-copy text-xs flex items-center gap-1">
                {copiedCode ? <Check size={14} /> : <Copy size={14} />} {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeamPage;
