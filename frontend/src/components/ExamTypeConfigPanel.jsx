import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ExamTypeForm from './ExamTypeForm';
import ExamTypeTable from './ExamTypeTable';

const ExamTypeConfigPanel = () => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    class: '',
    medium: '',
    year: new Date().getFullYear()
  });
  const [options, setOptions] = useState({
    classes: [],
    mediums: ['Hindi', 'English'],
    years: []
  });
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingExamType, setEditingExamType] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Predefined class options (matching Subject model)
  const standardClasses = [
    'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
    'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
  ];

  // Initialize with current year and next year
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const defaultYears = [currentYear - 1, currentYear, currentYear + 1];
    setOptions(prev => ({
      ...prev,
      years: defaultYears,
      classes: standardClasses // Set default classes immediately
    }));
  }, []);

  // Fetch exam type options from backend
  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/admin/exam-type-options', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Merge with predefined classes and years
          const mergedClasses = [...new Set([...standardClasses, ...result.data.classes])];
          const currentYear = new Date().getFullYear();
          const defaultYears = [currentYear - 1, currentYear, currentYear + 1];
          const mergedYears = [...new Set([...defaultYears, ...result.data.years])].sort((a, b) => b - a);
          
          setOptions({
            classes: mergedClasses,
            mediums: result.data.mediums,
            years: mergedYears
          });
        }
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      // Keep the defaults if fetch fails
    }
  };

  // Fetch exam types based on filters
  const fetchExamTypes = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.class) queryParams.append('class', filters.class);
      if (filters.medium) queryParams.append('medium', filters.medium);
      if (filters.year) queryParams.append('year', filters.year);

      const response = await fetch(`/api/admin/exam-types?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setExamTypes(result.data);
        } else {
          console.error('Failed to fetch exam types:', result.message);
        }
      } else {
        console.error('Failed to fetch exam types');
      }
    } catch (error) {
      console.error('Error fetching exam types:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load options on component mount
  useEffect(() => {
    fetchOptions();
  }, [token]);

  // Fetch exam types when filters change
  useEffect(() => {
    if (filters.class && filters.medium && filters.year) {
      fetchExamTypes();
    } else {
      setExamTypes([]);
    }
  }, [filters, token]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setEditingExamType(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditingExamType(null);
    setShowForm(true);
  };

  const handleEdit = (examType) => {
    setEditingExamType(examType);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExamType(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExamType(null);
    fetchExamTypes(); // Refresh the list
  };

  const handleDelete = () => {
    fetchExamTypes(); // Refresh the list after deletion
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          परीक्षा प्रकार कॉन्फ़िगरेशन / Exam Type Configuration
        </h2>
        <p className="text-gray-600">
          कक्षा, माध्यम और वर्ष के अनुसार परीक्षा प्रकार और अधिकतम अंक सेट करें
        </p>
        <p className="text-gray-600 text-sm">
          Set exam types and maximum marks by class, medium, and year
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          फ़िल्टर / Filters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              कक्षा / Class <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">कक्षा चुनें / Select Class</option>
              {options.classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          {/* Medium Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              माध्यम / Medium <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.medium}
              onChange={(e) => handleFilterChange('medium', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">माध्यम चुनें / Select Medium</option>
              {options.mediums.map((medium) => (
                <option key={medium} value={medium}>
                  {medium}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              शैक्षणिक वर्ष / Academic Year <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">वर्ष चुनें / Select Year</option>
              {options.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add New Button */}
        {filters.class && filters.medium && filters.year && (
          <div className="mt-4">
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>नया परीक्षा प्रकार जोड़ें / Add New Exam Type</span>
            </button>
          </div>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <ExamTypeForm
          examType={editingExamType}
          filters={filters}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Results Section */}
      {filters.class && filters.medium && filters.year && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              परीक्षा प्रकार - {filters.class} {filters.medium} ({filters.year})
            </h3>
            <p className="text-gray-600 text-sm">
              Exam Types for {filters.class} {filters.medium} ({filters.year})
            </p>
            {examTypes.length > 0 && (
              <p className="text-blue-600 text-sm mt-1">
                कुल {examTypes.length} परीक्षा प्रकार मिले / Found {examTypes.length} exam types
              </p>
            )}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">लोड हो रहा है / Loading...</span>
              </div>
            ) : examTypes.length > 0 ? (
              <ExamTypeTable
                examTypes={examTypes}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  कोई परीक्षा प्रकार नहीं मिला
                </h3>
                <p className="text-gray-500 mb-4">
                  No exam types found for the selected filters
                </p>
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  पहला परीक्षा प्रकार जोड़ें / Add First Exam Type
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!filters.class || !filters.medium || !filters.year ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                निर्देश / Instructions
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>कृपया कक्षा, माध्यम और शैक्षणिक वर्ष का चयन करें ताकि परीक्षा प्रकारों को देख और प्रबंधित कर सकें।</p>
                <p className="mt-1">Please select class, medium, and academic year to view and manage exam types.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ExamTypeConfigPanel; 