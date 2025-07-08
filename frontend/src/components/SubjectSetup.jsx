import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

const SubjectSetup = () => {
  const { isAuthenticated, selectedMedium, selectedYear, isReady } = useAdmin();
  
  const [formData, setFormData] = useState({
    className: '',
    medium: selectedMedium || '',
    academicYear: selectedYear || new Date().getFullYear(),
    subjects: ['']
  });

  const [existingSubjects, setExistingSubjects] = useState([]);
  const [options, setOptions] = useState({
    classes: [
      'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
      'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
      'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
    ],
    mediums: ['Hindi', 'English'],
    years: [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1]
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Predefined class options
  const defaultClasses = [
    'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
    'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
  ];

  // Initialize component
  useEffect(() => {
    if (isReady && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        medium: selectedMedium,
        academicYear: selectedYear
      }));
      fetchOptions();
      fetchExistingSubjects();
    }
  }, [isReady, selectedMedium, selectedYear, isAuthenticated]);

  // Fetch dropdown options
  const fetchOptions = async () => {
    try {
      // Check if admin is authenticated
      if (!isAuthenticated) {
        console.log('Admin not authenticated, using default options');
        return;
      }

      setOptionsLoading(true);
      const response = await fetch('/api/admin/subject-options', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const currentYear = new Date().getFullYear();
        const defaultYears = [currentYear - 1, currentYear, currentYear + 1];
        
        console.log('Subject options API response:', data.data);
        console.log('Classes from API:', data.data.classes);
        console.log('Number of classes:', data.data.classes.length);
        
        setOptions(prev => ({
          classes: data.data.classes.length > 0 ? data.data.classes : prev.classes,
          mediums: data.data.mediums.length > 0 ? data.data.mediums : prev.mediums,
          years: data.data.years.length > 0 ? data.data.years : defaultYears
        }));
        
        console.log('Options updated successfully');
      } else {
        console.log('API response not successful, keeping default options');
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      console.log('Using default options due to error');
      // Keep existing options on error (they are already set with defaults)
    } finally {
      setOptionsLoading(false);
    }
  };

  // Fetch existing subjects
  const fetchExistingSubjects = async () => {
    if (!selectedMedium || !selectedYear) return;

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        medium: selectedMedium,
        year: selectedYear.toString()
      });

      const response = await fetch(`/api/admin/subjects?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setExistingSubjects(data.data);
      } else {
        setExistingSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching existing subjects:', error);
      setExistingSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (index, value) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index] = value;
    setFormData(prev => ({
      ...prev,
      subjects: updatedSubjects
    }));
  };

  const addSubjectField = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, '']
    }));
  };

  const removeSubjectField = (index) => {
    if (formData.subjects.length > 1) {
      const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        subjects: updatedSubjects
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.className || !formData.medium) {
      setMessage('कृपया कक्षा और माध्यम चुनें / Please select class and medium');
      return;
    }

    const validSubjects = formData.subjects.filter(subject => subject.trim() !== '');
    if (validSubjects.length === 0) {
      setMessage('कम से कम एक विषय आवश्यक है / At least one subject is required');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');

      const requestData = {
        className: formData.className,
        medium: formData.medium,
        year: formData.academicYear,
        subjects: validSubjects.map(subject => subject.trim())
      };

      console.log('Sending subject creation request:', requestData);

      const response = await fetch('/api/admin/subjects', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        setMessage(`✅ विषय सफलतापूर्वक जोड़े गए! / Subjects added successfully! (ID: ${data.data?._id})`);
        setFormData(prev => ({
          ...prev,
          className: '',
          subjects: ['']
        }));
        
        // Wait a moment then refresh the list
        setTimeout(() => {
          fetchExistingSubjects();
        }, 1000);
      } else {
        console.error('Subject creation failed:', data);
        setMessage(`❌ ${data.message || 'Error adding subjects'}`);
      }
    } catch (error) {
      console.error('Error submitting subjects:', error);
      setMessage('❌ नेटवर्क त्रुटि / Network error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('क्या आप वाकई इन विषयों को हटाना चाहते हैं? / Are you sure you want to delete these subjects?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subjects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('विषय सफलतापूर्वक हटाए गए! / Subjects deleted successfully!');
        fetchExistingSubjects(); // Refresh the list
      } else {
        setMessage(data.message || 'Error deleting subjects');
      }
    } catch (error) {
      console.error('Error deleting subjects:', error);
      setMessage('नेटवर्क त्रुटि / Network error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            कृपया पहले लॉगिन करें / Please login first
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Reload Page / पेज रीलोड करें
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg">
        <div className="text-center">
          <div className="text-blue-600 mb-2">
            कृपया पहले माध्यम चुनें / Please select a medium first
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          विषय प्रबंधन / Subject Management
        </h2>
        <p className="text-gray-600">
          कक्षावार विषयों को जोड़ें और प्रबंधित करें / Add and manage subjects class-wise
        </p>
        <div className="mt-2 text-sm text-blue-600">
          <span className="bg-blue-100 px-2 py-1 rounded mr-2">
            {selectedMedium} Medium
          </span>
          <span className="bg-blue-100 px-2 py-1 rounded">
            Academic Year: {selectedYear}
          </span>
        </div>
      </div>

      {/* Add Subject Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          नए विषय जोड़ें / Add New Subjects
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              कक्षा / Class <span className="text-red-500">*</span>
            </label>
            <select
              name="className"
              value={formData.className}
              onChange={handleInputChange}
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
            <p className="text-xs text-gray-500 mt-1">
              {optionsLoading ? (
                'Loading classes... / कक्षाएं लोड हो रही हैं...'
              ) : (
                `Available classes: ${options.classes.length} / उपलब्ध कक्षाएं: ${options.classes.length}`
              )}
            </p>
          </div>

          {/* Subject Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              विषय / Subjects <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formData.subjects.map((subject, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => handleSubjectChange(index, e.target.value)}
                    placeholder={`विषय ${index + 1} / Subject ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubjectField(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      हटाएं / Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSubjectField}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              + और विषय जोड़ें / Add More Subject
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            {submitting ? (
              'जोड़ा जा रहा है... / Adding...'
            ) : (
              'विषय जोड़ें / Add Subjects'
            )}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('successfully') || message.includes('सफलतापूर्वक')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Existing Subjects */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            मौजूदा विषय - {selectedMedium} Medium ({selectedYear})
          </h3>
          <p className="text-gray-600 text-sm">
            Existing Subjects for {selectedMedium} Medium ({selectedYear})
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">लोड हो रहा है / Loading...</span>
            </div>
          ) : existingSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingSubjects.map((subjectDoc) => (
                <div key={subjectDoc._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">
                      {subjectDoc.className}
                    </h4>
                    <button
                      onClick={() => handleDelete(subjectDoc._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      हटाएं / Delete
                    </button>
                  </div>
                  <div className="space-y-1">
                    {subjectDoc.subjects.map((subject, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{subject}</span>
                        <span className="text-gray-500">Subject {index + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    कुल विषय / Total: {subjectDoc.totalSubjects}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                कोई विषय नहीं मिले / No Subjects Found
              </h3>
              <p className="text-gray-500">
                {selectedMedium} Medium ({selectedYear}) के लिए अभी तक कोई विषय नहीं जोड़े गए हैं
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectSetup; 