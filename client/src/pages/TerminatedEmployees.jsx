import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Icons = {
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
  </svg>,
  ArrowLeft: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

const TerminatedEmployees = () => {
  const navigate = useNavigate();
  const [terminatedList, setTerminatedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/employees/terminated/history');
        setTerminatedList(res.data);
      } catch (e) {
        console.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate('/personnel')} className="text-slate-400 hover:text-blue-600 transition-colors">
              <Icons.ArrowLeft />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Icons.Archive /> Terminated Archive
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-7">History of offboarded and terminated employees.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="text-sm text-slate-400 font-medium">Loading Archive...</p>
          </div>
        ) : terminatedList.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm font-medium">No terminated employees found in the archive.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee Identity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department / Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Termination Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Terminated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {terminatedList.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{emp.email}</div>
                      <div className="text-[10px] text-blue-500 font-bold mt-1 tracking-wider uppercase">{emp.employeeCode}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-semibold text-slate-700">{emp.jobProfile?.name || '—'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{emp.department?.name || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 shadow-sm">
                        {emp.terminationDetails?.date
                          ? new Date(emp.terminationDetails.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                        {emp.terminationDetails?.terminatedBy || 'System Admin'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TerminatedEmployees;