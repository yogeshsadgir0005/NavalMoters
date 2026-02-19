import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      
      {/* Pass state down to control the mobile drawer */}
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      {/* Main Content Wrapper - Notice md:ml-64 so it only pushes content on Desktop */}
      <div className="flex-1 flex flex-col md:ml-64 w-full transition-all duration-300">
        
        {/* Professional Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Hamburger Menu - Visible ONLY on mobile/tablet */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span className="w-1 h-4 md:h-5 bg-blue-600 rounded-full shrink-0"></span>
            
            <h2 className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest md:tracking-[0.2em] truncate">
              NaWal Motor <span className="text-slate-300 mx-1 md:mx-2">|</span> <span className="hidden sm:inline">Enterprise Portal</span>
            </h2>
          </div>

          {/* User Profile Summary */}
          <div className="flex items-center gap-3 md:gap-4 group cursor-default shrink-0">
            <div className="text-right hidden sm:block border-r border-slate-100 pr-4">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                {user?.role || 'Guest'}
              </p>
            </div>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold border border-slate-800 shadow-md md:group-hover:scale-105 transition-transform text-xs md:text-base">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;