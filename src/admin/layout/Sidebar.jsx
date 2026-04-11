import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Image as ImageIcon, 
  Users, 
  Bell, 
  Tags, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';

const NAV_ITEMS = [
  { path: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { path: '/admin/blogs', icon: <FileText size={18} />, label: 'Blogs' },
  { path: '/admin/ai-generator', icon: <Sparkles size={18} />, label: 'AI Generator' },
  { path: '/admin/media', icon: <ImageIcon size={18} />, label: 'Media Library' },
  { path: '/admin/subscribers', icon: <Users size={18} />, label: 'Subscribers' },
  { path: '/admin/notifications', icon: <Bell size={18} />, label: 'Notifications' },
  { path: '/admin/categories', icon: <Tags size={18} />, label: 'Categories' },
  { path: '/admin/settings', icon: <Settings size={18} />, label: 'Settings' }
];

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useContent();

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 ease-in-out flex flex-col pt-4 pb-6
          ${collapsed ? 'w-20' : 'w-64'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header/Logo */}
        <div className="flex items-center justify-between px-6 mb-8 mt-2">
          {!collapsed && (
            <div className="font-bold text-lg tracking-tight select-none">
              NewsForge<span className="text-primary">.Admin</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">
              NF
            </div>
          )}
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-6 h-6 rounded-md items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Wrapper */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
             <NavLink
                end={item.path === '/admin'}
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                  ${isActive 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
             >
               <span className="shrink-0">{item.icon}</span>
               {!collapsed && <span className="truncate">{item.label}</span>}
             </NavLink>
          ))}
        </div>

        {/* Footer / Logout */}
        <div className="px-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
           <button 
              onClick={logout}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? 'Logout' : undefined}
           >
             <LogOut size={18} className="shrink-0" />
             {!collapsed && <span>Logout</span>}
           </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
