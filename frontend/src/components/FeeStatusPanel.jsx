import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../context/ParentContext';

const FeeStatusPanel = ({ studentId }) => {
  const navigate = useNavigate();
  const { getStudentFees } = useParent();
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchFees();
    }
  }, [studentId]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStudentFees(studentId);
      
      if (response.ok && response.data.success) {
        setFeeData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch fees');
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      setError('फीस की जानकारी लाने में त्रुटि / Error fetching fee information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'Partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Unpaid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    // Safely handle undefined, null, or NaN values
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">फीस की जानकारी लोड हो रही है... / Loading fee information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">त्रुटि / Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchFees}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200"
        >
          पुनः प्रयास करें / Retry
        </button>
      </div>
    );
  }

  if (!feeData) return null;

  return (
    <div className="space-y-6">
      {/* Class Fee */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">कक्षा शुल्क / Class Fee</h3>
          <div className={`px-3 py-1 rounded-full border ${getStatusColor(feeData.classFee.status)}`}>
            <span className="text-sm font-medium">{feeData.classFee.status}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-900">{formatCurrency(feeData.classFee.total)}</p>
            <p className="text-sm text-gray-600">कुल / Total</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-xl font-bold text-green-600">{formatCurrency(feeData.classFee.paid)}</p>
            <p className="text-sm text-gray-600">भुगतान / Paid</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-xl font-bold text-red-600">{formatCurrency(feeData.classFee.pending)}</p>
            <p className="text-sm text-gray-600">शेष / Pending</p>
          </div>
        </div>

        {feeData.classFee.pending > 0 && (
          <button 
            onClick={() => navigate('/parent/payment')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
          >
            कक्षा शुल्क का भुगतान करें / Pay Class Fee
          </button>
        )}
      </div>

      {/* Bus Fee */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">बस शुल्क / Bus Fee</h3>
          {feeData.busFee.applicable ? (
            <div className={`px-3 py-1 rounded-full border ${getStatusColor(feeData.busFee.status)}`}>
              <span className="text-sm font-medium">{feeData.busFee.status}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">लागू नहीं / Not Applicable</span>
          )}
        </div>

        {feeData.busFee.applicable ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-900">{formatCurrency(feeData.busFee.total)}</p>
                <p className="text-sm text-gray-600">कुल / Total</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600">{formatCurrency(feeData.busFee.paid)}</p>
                <p className="text-sm text-gray-600">भुगतान / Paid</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-xl font-bold text-red-600">{formatCurrency(feeData.busFee.pending)}</p>
                <p className="text-sm text-gray-600">शेष / Pending</p>
              </div>
            </div>

            {feeData.busFee.pending > 0 && (
              <button 
                onClick={() => navigate('/parent/payment')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                बस शुल्क का भुगतान करें / Pay Bus Fee
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>इस छात्र ने बस सुविधा का उपयोग नहीं किया है</p>
            <p className="text-sm">This student has not opted for bus service</p>
          </div>
        )}
      </div>

      {/* Overall Summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">कुल फीस स्थिति / Overall Fee Status</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-purple-600">{formatCurrency(feeData.overall.totalFees)}</p>
            <p className="text-sm text-gray-600">कुल / Total</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">{formatCurrency(feeData.overall.totalPaid)}</p>
            <p className="text-sm text-gray-600">भुगतान / Paid</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-red-600">{formatCurrency(feeData.overall.totalPending)}</p>
            <p className="text-sm text-gray-600">शेष / Pending</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex px-3 py-1 rounded-full border ${getStatusColor(feeData.overall.status)}`}>
              <span className="text-sm font-medium">{feeData.overall.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeStatusPanel; 