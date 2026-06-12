import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Menu, ChevronLeft, LogOut, 
  LayoutDashboard, LifeBuoy, HeartHandshake, Bot,
  PieChart, Bell, Siren, Box,
  ShieldAlert, Map, Activity, FlaskConical, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_CONFIG = {
  citizen: [
    { name: 'Dashboard', path: '/citizen', icon: LayoutDashboard },
    { name: 'SOS', path: '/citizen/sos', icon: LifeBuoy },
    { name: 'Help Others', path: '/citizen/help', icon: HeartHandshake },
    { name: 'AI Assistant', path: '/citizen/ai', icon: Bot },
  ],
  collector: [
    { name: 'Overview', path: '/collector', icon: PieChart },
    { name: 'Alerts', path: '/collector/alerts', icon: Bell },
    { name: 'SOS Management', path: '/collector/sos', icon: Siren },
    { name: 'Resources', path: '/collector/resources', icon: Box },
    { name: 'AI Assistant', path: '/collector/ai', icon: Bot },
  ],
  district_authority: [
    { name: 'Command Center', path: '/authority', icon: ShieldAlert },
    { name: 'Risk Map', path: '/authority/map', icon: Map },
    { name: 'Events', path: '/authority/events', icon: Activity },
    { name: 'Simulation Lab', path: '/authority/simulation', icon: FlaskConical },
    { name: 'AI Assistant', path: '/authority/ai', icon: Bot },
    { name: 'Reports', path: '/authority/reports', icon: FileText },
  ],
  state_authority: [
    { name: 'Command Center', path: '/authority', icon: ShieldAlert },
    { name: 'Risk Map', path: '/authority/map', icon: Map },
    { name: 'Events', path: '/authority/events', icon: Activity },
    { name: 'Simulation Lab', path: '/authority/simulation', icon: FlaskConical },
    { name: 'AI Assistant', path: '/authority/ai', icon: Bot },
    { name: 'Reports', path: '/authority/reports', icon: FileText },
  ],
  ndma: [
    { name: 'Command Center', path: '/authority', icon: ShieldAlert },
    { name: 'Risk Map', path: '/authority/map', icon: Map },
    { name: 'Events', path: '/authority/events', icon: Activity },
    { name: 'Simulation Lab', path: '/authority/simulation', icon: FlaskConical },
    { name: 'AI Assistant', path: '/authority/ai', icon: Bot },
    { name: 'Reports', path: '/authority/reports', icon: FileText },
  ]
};

const getRoleBadgeClasses = (role) => {
  switch (role) {
    case 'citizen': return 'bg-slate-700 text-slate-100 border-slate-600';
    case 'collector': return 'bg-blue-900/50 text-blue-400 border-blue-800';
    case 'district_authority': return 'bg-orange-900/50 text-orange-400 border-orange-800';
    case 'state_authority': return 'bg-purple-900/50 text-purple-400 border-purple-800';
    case 'ndma': return 'bg-red-900/50 text-red-400 border-red-800';
    default: return 'bg-slate-700 text-slate-100 border-slate-600';
  }
};

const formatRole = (role) => {
  if (!role) return '';
  return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const AppLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role ? NAV_CONFIG[user.role] || [] : [];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isExpanded ? 'w-60' : 'w-16'} flex-shrink-0 border-r border-slate-700 bg-slate-900 flex flex-col transition-all duration-300 ease-in-out relative z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {isExpanded && <span className="font-bold text-red-500 text-xl truncate">Crisora AI</span>}
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 transition-colors mx-auto"
          >
            {isExpanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 space-y-2">
          {navItems.map((item) => {
            // Check active route strictly to avoid nested path highlighting issues
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'
                }`}
                title={!isExpanded ? item.name : undefined}
              >
                <item.icon size={20} className={isActive ? 'text-red-400 flex-shrink-0' : 'text-slate-400 flex-shrink-0'} />
                {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-700 bg-slate-800/50 relative z-10 backdrop-blur-sm">
          <div className="flex items-center">
            {/* Show app name on mobile or when collapsed if preferred, here keeping it clean */}
            {!isExpanded && <span className="font-bold text-red-500 text-xl sm:hidden">Crisora AI</span>}
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold tracking-wide ${getRoleBadgeClasses(user?.role)}`}>
              {formatRole(user?.role)}
            </span>
            <span className="font-medium text-slate-200 hidden sm:block">{user?.name}</span>
            <div className="w-px h-6 bg-slate-700 hidden sm:block"></div>
            <button 
              onClick={handleLogout} 
              className="text-slate-400 hover:text-red-400 transition-colors flex items-center group"
            >
              <LogOut size={18} className="group-hover:scale-110 transition-transform" />
              <span className="ml-2 hidden sm:block font-medium">Logout</span>
            </button>
          </div>
        </header>

        {/* Main page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900 relative">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
