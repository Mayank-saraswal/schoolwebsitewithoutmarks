import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useParent } from '../context/ParentContext';

const ScreenshotUploadForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, parent } = useParent();
  
  const [formData, setFormData] = useState({
    screenshot: null,
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Get payment details from navigation state
  const {
    studentId,
    type,
    amount,
    studentData,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  } = location.state || {};

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/parent/login', { replace: true });
      return;
    }

    if (!studentId || !type || !amount || !studentData || !razorpayOrderId) {
      navigate('/parent/payment', { replace: true });
      return;
    }
  }, [isAuthenticated, studentId, type, amount, studentData, razorpayOrderId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('कृपया केवल इमेज फाइल अपलोड करें (PNG, JPG, JPEG) / Please upload only image files (PNG, JPG, JPEG)');
        return;
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setError('फाइल का साइज 2MB से कम होना चाहिए / File size should be less than 2MB');
        return;
      }

      setFormData(prev => ({ ...prev, screenshot: file }));
      setError(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionChange = (e) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.screenshot) {
      setError('कृपया भुगतान का स्क्रीनशॉट अपलोड करें / Please upload payment screenshot');
      return;
    }

    if (!formData.description.trim()) {
      setError('कृपया भुगतान का विवरण दें / Please provide payment description');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('screenshot', formData.screenshot);
      formDataToSend.append('studentId', studentId);
      formDataToSend.append('parentMobile', parent.mobile);
      formDataToSend.append('type', type);
      formDataToSend.append('amount', amount.toString());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('razorpayOrderId', razorpayOrderId);
      if (razorpayPaymentId) {
        formDataToSend.append('razorpayPaymentId', razorpayPaymentId);
      }

      const response = await fetch('/api/payments/upload-screenshot', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Screenshot upload failed');
      }

      if (data.success) {
        setSuccess(true);
      } else {
        throw new Error(data.message || 'Screenshot upload failed');
      }

    } catch (error) {
      console.error('Screenshot upload error:', error);
      setError(error.message || 'स्क्रीनशॉट अपलोड करने में त्रुटि / Error uploading screenshot');
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!studentId || !type || !amount || !studentData || !razorpayOrderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">भुगतान डेटा नहीं मिला / Payment data not found</p>
          <button
            onClick={() => navigate('/parent/payment')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            वापस जाएं / Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              सफलतापूर्वक जमा किया गया! / Successfully Submitted!
            </h2>
            <p className="text-gray-600 mb-4">
              आपका भुगतान अनुरोध सफलतापूर्वक जमा किया गया है। 24 घंटे में सत्यापन होगा। 
              यदि अपडेट नहीं हुआ तो संपर्क करें: <strong>9414790807</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your payment request has been submitted successfully. Verification within 24 hours. 
              If not updated, contact: <strong>9414790807</strong>
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/parent/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                डैशबोर्ड पर जाएं / Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/parent/payment')}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
              >
                और भुगतान करें / Make Another Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">स्क्रीनशॉट अपलोड / Screenshot Upload</h1>
                <p className="text-sm text-gray-500">भुगतान का प्रमाण अपलोड करें / Upload payment proof</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                मोबाइल / Mobile: {parent?.mobile}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Success Confirmation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">भुगतान सफल / Payment Successful</h3>
              <p className="text-sm text-green-700">
                {formatCurrency(amount)} का भुगतान सफलतापूर्वक किया गया / Payment of {formatCurrency(amount)} completed successfully
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">भुगतान विवरण / Payment Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">छात्र / Student:</span>
              <p className="font-medium">{studentData.name}</p>
            </div>
            <div>
              <span className="text-gray-600">कक्षा / Class:</span>
              <p className="font-medium">{studentData.class} ({studentData.medium})</p>
            </div>
            <div>
              <span className="text-gray-600">भुगतान प्रकार / Type:</span>
              <p className="font-medium">
                {type === 'class' ? 'कक्षा शुल्क / Class Fee' : 'बस शुल्क / Bus Fee'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">राशि / Amount:</span>
              <p className="font-medium text-green-600">{formatCurrency(amount)}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Payment ID:</span>
              <p className="font-mono text-xs">{razorpayPaymentId || razorpayOrderId}</p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">स्क्रीनशॉट अपलोड करें / Upload Screenshot</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                भुगतान स्क्रीनशॉट / Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label
                  htmlFor="screenshot-upload"
                  className="cursor-pointer block"
                >
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="Payment Screenshot Preview"
                        className="max-w-full h-48 object-contain mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">
                        क्लिक करके बदलें / Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <p>स्क्रीनशॉट अपलोड करने के लिए क्लिक करें / Click to upload screenshot</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG तक 2MB / PNG, JPG, JPEG up to 2MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                भुगतान विवरण / Payment Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="उदाहरण: GPay से 2:30 PM पर भुगतान किया / Example: Paid via GPay at 2:30 PM"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  अपलोड हो रहा है... / Uploading...
                </>
              ) : (
                'अनुरोध भेजें / Submit Request'
              )}
            </button>
          </form>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-900 mb-2">महत्वपूर्ण सूचना / Important Notice</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• कृपया स्पष्ट स्क्रीनशॉट अपलोड करें जिसमें राशि और समय दिखाई दे</li>
            <li>• Please upload a clear screenshot showing amount and time</li>
            <li>• सत्यापन के बाद 24 घंटे में फीस अपडेट हो जाएगी</li>
            <li>• Fee will be updated within 24 hours after verification</li>
            <li>• समस्या होने पर 9414790807 पर संपर्क करें</li>
            <li>• Contact 9414790807 for any issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotUploadForm; 