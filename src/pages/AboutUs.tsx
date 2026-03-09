import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Target, Headphones, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const AboutUs = () => {
  const navigate = useNavigate();
  const { settings } = useApp();

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">About Us</h1>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        {/* About */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-primary" />
            <h2 className="text-base font-bold font-heading text-foreground">{settings.website_name}</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to {settings.website_name} — Uganda's leading digital investment platform built on trust, transparency, and technology. We provide everyday Ugandans with the opportunity to grow their wealth through smart, secure micro-investments with guaranteed daily returns.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Our platform offers {settings.daily_earnings}% daily returns on investments with a {settings.investment_period}-day investment cycle. Whether you're a student, entrepreneur, or working professional, Capital Gain Investment makes wealth creation accessible to everyone.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Since our launch, we have served thousands of satisfied investors who trust us with their financial growth. Our platform supports instant mobile money deposits and withdrawals through Airtel Money and MTN MoMo, making transactions seamless and fast.
          </p>
        </div>

        {/* Why Choose Us */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="text-base font-bold font-heading text-foreground">Why Choose Us?</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: CheckCircle, text: `${settings.daily_earnings}% guaranteed daily returns on your investment` },
              { icon: CheckCircle, text: 'Instant deposits via Airtel Money & MTN MoMo' },
              { icon: CheckCircle, text: 'Fast and secure withdrawals directly to your mobile money' },
              { icon: CheckCircle, text: '3-level referral bonus system — earn from your network' },
              { icon: CheckCircle, text: 'Daily check-in bonuses to reward active users' },
              { icon: CheckCircle, text: '24/7 customer support via WhatsApp' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <Icon size={16} className="text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Mission */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-primary" />
            <h2 className="text-base font-bold font-heading text-foreground">Our Mission</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our mission is to democratize wealth creation by providing a simple, transparent, and accessible investment platform for all Ugandans. We believe everyone deserves the opportunity to grow their finances, regardless of their starting point.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            We are committed to building a community of empowered investors who benefit from daily returns, referral rewards, and a secure digital investment experience. Through innovation and trust, we aim to be the most reliable investment partner in East Africa.
          </p>
        </div>

        {/* Referral Program */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-primary" />
            <h2 className="text-base font-bold font-heading text-foreground">Referral Program</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Earn passive income by inviting friends and family to join {settings.website_name}. Our 3-level referral program rewards you generously:
          </p>
          <div className="mt-3 space-y-2">
            <div className="glass rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Level 1 (Direct)</span>
              <span className="text-sm font-bold text-primary">25% commission</span>
            </div>
            <div className="glass rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Level 2</span>
              <span className="text-sm font-bold text-primary">3% commission</span>
            </div>
            <div className="glass rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Level 3</span>
              <span className="text-sm font-bold text-primary">1% commission</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * Referral commissions are earned when your invited users make their first investment.
          </p>
        </div>

        {/* Contact Us */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Headphones size={20} className="text-primary" />
            <h2 className="text-base font-bold font-heading text-foreground">Contact Us</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Need help? Our customer support team is available 24/7 to assist you with any questions, concerns, or issues. Reach out to us through any of the channels below:
          </p>
          <div className="space-y-2">
            <button onClick={() => navigate('/support')}
              className="w-full btn-accent py-3 text-sm flex items-center justify-center gap-2">
              <Headphones size={16} /> Go to Customer Support
            </button>
            <a href={settings.whatsapp_group} target="_blank" rel="noopener noreferrer"
              className="w-full glass rounded-xl py-3 text-sm flex items-center justify-center gap-2 text-primary font-medium">
              💬 Join Our WhatsApp Group
            </a>
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">© 2026 {settings.website_name}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
