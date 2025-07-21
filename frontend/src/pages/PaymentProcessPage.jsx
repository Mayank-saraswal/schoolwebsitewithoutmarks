import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useParent } from '../context/ParentContext';

const PaymentProcessPage = () => {
  const { isAuthenticated, loading, apiCall } = useParent();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStep, setPaymentStep] = useState('details'); // details, payment, screenshot, success
  const [processingPayment, setProcessingPayment] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [error, setError] = useState(null);

  // Get payment data from navigation state
  useEffect(() => {
    if (location.state) {
      setPaymentData(location.state);
    } else {
      // If no state, redirect back to payment page
      navigate('/parent/payment', { replace: true });
    }
  }, [location.state, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/parent/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const formatCurrency = (amount) => {
    const safeAmount = Number(amount || 0);
    if (isNaN(safeAmount)) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safeAmount);
  };

  const handlePaymentOrder = async () => {
    try {
      setProcessingPayment(true);
      setError(null);

      const response = await apiCall('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          studentId: paymentData.studentId,
          type: paymentData.type,
          amount: paymentData.amount
        })
      });

      if (response.ok && response.data.success) {
        const orderData = response.data.data;
        
        // Check if Razorpay is loaded
        if (!window.Razorpay) {
          setError('भुगतान सेवा लोड नहीं हुई। पेज को रीफ्रेश करें / Payment service not loaded. Please refresh the page');
          return;
        }
        
        // Initialize Razorpay payment
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Saraswati School',
          description: orderData.description,
          order_id: orderData.orderId,
          handler: function (response) {
            // Payment successful
            setPaymentData(prev => ({
              ...prev,
              razorpayOrderId: orderData.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            }));
            setPaymentStep('screenshot');
          },
          prefill: {
            name: paymentData.studentData?.name || '',
            contact: paymentData.studentData?.parentMobile || ''
          },
          theme: {
            color: '#2563eb'
          },
          modal: {
            ondismiss: function() {
              setProcessingPayment(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setError(response.data.message || 'Payment order creation failed');
      }
    } catch (error) {
      console.error('Payment order error:', error);
      setError('भुगतान आदेश बनाने में त्रुटि / Error creating payment order');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleScreenshotUpload = async () => {
    if (!screenshot) {
      setError('कृपया भुगतान का स्क्रीनशॉट अपलोड करें / Please upload payment screenshot');
      return;
    }

    try {
      setUploadingScreenshot(true);
      setError(null);

      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('studentId', paymentData.studentId);
      formData.append('parentMobile', paymentData.studentData.parentMobile || '');
      formData.append('type', paymentData.type);
      formData.append('amount', paymentData.amount);
      formData.append('description', `${paymentData.studentData.name} - ${paymentData.type === 'class' ? 'Class Fee' : 'Bus Fee'}`);
      formData.append('razorpayOrderId', paymentData.razorpayOrderId);
      formData.append('razorpayPaymentId', paymentData.razorpayPaymentId || '');

      const response = await fetch('/api/payments/upload-screenshot', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPaymentStep('success');
      } else {
        setError(result.message || 'Screenshot upload failed');
      }
    } catch (error) {
      console.error('Screenshot upload error:', error);
      setError('स्क्रीनशॉट अपलोड करने में त्रुटि / Error uploading screenshot');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('फाइल का साइज 2MB से कम होना चाहिए / File size should be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('केवल इमेज फाइल अपलोड करें / Only image files are allowed');
        return;
      }
      setScreenshot(file);
      setError(null);
    }
  };

  if (loading || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/parent/payment')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← वापस / Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">फीस भुगतान प्रक्रिया / Fee Payment Process</h1>
                <p className="text-sm text-gray-500">{paymentData.studentData?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${paymentStep === 'details' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                paymentStep === 'details' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {paymentStep === 'details' ? '1' : '✓'}
              </div>
              <span className="ml-2 text-sm font-medium">विवरण / Details</span>
            </div>
            
            <div className="w-16 h-1 bg-gray-200">
              <div className={`h-full ${['payment', 'screenshot', 'success'].includes(paymentStep) ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            </div>
            
            <div className={`flex items-center ${
              paymentStep === 'payment' ? 'text-blue-600' : 
              ['screenshot', 'success'].includes(paymentStep) ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                paymentStep === 'payment' ? 'bg-blue-600 text-white' : 
                ['screenshot', 'success'].includes(paymentStep) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {['screenshot', 'success'].includes(paymentStep) ? '✓' : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">भुगतान / Payment</span>
            </div>
            
            <div className="w-16 h-1 bg-gray-200">
              <div className={`h-full ${['screenshot', 'success'].includes(paymentStep) ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            </div>
            
            <div className={`flex items-center ${
              paymentStep === 'screenshot' ? 'text-blue-600' : 
              paymentStep === 'success' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                paymentStep === 'screenshot' ? 'bg-blue-600 text-white' : 
                paymentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {paymentStep === 'success' ? '✓' : '3'}
              </div>
              <span className="ml-2 text-sm font-medium">स्क्रीनशॉट / Screenshot</span>
            </div>
            
            <div className="w-16 h-1 bg-gray-200">
              <div className={`h-full ${paymentStep === 'success' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            </div>
            
            <div className={`flex items-center ${paymentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                paymentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {paymentStep === 'success' ? '✓' : '4'}
              </div>
              <span className="ml-2 text-sm font-medium">पूर्ण / Complete</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Payment Details Step */}
        {paymentStep === 'details' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">भुगतान विवरण / Payment Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">छात्र विवरण / Student Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">नाम / Name:</span> {paymentData.studentData?.name}</p>
                  <p><span className="font-medium">कक्षा / Class:</span> {paymentData.studentData?.class}</p>
                  <p><span className="font-medium">माध्यम / Medium:</span> {paymentData.studentData?.medium}</p>
                  <p><span className="font-medium">SR नंबर / SR Number:</span> {paymentData.studentData?.srNumber}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">भुगतान विवरण / Payment Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">प्रकार / Type:</span> {paymentData.type === 'class' ? 'कक्षा शुल्क / Class Fee' : 'बस शुल्क / Bus Fee'}</p>
                  <p><span className="font-medium">राशि / Amount:</span> <span className="text-xl font-bold text-green-600">{formatCurrency(paymentData.amount)}</span></p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handlePaymentOrder}
                disabled={processingPayment}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {processingPayment ? 'प्रोसेसिंग... / Processing...' : 'भुगतान करें / Proceed to Payment'}
              </button>
            </div>
          </div>
        )}

        {/* Screenshot Upload Step */}
        {paymentStep === 'screenshot' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">भुगतान स्क्रीनशॉट अपलोड करें / Upload Payment Screenshot</h2>
            
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ भुगतान सफल / Payment Successful</p>
                <p className="text-green-600 text-sm">राशि: {formatCurrency(paymentData.amount)}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                भुगतान का स्क्रीनशॉट अपलोड करें / Upload Payment Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Max 2MB)</p>
            </div>

            {screenshot && (
              <div className="mb-6">
                <p className="text-sm text-green-600">✓ फाइल चुनी गई: {screenshot.name}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setPaymentStep('details')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                वापस / Back
              </button>
              <button
                onClick={handleScreenshotUpload}
                disabled={!screenshot || uploadingScreenshot}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {uploadingScreenshot ? 'अपलोड हो रहा है... / Uploading...' : 'अपलोड करें / Upload'}
              </button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {paymentStep === 'success' && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">भुगतान अनुरोध जमा किया गया / Payment Request Submitted</h2>
              <p className="text-gray-600">
                आपका भुगतान अनुरोध सफलतापूर्वक जमा किया गया है। 24 घंटे में सत्यापन होगा।
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Your payment request has been submitted successfully. Verification within 24 hours.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium">महत्वपूर्ण / Important:</p>
              <p className="text-blue-700 text-sm">
                यदि 24 घंटे में अपडेट नहीं हुआ तो संपर्क करें: <strong>9414790807</strong>
              </p>
              <p className="text-blue-700 text-sm">
                If not updated within 24 hours, contact: <strong>9414790807</strong>
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/parent/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                डैशबोर्ड पर जाएं / Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/parent/payment')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                अन्य भुगतान / Other Payments
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessPage;