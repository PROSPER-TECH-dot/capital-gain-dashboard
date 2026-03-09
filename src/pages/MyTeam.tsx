import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Copy, Check, Link2 } from 'lucide-react';
import Notification from '@/components/Notification';

interface ReferralTransaction {
  amount: number;
  description: string;
}

interface InvestmentTransaction {
  user_id: string;
  amount: number;
}

const MyTeamPage = () => {
  const { user, profile, profiles } = useAuth();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [referralTxs, setReferralTxs] = useState<ReferralTransaction[]>([]);
  const [investmentTxs, setInvestmentTxs] = useState<InvestmentTransaction[]>([]);

  const currentUserId = user?.id ?? '';

  // Build referral tree
  const l1 = currentUserId ? profiles.filter(p => p.upline_user_id === currentUserId) : [];
  const l2 = l1.flatMap(u => profiles.filter(p => p.upline_user_id === u.user_id));
  const l3 = l2.flatMap(u => profiles.filter(p => p.upline_user_id === u.user_id));

  const levelByUserId = useMemo(() => {
    const map = new Map<string, 1 | 2 | 3>();
    l1.forEach(u => map.set(u.user_id, 1));
    l2.forEach(u => map.set(u.user_id, 2));
    l3.forEach(u => map.set(u.user_id, 3));
    return map;
  }, [l1, l2, l3]);

  useEffect(() => {
    if (!user) return;

    const fetchReferralTxs = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('amount, description')
        .eq('user_id', user.id)
        .eq('type', 'referral')
        .eq('status', 'completed');

      if (data) setReferralTxs(data as ReferralTransaction[]);
    };

    fetchReferralTxs();
  }, [user]);

  useEffect(() => {
    const subordinateIds = [...l1, ...l2, ...l3].map(u => u.user_id);

    const fetchInvestmentTxs = async () => {
      if (subordinateIds.length === 0) {
        setInvestmentTxs([]);
        return;
      }

      const { data } = await supabase
        .from('transactions')
        .select('user_id, amount')
        .in('user_id', subordinateIds)
        .eq('type', 'investment')
        .eq('status', 'completed');

      if (data) setInvestmentTxs(data as InvestmentTransaction[]);
    };

    fetchInvestmentTxs();
  }, [l1, l2, l3]);

  const getEarningsForUser = (subordinateUserId: string) => {
    const fromReferralTx = referralTxs
      .filter(t => {
        const description = t.description || '';
        return (
          description.includes(`from user ${subordinateUserId}`) ||
          description.includes(`from_user:${subordinateUserId}`)
        );
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    if (fromReferralTx > 0) return fromReferralTx;

    const level = levelByUserId.get(subordinateUserId);
    if (!level) return 0;

    const percentage = level === 1 ? 25 : level === 2 ? 3 : 1;
    return investmentTxs
      .filter(t => t.user_id === subordinateUserId)
      .reduce((sum, t) => sum + Math.floor(Number(t.amount) * percentage / 100), 0);
  };

  if (!user || !profile) return null;

  const levels = [
    { level: 1, users: l1, earning: 25 },
    { level: 2, users: l2, earning: 3 },
    { level: 3, users: l3, earning: 1 },
  ];

  const totalFromTransactions = referralTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalEstimated = [...l1, ...l2, ...l3].reduce((sum, member) => sum + getEarningsForUser(member.user_id), 0);
  const totalEarnings = totalFromTransactions > 0 ? totalFromTransactions : totalEstimated;

  const referralLink = `${window.location.origin}?ref=${profile.referral_code}`;

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
    setNotification('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-6 pb-10 rounded-b-3xl">
        <h1 className="text-xl font-bold font-heading text-primary-foreground">My Team</h1>
        <p className="text-xs text-primary-foreground/70 mt-1">Earn from referrals on 3 levels</p>
        <div className="mt-3 glass rounded-xl p-3 bg-white/10">
          <p className="text-xs text-primary-foreground/80">Total Referral Earnings</p>
          <p className="text-lg font-bold text-primary-foreground">{totalEarnings.toLocaleString()} UGX</p>
        </div>
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
                  levelUsers.map(u => {
                    const earned = getEarningsForUser(u.user_id);
                    return (
                      <div key={u.id} className="glass rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{u.username}</p>
                          <p className="text-[10px] text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs font-semibold text-primary">+{earned.toLocaleString()} UGX</p>
                      </div>
                    );
                  })
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
