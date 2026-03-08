import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MyInvestmentsPage = () => {
  const { user } = useAuth();
  const { investments, settings } = useApp();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for live tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const userInvestments = investments.filter(i => i.user_id === user.id);
  const activeInvestments = userInvestments.filter(i => i.active);
  const completedInvestments = userInvestments.filter(i => !i.active);

  const calculateInvestmentProgress = (investment: any) => {
    const startDate = new Date(investment.start_date);
    const endDate = new Date(investment.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.min(totalDays, Math.floor((currentTime.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    const progressPercentage = (elapsedDays / totalDays) * 100;
    const currentEarnings = elapsedDays * (Number(investment.amount) * Number(investment.daily_return) / 100);
    const totalExpectedEarnings = totalDays * (Number(investment.amount) * Number(investment.daily_return) / 100);

    return {
      totalDays,
      elapsedDays,
      remainingDays,
      progressPercentage: Math.min(100, progressPercentage),
      currentEarnings,
      totalExpectedEarnings,
      dailyEarning: Number(investment.amount) * Number(investment.daily_return) / 100
    };
  };

  const totalInvested = userInvestments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalCurrentEarnings = activeInvestments.reduce((sum, inv) => {
    const progress = calculateInvestmentProgress(inv);
    return sum + progress.currentEarnings;
  }, 0);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="gradient-hero p-4 pb-8 rounded-b-3xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-primary-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold font-heading text-primary-foreground">My Investments</h1>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Investment Overview */}
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Total Invested</p>
                <p className="text-sm font-bold text-foreground">{totalInvested.toLocaleString()} UGX</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground">Current Earnings</p>
                <p className="text-sm font-bold text-accent">{totalCurrentEarnings.toLocaleString()} UGX</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-secondary-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Active Plans</p>
                <p className="text-sm font-bold text-foreground">{activeInvestments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Investments */}
        {activeInvestments.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold font-heading text-foreground mb-3 px-1">Active Investments</h2>
            <div className="space-y-3">
              {activeInvestments.map(investment => {
                const progress = calculateInvestmentProgress(investment);
                return (
                  <Card key={investment.id} className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          {Number(investment.amount).toLocaleString()} UGX
                        </span>
                        <span className="text-xs text-primary font-medium">
                          {settings.daily_earnings}% Daily
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress ({progress.elapsedDays}/{progress.totalDays} days)</span>
                          <span>{progress.progressPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress.progressPercentage} className="h-2" />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="glass rounded-lg p-2">
                          <p className="text-muted-foreground">Days Remaining</p>
                          <p className="font-bold text-foreground">{progress.remainingDays} days</p>
                        </div>
                        <div className="glass rounded-lg p-2">
                          <p className="text-muted-foreground">Daily Earning</p>
                          <p className="font-bold text-primary">+{progress.dailyEarning.toLocaleString()}</p>
                        </div>
                        <div className="glass rounded-lg p-2">
                          <p className="text-muted-foreground">Current Earnings</p>
                          <p className="font-bold text-accent">{progress.currentEarnings.toLocaleString()} UGX</p>
                        </div>
                        <div className="glass rounded-lg p-2">
                          <p className="text-muted-foreground">Expected Total</p>
                          <p className="font-bold text-foreground">{progress.totalExpectedEarnings.toLocaleString()} UGX</p>
                        </div>
                      </div>

                      {/* Investment Dates */}
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Started: {new Date(investment.start_date).toLocaleDateString()}</span>
                          <span>Ends: {new Date(investment.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Investments */}
        {completedInvestments.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold font-heading text-foreground mb-3 px-1">Completed Investments</h2>
            <div className="space-y-3">
              {completedInvestments.map(investment => {
                const totalEarnings = Number(investment.total_earned);
                return (
                  <Card key={investment.id} className="glass-card opacity-80">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">
                          {Number(investment.amount).toLocaleString()} UGX
                        </span>
                        <span className="text-xs text-muted-foreground">Completed</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Total Earned:</span>
                        <span className="font-semibold text-accent">{totalEarnings.toLocaleString()} UGX</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>{new Date(investment.start_date).toLocaleDateString()}</span>
                        <span>{new Date(investment.end_date).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Investments State */}
        {userInvestments.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-foreground mb-2">No Investments Yet</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Start investing to grow your wealth with {settings.daily_earnings}% daily returns
              </p>
              <button 
                onClick={() => navigate('/invest')}
                className="btn-accent px-6 py-2 text-xs"
              >
                Start Investing
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyInvestmentsPage;