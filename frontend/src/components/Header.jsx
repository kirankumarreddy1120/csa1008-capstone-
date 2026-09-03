import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Search, Activity, User, ShieldCheck } from 'lucide-react';

const Header = ({ title = "Municipal Resource Operations Center" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Status */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 leading-tight">{title}</h2>
          <p className="text-[10px] text-slate-400 font-medium">Unified Civic Resource Monitoring & Incident Response</p>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">System Operational</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs w-56">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search zones, wards, incidents..."
            className="bg-transparent outline-none w-full text-xs text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/alerts')}
          className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition-colors relative"
          title="Alert Center"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Info & Logout */}
        <div className="pl-2 border-l border-slate-200 flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.full_name || 'Admin User'}</p>
            <p className="text-[10px] text-slate-400 font-mono">{user?.email || 'admin@civicresource.gov'}</p>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
