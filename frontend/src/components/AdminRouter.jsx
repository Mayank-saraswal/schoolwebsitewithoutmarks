import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import AdminLogin from '../pages/AdminLogin';

const AdminRouter = () => {
  const { isAuthenticated, loading, selectedMedium } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (selectedMedium) {
        // User is authenticated and has selected medium - redirect to dashboard
        navigate('/admin/dashboard', { replace: true });
      } else {
        // User is authenticated but hasn't selected medium - redirect to medium selection
        navigate('/admin/medium-select', { replace: true });
      }
    }
  }, [isAuthenticated, loading, selectedMedium, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="text-blue-200 mt-4">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // This component will handle the redirect via useEffect
  return null;
};

export default AdminRouter; 