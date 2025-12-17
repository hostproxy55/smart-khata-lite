import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Zap, Users, BarChart3, LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/quick-entry', label: 'Quick Entry', icon: Zap },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center py-3 px-4 min-w-[72px] tap-highlight"
            >
              <motion.div
                className={`flex flex-col items-center gap-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -top-0.5 w-8 h-1 bg-primary rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </motion.div>
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
};
