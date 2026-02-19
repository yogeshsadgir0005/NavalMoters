import { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';

const Icons = {
  Calendar: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  User: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  XCircle: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Moon: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  CheckCircle: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Alert: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};

const AttendanceLog = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ employeeId: '', status: 'Present', date: new Date().toISOString().slice(0,10), isNightDuty: false });
  const [attendanceError, setAttendanceError] = useState(null);
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [dailyStatusMap, setDailyStatusMap] = useState({});

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  useEffect(() => {
    if (showAttendanceModal) {
      fetchDailyStatus();
    }
  }, [attendanceData.date, showAttendanceModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, logRes] = await Promise.all([
        API.get('/employees'),
        API.get(`/attendance?month=${selectedMonth}`)
      ]);
      setEmployees(empRes.data);
      setLogs(logRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
    } catch (e) {}
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
      fetchData();
    } catch (e) {
      const backendError = e.response?.data?.message || '';
      setAttendanceError(backendError || 'An unexpected error occurred while saving attendance.');
    }
  };

  const getDaysInMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  const getRecord = (empId, day) => {
    const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
    return logs.find(l => 
      l.employee?._id === empId && 
      l.date.startsWith(dateStr) 
    );
  };

  const days = getDaysInMonth();

  const StatusCell = ({ record }) => {
    if (!record) return <div className="text-slate-200 text-[10px] text-center font-light">·</div>;

    const { status, isNightDuty } = record;

    if (status === 'Present') return (
        <div className={`w-5 h-5 mx-auto rounded flex items-center justify-center text-[9px] font-bold border ${isNightDuty ? 'bg-slate-800 text-emerald-400 border-slate-700' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>P</div>
    );
    if (status === 'Absent') return (
        <div className={`w-5 h-5 mx-auto rounded flex items-center justify-center text-[9px] font-bold border ${isNightDuty ? 'bg-slate-800 text-rose-400 border-slate-700' : 'bg-rose-100 text-rose-600 border-rose-200'}`}>A</div>
    );
    if (status === 'Half Day') return (
        <div className={`w-5 h-5 mx-auto rounded flex items-center justify-center text-[9px] font-bold border ${isNightDuty ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>H</div>
    );
    return <div className="text-slate-200 text-[10px] text-center font-light">·</div>;
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4 md:gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-blue-600">
             <Icons.Clock />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Attendance Register</h1>
            <p className="text-slate-500 text-xs">Monthly matrix view.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button 
                onClick={() => { setShowAttendanceModal(true); setAttendanceError(null); }}
                className="flex justify-center items-center gap-2 px-4 py-2 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
                <Icons.CheckCircle /> Mark Attendance
            </button>

            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500 group-hover:text-blue-600 transition-colors">
                    <Icons.Calendar />
                </div>
                <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-8 pr-2 py-2 sm:py-1.5 h-auto sm:h-8 border border-slate-200 rounded bg-white font-semibold text-slate-700 shadow-sm focus:ring-1 focus:ring-blue-500 outline-none hover:border-blue-300 transition-all text-xs cursor-pointer w-full sm:w-40"
                />
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-2 md:gap-4 text-[10px] font-medium text-slate-500">
            <span className="font-bold text-slate-700 uppercase tracking-wider w-full md:w-auto mb-1 md:mb-0">Legend:</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absent</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Half Day</span>
            <span className="flex items-center gap-1 ml-0 md:ml-2 border-l-0 md:border-l border-slate-200 pl-0 md:pl-4"><span className="w-2.5 h-2.5 rounded-sm bg-slate-800"></span> Night Duty</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-white text-slate-500 text-[9px] uppercase font-bold border-b border-slate-200 h-9">
                <th className="px-3 sticky left-0 bg-white border-r border-slate-100 w-44 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)]">
                    Employee
                </th>
                
                {days.map(d => (
                  <th key={d} className="text-center w-7 border-r border-slate-50 last:border-0 font-semibold text-slate-600">{d}</th>
                ))}
                
                <th className="px-2 text-center w-16 bg-slate-50 border-l border-slate-200 text-slate-700">
                    Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                    <td colSpan={days.length + 2} className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-100 border-t-blue-600"></div>
                            <span className="text-slate-400 text-[10px]">Loading...</span>
                        </div>
                    </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={days.length + 2} className="p-8 text-center text-slate-400 text-xs">No employees found.</td></tr>
              ) : (
                employees.map((emp) => {
                  const presentCount = logs.filter(l => 
                    l.employee?._id === emp._id && l.status === 'Present'
                  ).length;
                  
                  return (
                    <tr key={emp._id} className="hover:bg-slate-50 transition-colors h-10 group">
                      <td className="px-3 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)] transition-colors truncate">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Icons.User />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-700 text-[11px] leading-tight truncate">{emp.firstName} {emp.lastName}</span>
                                <span className="text-[9px] text-blue-500 font-mono leading-tight truncate opacity-80">{emp.employeeCode}</span>
                            </div>
                        </div>
                      </td>
                      
                      {days.map(d => (
                        <td key={d} className="p-0 border-r border-slate-50 text-center align-middle">
                          <StatusCell record={getRecord(emp._id, d)} />
                        </td>
                      ))}
                      
                      <td className="px-1 text-center bg-slate-50 border-l border-slate-200">
                        <span className="font-bold text-slate-700 text-[10px]">
                            {presentCount}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAttendanceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">
            <div className="bg-white px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center">
                 <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-800">Mark Bulk Attendance</h3>
                    <p className="text-[10px] md:text-xs text-slate-500">Select employees for <span className="font-bold text-blue-600">{new Date(attendanceData.date).toLocaleDateString('en-IN')}</span></p>
                 </div>
                 <button onClick={() => { setShowAttendanceModal(false); setAttendanceError(null); }} className="text-slate-400 hover:text-slate-600"><Icons.XCircle /></button>
            </div>
            
            <form onSubmit={handleAttendance} className="p-4 md:p-6 overflow-hidden flex flex-col flex-1">
              {attendanceError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm mb-4">
                    <p className="font-bold text-xs uppercase">Error</p>
                    <p>{attendanceError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

              <div className="flex justify-between items-end mb-2 mt-2 md:mt-0">
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
                             className={`flex items-center gap-3 px-3 md:px-4 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-white'}`}>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <div className="flex-1 flex justify-between items-center min-w-0">
                                <div className="truncate pr-2">
                                    <p className={`text-xs md:text-sm font-semibold truncate ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>{emp.firstName} {emp.lastName}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{emp.employeeCode} • {emp.department?.name || 'No Dept'}</p>
                                </div>
                                {currentStatus && (
                                    <div className="text-right shrink-0">
                                        <span className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded border ${
                                            currentStatus.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            currentStatus.status === 'Absent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {currentStatus.status}
                                        </span>
                                        {currentStatus.isNightDuty && (
                                            <span className="flex items-center justify-end gap-1 text-[8px] md:text-[9px] text-slate-400 mt-0.5"><Icons.Moon /> Night</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                      );
                  }) : <div className="p-8 text-center text-slate-400 text-sm">No employees found.</div>}
              </div>

              <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="nightDutyLog" className="w-4 h-4 text-blue-600 rounded" checked={attendanceData.isNightDuty} onChange={(e) => setAttendanceData({...attendanceData, isNightDuty: e.target.checked})} />
                    <label htmlFor="nightDutyLog" className="text-xs md:text-sm text-slate-700 font-medium cursor-pointer flex items-center gap-1"><Icons.Moon /> Mark Night Duty</label>
                </div>
                <div className="text-[10px] md:text-xs text-slate-500">Selected: <span className="font-bold text-slate-800">{selectedIds.length}</span></div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 md:py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 text-sm">
                    <Icons.CheckCircle /> Confirm Update ({selectedIds.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AttendanceLog;