import { Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ userType = 'donor' }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={userType === 'donor' ? '/donor/dashboard' : '/recipient/dashboard'} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">RippleImpact</h1>
              <p className="text-xs text-gray-500">Your impact multiplies</p>
            </div>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {userType === 'donor' && (
              <Link to="/donate" className="btn-primary text-sm py-2 px-4">
                Donate
              </Link>
            )}
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
            </button>
            <button className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

