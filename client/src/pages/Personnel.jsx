import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const Icons = {
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  UserPlus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  XCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Check: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Archive: () => <svg 
    className="w-5 h-5" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    
    <path d="M3 3v5h5" />
    
    <path d="M12 7v5l4 2" />
  </svg>
  };

const Badge = ({ tone = 'gray', children }) => {
  const styles = {
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-tight ${styles[tone]}`}>
      {children}
    </span>
  );
};

const ProgressBar = ({ value }) => (
  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }} />
  </div>
);

const Personnel = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [masters, setMasters] = useState({ departments: [], jobProfiles: [] });

  const [terminateModal, setTerminateModal] = useState(null);
  const [terminating, setTerminating] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', department: '', jobProfile: '', role: 'EMPLOYEE'
  });

  const fetchAll = async () => {
    setLoading(true);
    setPageError(null);
    try {
      const [empRes, masterRes] = await Promise.all([
        API.get('/employees'),
        API.get('/masters')
      ]);
      setEmployees(empRes.data || []);
      setMasters(masterRes.data || { departments: [], jobProfiles: [] });
    } catch (e) {
      setPageError(e.response?.data?.message || 'Failed to load employee records. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (employees || [])
      .filter(e => {
        const matchesQ =
          !q ||
          `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase().includes(q) ||
          (e.email || '').toLowerCase().includes(q) ||
          (e.employeeCode || '').toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'COMPLETE' && e.isProfileComplete) ||
          (statusFilter === 'INCOMPLETE' && !e.isProfileComplete);

        return matchesQ && matchesStatus;
      });
  }, [employees, search, statusFilter]);

  const resetModal = () => {
    setForm({ firstName: '', lastName: '', email: '', phone: '', department: '', jobProfile: '', role: 'EMPLOYEE' });
    setModalError(null);
  };

  const createEmployee = async () => {
    setModalError(null);
    if (!form.email.trim()) { setModalError('Corporate Email is required to initialize a new record.'); return; }
    setCreating(true);
    try {
      const res = await API.post('/employees', {
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(), phone: form.phone.trim(),
        department: form.department || undefined, 
        jobProfile: form.jobProfile || undefined, 
        role: form.role 
      });
      setOpen(false); resetModal(); await fetchAll(); navigate(`/wizard/${res.data._id}`);
    } catch (e) {
      const backendError = e.response?.data?.message || '';
      if (backendError.toLowerCase().includes('duplicate') || backendError.includes('E11000')) setModalError('An employee with this email address already exists.');
      else if (backendError.toLowerCase().includes('validation')) setModalError('Please ensure all required fields are filled out correctly.');
      else setModalError(backendError || 'An unexpected error occurred while creating the employee.');
    } finally { setCreating(false); }
  };

  const confirmTerminate = async () => {
      if (!terminateModal) return;
      setTerminating(true);
      try {
          await API.post(`/employees/${terminateModal._id}/terminate`);
          setTerminateModal(null);
          fetchAll();
      } catch (e) {
          alert('Failed to process termination.');
      } finally {
          setTerminating(false);
      }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personnel Directory</h1>
          <p className="text-sm text-slate-500">Manage your workforce, onboarding progress, and profile details.</p>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={() => navigate('/terminated')}
                className="bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 px-4 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
            >
                <Icons.Archive /> Terminated Employees
            </button>
            <button
                onClick={() => { setOpen(true); setModalError(null); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
                <Icons.UserPlus /> Add Employee
            </button>
        </div>
      </div>

      {pageError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 mb-8 shadow-sm">
          <div className="mt-0.5"><Icons.Alert /></div>
          <div>
            <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">System Error</h4>
            <p className="text-xs mt-0.5">{pageError}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none"><Icons.Search /></div>
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="Search by name, email, or employee code..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
             <select
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-slate-50 md:w-48 appearance-none cursor-pointer"
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Employees</option>
                <option value="COMPLETE">Profile Complete</option>
                <option value="INCOMPLETE">Incomplete Profile</option>
              </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Showing <span className="text-blue-600">{filtered.length}</span> Records</p>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="text-sm text-slate-400 font-medium">Fetching records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center"><p className="text-slate-400 text-sm font-medium">No employee records found matching your filters.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job Profile</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Onboarding Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(emp => {
                  // FIX: If backend says 100 progress, treat as complete
                  const isEffectiveComplete = emp.isProfileComplete || emp.profileProgress === 100;
                  
                  return (
                  <tr key={emp._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{(emp.firstName || '—')} {(emp.lastName || '')}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{emp.email}</div>
                      <div className="text-[10px] text-blue-500 font-bold mt-1 tracking-wider uppercase">{emp.employeeCode || 'No Code'}</div>
                    </td>
                    <td className="px-6 py-5"><span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{emp.department?.name || 'Unassigned'}</span></td>
                    <td className="px-6 py-5"><span className="text-xs font-medium text-slate-700">{emp.jobProfile?.name || '—'}</span></td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between w-44">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{isEffectiveComplete ? 'Complete' : 'Profile Progress'}</span>
                            {/* FIX: Show ACTUAL calculated percentage, not hardcoded 35% */}
                            <span className="text-[10px] font-bold text-slate-700">
                                {isEffectiveComplete ? '100%' : `${emp.profileProgress || 0}%`}
                            </span>
                        </div>
                        <div className="w-44"><ProgressBar value={emp.profileProgress || (isEffectiveComplete ? 100 : 0)} /></div>
                        <div className="mt-1">{isEffectiveComplete ? <Badge tone="green">Active</Badge> : <Badge tone="amber">Pending Data</Badge>}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                            {isEffectiveComplete ? (
                                <Link to={`/personnel/${emp._id}`} className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-xs border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50 px-4 py-2 rounded-lg transition-all shadow-sm">
                                View Profile
                                </Link>
                            ) : (
                                <Link to={`/wizard/${emp._id}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-white font-bold text-xs border border-blue-200 hover:bg-blue-600 px-4 py-2 rounded-lg transition-all shadow-sm">
                                Continue <Icons.ChevronRight />
                                </Link>
                            )}
                            <button 
                                onClick={() => setTerminateModal(emp)} 
                                title="Terminate Employee"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-all"
                            >
                                <Icons.Trash />
                            </button>
                        </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div><h3 className="text-lg font-bold text-slate-900">Add New Employee</h3><p className="text-xs text-slate-500 font-medium">Enter basic details to initialize onboarding.</p></div>
              <button onClick={() => { setOpen(false); resetModal(); }} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition-all"><Icons.XCircle /></button>
            </div>

            <div className="p-8 pb-4">
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3 mb-6">
                  <div className="mt-0.5"><Icons.Alert /></div>
                  <div><h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">Validation Error</h4><p className="text-xs mt-0.5">{modalError}</p></div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                  <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="e.g. Yogesh" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                  <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="e.g. Sadgir" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Corporate Email <span className="text-rose-500">*</span></label>
                  <input type="email" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="employee@naval.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 00000 00000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">User Type</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 cursor-pointer transition-all" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="EMPLOYEE">Normal Employee</option>
                    <option value="HR">HR Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 cursor-pointer transition-all" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                    <option value="">— Select —</option>
                    {(masters.departments || []).map(d => (<option key={d._id} value={d._id}>{d.name}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Job Profile</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 cursor-pointer transition-all" value={form.jobProfile} onChange={(e) => setForm({ ...form, jobProfile: e.target.value })}>
                    <option value="">— Select —</option>
                    {(masters.jobProfiles || []).map(j => (<option key={j._id} value={j._id}>{j.name}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/30">
              <button onClick={() => { setOpen(false); resetModal(); }} className="px-6 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-sm transition-all">Cancel</button>
              <button disabled={creating} onClick={createEmployee} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-100 disabled:opacity-60 transition-all flex items-center gap-2">
                {creating ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icons.Check />}
                {creating ? 'Processing...' : 'Create Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMINATE CONFIRMATION MODAL */}
      {terminateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/30">
                      <div className="flex items-center gap-2 text-rose-700">
                          <Icons.Alert />
                          <h3 className="font-bold text-rose-900">Terminate Employee</h3>
                      </div>
                      <button onClick={() => setTerminateModal(null)} className="text-slate-400 hover:text-slate-600"><Icons.XCircle /></button>
                  </div>
                  <div className="p-6">
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                          Are you sure you want to terminate <strong className="text-slate-800">{terminateModal.firstName} {terminateModal.lastName}</strong>?
                      </p>
                      <ul className="text-xs text-slate-500 space-y-2 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <li className="flex items-center gap-2">• <span className="text-rose-600 font-bold">System access will be revoked permanently.</span></li>
                          <li className="flex items-center gap-2">• They will be moved to the Terminated Archive.</li>
                          <li className="flex items-center gap-2">• Past payroll and attendance records will be preserved.</li>
                      </ul>
                      
                      <div className="flex gap-3 justify-end">
                          <button onClick={() => setTerminateModal(null)} className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-sm transition-all">
                              Cancel
                          </button>
                          <button onClick={confirmTerminate} disabled={terminating} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center gap-2">
                              {terminating ? 'Processing...' : 'Confirm Termination'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default Personnel;