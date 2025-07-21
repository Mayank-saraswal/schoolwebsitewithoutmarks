import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TeacherContext = createContext();

export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
};

export const TeacherProvider = ({ children }) => {
  const { teacher, isAuthenticated, hasRole } = useAuth();
  const [selectedMedium, setSelectedMedium] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize teacher context when teacher data is available
  useEffect(() => {
    if (teacher && isAuthenticated && hasRole('teacher')) {
      // Set medium from teacher profile
      const teacherMedium = teacher.medium || 'Hindi';
      setSelectedMedium(teacherMedium);

      // Set current academic year
      const currentYear = new Date().getFullYear();
      setSelectedYear(currentYear);

      setLoading(false);
      console.log('🎓 Teacher context initialized:', {
        medium: teacherMedium,
        year: currentYear,
        teacher: teacher.fullName
      });
    } else if (!isAuthenticated || !hasRole('teacher')) {
      // Clear context if not authenticated as teacher
      setSelectedMedium(null);
      setSelectedYear(new Date().getFullYear());
      setLoading(false);
    }
  }, [teacher, isAuthenticated, hasRole]);

  // API call helper with teacher context
  const apiCall = async (endpoint, options = {}) => {
    if (!teacher || !selectedMedium) {
      throw new Error('Teacher context not ready');
    }

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
      const response = await fetch(endpoint, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Teacher API call error:', error);
      throw error;
    }
  };

  // Get students created by this teacher
  const getMyStudents = async (additionalParams = {}) => {
    console.log('🎓 TeacherContext getMyStudents called with:', {
      selectedMedium,
      selectedYear,
      additionalParams
    });

    const params = new URLSearchParams({
      academicYear: selectedYear.toString(),
      ...additionalParams
    });
    const queryString = params.toString();
    const endpoint = `/api/students/my-students${queryString ? `?${queryString}` : ''}`;
    
    console.log('🎓 Making API call to:', endpoint);
    return apiCall(endpoint);
  };

  // Create student
  const createStudent = async (studentData) => {
    // Ensure medium is set from teacher context
    const dataWithMedium = {
      ...studentData,
      medium: selectedMedium,
      academicYear: selectedYear
    };

    return apiCall('/api/students/create', {
      method: 'POST',
      body: JSON.stringify(dataWithMedium)
    });
  };

  // Update student
  const updateStudent = async (studentId, studentData) => {
    return apiCall(`/api/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  };

  // Delete student
  const deleteStudent = async (studentId) => {
    return apiCall(`/api/students/${studentId}`, {
      method: 'DELETE'
    });
  };

  // Get student by ID
  const getStudentById = async (studentId) => {
    return apiCall(`/api/students/${studentId}`);
  };

  // Get next SR number
  const getNextSRNumber = async () => {
    return apiCall('/api/students/next-sr-number');
  };

  // Get form configuration for student creation
  const getFormConfig = async (className) => {
    const params = new URLSearchParams({
      medium: selectedMedium
    });
    return apiCall(`/api/config/student-form/${className}?${params.toString()}`);
  };

  const contextValue = {
    // State
    teacher,
    selectedMedium,
    selectedYear,
    loading,
    error,

    // Computed values
    isReady: !loading && !!teacher && !!selectedMedium,
    hasTeacherAccess: isAuthenticated && hasRole('teacher'),

    // API methods
    getMyStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    getNextSRNumber,
    getFormConfig,
    apiCall,

    // Helper methods
    getCurrentFilters: () => ({
      medium: selectedMedium,
      year: selectedYear,
      teacherId: teacher?._id
    }),

    // Available options
    availableYears: [2023, 2024, 2025, 2026, 2027],
    availableMediums: ['Hindi', 'English']
  };

  return (
    <TeacherContext.Provider value={contextValue}>
      {children}
    </TeacherContext.Provider>
  );
};

export default TeacherContext;