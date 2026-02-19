import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';

const Icons = {
  Shield: () => <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Alert: () => <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ChevronUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
  XCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHR, setSelectedHR] = useState(null);
  const [hrPassword, setHrPassword] = useState('');
  const [grantError, setGrantError] = useState(null);
  
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [userToRevoke, setUserToRevoke] = useState(null);
  const [revokeError, setRevokeError] = useState(null);

  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/hr-users'); 
      setUsers(data);
    } catch (e) { 
      console.error("Failed to load users"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setGrantError(null);
    try {
      await API.put(`/admin/hr-users/${selectedHR._id}/grant`, { password: hrPassword });
      setModalOpen(false);
      setHrPassword('');
      setSelectedHR(null);
      fetchUsers();
    } catch (e) {
      setGrantError(e.response?.data?.message || "An unexpected error occurred while granting access.");
    } finally { 
      setProcessing(false); 
    }
  };

  const confirmRemoveAccess = async () => {
    if (!userToRevoke) return;
    setProcessing(true);
    setRevokeError(null);
    try {
      await API.put(`/admin/hr-users/${userToRevoke._id}/revoke`);
      setExpandedUser(null);
      setRevokeModalOpen(false);
      setUserToRevoke(null);
      fetchUsers();
    } catch (e) {
      setRevokeError(e.response?.data?.message || "An unexpected error occurred while revoking access.");
    } finally {
      setProcessing(false);
    }
  };

  const initiateRemoveAccess = (user) => {
      setUserToRevoke(user);
      setRevokeError(null);
      setRevokeModalOpen(true);
  };

  const toggleExpand = (id) => setExpandedUser(prev => prev === id ? null : id);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="p-2 md:p-3 bg-white border border-slate-200 rounded-lg md:rounded-xl shadow-sm text-blue-600 shrink-0">
                <Icons.Shield />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Access Control</h1>
                <p className="text-slate-500 text-xs md:text-sm">Manage system administrators and HR personnel access.</p>
            </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-800 text-xs md:text-sm">Authorized HRs</h3>
            <span className="text-[10px] md:text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{users.length} Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                    <th className="px-4 md:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">HR Identity</th>
                    <th className="px-4 md:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Role</th>
                    <th className="px-4 md:px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan="3" className="p-8 text-center text-slate-500 text-sm">Loading users...</td></tr>
                ) : users.length === 0 ? (
                    <tr><td colSpan="3" className="p-8 text-center text-slate-400 text-xs italic">No HR users configured.</td></tr>
                ) : users.map(u => (
                    <div key={u._id} className="contents">
                    <tr className="hover:bg-blue-50/10 transition-colors group">
                        <td className="px-4 md:px-6 py-3 md:py-4">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shrink-0 ${
                                    u.role === 'ADMIN' ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {u.email.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-slate-700 text-xs md:text-sm group-hover:text-blue-700 transition-colors truncate">{u.email}</span>
                            </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                            <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-[9px] md:text-[11px] font-bold uppercase tracking-wide border bg-purple-50 text-purple-700 border-purple-100">
                                {u.role}
                            </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                            <div className="flex items-center justify-end gap-2 md:gap-3">
                                {u.assignedPassword ? (
                                    <>
                                        <button 
                                            onClick={() => initiateRemoveAccess(u)} 
                                            className="px-2 py-1 md:px-3 md:py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold hover:bg-rose-100 transition-colors"
                                        >
                                            Remove
                                        </button>
                                        <button onClick={() => toggleExpand(u._id)} className="p-1 md:p-1.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-md md:rounded-lg shadow-sm transition-all hover:bg-blue-50">
                                            {expandedUser === u._id ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => { setSelectedHR(u); setGrantError(null); setModalOpen(true); }} 
                                        className="px-3 py-1.5 md:px-4 md:py-1.5 bg-blue-600 text-white rounded-md md:rounded-lg text-[10px] md:text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Grant Access
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                    
                    {expandedUser === u._id && u.assignedPassword && (
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <td colSpan="3" className="p-3 md:p-4">
                                <div className="bg-white border border-slate-200 rounded-lg p-3 md:p-4 max-w-md mx-auto shadow-sm flex flex-col gap-2">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-100 pb-2 gap-1 md:gap-0">
                                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Login Email</span>
                                        <span className="text-xs md:text-sm font-semibold text-slate-800 break-all">{u.email}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between md:items-center pt-1 gap-1 md:gap-0">
                                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Password</span>
                                        <span className="text-xs md:text-sm font-mono font-bold text-slate-800 break-all">{u.assignedPassword}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                    </div>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && selectedHR && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm md:text-base">Grant HR Access</h3>
                    <button onClick={() => { setModalOpen(false); setHrPassword(''); setSelectedHR(null); setGrantError(null); }} className="text-slate-400 hover:text-slate-600"><Icons.XCircle /></button>
                </div>
                <form onSubmit={handleGrantAccess} className="p-4 md:p-6 space-y-4 md:space-y-5">
                    {grantError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm flex items-start gap-2 md:gap-3">
                            <div className="mt-0.5"><Icons.Alert /></div>
                            <div>
                                <h4 className="font-bold text-rose-900 text-[10px] md:text-xs uppercase tracking-wider">Access Error</h4>
                                <p className="text-[10px] md:text-xs mt-0.5">{grantError}</p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <input type="email" value={selectedHR.email} disabled className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-xs md:text-sm font-medium cursor-not-allowed" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Set Password</label>
                        <input required type="text" value={hrPassword} onChange={(e) => setHrPassword(e.target.value)} className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs md:text-sm transition-all" placeholder="Enter secure password" />
                    </div>
                    <div className="pt-2 flex flex-col-reverse md:flex-row justify-end gap-2 md:gap-3">
                        <button type="button" onClick={() => { setModalOpen(false); setHrPassword(''); setSelectedHR(null); setGrantError(null); }} className="w-full md:w-auto px-4 py-2 md:px-5 md:py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-xs md:text-sm transition-all">Cancel</button>
                        <button type="submit" disabled={processing} className="w-full md:w-auto px-4 py-2 md:px-5 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs md:text-sm shadow-md transition-all">
                            {processing ? 'Processing...' : 'Confirm Access'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {revokeModalOpen && userToRevoke && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/30">
                    <div className="flex items-center gap-2 text-rose-700">
                        <Icons.Alert />
                        <h3 className="font-bold text-rose-900 text-sm md:text-base">Revoke Access</h3>
                    </div>
                    <button onClick={() => { setRevokeModalOpen(false); setUserToRevoke(null); setRevokeError(null); }} className="text-slate-400 hover:text-slate-600"><Icons.XCircle /></button>
                </div>
                <div className="p-4 md:p-6">
                    {revokeError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm flex items-start gap-2 md:gap-3 mb-4 md:mb-5">
                            <div className="mt-0.5"><Icons.Alert /></div>
                            <div>
                                <h4 className="font-bold text-rose-900 text-[10px] md:text-xs uppercase tracking-wider">Action Failed</h4>
                                <p className="text-[10px] md:text-xs mt-0.5">{revokeError}</p>
                            </div>
                        </div>
                    )}
                    <p className="text-xs md:text-sm text-slate-600 mb-5 md:mb-6 leading-relaxed">
                        Are you sure you want to completely revoke system access for <strong className="text-slate-800 break-all">{userToRevoke.email}</strong>? They will immediately lose access to the portal.
                    </p>
                    
                    <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 justify-end">
                        <button onClick={() => { setRevokeModalOpen(false); setUserToRevoke(null); setRevokeError(null); }} className="w-full md:w-auto px-4 py-2 md:px-5 md:py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-xs md:text-sm transition-all">
                            Cancel
                        </button>
                        <button onClick={confirmRemoveAccess} disabled={processing} className="w-full md:w-auto px-4 py-2 md:px-5 md:py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs md:text-sm shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2">
                            {processing ? 'Processing...' : 'Yes, Revoke Access'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </Layout>
  );
};
export default AdminUserManagement;