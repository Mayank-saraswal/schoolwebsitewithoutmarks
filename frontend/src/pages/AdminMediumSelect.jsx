import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const AdminMediumSelect = () => {
  const { 
    isAuthenticated, 
    admin, 
    selectedMedium,
    loading, 
    setMedium, 
    logout 
  } = useAdmin();
  
  const [isSelecting, setIsSelecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is coming from change medium button
  const isChangingMedium = location.state?.changeMedium === true;

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Redirect if medium is already selected (but not if user is changing medium)
  useEffect(() => {
    if (isAuthenticated && selectedMedium && !isChangingMedium) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, selectedMedium, isChangingMedium, navigate]);

  const handleMediumSelect = async (medium) => {
    if (isSelecting) return;
    
    setIsSelecting(true);
    
    try {
      setMedium(medium);
      
      // Show confirmation for medium change
      if (isChangingMedium) {
        console.log(`Medium changed from ${selectedMedium} to ${medium}`);
      }
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Navigate to dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      console.error('Medium selection error:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-indigo-200">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-xl">
            <span className="text-4xl">🏫</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            {isChangingMedium ? 'Change School Medium' : 'Select School Medium'}
          </h2>
          <p className="mt-2 text-lg text-indigo-200">
            {isChangingMedium 
              ? 'स्कूल माध्यम बदलें / Change the school branch to manage'
              : 'स्कूल माध्यम चुनें / Choose the school branch to manage'
            }
          </p>
          
          {/* Welcome message */}
          <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-4">
            <p className="text-indigo-100">
              <span className="font-medium">
                {isChangingMedium ? 'Changing medium for' : 'Welcome'}, {admin?.name || 'Administrator'}
              </span>
            </p>
            <p className="text-sm text-indigo-200 mt-1">
              {isChangingMedium 
                ? `Currently: ${selectedMedium} Medium • Choose a different medium below`
                : 'स्वागत है / Please select which medium you want to manage'
              }
            </p>
            {isChangingMedium && (
              <p className="text-xs text-yellow-200 mt-2 bg-yellow-600 bg-opacity-20 rounded px-2 py-1">
                ⚠️ Changing medium will filter all data accordingly
              </p>
            )}
          </div>
        </div>

        {/* Medium Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hindi Medium */}
          <button
            onClick={() => handleMediumSelect('Hindi')}
            disabled={isSelecting}
            className={`group relative rounded-xl shadow-2xl p-8 hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedMedium === 'Hindi' && isChangingMedium
                ? 'bg-orange-50 border-4 border-orange-400'
                : 'bg-white'
            }`}
          >
            {selectedMedium === 'Hindi' && isChangingMedium && (
              <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Current / वर्तमान
              </div>
            )}
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white font-bold">हि</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Hindi Medium
              </h3>
              <p className="text-lg text-orange-600 font-semibold mb-2">
                हिन्दी माध्यम
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                हिन्दी माध्यम के छात्रों, शिक्षकों और पाठ्यक्रम का प्रबंधन करें
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Manage Hindi medium students, teachers, and curriculum
              </p>
              
              {/* Features */}
              <div className="mt-4 space-y-1 text-xs text-gray-500">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  Hindi Medium Students & Teachers
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                  Hindi Content Management
                </div>
              </div>
            </div>
            
            {/* Loading indicator for this option */}
            {isSelecting && (
              <div className="absolute inset-0 bg-white bg-opacity-50 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            )}
          </button>

          {/* English Medium */}
          <button
            onClick={() => handleMediumSelect('English')}
            disabled={isSelecting}
            className={`group relative rounded-xl shadow-2xl p-8 hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedMedium === 'English' && isChangingMedium
                ? 'bg-blue-50 border-4 border-blue-400'
                : 'bg-white'
            }`}
          >
            {selectedMedium === 'English' && isChangingMedium && (
              <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Current / वर्तमान
              </div>
            )}
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white font-bold">En</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                English Medium
              </h3>
              <p className="text-lg text-blue-600 font-semibold mb-2">
                अंग्रेजी माध्यम
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Manage English medium students, teachers, and curriculum
              </p>
              <p className="text-gray-500 text-xs mt-2">
                अंग्रेजी माध्यम के छात्रों, शिक्षकों और पाठ्यक्रम का प्रबंधन करें
              </p>
              
              {/* Features */}
              <div className="mt-4 space-y-1 text-xs text-gray-500">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  English Medium Students & Teachers
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  English Content Management
                </div>
              </div>
            </div>
            
            {/* Loading indicator for this option */}
            {isSelecting && (
              <div className="absolute inset-0 bg-white bg-opacity-50 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-3">
              📋 Important Information / महत्वपूर्ण जानकारी
            </h3>
            <div className="text-sm text-indigo-200 space-y-2">
              <p>• आप जो माध्यम चुनेंगे, उसके अनुसार ही डेटा दिखाई देगा</p>
              <p>• The dashboard will show data only for the selected medium</p>
              <p>• आप बाद में साइडबार से अकादमिक वर्ष बदल सकते हैं</p>
              <p>• You can change the academic year later from the sidebar</p>
              <p>• यह सेटिंग आपके सत्र के लिए सहेजी जाएगी</p>
              <p>• This setting will be saved for your session</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-3">
          {isChangingMedium && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              disabled={isSelecting}
              className="inline-flex items-center px-6 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-200 bg-transparent hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors duration-200 disabled:opacity-50 mr-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancel / रद्द करें
            </button>
          )}
          
          <button
            onClick={handleLogout}
            disabled={isSelecting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-200 bg-transparent hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            लॉगआउट / Logout
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-indigo-300">Saraswati School Management System</p>
          <p className="text-xs text-indigo-400 mt-1">© 2025 Saraswati School. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminMediumSelect; 