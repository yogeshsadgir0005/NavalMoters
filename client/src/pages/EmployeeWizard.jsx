import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../api/axios';

const Icons = {
  Check: () => <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Folder: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Upload: () => <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Plus: () => <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
   File: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Alert: () => <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  XCircle: () => <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

const steps = [
  { id: 1, title: 'Identity & Docs', icon: Icons.User, desc: 'Personal info & KYC' },
  { id: 2, title: 'Family Tree', icon: Icons.Users, desc: 'Dependents & Parents' },
  { id: 3, title: 'Professional', icon: Icons.Folder, desc: 'Role & Compensation' },
  { id: 4, title: 'Past History', icon: Icons.Briefcase, desc: 'Previous employment' }
];

const Field = ({ label, children, required }) => (
  <div className="space-y-1 md:space-y-1.5 flex flex-col">
    <label className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const EmployeeWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState(null);
  
  const [toast, setToast] = useState(null); 
  const [isFresher, setIsFresher] = useState(false); 

  const [masters, setMasters] = useState({ departments: [], jobProfiles: [] });
  
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', dob: '', address: '',
    aadharNo: '', panNo: '', bankAccountNo: '', ifsc: '', bankName: '',
    motherName: '', motherWork: '', fatherName: '', fatherWork: '',
    maritalStatus: '', spouseName: '', anniversary: '',
    siblings: [], kids: [],
    department: '', jobProfile: '', wageType: 'Monthly', baseSalary: '',
    lastCompany: '', lastDuration: '', lastRole: '', lastReason: '',
  });

  const [files, setFiles] = useState({});
  const [existingDocs, setExistingDocs] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const showToast = (message, type = 'error') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4500); 
  };

  const fetchData = async () => {
    try {
      const [empRes, mastersRes] = await Promise.all([
        API.get(`/employees/${id}`),
        API.get('/masters')
      ]);
      const data = empRes.data;
      setMasters(mastersRes.data);

      const isSavedFresher = data.lastJob?.company === 'Fresher';
      setIsFresher(isSavedFresher);

      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        address: data.address || '',
        aadharNo: data.documents?.aadharNo || data.documents?.aadharNumber || '',
        panNo: data.documents?.panNo || data.documents?.panNumber || '',
        bankAccountNo: data.bankDetails?.accountNo || '',
        ifsc: data.bankDetails?.ifsc || '',
        bankName: data.bankDetails?.bankName || '',
        
        motherName: data.family?.motherName || '',
        motherWork: data.family?.motherWork || '',
        fatherName: data.family?.fatherName || '',
        fatherWork: data.family?.fatherWork || '',
        maritalStatus: data.family?.maritalStatus || '',
        spouseName: data.family?.spouseName || '',
        anniversary: data.family?.anniversary ? data.family.anniversary.split('T')[0] : '',
        siblings: data.family?.siblings || [],
        kids: data.family?.kids || [],

        department: data.department?._id || data.department || location.state?.department || '',
        jobProfile: data.jobProfile?._id || data.jobProfile || location.state?.jobProfile || '',
        wageType: data.wageType || 'Monthly',
        baseSalary: data.baseSalary || '',

        lastCompany: isSavedFresher ? '' : (data.lastJob?.company || ''),
        lastDuration: isSavedFresher ? '' : (data.lastJob?.duration || ''),
        lastRole: isSavedFresher ? '' : (data.lastJob?.role || ''),
        lastReason: isSavedFresher ? '' : (data.lastJob?.reason || ''),
      });

      if (data.documents) {
          setExistingDocs(data.documents);
      }
    } catch (e) {
      setPageError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = (stepId) => {
    switch(stepId) {
        case 1:
            const hasDocs =
                (files.photo || existingDocs.photo) &&
                (files.aadhar || existingDocs.aadhar) &&
                (files.pan || existingDocs.pan) &&
                (files.bankProof || existingDocs.bankProof);
            return !!(
                form.firstName?.trim() && form.lastName?.trim() &&
                form.email?.trim() && isValidEmail(form.email) && 
                form.phone?.trim() && form.dob && form.address?.trim() &&
                form.bankAccountNo?.trim() && form.ifsc?.trim() &&
                form.bankName?.trim() &&
                hasDocs
            );
        case 2:
            const baseS2 = !!(
                form.motherName?.trim() && form.motherWork?.trim() &&
                form.fatherName?.trim() && form.fatherWork?.trim() &&
                form.maritalStatus
            );
            if (!baseS2) return false;
            if (form.maritalStatus === 'Married') {
                return !!form.spouseName?.trim();
            }
            return true;
        case 3:
            return !!(
                form.department && form.jobProfile &&
                form.wageType && String(form.baseSalary).trim() !== ''
            );
        case 4:
            if (isFresher) return true;
            return !!(
                form.lastCompany?.trim() && form.lastDuration?.trim() &&
                form.lastRole?.trim() && form.lastReason?.trim()
            );
        default:
            return false;
    }
  };

  const completedCount = steps.filter(s => isStepComplete(s.id)).length;
  const progress = (completedCount / steps.length) * 100;

  const handleFileChange = (e, fieldName) => {
    if (e.target.files.length > 0) {
      setFiles({ ...files, [fieldName]: e.target.files });
    }
  };

  const handleArrayAdd = (field, defaultObj) => {
    setForm({ ...form, [field]: [...form[field], defaultObj] });
  };

  const handleArrayChange = (field, index, key, value) => {
    const newArr = [...form[field]];
    newArr[index][key] = value;
    setForm({ ...form, [field]: newArr });
  };

  const handleArrayRemove = (field, index) => {
    const newArr = [...form[field]];
    newArr.splice(index, 1);
    setForm({ ...form, [field]: newArr });
  };

  const handleFresherToggle = (e) => {
      const checked = e.target.checked;
      setIsFresher(checked);
      if (checked) {
          setForm(prev => ({ ...prev, lastCompany: '', lastDuration: '', lastRole: '', lastReason: '' }));
      }
  };

  const saveStep = async (stepNum) => {
    if (stepNum === 1) {
        if (!form.email || !isValidEmail(form.email)) {
            showToast("Please enter a valid email address format.", "error");
            throw new Error("Validation Error");
        }
        if (form.phone && form.phone.replace(/\D/g, '').length < 10) {
            showToast("Please enter a valid phone number with at least 10 digits.", "error");
            throw new Error("Validation Error");
        }
        if (form.bankAccountNo && form.bankAccountNo.length < 6) {
            showToast("Please enter a valid numeric bank account number.", "error");
            throw new Error("Validation Error");
        }
        if (form.ifsc && form.ifsc.length !== 11) {
            showToast("IFSC code must be exactly 11 characters long.", "error");
            throw new Error("Validation Error");
        }
    }

    setSaving(true);
    const fd = new FormData();
    
    fd.append('firstName', form.firstName);
    fd.append('lastName', form.lastName);
    fd.append('email', form.email); 
    fd.append('phone', form.phone);
    fd.append('dob', form.dob ? form.dob : '');
    fd.append('address', form.address);
    
    fd.append('bankDetails', JSON.stringify({
      accountNo: form.bankAccountNo,
      ifsc: form.ifsc,
      bankName: form.bankName
    }));

    fd.append('family', JSON.stringify({
      motherName: form.motherName,
      motherWork: form.motherWork,
      fatherName: form.fatherName,
      fatherWork: form.fatherWork,
      maritalStatus: form.maritalStatus,
      spouseName: form.maritalStatus === 'Married' ? form.spouseName : '',
      anniversary: form.maritalStatus === 'Married' && form.anniversary ? form.anniversary : null
    }));

    fd.append('siblings', JSON.stringify(form.siblings));
    fd.append('kids', JSON.stringify(form.maritalStatus === 'Single' ? [] : form.kids));

    if (form.department) fd.append('department', form.department);
    if (form.jobProfile) fd.append('jobProfile', form.jobProfile);
    fd.append('wageType', form.wageType);
    if (form.baseSalary) fd.append('baseSalary', form.baseSalary);

    fd.append('lastJob', JSON.stringify({
      company: isFresher ? 'Fresher' : form.lastCompany,
      duration: isFresher ? 'N/A' : form.lastDuration,
      role: isFresher ? 'N/A' : form.lastRole,
      reason: isFresher ? 'N/A' : form.lastReason
    }));

    Object.keys(files).forEach(k => {
      const fileList = files[k];
      for (let i = 0; i < fileList.length; i++) {
        fd.append(k, fileList[i]);
      }
    });

    try {
      const res = await API.patch(`/employees/${id}/wizard?step=${stepNum}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFiles({});
      if (res.data && res.data.documents) {
          setExistingDocs(res.data.documents);
      }
    } catch (e) {
      if(e.message !== "Validation Error") {
        showToast(e.response?.data?.message || "An unexpected error occurred while saving.", "error");
      }
      throw e; 
    } finally {
      setSaving(false);
    }
  };

  const nextStep = async () => {
    try {
      await saveStep(currentStep);
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    } catch (e) {}
  };

  const prevStep = async () => {
    try {
      await saveStep(currentStep);
      if (currentStep > 1) setCurrentStep(currentStep - 1);
    } catch (e) {}
  };

  const finishWizard = async () => {
    try {
      await saveStep(currentStep);
      navigate(`/personnel/${id}`);
    } catch (e) {}
  };

  const goToStep = async (stepId) => {
      if (stepId === currentStep) return;
      try {
          await saveStep(currentStep);
          setCurrentStep(stepId);
      } catch (e) {}
  };

  const FileUploader = ({ label, fieldName, multiple, required }) => {
    const docValue = existingDocs[fieldName];
    const isUploaded = Array.isArray(docValue) ? docValue.length > 0 : !!docValue;

    return (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 md:p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-colors group relative bg-slate-50/50">
            <input 
                type="file" 
                multiple={multiple}
                onChange={(e) => handleFileChange(e, fieldName)} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white shadow-sm rounded-lg text-blue-500 group-hover:scale-110 transition-transform shrink-0">
                    <Icons.Upload />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-bold text-slate-700 truncate">
                        {label} {required && <span className="text-rose-500">*</span>}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 mt-0.5 truncate">
                        {files[fieldName] 
                            ? `${files[fieldName].length} file(s) selected` 
                            : (isUploaded ? 'File already uploaded (Upload to replace)' : 'PDF, JPG, PNG up to 5MB')}
                    </p>
                </div>
                {isUploaded && !files[fieldName] && (
                    <div className="bg-emerald-100 text-emerald-700 p-1 md:p-1.5 rounded-md shrink-0"><Icons.Check /></div>
                )}
            </div>
        </div>
    );
  };

  if (loading) return <Layout><div className="p-20 text-center text-slate-500 font-medium animate-pulse text-sm">Loading Wizard Data...</div></Layout>;

  return (
    <Layout>
      {toast && (
          <div className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] sm:w-auto px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-2xl flex items-center gap-2 md:gap-3 animate-in fade-in slide-in-from-top-4 border ${
              toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
              <div className="mt-0.5 shrink-0">{toast.type === 'error' ? <Icons.Alert /> : <Icons.Check />}</div>
              <div className="font-bold text-xs md:text-sm tracking-wide">{toast.message}</div>
              <button onClick={() => setToast(null)} className={`ml-auto sm:ml-4 p-1 rounded-full transition-colors shrink-0 ${toast.type === 'error' ? 'hover:bg-rose-100 text-rose-500' : 'hover:bg-emerald-100 text-emerald-500'}`}>
                  <Icons.XCircle />
              </button>
          </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Onboarding Wizard</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">Complete profile details for <strong className="text-slate-700">{form.firstName} {form.lastName}</strong></p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 lg:sticky lg:top-8">
                <div className="mb-5 md:mb-6">
                    <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <span>Progress</span>
                        <span className="text-blue-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="space-y-2">
                    {steps.map((s, idx) => {
                        const isComplete = isStepComplete(s.id);
                        const isActive = currentStep === s.id;
                        
                        return (
                        <div key={s.id} className="relative">
                            {idx !== steps.length - 1 && !isComplete && (
                                <div className="absolute left-3.5 md:left-4 top-8 md:top-10 w-0.5 h-6 -ml-px transition-colors bg-slate-100"></div>
                            )}
                            <button 
                                onClick={() => goToStep(s.id)}
                                className={`w-full text-left flex items-start gap-3 md:gap-4 p-2 md:p-3 rounded-xl transition-all ${
                                    isActive ? 'bg-blue-50/50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'
                                }`}
                            >
                                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all mt-0.5 shrink-0 ${
                                    isComplete ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 
                                    isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 
                                    'bg-slate-100 text-slate-400'
                                }`}>
                                    {isComplete ? <Icons.Check /> : s.id}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-xs md:text-sm ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>{s.title}</h3>
                                    <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider mt-0.5 md:mt-1 ${isComplete ? 'text-emerald-500' : isActive ? 'text-blue-500' : 'text-slate-400'}`}>
                                        {isComplete ? 'Completed' : 'Pending'}
                                    </p>
                                </div>
                            </button>
                        </div>
                    )})}
                </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px] md:min-h-[600px]">
              
              <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 md:gap-4 shrink-0">
                  <div className="p-2.5 md:p-3 bg-white border border-slate-200 shadow-sm rounded-lg text-blue-600 shrink-0">
                      {steps[currentStep-1].icon()}
                  </div>
                  <div>
                      <h2 className="text-base md:text-xl font-bold text-slate-800">{steps[currentStep-1].title}</h2>
                      <p className="text-xs md:text-sm text-slate-500">{steps[currentStep-1].desc}</p>
                  </div>
              </div>

              <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-white">
                
                {currentStep === 1 && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-6">
                      <Field label="First Name" required><input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
                      <Field label="Last Name" required><input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
                      
                      <Field label="Email Address" required><input type="email" className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                      
                      <Field label="Phone Number" required><input type="text" className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+]/g, '') })} /></Field>
                      
                      <Field label="Date of Birth" required><input type="date" className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field>
                      <Field label="Full Address" required><input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
                    </div>

                    <div className="border-t border-slate-100 pt-6 md:pt-8">
                        <h3 className="font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base"><span className="w-1 h-3 md:h-4 bg-blue-600 rounded-full"></span> Banking Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            <Field label="Bank Name" required><input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></Field>
                            <Field label="Account Number" required><input type="text" className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.bankAccountNo} onChange={(e) => setForm({ ...form, bankAccountNo: e.target.value.replace(/\D/g, '') })} /></Field>
                            <Field label="IFSC Code" required><input type="text" className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} /></Field>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 md:pt-8">
                        <h3 className="font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base"><span className="w-1 h-3 md:h-4 bg-blue-600 rounded-full"></span> Mandatory Documents</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <FileUploader label="Profile Photo" fieldName="photo" required={true} />
                            <FileUploader label="Aadhar Card" fieldName="aadhar" required={true} />
                            <FileUploader label="PAN Card" fieldName="pan" required={true} />
                            <FileUploader label="Bank Proof (Passbook/Cheque)" fieldName="bankProof" required={true} />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 md:pt-8">
                        <h3 className="font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base"><span className="w-1 h-3 md:h-4 bg-slate-400 rounded-full"></span> Optional Documents</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <FileUploader label="Driving License" fieldName="dl" />
                            <FileUploader label="Application (Hindi)" fieldName="appHindi" />
                            <FileUploader label="Application (English)" fieldName="appEnglish" />
                            <FileUploader label="Certificates / Degrees" fieldName="certificates" multiple />
                            <FileUploader label="Other KYC / Resignation Letters" fieldName="otherKyc" multiple />
                        </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-6">
                      <Field label="Mother's Name" required><input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.motherName} onChange={(e) => setForm({ ...form, motherName: e.target.value })} /></Field>
                      <Field label="Mother's Occupation" required><input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.motherWork} onChange={(e) => setForm({ ...form, motherWork: e.target.value })} /></Field>
                      <Field label="Father's Name" required><input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} /></Field>
                      <Field label="Father's Occupation" required><input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.fatherWork} onChange={(e) => setForm({ ...form, fatherWork: e.target.value })} /></Field>
                      
                      <Field label="Marital Status" required>
                        <select className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer" value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}>
                          <option value="">— Select Status —</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </Field>

                      {form.maritalStatus === 'Married' && (
                        <>
                          <Field label="Spouse Name" required>
                            <input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.spouseName} onChange={(e) => setForm({ ...form, spouseName: e.target.value })} />
                          </Field>
                          <Field label="Anniversary Date">
                            <input type="date" className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.anniversary} onChange={(e) => setForm({ ...form, anniversary: e.target.value })} />
                          </Field>
                        </>
                      )}
                      
                      {form.maritalStatus && form.maritalStatus !== 'Single' && (
                          <div className="md:col-span-2 space-y-3 md:space-y-4 mt-2 md:mt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2 sm:gap-0">
                                <h4 className="font-bold text-slate-700 text-xs md:text-sm">Children Details</h4>
                                <button onClick={() => handleArrayAdd('kids', { name: '', gender: 'Male', dob: '' })} className="text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center sm:justify-start gap-1 bg-blue-50 px-2 md:px-3 py-1 md:py-1.5 rounded-md transition-colors w-full sm:w-auto">
                                    <Icons.Plus /> Add Child
                                </button>
                            </div>
                            {form.kids.map((kid, i) => (
                                <div key={i} className="flex flex-col sm:flex-row gap-2 md:gap-3 items-start sm:items-center bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100 relative group">
                                    <div className="flex-1 space-y-2 md:space-y-3 w-full">
                                        <input placeholder="Child's Full Name" className="w-full px-3 py-2 border border-slate-200 rounded text-xs md:text-sm focus:border-blue-500 outline-none" value={kid.name} onChange={(e) => handleArrayChange('kids', i, 'name', e.target.value)} />
                                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                                            <select className="w-full sm:w-1/2 px-3 py-2 border border-slate-200 rounded text-xs md:text-sm focus:border-blue-500 outline-none bg-white" value={kid.gender} onChange={(e) => handleArrayChange('kids', i, 'gender', e.target.value)}>
                                                <option>Male</option><option>Female</option><option>Other</option>
                                            </select>
                                            <input type="date" className="w-full sm:w-1/2 px-3 py-2 border border-slate-200 rounded text-xs md:text-sm focus:border-blue-500 outline-none bg-white" value={kid.dob} onChange={(e) => handleArrayChange('kids', i, 'dob', e.target.value)} />
                                        </div>
                                    </div>
                                    <button onClick={() => handleArrayRemove('kids', i)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors self-end sm:self-auto"><Icons.Trash /></button>
                                </div>
                            ))}
                            {form.kids.length === 0 && <p className="text-[10px] md:text-xs text-slate-400 italic">No children added.</p>}
                          </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-6 md:pt-8 space-y-3 md:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2 sm:gap-0">
                            <h4 className="font-bold text-slate-700 text-xs md:text-sm">Siblings Details</h4>
                            <button onClick={() => handleArrayAdd('siblings', { name: '', occupation: '' })} className="text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center sm:justify-start gap-1 bg-blue-50 px-2 md:px-3 py-1 md:py-1.5 rounded-md transition-colors w-full sm:w-auto">
                                <Icons.Plus /> Add Sibling
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {form.siblings.map((sib, i) => (
                                <div key={i} className="flex gap-2 md:gap-3 items-center bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100">
                                    <div className="flex-1 space-y-2">
                                        <input placeholder="Sibling Name" className="w-full px-3 py-2 border border-slate-200 rounded text-xs md:text-sm focus:border-blue-500 outline-none" value={sib.name} onChange={(e) => handleArrayChange('siblings', i, 'name', e.target.value)} />
                                        <input placeholder="Occupation" className="w-full px-3 py-2 border border-slate-200 rounded text-xs md:text-sm focus:border-blue-500 outline-none" value={sib.occupation} onChange={(e) => handleArrayChange('siblings', i, 'occupation', e.target.value)} />
                                    </div>
                                    <button onClick={() => handleArrayRemove('siblings', i)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Icons.Trash /></button>
                                </div>
                            ))}
                        </div>
                        {form.siblings.length === 0 && <p className="text-[10px] md:text-xs text-slate-400 italic">No siblings added.</p>}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-6">
                      
                      <Field label="Department" required>
                        <select className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                          <option value="">— Assign Department —</option>
                          {masters.departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                      </Field>

                      <Field label="Job Profile" required>
                        <select className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={form.jobProfile} onChange={(e) => setForm({ ...form, jobProfile: e.target.value })}>
                          <option value="">— Assign Role —</option>
                          {masters.jobProfiles.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                        </select>
                      </Field>

                      <Field label="Wage Type" required>
                        <div className="grid grid-cols-2 gap-2 md:gap-3 mt-0.5 md:mt-1">
                            {['Monthly', 'Daily'].map(type => (
                                <button
                                    key={type} type="button"
                                    onClick={() => setForm({...form, wageType: type})}
                                    className={`py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold border transition-all ${form.wageType === type ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                      </Field>

                      <Field label={`Base Salary (${form.wageType})`} required>
                        <div className="relative">
                            <span className="absolute left-3 md:left-4 top-2 md:top-2.5 text-slate-500 font-bold text-xs md:text-base">₹</span>
                            <input type="text" className="w-full pl-7 md:pl-8 pr-3 md:pr-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value.replace(/[^\d.]/g, '') })} />
                        </div>
                      </Field>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                            <div>
                                <h3 className="font-bold text-blue-900 mb-0.5 md:mb-1 text-sm md:text-base">Previous Employment</h3>
                                <p className="text-[10px] md:text-xs text-blue-700">Provide details of the last organization worked at.</p>
                            </div>
                            <label className="flex items-center justify-center sm:justify-start gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm hover:bg-blue-50 transition-colors w-full sm:w-auto">
                                <input type="checkbox" className="w-3.5 h-3.5 md:w-4 md:h-4 rounded text-blue-600 focus:ring-blue-500" checked={isFresher} onChange={handleFresherToggle} />
                                <span className="text-xs md:text-sm font-bold text-slate-700">I am a Fresher</span>
                            </label>
                        </div>
                        
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-6 transition-opacity ${isFresher ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Field label="Company / Organization">
                                <input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" placeholder="e.g. Tata Motors" value={form.lastCompany} onChange={(e) => setForm({ ...form, lastCompany: e.target.value })} />
                            </Field>

                            <Field label="Designation / Role">
                                <input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" placeholder="e.g. Senior Technician" value={form.lastRole} onChange={(e) => setForm({ ...form, lastRole: e.target.value })} />
                            </Field>

                            <Field label="Duration Worked">
                                <input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" placeholder="e.g. 2 Years 4 Months" value={form.lastDuration} onChange={(e) => setForm({ ...form, lastDuration: e.target.value })} />
                            </Field>

                            <Field label="Reason for Leaving">
                                <input className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-slate-200 rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm" placeholder="e.g. Better Opportunity" value={form.lastReason} onChange={(e) => setForm({ ...form, lastReason: e.target.value })} />
                            </Field>
                        </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center shrink-0 gap-3 sm:gap-0">
                {currentStep > 1 ? (
                  <button onClick={prevStep} disabled={saving} className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold text-xs md:text-sm hover:bg-slate-50 transition-all disabled:opacity-50 text-center">
                    Back
                  </button>
                ) : <div className="hidden sm:block"></div>}
                
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
                  <button onClick={() => saveStep(currentStep)} disabled={saving} className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs md:text-sm transition-all disabled:opacity-50 text-center">
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  
                  {currentStep < 4 ? (
                    <button onClick={nextStep} disabled={saving} className="w-full sm:w-auto justify-center px-6 md:px-8 py-2 md:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm shadow-md shadow-blue-100 flex items-center gap-2 transition-all disabled:opacity-50">
                      Next Step <Icons.ArrowRight />
                    </button>
                  ) : (
                    <button onClick={finishWizard} disabled={saving} className="w-full sm:w-auto justify-center px-6 md:px-8 py-2 md:py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-100 flex items-center gap-2 transition-all disabled:opacity-50">
                      <Icons.Check /> Finish Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeWizard;