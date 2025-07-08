import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

const AdminAnnouncementList = ({ refreshTrigger }) => {
  const { isAuthenticated, loading: adminLoading } = useAdmin();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: '',
    medium: '',
    visibility: ''
  });
  const [statistics, setStatistics] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!adminLoading && isAuthenticated) {
      fetchAnnouncements();
    }
  }, [filters, refreshTrigger, isAuthenticated, adminLoading]);

  const fetchAnnouncements = async () => {
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

      const response = await fetch(`/api/announcements/admin/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch announcements');
      }

      if (data.success) {
        setAnnouncements(data.data.announcements);
        setStatistics(data.data.statistics);
      } else {
        throw new Error(data.message || 'Failed to fetch announcements');
      }

    } catch (error) {
      console.error('Fetch announcements error:', error);
      setError(error.message || 'Error fetching announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      year: '',
      medium: '',
      visibility: ''
    });
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('क्या आप वाकई इस घोषणा को हटाना चाहते हैं? / Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setDeleting(announcementId);

      // Check if admin is authenticated
      if (!isAuthenticated) {
        throw new Error('कृपया पहले लॉगिन करें / Please login first');
      }

      const response = await fetch(`/api/announcements/admin/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete announcement');
      }

      if (data.success) {
        // Remove announcement from list
        setAnnouncements(prev => prev.filter(ann => ann._id !== announcementId));
        
        // Close modal if this announcement was selected
        if (selectedAnnouncement && selectedAnnouncement._id === announcementId) {
          setSelectedAnnouncement(null);
        }
      } else {
        throw new Error(data.message || 'Failed to delete announcement');
      }

    } catch (error) {
      console.error('Delete announcement error:', error);
      alert(error.message || 'Error deleting announcement');
    } finally {
      setDeleting(null);
    }
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

  const getVisibilityColor = (visibility) => {
    return visibility === 'public' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const AnnouncementModal = ({ announcement, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              घोषणा विवरण / Announcement Details
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

          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">शीर्षक / Title</h4>
              <p className="text-gray-700">{announcement.title}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">विवरण / Description</h4>
              <p className="text-gray-700 whitespace-pre-line">{announcement.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">वर्ष / Year</h4>
                <p className="text-gray-700">{announcement.year}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">माध्यम / Medium</h4>
                <p className="text-gray-700">{announcement.medium}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">दृश्यता / Visibility</h4>
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVisibilityColor(announcement.visibility)}`}>
                  {announcement.visibility === 'public' ? 'सार्वजनिक / Public' : 'डैशबोर्ड / Dashboard'}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">पोस्ट किया गया / Posted On</h4>
                <p className="text-gray-700">{formatDate(announcement.postedOn)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-1">बनाया गया / Created By</h4>
              <p className="text-gray-700">{announcement.createdByName}</p>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => handleDeleteAnnouncement(announcement._id)}
                disabled={deleting === announcement._id}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                {deleting === announcement._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    हटाई जा रही है... / Deleting...
                  </>
                ) : (
                  'घोषणा हटाएं / Delete Announcement'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-600">{statistics.total}</div>
            <div className="text-sm text-gray-800">कुल घोषणाएं / Total</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{statistics.public}</div>
            <div className="text-sm text-green-800">सार्वजनिक / Public</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{statistics.dashboard}</div>
            <div className="text-sm text-blue-800">डैशबोर्ड / Dashboard</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{statistics.thisMonth}</div>
            <div className="text-sm text-purple-800">इस महीने / This Month</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{statistics.thisWeek}</div>
            <div className="text-sm text-orange-800">इस सप्ताह / This Week</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-4 gap-4">
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">सभी वर्ष / All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <select
            value={filters.medium}
            onChange={(e) => handleFilterChange('medium', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">सभी माध्यम / All Medium</option>
            <option value="Hindi">हिन्दी / Hindi</option>
            <option value="English">English / अंग्रेजी</option>
          </select>
          
          <select
            value={filters.visibility}
            onChange={(e) => handleFilterChange('visibility', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">सभी दृश्यता / All Visibility</option>
            <option value="public">सार्वजनिक / Public</option>
            <option value="dashboard">डैशबोर्ड / Dashboard</option>
          </select>
          
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
          >
            फिल्टर साफ करें / Clear Filters
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            घोषणाएं ({announcements.length}) / Announcements ({announcements.length})
          </h3>
        </div>

        {(adminLoading || loading) && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {adminLoading ? 'Authenticating... / प्रमाणीकरण हो रहा है...' : 'घोषणाएं लोड हो रही हैं... / Loading announcements...'}
              </p>
            </div>
          </div>
        )}

        {!adminLoading && !isAuthenticated && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">
                कृपया पहले लॉगिन करें / Please login first to access announcements
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Reload Page / पेज रीलोड करें
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchAnnouncements}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              पुनः प्रयास करें / Retry
            </button>
          </div>
        )}

        {!loading && !error && announcements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              कोई घोषणा नहीं मिली / No Announcements Found
            </h3>
            <p className="text-gray-500">
              फिल्टर बदलें या नई घोषणा बनाएं / Change filters or create a new announcement
            </p>
          </div>
        )}

        {!loading && !error && announcements.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    शीर्षक / Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    वर्ष व माध्यम / Year & Medium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    दृश्यता / Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    पोस्ट किया गया / Posted On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    क्रियाएं / Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {announcements.map((announcement) => (
                  <tr key={announcement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {announcement.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {announcement.description.length > 80 
                          ? announcement.description.substring(0, 80) + '...'
                          : announcement.description
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{announcement.year}</div>
                      <div className="text-sm text-gray-500">{announcement.medium}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVisibilityColor(announcement.visibility)}`}>
                        {announcement.visibility === 'public' ? 'Public' : 'Dashboard'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(announcement.postedOn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        विवरण देखें / View Details
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                        disabled={deleting === announcement._id}
                        className="text-red-600 hover:text-red-900 disabled:text-red-400"
                      >
                        {deleting === announcement._id ? 'हटाई जा रही...' : 'हटाएं / Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
};

export default AdminAnnouncementList; 