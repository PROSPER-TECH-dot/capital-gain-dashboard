import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const CustomerSupport = () => {
  const navigate = useNavigate();
  const { settings } = useApp();

  const supportNumbers = Array.isArray(settings.support_numbers) ? settings.support_numbers : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Customer Support</h1>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        {supportNumbers.map((s: { name: string; number: string }, i: number) => (
          <a key={i} href={`https://wa.me/${s.number.replace(/^0/, '256')}`} target="_blank" rel="noopener noreferrer"
            className="glass-card rounded-2xl p-5 flex items-center gap-4 animate-fade-in block">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle size={22} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">Chat on WhatsApp</p>
            </div>
            <ExternalLink size={16} className="text-muted-foreground" />
          </a>
        ))}

        <a href={settings.whatsapp_group} target="_blank" rel="noopener noreferrer"
          className="glass-card rounded-2xl p-5 flex items-center gap-4 block">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageCircle size={22} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Join WhatsApp Group</p>
            <p className="text-xs text-muted-foreground">Community & updates</p>
          </div>
          <ExternalLink size={16} className="text-muted-foreground" />
        </a>
      </div>
    </div>
  );
};

export default CustomerSupport;
