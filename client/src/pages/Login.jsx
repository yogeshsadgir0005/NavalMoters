import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// --- ICONS ---
const Icons = {
  Mail: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Key: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Shield: () => <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
};

const Login = () => {
  const { loginAdmin, requestOtp, verifyOtp } = useAuth();
  
  // Default/Priority is Password login. Users can switch to OTP.
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (loginMethod === 'password') {
        // Handle Password Login (Strictly for Admin/HR)
        await loginAdmin(email, password);
      } else {
        // Handle Universal OTP Login
        if (!otpSent) {
          await requestOtp(email);
          setOtpSent(true);
        } else {
          await verifyOtp(email, otp);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication Failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMethod = () => {
    setLoginMethod(prev => prev === 'otp' ? 'password' : 'otp');
    setOtpSent(false);
    setOtp('');
    setPassword('');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex w-5/12 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/90 font-bold tracking-widest uppercase text-sm mb-8">
                <span className="w-8 h-0.5 bg-blue-500"></span> Enterprise Portal
            </div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
                NAVAL<span className="text-blue-500">MOTOR</span>
            </h1>
            <p className="text-slate-400 mt-4 max-w-sm text-lg leading-relaxed">
                Seamless workforce management, attendance tracking, and secure payroll processing.
            </p>
        </div>

        <div className="relative z-10 text-slate-500 text-xs font-medium">
            © {new Date().getFullYear()} Naval Motor. Internal Use Only.
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-slate-50/30">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          
          <div className="mb-10">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <Icons.Shield />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {loginMethod === 'password' ? 'Admin / HR Access' : 'Secure OTP Access'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
                {loginMethod === 'password' 
                    ? 'Sign in using your administrative password.' 
                    : 'Enter your work email to receive a secure login code.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field (Always visible) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Icons.Mail />
                </div>
                <input 
                  type="email" 
                  required
                  disabled={loginMethod === 'otp' && otpSent}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="name@navalmotor.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            {/* Password Field (Priority View) */}
            {loginMethod === 'password' && (
              <div className="space-y-1.5 animate-in fade-in duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Icons.Lock />
                    </div>
                    <input 
                        type="password" 
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>
              </div>
            )}

            {/* OTP Field (Shows only in OTP mode after code is sent) */}
            {loginMethod === 'otp' && otpSent && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">One-Time Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Icons.Key />
                  </div>
                  <input 
                      type="text" 
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-center tracking-[0.5em] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal"
                      placeholder="000000" 
                      maxLength={6}
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium ml-1 mt-2">Code sent to {email}</p>
              </div>
            )}

            <button 
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-sm uppercase tracking-wide shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                  <>
                    {loginMethod === 'password' ? 'Sign In' : (otpSent ? 'Verify & Enter' : 'Send Access Code')}
                    {!loading && <Icons.ArrowRight />}
                  </>
              )}
            </button>
          </form>
          
          {/* Bottom Toggle Between Methods */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
              <button 
                  type="button"
                  onClick={toggleMethod}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider"
              >
                  {loginMethod === 'password' ? 'Employee? Switch to OTP Login' : 'Admin/HR? Switch to Password Login'}
              </button>

              {loginMethod === 'otp' && otpSent && (
                  <button 
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(''); }}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors underline"
                  >
                      Wrong email or didn't receive code?
                  </button>
              )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;