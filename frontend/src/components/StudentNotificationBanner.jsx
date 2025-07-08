import React, { useState, useEffect } from 'react';

const StudentNotificationBanner = ({ year, medium, className = '' }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    if (year && medium) {
      fetchDashboardAnnouncements();
      loadDismissedAnnouncements();
    }
  }, [year, medium]);

  const fetchDashboardAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/announcements/dashboard?year=${year}&medium=${medium}&limit=5`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch announcements');
      }

      if (data.success) {
        setAnnouncements(data.data.announcements);
      } else {
        throw new Error(data.message || 'Failed to fetch announcements');
      }

    } catch (error) {
      console.error('Fetch dashboard announcements error:', error);
      setError(error.message || 'Error fetching announcements');
    } finally {
      setLoading(false);
    }
  };

  const loadDismissedAnnouncements = () => {
    const storageKey = `dismissed-announcements-${year}-${medium}`;
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed));
    }
  };

  const dismissAnnouncement = (announcementId) => {
    const storageKey = `dismissed-announcements-${year}-${medium}`;
    const newDismissed = [...dismissedAnnouncements, announcementId];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem(storageKey, JSON.stringify(newDismissed));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'आज / Today';
    } else if (diffInDays === 1) {
      return 'कल / Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} दिन पहले / ${diffInDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  };

  const AnnouncementModal = ({ announcement, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {announcement.title}
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

          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>📅 {formatDate(announcement.postedOn)}</span>
                <span>🎓 {announcement.year}</span>
                <span>📖 {announcement.medium}</span>
                {announcement.isRecent && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    नया / New
                  </span>
                )}
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {announcement.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.includes(announcement._id)
  );

  // Don't show banner if loading, error, or no visible announcements
  if (loading || error || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement._id}
          className={`
            relative rounded-lg border-l-4 p-4 shadow-md transition-all duration-300
            ${announcement.isRecent 
              ? 'bg-red-50 border-red-400' 
              : announcement.visibility === 'public'
              ? 'bg-blue-50 border-blue-400'
              : 'bg-yellow-50 border-yellow-400'
            }
          `}
        >
          {/* Dismiss Button */}
          <button
            onClick={() => dismissAnnouncement(announcement._id)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="pr-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <h3 className="font-semibold text-gray-900">
                  {announcement.title}
                </h3>
                {announcement.isRecent && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    नया / New
                  </span>
                )}
              </div>
            </div>

            {/* Description Preview */}
            <p className="text-gray-700 text-sm mb-3 leading-relaxed">
              {announcement.description.length > 150 
                ? announcement.description.substring(0, 150) + '...'
                : announcement.description
              }
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>📅 {formatRelativeTime(announcement.postedOn)}</span>
                {announcement.visibility === 'public' && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    सार्वजनिक / Public
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setSelectedAnnouncement(announcement)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                पूरा पढ़ें / Read Full
              </button>
            </div>
          </div>
        </div>
      ))}

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

export default StudentNotificationBanner; 