import React, { useState, useEffect } from 'react';

const AnnouncementPublicSection = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    fetchPublicAnnouncements();
  }, []);

  const fetchPublicAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/announcements/public?limit=5');
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
      console.error('Fetch public announcements error:', error);
      setError(error.message || 'Error fetching announcements');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">घोषणाएं लोड हो रही हैं... / Loading announcements...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || announcements.length === 0) {
    return null; // Don't show section if there are no announcements
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            घोषणाएं / Announcements
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            महत्वपूर्ण सूचनाएं और अपडेट्स / Important notices and updates
          </p>
        </div>

        {/* Announcements Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement, index) => (
            <div
              key={announcement._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelectedAnnouncement(announcement)}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {announcement.title}
                  </h3>
                  {index === 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ml-2">
                      नया / New
                    </span>
                  )}
                </div>

                {/* Description Preview */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {announcement.description.length > 120 
                    ? announcement.description.substring(0, 120) + '...'
                    : announcement.description
                  }
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span>📅 {formatRelativeTime(announcement.postedOn)}</span>
                    <span>🎓 {announcement.year}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {announcement.medium}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    पूरा पढ़ें / Read More
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              // Scroll to contact section or handle navigation
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            अधिक जानकारी के लिए संपर्क करें / Contact for More Information
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </section>
  );
};

export default AnnouncementPublicSection;