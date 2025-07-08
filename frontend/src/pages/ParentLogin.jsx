import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../context/ParentContext';

const ParentLogin = () => {
  const { login, isAuthenticated, loading } = useParent();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    mobile: '',
    dob: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/parent/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'मोबाइल नंबर आवश्यक है / Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें / Please enter a valid 10-digit mobile number';
    }

    // Date of birth validation
    if (!formData.dob.trim()) {
      newErrors.dob = 'जन्म तिथि आवश्यक है / Date of birth is required';
    } else if (!/^\d{2}-\d{2}-\d{4}$/.test(formData.dob)) {
      newErrors.dob = 'कृपया DD-MM-YYYY प्रारूप में जन्म तिथि दर्ज करें / Please enter date in DD-MM-YYYY format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(formData.mobile, formData.dob);
      
      if (result.success) {
        navigate('/parent/dashboard', { replace: true });
      } else {
        setErrors({
          submit: result.message || 'लॉगिन असफल / Login failed'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        submit: 'नेटवर्क त्रुटि। कृपया दोबारा कोशिश करें / Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateInput = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add dashes in DD-MM-YYYY format
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
    }
  };

  const handleDateChange = (e) => {
    const formatted = formatDateInput(e.target.value);
    setFormData(prev => ({
      ...prev,
      dob: formatted
    }));
    
    if (errors.dob) {
      setErrors(prev => ({
        ...prev,
        dob: ''
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            <img 
              src="https://allpngfree.com/apf-prod-storage-api/storage/thumbnails/saraswati-png-image-download-thumbnail-1643211966.jpg" 
              alt="Saraswati School Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Saraswati School
          </h2>
          <p className="text-blue-200 text-lg">
            अभिभावक पोर्टल / Parent Portal
          </p>
          <p className="text-blue-300 text-sm mt-2">
            अपने बच्चे के परिणाम और फीस की स्थिति देखें
          </p>
          <p className="text-blue-300 text-sm">
            View your child's results and fee status
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
              लॉगिन करें / Login
            </h3>
            <p className="text-gray-600 text-sm text-center">
              मोबाइल नंबर और बच्चे की जन्म तिथि दर्ज करें
            </p>
            <p className="text-gray-600 text-xs text-center">
              Enter mobile number and child's date of birth
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                पंजीकृत मोबाइल नंबर / Registered Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="10 अंकों का मोबाइल नंबर / 10-digit mobile number"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.mobile ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={10}
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                बच्चे की जन्म तिथि / Child's Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dob"
                value={formData.dob}
                onChange={handleDateChange}
                placeholder="DD-MM-YYYY (जैसे: 15-08-2015)"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dob ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={10}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                प्रारूप: दिन-महीना-साल (DD-MM-YYYY)
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  लॉगिन हो रहा है... / Logging in...
                </>
              ) : (
                'लॉगिन करें / Login'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  सहायता / Help
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>• वही मोबाइल नंबर दर्ज करें जो दाखिले के समय दिया था</p>
                  <p>• Enter the same mobile number provided during admission</p>
                  <p>• जन्म तिथि DD-MM-YYYY प्रारूप में दर्ज करें</p>
                  <p>• Enter date of birth in DD-MM-YYYY format</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-200 text-sm">
            समस्या होने पर स्कूल से संपर्क करें / Contact school for any issues
          </p>
          <p className="text-blue-300 text-xs mt-1">
            © 2025 Saraswati School. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentLogin; 