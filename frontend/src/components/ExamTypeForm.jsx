import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ExamTypeForm = ({ examType, filters, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    examType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Common exam type suggestions
  const commonExamTypes = [
    'Half Yearly', 'Annual Exam', 'Quarterly Exam',
    'Unit Test 1', 'Unit Test 2', 'Unit Test 3',
    'Monthly Test', 'Weekly Test', 'Pre-Board',
    'Board Exam', 'Practice Test', 'Assessment Test'
  ];

  // Initialize form data
  useEffect(() => {
    if (examType) {
      // Editing existing exam type
      setFormData({
        examType: examType.examType
      });
    } else {
      // Adding new exam type
      setFormData({
        examType: ''
      });
    }
    setError('');
  }, [examType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      examType: suggestion
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.examType.trim()) {
        setError('परीक्षा प्रकार आवश्यक है / Exam type is required');
        setLoading(false);
        return;
      }

      const submitData = {
        class: filters.class,
        medium: filters.medium,
        year: filters.year,
        examType: formData.examType.trim(),
        maxMarks: 100 // Default max marks, teachers will set subject-wise later
      };

      const url = examType 
        ? `/api/admin/exam-type/${examType._id}`
        : '/api/admin/exam-type';
      
      const method = examType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSuccess();
      } else {
        setError(result.message || 'Error saving exam type');
      }
    } catch (error) {
      console.error('Error submitting exam type:', error);
      setError('नेटवर्क त्रुटि / Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          {examType ? 'परीक्षा प्रकार संपादित करें / Edit Exam Type' : 'नया परीक्षा प्रकार जोड़ें / Add New Exam Type'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Context Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          कॉन्फ़िगरेशन विवरण / Configuration Details
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>कक्षा / Class:</strong> {filters.class}</p>
          <p><strong>माध्यम / Medium:</strong> {filters.medium}</p>
          <p><strong>शैक्षणिक वर्ष / Academic Year:</strong> {filters.year}</p>
          <p className="text-xs text-blue-600 mt-2">
            ⚠️ विषय-वार अधिकतम अंक शिक्षक द्वारा बाद में सेट किए जाएंगे / Subject-wise max marks will be set by teachers later
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam Type Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            परीक्षा प्रकार / Exam Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="examType"
            value={formData.examType}
            onChange={handleInputChange}
            placeholder="e.g., Half Yearly, Unit Test 1, Annual Exam"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          
          {/* Suggestions */}
          {!examType && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">सुझाव / Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {commonExamTypes.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200"
          >
            रद्द करें / Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 016.32-7.906"></path>
              </svg>
            )}
            <span>
              {loading 
                ? (examType ? 'अपडेट हो रहा है... / Updating...' : 'जोड़ा जा रहा है... / Adding...') 
                : (examType ? 'अपडेट करें / Update' : 'जोड़ें / Add')
              }
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamTypeForm; 