import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const AdminProtectedRoute = ({ children, requireMediumSelection = false }) => {
  const { isAuthenticated, loading, selectedMedium } = useAdmin();

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

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (requireMediumSelection && !selectedMedium) {
    return <Navigate to="/admin/medium-select" replace />;
  }

  return children;
};

export default AdminProtectedRoute; 