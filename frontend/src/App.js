import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { ParentProvider } from './context/ParentContext';
import { TeacherProvider } from './context/TeacherContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import LandingPage from './LandingPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminRouter from './components/AdminRouter';
import TeacherProtectedRoute from './components/TeacherProtectedRoute';
import ParentProtectedRoute from './components/ParentProtectedRoute';

const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminMediumSelect = React.lazy(() => import('./pages/AdminMediumSelect'));
const TeacherLogin = React.lazy(() => import('./pages/TeacherLogin'));
const TeacherRegister = React.lazy(() => import('./pages/TeacherRegister'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const ParentLogin = React.lazy(() => import('./pages/ParentLogin'));
const ParentDashboard = React.lazy(() => import('./pages/ParentDashboard'));
const FeePaymentPage = React.lazy(() => import('./pages/FeePaymentPage'));
const PaymentProcessPage = React.lazy(() => import('./pages/PaymentProcessPage'));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-4 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            लोड हो रहा है... / Loading...
          </h3>
          <p className="text-sm text-gray-600">
            कृपया प्रतीक्षा करें / Please wait
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  
  const dashboardRoutes = [
    '/admin/dashboard',
    '/admin/medium-select',
    '/teacher/dashboard',
    '/parent/dashboard',
    '/parent/payment'
  ];
  
  const isDashboardRoute = dashboardRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className="App min-h-screen bg-gray-50">
      {!isDashboardRoute && <Navbar />}
      
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/admin" element={<AdminRouter />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/medium-select" element={
              <AdminProtectedRoute>
                <AdminMediumSelect />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <AdminProtectedRoute requireMediumSelection={true}>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/teacher/register" element={<TeacherRegister />} />
            <Route path="/teacher/dashboard" element={
              <TeacherProtectedRoute>
                <TeacherDashboard />
              </TeacherProtectedRoute>
            } />
            
            <Route path="/parent/login" element={<ParentLogin />} />
            <Route path="/parent/dashboard" element={
              <ParentProtectedRoute>
                <ParentDashboard />
              </ParentProtectedRoute>
            } />
            <Route path="/parent/payment" element={
              <ParentProtectedRoute>
                <FeePaymentPage />
              </ParentProtectedRoute>
            } />
            <Route path="/parent/payment/process" element={
              <ParentProtectedRoute>
                <PaymentProcessPage />
              </ParentProtectedRoute>
            } />
            <Route path="/fee-payment/:studentId" element={<FeePaymentPage />} />
          </Routes>
        </Suspense>
      </main>
      
      {!isDashboardRoute && <Footer />}
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <ParentProvider>
            <TeacherProvider>
              <AppContent />
            </TeacherProvider>
          </ParentProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 