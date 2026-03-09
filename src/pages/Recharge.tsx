import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, ArrowDownCircle, Phone, Info } from 'lucide-react';
import Notification from '@/components/Notification';
import { supabase } from '@/integrations/supabase/client';
import airtelLogo from '@/assets/airtel-logo.png';
import mtnLogo from '@/assets/mtn-logo.png';

const RechargePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { settings, refreshTransactions } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState<'airtel' | 'mtn' | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const pollStatus = (transactionId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max (10s intervals)

    pollingRef.current = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        stopPolling();
        setProcessing(false);
        setStatusMessage('');
        setNotification('Payment timed out. Please try again.');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('check-collection-status', {
          body: { transaction_id: transactionId },
        });

        if (error) return;

        if (data?.status === 'completed') {
          stopPolling();
          await refreshProfile();
          await refreshTransactions();
          setProcessing(false);
          setStatusMessage('');
          setNotification(`Recharged ${parseInt(amount).toLocaleString()} UGX successfully!`);
          setTimeout(() => navigate('/home'), 1500);
        } else if (data?.status === 'failed') {
          stopPolling();
          setProcessing(false);
          setStatusMessage('');
          setNotification(data?.message || 'Payment failed or cancelled.');
        }
      } catch (e) {
        // Keep polling on network errors
      }
    }, 10000);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  if (!user || !profile) return null;

  const handleRecharge = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < settings.min_deposit) {
      setNotification(`Minimum deposit is ${settings.min_deposit.toLocaleString()} UGX`); return;
    }
    if (!phone || phone.length < 10) {
      setNotification('Please enter a valid phone number'); return;
    }
    if (!network) {
      setNotification('Please select a network (Airtel or MTN)'); return;
    }

    setProcessing(true);
    setStatusMessage('Sending payment request to your phone...');

    try {
      const { data, error } = await supabase.functions.invoke('collect-payment', {
        body: { phone, amount: amt, network },
      });

      if (error || !data?.success) {
        setProcessing(false);
        setStatusMessage('');
        setNotification(data?.error || error?.message || 'Payment request failed');
        return;
      }

      setStatusMessage('STK push sent! Enter your PIN on your phone to confirm...');
      pollStatus(data.transaction_id);
    } catch (e: any) {
      setProcessing(false);
      setStatusMessage('');
      setNotification(e.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">Recharge</h1>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        <div className="glass-card rounded-2xl p-5 animate-fade-in space-y-4">
          <div className="flex items-center gap-2">
            <ArrowDownCircle size={20} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Recharge Amount</h2>
          </div>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl glass text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder={`Min ${settings.min_deposit.toLocaleString()} UGX`} />
          <div className="flex flex-wrap gap-2">
            {[10000, 20000, 50000, 100000, 200000, 500000].map(v => (
              <button key={v} onClick={() => setAmount(v.toString())}
                className="px-3 py-1.5 rounded-lg glass text-xs font-medium text-foreground hover:bg-primary/10 transition-colors">
                {v.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Phone Number */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} className="text-primary" />
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
            </div>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter your mobile money number e.g. 0771234567" />
          </div>

          {/* Network Selection */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-3 block">Select Network</label>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setNetwork('airtel')}
                className={`py-5 px-4 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-3 ${
                  network === 'airtel'
                    ? 'border-destructive bg-destructive/10 shadow-lg scale-[1.02]'
                    : 'border-border/30 glass hover:border-destructive/50'
                }`}>
                <img src={airtelLogo} alt="Airtel" className="w-14 h-14 object-contain" />
                <span className="text-foreground font-semibold">Airtel Money</span>
              </button>
              <button onClick={() => setNetwork('mtn')}
                className={`py-5 px-4 rounded-2xl text-sm font-bold transition-all border-2 flex flex-col items-center gap-3 ${
                  network === 'mtn'
                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg scale-[1.02]'
                    : 'border-border/30 glass hover:border-yellow-500/50'
                }`}>
                <img src={mtnLogo} alt="MTN" className="w-14 h-14 object-contain" />
                <span className="text-foreground font-semibold">MTN MoMo</span>
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className="glass rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-primary">{statusMessage}</p>
              </div>
            </div>
          )}

          <button onClick={handleRecharge} disabled={processing}
            className="w-full btn-accent py-3 text-sm disabled:opacity-50">
            {processing ? 'Processing...' : 'Recharge Now'}
          </button>

          <p className="text-[10px] text-center text-muted-foreground">
            Powered by Capital Gain Pay™ • Secure & Instant
          </p>
        </div>

        {/* Deposit Instructions */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-primary" />
            <h2 className="text-sm font-semibold font-heading text-foreground">How to Deposit</h2>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <p><span className="text-foreground font-medium">Enter the amount</span> — Enter the amount you wish to deposit. Minimum deposit is {settings.min_deposit.toLocaleString()} UGX.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <p><span className="text-foreground font-medium">Enter your phone number</span> — Input the mobile money number you want to pay from.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <p><span className="text-foreground font-medium">Select your network</span> — Choose either Airtel Money or MTN MoMo depending on your provider.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <p><span className="text-foreground font-medium">Tap "Recharge Now"</span> — An STK push will be sent to your phone. Enter your mobile money PIN to confirm.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
              <p><span className="text-foreground font-medium">Wait for confirmation</span> — Once payment is confirmed, your balance will be updated automatically and you'll be redirected to the home page.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RechargePage;
