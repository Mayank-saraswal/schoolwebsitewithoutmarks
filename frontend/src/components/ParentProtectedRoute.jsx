import React from 'react';
import { Navigate } from 'react-router-dom';
import { useParent } from '../context/ParentContext';

const ParentProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useParent();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/parent/login" replace />;
  }

  return children;
};

export default ParentProtectedRoute; 