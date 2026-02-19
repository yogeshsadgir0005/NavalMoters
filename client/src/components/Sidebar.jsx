import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Icons (Inline SVGs) ---
const Icons = {
  Dashboard: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Users: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Settings: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Calendar: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Money: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Shield: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  User: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  LogOut: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  if (!user) return null;

  // Role Checks
  const isAdmin = user.role === 'ADMIN';
  const isHR = user.role === 'HR';
  const isEmployee = user.role === 'EMPLOYEE';
  
  // Group permissions
  const canAccessManagement = isAdmin || isHR;

  // Updated NavItem to accept Icon Component
  const NavItem = ({ to, label, Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
        <span className="font-medium text-sm tracking-wide">{label}</span>
      </Link>
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-64 h-screen bg-slate-900 text-white fixed flex flex-col shadow-2xl z-20 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-900">
        <h1 className="text-xl font-extrabold tracking-tighter text-white">
          NAWAL<span className="text-blue-500">MOTOR</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {/* 1. MANAGEMENT SECTION (Admin & HR) */}
        {canAccessManagement && (
          <>
            <div className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2">
              Management
            </div>
            <NavItem to="/dashboard" label="Dashboard" Icon={Icons.Dashboard} />
            <NavItem to="/personnel" label="Personnel" Icon={Icons.Users} />
            <NavItem to="/masters" label="System Settings" Icon={Icons.Settings} />
            
            {/* Reports Group */}
            <div className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">
              Reports
            </div>
            <NavItem to="/attendance" label="Attendance Logs" Icon={Icons.Calendar} />
            <NavItem to="/salary-report" label="Salary Reports" Icon={Icons.Money} />
          </>
        )}

        {/* 2. ADMIN ONLY SECTION */}
        {isAdmin && (
          <>
            <div className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">
              Administration
            </div>
            <NavItem to="/admin/users" label="Access Control" Icon={Icons.Shield} />
          </>
        )}
        
        {/* 3. EMPLOYEE ONLY SECTION (My Space) */}
        {isEmployee && (
          <>
            <div className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6">
              Personal
            </div>
            <NavItem to="/myspace" label="My Profile" Icon={Icons.User} />
          </>
        )}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group"
        >
          <Icons.LogOut className="w-5 h-5 text-slate-500 group-hover:text-rose-500 transition-colors" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;