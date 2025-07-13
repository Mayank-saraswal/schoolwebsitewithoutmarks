import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const AdminLogin = () => {
  const { login, isAuthenticated, hasSelectedMedium, loading, error, clearError } = useAdmin();
  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      if (hasSelectedMedium) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/admin/medium-select', { replace: true });
      }
    }
  }, [isAuthenticated, hasSelectedMedium, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.adminId.trim() || !formData.password.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(formData.adminId.trim(), formData.password);
      
      if (result.success) {
        // Redirect to medium selection
        navigate('/admin/medium-select', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = loading || isSubmitting;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-blue-200">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
            <img 
              src="https://allpngfree.com/apf-prod-storage-api/storage/thumbnails/saraswati-png-image-download-thumbnail-1643211966.jpg" 
              alt="Saraswati School Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            व्यवस्थापक प्रवेश / Administrator Access
          </p>
          <p className="mt-1 text-xs text-blue-300">
            Saraswati School Management Portal
          </p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Admin ID Field */}
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">
                Admin ID / व्यवस्थापक आईडी <span className="text-red-500">*</span>
              </label>
              <input
                id="adminId"
                name="adminId"
                type="text"
                required
                disabled={isFormDisabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                placeholder="Enter admin ID"
                value={formData.adminId}
                onChange={handleChange}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password / पासवर्ड <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isFormDisabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isFormDisabled}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  लॉगिन हो रहे हैं... / Logging in...
                </>
              ) : (
                'लॉगिन करें / Sign In'
              )}
            </button>
          </form>

          {/* Development Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              🔐 Default Credentials
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
             
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Use these credentials to access the admin panel
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-blue-200">Saraswati School Management System</p>
          <p className="text-xs text-blue-300 mt-1">© 2025 Saraswati School. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 