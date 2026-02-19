import Layout from "../components/Layout";
import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

const Icons = {
  User: () => <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Bank: () => <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 10V4M11 10V4M15 10V4M19 10V4M5 21h14a2 2 0 002-2v-5H3v5a2 2 0 002 2z" /></svg>,
  Docs: () => <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 11h6M8 15h6m-9 4h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Briefcase: () => <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  ArrowUp: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>,
  ArrowDown: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
  File: () => <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  X: () => <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  ExternalLink: () => <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
};

const getFileUrl = (filename) => {
  const baseUrl = API.defaults.baseURL || 'http://localhost:5000/api';
  const serverUrl = baseUrl.replace(/\/api\/?$/, ''); 
  return `${serverUrl}/uploads/${filename}`;
};

const isImage = (name = "") => /\.(png|jpg|jpeg|webp|gif)$/i.test(name);
const isPdf = (name = "") => /\.pdf$/i.test(name);

const PreviewModal = ({ open, onClose, title, files, employeeId }) => {
  const [blobUrlMap, setBlobUrlMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  useEffect(() => {
    if (!open) {
      Object.values(blobUrlMap).forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
      setBlobUrlMap({}); setLoadingMap({}); setErrorMap({});
    }
  }, [open]);

  useEffect(() => {
    if (!open || !files?.length || !employeeId) return;
    let cancelled = false;

    const fetchOne = async (filename) => {
      try {
        setLoadingMap(p => ({ ...p, [filename]: true }));
        setErrorMap(p => ({ ...p, [filename]: "" }));
        const res = await API.get(`/files/employee/${employeeId}/${filename}`, { responseType: "blob" });
        if (cancelled) return;
        const blobUrl = URL.createObjectURL(res.data);
        setBlobUrlMap(p => ({ ...p, [filename]: blobUrl }));
      } catch (e) {
        if (cancelled) return;
        setErrorMap(p => ({ ...p, [filename]: "Failed to load file" }));
      } finally {
        if (cancelled) return;
        setLoadingMap(p => ({ ...p, [filename]: false }));
      }
    };

    files.forEach(f => fetchOne(f));
    return () => { cancelled = true; };
  }, [open, files, employeeId]);

  if (!open || !files?.length) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 lg:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col h-[90vh] lg:h-auto lg:max-h-[90vh]">
        <div className="p-3 lg:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs lg:text-sm flex items-center gap-2 truncate pr-4">
            <Icons.Docs /> {title}
          </h3>
          <button onClick={onClose} className="p-1.5 lg:p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors shrink-0">
            <Icons.X />
          </button>
        </div>

        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto bg-slate-100 custom-scrollbar">
          {files.map(f => {
            const loading = loadingMap[f];
            const err = errorMap[f];
            const blobUrl = blobUrlMap[f];

            return (
              <div key={f} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-3 lg:px-4 py-2.5 lg:py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
                  <div className="text-[10px] lg:text-xs font-bold text-slate-600 break-all">{f}</div>
                  <button
                    type="button"
                    onClick={() => { if(blobUrl) window.open(blobUrl, "_blank", "noopener,noreferrer"); }}
                    disabled={!blobUrl}
                    className={`text-[10px] lg:text-xs shrink-0 font-bold flex items-center gap-1 ${
                      blobUrl ? "text-blue-600 hover:text-blue-800" : "text-slate-300 cursor-not-allowed"
                    }`}
                  >
                    <Icons.ExternalLink /> Open
                  </button>
                </div>

                <div className="p-3 lg:p-4 bg-slate-50/50 min-h-[150px] lg:min-h-[200px] flex items-center justify-center">
                  {loading && <div className="text-[10px] lg:text-xs font-bold text-slate-400 animate-pulse">Decrypting file...</div>}
                  {!loading && err && <div className="text-[10px] lg:text-xs font-bold text-rose-500">Error: {err}</div>}
                  {!loading && !err && blobUrl && (
                    <>
                      {isImage(f) && <img src={blobUrl} alt={f} className="max-h-[40vh] lg:max-h-[600px] w-full object-contain rounded shadow-sm" />}
                      {isPdf(f) && <iframe title={f} src={blobUrl} className="w-full h-[60vh] lg:h-[600px] rounded border border-slate-200" />}
                      {!isImage(f) && !isPdf(f) && (
                        <div className="text-[10px] lg:text-xs font-medium text-slate-500 bg-white px-3 lg:px-4 py-1.5 lg:py-2 rounded border border-slate-200">
                          Preview not available. Use "Open" button.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MySpace = () => {
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('self');
  const [pageError, setPageError] = useState(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFiles, setPreviewFiles] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    API.get('/employees/me')
      .then(res => {
          setEmp(res.data);
          setEmployeeId(res.data._id);
      })
      .catch(err => setPageError("Failed to load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const documentCards = useMemo(() => {
    if (!emp?.documents) return [];
    const docs = emp.documents;
    const cards = [];

    const addCard = (key, title) => {
        if (!docs[key]) return;
        const files = Array.isArray(docs[key]) ? docs[key] : [docs[key]];
        if (files.length > 0) cards.push({ key, title, files });
    };

    addCard('aadhar', 'Aadhar Card');
    addCard('pan', 'PAN Card');
    addCard('bankProof', 'Bank Proof');
    addCard('dl', 'Driving License');
    addCard('appHindi', 'Application (Hindi)');
    addCard('appEnglish', 'Application (English)');
    addCard('certificates', 'Certificates');
    addCard('otherKyc', 'Other KYC');

    return cards;
  }, [emp]);

  if (loading) return (
      <Layout>
          <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600"></div>
              <span className="text-slate-400 text-sm font-medium">Loading My Space...</span>
          </div>
      </Layout>
  );

  if (pageError || !emp) return (
      <Layout>
          <div className="flex h-[80vh] items-center justify-center">
              <div className="text-rose-500 font-bold bg-rose-50 px-6 py-4 rounded-xl border border-rose-100">
                  {pageError || "Profile not found."}
              </div>
          </div>
      </Layout>
  );

  const TabButton = ({ id, label, Icon }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-4 lg:px-6 py-3 lg:py-4 font-bold text-xs lg:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap shrink-0 ${
        activeTab === id 
        ? 'border-blue-600 text-blue-700' 
        : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
      }`}
    >
      <Icon /> {label}
    </button>
  );

  const InfoRow = ({ label, val }) => (
    <div className="flex flex-col border-b border-slate-50 py-2 lg:py-3 last:border-0 hover:bg-slate-50/50 transition-colors px-1 lg:px-2 rounded">
      <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 lg:mb-1">{label}</span>
      <span className="font-semibold text-slate-800 text-xs lg:text-sm break-words">{val || '—'}</span>
    </div>
  );

  const firstFilePreview = (filename) => {
      const ext = filename.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
          return (
              <div className="h-20 lg:h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-2 lg:p-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <span className="text-white text-[9px] lg:text-[10px] font-bold uppercase tracking-wider">Preview</span>
                  </div>
                  <img src={getFileUrl(filename)} alt="preview" className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-105" />
              </div>
          );
      }
      return (
          <div className="h-20 lg:h-32 bg-slate-50 border-b border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group text-slate-300">
               <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                  <span className="text-slate-700 text-[9px] lg:text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-1 rounded backdrop-blur-sm">View Document</span>
              </div>
              <Icons.Docs />
              <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest mt-1 lg:mt-2 text-slate-400">{ext} Document</span>
          </div>
      );
  };

  return (
    <Layout>
      <div className="flex items-center gap-2 lg:gap-3 mb-6 lg:mb-8">
          <div className="p-1.5 lg:p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-blue-600">
              <Icons.User />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">My Space</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        
        <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 p-4 lg:p-6 lg:sticky lg:top-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-xl lg:text-2xl font-bold text-slate-500 overflow-hidden border-4 border-white shadow-md ring-1 ring-slate-100 mb-3 lg:mb-4">
                        {emp.documents?.photo ? (
                            <img src={getFileUrl(emp.documents.photo)} className="w-full h-full object-cover" alt="Profile"/>
                        ) : (
                            <span>{emp.firstName?.[0]}</span>
                        )}
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight leading-tight">{emp.firstName} {emp.lastName}</h2>
                    <p className="text-[10px] lg:text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{emp.jobProfile?.name || 'Employee'}</p>
                    <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5">{emp.department?.name || 'Unassigned Department'}</p>
                    
                    <div className="mt-4 lg:mt-6 w-full space-y-2 lg:space-y-3 bg-slate-50 p-3 lg:p-4 rounded-xl border border-slate-100 text-left">
                        <div className="flex justify-between items-center text-[10px] lg:text-xs">
                            <span className="font-bold text-slate-500 uppercase tracking-wider">Emp Code</span>
                            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">{emp.employeeCode}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] lg:text-xs">
                            <span className="font-bold text-slate-500 uppercase tracking-wider">Status</span>
                            <span className={`px-2 py-0.5 rounded font-bold uppercase border ${
                                emp.isProfileComplete 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                                {emp.isProfileComplete ? 'Complete' : 'Pending Data'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 overflow-hidden min-h-[500px] lg:min-h-[600px] flex flex-col">
            
            <div className="flex border-b border-slate-200 px-2 overflow-x-auto whitespace-nowrap custom-scrollbar">
                <TabButton id="self" label="Personal & Family" Icon={Icons.User} />
                <TabButton id="job" label="Professional" Icon={Icons.Briefcase} />
                <TabButton id="financial" label="Financials" Icon={Icons.Bank} />
                <TabButton id="docs" label="My Documents" Icon={Icons.Docs} />
            </div>

            {activeTab === 'self' && (
                <div className="p-4 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-6 lg:gap-y-8 animate-in fade-in duration-300">
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 mb-3 lg:mb-4 text-xs lg:text-sm flex items-center gap-2">
                            <span className="w-1 h-3 lg:h-4 bg-blue-600 rounded-full"></span> Contact Details
                        </h3>
                        <InfoRow label="Email Address" val={emp.email} />
                        <InfoRow label="Phone Number" val={emp.phone} />
                        <InfoRow label="Date of Birth" val={emp.dob ? new Date(emp.dob).toLocaleDateString('en-IN') : '-'} />
                        <InfoRow label="Residential Address" val={emp.address} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-slate-800 mb-3 lg:mb-4 text-xs lg:text-sm flex items-center gap-2">
                            <span className="w-1 h-3 lg:h-4 bg-blue-600 rounded-full"></span> Family Details
                        </h3>
                        <InfoRow label="Mother's Name" val={emp.family?.motherName} />
                        <InfoRow label="Father's Name" val={emp.family?.fatherName} />
                        <InfoRow label="Marital Status" val={emp.family?.maritalStatus} />
                        <InfoRow label="Spouse Name" val={emp.family?.spouseName} />
                    </div>
                </div>
            )}

            {activeTab === 'job' && (
                <div className="p-4 lg:p-8 animate-in fade-in duration-300">
                    <h3 className="font-bold text-slate-800 mb-3 lg:mb-4 text-xs lg:text-sm flex items-center gap-2">
                        <span className="w-1 h-3 lg:h-4 bg-blue-600 rounded-full"></span> Previous Employment
                    </h3>
                    {emp.lastJob?.company ? (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 lg:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                <InfoRow label="Company / Organization" val={emp.lastJob.company} />
                                <InfoRow label="Designation" val={emp.lastJob.role} />
                                <InfoRow label="Duration" val={emp.lastJob.duration} />
                                <InfoRow label="Reason for Leaving" val={emp.lastJob.reason} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 lg:p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400 text-xs lg:text-sm font-medium italic">No past employment history recorded.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'financial' && (
                <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 p-4 lg:p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="text-slate-300 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest">Base Salary Setup</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-2xl lg:text-3xl font-bold tracking-tight">₹{emp.baseSalary?.toLocaleString()}</p>
                                <span className="px-2 py-0.5 bg-white/10 rounded text-[9px] lg:text-[10px] font-bold uppercase tracking-wider text-slate-200 border border-white/10">
                                    {emp.wageType} Wage
                                </span>
                            </div>
                        </div>
                        <div className="relative z-10 mt-3 md:mt-0 text-left md:text-right">
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                            <p className="font-bold text-xs lg:text-sm">{emp.bankDetails?.bankName || 'Not Provided'}</p>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-64 bg-white/5 skew-x-12 translate-x-10"></div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 lg:mb-4 text-xs lg:text-sm flex items-center gap-2">
                            <span className="w-1 h-3 lg:h-4 bg-slate-300 rounded-full"></span> Increment History
                        </h3>
                        <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                            <table className="w-full text-left min-w-[500px]">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] lg:text-[10px] tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 lg:px-4 py-2 lg:py-3">Date</th>
                                        <th className="px-3 lg:px-4 py-2 lg:py-3">Action</th>
                                        <th className="px-3 lg:px-4 py-2 lg:py-3">Adjustment</th>
                                        <th className="px-3 lg:px-4 py-2 lg:py-3">New Salary</th>
                                        <th className="px-3 lg:px-4 py-2 lg:py-3 w-1/3">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {emp.increments?.length > 0 ? [...emp.increments].reverse().map((inc, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 lg:px-4 py-2 lg:py-3 text-slate-600 text-[10px] lg:text-xs font-medium whitespace-nowrap">
                                                {new Date(inc.date).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="px-3 lg:px-4 py-2 lg:py-3">
                                                <span className={`inline-flex items-center gap-1 px-1.5 lg:px-2 py-0.5 rounded text-[9px] lg:text-[10px] font-bold uppercase border ${
                                                    inc.type === 'Increment' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                    {inc.type === 'Increment' ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                                                    {inc.type}
                                                </span>
                                            </td>
                                            <td className={`px-3 lg:px-4 py-2 lg:py-3 text-[10px] lg:text-xs font-bold whitespace-nowrap ${inc.type === 'Increment' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {inc.type === 'Increment' ? '+' : '-'} ₹{inc.amount.toLocaleString()}
                                            </td>
                                            <td className="px-3 lg:px-4 py-2 lg:py-3 text-[10px] lg:text-xs font-bold text-slate-800 whitespace-nowrap">₹{inc.newSalary.toLocaleString()}</td>
                                            <td className="px-3 lg:px-4 py-2 lg:py-3 text-[10px] lg:text-xs text-slate-500 italic break-words min-w-[150px]">{inc.reason}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-6 lg:p-8 text-center text-slate-400 text-[10px] lg:text-xs italic">No structural changes recorded.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'docs' && (
                <div className="p-4 lg:p-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6">
                        {documentCards.map((d, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className="p-2.5 lg:p-4 flex items-start justify-between gap-2">
                                    <div className="min-w-0 pr-1">
                                        <div className="text-[10px] lg:text-xs font-bold text-slate-800 uppercase tracking-wide truncate">{d.title}</div>
                                        <div className="text-[9px] lg:text-[10px] text-slate-400 mt-0.5 lg:mt-1 font-medium">{d.files.length} File(s)</div>
                                    </div>
                                    <button
                                        onClick={() => { setPreviewTitle(d.title); setPreviewFiles(d.files); setPreviewOpen(true); }}
                                        className="px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] lg:text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all shrink-0"
                                    >
                                        View
                                    </button>
                                </div>
                                {firstFilePreview(d.files[0])}
                            </div>
                        ))}
                    </div>
                    {documentCards.length === 0 && <div className="text-[10px] lg:text-xs text-slate-400 italic p-4 text-center">No documents uploaded.</div>}
                </div>
            )}

        </div>
      </div>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        files={previewFiles}
        employeeId={employeeId}
      />
    </Layout>
  );
};

export default MySpace;