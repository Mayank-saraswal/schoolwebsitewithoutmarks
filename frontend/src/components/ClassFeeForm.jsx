import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  BookOpen, 
  Plus, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  Check,
  Trash2,
  Calendar
} from 'lucide-react';

const ClassFeeForm = () => {
  const [formData, setFormData] = useState({
    class: '',
    medium: 'English',
    academicYear: new Date().getFullYear().toString(),
    feeStructure: {
      admissionFee: 0,
      tuitionFee: 0,
      bookFee: 0,
      uniformFee: 0,
      activityFee: 0,
      developmentFee: 0,
      otherFee: 0
    },
    paymentSchedule: 'Annual',
    installments: []
  });

  const [existingFees, setExistingFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFee, setSelectedFee] = useState(null);

  const classes = [
    'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
    'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
  ];

  const mediums = ['English', 'Hindi'];
  const paymentSchedules = ['Annual', 'Quarterly', 'Monthly'];

  const feeTypes = [
    { key: 'admissionFee', label: 'Admission Fee / प्रवेश शुल्क' },
    { key: 'tuitionFee', label: 'Tuition Fee / शिक्षण शुल्क', required: true },
    { key: 'bookFee', label: 'Book Fee / पुस्तक शुल्क' },
    { key: 'uniformFee', label: 'Uniform Fee / वर्दी शुल्क' },
    { key: 'activityFee', label: 'Activity Fee / गतिविधि शुल्क' },
    { key: 'developmentFee', label: 'Development Fee / विकास शुल्क' },
    { key: 'otherFee', label: 'Other Fee / अन्य शुल्क' }
  ];

  useEffect(() => {
    fetchExistingFees();
  }, []);

  const fetchExistingFees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/class-fees', {
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setExistingFees(data.data.classFees);
      }
    } catch (error) {
      console.error('Error fetching existing fees:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error loading existing fees / मौजूदा फीस लोड करने में त्रुटि' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('fee_')) {
      const feeKey = name.replace('fee_', '');
      setFormData(prev => ({
        ...prev,
        feeStructure: {
          ...prev.feeStructure,
          [feeKey]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateTotalFee = () => {
    return Object.values(formData.feeStructure).reduce((total, fee) => total + fee, 0);
  };

  const loadExistingFee = (fee) => {
    setSelectedFee(fee);
    setFormData({
      class: fee.class,
      medium: fee.medium,
      academicYear: fee.academicYear,
      feeStructure: fee.breakdown,
      paymentSchedule: fee.paymentSchedule || 'Annual',
      installments: fee.installments || []
    });
    
    // Scroll to form
    document.getElementById('fee-form').scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setSelectedFee(null);
    setFormData({
      class: '',
      medium: 'English',
      academicYear: new Date().getFullYear().toString(),
      feeStructure: {
        admissionFee: 0,
        tuitionFee: 0,
        bookFee: 0,
        uniformFee: 0,
        activityFee: 0,
        developmentFee: 0,
        otherFee: 0
      },
      paymentSchedule: 'Annual',
      installments: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.class || !formData.medium || !formData.feeStructure.tuitionFee) {
      setMessage({ 
        type: 'error', 
        text: 'Class, medium and tuition fee are required / कक्षा, माध्यम और शिक्षण शुल्क आवश्यक है' 
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const response = await fetch('/api/admin/set-class-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message 
        });
        
        // Refresh existing fees list
        await fetchExistingFees();
        
        // Reset form after 2 seconds
        setTimeout(() => {
          resetForm();
          setMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message 
        });
      }
    } catch (error) {
      console.error('Error saving class fee:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error saving fee / फीस सेव करने में त्रुटि' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center">
          <DollarSign className="h-8 w-8 mr-3" />
          <div>
            <h2 className="text-2xl font-bold">
              Class-wise Fee Management / कक्षावार फीस प्रबंधन
            </h2>
            <p className="text-blue-100 mt-1">
              Set tuition and other fees for each class and medium / प्रत्येक कक्षा और माध्यम के लिए शिक्षण और अन्य शुल्क निर्धारित करें
            </p>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Existing Fees List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Existing Fee Structures / मौजूदा फीस संरचनाएं
            </h3>
            <button
              onClick={fetchExistingFees}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Loading fees...</p>
            </div>
          ) : existingFees.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No fee structures configured yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingFees.map((fee, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {fee.class} ({fee.medium})
                    </h4>
                    <span className="text-xs text-gray-500">{fee.academicYear}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    ₹{fee.totalFee.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Payment: {fee.paymentSchedule}
                  </div>
                  <button
                    onClick={() => loadExistingFee(fee)}
                    className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm transition-colors"
                  >
                    Edit / संपादित करें
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fee Form */}
      <div id="fee-form" className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedFee ? 'Update Fee Structure / फीस संरचना अपडेट करें' : 'Set New Fee Structure / नई फीस संरचना सेट करें'}
            </h3>
            {selectedFee && (
              <button
                onClick={resetForm}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class / कक्षा *
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Class / कक्षा चुनें</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medium / माध्यम *
              </label>
              <select
                name="medium"
                value={formData.medium}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {mediums.map(medium => (
                  <option key={medium} value={medium}>{medium}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year / शैक्षणिक वर्ष
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2025"
              />
            </div>
          </div>

          {/* Fee Structure */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Fee Structure / फीस संरचना
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feeTypes.map(feeType => (
                <div key={feeType.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {feeType.label} {feeType.required && '*'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <input
                      type="number"
                      name={`fee_${feeType.key}`}
                      value={formData.feeStructure[feeType.key]}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      step="1"
                      required={feeType.required}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Fee Display */}
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-green-800">
                  Total Fee / कुल फीस:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{calculateTotalFee().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Schedule / भुगतान अनुसूची
            </label>
            <select
              name="paymentSchedule"
              value={formData.paymentSchedule}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {paymentSchedules.map(schedule => (
                <option key={schedule} value={schedule}>{schedule}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {selectedFee && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel / रद्द करें
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-md text-white font-medium flex items-center ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving... / सेव हो रहा है...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {selectedFee ? 'Update Fee / फीस अपडेट करें' : 'Save Fee / फीस सेव करें'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassFeeForm; 