import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Camera, Info, HeadphonesIcon, Lock, Smartphone, Eye, Gift, LogOut, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

const menuItems = [
  { icon: Info, label: 'About Us', path: '/about' },
  { icon: HeadphonesIcon, label: 'Customer Support', path: '/support' },
  { icon: Lock, label: 'Change Password', path: '/change-password' },
  { icon: Smartphone, label: 'App', path: '/app' },
  { icon: Eye, label: 'Profile Viewer', path: '/profile-view' },
  { icon: Gift, label: 'Gift Code', path: '/gift-code' },
];

const MinePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) { navigate('/'); return null; }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateUser(user.id, { profilePhoto: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="gradient-hero p-6 pb-14 rounded-b-3xl">
        <h1 className="text-xl font-bold font-heading text-primary-foreground">Mine</h1>
      </div>

      <div className="px-4 -mt-10 space-y-4">
        {/* Profile card */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/30">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{user.username[0].toUpperCase()}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-primary flex items-center justify-center shadow-md"
            >
              <Camera size={12} className="text-primary-foreground" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
          <div>
            <p className="text-base font-semibold font-heading text-foreground">{user.username}</p>
            <p className="text-xs text-muted-foreground">Code: {user.referralCode}</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {menuItems.map(({ icon: Icon, label, path }, i) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-primary/5 ${
                i < menuItems.length - 1 ? 'border-b border-border/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-primary" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl bg-destructive/10 text-destructive font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:bg-destructive/20"
        >
          <LogOut size={18} /> Log Out
        </button>
      </div>
    </div>
  );
};

export default MinePage;
