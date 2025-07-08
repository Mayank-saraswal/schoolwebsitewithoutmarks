import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

const PaymentApprovalPanel = () => {
  const { isAuthenticated, loading: adminLoading } = useAdmin();
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    class: '',
    medium: ''
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    if (!adminLoading && isAuthenticated) {
      fetchPaymentRequests();
    }
  }, [filters, isAuthenticated, adminLoading]);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if admin is authenticated
      if (!isAuthenticated) {
        throw new Error('कृपया पहले लॉगिन करें / Please login first');
      }

      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/payments/admin/requests?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment requests');
      }

      if (data.success) {
        setPaymentRequests(data.data.requests);
        setStatistics(data.data.statistics);
      } else {
        throw new Error(data.message || 'Failed to fetch payment requests');
      }

    } catch (error) {
      console.error('Error fetching payment requests:', error);
      setError(error.message || 'Error fetching payment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId, action, remarks = '') => {
    try {
      setProcessing(true);

      // Check if admin is authenticated
      if (!isAuthenticated) {
        throw new Error('कृपया पहले लॉगिन करें / Please login first');
      }

      const response = await fetch(`/api/payments/admin/process/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          remarks
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process payment request');
      }

      if (data.success) {
        // Refresh the payment requests list
        await fetchPaymentRequests();
        setSelectedRequest(null);
      } else {
        throw new Error(data.message || 'Failed to process payment request');
      }

    } catch (error) {
      console.error('Error processing payment request:', error);
      alert(error.message || 'Error processing payment request');
    } finally {
      setProcessing(false);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const PaymentRequestModal = ({ request, onClose, onProcess }) => {
    const [remarks, setRemarks] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Request Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Request Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Student Name</label>
                <p className="font-medium">{request.studentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Class</label>
                <p className="font-medium">{request.class} ({request.medium})</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Type</label>
                <p className="font-medium">{request.type === 'class' ? 'Class Fee' : 'Bus Fee'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="font-medium text-green-600">{formatCurrency(request.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Parent Mobile</label>
                <p className="font-medium">{request.parentMobile}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Requested At</label>
                <p className="font-medium">{formatDate(request.requestedAt)}</p>
              </div>
            </div>

            {/* Payment Description */}
            <div>
              <label className="text-sm font-medium text-gray-600">Payment Description</label>
              <p className="mt-1 p-3 bg-gray-50 rounded-lg">{request.description}</p>
            </div>

            {/* Screenshot */}
            <div>
              <label className="text-sm font-medium text-gray-600">Payment Screenshot</label>
              <div className="mt-2">
                <img
                  src={`/api/payments/screenshot/${request.screenshotUrl.split('/').pop()}`}
                  alt="Payment Screenshot"
                  className="max-w-full h-64 object-contain rounded-lg border"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            {request.status === 'pending' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Remarks (Optional)
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any remarks for this request..."
                    maxLength={300}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => onProcess(request._id, 'approve', remarks)}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    {processing ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => onProcess(request._id, 'reject', remarks)}
                    disabled={processing}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    {processing ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            )}

            {/* Status and Processed Info */}
            {request.status !== 'pending' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <div className={`px-2 py-1 rounded text-sm ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </div>
                </div>
                {request.processedAt && (
                  <div className="text-sm text-gray-600">
                    Processed on: {formatDate(request.processedAt)}
                  </div>
                )}
                {request.processedByName && (
                  <div className="text-sm text-gray-600">
                    Processed by: {request.processedByName}
                  </div>
                )}
                {request.adminRemarks && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-600">Admin Remarks:</span>
                    <p className="text-sm text-gray-700 mt-1">{request.adminRemarks}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading while admin context is loading or data is loading
  if (adminLoading || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {adminLoading ? 'Authenticating... / प्रमाणीकरण हो रहा है...' : 'Loading payment requests... / भुगतान अनुरोध लोड हो रहे हैं...'}
          </p>
        </div>
      </div>
    );
  }

  // Show authentication error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">
            कृपया पहले लॉगिन करें / Please login first to access payment requests
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Reload Page / पेज रीलोड करें
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            <div className="text-sm text-yellow-800">Pending Requests</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
            <div className="text-sm text-green-800">Approved</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
            <div className="text-sm text-red-800">Rejected</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(statistics.approvedAmount)}</div>
            <div className="text-sm text-blue-800">Approved Amount</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="class">Class Fee</option>
            <option value="bus">Bus Fee</option>
          </select>
          <select
            value={filters.medium}
            onChange={(e) => setFilters(prev => ({ ...prev, medium: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Medium</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
          <button
            onClick={() => setFilters({ status: '', type: '', class: '', medium: '' })}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Payment Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Requests ({paymentRequests.length})
          </h3>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchPaymentRequests}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {paymentRequests.length === 0 && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No payment requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.studentName}</div>
                      <div className="text-sm text-gray-500">
                        {request.class} ({request.medium})
                      </div>
                      <div className="text-sm text-gray-500">{request.parentMobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.type === 'class' ? 'Class Fee' : 'Bus Fee'}
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(request.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Request Modal */}
      {selectedRequest && (
        <PaymentRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onProcess={handleProcessRequest}
        />
      )}
    </div>
  );
};

export default PaymentApprovalPanel; 