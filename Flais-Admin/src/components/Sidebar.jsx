import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut,
  X,
  Home,
  BookOpen,
  Info,
  MapPin,
  Trophy
} from 'lucide-react';
import toast from 'react-hot-toast'; // Optional: for a nice notification

const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },

  { name: 'Home', path: '/admin/home', icon: Home },
  { name: 'Why FLAIS', path: '/admin/why-flais', icon: Info },
  { name: 'Collection', path: '/admin/products', icon: Package },
  { name: 'Flais Park', path: '/admin/flais-park', icon: MapPin },
  { name: 'Catalog', path: '/admin/catalog', icon: BookOpen },
  { name: 'Achievement', path: '/admin/achievement', icon: Trophy },
  // { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Contact', path: '/admin/messages', icon: MessageSquare },
  { name: 'Blog', path: '/admin/blogs', icon: FileText },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Confirm with the user (optional)
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
      // 2. Clear admin auth token
      localStorage.removeItem('adminToken');
      
      // 3. Show success toast
      toast.success('Logged out successfully');

      // 4. Redirect to login page
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0145F2] text-white font-bold text-xl">
              F
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Flais <span className="text-[#0145F2]">Admin</span>
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto border-t border-slate-50">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)} // Close sidebar on mobile after clicking
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0145F2] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0145F2]'
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-red-500 transition-all duration-200 hover:bg-red-100/50"
          >
            <LogOut size={20} />
            Logout Session
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
