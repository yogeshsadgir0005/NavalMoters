import { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Icons = {
  Banknote: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  ShieldCheck: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ChevronUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  History: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  XCircle: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Shield: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Alert: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  CheckCircle: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const PayrollModal = ({ isOpen, onClose, onSuccessNav, employees = [] }) => {
  const [step, setStep] = useState('input');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [result, setResult] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && employees.length > 0) {
      setSelectedIds(employees.map(e => e._id));
    }
  }, [isOpen, employees]);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.length === employees.length) setSelectedIds([]);
    else setSelectedIds(employees.map(e => e._id));
  };

  const toggleEmployee = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(sid => sid !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) {
      setError("Please select at least one employee from the list.");
      return;
    }
    setStep('loading');
    setError(null);
    try {
      const res = await API.post('/salary/generate', { month, employeeIds: selectedIds });
      setResult(res.data);
      setStep('result');
    } catch (e) {
      const backendError = e.response?.data?.message || '';
      if (backendError.includes('validation')) {
          setError("Unable to generate payroll. Ensure profile completeness.");
      } else {
          setError(backendError || "An unexpected error occurred during generation.");
      }
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
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {selectedIds.length === employees.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto bg-slate-50">
                  {employees.length > 0 ? (
                    employees.map(emp => {
                      const isSelected = selectedIds.includes(emp._id);
                      return (
                        <div 
                          key={emp._id} 
                          onClick={() => toggleEmployee(emp._id)}
                          className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 cursor-pointer transition-all ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                             isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          
                          <div>
                            <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {emp.employeeCode} • {emp.department?.name || 'No Dept'}
                            </p>
                          </div>
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

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                <div className="text-blue-600 mt-0.5">
                  <Icons.Shield />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Pre-Flight Check</h4>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    The system will verify profile completion for the <strong>{selectedIds.length} selected employees</strong>. 
                    Any profiles with missing KYC or Bank details will be <strong>blocked</strong> automatically.
                  </p>
                </div>
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


const SalaryReport = () => {
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState(null);
  
  const [filterMonth, setFilterMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [expandedRecords, setExpandedRecords] = useState({});

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [editForm, setEditForm] = useState({ 
    basePay: 0,
    netPay: 0, 
    status: '', 
    adjustments: []
  });
  
  const [newAdj, setNewAdj] = useState({ type: 'Incentive', amount: '', reason: '' });

  useEffect(() => { 
      fetchHistory(); 
      fetchEmployees();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setPageError(null);
    try {
      const res = await API.get('/salary/history');
      setSalaries(res.data);
      if (res.data.length > 0 && !filterMonth) setFilterMonth(res.data[0].month);
    } catch (e) {
      setPageError("Failed to fetch payroll history.");
    } finally { 
      setLoading(false); 
    }
  };

  const fetchEmployees = async () => {
    try { 
      const res = await API.get('/employees'); 
      setEmployees(res.data); 
    } catch (e) { 
      setPageError("Failed to fetch employee list."); 
    }
  };

  const handleEditClick = (rec) => {
    setEditingItem(rec);
    
    const existingAdjustments = rec.adjustments || [];
    const base = rec.baseSalary || (rec.netPay - (rec.incentives || 0));

    setEditForm({ 
        basePay: base,
        netPay: rec.netPay, 
        status: rec.status,
        adjustments: existingAdjustments
    });
    
    setNewAdj({ type: 'Incentive', amount: '', reason: '' });
    setEditError(null);
    setIsEditOpen(true);
  };

  const addAdjustment = () => {
    setEditError(null);
    if (!newAdj.amount || !newAdj.reason) {
        setEditError("Both amount and reason are required to add a transaction.");
        return;
    }
    
    const amountVal = parseFloat(newAdj.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
        setEditError("Please enter a valid positive amount.");
        return;
    }

    const newItem = {
        id: Date.now(),
        type: newAdj.type,
        amount: amountVal,
        reason: newAdj.reason,
        date: new Date().toISOString()
    };

    const updatedList = [...editForm.adjustments, newItem];
    recalculate(updatedList);
    setNewAdj({ type: 'Incentive', amount: '', reason: '' });
  };

  const removeAdjustment = (idToRemove) => {
    const updatedList = editForm.adjustments.filter(a => a.id !== idToRemove && a._id !== idToRemove);
    recalculate(updatedList);
  };

  const recalculate = (adjList) => {
    let totalAdd = 0;
    let totalDeduct = 0;

    adjList.forEach(a => {
        if (a.type === 'Incentive') totalAdd += a.amount;
        else totalDeduct += a.amount;
    });

    setEditForm(prev => ({
        ...prev,
        adjustments: adjList,
        netPay: prev.basePay + totalAdd - totalDeduct
    }));
  };

  const handleSave = async () => {
    if(!editingItem) return;
    setSaving(true);
    setEditError(null);
    try {
        const payload = { 
            netPay: editForm.netPay,
            status: editForm.status,
            adjustments: editForm.adjustments 
        };
        
        const res = await API.patch(`/salary/${editingItem._id}`, payload);
        setSalaries(prev => prev.map(item => item._id === editingItem._id ? res.data : item));
        setIsEditOpen(false);
        setEditingItem(null);
    } catch(e) { 
        const backendError = e.response?.data?.message || '';
        setEditError(backendError || 'Failed to update salary successfully.');
    } finally { 
        setSaving(false); 
    }
  };

  const toggleExpand = (empId) => setExpandedEmployees(p => ({ ...p, [empId]: !p[empId] }));
  const toggleRecordExpand = (recId) => setExpandedRecords(p => ({ ...p, [recId]: !p[recId] }));

  const checkIsAdvance = (periodStr, genDateStr) => {
    if (!periodStr || !genDateStr) return false;
    const [pYear, pMonth] = periodStr.split('-').map(Number);
    const genDate = new Date(genDateStr);
    const gYear = genDate.getFullYear();
    const gMonth = genDate.getMonth() + 1;
    const gDay = genDate.getDate();

    const isFuturePeriod = (pYear > gYear) || (pYear === gYear && pMonth > gMonth);
    if (isFuturePeriod) {
        const lastDayOfGenMonth = new Date(gYear, gMonth, 0).getDate();
        if (gDay === lastDayOfGenMonth || gDay >= 30) return false;
        return true;
    }
    return false;
  };

  const filteredData = useMemo(() => {
    return salaries.filter(item => {
      const matchesMonth = filterMonth ? item.month === filterMonth : true;
      const matchesSearch = item.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesMonth && matchesSearch;
    });
  }, [salaries, filterMonth, searchTerm]);

  const viewData = useMemo(() => {
    if (filterMonth !== '') return filteredData; 
    const groups = {};
    filteredData.forEach(item => {
        const empId = item.employee?._id;
        if (!empId) return;
        if (!groups[empId]) groups[empId] = { employee: item.employee, totalPay: 0, records: [] };
        groups[empId].totalPay += (item.netPay || 0);
        groups[empId].records.push(item);
    });
    return Object.values(groups);
  }, [filteredData, filterMonth]);

  const stats = useMemo(() => {
    const totalPayout = filteredData.reduce((acc, curr) => acc + (curr.netPay || 0), 0);
    const uniqueStaff = new Set(filteredData.map(s => s.employee?._id)).size;
    const paidCount = filteredData.filter(s => s.status === 'Paid').length;
    return { totalPayout, uniqueStaff, paidCount, totalRecords: filteredData.length };
  }, [filteredData]);

  const availableMonths = [...new Set(salaries.map(s => s.month))].sort().reverse();
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-';

  const HistoryRow = ({ adjustments }) => {
      if(!adjustments || adjustments.length === 0) return (
          <tr className="bg-slate-50 border-b border-slate-100"><td colSpan="7" className="p-4 text-center text-xs text-slate-400 italic">No adjustments recorded for this month.</td></tr>
      );
      return (
          <tr className="bg-slate-50 border-b border-slate-200">
              <td colSpan="7" className="p-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 max-w-3xl mx-auto">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Icons.History /> Adjustment History</p>
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
                                      <td className="py-1 text-[10px] text-slate-400 text-right">{formatDate(adj.date)}</td>
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

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Payroll Ledger</h1>
          <p className="text-slate-500 text-xs mt-0.5">Finalize monthly payouts and compliance clearance.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowPayrollModal(true)}
                className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 shadow-sm transition-all"
            >
                <Icons.Banknote /> Run Payroll
            </button>
            <button onClick={fetchHistory} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all">
              <Icons.Refresh /> Refresh
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Liability</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">₹{stats.totalPayout.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{filterMonth || 'Cumulative'}</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Icons.Banknote /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processed Staff</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.uniqueStaff}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Unique Employees</p>
            </div>
            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Icons.Users /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clearance Status</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                    <p className="text-2xl font-bold text-emerald-600">{stats.paidCount}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Settled</p>
                </div>
                <p className="text-[10px] text-rose-400 mt-1 font-bold italic">{stats.totalRecords - stats.paidCount} Pending</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Icons.ShieldCheck /></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto">
            <select 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 py-2 px-4 rounded-lg text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
                <option value="">All Periods</option>
                {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Icons.Search /></div>
                <input 
                    type="text" 
                    placeholder="Search by name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                <tr>
                    <th className="px-6 py-3.5">Employee Details</th>
                    <th className="px-6 py-3.5">Period</th>
                    <th className="px-6 py-3.5">Generation Date</th>
                    <th className="px-6 py-3.5 text-center">Working Days</th>
                    <th className="px-6 py-3.5 text-right">Net Payable</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {viewData.map((item) => {
                    const isGroup = filterMonth === '';
                    
                    if (isGroup) {
                        const { employee, totalPay, records } = item;
                        const isExpanded = expandedEmployees[employee._id];

                        return (
                            <>
                                <tr key={employee._id} className={`hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${isExpanded ? 'bg-slate-50 border-blue-500' : 'border-transparent'}`} onClick={() => toggleExpand(employee._id)}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-xs">{employee.firstName} {employee.lastName}</div>
                                        <div className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">{employee.employeeCode}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">All History</td>
                                    <td className="px-6 py-4 text-[11px] text-slate-400 font-medium">{records.length} Records</td>
                                    <td className="px-6 py-4 text-center"><span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded font-bold text-[10px] uppercase">—</span></td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-sm">₹{totalPay.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregated</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg shadow-sm">
                                            {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                                        </button>
                                    </td>
                                </tr>
                                {isExpanded && records.map(rec => {
                                    const isAdvance = checkIsAdvance(rec.month, rec.updatedAt);
                                    const isRecExpanded = expandedRecords[rec._id];
                                    return (
                                        <>
                                            <tr key={rec._id} onClick={() => toggleRecordExpand(rec._id)} className="bg-slate-50/50 hover:bg-blue-50/20 transition-colors border-l-4 border-transparent cursor-pointer">
                                                <td className="px-6 py-3 pl-12 text-[11px] text-slate-400 font-medium uppercase tracking-wide">↳ {employee.firstName}</td>
                                                <td className="px-6 py-3 text-xs font-bold text-blue-700 flex items-center gap-2">
                                                    {rec.month}
                                                    {isAdvance && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200 uppercase tracking-tighter">Advance</span>}
                                                </td>
                                                <td className="px-6 py-3 text-[11px] text-slate-500">{formatDate(rec.updatedAt)}</td>
                                                <td className="px-6 py-3 text-center"><span className="bg-white border border-slate-200 text-slate-600 py-0.5 px-2 rounded font-bold text-[10px] uppercase">{rec.presentDays} Days</span></td>
                                                <td className="px-6 py-3 text-right font-mono text-xs font-bold text-slate-600">₹{rec.netPay?.toLocaleString()}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border ${rec.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : rec.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{rec.status}</span>
                                                </td>
                                                <td className="px-6 py-3 text-right flex items-center justify-end gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(rec); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-all"><Icons.Edit /></button>
                                                    <button className="p-1.5 text-slate-400">{isRecExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}</button>
                                                </td>
                                            </tr>
                                            {isRecExpanded && <HistoryRow adjustments={rec.adjustments} />}
                                        </>
                                    );
                                })}
                            </>
                        );
                    } 
                    else {
                        const rec = item;
                        const isAdvance = checkIsAdvance(rec.month, rec.updatedAt);
                        const isRecExpanded = expandedRecords[rec._id];
                        return (
                            <>
                                <tr key={rec._id} onClick={() => toggleRecordExpand(rec._id)} className="hover:bg-blue-50/20 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-xs">{rec.employee?.firstName} {rec.employee?.lastName}</div>
                                        <div className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">{rec.employee?.employeeCode}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 flex items-center gap-2">
                                        {rec.month}
                                        {isAdvance && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200 uppercase tracking-tighter">Advance</span>}
                                    </td>
                                    <td className="px-6 py-4 text-[11px] text-slate-400 font-medium">{formatDate(rec.updatedAt)}</td>
                                    <td className="px-6 py-4 text-center"><span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded font-bold text-[10px] uppercase">{rec.presentDays} Days</span></td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-sm italic">₹{rec.netPay?.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border ${rec.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : rec.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{rec.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(rec); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Icons.Edit /></button>
                                        <button className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg shadow-sm">{isRecExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}</button>
                                    </td>
                                </tr>
                                {isRecExpanded && <HistoryRow adjustments={rec.adjustments} />}
                            </>
                        );
                    }
                })}
                {filteredData.length === 0 && <tr><td colSpan="7" className="p-20 text-center text-slate-400 text-xs font-medium">No payroll history found.</td></tr>}
            </tbody>
            </table>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="text-blue-600"><Icons.Banknote /></div>
                        <h3 className="font-bold text-slate-800 text-sm">Adjustment Console</h3>
                    </div>
                    <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><Icons.X /></button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">

                    {editError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3 mb-6">
                            <div className="mt-0.5"><Icons.Alert /></div>
                            <div>
                                <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">Validation Error</h4>
                                <p className="text-xs mt-0.5">{editError}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beneficiary</p>
                                <p className="font-bold text-slate-900 text-sm">{editingItem?.employee?.firstName} {editingItem?.employee?.lastName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Payout</p>
                                <p className="font-mono font-bold text-slate-700">₹{editForm.basePay.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Add New Transaction</label>
                        <div className="flex gap-2">
                            <select 
                                className="w-1/3 border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-700 outline-none bg-white focus:border-blue-500"
                                value={newAdj.type}
                                onChange={e => setNewAdj({...newAdj, type: e.target.value})}
                            >
                                <option value="Incentive">Incentive (+)</option>
                                <option value="Penalty">Penalty (-)</option>
                            </select>
                            <input 
                                type="number" 
                                className="w-1/3 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500" 
                                placeholder="Amount" 
                                value={newAdj.amount}
                                onChange={e => setNewAdj({...newAdj, amount: e.target.value})}
                            />
                            <button 
                                onClick={addAdjustment}
                                className="w-1/3 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <input 
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500" 
                            placeholder="Reason (e.g. Overtime, Late Arrival, Bonus)"
                            value={newAdj.reason}
                            onChange={e => setNewAdj({...newAdj, reason: e.target.value})}
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaction Log</label>
                            <span className="text-[10px] font-bold text-slate-400">{editForm.adjustments.length} Items</span>
                        </div>
                        
                        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                            {editForm.adjustments.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[9px] uppercase font-bold text-slate-500 border-b border-slate-100">
                                        <tr>
                                            <th className="px-3 py-2">Type</th>
                                            <th className="px-3 py-2">Reason</th>
                                            <th className="px-3 py-2 text-right">Amount</th>
                                            <th className="w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {editForm.adjustments.map((adj, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50">
                                                <td className="px-3 py-2">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                                        adj.type === 'Incentive' 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                        : 'bg-rose-50 text-rose-700 border-rose-100'
                                                    }`}>
                                                        {adj.type === 'Incentive' ? 'CR' : 'DR'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-xs text-slate-600 truncate max-w-[120px]" title={adj.reason}>{adj.reason}</td>
                                                <td className={`px-3 py-2 text-xs font-bold text-right ${adj.type === 'Incentive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {adj.type === 'Incentive' ? '+' : '-'}₹{adj.amount}
                                                </td>
                                                <td className="px-1 text-center">
                                                    <button onClick={() => removeAdjustment(adj.id || adj._id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Icons.Trash /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-6 text-center text-slate-400 text-xs italic">No adjustments recorded yet.</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-4 text-white flex justify-between items-center shadow-lg">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Net Pay</p>
                            <p className="text-xs text-slate-500 mt-0.5">Includes Base + Adjustments</p>
                        </div>
                        <p className="text-2xl font-bold font-mono tracking-tight">₹{editForm.netPay.toLocaleString()}</p>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                    <div className="flex-1">
                        <select 
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 outline-none bg-white focus:border-blue-500 cursor-pointer"
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        >
                            <option value="Pending">Status: Pending</option>
                            <option value="In Progress">Status: Processing</option>
                            <option value="Paid">Status: Settled</option>
                            <option value="Hold">Status: On Hold</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Confirm & Save'}
                    </button>
                </div>
            </div>
        </div>
      )}

      <PayrollModal 
        isOpen={showPayrollModal} 
        onClose={() => setShowPayrollModal(false)} 
        onSuccessNav={navigate}
        employees={employees}
      />
    </Layout>
  );
};

export default SalaryReport;