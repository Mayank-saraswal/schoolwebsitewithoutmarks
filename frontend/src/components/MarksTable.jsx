import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaEye, 
  FaGraduationCap,
  FaTrophy,
  FaChartBar,
  FaSpinner,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const MarksTable = ({ onEditMarks, onViewDetails }) => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    examType: 'all',
    class: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 20
  });
  const [stats, setStats] = useState({});
  const [selectedMark, setSelectedMark] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const examTypes = [
    '1st Test',
    '2nd Test', 
    'Half-Yearly',
    '3rd Test',
    'Yearly',
    'Pre-Board',
    'Final'
  ];

  const classes = [
    'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
    'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
  ];

  useEffect(() => {
    fetchMarks();
  }, [filters, pagination.currentPage]);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: filters.search,
        examType: filters.examType,
        class: filters.class
      });

      const response = await fetch(`/api/marks/my-uploads?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setMarks(data.data);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        toast.error(data.message || 'Failed to fetch marks');
      }
    } catch (error) {
      console.error('Error fetching marks:', error);
      toast.error('Network error while fetching marks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleViewDetails = (mark) => {
    setSelectedMark(mark);
    setShowDetailsModal(true);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'text-green-600 bg-green-100';
      case 'A': return 'text-green-600 bg-green-100';
      case 'B+': return 'text-blue-600 bg-blue-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C+': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Pass': return 'text-green-600 bg-green-100';
      case 'Fail': return 'text-red-600 bg-red-100';
      case 'Compartment': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'Pass': return <FaCheckCircle className="text-green-600" />;
      case 'Fail': return <FaTimesCircle className="text-red-600" />;
      case 'Compartment': return <FaExclamationTriangle className="text-orange-600" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaChartBar className="text-xl" />
              Uploaded Marks / अपलोड किए गए अंक
            </h2>
            <p className="text-blue-100 mt-1">
              View and manage uploaded student marks / अपलोड किए गए छात्र अंक देखें और प्रबंधित करें
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.totalRecords || 0}</p>
                </div>
                <FaGraduationCap className="text-blue-600 text-2xl" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Pass Count</p>
                  <p className="text-2xl font-bold text-green-800">{stats.passCount || 0}</p>
                </div>
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Fail Count</p>
                  <p className="text-2xl font-bold text-red-800">{stats.failCount || 0}</p>
                </div>
                <FaTimesCircle className="text-red-600 text-2xl" />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Avg Percentage</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {stats.averagePercentage ? `${stats.averagePercentage.toFixed(1)}%` : '0%'}
                  </p>
                </div>
                <FaTrophy className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SR number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Exam Type Filter */}
          <div>
            <select
              value={filters.examType}
              onChange={(e) => handleFilterChange('examType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Exam Types</option>
              {examTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl mr-2" />
            <span className="text-gray-600">Loading marks...</span>
          </div>
        ) : marks.length === 0 ? (
          <div className="text-center p-8">
            <FaChartBar className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-600 text-lg">No marks found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or upload some marks</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class & Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade & Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marks.map((mark) => (
                <tr key={mark._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {mark.studentName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {mark.srNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {mark.class} ({mark.medium})
                      </div>
                      <div className="text-sm text-gray-500">
                        {mark.examType}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {mark.totalObtained} / {mark.totalMaxMarks}
                      </div>
                      <div className="text-sm text-gray-500">
                        {mark.overallPercentage}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(mark.overallGrade)}`}>
                        {mark.overallGrade}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(mark.result)}`}>
                        {getResultIcon(mark.result)}
                        {mark.result}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(mark.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleViewDetails(mark)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => onEditMarks && onEditMarks(mark)}
                        className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Edit Marks"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {
                Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)
              } of {pagination.totalRecords} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        page === pagination.currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedMark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Marks Details / अंक विवरण</h3>
                  <p className="text-blue-100 mt-1">
                    {selectedMark.studentName} - {selectedMark.examType}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Student Name:</span>
                  <p className="font-medium">{selectedMark.studentName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">SR Number:</span>
                  <p className="font-medium">{selectedMark.srNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Class:</span>
                  <p className="font-medium">{selectedMark.class} ({selectedMark.medium})</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Exam Type:</span>
                  <p className="font-medium">{selectedMark.examType}</p>
                </div>
              </div>

              {/* Subject-wise Marks */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-4">Subject-wise Marks / विषयवार अंक</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMark.marks.map((subjectMark, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{subjectMark.subject}</h5>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(subjectMark.grade)}`}>
                          {subjectMark.grade}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">
                          {subjectMark.obtained} / {subjectMark.maxMarks}
                        </span>
                        <span className={`font-medium ${
                          subjectMark.percentage >= 35 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {subjectMark.percentage}%
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          subjectMark.status === 'Pass' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subjectMark.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Result */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div>
                  <span className="text-sm text-blue-600">Total Marks:</span>
                  <p className="text-xl font-bold text-blue-800">
                    {selectedMark.totalObtained} / {selectedMark.totalMaxMarks}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Percentage:</span>
                  <p className="text-xl font-bold text-blue-800">{selectedMark.overallPercentage}%</p>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Grade:</span>
                  <p className="text-xl font-bold text-blue-800">{selectedMark.overallGrade}</p>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Result:</span>
                  <p className={`text-xl font-bold flex items-center gap-2 ${
                    selectedMark.result === 'Pass' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getResultIcon(selectedMark.result)}
                    {selectedMark.result}
                  </p>
                </div>
              </div>

              {/* Remarks */}
              {selectedMark.remarks && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">Remarks / टिप्पणी</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {selectedMark.remarks}
                  </p>
                </div>
              )}

              {/* Upload Info */}
              <div className="text-sm text-gray-500 border-t pt-4">
                <p>Uploaded by: {selectedMark.uploadedByName}</p>
                <p>Upload Date: {new Date(selectedMark.createdAt).toLocaleString('en-IN')}</p>
                {selectedMark.updatedAt !== selectedMark.createdAt && (
                  <p>Last Updated: {new Date(selectedMark.updatedAt).toLocaleString('en-IN')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksTable; 