import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdmissionModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    studentClass: '',
    parentName: '',
    phone: '',
    email: '',
    address: '',
    medium: 'English'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState(''); // Store specific error message
  const [testing, setTesting] = useState(false); // For connection test

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setFormData({
        fullName: '',
        dateOfBirth: '',
        studentClass: '',
        parentName: '',
        phone: '',
        email: '',
        address: '',
        medium: 'English'
      });
      setErrors({});
      setSubmitStatus(null);
      setErrorMessage(''); // Clear error message when modal opens
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Student name is required | छात्र का नाम आवश्यक है';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters | नाम कम से कम 2 अक्षर का होना चाहिए';
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Name cannot exceed 100 characters | नाम 100 अक्षरों से अधिक नहीं हो सकता';
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required | जन्म तिथि आवश्यक है';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
      
      if (finalAge < 3 || finalAge > 18) {
        newErrors.dateOfBirth = 'Student age must be between 3-18 years | छात्र की आयु 3-18 वर्ष के बीच होनी चाहिए';
      }
    }

    // Class validation
    const validClasses = [
      'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
      'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      'Class 11', 'Class 12'
    ];
    if (!formData.studentClass) {
      newErrors.studentClass = 'Class selection is required | कक्षा चयन आवश्यक है';
    } else if (!validClasses.includes(formData.studentClass)) {
      newErrors.studentClass = 'Please select a valid class | कृपया वैध कक्षा चुनें';
    }

    // Parent name validation
    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Parent name is required | अभिभावक का नाम आवश्यक है';
    } else if (formData.parentName.trim().length < 2) {
      newErrors.parentName = 'Parent name must be at least 2 characters | अभिभावक का नाम कम से कम 2 अक्षर का होना चाहिए';
    } else if (formData.parentName.trim().length > 100) {
      newErrors.parentName = 'Parent name cannot exceed 100 characters | अभिभावक का नाम 100 अक्षरों से अधिक नहीं हो सकता';
    }

    // Phone validation - STRICT: exactly 10 digits starting with 6-9
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required | मोबाइल नंबर आवश्यक है';
    } else {
      const cleanPhone = formData.phone.replace(/\s+/g, '').replace(/-/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        newErrors.phone = 'Enter valid 10-digit mobile starting with 6-9 | 6-9 से शुरू होने वाला 10 अंकों का वैध मोबाइल दर्ज करें';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required | ईमेल पता आवश्यक है';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter valid email address | वैध ईमेल पता दर्ज करें';
    }

    // Address validation - STRICT: minimum 10 characters
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required | पता आवश्यक है';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters | पता कम से कम 10 अक्षर का होना चाहिए';
    } else if (formData.address.trim().length > 500) {
      newErrors.address = 'Address cannot exceed 500 characters | पता 500 अक्षरों से अधिक नहीं हो सकता';
    }

    // Medium validation
    if (!['English', 'Hindi'].includes(formData.medium)) {
      newErrors.medium = 'Please select a valid medium | कृपया वैध माध्यम चुनें';
    }

    console.log('Frontend validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Clean and prepare data for backend
    const cleanedData = {
      ...formData,
      fullName: formData.fullName.trim(),
      parentName: formData.parentName.trim(),
      email: formData.email.toLowerCase().trim(),
      address: formData.address.trim(),
      phone: formData.phone.replace(/\s+/g, '').replace(/-/g, '').trim() // Remove spaces and dashes
    };

    // Debug: Log the request data
    console.log('Admission Form Request Data:', cleanedData);
    console.log('Date of Birth value:', cleanedData.dateOfBirth);
    console.log('Phone after cleaning:', cleanedData.phone);
    console.log('Phone regex test:', /^[6-9]\d{9}$/.test(cleanedData.phone));

    try {
      const response = await axios.post('/api/admissions', cleanedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Admission Response status:', response.status);
      console.log('Admission Response data:', response.data);

      if (response.status === 200 && response.data.success) {
        setSubmitStatus('success');
        console.log('Admission submitted successfully:', response.data.data);
        // Auto close modal after 3 seconds on success (optional)
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        console.error('Admission submission failed:', response.data);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Admission submission error:', error);
      console.error('Error response:', error.response?.data);
      
      let specificError = 'कुछ गलत हुआ | Something went wrong. Please try again.';
      
      // Show specific error message from backend
      if (error.response?.data?.message) {
        console.error('Backend error message:', error.response.data.message);
        specificError = error.response.data.message;
      } else if (error.response?.status === 400) {
        specificError = 'Form validation failed. Please check your input data.';
      } else if (error.response?.status === 500) {
        specificError = 'Server error. Please try again later.';
      } else if (error.code === 'ERR_NETWORK') {
        specificError = 'Network error. Please check your internet connection.';
      } else if (error.code === 'ERR_CONNECTION_REFUSED') {
        specificError = 'Cannot connect to server. Please try again later.';
      }
      
      setErrorMessage(specificError);
      
      // Show field-specific errors if available
      if (error.response?.data?.fields) {
        console.error('Field errors:', error.response.data.fields);
      }
      
      // Show mongoose validation errors if available
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSubmitStatus(null);
    setErrorMessage('');
    setErrors({});
  };

  // Test backend connection
  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await axios.get('/api/health');
      console.log('Connection test successful:', response.data);
      alert('✅ Backend connection successful!\n' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Connection test failed:', error);
      alert('❌ Backend connection failed:\n' + error.message);
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Admission Form</h2>
              <p className="text-blue-200 text-sm mt-1"> | Join Saraswati School</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-400 transition-colors duration-200 p-1"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitStatus === 'success' ? (
            // Success Message
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-4">
                आवेदन सफलतापूर्वक जमा हो गया | Your admission application has been successfully submitted.
              </p>
              <p className="text-sm text-gray-500">
                We will contact you within 2-3 working days. This modal will close automatically.
              </p>
            </div>
          ) : submitStatus === 'error' ? (
            // Error Message
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">Submission Failed</h3>
              <p className="text-gray-600 mb-4">
                कुछ गलत हुआ | {errorMessage}
              </p>
              <button
                onClick={handleRetry}
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : (
            // Admission Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Student Information | छात्र की जानकारी
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Full Name | छात्र का पूरा नाम *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter student's full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth | जन्म तिथि *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  {/* Class */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admission Class | प्रवेश कक्षा *
                    </label>
                    <select
                      name="studentClass"
                      value={formData.studentClass}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.studentClass ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Class | कक्षा चुनें</option>
                      <option value="Nursery">Nursery</option>
                      <option value="LKG">LKG</option>
                      <option value="UKG">UKG</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11 Science">Class 11 Science</option>
                      <option value="Class 11 Arts">Class 11 Arts</option>
                      <option value="Class 11 Commerce">Class 11 Commerce</option>
                      <option value="Class 12 Science">Class 12 Science</option>
                      <option value="Class 12 Arts">Class 12 Arts</option>
                      <option value="Class 12 Commerce">Class 12 Commerce</option>
                    </select>
                    {errors.studentClass && (
                      <p className="text-red-500 text-xs mt-1">{errors.studentClass}</p>
                    )}
                  </div>

                  {/* Medium */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medium of Instruction | शिक्षा का माध्यम *
                    </label>
                    <select
                      name="medium"
                      value={formData.medium}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi | हिंदी</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Parent/Guardian Information | अभिभावक की जानकारी
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Parent Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent/Guardian Name | अभिभावक का नाम *
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.parentName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter parent/guardian name"
                    />
                    {errors.parentName && (
                      <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number | मोबाइल नंबर *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter 10-digit mobile number"
                      maxLength="10"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address | ईमेल पता *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complete Address | पूरा पता *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter complete residential address"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel | रद्द करें
                </button>
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testing}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-blue-900 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application | आवेदन जमा करें'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdmissionModal; 