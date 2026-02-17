import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import { Link } from 'react-router-dom';

const Icons = {
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  User: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Check: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  XCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

const Personnel = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    setPageError(null);
    try {
      const res = await API.get('/employees');
      setEmployees(res.data);
    } catch (e) {
      setPageError("Failed to retrieve employee records. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!newEmail.trim()) {
      setModalError("Please enter a valid email address.");
      return;
    }

    setCreating(true);
    try {
      await API.post('/employees', { email: newEmail.trim(), firstName: 'New', lastName: 'Employee' });
      setShowModal(false);
      setNewEmail('');
      fetchEmployees();
    } catch (e) {
      const backendError = e.response?.data?.message || '';
      if (backendError.toLowerCase().includes('duplicate') || backendError.includes('E11000')) {
        setModalError("An employee with this email is already registered.");
      } else {
        setModalError(backendError || "Failed to initialize the new employee record.");
      }
    } finally {
      setCreating(false);
    }
  };

  const filtered = employees.filter(e => 
    e.firstName?.toLowerCase().includes(search.toLowerCase()) || 
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personnel Management</h1>
                <p className="text-slate-500 text-sm">Manage all employee records and profiles.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                        <Icons.Search />
                    </div>
                    <input 
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                        placeholder="Search by name or email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => { setShowModal(true); setModalError(null); setNewEmail(''); }} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap shadow-md shadow-blue-100 transition-all flex items-center gap-2 active:scale-95"
                >
                    <Icons.Plus /> Add New
                </button>
            </div>
        </div>

        {pageError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 mb-6 shadow-sm">
                <div className="mt-0.5"><Icons.Alert /></div>
                <div>
                    <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">System Error</h4>
                    <p className="text-xs mt-0.5">{pageError}</p>
                </div>
            </div>
        )}

        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee Details</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role & Dept</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Info</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-100 border-t-blue-600"></div>
                                        <span className="text-slate-400 text-xs font-medium">Loading records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length > 0 ? (
                            filtered.map(emp => (
                                <tr key={emp._id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <Icons.User />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{(emp.firstName || 'New') + ' ' + (emp.lastName || 'Employee')}</div>
                                                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider font-mono">{emp.employeeCode || 'NO-ID'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-semibold text-slate-700">{emp.jobProfile?.name || '—'}</div>
                                        <div className="text-[11px] text-slate-500">{emp.department?.name || 'Unassigned'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-600">{emp.email}</td>
                                    <td className="px-6 py-4">
                                        {emp.isProfileComplete ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <Icons.Check /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-100">
                                                <Icons.Alert /> Incomplete
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            to={`/wizard/${emp._id}`} 
                                            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-xs border border-slate-200 hover:border-blue-200 hover:bg-white px-3 py-1.5 rounded-lg transition-all shadow-sm group-hover:bg-white"
                                        >
                                            <Icons.Edit /> Edit Profile
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-400 text-sm font-medium italic">
                                    No employees found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {showModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-100">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <span className="text-blue-600"><Icons.Plus /></span> Initialize Employee
                        </h3>
                        <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-md">
                            <Icons.XCircle />
                        </button>
                    </div>
                    
                    <form onSubmit={handleCreateEmployee} className="p-6">
                        {modalError && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3 mb-5">
                                <div className="mt-0.5"><Icons.Alert /></div>
                                <div>
                                    <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">Validation Error</h4>
                                    <p className="text-xs mt-0.5">{modalError}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5 mb-6">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Corporate Email Address</label>
                            <input 
                                type="email" 
                                required
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                placeholder="e.g. employee@navalmotor.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">This will be used for onboarding setup and identity verification.</p>
                        </div>

                        <div className="flex gap-3 pt-2 border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={() => setShowModal(false)} 
                                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={creating}
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-md shadow-blue-100 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {creating ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : <Icons.Check />}
                                {creating ? 'Creating...' : 'Create Record'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </Layout>
  );
};

export default Personnel;