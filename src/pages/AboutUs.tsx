import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const AboutUs = () => {
  const navigate = useNavigate();
  const { settings } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">About Us</h1>
      </div>
      <div className="px-4 -mt-4">
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-primary" />
            <h2 className="text-base font-bold font-heading text-foreground">{settings.websiteName}</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to {settings.websiteName}. We are a trusted investment platform dedicated to helping you grow your wealth through smart investments with daily returns.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Our platform offers {settings.dailyEarnings}% daily returns on investments with a {settings.investmentPeriod}-day investment period. Join thousands of satisfied investors today.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
