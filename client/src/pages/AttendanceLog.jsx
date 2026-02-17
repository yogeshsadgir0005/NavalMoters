import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';

const Icons = {
  Calendar: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  User: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  XCircle: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CheckCircle: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Moon: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Alert: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};

const AttendanceLog = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ employeeId: '', status: 'Present', date: new Date().toISOString().slice(0,10) });
  const [attendanceError, setAttendanceError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

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

  const handleAttendance = async (e) => {
    e.preventDefault();
    setAttendanceError(null);

    if (!attendanceData.employeeId) {
      setAttendanceError("Please select an employee from the dropdown menu before confirming.");
      return;
    }

    try {
      await API.post('/attendance', attendanceData);
      setShowAttendanceModal(false);
      setAttendanceData({ employeeId: '', status: 'Present', date: new Date().toISOString().slice(0,10) });
      fetchData();
    } catch (e) {
      const backendError = e.response?.data?.message || '';

      if (backendError.includes('Cast to ObjectId') || backendError.includes('validation failed')) {
          setAttendanceError("Unable to save. Please ensure all required fields are filled correctly.");
      } else {
          setAttendanceError(backendError || 'An unexpected error occurred while saving attendance.');
      }
    }
  };

  const getDaysInMonth = () => {
    const [year, month] = selectedMonth.split('-');
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  const getStatus = (empId, day) => {
    const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
    const record = logs.find(l => 
      l.employee?._id === empId && 
      l.date.startsWith(dateStr) 
    );
    return record ? record.status : '-';
  };

  const days = getDaysInMonth();

  const StatusCell = ({ status }) => {
    if (status === 'Present') return (
        <div className="w-5 h-5 mx-auto rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold border border-emerald-200">P</div>
    );
    if (status === 'Absent') return (
        <div className="w-5 h-5 mx-auto rounded bg-rose-100 text-rose-600 flex items-center justify-center text-[9px] font-bold border border-rose-200">A</div>
    );
    if (status === 'Half Day') return (
        <div className="w-5 h-5 mx-auto rounded bg-amber-100 text-amber-600 flex items-center justify-center text-[9px] font-bold border border-amber-200">H</div>
    );
    return <div className="text-slate-200 text-[10px] text-center font-light">·</div>;
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-blue-600">
             <Icons.Clock />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Attendance Register</h1>
            <p className="text-slate-500 text-xs">Monthly matrix view.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => { setShowAttendanceModal(true); setAttendanceError(null); }}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
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
                className="pl-8 pr-2 py-1.5 h-8 border border-slate-200 rounded bg-white font-semibold text-slate-700 shadow-sm focus:ring-1 focus:ring-blue-500 outline-none hover:border-blue-300 transition-all text-xs cursor-pointer w-40"
                />
            </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-4 text-[10px] font-medium text-slate-500">
            <span className="font-bold text-slate-700 uppercase tracking-wider">Legend:</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absent</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Half Day</span>
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
                          <StatusCell status={getStatus(emp._id, d)} />
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
          <div className="bg-white p-0 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-800">Mark Attendance</h3>
                 <button onClick={() => { setShowAttendanceModal(false); setAttendanceError(null); }} className="text-slate-400 hover:text-slate-600"><Icons.XCircle /></button>
            </div>
            
            <form onSubmit={handleAttendance} className="p-6 space-y-5">
              {attendanceError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                  <div className="mt-0.5"><Icons.Alert /></div>
                  <div>
                    <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">Error processing request</h4>
                    <p className="text-xs mt-0.5">{attendanceError}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                <input 
                    type="date" 
                    className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                    value={attendanceData.date} 
                    onChange={e => setAttendanceData({...attendanceData, date: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee</label>
                <div className="relative">
                    <select 
                        className="w-full border border-slate-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all" 
                        value={attendanceData.employeeId} 
                        onChange={e => setAttendanceData({...attendanceData, employeeId: e.target.value})}
                    >
                    <option value="">Select Employee...</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                    <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
                        <Icons.ChevronRight />
                    </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <div className="grid grid-cols-3 gap-2">
                    {['Present', 'Absent', 'Half Day'].map(status => (
                        <button
                            type="button"
                            key={status}
                            onClick={() => setAttendanceData({...attendanceData, status})}
                            className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                                attendanceData.status === status 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="mt-4 flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                    <input 
                        type="checkbox" 
                        id="nightDuty"
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={attendanceData.isNightDuty || false}
                        onChange={(e) => setAttendanceData({...attendanceData, isNightDuty: e.target.checked})}
                    />
                    <label htmlFor="nightDuty" className="text-sm text-slate-700 font-medium flex items-center gap-2 cursor-pointer">
                        <Icons.Moon /> Mark as Night Duty
                    </label>
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition-colors shadow-lg flex justify-center items-center gap-2">
                    <Icons.CheckCircle /> Confirm Attendance
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