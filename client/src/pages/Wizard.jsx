import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import { Link } from 'react-router-dom';

// --- ICONS ---
const Icons = {
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  User: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Alert: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Check: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
};

const Personnel = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/employees').then(res => setEmployees(res.data));
  }, []);

  const createEmployee = async () => {
    const email = prompt('Enter New Employee Email');
    if (!email) return;
    try {
        await API.post('/employees', { email, firstName: 'New', lastName: 'Employee' });
        window.location.reload();
    } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };

  const filtered = employees.filter(e => 
    e.firstName?.toLowerCase().includes(search.toLowerCase()) || 
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
        {/* Header & Actions */}
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
                    onClick={createEmployee} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm whitespace-nowrap shadow-md shadow-blue-100 transition-all flex items-center gap-2 active:scale-95"
                >
                    <Icons.Plus /> Add New
                </button>
            </div>
        </div>

        {/* Data Table */}
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
                        {filtered.map(emp => (
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
                        ))}
                        {filtered.length === 0 && (
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
    </Layout>
  );
};

export default Personnel;