import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useParent } from '../context/ParentContext';

const RazorpayPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, parent } = useParent();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Get payment details from navigation state
  const { studentId, type, amount, studentData } = location.state || {};

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/parent/login', { replace: true });
      return;
    }

    if (!studentId || !type || !amount || !studentData) {
      navigate('/parent/payment', { replace: true });
      return;
    }

    // Load Razorpay script
    loadRazorpayScript();
  }, [isAuthenticated, studentId, type, amount, studentData, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createPaymentOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('parentToken')}`
        },
        body: JSON.stringify({
          studentId,
          type,
          amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      if (data.success) {
        setPaymentData(data.data);
        openRazorpayCheckout(data.data);
      } else {
        throw new Error(data.message || 'Failed to create payment order');
      }

    } catch (error) {
      console.error('Payment order creation error:', error);
      setError(error.message || 'भुगतान आदेश बनाने में त्रुटि / Error creating payment order');
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = (orderData) => {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Saraswati School',
      description: orderData.description,
      order_id: orderData.orderId,
      handler: function (response) {
        handlePaymentSuccess(response, orderData);
      },
      prefill: {
        contact: parent?.mobile || '',
        email: '',
        name: studentData?.name || ''
      },
      notes: {
        student_id: studentId,
        student_name: studentData?.name || '',
        payment_type: type,
        class: studentData?.class || '',
        medium: studentData?.medium || ''
      },
      theme: {
        color: '#2563eb'
      },
      modal: {
        ondismiss: function() {
          setError('भुगतान रद्द कर दिया गया / Payment cancelled');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePaymentSuccess = (razorpayResponse, orderData) => {
    // Navigate to screenshot upload page with payment details
    navigate('/parent/payment/screenshot', {
      state: {
        studentId,
        type,
        amount,
        studentData,
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!studentId || !type || !amount || !studentData) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/parent/payment')}
                className="text-blue-600 hover:text-blue-800"
                disabled={loading}
              >
                ← वापस / Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">भुगतान प्रक्रिया / Payment Process</h1>
                <p className="text-sm text-gray-500">Razorpay सुरक्षित भुगतान / Razorpay Secure Payment</p>
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
        {/* Payment Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">भुगतान सारांश / Payment Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">छात्र / Student:</span>
              <span className="font-medium">{studentData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">कक्षा / Class:</span>
              <span className="font-medium">{studentData.class} ({studentData.medium})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">भुगतान प्रकार / Payment Type:</span>
              <span className="font-medium">
                {type === 'class' ? 'कक्षा शुल्क / Class Fee' : 'बस शुल्क / Bus Fee'}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-900 font-semibold">राशि / Amount:</span>
              <span className="font-bold text-blue-600">{formatCurrency(amount)}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={createPaymentOrder}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium text-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  प्रक्रिया में... / Processing...
                </>
              ) : (
                '₹ भुगतान करें / Pay Now'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Razorpay द्वारा सुरक्षित भुगतान / Secure payment by Razorpay
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">भुगतान निर्देश / Payment Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• भुगतान करने के लिए ऊपर "भुगतान करें" बटन पर क्लिक करें</li>
            <li>• Click "Pay Now" button above to proceed with payment</li>
            <li>• भुगतान सफल होने के बाद स्क्रीनशॉट अपलोड करना होगा</li>
            <li>• After successful payment, you'll need to upload a screenshot</li>
            <li>• एडमिन सत्यापन के बाद 24 घंटे में फीस अपडेट हो जाएगी</li>
            <li>• Fee will be updated within 24 hours after admin verification</li>
          </ul>
        </div>

        {/* Security Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-gray-900 mb-2">सुरक्षा नोटिस / Security Notice</h3>
          <p className="text-sm text-gray-700">
            यह भुगतान Razorpay के माध्यम से किया जा रहा है, जो पूर्णतः सुरक्षित है। 
            कृपया अपने कार्ड या बैंक की जानकारी किसी के साथ साझा न करें।
          </p>
          <p className="text-sm text-gray-700 mt-1">
            This payment is processed through Razorpay, which is completely secure. 
            Please do not share your card or bank details with anyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment; 