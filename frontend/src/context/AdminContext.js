import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  isAuthenticated: false,
  admin: null,
  selectedMedium: null,
  selectedYear: new Date().getFullYear(),
  loading: true,
  error: null
};

// Action types
const actionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_MEDIUM: 'SET_MEDIUM',
  SET_YEAR: 'SET_YEAR',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const adminReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        admin: action.payload.admin,
        loading: false,
        error: null
      };
    
    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        loading: false,
        error: action.payload.error
      };
    
    case actionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        selectedMedium: null,
        loading: false,
        error: null
      };
    
    case actionTypes.SET_MEDIUM:
      return {
        ...state,
        selectedMedium: action.payload.medium
      };
    
    case actionTypes.SET_YEAR:
      return {
        ...state,
        selectedYear: action.payload.year
      };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading
      };
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload.error,
        loading: false
      };
    
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const AdminContext = createContext();

// Custom hook to use admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Custom hook for admin API calls with automatic filtering
export const useAdminAPI = () => {
  const { getFilterParams, selectedMedium, selectedYear, isReady } = useAdmin();

  // Generic API call function with automatic filtering
  const apiCall = async (endpoint, options = {}) => {
    if (!isReady) {
      throw new Error('Admin context not ready. Please ensure medium is selected.');
    }

    // Build URL with filters
    const baseUrl = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const filterParams = getFilterParams();
    const separator = baseUrl.includes('?') ? '&' : '?';
    const url = filterParams ? `${baseUrl}${separator}${filterParams}` : baseUrl;

    // Default options
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  // Specific API methods
  const getStudents = (additionalParams = {}) => {
    // Add medium and year to the parameters automatically
    const params = new URLSearchParams({
      medium: selectedMedium,
      year: selectedYear,
      ...additionalParams
    });
    const queryString = params.toString();
    const endpoint = `/api/admin/students-list${queryString ? `?${queryString}` : ''}`;
    return apiCall(endpoint);
  };

  // Teacher functionality removed - now admin-only management

  const getAdmissions = (additionalParams = {}) => {
    const params = new URLSearchParams(additionalParams);
    const queryString = params.toString();
    const endpoint = `/api/admin/admissions${queryString ? `?${queryString}` : ''}`;
    return apiCall(endpoint);
  };

  const getAnnouncements = (additionalParams = {}) => {
    const params = new URLSearchParams(additionalParams);
    const queryString = params.toString();
    const endpoint = `/api/announcements/admin/all${queryString ? `?${queryString}` : ''}`;
    return apiCall(endpoint);
  };



  return {
    // Generic API call
    apiCall,
    
    // Specific methods
    getStudents,
    getAdmissions,
    getAnnouncements,
    
    // Filter info
    selectedMedium,
    selectedYear,
    isReady,
    
    // Helper to get current filter params
    getCurrentFilters: () => ({
      medium: selectedMedium,
      year: selectedYear
    })
  };
};

// Admin Provider component
export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: { loading: true } });

        // Load selected medium from localStorage
        const savedMedium = localStorage.getItem('adminSelectedMedium');
        if (savedMedium) {
          dispatch({ type: actionTypes.SET_MEDIUM, payload: { medium: savedMedium } });
        }

        // Load selected year from localStorage
        const savedYear = localStorage.getItem('adminSelectedYear');
        if (savedYear) {
          dispatch({ type: actionTypes.SET_YEAR, payload: { year: parseInt(savedYear) } });
        }

        // Check if admin is already authenticated
        await verifyToken();

      } catch (error) {
        console.error('Error loading persisted data:', error);
        dispatch({ type: actionTypes.SET_LOADING, payload: { loading: false } });
      }
    };

    loadPersistedData();
  }, []);

  // Verify token with backend
  const verifyToken = async () => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: { admin: data.data.admin }
        });
      } else {
        dispatch({ type: actionTypes.SET_LOADING, payload: { loading: false } });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      dispatch({ type: actionTypes.SET_LOADING, payload: { loading: false } });
    }
  };

  // Login function
  const login = async (adminId, password) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: { loading: true } });
      dispatch({ type: actionTypes.CLEAR_ERROR });

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ adminId, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: { admin: data.data.admin }
        });
        return { success: true, admin: data.data.admin };
      } else {
        const errorMessage = data.message || 'लॉगिन विफल / Login failed';
        dispatch({
          type: actionTypes.LOGIN_FAILURE,
          payload: { error: errorMessage }
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'नेटवर्क त्रुटि / Network error';
      console.error('Login error:', error);
      dispatch({
        type: actionTypes.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('adminSelectedMedium');
      localStorage.removeItem('adminSelectedYear');
      
      // Update state
      dispatch({ type: actionTypes.LOGOUT });
    }
  };

  // Set medium function
  const setMedium = (medium) => {
    // Validate medium
    if (!['Hindi', 'English'].includes(medium)) {
      console.error('Invalid medium:', medium);
      return;
    }

    // Save to localStorage
    localStorage.setItem('adminSelectedMedium', medium);
    
    // Update state
    dispatch({ type: actionTypes.SET_MEDIUM, payload: { medium } });
  };

  // Set year function
  const setYear = (year) => {
    // Validate year
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      console.error('Invalid year:', year);
      return;
    }

    // Save to localStorage
    localStorage.setItem('adminSelectedYear', yearNum.toString());
    
    // Update state
    dispatch({ type: actionTypes.SET_YEAR, payload: { year: yearNum } });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  // Get API query parameters for current filters
  const getFilterParams = () => {
    const params = new URLSearchParams();
    
    if (state.selectedMedium) {
      params.append('medium', state.selectedMedium);
    }
    
    if (state.selectedYear) {
      params.append('year', state.selectedYear.toString());
    }
    
    return params.toString();
  };

  // Context value
  const value = {
    // State
    isAuthenticated: state.isAuthenticated,
    admin: state.admin,
    selectedMedium: state.selectedMedium,
    selectedYear: state.selectedYear,
    loading: state.loading,
    error: state.error,
    
    // Actions
    login,
    logout,
    setMedium,
    setYear,
    clearError,
    verifyToken,
    getFilterParams,
    
    // Computed values
    hasSelectedMedium: !!state.selectedMedium,
    isReady: state.isAuthenticated && !!state.selectedMedium,
    
    // Available options
    availableYears: [2023, 2024, 2025, 2026, 2027],
    availableMediums: ['Hindi', 'English']
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext; 