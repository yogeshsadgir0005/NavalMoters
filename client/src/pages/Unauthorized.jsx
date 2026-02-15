import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-8v4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h1>
        <p className="text-slate-500 mb-8">
          You do not have permission to view this page. This area is restricted to authorized personnel only.
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3 px-4 bg-white border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;