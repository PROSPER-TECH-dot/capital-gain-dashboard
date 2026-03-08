import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, User, CircleDollarSign } from 'lucide-react';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/invest', icon: CircleDollarSign, label: 'Invest' },
  { to: '/my-team', icon: Users, label: 'My Team' },
  { to: '/mine', icon: User, label: 'Mine' },
];

const BottomNav = () => {
  const location = useLocation();
  const isMainPage = navItems.some(i => location.pathname === i.to);
  if (!isMainPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200 ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon size={22} strokeWidth={location.pathname === to ? 2 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
