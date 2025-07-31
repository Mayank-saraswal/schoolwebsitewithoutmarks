import React, { useState, useEffect } from 'react';
import { useAdminAPI } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import {
  DollarSign,
  Search,
  Filter,
  Edit,
  Save,
  X,
  Plus,
  Eye,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  Receipt,
  History
} from 'lucide-react';

const AdminFeeManagement = () => {
  const { selectedMedium, selectedYear, isReady } = useAdminAPI();
  const { isDarkMode } = useTheme();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    class: 'all',
    feeStatus: 'all',
    hasBus: 'all'
  });
  
  const [editingStudent, setEditingStudent] = useState(null);
  const [feeUpdateData, setFeeUpdateData] = useState({
    classFeeTotal: 0,
    classFeeDiscount: 0,
    classFeePaid: 0,
    busFeeTotal: 0,
    busFeePaid: 0,
    paymentNote: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('class');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Load students with fee details
  const loadStudents = async () => {
    if (!isReady) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/students/fees?medium=${selectedMedium}&year=${selectedYear}&${new URLSearchParams(filters)}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStudents(data.data || []);
      } else {
        setError(data.message || 'Failed to load student fee data');
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load student fee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadStudents();
    }
  }, [isReady, selectedMedium, selectedYear, filters]);

  // Handle fee update
  const handleFeeUpdate = async (studentId) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}/fees`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(feeUpdateData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Fee details updated successfully! / फीस विवरण सफलतापूर्वक अपडेट किया गया!');
        setEditingStudent(null);
        loadStudents(); // Refresh the list
      } else {
        alert(data.message || 'Failed to update fee details');
      }
    } catch (error) {
      console.error('Error updating fees:', error);
      alert('Failed to update fee details');
    }
  };

  // Handle offline payment recording
  const handleOfflinePayment = async () => {
    if (!selectedStudentForPayment || !paymentAmount) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/admin/students/${selectedStudentForPayment._id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          type: paymentType,
          method: paymentMethod,
          paymentDate: feeUpdateData.paymentDate,
          note: feeUpdateData.paymentNote
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Payment recorded successfully! / भुगतान सफलतापूर्वक दर्ज किया गया!');
        setShowPaymentModal(false);
        setSelectedStudentForPayment(null);
        setPaymentAmount('');
        setFeeUpdateData(prev => ({ ...prev, paymentNote: '' }));
        loadStudents(); // Refresh the list
      } else {
        alert(data.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  // Start editing student fees
  const startEditing = (student) => {
    setEditingStudent(student._id);
    setFeeUpdateData({
      classFeeTotal: student.classFee?.total || 0,
      classFeeDiscount: student.classFee?.discount || 0,
      classFeePaid: student.classFee?.paid || 0,
      busFeeTotal: student.busFee?.total || 0,
      busFeePaid: student.busFee?.paid || 0,
      paymentNote: '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
  };

  // Open payment modal
  const openPaymentModal = (student) => {
    setSelectedStudentForPayment(student);
    setShowPaymentModal(true);
    setPaymentAmount('');
    setPaymentType('class');
    setPaymentMethod('cash');
  };

  const getFeeStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'Unpaid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFeeStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isReady) {
    return (
      <div className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'} rounded-lg`}>
        <div className="text-center">
          <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
            कृपया पहले माध्यम चुनें / Please select a medium first
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <DollarSign className="h-8 w-8 mr-3" />
              Fee Management / फीस प्रबंधन
            </h2>
            <div className="text-sm opacity-90">
              <span className="bg-green-800 px-2 py-1 rounded mr-2">
                {selectedMedium} Medium
              </span>
              <span className="bg-green-800 px-2 py-1 rounded">
                Academic Year: {selectedYear}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-lg border`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Class / कक्षा
            </label>
            <select
              value={filters.class}
              onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Classes</option>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Status / शुल्क स्थिति
            </label>
            <select
              value={filters.feeStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, feeStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid / भुगतान</option>
              <option value="partial">Partial / आंशिक</option>
              <option value="unpaid">Unpaid / अवैतनिक</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Service / बस सेवा
            </label>
            <select
              value={filters.hasBus}
              onChange={(e) => setFilters(prev => ({ ...prev, hasBus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Students</option>
              <option value="true">With Bus / बस के साथ</option>
              <option value="false">Without Bus / बस के बिना</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search / खोजें
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Name, SR Number, Mobile..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading fee data... / फीस डेटा लोड हो रहा है...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Students Fee Table */}
      {!loading && !error && students.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student / छात्र
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Fee / कक्षा शुल्क
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus Fee / बस शुल्क
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total / कुल
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status / स्थिति
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions / कार्रवाई
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.srNumber} • {student.class}
                          </div>
                          <div className="text-xs text-gray-400">
                            {student.parentMobile}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStudent === student._id ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Total:</span>
                            <input
                              type="number"
                              value={feeUpdateData.classFeeTotal}
                              onChange={(e) => setFeeUpdateData(prev => ({ ...prev, classFeeTotal: parseFloat(e.target.value) || 0 }))}
                              className="w-20 px-2 py-1 text-xs border rounded"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Discount:</span>
                            <input
                              type="number"
                              value={feeUpdateData.classFeeDiscount}
                              onChange={(e) => setFeeUpdateData(prev => ({ ...prev, classFeeDiscount: parseFloat(e.target.value) || 0 }))}
                              className="w-20 px-2 py-1 text-xs border rounded"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Paid:</span>
                            <input
                              type="number"
                              value={feeUpdateData.classFeePaid}
                              onChange={(e) => setFeeUpdateData(prev => ({ ...prev, classFeePaid: parseFloat(e.target.value) || 0 }))}
                              className="w-20 px-2 py-1 text-xs border rounded"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span>₹{(student.classFee?.total || 0).toLocaleString()}</span>
                          </div>
                          {student.classFee?.discount > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Discount:</span>
                              <span>-₹{(student.classFee.discount || 0).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-green-600">
                            <span>Paid:</span>
                            <span>₹{(student.classFee?.paid || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Pending:</span>
                            <span>₹{(student.classFee?.pending || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.hasBus ? (
                        editingStudent === student._id ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Total:</span>
                              <input
                                type="number"
                                value={feeUpdateData.busFeeTotal}
                                onChange={(e) => setFeeUpdateData(prev => ({ ...prev, busFeeTotal: parseFloat(e.target.value) || 0 }))}
                                className="w-20 px-2 py-1 text-xs border rounded"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Paid:</span>
                              <input
                                type="number"
                                value={feeUpdateData.busFeePaid}
                                onChange={(e) => setFeeUpdateData(prev => ({ ...prev, busFeePaid: parseFloat(e.target.value) || 0 }))}
                                className="w-20 px-2 py-1 text-xs border rounded"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span>₹{(student.busFee?.total || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Paid:</span>
                              <span>₹{(student.busFee?.paid || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Pending:</span>
                              <span>₹{(student.busFee?.pending || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        )
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>₹{(student.totalFee || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Paid:</span>
                          <span>₹{(student.totalFeePaid || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-600 font-medium">
                          <span>Balance:</span>
                          <span>₹{((student.totalFee || 0) - (student.totalFeePaid || 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFeeStatusIcon(student.feeStatus)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getFeeStatusColor(student.feeStatus)}`}>
                          {student.feeStatus}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingStudent === student._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFeeUpdate(student._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Save Changes"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingStudent(null)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(student)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Fee Details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openPaymentModal(student)}
                            className="text-green-600 hover:text-green-900"
                            title="Record Payment"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Students Found */}
      {!loading && !error && students.length === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Students Found / कोई छात्र नहीं मिला
          </h3>
          <p className="text-gray-500">
            No students match the current filters / वर्तमान फिल्टर से कोई छात्र मेल नहीं खाता
          </p>
        </div>
      )}

      {/* Payment Recording Modal */}
      {showPaymentModal && selectedStudentForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Record Payment / भुगतान दर्ज करें
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedStudentForPayment.studentName}</p>
                <p className="text-sm text-gray-600">{selectedStudentForPayment.srNumber} • {selectedStudentForPayment.class}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type / भुगतान प्रकार
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="class">Class Fee / कक्षा शुल्क</option>
                    <option value="bus">Bus Fee / बस शुल्क</option>
                    <option value="both">Both / दोनों</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount / राशि *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method / भुगतान विधि
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="cash">Cash / नकद</option>
                    <option value="cheque">Cheque / चेक</option>
                    <option value="online">Online Transfer / ऑनलाइन ट्रांसफर</option>
                    <option value="card">Card / कार्ड</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date / भुगतान तिथि
                  </label>
                  <input
                    type="date"
                    value={feeUpdateData.paymentDate}
                    onChange={(e) => setFeeUpdateData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note / टिप्पणी
                  </label>
                  <textarea
                    value={feeUpdateData.paymentNote}
                    onChange={(e) => setFeeUpdateData(prev => ({ ...prev, paymentNote: e.target.value }))}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Optional payment note..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleOfflinePayment}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                >
                  Record Payment / भुगतान दर्ज करें
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                >
                  Cancel / रद्द करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeeManagement;