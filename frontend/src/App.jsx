import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { DashboardMain } from './components/DashboardMain';
import { SalesInput } from './components/SalesInput';
import { StockManagement } from './components/StockManagement';
import { PredictionAI } from './components/PredictionAI';
import { Recommendations } from './components/Recommendations';
import { MenuAnalytics } from './components/MenuAnalytics';
import { Reports } from './components/Reports';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

function AppLayout() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'admin');
  const navigate = useNavigate();
  // Menyimpan route path sekarang yang sedang aktif sebagai basis dari activePage styling di Sidebar
  const activePage = window.location.pathname.replace('/', '') || 'dashboard';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleNavigate = (pageId) => {
    navigate(`/${pageId}`);
  };
  
  // Custom logic untuk route access karyawan, tidak boleh ke page tertentu
  const renderDashboardSwitch = () => {
      if (activePage === 'dashboard') return <DashboardMain />;
      if (activePage === 'sales') return <SalesInput />;
      if (activePage === 'stock') return <StockManagement />;
      
      // Jika role adalah karyawan dan mencoba masuk area admin, alihkan ke dashboard
      if (userRole === 'karyawan' && ['prediction', 'recommendations', 'analytics', 'reports'].includes(activePage)) {
         return <Navigate to="/dashboard" replace />;
      }
      
      if (activePage === 'prediction') return <PredictionAI />;
      if (activePage === 'recommendations') return <Recommendations />;
      if (activePage === 'analytics') return <MenuAnalytics />;
      if (activePage === 'reports') return <Reports />;
      
      // Route default not found
      return <DashboardMain />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userRole={userRole}
      />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0 pb-10 sm:pb-0 h-screen overflow-x-hidden">
        {renderDashboardSwitch()}
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
   const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
   return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Komponen Login Wrapper untuk set localStorage
function LoginHandler() {
    const navigate = useNavigate();

    const handleLogin = (user) => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', user.role); // 'admin' atau 'karyawan'
      navigate('/dashboard');
    }

    return <LoginPage onLogin={handleLogin} />
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
         <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginHandler />} />
            
            {/* Main App Routes with layout wrapper */}
            <Route path="/dashboard" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
            <Route path="/sales" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
            <Route path="/stock" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
            <Route path="/prediction" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
            <Route path="/recommendations" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
            
            {/* Fallback routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
         </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
