import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireMediumSelection = false }) => {
  const { isAuthenticated, loading, selectedMedium } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireMediumSelection && !selectedMedium) {
    return <Navigate to="/admin/medium" replace />;
  }

  return children;
};

export default ProtectedRoute; 