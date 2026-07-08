import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import these
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Moon, 
  Sun,
  ChevronDown,
  Settings,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = ({ setSidebarOpen }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success("Logged out");
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="hidden rounded-full p-2 text-slate-500 hover:bg-slate-100 md:block"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button> */}

        {/* <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button> */}

        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0145F2] text-xs font-medium text-white uppercase">
              A
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold leading-none text-slate-900 truncate max-w-[150px]">
                Admin User
              </p>
              <p className="text-xs text-slate-500 mt-1">Super Admin</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showProfileMenu && (
            <>
              {/* Invisible backdrop to close menu when clicking outside */}
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowProfileMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-xl z-10">
                <Link 
                  to="/admin/settings" 
                  className="flex w-full items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings size={16} className="mr-2" /> Settings
                </Link>

                <div className="my-1 border-t border-slate-100"></div>
                
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
