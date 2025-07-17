import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  DollarSign,
  Bus,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  FileText,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { useAdminAPI } from '../context/AdminContext';

const StudentList = ({ refreshTrigger, onEditStudent, onStudentDeleted, mode = 'teacher' }) => {
  const { getAuthToken, teacher } = useAuth();
  const { getStudents, selectedMedium, selectedYear, isReady } = useAdminAPI();
  
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    class: 'all',
    feeStatus: 'all',
    hasBus: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load students data
  const loadStudents = async () => {
    // For teacher mode, don't require admin context to be ready
    if (mode === 'admin' && !isReady) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (mode === 'teacher') {
        // Use teacher API endpoint
        const queryParams = new URLSearchParams({
          ...filters,
          academicYear: new Date().getFullYear().toString()
        });
        
        const res = await fetch(`/api/students/my-students?${queryParams}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          response = data;
        } else {
          throw new Error(data.message || 'Failed to load students');
        }
      } else {
        // Use admin API endpoint
        response = await getStudents(filters);
      }
      
      if (response.success) {
        setStudents(response.data);
        setStats(response.stats);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to load students');
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when filters or year/medium changes
  useEffect(() => {
    // For teacher mode, load immediately. For admin mode, wait for context.
    if (mode === 'teacher' || isReady) {
      loadStudents();
    }
  }, [filters, selectedYear, selectedMedium, isReady, mode]);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadStudents();
    }
  }, [refreshTrigger]);

  // Handle student deletion
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/students/${studentToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message
        alert(data.message || 'Student deleted successfully / छात्र सफलतापूर्वक हटा दिया गया');
        
        // Close modal
        setShowDeleteConfirm(false);
        setStudentToDelete(null);
        
        // Call the callback if provided
        if (onStudentDeleted) {
          onStudentDeleted();
        }
        
        // Refresh the student list
        await loadStudents();
      } else {
        throw new Error(data.message || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error.message || 'Failed to delete student / छात्र हटाने में त्रुटि');
    } finally {
      setDeleting(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value.trim();
    handleFilterChange('search', searchTerm);
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

  const viewStudentDetails = async (studentId) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedStudent(data.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  // Statistics Cards Component
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-800">{stats.total || 0}</p>
            <p className="text-sm text-blue-600">Total Students</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-800">{stats.feePaid || 0}</p>
            <p className="text-sm text-green-600">Fee Paid</p>
          </div>
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-800">{stats.feeUnpaid || 0}</p>
            <p className="text-sm text-red-600">Fee Unpaid</p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <Bus className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-800">{stats.withBus || 0}</p>
            <p className="text-sm text-purple-600">With Bus</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Student Details Modal Component
  const StudentDetailsModal = () => {
    if (!showDetails || !selectedStudent) return null;

    const student = selectedStudent.student;
    const pendingFees = selectedStudent.pendingFees;
    const busDetails = selectedStudent.busDetails;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{student.studentName}</h2>
                  <p className="text-gray-600">{student.srNumber} • {student.class}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Student Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Father's Name</p>
                      <p className="font-medium">{student.fatherName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Mother's Name</p>
                      <p className="font-medium">{student.motherName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Parent's Mobile</p>
                      <p className="font-medium">{student.parentMobile}</p>
                    </div>
                  </div>
                  {student.aadharNumber && (
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Aadhar Number</p>
                        <p className="font-medium">{student.aadharNumber}</p>
                      </div>
                    </div>
                  )}
                  {student.janAadharNumber && (
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Jan Aadhar Number</p>
                        <p className="font-medium">{student.janAadharNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Academic Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600">Class & Medium</p>
                      <p className="font-medium text-blue-900">
                        {student.class} ({student.medium})
                        {student.stream && (
                          <span className="text-sm text-purple-600 ml-2">
                            - {student.stream} Stream
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600">Subjects ({student.subjects?.length || 0})</p>
                      {student.subjects && student.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {student.subjects.slice(0, 3).map((subject, index) => (
                            <span key={index} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                              {subject}
                            </span>
                          ))}
                          {student.subjects.length > 3 && (
                            <span className="text-xs text-blue-600">+{student.subjects.length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">No subjects found</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address
                </h3>
                <p className="text-gray-700">{student.address}</p>
              </div>
            </div>

            {/* Fee Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Fee Structure
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Class Fee:</span>
                    <span>₹{student.classFee.toLocaleString()}</span>
                  </div>
                  {student.hasBus && (
                    <div className="flex justify-between">
                      <span>Bus Fee:</span>
                      <span>₹{student.busFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 font-medium">
                    <div className="flex justify-between">
                      <span>Total Fee:</span>
                      <span>₹{student.totalFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Fee Status</h3>
                <div className="flex items-center mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeeStatusColor(student.feeStatus)}`}>
                    {student.feeStatus}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span>₹{student.totalFeePaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-700">
                    <span>Balance:</span>
                    <span>₹{pendingFees.totalBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bus Information */}
            {student.hasBus && busDetails && (
              <div className="mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <Bus className="h-5 w-5 mr-2" />
                    Bus Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-purple-600">Route:</p>
                      <p className="font-medium">{busDetails.routeName} ({busDetails.routeCode})</p>
                    </div>
                    <div>
                      <p className="text-purple-600">Driver:</p>
                      <p className="font-medium">{busDetails.driverName}</p>
                    </div>
                    <div>
                      <p className="text-purple-600">Driver Mobile:</p>
                      <p className="font-medium">{busDetails.driverMobile}</p>
                    </div>
                    <div>
                      <p className="text-purple-600">Bus Number:</p>
                      <p className="font-medium">{busDetails.busNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {student.notes && (
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                  <p className="text-gray-700">{student.notes}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isReady) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg">
        <div className="text-center">
          <div className="text-blue-600 mb-2">
            कृपया पहले माध्यम चुनें / Please select a medium first
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with year/medium info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">
          छात्र सूची / Student List
        </h2>
        <div className="text-sm opacity-90">
          <span className="bg-blue-800 px-2 py-1 rounded mr-2">
            {selectedMedium} Medium
          </span>
          <span className="bg-blue-800 px-2 py-1 rounded">
            Academic Year: {selectedYear}
          </span>
        </div>
      </div>

      {/* Statistics */}
      <StatsCards />

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class / कक्षा
            </label>
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classes</option>
              <option value="Nursery">Nursery</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">3rd</option>
              <option value="4th">4th</option>
              <option value="5th">5th</option>
              <option value="6th">6th</option>
              <option value="7th">7th</option>
              <option value="8th">8th</option>
              <option value="9th">9th</option>
              <option value="10th">10th</option>
              <option value="Class 11 Science">Class 11 Science</option>
              <option value="Class 11 Arts">Class 11 Arts</option>
              <option value="Class 11 Commerce">Class 11 Commerce</option>
              <option value="Class 12 Science">Class 12 Science</option>
              <option value="Class 12 Arts">Class 12 Arts</option>
              <option value="Class 12 Commerce">Class 12 Commerce</option>
            </select>
          </div>

          {/* Fee Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Status / शुल्क स्थिति
            </label>
            <select
              value={filters.feeStatus}
              onChange={(e) => handleFilterChange('feeStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid / भुगतान</option>
              <option value="partial">Partial / आंशिक</option>
              <option value="unpaid">Unpaid / अवैतनिक</option>
            </select>
          </div>

          {/* Bus Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Service / बस सेवा
            </label>
            <select
              value={filters.hasBus}
              onChange={(e) => handleFilterChange('hasBus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="true">With Bus / बस के साथ</option>
              <option value="false">Without Bus / बस के बिना</option>
            </select>
          </div>

          {/* Limit Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Per Page / प्रति पृष्ठ
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            name="search"
            placeholder="Search by name, SR number, phone... / नाम, एसआर नंबर, फोन से खोजें..."
            defaultValue={filters.search}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search / खोजें
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading students... / छात्र लोड हो रहे हैं...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Students Table */}
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
                    SR Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class / कक्षा
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parents / अभिभावक
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Status / शुल्क
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus / बस
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By / द्वारा बनाया गया
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.studentName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.parentMobile}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.srNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.class}
                      {student.stream && (
                        <div className="text-xs text-blue-600">
                          {student.stream}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Father: {student.fatherName}</div>
                        <div>Mother: {student.motherName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.feeStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : student.feeStatus === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.feeStatus === 'paid' ? 'Paid' : 
                         student.feeStatus === 'partial' ? 'Partial' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.hasBus ? (
                        <span className="text-green-600">✓ {student.busRoute}</span>
                      ) : (
                        <span className="text-gray-500">No Bus</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.createdByName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewStudentDetails(student._id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Details / विवरण देखें"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {onEditStudent && (
                          <button
                            onClick={() => onEditStudent(student)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Student / छात्र संपादित करें"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setStudentToDelete(student._id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete Student / छात्र हटाएं"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.totalRecords}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && students.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            कोई छात्र नहीं मिला / No students found
          </div>
          <div className="text-sm text-gray-400">
            Try adjusting your search criteria or filters
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      <StudentDetailsModal />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-800">
                    Delete Student / छात्र हटाएं
                  </h2>
                </div>
              </div>

              {/* Student Info */}
              {studentToDelete && (() => {
                const student = students.find(s => s._id === studentToDelete);
                if (student) {
                  return (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="text-sm text-gray-600 mb-1">Student Details:</div>
                      <div className="font-medium text-gray-900">{student.studentName}</div>
                      <div className="text-sm text-gray-600">
                        SR: {student.srNumber} • Class: {student.class}
                      </div>
                      <div className="text-sm text-gray-600">
                        Father: {student.fatherName}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Warning Message */}
              <div className="mb-6">
                <p className="text-gray-700 text-center">
                  <strong className="text-red-600">⚠️ Warning:</strong><br/>
                  Are you sure you want to delete this student?<br/>
                  <span className="text-sm text-gray-600">
                    This action cannot be undone.<br/>
                    क्या आप वाकई इस छात्र को हटाना चाहते हैं?<br/>
                    यह क्रिया पूर्ववत नहीं की जा सकती।
                  </span>
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setStudentToDelete(null);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={deleting}
                >
                  Cancel / रद्द करें
                </button>
                <button
                  onClick={handleDeleteStudent}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete / हटाएं
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList; 