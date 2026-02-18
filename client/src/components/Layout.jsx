import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 transition-all duration-300">
        {/* Professional Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">
              NaWal Moter <span className="text-slate-300 mx-1">|</span> Enterprise Portal
            </h2>
          </div>

          {/* User Profile Summary */}
          <div className="flex items-center gap-4 group cursor-default">
            <div className="text-right hidden sm:block border-r border-slate-100 pr-4">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                {user?.role || 'Guest'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold border border-slate-800 shadow-md group-hover:scale-105 transition-transform">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Layout;