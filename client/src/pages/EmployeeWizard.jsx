import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../api/axios';

// --- ICONS ---
const Icons = {
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  ChevronRight: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
};

/** ---------- Small UI helpers ---------- */

const StepPill = ({ active, done, label, sub, icon: Icon }) => {
  const base = 'w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group';
  const cls = done
    ? 'bg-emerald-50 border-emerald-200'
    : active
      ? 'bg-blue-50 border-blue-200 shadow-sm'
      : 'bg-white border-slate-200 hover:bg-slate-50';
  
  const iconCls = done ? 'text-emerald-600 bg-emerald-100' : active ? 'text-blue-600 bg-blue-100' : 'text-slate-400 bg-slate-100 group-hover:bg-slate-200';

  return (
    <div className={`${base} ${cls}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${iconCls}`}>
        {done ? <Icons.Check /> : <Icon />}
      </div>
      <div>
        <p className={`font-bold text-sm ${done ? 'text-emerald-900' : active ? 'text-blue-900' : 'text-slate-700'}`}>{label}</p>
        <p className={`text-xs mt-0.5 ${done ? 'text-emerald-600' : 'text-slate-500'}`}>{sub}</p>
      </div>
    </div>
  );
};

const Field = ({ label, children, hint }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
    <div>{children}</div>
    {hint ? <p className="text-[10px] text-slate-400 mt-1 font-medium">{hint}</p> : null}
  </div>
);

/** ---------- File preview helpers ---------- */

const isImage = (name = '') => /\.(png|jpg|jpeg|webp|gif)$/i.test(name);
const isPdf = (name = '') => /\.pdf$/i.test(name);

const PreviewModal = ({ open, onClose, title, files, employeeId }) => {
  const [blobUrlMap, setBlobUrlMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  useEffect(() => {
    if (!open || !employeeId) return;
    
    (files || []).forEach(async (filename) => {
      if (blobUrlMap[filename]) return; 

      try {
        setLoadingMap(prev => ({ ...prev, [filename]: true }));
        const response = await API.get(`/files/employee/${employeeId}/${filename}`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(response.data);
        setBlobUrlMap(prev => ({ ...prev, [filename]: url }));
      } catch (error) {
        console.error("Failed to load file:", filename, error);
      } finally {
        setLoadingMap(prev => ({ ...prev, [filename]: false }));
      }
    });

    return () => {
      Object.values(blobUrlMap).forEach(url => window.URL.revokeObjectURL(url));
    };
  }, [open, employeeId, files]); // eslint-disable-line

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="text-blue-600"><Icons.Eye /></span> 
            {title} Preview
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto bg-slate-100">
          {(files || []).map((f) => {
            const blobUrl = blobUrlMap[f];
            const loading = loadingMap[f];

            return (
              <div key={f} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold text-slate-700 truncate">{f}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={blobUrl || '#'}
                      download={f}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${blobUrl ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-transparent text-slate-300 cursor-not-allowed'}`}
                      onClick={(e) => !blobUrl && e.preventDefault()}
                    >
                      <Icons.Download /> Download
                    </a>
                  </div>
                </div>

                <div className="flex justify-center bg-slate-50/50 min-h-[300px] items-center p-4">
                   {loading && (
                       <div className="flex flex-col items-center gap-2">
                           <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                           <span className="text-xs font-bold text-slate-400">Decrypting file...</span>
                       </div>
                   )}
                   
                   {!loading && !blobUrl && <div className="text-rose-500 text-sm font-bold flex items-center gap-2"><Icons.Alert /> Failed to load preview</div>}

                   {!loading && blobUrl && isImage(f) && (
                    <img src={blobUrl} alt={f} className="max-h-[600px] w-auto object-contain rounded shadow-sm" />
                  )}

                  {!loading && blobUrl && isPdf(f) && (
                    <iframe title={f} src={blobUrl} className="w-full h-[600px] rounded border border-slate-200" />
                  )}

                  {!loading && blobUrl && !isImage(f) && !isPdf(f) && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                            <Icons.Briefcase />
                        </div>
                        <p className="text-sm font-bold text-slate-600">Preview Unavailable</p>
                        <p className="text-xs text-slate-400 mt-1">Please download the file to view contents.</p>
                    </div>
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

const FileCard = ({ title, employeeId, current, onChange, accept, multiple = false }) => {
  const [open, setOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  const files = useMemo(() => {
    if (!current) return [];
    return Array.isArray(current) ? current : [current];
  }, [current]);

  useEffect(() => {
    let active = true;
    if (files.length > 0 && employeeId) {
       const first = files[0];
       if (isImage(first)) {
          API.get(`/files/employee/${employeeId}/${first}`, { responseType: 'blob' })
             .then(res => { if(active) setThumbnailUrl(window.URL.createObjectURL(res.data)); })
             .catch(err => console.error("Thumbnail load failed", err));
       }
    }
    return () => { active = false; if(thumbnailUrl) window.URL.revokeObjectURL(thumbnailUrl); };
  }, [files, employeeId]); 

  return (
    <>
      <div className="group border border-slate-200 rounded-xl p-4 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 transition-all relative">
        <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800 text-sm">{title}</p>
                    <p className={`text-[10px] font-medium mt-0.5 ${files.length > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {files.length > 0 ? '✓ Uploaded' : 'Pending Upload'}
                    </p>
                </div>
                {files.length > 0 && (
                    <button 
                        type="button" 
                        onClick={() => setOpen(true)} 
                        className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        title="View Files"
                    >
                        <Icons.Eye />
                    </button>
                )}
            </div>

            {/* Thumbnail / Placeholder */}
            {files.length > 0 ? (
                <div onClick={() => setOpen(true)} className="h-24 w-full rounded-lg border border-slate-100 bg-slate-50 overflow-hidden cursor-pointer relative group-hover:opacity-90 transition-opacity">
                    {isImage(files[0]) && thumbnailUrl ? (
                        <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                             <div className="scale-75"><Icons.Briefcase /></div>
                             <span className="text-[10px] font-bold mt-1 uppercase">{files[0].split('.').pop()}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center"></div>
                </div>
            ) : (
                <div className="h-24 w-full rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-300 group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all">
                    <Icons.Upload />
                    <span className="text-[10px] font-medium mt-1">Drag & Drop</span>
                </div>
            )}

            {/* Input Wrapper */}
            <label className="block w-full">
                <span className="sr-only">Choose file</span>
                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={onChange}
                    className="block w-full text-xs text-slate-500
                    file:mr-2 file:py-2 file:px-3
                    file:rounded-lg file:border-0
                    file:text-xs file:font-bold
                    file:bg-slate-100 file:text-slate-700
                    hover:file:bg-slate-200
                    cursor-pointer"
                />
            </label>
        </div>
      </div>

      <PreviewModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        files={files}
        employeeId={employeeId}
      />
    </>
  );
};

/** ---------- Main component ---------- */

const EmployeeWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [masters, setMasters] = useState({ departments: [], jobProfiles: [] });
  const [employee, setEmployee] = useState(null);
  const [missingFields, setMissingFields] = useState([]);

  // Form State - ADDED dob and address here
  const [files, setFiles] = useState({
    aadhar: null, pan: null, photo: null, appHindi: null, appEnglish: null, dl: null, certificates: [], otherKyc: [],
  });
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', bankAccountNo: '', bankIfsc: '', bankName: '',
    dob: '', address: '', // <--- NEW FIELDS
    motherName: '', motherWork: '', fatherName: '', fatherWork: '', maritalStatus: 'Single', anniversary: '', spouseName: '',
    siblings: [{ name: '', occupation: '' }], kids: [{ name: '', gender: '', dob: '' }],
    department: '', jobProfile: '', doj: '', wageType: 'Monthly', baseSalary: '',
    lastCompany: '', lastDuration: '', lastRole: '', lastReason: '',
  });

  const loadInitial = async () => {
    try {
      const [empRes, masterRes] = await Promise.all([
        API.get(`/employees/${id}`),
        API.get('/masters'),
      ]);

      const emp = empRes.data;
      setEmployee(emp);
      setMissingFields(emp.missingFields || []);
      setMasters(masterRes.data || { departments: [], jobProfiles: [] });

      setForm((prev) => ({
        ...prev,
        firstName: emp.firstName || '', lastName: emp.lastName || '', email: emp.email || '', phone: emp.phone || '',
        bankAccountNo: emp.bankDetails?.accountNo || '', bankIfsc: emp.bankDetails?.ifsc || '', bankName: emp.bankDetails?.bankName || '',
        // LOAD NEW FIELDS
        dob: emp.dob ? String(emp.dob).slice(0, 10) : '',
        address: emp.address || '',
        
        motherName: emp.family?.motherName || '', motherWork: emp.family?.motherWork || '', fatherName: emp.family?.fatherName || '', fatherWork: emp.family?.fatherWork || '',
        maritalStatus: emp.family?.maritalStatus || 'Single', anniversary: emp.family?.anniversary ? String(emp.family.anniversary).slice(0, 10) : '',
        spouseName: emp.family?.spouseName || '',
        siblings: (emp.family?.siblings?.length ? emp.family.siblings : [{ name: '', occupation: '' }]).map((s) => ({ name: s.name || '', occupation: s.occupation || '' })),
        kids: (emp.family?.kids?.length ? emp.family.kids : [{ name: '', gender: '', dob: '' }]).map((k) => ({ name: k.name || '', gender: k.gender || '', dob: k.dob ? String(k.dob).slice(0, 10) : '' })),
        department: emp.department?._id || emp.department || '', jobProfile: emp.jobProfile?._id || emp.jobProfile || '', doj: emp.doj ? String(emp.doj).slice(0, 10) : '', wageType: emp.wageType || 'Monthly', baseSalary: emp.baseSalary || '',
        lastCompany: emp.lastJob?.company || '', lastDuration: emp.lastJob?.duration || '', lastRole: emp.lastJob?.role || '', lastReason: emp.lastJob?.reason || '',
      }));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to load employee');
    }
  };

  useEffect(() => { loadInitial(); }, [id]);

  const headerTitle = useMemo(() => {
    return `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Employee Onboarding';
  }, [form.firstName, form.lastName]);

  const validateStep = () => {
    if (step === 1) {
      if (!form.email.trim()) return 'Email is required';
      if (!form.bankAccountNo.trim()) return 'Bank account number is required';
      if (!form.bankIfsc.trim()) return 'IFSC is required';
      return null;
    }
    if (step === 3) {
      if (!form.department) return 'Department is required';
      if (!form.jobProfile) return 'Job Profile is required';
      if (!form.baseSalary) return 'Base salary is required';
      return null;
    }
    return null;
  };

  const saveStep = async (mode = 'next') => {
    const err = validateStep();
    if (err) return alert(err);

    setSaving(true);
    try {
      const payload = new FormData();

      if (step === 1) {
        payload.append('firstName', form.firstName); payload.append('lastName', form.lastName);
        payload.append('email', form.email); payload.append('phone', form.phone);
        // APPEND NEW FIELDS
        payload.append('dob', form.dob);
        payload.append('address', form.address);
        
        payload.append('bankDetails', JSON.stringify({ accountNo: form.bankAccountNo, ifsc: form.bankIfsc, bankName: form.bankName }));
        if (files.aadhar) payload.append('aadhar', files.aadhar);
        if (files.pan) payload.append('pan', files.pan);
        if (files.photo) payload.append('photo', files.photo);
        if (files.appHindi) payload.append('appHindi', files.appHindi);
        if (files.appEnglish) payload.append('appEnglish', files.appEnglish);
        if (files.dl) payload.append('dl', files.dl);
        (files.certificates || []).forEach((f) => payload.append('certificates', f));
        (files.otherKyc || []).forEach((f) => payload.append('otherKyc', f));
      }

      if (step === 2) {
        payload.append('family', JSON.stringify({
          motherName: form.motherName, motherWork: form.motherWork, fatherName: form.fatherName, fatherWork: form.fatherWork,
          maritalStatus: form.maritalStatus, anniversary: form.anniversary || null, spouseName: form.spouseName,
          siblings: (form.siblings || []).filter((s) => (s.name || '').trim() || (s.occupation || '').trim()),
          kids: (form.kids || []).filter((k) => (k.name || '').trim()),
        }));
      }

      if (step === 3) {
        payload.append('department', form.department); payload.append('jobProfile', form.jobProfile);
        payload.append('doj', form.doj || ''); payload.append('wageType', form.wageType); payload.append('baseSalary', form.baseSalary);
      }

      if (step === 4) {
        payload.append('lastJob', JSON.stringify({ company: form.lastCompany, duration: form.lastDuration, role: form.lastRole, reason: form.lastReason }));
      }

      const res = await API.patch(`/employees/${id}/wizard?step=${step}`, payload);
      setEmployee(res.data);
      setMissingFields(res.data.missingFields || []);

      if (step === 1) {
        setFiles({ aadhar: null, pan: null, photo: null, appHindi: null, appEnglish: null, dl: null, certificates: [], otherKyc: [] });
      }

      if (mode === 'exit') { navigate('/personnel'); return; }
      if (step < 4) setStep(step + 1); else navigate('/personnel');
    } catch (e) { console.error(e); alert(e.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const docs = employee?.documents || {};
  const addRow = (key) => {
    if (key === 'siblings') setForm({ ...form, siblings: [...form.siblings, { name: '', occupation: '' }] });
    if (key === 'kids') setForm({ ...form, kids: [...form.kids, { name: '', gender: '', dob: '' }] });
  };
  const removeRow = (key, idx) => {
    if (key === 'siblings') setForm({ ...form, siblings: form.siblings.filter((_, i) => i !== idx) });
    if (key === 'kids') setForm({ ...form, kids: form.kids.filter((_, i) => i !== idx) });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
                <button onClick={() => navigate('/personnel')} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Icons.ChevronLeft />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{headerTitle}</h1>
            </div>
            <div className="flex items-center gap-3 ml-8">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-wider">
                    Step {step} of 4
                </span>
                <span className={`text-xs font-bold flex items-center gap-1 ${employee?.isProfileComplete ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {employee?.isProfileComplete ? <Icons.Check /> : <Icons.Alert />}
                    {employee?.isProfileComplete ? 'Profile Complete' : 'Action Required'}
                </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => saveStep('exit')}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 text-sm shadow-sm transition-all disabled:opacity-60"
            >
              Save & Exit
            </button>
            <button
              onClick={() => saveStep('next')}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? 'Processing...' : step === 4 ? 'Complete Onboarding' : 'Save & Continue'}
              {!saving && <Icons.ChevronRight />}
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Stepper Sidebar */}
          <div className="lg:col-span-3 space-y-3">
            <button onClick={() => setStep(1)} className="w-full">
              <StepPill active={step === 1} done={step > 1} label="Identity & Docs" sub="Bank, KYC, Photos" icon={Icons.User} />
            </button>
            <button onClick={() => setStep(2)} className="w-full">
              <StepPill active={step === 2} done={step > 2} label="Family Tree" sub="Parents, Spouse, Kids" icon={Icons.Users} />
            </button>
            <button onClick={() => setStep(3)} className="w-full">
              <StepPill active={step === 3} done={step > 3} label="Professional" sub="Role, Salary, Dept" icon={Icons.Briefcase} />
            </button>
            <button onClick={() => setStep(4)} className="w-full">
              <StepPill active={step === 4} done={employee?.isProfileComplete} label="History" sub="Previous Experience" icon={Icons.Clock} />
            </button>

            {/* Compliance Widget */}
            <div className={`rounded-xl p-4 mt-6 border ${
                (missingFields || []).length === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
            }`}>
              <div className="flex items-start gap-3">
                  <div className={ (missingFields || []).length === 0 ? 'text-emerald-600' : 'text-rose-500'}>
                      {(missingFields || []).length === 0 ? <Icons.Check /> : <Icons.Alert />}
                  </div>
                  <div>
                      <p className={`font-bold text-sm ${(missingFields || []).length === 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                          {(missingFields || []).length === 0 ? 'All Clear' : 'Compliance Alert'}
                      </p>
                      <p className={`text-[11px] font-medium mt-1 ${(missingFields || []).length === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {(missingFields || []).length === 0 ? 'Payroll ready.' : 'Missing required fields:'}
                      </p>
                      {(missingFields || []).length > 0 && (
                         <ul className="mt-2 space-y-1">
                             {missingFields.map(m => (
                                 <li key={m} className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                                     <span className="w-1 h-1 rounded-full bg-rose-400"></span> {m}
                                 </li>
                             ))}
                         </ul>
                      )}
                  </div>
              </div>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 min-h-[600px]">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Personal & Banking</h2>
                  <p className="text-sm text-slate-500">Core identity details required for payroll processing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="First Name">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </Field>
                  <Field label="Last Name">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  </Field>

                  <Field label="Official Email *">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </Field>
                  <Field label="Phone Number">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>

                  {/* ADDED DATE OF BIRTH */}
                  <Field label="Date of Birth">
                    <input type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                  </Field>

                  {/* ADDED RESIDENTIAL ADDRESS */}
                  <Field label="Residential Address">
                    <textarea rows="1" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </Field>
                </div>

                <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.Briefcase /> Bank Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Account No *">
                      <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" value={form.bankAccountNo} onChange={(e) => setForm({ ...form, bankAccountNo: e.target.value })} />
                    </Field>
                    <Field label="IFSC Code *">
                      <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none" value={form.bankIfsc} onChange={(e) => setForm({ ...form, bankIfsc: e.target.value })} />
                    </Field>
                    <Field label="Bank Name">
                      <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
                    </Field>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Icons.Upload /> Document Repository</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FileCard title="Aadhar Card *" employeeId={id} current={docs.aadhar} onChange={(e) => setFiles({ ...files, aadhar: e.target.files?.[0] || null })} />
                    <FileCard title="PAN Card" employeeId={id} current={docs.pan} onChange={(e) => setFiles({ ...files, pan: e.target.files?.[0] || null })} />
                    <FileCard title="Profile Photo" employeeId={id} current={docs.photo} accept="image/*" onChange={(e) => setFiles({ ...files, photo: e.target.files?.[0] || null })} />
                    <FileCard title="Driving License" employeeId={id} current={docs.dl} onChange={(e) => setFiles({ ...files, dl: e.target.files?.[0] || null })} />
                    <FileCard title="Job App (Hindi)" employeeId={id} current={docs.appHindi} onChange={(e) => setFiles({ ...files, appHindi: e.target.files?.[0] || null })} />
                    <FileCard title="Job App (English)" employeeId={id} current={docs.appEnglish} onChange={(e) => setFiles({ ...files, appEnglish: e.target.files?.[0] || null })} />
                    <FileCard title="Certificates" employeeId={id} current={docs.certificates} multiple onChange={(e) => setFiles({ ...files, certificates: Array.from(e.target.files || []) })} />
                    <FileCard title="Other KYC" employeeId={id} current={docs.otherKyc} multiple onChange={(e) => setFiles({ ...files, otherKyc: Array.from(e.target.files || []) })} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Family Background</h2>
                  <p className="text-sm text-slate-500">Dependent information for insurance and emergency contact.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Mother's Name">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} />
                  </Field>
                  <Field label="Mother's Occupation">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.motherWork} onChange={(e) => setForm({ ...form, motherWork: e.target.value })} />
                  </Field>

                  <Field label="Father's Name">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} />
                  </Field>
                  <Field label="Father's Occupation">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.fatherWork} onChange={(e) => setForm({ ...form, fatherWork: e.target.value })} />
                  </Field>

                  <Field label="Marital Status">
                    <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}>
                      <option>Single</option>
                      <option>Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </Field>
                  <Field label="Anniversary Date">
                    <input type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.anniversary} onChange={(e) => setForm({ ...form, anniversary: e.target.value })} />
                  </Field>

                  <Field label="Spouse Name">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.spouseName} onChange={(e) => setForm({ ...form, spouseName: e.target.value })} />
                  </Field>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Siblings</h3>
                    <button type="button" onClick={() => addRow('siblings')} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">+ Add Sibling</button>
                  </div>
                  <div className="space-y-3">
                    {form.siblings.map((s, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <input className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Name" value={s.name}
                          onChange={(e) => { const next = [...form.siblings]; next[idx] = { ...next[idx], name: e.target.value }; setForm({ ...form, siblings: next }); }}
                        />
                        <input className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Occupation" value={s.occupation}
                          onChange={(e) => { const next = [...form.siblings]; next[idx] = { ...next[idx], occupation: e.target.value }; setForm({ ...form, siblings: next }); }}
                        />
                        <button type="button" onClick={() => removeRow('siblings', idx)} className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 font-bold text-xs transition-colors">
                          <Icons.Trash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Children</h3>
                    <button type="button" onClick={() => addRow('kids')} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">+ Add Child</button>
                  </div>
                  <div className="space-y-3">
                    {form.kids.map((k, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <input className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Name" value={k.name}
                          onChange={(e) => { const next = [...form.kids]; next[idx] = { ...next[idx], name: e.target.value }; setForm({ ...form, kids: next }); }}
                        />
                        <select className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={k.gender}
                          onChange={(e) => { const next = [...form.kids]; next[idx] = { ...next[idx], gender: e.target.value }; setForm({ ...form, kids: next }); }}
                        >
                          <option value="">Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <input type="date" className="md:col-span-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" value={k.dob}
                          onChange={(e) => { const next = [...form.kids]; next[idx] = { ...next[idx], dob: e.target.value }; setForm({ ...form, kids: next }); }}
                        />
                        <button type="button" onClick={() => removeRow('kids', idx)} className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 font-bold text-xs transition-colors">
                          <Icons.Trash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Professional Profile</h2>
                  <p className="text-sm text-slate-500">Configure role, department, and salary structure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Department *">
                    <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                      <option value="">Select Department...</option>
                      {(masters.departments || []).map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </Field>

                  <Field label="Job Profile *">
                    <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={form.jobProfile} onChange={(e) => setForm({ ...form, jobProfile: e.target.value })}>
                      <option value="">Select Role...</option>
                      {(masters.jobProfiles || []).map((j) => <option key={j._id} value={j._id}>{j.name}</option>)}
                    </select>
                  </Field>

                  <Field label="Date of Joining">
                    <input type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.doj} onChange={(e) => setForm({ ...form, doj: e.target.value })} />
                  </Field>

                  <Field label="Wage Type">
                    <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={form.wageType} onChange={(e) => setForm({ ...form, wageType: e.target.value })}>
                      <option value="Monthly">Monthly Salary</option>
                      <option value="Daily">Daily Wage</option>
                    </select>
                  </Field>

                  <Field label="Base Salary (₹) *">
                    <div className="relative">
                        <span className="absolute left-4 top-2.5 text-slate-400 font-bold">₹</span>
                        <input type="number" className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} />
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Employment History</h2>
                  <p className="text-sm text-slate-500">Details of previous employment (if applicable).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Company / Organization">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.lastCompany} onChange={(e) => setForm({ ...form, lastCompany: e.target.value })} />
                  </Field>

                  <Field label="Duration Worked">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 2 Years" value={form.lastDuration} onChange={(e) => setForm({ ...form, lastDuration: e.target.value })} />
                  </Field>

                  <Field label="Designation / Role">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.lastRole} onChange={(e) => setForm({ ...form, lastRole: e.target.value })} />
                  </Field>

                  <Field label="Reason for Leaving">
                    <input className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.lastReason} onChange={(e) => setForm({ ...form, lastReason: e.target.value })} />
                  </Field>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeWizard;