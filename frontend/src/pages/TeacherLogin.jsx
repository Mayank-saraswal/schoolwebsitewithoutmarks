import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, GraduationCap, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const TeacherLogin = () => {
  const { teacherLogin, isAuthenticated, teacher, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error', 'warning', 'success'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && teacher) {
      const from = location.state?.from?.pathname || '/teacher/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, teacher, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Clear general message when user types
    if (loginMessage) {
      setLoginMessage('');
      setMessageType('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required / मोबाइल नंबर आवश्यक है';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number / कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required / पासवर्ड आवश्यक है';
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
    setLoginMessage('');
    setMessageType('');

    try {
      const result = await teacherLogin(formData.mobile.trim(), formData.password);

      if (result.success) {
        setLoginMessage('Login successful! Redirecting to dashboard... / लॉगिन सफल! डैशबोर्ड पर रीडायरेक्ट हो रहे हैं...');
        setMessageType('success');
        
        // Navigate to dashboard based on teacher's medium
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/teacher/dashboard';
          navigate(from, { replace: true });
        }, 1500);

      } else {
        // Handle different error codes
        switch (result.code) {
          case 'PENDING_APPROVAL':
            setLoginMessage(
              'Your application is pending approval. Please wait for administration confirmation. / ' +
              'आपका आवेदन अनुमोदन की प्रतीक्षा में है। कृपया प्रशासन की पुष्टि का इंतजार करें।'
            );
            setMessageType('warning');
            break;

          case 'APPLICATION_REJECTED':
            setLoginMessage(
              'Your application has been rejected. Please contact administration for more details. / ' +
              'आपका आवेदन अस्वीकार कर दिया गया है। अधिक विवरण के लिए कृपया प्रशासन से संपर्क करें।'
            );
            setMessageType('error');
            break;

          case 'ACCOUNT_DEACTIVATED':
            setLoginMessage(
              'Your account has been deactivated. Please contact administration. / ' +
              'आपका खाता निष्क्रिय कर दिया गया है। कृपया प्रशासन से संपर्क करें।'
            );
            setMessageType('error');
            break;

          case 'INVALID_CREDENTIALS':
            setLoginMessage(
              'Invalid mobile number or password. Please check your credentials. / ' +
              'गलत मोबाइल नंबर या पासवर्ड। कृपया अपनी जानकारी जांचें।'
            );
            setMessageType('error');
            break;

          default:
            setLoginMessage(result.message || 'Login failed. Please try again. / लॉगिन विफल। कृपया पुनः प्रयास करें।');
            setMessageType('error');
        }
      }
    } catch (error) {
      setLoginMessage('An error occurred during login. Please try again. / लॉगिन के दौरान एक त्रुटि हुई। कृपया पुनः प्रयास करें।');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getMessageBgColor = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getMessageTextColor = () => {
    switch (messageType) {
      case 'success':
        return 'text-green-700';
      case 'warning':
        return 'text-yellow-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading... / लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Teacher Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            शिक्षक लॉगिन
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Sign in to your teacher dashboard / अपने शिक्षक डैशबोर्ड में साइन इन करें
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Status Message */}
          {loginMessage && (
            <div className={`mb-6 border rounded-lg p-4 ${getMessageBgColor()}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getMessageIcon()}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${getMessageTextColor()}`}>
                    {loginMessage}
                  </p>
                  {messageType === 'warning' && (
                    <div className="mt-2">
                      <p className="text-xs text-yellow-600">
                        💡 You can check your application status by contacting the school administration.
                      </p>
                      <p className="text-xs text-yellow-600">
                        💡 आप स्कूल प्रशासन से संपर्क करके अपने आवेदन की स्थिति जांच सकते हैं।
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Mobile Number */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number / मोबाइल नंबर
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.mobile ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter your registered mobile number"
                />
              </div>
              {errors.mobile && (
                <p className="mt-2 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password / पासवर्ड
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in... / साइन इन हो रहे हैं...
                  </>
                ) : (
                  'Sign in / साइन इन करें'
                )}
              </button>
            </div>

            {/* Registration Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account? / खाता नहीं है?{' '}
                <Link
                  to="/teacher/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Register here / यहाँ रजिस्टर करें
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or / या</span>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ← Back to Home / होम पर वापस जाएं
              </Link>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Need Help? / सहायता चाहिए?
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• If you can't login, your application might be pending approval</p>
              <p>• यदि आप लॉगिन नहीं कर सकते, तो आपका आवेदन अनुमोदन की प्रतीक्षा में हो सकता है</p>
              <p>• Contact school administration: <span className="font-medium">+91-XXXXXXXXXX</span></p>
              <p>• स्कूल प्रशासन से संपर्क करें: <span className="font-medium">+91-XXXXXXXXXX</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin; 