import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

// --- ICONS (Consistent with Dashboard/Sidebar) ---
const Icons = {
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  UserPlus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  XCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Check: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
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

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [masters, setMasters] = useState({ departments: [], jobProfiles: [] });

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    jobProfile: ''
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [empRes, masterRes] = await Promise.all([
        API.get('/employees'),
        API.get('/masters')
      ]);
      setEmployees(empRes.data || []);
      setMasters(masterRes.data || { departments: [], jobProfiles: [] });
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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
    setForm({ firstName: '', lastName: '', email: '', phone: '', department: '', jobProfile: '' });
  };

  const createEmployee = async () => {
    if (!form.email.trim()) return alert('Email is required');

    setCreating(true);
    try {
      const res = await API.post('/employees', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department || undefined,
        jobProfile: form.jobProfile || undefined
      });

      const emp = res.data;
      setOpen(false);
      resetModal();
      await fetchAll();
      navigate(`/wizard/${emp._id}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout>
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personnel Directory</h1>
          <p className="text-sm text-slate-500">Manage your workforce, onboarding progress, and profile details.</p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Icons.UserPlus />
          Add Employee
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
              <Icons.Search />
            </div>
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="Search by name, email, or employee code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
             <select
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-slate-50 md:w-48 appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Employees</option>
                <option value="COMPLETE">Profile Complete</option>
                <option value="INCOMPLETE">Incomplete Profile</option>
              </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Showing <span className="text-blue-600">{filtered.length}</span> Records
          </p>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="text-sm text-slate-400 font-medium">Fetching records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-slate-400 text-sm font-medium">No employee records found matching your filters.</p>
          </div>
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
                {filtered.map(emp => (
                  <tr key={emp._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">
                        {(emp.firstName || '—')} {(emp.lastName || '')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{emp.email}</div>
                      <div className="text-[10px] text-blue-500 font-bold mt-1 tracking-wider uppercase">{emp.employeeCode || 'No Code'}</div>
                    </td>

                    <td className="px-6 py-5">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {emp.department?.name || 'Unassigned'}
                        </span>
                    </td>
                    
                    <td className="px-6 py-5">
                        <span className="text-xs font-medium text-slate-700">
                            {emp.jobProfile?.name || '—'}
                        </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between w-44">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {emp.isProfileComplete ? 'Complete' : 'Profile Progress'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-700">
                                {emp.isProfileComplete ? '100%' : '35%'}
                            </span>
                        </div>
                        <div className="w-44">
                          <ProgressBar value={emp.profileProgress || (emp.isProfileComplete ? 100 : 35)} />
                        </div>
                        <div className="mt-1">
                            {emp.isProfileComplete ? (
                                <Badge tone="green">Active</Badge>
                            ) : (
                                <Badge tone="amber">Pending Data</Badge>
                            )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-right">
                      {emp.isProfileComplete ? (
                        <Link
                          to={`/personnel/${emp._id}`}
                          className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-xs border border-slate-200 hover:border-blue-200 bg-white hover:bg-blue-50 px-4 py-2 rounded-lg transition-all shadow-sm"
                        >
                          View Profile
                        </Link>
                      ) : (
                        <Link
                          to={`/wizard/${emp._id}`}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-white font-bold text-xs border border-blue-200 hover:bg-blue-600 px-4 py-2 rounded-lg transition-all shadow-sm"
                        >
                          Continue <Icons.ChevronRight />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Employee</h3>
                <p className="text-xs text-slate-500 font-medium">Enter basic details to initialize onboarding.</p>
              </div>
              <button
                onClick={() => { setOpen(false); resetModal(); }}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition-all"
              >
                <Icons.XCircle />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="e.g. Yogesh"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="e.g. Sadgir"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Corporate Email <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="employee@naval.com"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                <select
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 cursor-pointer transition-all"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                >
                  <option value="">— Select —</option>
                  {(masters.departments || []).map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Job Profile</label>
                <select
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 cursor-pointer transition-all"
                  value={form.jobProfile}
                  onChange={(e) => setForm({ ...form, jobProfile: e.target.value })}
                >
                  <option value="">— Select —</option>
                  {(masters.jobProfiles || []).map(j => (
                    <option key={j._id} value={j._id}>{j.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50/30">
              <button
                onClick={() => { setOpen(false); resetModal(); }}
                className="px-6 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-sm transition-all"
              >
                Cancel
              </button>
              <button
                disabled={creating}
                onClick={createEmployee}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-100 disabled:opacity-60 transition-all flex items-center gap-2"
              >
                {creating ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : <Icons.Check />}
                {creating ? 'Processing...' : 'Create Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Personnel;