import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [userType, setUserType] = useState(null); // 'admin' or 'teacher'
  const [loading, setLoading] = useState(true);
  const [selectedMedium, setSelectedMedium] = useState(localStorage.getItem('selectedMedium') || '');

  // Check if user is already logged in on app startup
  useEffect(() => {
    // Check for cookie-based authentication first
    verifyTokenFromCookies();
  }, []);

  // Save medium selection to localStorage when it changes
  useEffect(() => {
    if (selectedMedium) {
      localStorage.setItem('selectedMedium', selectedMedium);
    }
  }, [selectedMedium]);

  // Verify tokens from cookies with better error handling
  const verifyTokenFromCookies = async () => {
    try {
      setLoading(true);

      // Try to verify admin token first
      try {
        const adminResponse = await fetch('/api/admin/verify', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const adminData = await adminResponse.json();

        if (adminResponse.ok && adminData.success) {
          setIsAuthenticated(true);
          setAdmin(adminData.data.admin);
          setUserType('admin');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Admin token verification failed, trying teacher token...');
      }

      // If admin verification failed, try teacher token
      try {
        const teacherResponse = await fetch('/api/teachers/verify', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const teacherData = await teacherResponse.json();

        if (teacherResponse.ok && teacherData.success) {
          setIsAuthenticated(true);
          setTeacher(teacherData.data.teacher);
          setUserType('teacher');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Teacher token verification failed');
      }

      // If both verifications failed, clear auth state
      setIsAuthenticated(false);
      setAdmin(null);
      setTeacher(null);
      setUserType(null);
      setLoading(false);

    } catch (error) {
      console.error('Token verification error:', error);
      setIsAuthenticated(false);
      setAdmin(null);
      setTeacher(null);
      setUserType(null);
      setLoading(false);
    }
  };

  // Add re-authentication function for refresh scenarios
  const reAuthenticate = async () => {
    console.log('Re-authenticating user...');
    await verifyTokenFromCookies();
  };

  const verifyAdminToken = async (token) => {
    try {
      const response = await axios.get('/api/admin/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        setAdmin(response.data.data.admin);
        setUserType('admin');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    } catch (error) {
      console.error('Admin token verification failed:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
    } finally {
      setLoading(false);
    }
  };

  const verifyTeacherToken = async (token) => {
    try {
      const response = await axios.get('/api/teachers/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        setTeacher(response.data.data.teacher);
        setUserType('teacher');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('teacherToken');
        localStorage.removeItem('teacherData');
      }
    } catch (error) {
      console.error('Teacher token verification failed:', error);
      localStorage.removeItem('teacherToken');
      localStorage.removeItem('teacherData');
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (adminId, password) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ adminId, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setAdmin(data.data.admin);
        setUserType('admin');
        setLoading(false);
        
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: data.message };
      }
    } catch (error) {
      setLoading(false);
      console.error('Admin login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.',
        code: error.response?.data?.code || 'UNKNOWN_ERROR'
      };
    }
  };

  const teacherLogin = async (mobile, password) => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ mobile, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setTeacher(data.data.teacher);
        setUserType('teacher');
        setLoading(false);
        
        return { success: true, data: data.data };
      } else {
        setLoading(false);
        return { success: false, message: data.message, code: data.code };
      }
    } catch (error) {
      setLoading(false);
      console.error('Teacher login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.',
        code: error.response?.data?.code || 'UNKNOWN_ERROR'
      };
    }
  };

  const teacherRegister = async (formData) => {
    try {
      const response = await axios.post('/api/teachers/register', formData);
      return response.data;
    } catch (error) {
      console.error('Teacher registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
        errors: error.response?.data?.errors || {},
        field: error.response?.data?.field || null
      };
    }
  };

  const logout = async () => {
    try {
      // Call appropriate logout endpoint
      if (userType === 'admin') {
        await fetch('/api/admin/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } else if (userType === 'teacher') {
        // Clear teacher token cookie
        await fetch('/api/teachers/logout', {
          method: 'POST',
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all local state and storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('teacherToken');
      localStorage.removeItem('teacherData');
      localStorage.removeItem('selectedMedium');
      
      delete axios.defaults.headers.common['Authorization'];
      
      setIsAuthenticated(false);
      setAdmin(null);
      setTeacher(null);
      setUserType(null);
      setSelectedMedium('');
      setLoading(false);
    }
  };

  // Helper function to get current user
  const getCurrentUser = () => {
    if (userType === 'admin') return admin;
    if (userType === 'teacher') return teacher;
    return null;
  };

  // Helper function to check if user has specific role
  const hasRole = (role) => {
    return userType === role;
  };

  // Helper function to get auth token (now returns null since we use cookies)
  const getAuthToken = () => {
    // For backward compatibility, return null since we now use cookies
    return null;
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return userType === 'admin';
  };

  // Helper function to check if user is teacher
  const isTeacher = () => {
    return userType === 'teacher';
  };

  const contextValue = {
    // Authentication state
    isAuthenticated,
    admin,
    teacher,
    userType,
    loading,
    selectedMedium,
    setSelectedMedium,
    
    // Login functions
    adminLogin,
    teacherLogin,
    
    // Registration
    teacherRegister,
    
    // Utility functions
    logout,
    reAuthenticate,
    getCurrentUser,
    hasRole,
    getAuthToken,
    isAdmin,
    isTeacher,
    
    // Legacy support (for existing admin components)
    login: adminLogin, // Keep for backward compatibility
    token: getAuthToken(), // For backward compatibility
    verifyToken: userType === 'admin' ? verifyAdminToken : verifyTeacherToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 