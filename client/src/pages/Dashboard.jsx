import { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icons = {
  Users: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  CheckCircle: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  XCircle: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Alert: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  UserPlus: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  Calendar: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Banknote: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Shield: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Moon: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Briefcase: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
};

const PayrollModal = ({ isOpen, onClose, onSuccessNav, employees = [] }) => {
  const [step, setStep] = useState('input');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [result, setResult] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState(null);
  const [processedIds, setProcessedIds] = useState([]);

  useEffect(() => {
    if (isOpen && employees.length > 0) {
      API.get('/salary/history').then(res => {
         const processed = res.data
            .filter(s => s.month === month)
            .map(s => s.employee?._id || s.employee);
         setProcessedIds(processed);
         
         const availableIds = employees.map(e => e._id).filter(id => !processed.includes(id));
         setSelectedIds(availableIds);
      }).catch(err => {
         console.error(err);
         setSelectedIds(employees.map(e => e._id));
      });
    }
  }, [isOpen, month, employees.length]);

  if (!isOpen) return null;

  const availableIds = employees.map(e => e._id).filter(id => !processedIds.includes(id));

  const toggleSelectAll = () => {
    if (selectedIds.length === availableIds.length) setSelectedIds([]);
    else setSelectedIds(availableIds);
  };

  const toggleEmployee = (id) => {
    if (processedIds.includes(id)) return;
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(sid => sid !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) {
      setError("Please select at least one employee.");
      return;
    }
    setStep('loading');
    setError(null);
    try {
      const res = await API.post('/salary/generate', { month, employeeIds: selectedIds });
      setResult(res.data);
      setStep('result');
    } catch (e) {
      setError(e.response?.data?.message || 'Payroll Generation Failed');
      setStep('input');
    }
  };

  const handleClose = () => {
    setStep('input');
    setResult(null);
    setError(null);
    onClose();
  };

  const blocked = result?.filter(r => r.status === 'Blocked') || [];
  const generated = result?.filter(r => r.status === 'Generated') || [];
  const totalPayout = generated.reduce((acc, curr) => acc + (curr.netPay || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Run Monthly Payroll</h3>
            <p className="text-xs text-slate-500">Calculate salaries based on attendance & profile data</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
            <Icons.XCircle />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {step === 'input' && (
            <div className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                  <div className="mt-0.5"><Icons.Alert /></div>
                  <div>
                    <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">Error processing request</h4>
                    <p className="text-xs mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Month</label>
                <input 
                  type="month" 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Employees</label>
                  <button 
                    onClick={toggleSelectAll} 
                    disabled={availableIds.length === 0}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedIds.length > 0 && selectedIds.length === availableIds.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto bg-slate-50">
                  {employees.length > 0 ? (
                    employees.map(emp => {
                      const isProcessed = processedIds.includes(emp._id);
                      const isSelected = selectedIds.includes(emp._id);
                      return (
                        <div 
                          key={emp._id} 
                          onClick={() => toggleEmployee(emp._id)}
                          className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 transition-all ${
                            isProcessed ? 'bg-slate-50 opacity-60 cursor-not-allowed' :
                            isSelected ? 'bg-blue-50 cursor-pointer' : 'hover:bg-white cursor-pointer'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                             isProcessed ? 'border-slate-300 bg-slate-200' :
                             isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && !isProcessed && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                            {isProcessed && (
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${isProcessed ? 'text-slate-500' : isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {emp.employeeCode} • {emp.department?.name || 'No Dept'}
                            </p>
                          </div>
                          
                          {isProcessed && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded uppercase tracking-wider">
                              Processed
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm">No employees found.</div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">
                  Selected: <span className="font-bold text-slate-700">{selectedIds.length}</span> / {employees.length}
                </p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleGenerate}
                  disabled={selectedIds.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-md shadow-blue-100 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  <Icons.Banknote /> Run Payroll ({selectedIds.length})
                </button>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
              <p className="text-slate-600 font-medium animate-pulse text-sm">Processing records...</p>
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Generated</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{generated.length}</p>
                  <p className="text-[10px] text-emerald-600">Employees Paid</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Payout</p>
                  <p className="text-2xl font-bold text-slate-700 mt-1">₹{(totalPayout/1000).toFixed(1)}k</p>
                  <p className="text-[10px] text-slate-400">Approximate</p>
                </div>
              </div>

              {blocked.length > 0 ? (
                <div className="border border-rose-100 rounded-lg overflow-hidden">
                  <div className="bg-rose-50 px-4 py-3 border-b border-rose-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-rose-600"><Icons.Alert /></div>
                      <span className="font-bold text-rose-800 text-sm">Action Required ({blocked.length})</span>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto bg-white custom-scrollbar">
                    {blocked.map((b, idx) => (
                      <div key={idx} className="px-4 py-3 border-b border-slate-50 last:border-0 flex justify-between items-center hover:bg-rose-50/30 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{b.employee}</p>
                          <p className="text-xs text-rose-500 font-medium">Missing: {b.reason}</p>
                        </div>
                        <button onClick={() => { handleClose(); onSuccessNav('/personnel'); }} className="text-xs font-bold text-blue-600 hover:underline">
                          Fix Profile
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-center text-sm font-medium border border-emerald-100 flex items-center justify-center gap-2">
                  <Icons.CheckCircle /> No issues found! 100% compliant.
                </div>
              )}

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button 
                  onClick={handleClose} 
                  className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-sm"
                >
                  Close
                </button>
                <button 
                  onClick={() => { handleClose(); onSuccessNav('/salary-report'); }}
                  className="w-full py-2.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors shadow-md text-sm"
                >
                  View Full Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    totalEmployees: 0, presentToday: 0, absentToday: 0, pendingProfiles: 0 
  });
  
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false); 
  const [attendanceData, setAttendanceData] = useState({ status: 'Present', date: new Date().toISOString().slice(0,10), isNightDuty: false });
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [employees, setEmployees] = useState([]);
  const [attendanceError, setAttendanceError] = useState(null); 
  const [dailyStatusMap, setDailyStatusMap] = useState({});

  useEffect(() => {
    loadStats();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (showAttendanceModal) {
      fetchDailyStatus();
    }
  }, [attendanceData.date, showAttendanceModal]);

  const loadStats = async () => {
    try { const res = await API.get('/admin/dashboard'); setStats(res.data); } catch (e) { console.error(e); }
  };

  const loadEmployees = async () => {
    try { const res = await API.get('/employees'); setEmployees(res.data); } catch (e) { console.error(e); }
  };

  const fetchDailyStatus = async () => {
    try {
      const res = await API.get(`/attendance?date=${attendanceData.date}`);
      const map = {};
      res.data.forEach(log => {
        if (log.employee) {
          map[log.employee._id] = log;
        }
      });
      setDailyStatusMap(map);
    } catch (e) { console.error("Failed to fetch daily logs"); }
  };

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const aMarked = !!dailyStatusMap[a._id];
      const bMarked = !!dailyStatusMap[b._id];
      if (aMarked === bMarked) return 0;
      return aMarked ? 1 : -1;
    });
  }, [employees, dailyStatusMap]);

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) setSelectedIds([]);
    else setSelectedIds(employees.map(e => e._id));
  };

  const toggleEmployee = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(sid => sid !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  const handleAttendance = async (e) => {
    e.preventDefault();
    setAttendanceError(null); 

    if (selectedIds.length === 0) {
      setAttendanceError("Please select at least one employee.");
      return; 
    }

    try {
      await API.post('/attendance', {
        employeeIds: selectedIds,
        ...attendanceData
      });
      
      setShowAttendanceModal(false);
      setAttendanceData({ status: 'Present', date: new Date().toISOString().slice(0,10), isNightDuty: false });
      setSelectedIds([]);
      loadStats(); 
    } catch (e) { 
      setAttendanceError(e.response?.data?.message || 'Failed to save attendance.');
    }
  };

  const StatCard = ({ label, val, color, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all group">
      <div className="flex justify-between items-start">
        <div>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
           <p className={`text-3xl font-bold ${color} mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left`}>{val}</p>
        </div>
        <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
            {icon}
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon, label, onClick, primary, disabled, tooltip }) => (
    <button 
        disabled={disabled}
        onClick={onClick} 
        className={`h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border ${
            primary 
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-blue-200' 
            : disabled ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-md'
        }`}
        title={tooltip}
    >
        <div className={primary ? 'text-white' : 'text-slate-500'}>{icon}</div>
        <span className="font-semibold text-xs">{label}</span>
    </button>
  );

  return (
    <Layout>
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Command Center</h1>
        <p className="text-slate-500 text-sm">
          Welcome back, <strong className="text-slate-800">{user?.role === 'ADMIN' ? 'Admin' : (user?.role || 'User')}</strong>. Here is your daily overview.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Staff" val={stats.totalEmployees} color="text-blue-600" icon={<Icons.Users />} />
        <StatCard label="Present Today" val={stats.presentToday} color="text-emerald-600" icon={<Icons.CheckCircle />} />
        <StatCard label="Absent Today" val={stats.absentToday} color="text-rose-500" icon={<Icons.XCircle />} />
        <StatCard label="Pending Docs" val={stats.pendingProfiles} color="text-amber-500" icon={<Icons.Alert />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Daily Operations</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction icon={<Icons.UserPlus />} label="Add Employee" onClick={() => navigate('/personnel')} primary={true} />
            <QuickAction icon={<Icons.Calendar />} label="Mark Attendance" onClick={() => setShowAttendanceModal(true)} />
            <QuickAction icon={<Icons.Banknote />} label="Run Payroll" onClick={() => setShowPayrollModal(true)} />
            <QuickAction icon={<Icons.Shield />} label="Manage HRs" onClick={() => navigate('/admin/users')} disabled={user?.role !== 'ADMIN'} tooltip="Restricted Access" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 h-fit shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 text-base uppercase tracking-wider">Quick Reports</h3>
          <ul className="space-y-1">
            <li onClick={() => navigate('/attendance')} className="flex justify-between items-center text-slate-600 hover:text-blue-600 cursor-pointer p-3 hover:bg-slate-50 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 group-hover:text-blue-500"><Icons.Calendar /></span>
                <span className="font-medium text-sm">Attendance Logs</span>
              </div>
              <span className="text-slate-300 group-hover:text-blue-600"><Icons.ChevronRight /></span>
            </li>
            <li onClick={() => navigate('/salary-report')} className="flex justify-between items-center text-slate-600 hover:text-blue-600 cursor-pointer p-3 hover:bg-slate-50 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                 <span className="text-slate-400 group-hover:text-blue-500"><Icons.Banknote /></span>
                <span className="font-medium text-sm">Salary Reports</span>
              </div>
              <span className="text-slate-300 group-hover:text-blue-600"><Icons.ChevronRight /></span>
            </li>
          </ul>
        </div>
      </div>

      <PayrollModal 
        isOpen={showPayrollModal} 
        onClose={() => setShowPayrollModal(false)} 
        onSuccessNav={navigate}
        employees={employees}
      />

      {showAttendanceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">Mark Bulk Attendance</h3>
                    <p className="text-xs text-slate-500">Select employees to mark for <span className="font-bold text-blue-600">{new Date(attendanceData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></p>
                 </div>
                 <button onClick={() => { setShowAttendanceModal(false); setAttendanceError(null); }} className="text-slate-400 hover:text-slate-600"><Icons.XCircle /></button>
            </div>
            
            <form onSubmit={handleAttendance} className="p-6 overflow-hidden flex flex-col flex-1">
              {attendanceError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm mb-4">
                    <p className="font-bold text-xs uppercase">Error</p>
                    <p>{attendanceError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                    <input type="date" className="w-full border border-slate-300 px-3 py-2 rounded-lg text-sm" value={attendanceData.date} onChange={e => setAttendanceData({...attendanceData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        {['Present', 'Absent', 'Half Day'].map(s => (
                            <button key={s} type="button" onClick={() => setAttendanceData({...attendanceData, status: s})} 
                                className={`flex-1 py-2 text-xs font-bold ${attendanceData.status === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                  </div>
              </div>

              <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Employees</label>
                  <button type="button" onClick={toggleSelectAll} className="text-xs font-bold text-blue-600 hover:text-blue-800">
                    {selectedIds.length === employees.length ? 'Deselect All' : 'Select All'}
                  </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-y-auto bg-slate-50 flex-1 min-h-0 custom-scrollbar">
                  {sortedEmployees.length > 0 ? sortedEmployees.map(emp => {
                      const isSelected = selectedIds.includes(emp._id);
                      const currentStatus = dailyStatusMap[emp._id];
                      
                      return (
                        <div key={emp._id} onClick={() => toggleEmployee(emp._id)} 
                             className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-white'}`}>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                                <div>
                                    <p className={`text-sm font-semibold ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>{emp.firstName} {emp.lastName}</p>
                                    <p className="text-[10px] text-slate-500">{emp.employeeCode} • {emp.department?.name || 'No Dept'}</p>
                                </div>
                                {currentStatus && (
                                    <div className="text-right">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                            currentStatus.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            currentStatus.status === 'Absent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {currentStatus.status}
                                        </span>
                                        {currentStatus.isNightDuty && (
                                            <span className="block text-[9px] text-slate-400 mt-0.5"><Icons.Moon /> Night</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                      );
                  }) : <div className="p-8 text-center text-slate-400 text-sm">No employees found.</div>}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="nightDuty" className="w-4 h-4 text-blue-600 rounded" checked={attendanceData.isNightDuty} onChange={(e) => setAttendanceData({...attendanceData, isNightDuty: e.target.checked})} />
                    <label htmlFor="nightDuty" className="text-sm text-slate-700 font-medium cursor-pointer flex items-center gap-1"><Icons.Moon /> Mark Night Duty</label>
                </div>
                <div className="text-xs text-slate-500">Selected: <span className="font-bold text-slate-800">{selectedIds.length}</span></div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2">
                    <Icons.CheckCircle /> Confirm Attendance ({selectedIds.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;