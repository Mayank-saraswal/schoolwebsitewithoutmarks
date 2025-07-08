import React, { createContext, useContext, useState, useEffect } from 'react';

const ParentContext = createContext();

export const useParent = () => {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
};

export const ParentProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [token, setToken] = useState(null);

  // Check for existing parent authentication on app start
  useEffect(() => {
    checkParentAuth();
  }, []);

  const checkParentAuth = async () => {
    try {
      const storedToken = localStorage.getItem('parentToken');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/parents/verify', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setToken(storedToken);
          setParent({
            mobile: result.data.parentMobile
          });
          setStudentList(result.data.studentList);
          setIsAuthenticated(true);
          
          // Auto-select first student if only one child
          if (result.data.studentList.length === 1) {
            setSelectedStudent(result.data.studentList[0]);
          }
        } else {
          clearParentAuth();
        }
      } else {
        clearParentAuth();
      }
    } catch (error) {
      console.error('Parent auth check failed:', error);
      clearParentAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (mobile, dob) => {
    try {
      setLoading(true);
      const response = await fetch('/api/parents/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mobile, dob })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const { token, studentList, parentMobile } = result.data;
        
        // Store token in localStorage
        localStorage.setItem('parentToken', token);
        
        // Update state
        setToken(token);
        setParent({ mobile: parentMobile });
        setStudentList(studentList);
        setIsAuthenticated(true);
        
        // Auto-select first student if only one child
        if (studentList.length === 1) {
          setSelectedStudent(studentList[0]);
        }

        return { success: true, data: result.data };
      } else {
        return { 
          success: false, 
          message: result.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Parent login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/parents/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearParentAuth();
    }
  };

  const clearParentAuth = () => {
    localStorage.removeItem('parentToken');
    setToken(null);
    setParent(null);
    setStudentList([]);
    setSelectedStudent(null);
    setIsAuthenticated(false);
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
  };

  // API helper function for authenticated requests
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const result = await response.json();

      if (response.status === 401) {
        // Token expired or invalid
        clearParentAuth();
        throw new Error('Session expired. Please login again.');
      }

      return {
        ok: response.ok,
        status: response.status,
        data: result
      };
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  // Fetch student marks
  const getStudentMarks = async (studentId) => {
    try {
      const response = await apiCall(`/api/parents/marks/${studentId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch marks: ${error.message}`);
    }
  };

  // Fetch student fees
  const getStudentFees = async (studentId) => {
    try {
      const response = await apiCall(`/api/parents/fees/${studentId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch fees: ${error.message}`);
    }
  };

  // Fetch marksheet data
  const getMarksheetData = async (studentId) => {
    try {
      const response = await apiCall(`/api/parents/marksheet/${studentId}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch marksheet data: ${error.message}`);
    }
  };

  const value = {
    // State
    isAuthenticated,
    loading,
    parent,
    studentList,
    selectedStudent,
    token,

    // Actions
    login,
    logout,
    selectStudent,
    
    // API methods
    getStudentMarks,
    getStudentFees,
    getMarksheetData,
    apiCall
  };

  return (
    <ParentContext.Provider value={value}>
      {children}
    </ParentContext.Provider>
  );
}; 