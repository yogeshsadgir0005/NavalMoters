import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Personnel from './pages/Personnel';
import EmployeeDetail from './pages/EmployeeDetail';
import EmployeeWizard from './pages/EmployeeWizard';
import Masters from './pages/Masters';
import AdminUserManagement from './pages/AdminUserManagement';
import MySpace from './pages/MySpace';
import AttendanceLog from './pages/AttendanceLog';
import SalaryReport from './pages/SalaryReport';
import TerminatedEmployees from './pages/TerminatedEmployees'; // <-- NEW IMPORT

const ProtectedRoute = ({ children, roles }) => {
  const { user, ready } = useAuth();

  if (!ready) return null;

  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Admin & HR Routes */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['ADMIN', 'HR']}><Dashboard /></ProtectedRoute>} />
          <Route path="/personnel" element={<ProtectedRoute roles={['ADMIN', 'HR']}><Personnel /></ProtectedRoute>} />
          <Route path="/personnel/:id" element={<ProtectedRoute roles={['ADMIN', 'HR']}><EmployeeDetail /></ProtectedRoute>} />
          <Route path="/terminated" element={<ProtectedRoute roles={['ADMIN', 'HR']}><TerminatedEmployees /></ProtectedRoute>} /> {/* <-- NEW ROUTE */}
          <Route path="/masters" element={<ProtectedRoute roles={['ADMIN', 'HR']}><Masters /></ProtectedRoute>} />
          <Route path="/wizard/:id" element={<ProtectedRoute roles={['ADMIN', 'HR']}><EmployeeWizard /></ProtectedRoute>} />
          
          {/* Admin Only */}
          <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUserManagement /></ProtectedRoute>} />

          {/* Employee Route */}
          <Route path="/myspace" element={<ProtectedRoute roles={['EMPLOYEE']}><MySpace /></ProtectedRoute>} />
          
          {/* Shared Reports */}
          <Route path="/attendance" element={<ProtectedRoute roles={['ADMIN', 'HR']}><AttendanceLog /></ProtectedRoute>} />
          <Route path="/salary-report" element={<ProtectedRoute roles={['ADMIN', 'HR']}><SalaryReport /></ProtectedRoute>} />
          
          {/* Catch all 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;