import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';

// --- ICONS ---
const Icons = {
  Building: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Hashtag: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>,
  Settings: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const Masters = () => {
  const [depts, setDepts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [newDept, setNewDept] = useState('');
  const [newJob, setNewJob] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await API.get('/masters'); 
      setDepts(data.departments);
      setJobs(data.jobProfiles);
    } catch (e) { console.error(e); }
  };

  const addDept = async (e) => {
    e.preventDefault();
    try { await API.post('/masters/department', { name: newDept }); setNewDept(''); fetchData(); }
    catch (e) { alert('Error adding department'); }
  };

  const addJob = async (e) => {
    e.preventDefault();
    try { await API.post('/masters/job-profile', { name: newJob }); setNewJob(''); fetchData(); }
    catch (e) { alert('Error adding job profile'); }
  };

  const MasterSection = ({ title, icon: Icon, items, value, onChange, onSubmit, placeholder }) => (
    <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 h-full flex flex-col">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shadow-sm">
          <Icon />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <p className="text-xs text-slate-400 font-medium">Manage available options</p>
        </div>
      </div>
      
      {/* Input Form */}
      <form onSubmit={onSubmit} className="flex gap-2 mb-6">
        <input 
          className="flex-1 bg-slate-50 hover:bg-white border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none block w-full p-2.5 transition-all shadow-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-medium transition-all active:scale-95 shadow-md shadow-blue-100 flex items-center justify-center"
          title="Add New"
        >
          <Icons.Plus />
        </button>
      </form>

      {/* Items List */}
      <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
        {items.length > 0 ? (
          items.map((item) => (
            <div 
              key={item._id} 
              className="flex justify-between items-center p-3.5 bg-white rounded-lg border border-slate-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 transition-all group cursor-default"
            >
              <span className="font-semibold text-slate-700 text-sm pl-2 border-l-2 border-transparent group-hover:border-blue-500 transition-all">
                {item.name}
              </span>
              
              {/* ID Badge */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                <span className="text-slate-300 group-hover:text-blue-400"><Icons.Hashtag /></span>
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-blue-600 tracking-wider">
                  {item._id.slice(-4).toUpperCase()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-lg text-slate-400 bg-slate-50/50">
             <span className="text-sm font-medium">No records found</span>
             <span className="text-xs">Add a new item to get started</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-700">
                <Icons.Settings />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Masters</h1>
        </div>
        <p className="text-slate-500 text-sm ml-12">Configure global dropdown values for Departments and Job Profiles.</p>
      </div>
      
      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100vh-200px)] min-h-[500px]">
        <MasterSection 
          title="Departments" 
          icon={Icons.Building}
          items={depts} 
          value={newDept} 
          onChange={setNewDept} 
          onSubmit={addDept} 
          placeholder="e.g. Mechanical, Sales, IT..."
        />
        <MasterSection 
          title="Job Profiles" 
          icon={Icons.Briefcase}
          items={jobs} 
          value={newJob} 
          onChange={setNewJob} 
          onSubmit={addJob} 
          placeholder="e.g. Senior Technician, Manager..."
        />
      </div>
    </Layout>
  );
};

export default Masters;