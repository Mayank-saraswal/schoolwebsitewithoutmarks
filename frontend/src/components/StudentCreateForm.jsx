import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  BookOpen,
  DollarSign,
  Bus,
  Check,
  X,
  AlertCircle,
  Info,
  RefreshCw,
  CreditCard,
  FileText
} from 'lucide-react';

const StudentCreateForm = ({ onStudentCreated, onCancel }) => {
  const { teacher, getAuthToken } = useAuth();
  
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
    medium: 'Hindi', // Default medium
    hasBus: false,
    busRoute: '',
    notes: ''
  });

  const [formConfig, setFormConfig] = useState({
    subjects: [],
    classFee: 0,
    feeBreakdown: null,
    busRoutes: [],
    configComplete: false,
    warnings: []
  });

  const [selectedBusRoute, setSelectedBusRoute] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Auto-generate SR Number on component mount
  useEffect(() => {
    if (teacher) {
      fetchNextSRNumber();
      // Set teacher's medium as default
      setFormData(prev => ({
        ...prev,
        medium: teacher.medium || 'Hindi'
      }));
      if (formData.class) {
        fetchFormConfig(formData.class);
      }
    }
  }, [teacher]);

  // Fetch form configuration when class or medium changes
  useEffect(() => {
    if (formData.class && formData.medium && teacher) {
      fetchFormConfig(formData.class);
    }
  }, [formData.class, formData.medium]);

  const fetchNextSRNumber = async () => {
    try {
      const response = await fetch('/api/students/next-sr-number', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData(prev => ({
          ...prev,
          srNumber: data.data.nextSRNumber
        }));
      }
    } catch (error) {
      console.error('Error fetching SR number:', error);
    }
  };

  const fetchFormConfig = async (className) => {
    try {
      setIsLoadingConfig(true);
      // Use selected medium instead of teacher's medium
      const selectedMedium = formData.medium || teacher.medium || 'Hindi';
      const response = await fetch(`/api/config/student-form/${className}?medium=${selectedMedium}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormConfig(data.data);
        
        // Clear bus route if class changed
        if (formData.class !== className) {
          setFormData(prev => ({
            ...prev,
            busRoute: '',
            hasBus: false
          }));
          setSelectedBusRoute(null);
        }
      } else {
        setFormConfig(prev => ({
          ...prev,
          warnings: ['Failed to load form configuration. Please try again.']
        }));
      }
    } catch (error) {
      console.error('Error fetching form config:', error);
      setFormConfig(prev => ({
        ...prev,
        warnings: ['Failed to load form configuration. Please try again.']
      }));
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Handle bus route selection
    if (name === 'busRoute' && value) {
      const route = formConfig.busRoutes.find(r => r.value === value);
      setSelectedBusRoute(route);
    }

    // Clear bus route when hasBus is unchecked
    if (name === 'hasBus' && !checked) {
      setFormData(prev => ({
        ...prev,
        busRoute: ''
      }));
      setSelectedBusRoute(null);
    }

    // No stream clearing needed since stream is now part of class name
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required / छात्र का नाम आवश्यक है';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father name is required / पिता का नाम आवश्यक है';
    }

    if (!formData.motherName.trim()) {
      newErrors.motherName = 'Mother name is required / माता का नाम आवश्यक है';
    }

    if (!formData.srNumber.trim()) {
      newErrors.srNumber = 'SR Number is required / एसआर नंबर आवश्यक है';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required / पता आवश्यक है';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide complete address / कृपया पूरा पता दें';
    }

    if (!formData.parentMobile.trim()) {
      newErrors.parentMobile = 'Parent mobile is required / अभिभावक का मोबाइल आवश्यक है';
    } else if (!/^[6-9]\d{9}$/.test(formData.parentMobile.trim())) {
      newErrors.parentMobile = 'Please enter a valid 10-digit mobile number / कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें';
    }

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required / आधार नंबर आवश्यक है';
    } else if (!/^\d{12}$/.test(formData.aadharNumber.trim())) {
      newErrors.aadharNumber = 'Please enter a valid 12-digit Aadhar number / कृपया वैध 12-अंकीय आधार नंबर दर्ज करें';
    }

    if (!formData.janAadharNumber.trim()) {
      newErrors.janAadharNumber = 'Jan Aadhar number is required / जन आधार नंबर आवश्यक है';
    } else if (!/^[A-Z0-9]{10,15}$/.test(formData.janAadharNumber.trim().toUpperCase())) {
      newErrors.janAadharNumber = 'Please enter a valid Jan Aadhar number (10-15 alphanumeric characters) / कृपया वैध जन आधार नंबर दर्ज करें';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required / जन्म तिथि आवश्यक है';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 3 || age > 18) {
        newErrors.dateOfBirth = 'Student age must be between 3 and 18 years / छात्र की आयु 3 से 18 वर्ष के बीच होनी चाहिए';
      }
    }

    if (!formData.class) {
      newErrors.class = 'Class is required / कक्षा आवश्यक है';
    }

    if (!formData.medium) {
      newErrors.medium = 'Medium is required / माध्यम आवश्यक है';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required / पिन कोड आवश्यक है';
    } else if (!/^\d{6}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code / कृपया वैध 6-अंकीय पिन कोड दर्ज करें';
    }

    if (formData.hasBus && !formData.busRoute) {
      newErrors.busRoute = 'Please select a bus route / कृपया बस रूट चुनें';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!formConfig.configComplete) {
      alert('Form configuration is incomplete. Please contact admin to set up subjects and fees for this class.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setSubmitMessage(data.message);
        
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
          medium: teacher?.medium || 'Hindi',
          hasBus: false,
          busRoute: '',
          notes: ''
        });

        // Generate new SR number
        fetchNextSRNumber();

        // Call callback
        if (onStudentCreated) {
          onStudentCreated(data.data.student);
        }

        // Auto-close success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          setSubmitMessage('');
        }, 3000);

      } else {
        setSubmitSuccess(false);
        setSubmitMessage(data.message);

        // Handle field-specific errors
        if (data.errors) {
          setErrors(data.errors);
        }
        if (data.field) {
          setErrors(prev => ({
            ...prev,
            [data.field]: data.message
          }));
        }
      }
    } catch (error) {
      setSubmitSuccess(false);
      setSubmitMessage(
        error.response?.data?.message || 
        'Failed to create student. Please try again. / छात्र बनाने में विफल। कृपया पुनः प्रयास करें।'
      );

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalFee = () => {
    const classFee = formConfig.classFee || 0;
    const busFee = selectedBusRoute ? selectedBusRoute.fee : 0;
    return classFee + busFee;
  };

  // Success/Error message component
  const StatusMessage = () => {
    if (!submitMessage) return null;

    return (
      <div className={`mb-6 p-4 rounded-lg border ${
        submitSuccess 
          ? 'bg-green-50 border-green-200 text-green-700' 
          : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        <div className="flex items-center">
          {submitSuccess ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <p className="text-sm font-medium">{submitMessage}</p>
        </div>
      </div>
    );
  };

  // Configuration warnings component
  const ConfigWarnings = () => {
    if (formConfig.warnings.length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Configuration Issues / कॉन्फ़िगरेशन समस्याएं
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {formConfig.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create New Student / नया छात्र बनाएं
            </h2>
            <p className="text-sm text-gray-600">
              Add student for {teacher?.classTeacherOf} ({teacher?.medium} Medium)
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Status Messages */}
      <StatusMessage />
      <ConfigWarnings />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Name */}
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
              Student Name / छात्र का नाम *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.studentName ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter student name"
              />
            </div>
            {errors.studentName && (
              <p className="mt-1 text-sm text-red-600">{errors.studentName}</p>
            )}
          </div>

          {/* SR Number */}
          <div>
            <label htmlFor="srNumber" className="block text-sm font-medium text-gray-700 mb-2">
              SR Number / एसआर नंबर *
            </label>
            <div className="relative">
              <input
                type="text"
                id="srNumber"
                name="srNumber"
                value={formData.srNumber}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border ${
                  errors.srNumber ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="SR2024001"
              />
              <button
                type="button"
                onClick={fetchNextSRNumber}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            {errors.srNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.srNumber}</p>
            )}
          </div>
        </div>

        {/* Parents Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Father Name */}
          <div>
            <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-2">
              Father's Name / पिता का नाम *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.fatherName ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter father's name"
              />
            </div>
            {errors.fatherName && (
              <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>
            )}
          </div>

          {/* Mother Name */}
          <div>
            <label htmlFor="motherName" className="block text-sm font-medium text-gray-700 mb-2">
              Mother's Name / माता का नाम *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="motherName"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.motherName ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter mother's name"
              />
            </div>
            {errors.motherName && (
              <p className="mt-1 text-sm text-red-600">{errors.motherName}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parent Mobile */}
          <div>
            <label htmlFor="parentMobile" className="block text-sm font-medium text-gray-700 mb-2">
              Parent's Mobile / अभिभावक का मोबाइल *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="parentMobile"
                name="parentMobile"
                value={formData.parentMobile}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.parentMobile ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="10-digit mobile number"
              />
            </div>
            {errors.parentMobile && (
              <p className="mt-1 text-sm text-red-600">{errors.parentMobile}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth / जन्म तिथि *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
            )}
          </div>
        </div>

        {/* Government ID Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aadhar Number */}
          <div>
            <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Aadhar Number / आधार नंबर *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="aadharNumber"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.aadharNumber ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter 12-digit Aadhar number"
                maxLength={12}
              />
            </div>
            {errors.aadharNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.aadharNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter 12-digit Aadhar number without spaces
            </p>
          </div>

          {/* Jan Aadhar Number */}
          <div>
            <label htmlFor="janAadharNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Jan Aadhar Number / जन आधार नंबर *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="janAadharNumber"
                name="janAadharNumber"
                value={formData.janAadharNumber}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.janAadharNumber ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter Jan Aadhar number"
                maxLength={15}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            {errors.janAadharNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.janAadharNumber}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              10-15 alphanumeric characters (automatically converted to uppercase)
            </p>
          </div>
        </div>

        {/* Address and Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address / पता *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter complete address"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code / पिन कोड *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.postalCode ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter 6-digit PIN code"
                maxLength={6}
              />
            </div>
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              6-digit postal code / 6-अंकीय पिन कोड
            </p>
          </div>
        </div>

        {/* Class and Medium Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Selection */}
          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
              Class / कक्षा *
            </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-8 py-2 border ${
                errors.class ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Select Class / कक्षा चुनें</option>
              {[
                'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
                'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
                'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
                'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
              ].map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          {errors.class && (
            <p className="mt-1 text-sm text-red-600">{errors.class}</p>
          )}
                      <p className="mt-1 text-xs text-gray-500">
              Stream is included in class name for 11th & 12th / कक्षा 11 और 12 के लिए स्ट्रीम कक्षा नाम में शामिल है
            </p>
          </div>

          {/* Medium Selection */}
          <div>
            <label htmlFor="medium" className="block text-sm font-medium text-gray-700 mb-2">
              Medium / माध्यम *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="medium"
                name="medium"
                value={formData.medium}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-8 py-2 border ${
                  errors.medium ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="Hindi">Hindi / हिंदी</option>
                <option value="English">English / अंग्रेजी</option>
              </select>
            </div>
            {errors.medium && (
              <p className="mt-1 text-sm text-red-600">{errors.medium}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Select instruction medium / शिक्षा का माध्यम चुनें
            </p>
          </div>
        </div>

        {/* Bus Option */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasBus"
              name="hasBus"
              checked={formData.hasBus}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasBus" className="ml-2 block text-sm font-medium text-gray-700">
              <Bus className="inline h-4 w-4 mr-1" />
              Bus Transportation / बस परिवहन
            </label>
          </div>

          {formData.hasBus && (
            <div>
              <label htmlFor="busRoute" className="block text-sm font-medium text-gray-700 mb-2">
                Select Bus Route / बस रूट चुनें *
              </label>
              <select
                id="busRoute"
                name="busRoute"
                value={formData.busRoute}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border ${
                  errors.busRoute ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select Route / रूट चुनें</option>
                {formConfig.busRoutes.map(route => (
                  <option key={route.value} value={route.value}>
                    {route.label}
                  </option>
                ))}
              </select>
              {errors.busRoute && (
                <p className="mt-1 text-sm text-red-600">{errors.busRoute}</p>
              )}
            </div>
          )}
        </div>

        {/* Subjects and Fees Display */}
        {formData.class && !isLoadingConfig && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subjects */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                Subjects / विषय ({formConfig.subjects.length})
              </h3>
              {formConfig.subjects.length > 0 ? (
                <div className="space-y-1">
                  {formConfig.subjects.map((subject, index) => (
                    <div key={index} className="text-sm text-blue-700 flex items-center">
                      <Check className="h-3 w-3 mr-2" />
                      {subject.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-blue-600">No subjects configured</p>
              )}
            </div>

            {/* Fee Breakdown */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Fee Structure / फीस संरचना
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-green-700">
                  <span>Class Fee / कक्षा फीस:</span>
                  <span>₹{formConfig.classFee.toLocaleString()}</span>
                </div>
                {formData.hasBus && selectedBusRoute && (
                  <div className="flex justify-between text-green-700">
                    <span>Bus Fee / बस फीस:</span>
                    <span>₹{selectedBusRoute.fee.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-green-200 pt-2">
                  <div className="flex justify-between font-medium text-green-800">
                    <span>Total Fee / कुल फीस:</span>
                    <span>₹{calculateTotalFee().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes / टिप्पणी (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional notes..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel / रद्द करें
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formConfig.configComplete}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              isSubmitting || !formConfig.configComplete
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="inline h-4 w-4 mr-2 animate-spin" />
                Creating... / बना रहे हैं...
              </>
            ) : (
              'Create Student / छात्र बनाएं'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentCreateForm; 