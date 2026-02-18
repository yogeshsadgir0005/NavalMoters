import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../api/axios';

const getFileUrl = (filename) => {
  const baseUrl = API.defaults.baseURL || 'http://localhost:5000/api';
  const serverUrl = baseUrl.replace(/\/api\/?$/, ''); 
  return `${serverUrl}/uploads/${filename}`;
};

const Icons = {
  User: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Users: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Briefcase: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Banknote: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Folder: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  ArrowUp: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>,
  ArrowDown: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
  File: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ChevronUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
  History: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Alert: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  XCircle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emp, setEmp] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]); 
  const [activeTab, setActiveTab] = useState('self');
  const [expandedRecords, setExpandedRecords] = useState({});
  const [pageError, setPageError] = useState(null);
  
  const [showIncModal, setShowIncModal] = useState(false);
  const [incForm, setIncForm] = useState({ type: 'Increment', amount: '', reason: '' });
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminating, setTerminating] = useState(false);

  useEffect(() => { 
      loadEmployee();
      loadSalaryHistory(); 
  }, [id]);

  const loadEmployee = () => {
    setPageError(null);
    API.get(`/employees/${id}`)
       .then(res => setEmp(res.data))
       .catch(() => setPageError("Failed to load employee profile data."));
  };

  const loadSalaryHistory = async () => {
      try {
          const { data } = await API.get('/salary/history');
          const myHistory = data.filter(s => s.employee?._id === id || s.employee === id);
          setSalaryHistory(myHistory);
      } catch (e) {
          console.error("Failed to load salary history");
      }
  };

  const handleIncrement = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!incForm.amount || !incForm.reason) {
        setModalError("Please provide both an adjustment amount and a reason.");
        return;
    }
    
    setUpdating(true);
    try {
        await API.post(`/employees/${id}/increment`, incForm);
        setShowIncModal(false);
        setIncForm({ type: 'Increment', amount: '', reason: '' });
        loadEmployee(); 
    } catch (e) {
        const backendError = e.response?.data?.message || '';
        if (backendError.toLowerCase().includes('validation')) {
            setModalError("Unable to process request. Please check the amount and reason fields.");
        } else {
            setModalError(backendError || "An unexpected error occurred while updating the salary.");
        }
    } finally {
        setUpdating(false);
    }
  };

  const handleTerminate = async () => {
      setTerminating(true);
      try {
          await API.post(`/employees/${id}/terminate`);
          setShowTerminateModal(false);
          navigate('/personnel'); // Redirect back to active list after termination
      } catch (e) {
          alert('Failed to terminate employee.');
      } finally {
          setTerminating(false);
      }
  };

  const toggleRecordExpand = (recId) => {
      setExpandedRecords(prev => ({ ...prev, [recId]: !prev[recId] }));
  };

  // Helper to check if any document actually exists (not just empty array)
  const hasAnyDocs = (docs) => {
      if (!docs) return false;
      return Object.entries(docs).some(([key, val]) => {
          if (key === '_id') return false;
          if (Array.isArray(val)) return val.length > 0;
          return !!val;
      });
  };

  const HistoryRow = ({ adjustments }) => {
      if(!adjustments || adjustments.length === 0) return (
          <tr className="bg-slate-50 border-b border-slate-100"><td colSpan="7" className="p-4 text-center text-xs text-slate-400 italic">No adjustments recorded for this month.</td></tr>
      );
      return (
          <tr className="bg-slate-50 border-b border-slate-200">
              <td colSpan="7" className="p-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 max-w-3xl mx-auto shadow-inner">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Icons.History /> Adjustment History
                      </p>
                      <table className="w-full text-left">
                          <tbody className="divide-y divide-slate-100">
                              {adjustments.map((adj, i) => (
                                  <tr key={adj._id || adj.id || `${adj.type}-${adj.date}-${i}`}>
                                      <td className="py-1 text-xs font-bold text-slate-600 w-24">
                                          <span className={`px-1.5 py-0.5 rounded border ${adj.type === 'Incentive' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                              {adj.type}
                                          </span>
                                      </td>
                                      <td className="py-1 text-xs text-slate-700">{adj.reason}</td>
                                      <td className="py-1 text-[10px] text-slate-400 text-right">
                                          {new Date(adj.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                      </td>
                                      <td className={`py-1 text-xs font-bold text-right w-24 ${adj.type === 'Incentive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {adj.type === 'Incentive' ? '+' : '-'} ₹{adj.amount}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </td>
          </tr>
      );
  };

  if (!emp) return (
    <Layout>
        <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
            {pageError ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-lg flex flex-col items-center max-w-sm text-center">
                    <Icons.Alert />
                    <h4 className="font-bold text-rose-900 text-sm mt-2">Error Loading Profile</h4>
                    <p className="text-xs mt-1">{pageError}</p>
                    <button onClick={loadEmployee} className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold shadow-sm transition-colors">Try Again</button>
                </div>
            ) : (
                <>
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600"></div>
                    <span className="text-slate-400 text-sm font-medium">Loading Profile...</span>
                </>
            )}
        </div>
    </Layout>
  );

  const TabButton = ({ id, label, Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-5 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
        activeTab === id 
        ? 'border-blue-600 text-blue-700' 
        : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
      }`}
    >
      <Icon /> {label}
    </button>
  );

  const InfoRow = ({ label, val }) => (
    <div className="flex flex-col border-b border-slate-50 py-3 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
      <span className="font-semibold text-slate-800 text-sm">{val || '—'}</span>
    </div>
  );

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-xl font-bold text-slate-500 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                {emp.documents?.photo ? (
                    <img src={getFileUrl(emp.documents.photo)} className="w-full h-full object-cover" alt="Profile"/>
                ) : (
                    <span className="text-2xl">{emp.firstName?.[0]}</span>
                )}
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{emp.firstName} {emp.lastName}</h1>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                    <span>{emp.jobProfile?.name || 'No Role'}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{emp.department?.name || 'No Dept'}</span>
                </div>
                <div className="flex gap-2 mt-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        emp.isProfileComplete 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                        {emp.isProfileComplete ? 'Active' : 'Incomplete'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 tracking-wide font-mono">
                        {emp.employeeCode}
                    </span>
                    {emp.status === 'Terminated' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wide">
                            Terminated
                        </span>
                    )}
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            {emp.status !== 'Terminated' && (
                <button 
                    onClick={() => setShowTerminateModal(true)} 
                    className="px-4 py-2 border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm flex-1 md:flex-auto justify-center"
                >
                    <Icons.Trash /> Terminate
                </button>
            )}
            <button 
                onClick={() => navigate(`/wizard/${emp._id}`)} 
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-2 transition-all shadow-sm flex-1 md:flex-auto justify-center"
            >
                <Icons.Edit /> Edit Profile
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        <div className="flex border-b border-slate-200 px-2 overflow-x-auto">
            <TabButton id="self" label="Personal" Icon={Icons.User} />
            <TabButton id="family" label="Family" Icon={Icons.Users} />
            <TabButton id="job" label="Job History" Icon={Icons.Briefcase} />
            <TabButton id="financial" label="Financials" Icon={Icons.Banknote} />
            <TabButton id="payments" label="Payment History" Icon={Icons.Clock} />
            <TabButton id="docs" label="Documents" Icon={Icons.Folder} />
        </div>

        <div className="p-8">
            {activeTab === 'self' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in duration-300">
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Contact Info
                        </h3>
                        <InfoRow label="Email Address" val={emp.email} />
                        <InfoRow label="Phone Number" val={emp.phone} />
                        <InfoRow label="Date of Birth" val={emp.dob ? new Date(emp.dob).toLocaleDateString('en-IN') : '-'} />
                        <InfoRow label="Residential Address" val={emp.address} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Banking Details
                        </h3>
                        <InfoRow label="Account Number" val={emp.bankDetails?.accountNo} />
                        <InfoRow label="IFSC Code" val={emp.bankDetails?.ifsc} />
                        <InfoRow label="Bank Name" val={emp.bankDetails?.bankName} />
                    </div>
                </div>
            )}

            {activeTab === 'family' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in duration-300">
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Parental Info
                        </h3>
                        <InfoRow label="Mother's Name" val={emp.family?.motherName} />
                        <InfoRow label="Mother's Occupation" val={emp.family?.motherWork} />
                        <InfoRow label="Father's Name" val={emp.family?.fatherName} />
                        <InfoRow label="Father's Occupation" val={emp.family?.fatherWork} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Spouse & Dependents
                        </h3>
                        <InfoRow label="Marital Status" val={emp.family?.maritalStatus} />
                        <InfoRow label="Anniversary Date" val={emp.family?.anniversary ? new Date(emp.family.anniversary).toLocaleDateString('en-IN') : '-'} />
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Children</span>
                            {emp.family?.kids?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {emp.family.kids.map((kid, i) => (
                                        <div key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
                                            {kid.name} <span className="text-slate-400 ml-1">({kid.gender})</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <span className="text-sm text-slate-400 italic">No children listed</span>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'job' && (
                <div className="animate-in fade-in duration-300">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                        <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Previous Employment
                    </h3>
                    {emp.lastJob?.company ? (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoRow label="Company / Organization" val={emp.lastJob.company} />
                                <InfoRow label="Designation" val={emp.lastJob.role} />
                                <InfoRow label="Duration" val={emp.lastJob.duration} />
                                <InfoRow label="Reason for Leaving" val={emp.lastJob.reason} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400 text-sm font-medium italic">No employment history recorded.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'financial' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Current Base Salary</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-4xl font-bold tracking-tight">₹{emp.baseSalary?.toLocaleString()}</p>
                                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-slate-200 border border-white/10">
                                    {emp.wageType} Wage
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setShowIncModal(true); setModalError(null); }}
                            className="mt-4 md:mt-0 relative z-10 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow-lg shadow-blue-900/50 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Icons.Edit /> Update Salary
                        </button>
                        
                        <div className="absolute right-0 top-0 h-full w-64 bg-white/5 skew-x-12 translate-x-10"></div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                            <span className="w-1 h-4 bg-slate-300 rounded-full"></span> Structure History
                        </h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Action</th>
                                        <th className="px-4 py-3">Adjustment</th>
                                        <th className="px-4 py-3">New Salary</th>
                                        <th className="px-4 py-3 w-1/3">Reason / Note</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {emp.increments?.length > 0 ? [...emp.increments].reverse().map((inc, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-slate-600 text-xs font-medium">
                                                {new Date(inc.date).toLocaleDateString('en-IN')}
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(inc.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                    inc.type === 'Increment' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                    {inc.type === 'Increment' ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                                                    {inc.type}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 text-xs font-bold ${inc.type === 'Increment' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {inc.type === 'Increment' ? '+' : '-'} ₹{inc.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-800">₹{inc.newSalary.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500 italic">{inc.reason}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-400 text-xs italic">No structural changes recorded.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'payments' && (
                <div className="animate-in fade-in duration-300">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                        <span className="w-1 h-4 bg-blue-600 rounded-full"></span> Monthly Payment Ledger
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Period</th>
                                    <th className="px-4 py-3">Processed On</th>
                                    <th className="px-4 py-3 text-center">Duty Cycle</th>
                                    <th className="px-4 py-3 text-right">Incentives</th>
                                    <th className="px-4 py-3 text-right">Net Paid</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">History</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {salaryHistory.length > 0 ? salaryHistory.map((sal) => {
                                    const isExpanded = expandedRecords[sal._id];
                                    return (
                                        <div key={sal._id} className="contents">
                                            <tr 
                                                className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                                                onClick={() => toggleRecordExpand(sal._id)}
                                            >
                                                <td className="px-4 py-3 text-sm font-bold text-blue-700">{sal.month}</td>
                                                <td className="px-4 py-3 text-xs text-slate-500">{new Date(sal.updatedAt).toLocaleDateString('en-IN')}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{sal.presentDays} Days</span>
                                                </td>
                                                <td className={`px-4 py-3 text-right text-xs font-bold ${sal.incentives >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {sal.incentives > 0 ? '+' : ''}₹{sal.incentives.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 font-mono">₹{sal.netPay.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                        sal.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                        sal.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                        {sal.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="text-slate-400 hover:text-blue-600">
                                                        {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && <HistoryRow adjustments={sal.adjustments} />}
                                        </div>
                                    );
                                }) : (
                                    <tr><td colSpan="7" className="p-8 text-center text-slate-400 text-xs italic">No payment history found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* UPDATED DOCUMENT SECTION */}
            {activeTab === 'docs' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                    {/* Iterate over all document entries */}
                    {Object.entries(emp.documents || {}).map(([key, val]) => {
                        // Skip if system ID or if value is completely missing
                        if (key === '_id' || !val) return null;

                        // 1. HANDLE ARRAYS (Certificates, Other KYC)
                        if (Array.isArray(val)) {
                            // If array is empty, show nothing
                            if (val.length === 0) return null;
                            
                            // Map each file in the array to a card
                            return val.map((filename, index) => (
                                <a 
                                    href={getFileUrl(filename)} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    key={`${key}-${index}`} 
                                    className="group flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md"
                                >
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Icons.File />
                                    </div>
                                    <div className="text-xs font-bold uppercase text-slate-600 group-hover:text-blue-700 text-center">
                                        {key.replace(/([A-Z])/g, ' $1')} 
                                        <span className="ml-1 text-slate-400 opacity-70">#{index + 1}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 font-medium group-hover:text-blue-500">Click to View</div>
                                </a>
                            ));
                        }

                        // 2. HANDLE SINGLE FILES (Aadhar, PAN, etc.) - Only if val is a non-empty string
                        return (
                            <a 
                                href={getFileUrl(val)} 
                                target="_blank" 
                                rel="noreferrer" 
                                key={key} 
                                className="group flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md"
                            >
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Icons.File />
                                </div>
                                <div className="text-xs font-bold uppercase text-slate-600 group-hover:text-blue-700 text-center">
                                    {key.replace(/([A-Z])/g, ' $1')}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 font-medium group-hover:text-blue-500">Click to View</div>
                            </a>
                        );
                    })}

                    {/* ONLY SHOW THIS IF NO DOCS EXIST */}
                    {!hasAnyDocs(emp.documents) && (
                        <div className="col-span-full p-10 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                            <Icons.Folder />
                            <span className="text-sm font-medium mt-2">No documents uploaded</span>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {showIncModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Icons.Banknote /> Update Salary Structure
                    </h3>
                    <button onClick={() => { setShowIncModal(false); setModalError(null); }} className="text-slate-400 hover:text-rose-500 transition-colors"><Icons.X /></button>
                </div>
                
                <form onSubmit={handleIncrement} className="p-6 space-y-5">
                    {modalError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                            <div className="mt-0.5"><Icons.Alert /></div>
                            <div>
                                <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">Error processing request</h4>
                                <p className="text-xs mt-0.5">{modalError}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Action Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Increment', 'Decrement'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setIncForm({...incForm, type})}
                                    className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                                        incForm.type === type
                                        ? (type === 'Increment' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700')
                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                    }`}
                                >
                                    {type === 'Increment' ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Adjustment Amount (₹)</label>
                        <input 
                            type="number" 
                            required
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g. 5000"
                            value={incForm.amount}
                            onChange={(e) => setIncForm({...incForm, amount: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reason / Justification</label>
                        <textarea 
                            required
                            rows="3"
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                            placeholder="e.g. Annual Appraisal, Performance Bonus..."
                            value={incForm.reason}
                            onChange={(e) => setIncForm({...incForm, reason: e.target.value})}
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={updating}
                            className={`w-full py-3 rounded-lg text-white text-sm font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
                                incForm.type === 'Increment' 
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                            } disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {updating ? 'Processing...' : `Confirm ${incForm.type}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* TERMINATE CONFIRMATION MODAL */}
      {showTerminateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/30">
                      <div className="flex items-center gap-2 text-rose-700">
                          <Icons.Alert />
                          <h3 className="font-bold text-rose-900">Terminate Employee</h3>
                      </div>
                      <button onClick={() => setShowTerminateModal(false)} className="text-slate-400 hover:text-slate-600"><Icons.XCircle /></button>
                  </div>
                  <div className="p-6">
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                          Are you sure you want to terminate <strong className="text-slate-800">{emp.firstName} {emp.lastName}</strong>?
                      </p>
                      <ul className="text-xs text-slate-500 space-y-2 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <li className="flex items-center gap-2">• <span className="text-rose-600 font-bold">System access will be revoked permanently.</span></li>
                          <li className="flex items-center gap-2">• They will be moved to the Terminated Archive.</li>
                          <li className="flex items-center gap-2">• Past payroll and attendance records will be preserved.</li>
                      </ul>
                      
                      <div className="flex gap-3 justify-end">
                          <button onClick={() => setShowTerminateModal(false)} className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-sm transition-all">
                              Cancel
                          </button>
                          <button onClick={handleTerminate} disabled={terminating} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm shadow-md shadow-rose-200 transition-all flex items-center gap-2">
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

export default EmployeeDetail;