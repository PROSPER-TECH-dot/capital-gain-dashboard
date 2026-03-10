import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Search, Users, RefreshCw } from 'lucide-react';

interface ReferralEvent {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  created_at: string;
  username: string;
}

const ReferralAudit = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    fetchEvents();
  }, [isAdmin]);

  const fetchEvents = async () => {
    setLoading(true);
    // Fetch all referral transactions
    const { data: txs } = await supabase
      .from('transactions')
      .select('id, user_id, amount, description, created_at')
      .eq('type', 'referral')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (!txs || txs.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Get usernames for recipients
    const userIds = [...new Set(txs.map(t => t.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username')
      .in('user_id', userIds);

    const usernameMap = new Map((profiles || []).map(p => [p.user_id, p.username]));

    setEvents(txs.map(t => ({
      ...t,
      username: usernameMap.get(t.user_id) || 'Unknown',
    })));
    setLoading(false);
  };

  const parseDescription = (desc: string) => {
    // Extract level and source user from description like "L1 referral commission from user <uuid> investment of 10000 UGX"
    const levelMatch = desc.match(/L(\d)/);
    const userMatch = desc.match(/from user ([a-f0-9-]+)/);
    const amountMatch = desc.match(/investment of ([\d,]+)/);
    return {
      level: levelMatch ? parseInt(levelMatch[1]) : null,
      sourceUserId: userMatch ? userMatch[1] : null,
      investmentAmount: amountMatch ? amountMatch[1] : null,
    };
  };

  const [sourceUsernames, setSourceUsernames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Resolve source user IDs to usernames
    const sourceIds = [...new Set(events.map(e => parseDescription(e.description).sourceUserId).filter(Boolean))] as string[];
    if (sourceIds.length === 0) return;

    const fetchSourceUsernames = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', sourceIds);
      if (data) {
        setSourceUsernames(new Map(data.map(p => [p.user_id, p.username])));
      }
    };
    fetchSourceUsernames();
  }, [events]);

  const filtered = events.filter(e => {
    const q = search.toLowerCase();
    const parsed = parseDescription(e.description);
    const sourceName = parsed.sourceUserId ? (sourceUsernames.get(parsed.sourceUserId) || '') : '';
    return e.username.toLowerCase().includes(q) || sourceName.toLowerCase().includes(q);
  });

  const totalCommissions = filtered.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate('/admin')}><ArrowLeft size={20} className="text-primary-foreground" /></button>
        <div>
          <h1 className="text-lg font-bold font-heading text-primary-foreground">Referral Audit</h1>
          <p className="text-xs text-primary-foreground/70">Commission events tracking</p>
        </div>
        <button onClick={fetchEvents} className="ml-auto">
          <RefreshCw size={18} className={`text-primary-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Summary */}
        <div className="glass-card rounded-2xl p-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Total Events</p>
            <p className="text-lg font-bold font-heading text-foreground">{filtered.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Total Commissions</p>
            <p className="text-lg font-bold font-heading text-primary">{totalCommissions.toLocaleString()} UGX</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search by recipient or source user..." />
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw size={24} className="animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 glass-card rounded-2xl">
            <Users size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No referral commission events yet</p>
            <p className="text-xs text-muted-foreground mt-1">Commissions are generated when referred users invest</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(event => {
              const parsed = parseDescription(event.description);
              const sourceName = parsed.sourceUserId ? (sourceUsernames.get(parsed.sourceUserId) || parsed.sourceUserId.slice(0, 8)) : 'Unknown';
              return (
                <div key={event.id} className="glass-card rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {parsed.level && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full gradient-primary text-primary-foreground">
                          L{parsed.level}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-foreground">{event.username}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">+{Number(event.amount).toLocaleString()} UGX</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                      From: <span className="text-foreground font-medium">{sourceName}</span>
                      {parsed.investmentAmount && <> • Investment: {parsed.investmentAmount} UGX</>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
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

export default ReferralAudit;
