import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  User,
  Users,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Languages,
  Bus,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const AdminStudentCreateForm = ({ onStudentCreated, onCancel }) => {
  const { selectedMedium, selectedYear, isReady } = useAdmin();

  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    srNumber: '',
    address: '',
    postalCode: '',
    parentMobile: '',
    aadharNumber: '',
    janAadharNumber: '',
    dateOfBirth: '',
    class: '',
    medium: selectedMedium || 'Hindi',
    year: selectedYear || new Date().getFullYear(),
    hasBus: false,
    busRoute: '',
    subjects: [],
    classFee: 0,
    classFeeDiscount: 0,
    busFee: 0,
    totalFee: 0,
    feeStatus: 'Unpaid'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busRoutes, setBusRoutes] = useState([]);
  const [nextSRNumber, setNextSRNumber] = useState('');
  const [formConfig, setFormConfig] = useState({
    subjects: [],
    classFee: 0,
    busFee: 0
  });

  // Available classes
  const classes = [
    'Nursery', 'LKG', 'UKG',
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
    'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
  ];

  // Fetch next SR number on component mount
  useEffect(() => {
    if (isReady) {
      fetchNextSRNumber();
      fetchBusRoutes();
    }
  }, [isReady]);

  // Update form data when medium or year changes
  useEffect(() => {
    if (selectedMedium) {
      setFormData(prev => ({ ...prev, medium: selectedMedium }));
    }
    if (selectedYear) {
      setFormData(prev => ({ ...prev, year: selectedYear }));
    }
  }, [selectedMedium, selectedYear]);

  // Fetch form configuration when class changes
  useEffect(() => {
    if (formData.class && formData.medium) {
      fetchFormConfig();
    }
  }, [formData.class, formData.medium]);

  // Calculate total fee when class fee, discount, or bus fee changes
  useEffect(() => {
    const discountedClassFee = Math.max(0, formData.classFee - (formData.classFeeDiscount || 0));
    const total = discountedClassFee + (formData.hasBus ? formData.busFee : 0);
    setFormData(prev => ({ ...prev, totalFee: total }));
  }, [formData.classFee, formData.classFeeDiscount, formData.busFee, formData.hasBus]);

  const fetchNextSRNumber = async () => {
    try {
      const response = await fetch('/api/admin/next-sr-number', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setNextSRNumber(data.data.nextSRNumber);
        setFormData(prev => ({ ...prev, srNumber: data.data.nextSRNumber }));
      }
    } catch (error) {
      console.error('Error fetching next SR number:', error);
    }
  };

  const fetchBusRoutes = async () => {
    try {
      const response = await fetch('/api/admin/bus-routes', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setBusRoutes(data.data);
      }
    } catch (error) {
      console.error('Error fetching bus routes:', error);
    }
  };

  const fetchFormConfig = async () => {
    try {
      const response = await fetch(`/api/admin/student-form-config?class=${encodeURIComponent(formData.class)}&medium=${formData.medium}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setFormConfig(data.data);
        setFormData(prev => ({
          ...prev,
          subjects: data.data.subjects || [],
          classFee: data.data.classFee || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching form config:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBusRouteChange = (e) => {
    const routeId = e.target.value;
    const selectedRoute = busRoutes.find(route => route._id === routeId);

    setFormData(prev => ({
      ...prev,
      busRoute: routeId,
      busFee: selectedRoute ? selectedRoute.fee : 0
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'studentName', 'fatherName', 'motherName', 'srNumber', 'address',
      'parentMobile', 'dateOfBirth', 'class'
    ];

    for (let field of requiredFields) {
      if (!formData[field].trim()) {
        setError(`कृपया ${getFieldLabel(field)} भरें / Please fill ${getFieldLabel(field)}`);
        return false;
      }
    }



    // Validate mobile number
    if (!/^[6-9]\d{9}$/.test(formData.parentMobile)) {
      setError('कृपया वैध मोबाइल नंबर दर्ज करें / Please enter valid mobile number');
      return false;
    }

    // Validate bus route if bus is required
    if (formData.hasBus && !formData.busRoute) {
      setError('कृपया बस रूट चुनें / Please select bus route');
      return false;
    }

    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      studentName: 'Student Name / छात्र का नाम',
      fatherName: 'Father Name / पिता का नाम',
      motherName: 'Mother Name / माता का नाम',
      srNumber: 'SR Number / एसआर नंबर',
      address: 'Address / पता',
      parentMobile: 'Parent Mobile / अभिभावक मोबाइल',
      dateOfBirth: 'Date of Birth / जन्म तिथि',
      class: 'Class / कक्षा'
    };
    return labels[field] || field;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/add-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`छात्र सफलतापूर्वक जोड़ा गया! / Student added successfully! SR: ${data.data.srNumber}`);

        // Reset form
        setFormData({
          studentName: '',
          fatherName: '',
          motherName: '',
          srNumber: '',
          address: '',
          postalCode: '',
          parentMobile: '',
          aadharNumber: '',
          janAadharNumber: '',
          dateOfBirth: '',
          class: '',
          medium: selectedMedium || 'Hindi',
          year: selectedYear || new Date().getFullYear(),
          hasBus: false,
          busRoute: '',
          subjects: [],
          classFee: 0,
          classFeeDiscount: 0,
          busFee: 0,
          totalFee: 0,
          feeStatus: 'Unpaid'
        });

        // Fetch new SR number
        fetchNextSRNumber();

        // Call success callback
        if (onStudentCreated) {
          onStudentCreated(data.data);
        }

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);

      } else {
        setError(data.message || 'छात्र जोड़ने में त्रुटि / Error adding student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      setError('सर्वर त्रुटि। कृपया पुनः प्रयास करें / Server error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Add New Student / नया छात्र जोड़ें
              </h2>
              <p className="text-blue-100 text-sm">
                {selectedMedium} Medium • Academic Year {selectedYear}
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Basic Information / बुनियादी जानकारी
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name / छात्र का नाम *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter student name"
                  required
                />
              </div>
            </div>

            {/* SR Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SR Number / एसआर नंबर *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="srNumber"
                  value={formData.srNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter any SR Number format"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You can enter any format for SR Number as per your state requirements
              </p>
            </div>

            {/* Father Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Father Name / पिता का नाम *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter father name"
                  required
                />
              </div>
            </div>

            {/* Mother Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mother Name / माता का नाम *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter mother name"
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth / जन्म तिथि *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Parent Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Mobile / अभिभावक मोबाइल *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="parentMobile"
                  value={formData.parentMobile}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Academic Information / शैक्षणिक जानकारी
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class / कक्षा *
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Medium */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medium / माध्यम
              </label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="medium"
                  value={formData.medium}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  disabled
                >
                  <option value="Hindi">Hindi / हिन्दी</option>
                  <option value="English">English / अंग्रेजी</option>
                </select>
              </div>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year / शैक्षणिक वर्ष
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Subjects Display */}
          {formData.subjects.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects / विषय
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Address Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information / पता जानकारी
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Address */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address / पता *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter complete address"
                  required
                />
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code / पिन कोड
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="PIN Code"
                pattern="[0-9]{6}"
              />
            </div>
          </div>
        </div>

        {/* Transportation */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Bus className="h-5 w-5 mr-2" />
            Transportation / परिवहन
          </h3>

          <div className="space-y-4">
            {/* Bus Required Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="hasBus"
                name="hasBus"
                checked={formData.hasBus}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasBus" className="text-sm font-medium text-gray-700">
                Bus Required / बस की आवश्यकता है
              </label>
            </div>

            {/* Bus Route Selection */}
            {formData.hasBus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bus Route / बस रूट चुनें *
                </label>
                <div className="relative">
                  <Bus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    name="busRoute"
                    value={formData.busRoute}
                    onChange={handleBusRouteChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    required={formData.hasBus}
                  >
                    <option value="">Select Bus Route</option>
                    {busRoutes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.routeName} - ₹{route.fee}/month
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fee Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Fee Information / फीस जानकारी
          </h3>

          {/* Discount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Fee Discount / कक्षा फीस छूट
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                name="classFeeDiscount"
                value={formData.classFeeDiscount}
                onChange={handleInputChange}
                min="0"
                max={formData.classFee}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter discount amount (maximum: ₹{formData.classFee.toLocaleString()})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Original Class Fee / मूल कक्षा फीस</div>
              <div className="text-2xl font-bold text-blue-600">₹{formData.classFee.toLocaleString()}</div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Discount / छूट</div>
              <div className="text-2xl font-bold text-red-600">-₹{(formData.classFeeDiscount || 0).toLocaleString()}</div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Bus Fee / बस फीस</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{formData.hasBus ? formData.busFee.toLocaleString() : 0}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200 bg-purple-50">
              <div className="text-sm text-purple-600 mb-1 font-medium">Final Total Fee / अंतिम कुल फीस</div>
              <div className="text-2xl font-bold text-purple-600">₹{formData.totalFee.toLocaleString()}</div>
            </div>
          </div>

          {/* Fee Breakdown */}
          {formData.classFeeDiscount > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Fee Breakdown:</strong> Original Class Fee (₹{formData.classFee.toLocaleString()}) - Discount (₹{formData.classFeeDiscount.toLocaleString()}) + Bus Fee (₹{formData.hasBus ? formData.busFee.toLocaleString() : 0}) = <strong>₹{formData.totalFee.toLocaleString()}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Additional Information / अतिरिक्त जानकारी
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Aadhar Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhar Number / आधार नंबर
              </label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="12-digit Aadhar number"
                pattern="[0-9]{12}"
              />
            </div>

            {/* Jan Aadhar Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jan Aadhar Number / जन आधार नंबर
              </label>
              <input
                type="text"
                name="janAadharNumber"
                value={formData.janAadharNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Jan Aadhar number"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin h-5 w-5" />
                <span>Adding Student... / छात्र जोड़ा जा रहा है...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Add Student / छात्र जोड़ें</span>
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Cancel / रद्द करें
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminStudentCreateForm;