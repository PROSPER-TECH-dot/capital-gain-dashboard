import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const demoNames = [
  'John***', 'Mary***', 'David***', 'Sarah***', 'Peter***', 'Grace***', 'Moses***', 'Faith***',
  'Brian***', 'Esther***', 'Samuel***', 'Ruth***', 'Denis***', 'Janet***', 'Frank***', 'Lydia***',
  'Kevin***', 'Agnes***', 'Allan***', 'Doreen***', 'Isaac***', 'Betty***', 'Patrick***', 'Joyce***',
  'Robert***', 'Mercy***', 'George***', 'Violet***', 'Martin***', 'Rose***', 'James***', 'Stella***',
  'Henry***', 'Carol***', 'Daniel***', 'Irene***', 'Joseph***', 'Naomi***', 'Charles***', 'Winnie***',
  'Philip***', 'Harriet***', 'Simon***', 'Aisha***', 'Steven***', 'Prossy***', 'Tony***', 'Annet***',
  'Derrick***', 'Gloria***', 'Ivan***', 'Phiona***', 'Eric***', 'Brenda***', 'Trevor***', 'Juliet***',
  'Godfrey***', 'Patience***', 'Kenneth***', 'Martha***', 'Andrew***', 'Sylvia***', 'Victor***', 'Sharon***',
  'Paul***', 'Olivia***', 'Alex***', 'Christine***', 'Mark***', 'Diana***', 'Richard***', 'Susan***',
  'Emmanuel***', 'Catherine***', 'Oscar***', 'Rachael***', 'Joel***', 'Phoebe***', 'Timothy***', 'Deborah***',
  'Felix***', 'Alice***', 'Nelson***', 'Margaret***', 'Arthur***', 'Florence***', 'Vincent***', 'Angela***',
  'Douglas***', 'Rita***', 'Benard***', 'Josephine***', 'Raymond***', 'Gladys***', 'Herbert***', 'Cissy***',
  'Edward***', 'Linda***', 'Julius***', 'Anita***',
];

const demoAmounts = [
  10000, 15000, 20000, 25000, 30000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 500000,
];

interface TickerItem {
  user: string;
  action: 'recharged' | 'withdrew';
  amount: string;
}

const generateDemoItems = (count: number): TickerItem[] => {
  const items: TickerItem[] = [];
  for (let i = 0; i < count; i++) {
    const name = demoNames[Math.floor(Math.random() * demoNames.length)];
    const action = Math.random() > 0.4 ? 'recharged' : 'withdrew';
    const amount = demoAmounts[Math.floor(Math.random() * demoAmounts.length)];
    items.push({ user: name, action, amount: `${amount.toLocaleString()} UGX` });
  }
  return items;
};

const LiveTicker = () => {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(() => generateDemoItems(60));
  const signatureRef = useRef('');

  useEffect(() => {
    const fetchRealTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('amount, type, user_id')
        .in('type', ['recharge', 'withdrawal'])
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(40);

      if (!data || data.length === 0) return;

      const userIds = [...new Set(data.map((t) => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', userIds);

      const usernameMap = new Map(profiles?.map((p) => [p.user_id, p.username]) || []);

      const realItems: TickerItem[] = data.map((t) => {
        const fullName = usernameMap.get(t.user_id) || 'User';
        const maskedName = fullName.substring(0, Math.min(4, fullName.length)) + '***';

        return {
          user: maskedName,
          action: t.type === 'recharge' ? 'recharged' : 'withdrew',
          amount: `${Number(t.amount).toLocaleString()} UGX`,
        };
      });

      const demoFiller = generateDemoItems(Math.max(40, 80 - realItems.length));
      const mixed = [...realItems, ...demoFiller];
      for (let i = mixed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
      }

      const newSignature = mixed.slice(0, 50).map((item) => `${item.user}-${item.action}-${item.amount}`).join('|');
      if (newSignature !== signatureRef.current) {
        signatureRef.current = newSignature;
        setTickerItems(mixed);
      }
    };

    fetchRealTransactions();
    const interval = setInterval(fetchRealTransactions, 15000);
    return () => clearInterval(interval);
  }, []);

  const displayItems = useMemo(() => [...tickerItems, ...tickerItems], [tickerItems]);

  return (
    <div className="w-full overflow-hidden glass-card rounded-xl py-2">
      <div className="ticker-scroll flex w-max whitespace-nowrap will-change-transform">
        {displayItems.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 text-xs font-medium shrink-0">
            <span className="text-foreground">{item.user}</span>
            <span className={item.action === 'recharged' ? 'text-primary' : 'text-accent'}>
              {item.action}
            </span>
            <span className="font-semibold text-foreground">{item.amount}</span>
            <span className="text-muted-foreground mx-1">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;

