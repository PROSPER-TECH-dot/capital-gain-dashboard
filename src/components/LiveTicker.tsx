import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const demoNames = [
  'John***', 'Mary***', 'David***', 'Sarah***', 'Peter***', 'Grace***', 'Moses***', 'Faith***',
  'Brian***', 'Esther***', 'Samuel***', 'Ruth***', 'Denis***', 'Janet***', 'Frank***', 'Lydia***',
  'Kevin***', 'Agnes***', 'Allan***', 'Doreen***', 'Isaac***', 'Betty***', 'Patrick***', 'Joyce***',
  'Robert***', 'Mercy***', 'George***', 'Violet***', 'Martin***', 'Rose***', 'James***', 'Stella***',
  'Henry***', 'Carol***', 'Daniel***', 'Irene***', 'Joseph***', 'Naomi***', 'Charles***', 'Winnie***',
  'Philip***', 'Harriet***', 'Simon***', 'Aisha***', 'Steven***', 'Prossy***', 'Tony***', 'Annet***',
  'Derrick***', 'Gloria***', 'Ivan***', 'Phiona***', 'Eric***', 'Brenda***', 'Trevor***', 'Juliet***',
  'Godfrey***', 'Patience***', 'Kenneth***', 'Martha***',
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
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(() => generateDemoItems(30));

  useEffect(() => {
    // Fetch real recent transactions
    const fetchRealTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('amount, type, user_id')
        .in('type', ['recharge', 'withdrawal'])
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        // Get usernames for these users
        const userIds = [...new Set(data.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', userIds);

        const usernameMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);

        const realItems: TickerItem[] = data.map(t => {
          const fullName = usernameMap.get(t.user_id) || 'User';
          const maskedName = fullName.substring(0, Math.min(4, fullName.length)) + '***';
          return {
            user: maskedName,
            action: t.type === 'recharge' ? 'recharged' : 'withdrew',
            amount: `${Number(t.amount).toLocaleString()} UGX`,
          };
        });

        // Mix real with demo to fill ticker
        const demoFiller = generateDemoItems(Math.max(20, 30 - realItems.length));
        const mixed = [...realItems, ...demoFiller];
        // Shuffle
        for (let i = mixed.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
        }
        setTickerItems(mixed);
      }
    };

    fetchRealTransactions();

    // Refresh every 30 seconds
    const interval = setInterval(fetchRealTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden glass-card rounded-xl py-2">
      <div className="flex ticker-scroll whitespace-nowrap">
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-4 text-xs font-medium">
            <span className="text-foreground">{item.user}</span>
            <span className={item.action === 'recharged' ? 'text-primary' : 'text-accent'}>
              {item.action}
            </span>
            <span className="font-semibold text-foreground">{item.amount}</span>
            <span className="text-muted-foreground mx-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;
