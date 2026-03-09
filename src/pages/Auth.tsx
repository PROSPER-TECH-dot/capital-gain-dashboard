import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { settings } = useApp();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regReferral, setRegReferral] = useState('');

  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('referral');
    if (ref) {
      setRegReferral(ref);
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginId || !loginPass) { setError('Please fill all fields'); return; }
    setLoading(true);
    const result = await login(loginId, loginPass);
    setLoading(false);
    if (result.error) setError(result.error);
    else {
      // Store welcome notification for home page
      sessionStorage.setItem('login_welcome', loginId);
      navigate('/home');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regUsername || !regEmail || !regPhone || !regPass || !regConfirm) {
      setError('Please fill all required fields'); return;
    }
    if (regPass !== regConfirm) { setError('Passwords do not match'); return; }
    if (regPass.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const result = await register({ username: regUsername, email: regEmail, phone: regPhone, password: regPass, referralCode: regReferral || undefined });
    setLoading(false);
    if (result.error) setError(result.error);
    else {
      sessionStorage.setItem('register_success', '1');
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-primary-foreground flex items-baseline justify-center">
            🪙{settings.website_name}
          </h1>
          <p className="text-primary-foreground/70 text-sm mt-1">Your trusted investment partner</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex mb-6 rounded-xl overflow-hidden glass-card">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                isLogin ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              <LogIn size={16} /> Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                !isLogin ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">Username or Email</label>
                <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter username or email" />
              </div>
              <div className="relative">
                <label className="text-xs font-medium text-foreground/80 mb-1 block">Password</label>
                <input type={showPassword ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                  placeholder="Enter password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-muted-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-accent py-3 text-sm disabled:opacity-50">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">Username</label>
                <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Choose a username" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">Email</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter email" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">Phone Number</label>
                <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter phone number" />
              </div>
              <div className="relative">
                <label className="text-xs font-medium text-foreground/80 mb-1 block">Password</label>
                <input type={showPassword ? 'text' : 'password'} value={regPass} onChange={e => setRegPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                  placeholder="Create password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-muted-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">Confirm Password</label>
                <input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Confirm password" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block">Referral Code <span className="text-muted-foreground">(optional)</span></label>
                <input type="text" value={regReferral} onChange={e => setRegReferral(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl glass-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${regReferral ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
                  placeholder="Enter referral code" />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-accent py-3 text-sm disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-primary-foreground/60 text-xs">© 2026 capital gain investment inc.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
