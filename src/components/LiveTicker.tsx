import { useApp } from '@/context/AppContext';

const tickerData = [
  { user: 'John***', action: 'recharged', amount: '50,000 UGX' },
  { user: 'Mary***', action: 'withdrew', amount: '120,000 UGX' },
  { user: 'David***', action: 'recharged', amount: '200,000 UGX' },
  { user: 'Sarah***', action: 'withdrew', amount: '75,000 UGX' },
  { user: 'Peter***', action: 'recharged', amount: '30,000 UGX' },
  { user: 'Grace***', action: 'withdrew', amount: '500,000 UGX' },
  { user: 'Moses***', action: 'recharged', amount: '100,000 UGX' },
  { user: 'Faith***', action: 'withdrew', amount: '250,000 UGX' },
];

const LiveTicker = () => {
  const { settings } = useApp();
  void settings;

  return (
    <div className="w-full overflow-hidden glass-card rounded-xl py-2">
      <div className="flex ticker-scroll whitespace-nowrap">
        {[...tickerData, ...tickerData].map((item, i) => (
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
