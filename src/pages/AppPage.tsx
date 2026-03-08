import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone } from 'lucide-react';

const AppPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">App</h1>
      </div>
      <div className="px-4 -mt-4">
        <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
          <Smartphone size={48} className="text-primary mx-auto mb-4" />
          <h2 className="text-lg font-bold font-heading text-foreground mb-2">Coming Soon</h2>
          <p className="text-sm text-muted-foreground">Our mobile app is under development. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
};

export default AppPage;
