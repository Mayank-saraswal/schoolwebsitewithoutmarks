import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../context/ParentContext';

const FeePaymentPage = () => {
  const { 
    isAuthenticated, 
    loading, 
    parent, 
    studentList, 
    getStudentFees
  } = useParent();
  
  const navigate = useNavigate();
  const [studentsWithFees, setStudentsWithFees] = useState([]);
  const [fetchingFees, setFetchingFees] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/parent/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch fee details for all students
  useEffect(() => {
    if (studentList && studentList.length > 0) {
      fetchAllStudentFees();
    }
  }, [studentList]);

  const fetchAllStudentFees = async () => {
    try {
      setFetchingFees(true);
      setError(null);
      
      const studentsWithFeeData = await Promise.all(
        studentList.map(async (student) => {
          try {
            const response = await getStudentFees(student._id);
            if (response.ok && response.data.success) {
              return {
                ...student,
                feeData: response.data.data
              };
            } else {
              return {
                ...student,
                feeData: null,
                feeError: response.data.message || 'Fee data not available'
              };
            }
          } catch (error) {
            return {
              ...student,
              feeData: null,
              feeError: 'Error fetching fee data'
            };
          }
        })
      );

      setStudentsWithFees(studentsWithFeeData);
    } catch (error) {
      console.error('Error fetching student fees:', error);
      setError('फीस की जानकारी प्राप्त करने में त्रुटि / Error fetching fee information');
    } finally {
      setFetchingFees(false);
    }
  };

  const handlePayment = (studentId, type, amount) => {
    navigate('/parent/payment/process', {
      state: {
        studentId,
        type,
        amount,
        studentData: studentsWithFees.find(s => s._id === studentId)
      }
    });
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'Partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Unpaid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading || fetchingFees) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">फीस की जानकारी लोड हो रही है... / Loading fee information...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/parent/dashboard')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← वापस / Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">फीस भुगतान / Fee Payment</h1>
                <p className="text-sm text-gray-500">अपने बच्चों की फीस का भुगतान करें / Pay fees for your children</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchAllStudentFees}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              पुनः प्रयास करें / Retry
            </button>
          </div>
        )}

        <div className="space-y-6">
          {studentsWithFees.map((student) => (
            <div key={student._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Student Header */}
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                    <p className="text-sm text-gray-600">
                      कक्षा / Class: {student.class} | माध्यम / Medium: {student.medium} | SR: {student.srNumber}
                    </p>
                  </div>
                  {student.feeData && (
                    <div className={`px-3 py-1 rounded-full border ${getStatusColor(student.feeData.overall.status)}`}>
                      <span className="text-sm font-medium">{student.feeData.overall.status}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Details */}
              {student.feeData ? (
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Class Fee */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">कक्षा शुल्क / Class Fee</h3>
                        <div className={`px-2 py-1 rounded text-xs ${getStatusColor(student.feeData.classFee.status)}`}>
                          {student.feeData.classFee.status}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>कुल / Total:</span>
                          <span className="font-medium">{formatCurrency(student.feeData.classFee.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>भुगतान / Paid:</span>
                          <span className="font-medium text-green-600">{formatCurrency(student.feeData.classFee.paid)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <span>शेष / Pending:</span>
                          <span className="text-red-600">{formatCurrency(student.feeData.classFee.pending)}</span>
                        </div>
                      </div>

                      {student.feeData.classFee.pending > 0 && (
                        <div className="space-y-3">
                          <input
                            type="number"
                            placeholder="Enter amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            defaultValue={student.feeData.classFee.pending}
                            min="1"
                            max={student.feeData.classFee.pending}
                            id={`class-amount-${student._id}`}
                          />
                          <button
                            onClick={() => {
                              const amount = document.getElementById(`class-amount-${student._id}`).value;
                              if (amount && amount > 0) {
                                handlePayment(student._id, 'class', parseFloat(amount));
                              }
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            कक्षा शुल्क का भुगतान करें / Pay Class Fee
                          </button>
                        </div>
                      )}

                      {student.feeData.classFee.pending === 0 && (
                        <div className="text-center py-2 text-green-600 font-medium">
                          ✓ पूर्ण भुगतान / Fully Paid
                        </div>
                      )}
                    </div>

                    {/* Bus Fee */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">बस शुल्क / Bus Fee</h3>
                        {student.feeData.busFee.applicable ? (
                          <div className={`px-2 py-1 rounded text-xs ${getStatusColor(student.feeData.busFee.status)}`}>
                            {student.feeData.busFee.status}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">लागू नहीं / N/A</span>
                        )}
                      </div>

                      {student.feeData.busFee.applicable ? (
                        <>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>कुल / Total:</span>
                              <span className="font-medium">{formatCurrency(student.feeData.busFee.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>भुगतान / Paid:</span>
                              <span className="font-medium text-green-600">{formatCurrency(student.feeData.busFee.paid)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold">
                              <span>शेष / Pending:</span>
                              <span className="text-red-600">{formatCurrency(student.feeData.busFee.pending)}</span>
                            </div>
                          </div>

                          {student.feeData.busFee.pending > 0 && (
                            <div className="space-y-3">
                              <input
                                type="number"
                                placeholder="Enter amount"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                defaultValue={student.feeData.busFee.pending}
                                min="1"
                                max={student.feeData.busFee.pending}
                                id={`bus-amount-${student._id}`}
                              />
                              <button
                                onClick={() => {
                                  const amount = document.getElementById(`bus-amount-${student._id}`).value;
                                  if (amount && amount > 0) {
                                    handlePayment(student._id, 'bus', parseFloat(amount));
                                  }
                                }}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
                              >
                                बस शुल्क का भुगतान करें / Pay Bus Fee
                              </button>
                            </div>
                          )}

                          {student.feeData.busFee.pending === 0 && (
                            <div className="text-center py-2 text-green-600 font-medium">
                              ✓ पूर्ण भुगतान / Fully Paid
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>इस छात्र ने बस सुविधा का उपयोग नहीं किया है</p>
                          <p className="text-sm">Bus service not opted</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-red-600">{student.feeError || 'Fee data not available'}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {studentsWithFees.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              कोई छात्र नहीं मिला / No Students Found
            </h3>
            <p className="text-gray-500">
              फीस भुगतान के लिए कोई छात्र उपलब्ध नहीं है
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeePaymentPage; 