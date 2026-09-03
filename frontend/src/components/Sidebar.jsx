import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Droplets, Trash2, Map, AlertOctagon, 
  CheckSquare, Users, Wrench, Bell, BarChart3, FileText, Settings, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { alertsAPI } from '../services/api';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await alertsAPI.getUnreadCount();
        if (res.success) setUnreadCount(res.data.unread_count);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Water Management', path: '/water', icon: Droplets },
    { label: 'Waste Management', path: '/waste', icon: Trash2 },
    { label: 'Civic GIS Map', path: '/map', icon: Map },
    { label: 'Civic Incidents', path: '/incidents', icon: AlertOctagon },
    { label: 'Task Management', path: '/tasks', icon: CheckSquare },
    { label: 'Municipal Teams', path: '/teams', icon: Users },
    { label: 'Repair Services', path: '/repair-services', icon: Wrench },
    { label: 'Alert Center', path: '/alerts', icon: Bell, badge: unreadCount },
    { label: 'Analytics Suite', path: '/analytics', icon: BarChart3 },
    { label: 'Reports Portal', path: '/reports', icon: FileText },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Settings & Users', path: '/settings', icon: Settings });
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 shadow-xl select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl text-white shadow-lg shadow-sky-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-base text-white tracking-wide leading-tight">CivicResource</h1>
          <p className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase">Water & Waste Platform</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-md shadow-sky-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-900 border border-sky-600/40 flex items-center justify-center font-bold text-sky-300 text-xs">
            {user?.full_name?.charAt(0) || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Municipal Admin'}</p>
            <span className={`inline-block px-1.5 py-0.2 text-[9px] font-extrabold rounded ${
              user?.role === 'ADMIN' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
            }`}>
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
