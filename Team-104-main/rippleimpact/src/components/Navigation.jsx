import { Home, Users, Network, Settings, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ userType = 'donor' }) => {
  const location = useLocation();

  const donorNavItems = [
    { icon: Home, label: 'Dashboard', path: '/donor/dashboard' },
    { icon: Users, label: 'People', path: '/donor/people' },
    { icon: Network, label: 'Impact', path: '/donor/impact' },
    { icon: Settings, label: 'Settings', path: '/donor/settings' },
  ];

  const recipientNavItems = [
    { icon: Home, label: 'Dashboard', path: '/recipient/dashboard' },
    { icon: MessageSquare, label: 'Community', path: '/recipient/community' },
    { icon: Users, label: 'Discover', path: '/recipient/discover' },
    { icon: Settings, label: 'Settings', path: '/recipient/settings' },
  ];

  const navItems = userType === 'donor' ? donorNavItems : recipientNavItems;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navigation;

