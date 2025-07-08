import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TeacherProtectedRoute = ({ children }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifying access... / पहुंच सत्यापित हो रही है...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has teacher role
  if (!isAuthenticated || !hasRole('teacher')) {
    return (
      <Navigate 
        to="/teacher/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // User is authenticated and is a teacher, render the children
  return children;
};

export default TeacherProtectedRoute; 