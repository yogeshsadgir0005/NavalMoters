import Layout from "../components/Layout";
import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

// --- ICONS ---
const Icons = {
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Bank: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 10V4M11 10V4M15 10V4M19 10V4M5 21h14a2 2 0 002-2v-5H3v5a2 2 0 002 2z" /></svg>,
  Docs: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>,
  Shield: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  // Added for Payment History
  History: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ChevronUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
};

/** ---------- Preview helpers ---------- */
const isImage = (name = "") => /\.(png|jpg|jpeg|webp|gif)$/i.test(name);
const isPdf = (name = "") => /\.pdf$/i.test(name);

const PreviewModal = ({ open, onClose, title, files, employeeId }) => {
  const [blobUrlMap, setBlobUrlMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  useEffect(() => {
    if (!open || !employeeId) return;
    let cancelled = false;

    const fetchFile = async (filename) => {
      if (blobUrlMap[filename]) return;
      try {
        setLoadingMap((p) => ({ ...p, [filename]: true }));
        setErrorMap((p) => ({ ...p, [filename]: "" }));
        const res = await API.get(`/files/employee/${employeeId}/${filename}`, { responseType: "blob" });
        if (cancelled) return;
        const url = URL.createObjectURL(res.data);
        setBlobUrlMap((p) => ({ ...p, [filename]: url }));
      } catch (e) {
        if (cancelled) return;
        const msg = e?.response?.data?.message || e?.response?.statusText || e?.message || "Failed to load file";
        setErrorMap((p) => ({ ...p, [filename]: msg }));
      } finally {
        if (cancelled) return;
        setLoadingMap((p) => ({ ...p, [filename]: false }));
      }
    };

    (files || []).forEach(fetchFile);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employeeId, (files || []).join("|")]);

  useEffect(() => {
    if (open) return;
    Object.values(blobUrlMap).forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
    setBlobUrlMap({}); setLoadingMap({}); setErrorMap({});
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="font-bold text-slate-800 text-sm uppercase tracking-wide">{title} Preview</div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">✕</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto bg-slate-100">
          {(files || []).map((f) => {
            const blobUrl = blobUrlMap[f];
            const isLoading = !!loadingMap[f];
            const err = errorMap[f];

            return (
              <div key={f} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-bold text-slate-600 break-all">{f}</div>
                  <div className="flex items-center gap-3">
                    <a className={`text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 ${!blobUrl ? "opacity-50 pointer-events-none" : ""}`} href={blobUrl || "#"} download={f} onClick={(e) => { if (!blobUrl) e.preventDefault(); }}>
                      <span>Download</span>
                    </a>
                    <a className={`text-xs font-bold text-blue-600 hover:text-blue-800 ${!blobUrl ? "opacity-50 pointer-events-none" : ""}`} href={blobUrl || "#"} target="_blank" rel="noreferrer" onClick={(e) => !blobUrl && e.preventDefault()}>
                      Open Tab
                    </a>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-center min-h-[200px]">
                  {isLoading && <div className="text-xs font-bold text-slate-400 animate-pulse">Loading...</div>}
                  {err && <div className="text-xs font-bold text-rose-500">Error: {err}</div>}
                  {!isLoading && !err && isImage(f) && blobUrl && <img src={blobUrl} alt={f} className="max-h-[520px] w-full object-contain rounded" />}
                  {!isLoading && !err && isPdf(f) && blobUrl && <iframe title={f} src={blobUrl} className="w-full h-[520px] rounded border border-slate-200" />}
                  {!isLoading && !err && !isImage(f) && !isPdf(f) && <div className="text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded">Preview not supported. Use Download.</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const prettyLabel = (key) => {
  const map = {
    aadhar: "Aadhar Card", pan: "PAN Card", photo: "Profile Photo", dl: "Driving License",
    appHindi: "Application (Hindi)", appEnglish: "Application (English)", certificates: "Certificates", otherKyc: "Other KYC Docs",
  };
  return map[key] || key;
};

// --- SUB-COMPONENT: History Row (Copied from SalaryReport/EmployeeDetail) ---
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

const MySpace = () => {
  const [data, setData] = useState(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('personal'); // personal | payments | docs
  const [salaryHistory, setSalaryHistory] = useState([]); 
  const [expandedRecords, setExpandedRecords] = useState({});

  // File Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("Document");
  const [previewFiles, setPreviewFiles] = useState([]);
  const [thumbUrls, setThumbUrls] = useState({});

  const load = async () => {
    try {
      const res = await API.get("/employees/me");
      setData(res.data);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { load(); }, []);

  // Load Salary History when Data is available
  useEffect(() => {
    if (data?._id) {
        loadSalaryHistory(data._id);
    }
  }, [data]);

  const loadSalaryHistory = async (id) => {
      try {
          const { data: hist } = await API.get('/salary/history');
          // Filter logic: Check both object populated or ID string
          const myHistory = hist.filter(s => s.employee?._id === id || s.employee === id);
          setSalaryHistory(myHistory);
      } catch (e) {
          console.error("Failed to load salary history");
      }
  };

  const toggleRecordExpand = (recId) => {
    setExpandedRecords(prev => ({ ...prev, [recId]: !prev[recId] }));
  };

  const employeeId = data?._id || data?.id;

  // Thumbnails Logic
  useEffect(() => {
    if(!data || !employeeId) return;
    const docs = data.documents || {};
    const entries = Object.entries(docs).filter(([_, v]) => v && (Array.isArray(v) ? v.length > 0 : true));
    
    entries.forEach(async ([_, value]) => {
       const files = Array.isArray(value) ? value : [value];
       const firstFile = files[0];
       if(isImage(firstFile) && !thumbUrls[firstFile]) {
          try {
             const res = await API.get(`/files/employee/${employeeId}/${firstFile}`, { responseType: 'blob' });
             const url = URL.createObjectURL(res.data);
             setThumbUrls(prev => ({...prev, [firstFile]: url}));
          } catch(e) { console.error("Failed thumb load", firstFile); }
       }
    });
    return () => { Object.values(thumbUrls).forEach(u => URL.revokeObjectURL(u)); };
  }, [data, employeeId]); // eslint-disable-line

  const firstFilePreview = (filename) => {
    if (!filename) return null;
    if (isImage(filename)) {
      if(thumbUrls[filename]) {
        return <img src={thumbUrls[filename]} alt={filename} className="mt-3 h-28 w-full object-cover rounded-xl border border-slate-200 shadow-sm" loading="lazy" />;
      }
      return <div className="mt-3 h-28 w-full rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 animate-pulse">Loading...</div>;
    }
    if (isPdf(filename)) {
      return (
        <div className="mt-3 h-28 w-full rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PDF Document</span>
        </div>
      );
    }
    return null;
  };

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-slate-50 py-3.5 group">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{label}</span>
      <span className="font-bold text-slate-800 text-sm">{value || "—"}</span>
    </div>
  );

  const documentCards = useMemo(() => {
    const docs = data?.documents || {};
    const entries = Object.entries(docs).filter(([_, v]) => v && (Array.isArray(v) ? v.length > 0 : true));
    return entries.map(([key, value]) => ({ key, title: prettyLabel(key), files: Array.isArray(value) ? value : [value] }));
  }, [data]);

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

  if (!data) {
    return <Layout><div className="p-20 text-center text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Loading Profile...</div></Layout>;
  }

  return (
    <Layout>
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-2xl bg-slate-900 flex items-center justify-center font-bold text-white text-3xl shadow-xl border border-slate-800">
            {(data.firstName?.[0] || "U").toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{data.firstName} {data.lastName}</h1>
            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1">
              {data.jobProfile?.name || "No Role"} <span className="text-slate-300 mx-2">•</span> {data.department?.name || "No Dept"}
            </p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 ${
            data.isProfileComplete ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
        }`}>
            <Icons.Shield /> {data.isProfileComplete ? "Compliance Active" : "Action Required"}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-2 overflow-x-auto">
            <TabButton id="personal" label="Profile" Icon={Icons.User} />
            <TabButton id="payments" label="Payment History" Icon={Icons.Clock} />
            <TabButton id="docs" label="Documents" Icon={Icons.Docs} />
        </div>

        {/* Tab Body */}
        <div className="p-8">
            
            {/* 1. PERSONAL TAB (Original Grids) */}
            {activeTab === 'personal' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-slate-800">
                            <Icons.User /> <h3 className="font-bold text-sm uppercase tracking-widest">Personal Records</h3>
                        </div>
                        <Row label="Email" value={data.email} />
                        <Row label="Phone" value={data.phone} />
                        <Row label="System ID" value={data.employeeCode} />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-slate-800">
                            <Icons.Bank /> <h3 className="font-bold text-sm uppercase tracking-widest">Bank Settlement Info</h3>
                        </div>
                        <Row label="Account Number" value={data.bankDetails?.accountNo} />
                        <Row label="IFSC Code" value={data.bankDetails?.ifsc} />
                        <Row label="Bank Name" value={data.bankDetails?.bankName} />
                    </div>
                </div>
            )}

            {/* 2. PAYMENT HISTORY TAB (New Table) */}
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

            {/* 3. DOCUMENTS TAB (Original Documents Grid) */}
            {activeTab === 'docs' && (
                <div className="animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-6 text-slate-800">
                        <Icons.Docs /> <h3 className="font-bold text-sm uppercase tracking-widest">Secure Documents</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {documentCards.map((d) => (
                            <div key={d.key} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">{d.title}</div>
                                        <div className="text-[10px] text-slate-400 mt-1 font-medium">{d.files.length} File(s)</div>
                                    </div>
                                    <button
                                        onClick={() => { setPreviewTitle(d.title); setPreviewFiles(d.files); setPreviewOpen(true); }}
                                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        View
                                    </button>
                                </div>
                                {firstFilePreview(d.files[0])}
                            </div>
                        ))}
                    </div>
                    {documentCards.length === 0 && <div className="text-xs text-slate-400 italic p-4 text-center">No documents uploaded.</div>}
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