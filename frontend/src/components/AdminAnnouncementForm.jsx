import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

const AdminAnnouncementForm = ({ onSuccess, onCancel }) => {
  const { isAuthenticated, loading: adminLoading } = useAdmin();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    medium: '',
    visibility: 'dashboard'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError('शीर्षक आवश्यक है / Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('विवरण आवश्यक है / Description is required');
      return;
    }
    
    if (!formData.medium) {
      setError('माध्यम चुनना आवश्यक है / Medium selection is required');
      return;
    }
    
    if (formData.title.length > 100) {
      setError('शीर्षक 100 अक्षरों से अधिक नहीं हो सकता / Title cannot exceed 100 characters');
      return;
    }
    
    if (formData.description.length > 1000) {
      setError('विवरण 1000 अक्षरों से अधिक नहीं हो सकता / Description cannot exceed 1000 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Check if admin is authenticated
      if (!isAuthenticated) {
        throw new Error('कृपया पहले लॉगिन करें / Please login first');
      }

      const response = await fetch('/api/announcements/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          year: parseInt(formData.year),
          medium: formData.medium,
          visibility: formData.visibility
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create announcement');
      }

      if (data.success) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          year: new Date().getFullYear(),
          medium: '',
          visibility: 'dashboard'
        });
        
        // Call success callback
        if (onSuccess) {
          onSuccess(data.data.announcement);
        }
      } else {
        throw new Error(data.message || 'Failed to create announcement');
      }

    } catch (error) {
      console.error('Create announcement error:', error);
      setError(error.message || 'घोषणा बनाने में त्रुटि / Error creating announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Show loading while admin context is loading
  if (adminLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticating... / प्रमाणीकरण हो रहा है...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">
              कृपया पहले लॉगिन करें / Please login first to create announcements
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Reload Page / पेज रीलोड करें
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          नई घोषणा बनाएं / Create New Announcement
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            शीर्षक / Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter announcement title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            विवरण / Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter detailed announcement description"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={1000}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Year and Medium Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              वर्ष / Year <span className="text-red-500">*</span>
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Medium */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              माध्यम / Medium <span className="text-red-500">*</span>
            </label>
            <select
              name="medium"
              value={formData.medium}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Medium</option>
              <option value="Hindi">हिन्दी / Hindi</option>
              <option value="English">English / अंग्रेजी</option>
            </select>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            दृश्यता / Visibility <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="dashboard"
                checked={formData.visibility === 'dashboard'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm">
                डैशबोर्ड ही / Dashboard Only 
                <span className="text-gray-500 ml-1">(केवल छात्र/अभिभावक डैशबोर्ड में दिखाई दे / Only visible in student/parent dashboards)</span>
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm">
                सार्वजनिक / Public 
                <span className="text-gray-500 ml-1">(होमपेज और डैशबोर्ड दोनों में दिखाई दे / Visible on homepage and dashboards)</span>
              </span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                बनाई जा रही है... / Creating...
              </>
            ) : (
              'घोषणा बनाएं / Create Announcement'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              रद्द करें / Cancel
            </button>
          )}
        </div>
      </form>

      {/* Guidelines */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">दिशानिर्देश / Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• शीर्षक अधिकतम 100 अक्षर का हो सकता है / Title can be maximum 100 characters</li>
          <li>• विवरण अधिकतम 1000 अक्षर का हो सकता है / Description can be maximum 1000 characters</li>
          <li>• सार्वजनिक घोषणाएं होमपेज पर दिखाई देंगी / Public announcements will appear on homepage</li>
          <li>• डैशबोर्ड घोषणाएं केवल संबंधित वर्ष और माध्यम के छात्रों को दिखेंगी / Dashboard announcements will only show to relevant year and medium students</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAnnouncementForm; 