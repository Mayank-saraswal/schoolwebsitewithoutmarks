import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye,
  Phone,
  Mail,
  GraduationCap,
  BookOpen,
  Globe,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const TeacherRequestViewer = () => {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    english: 0,
    hindi: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'pending',
    medium: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  const [actionLoading, setActionLoading] = useState({});
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [teacherToReject, setTeacherToReject] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, [filters, pagination.currentPage]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        status: filters.status,
        medium: filters.medium !== 'all' ? filters.medium : undefined,
        search: filters.search || undefined
      };

      const response = await axios.get('/api/admin/teacher-requests', { params });

      if (response.data.success) {
        setTeachers(response.data.data);
        setStats(response.data.stats);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId) => {
    setActionLoading(prev => ({ ...prev, [teacherId]: 'approving' }));
    
    try {
      const response = await axios.patch(`/api/admin/approve-teacher/${teacherId}`);
      
      if (response.data.success) {
        await fetchTeachers(); // Refresh the list
        alert('Teacher approved successfully! / शिक्षक को सफलतापूर्वक अनुमोदित किया गया!');
      }
    } catch (error) {
      console.error('Error approving teacher:', error);
      alert('Failed to approve teacher / शिक्षक को अनुमोदित करने में विफल');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[teacherId];
        return newState;
      });
    }
  };

  const handleReject = async (teacherId, reason) => {
    setActionLoading(prev => ({ ...prev, [teacherId]: 'rejecting' }));
    
    try {
      const response = await axios.patch(`/api/admin/reject-teacher/${teacherId}`, {
        reason: reason || 'No reason provided'
      });
      
      if (response.data.success) {
        await fetchTeachers(); // Refresh the list
        setShowRejectModal(false);
        setTeacherToReject(null);
        setRejectReason('');
        alert('Teacher rejected successfully! / शिक्षक को सफलतापूर्वक अस्वीकार किया गया!');
      }
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      alert('Failed to reject teacher / शिक्षक को अस्वीकार करने में विफल');
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[teacherId];
        return newState;
      });
    }
  };

  const openRejectModal = (teacher) => {
    setTeacherToReject(teacher);
    setShowRejectModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (teacher) => {
    if (teacher.isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved / अनुमोदित
        </span>
      );
    }
    if (teacher.isRejected) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected / अस्वीकृत
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending / लंबित
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  // Detail Modal Component
  const DetailModal = () => {
    if (!selectedTeacher) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Teacher Details / शिक्षक विवरण
            </h3>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name / पूरा नाम</label>
                <p className="text-gray-900">{selectedTeacher.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teacher ID / शिक्षक आईडी</label>
                <p className="text-gray-900">{selectedTeacher.teacherId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mobile / मोबाइल</label>
                <p className="text-gray-900">{selectedTeacher.mobile}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email / ईमेल</label>
                <p className="text-gray-900">{selectedTeacher.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Class / कक्षा</label>
                <p className="text-gray-900">{selectedTeacher.classTeacherOf}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Medium / माध्यम</label>
                <p className="text-gray-900">{selectedTeacher.medium}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Qualification / योग्यता</label>
                <p className="text-gray-900">{selectedTeacher.qualification}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status / स्थिति</label>
                <div className="mt-1">
                  {getStatusBadge(selectedTeacher)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Applied On / आवेदन दिनांक</label>
                <p className="text-gray-900">{formatDate(selectedTeacher.createdAt)}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500">Address / पता</label>
            <p className="text-gray-900 mt-1">{selectedTeacher.address}</p>
          </div>
          
          {selectedTeacher.rejectionReason && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <label className="text-sm font-medium text-red-800">Rejection Reason / अस्वीकरण कारण</label>
              <p className="text-red-700 mt-1">{selectedTeacher.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Reject Modal Component
  const RejectModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Reject Teacher Application / शिक्षक आवेदन अस्वीकार करें
          </h3>
          <button
            onClick={() => setShowRejectModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700">
            Are you sure you want to reject <strong>{teacherToReject?.fullName}</strong>'s application?
          </p>
          <p className="text-gray-700 text-sm mt-1">
            क्या आप वाकई <strong>{teacherToReject?.fullName}</strong> के आवेदन को अस्वीकार करना चाहते हैं?
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Rejection / अस्वीकरण का कारण
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Please provide a reason for rejection..."
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowRejectModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel / रद्द करें
          </button>
          <button
            onClick={() => handleReject(teacherToReject._id, rejectReason)}
            disabled={!rejectReason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Reject Application / आवेदन अस्वीकार करें
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Teacher Management / शिक्षक प्रबंधन
        </h2>
        <p className="mt-2 text-gray-600">
          Manage teacher registrations and applications / शिक्षक पंजीकरण और आवेदन प्रबंधित करें
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Total / कुल"
          value={stats.total}
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Pending / लंबित"
          value={stats.pending}
          icon={Clock}
          color="text-yellow-500"
        />
        <StatCard
          title="Approved / अनुमोदित"
          value={stats.approved}
          icon={CheckCircle}
          color="text-green-500"
        />
        <StatCard
          title="Rejected / अस्वीकृत"
          value={stats.rejected}
          icon={XCircle}
          color="text-red-500"
        />
        <StatCard
          title="English / अंग्रेजी"
          value={stats.english}
          icon={Globe}
          color="text-purple-500"
        />
        <StatCard
          title="Hindi / हिंदी"
          value={stats.hindi}
          icon={Globe}
          color="text-orange-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Status / सभी स्थिति</option>
                  <option value="pending">Pending / लंबित</option>
                  <option value="approved">Approved / अनुमोदित</option>
                  <option value="rejected">Rejected / अस्वीकृत</option>
                </select>
              </div>

              {/* Medium Filter */}
              <div>
                <select
                  value={filters.medium}
                  onChange={(e) => setFilters(prev => ({...prev, medium: e.target.value}))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Medium / सभी माध्यम</option>
                  <option value="English">English / अंग्रेजी</option>
                  <option value="Hindi">Hindi / हिंदी</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Search teachers... / शिक्षक खोजें..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading teachers... / शिक्षक लोड हो रहे हैं...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers found</h3>
            <p className="mt-1 text-sm text-gray-500">कोई शिक्षक नहीं मिला</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <li key={teacher._id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{teacher.fullName}</p>
                        <div className="ml-2">
                          {getStatusBadge(teacher)}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        <span className="mr-4">{teacher.mobile}</span>
                        <BookOpen className="h-3 w-3 mr-1" />
                        <span className="mr-4">{teacher.classTeacherOf}</span>
                        <Globe className="h-3 w-3 mr-1" />
                        <span>{teacher.medium}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setShowDetailModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View / देखें
                    </button>

                    {/* Approve Button - Only for pending teachers */}
                    {!teacher.isApproved && !teacher.isRejected && (
                      <button
                        onClick={() => handleApprove(teacher._id)}
                        disabled={actionLoading[teacher._id] === 'approving'}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading[teacher._id] === 'approving' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Approve / अनुमोदित करें
                      </button>
                    )}

                    {/* Reject Button - Only for pending teachers */}
                    {!teacher.isApproved && !teacher.isRejected && (
                      <button
                        onClick={() => openRejectModal(teacher)}
                        disabled={actionLoading[teacher._id] === 'rejecting'}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading[teacher._id] === 'rejecting' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                          <X className="h-4 w-4 mr-1" />
                        )}
                        Reject / अस्वीकार करें
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({...prev, currentPage: prev.currentPage - 1}))}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous / पिछला
              </button>
              <button
                onClick={() => setPagination(prev => ({...prev, currentPage: prev.currentPage + 1}))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next / अगला
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalRecords}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPagination(prev => ({...prev, currentPage: prev.currentPage - 1}))}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous / पिछला
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPagination(prev => ({...prev, currentPage: i + 1}))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagination(prev => ({...prev, currentPage: prev.currentPage + 1}))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next / अगला
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailModal && <DetailModal />}
      {showRejectModal && <RejectModal />}
    </div>
  );
};

export default TeacherRequestViewer; 