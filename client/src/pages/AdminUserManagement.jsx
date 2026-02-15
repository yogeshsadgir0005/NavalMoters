import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';

const Icons = {
  Shield: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Mail: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  UserPlus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  User: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'HR' });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/hr-users'); 
      setUsers(data);
    } catch (e) { console.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await API.post('/auth/register-hr', formData);
      setFormData({ email: '', password: '', role: 'HR' });
      fetchUsers();
    } catch (e) { alert(e.response?.data?.message || 'Error creating user'); }
    finally { setCreating(false); }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-blue-600">
                <Icons.Shield />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Control</h1>
                <p className="text-slate-500 text-sm">Manage system administrators and HR personnel access.</p>
            </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200 mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Grant New Access
            </h3>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-7 gap-5 items-end">
                <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                            <Icons.Mail />
                        </div>
                        <input 
                            required
                            type="email" 
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                            placeholder="hr@naval.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Set Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                            <Icons.Lock />
                        </div>
                        <input 
                            required
                            type="password" 
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                </div>

                <div className="md:col-span-1">
                    <button 
                        disabled={creating}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-100 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {creating ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : <Icons.UserPlus />}
                        {creating ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-800 text-sm">Authorized Users</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{users.length} Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Identity</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Role</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Created On</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan="3" className="p-8 text-center text-slate-500 text-sm">Loading users...</td></tr>
                ) : users.map(u => (
                    <tr key={u._id} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                u.role === 'ADMIN' ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-600'
                            }`}>
                                {u.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">{u.email}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                            u.role === 'ADMIN' 
                            ? 'bg-slate-100 text-slate-700 border-slate-200' 
                            : 'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                            {u.role === 'ADMIN' && <span className="mr-1 text-[8px]">🛡️</span>}
                            {u.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400 text-xs font-medium">
                            <Icons.Calendar />
                            {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default AdminUserManagement;