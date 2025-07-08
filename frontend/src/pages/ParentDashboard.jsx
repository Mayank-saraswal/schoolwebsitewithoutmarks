import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParent } from '../context/ParentContext';
import MarksViewer from '../components/MarksViewer';
import ProgressChart from '../components/ProgressChart';
import FeeStatusPanel from '../components/FeeStatusPanel';
import MarksheetDownload from '../components/MarksheetDownload';
import StudentNotificationBanner from '../components/StudentNotificationBanner';

const ParentDashboard = () => {
  const { 
    isAuthenticated, 
    loading, 
    parent, 
    studentList, 
    selectedStudent, 
    selectStudent, 
    logout 
  } = useParent();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('marks');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/parent/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/parent/login', { replace: true });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="https://allpngfree.com/apf-prod-storage-api/storage/thumbnails/saraswati-png-image-download-thumbnail-1643211966.jpg" 
                  alt="Saraswati School Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Saraswati School</h1>
                <p className="text-sm text-gray-500">अभिभावक पोर्टल / Parent Portal</p>
              </div>
            </div>

            {/* Parent Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  मोबाइल / Mobile: {parent?.mobile}
                </p>
                <p className="text-xs text-gray-500">
                  {studentList?.length} बच्चे / {studentList?.length} Children
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                लॉगआउट / Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Child Selection */}
        {studentList && studentList.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              बच्चे का चयन करें / Select Child
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentList.map((student) => (
                <button
                  key={student._id}
                  onClick={() => selectStudent(student)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedStudent?._id === student._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">कक्षा / Class: {student.class}</p>
                  <p className="text-sm text-gray-600">माध्यम / Medium: {student.medium}</p>
                  <p className="text-xs text-gray-500">SR: {student.srNumber}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Student Info */}
        {selectedStudent && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedStudent.name}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>कक्षा / Class: <strong>{selectedStudent.class}</strong></span>
                    <span>माध्यम / Medium: <strong>{selectedStudent.medium}</strong></span>
                    <span>SR नंबर / SR Number: <strong>{selectedStudent.srNumber}</strong></span>
                    <span>
                      जन्म तिथि / DOB: <strong>{formatDate(selectedStudent.dateOfBirth)}</strong>
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <MarksheetDownload studentId={selectedStudent._id} />
                </div>
              </div>
            </div>

            {/* Announcement Notifications */}
            <StudentNotificationBanner 
              year={selectedStudent.year || new Date().getFullYear()} 
              medium={selectedStudent.medium}
              className="mb-6"
            />

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('marks')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'marks'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📊 अंक तालिका / Marks Table
                  </button>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'progress'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📈 प्रगति चार्ट / Progress Chart
                  </button>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'fees'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    💰 फीस स्थिति / Fee Status
                  </button>
                  <button
                    onClick={() => navigate('/parent/payment')}
                    className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors duration-200"
                  >
                    💳 फीस भुगतान / Fee Payment
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'marks' && (
                  <MarksViewer studentId={selectedStudent._id} />
                )}
                {activeTab === 'progress' && (
                  <ProgressChart studentId={selectedStudent._id} />
                )}
                {activeTab === 'fees' && (
                  <FeeStatusPanel studentId={selectedStudent._id} />
                )}
              </div>
            </div>
          </>
        )}

        {/* No Student Selected */}
        {!selectedStudent && studentList && studentList.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              बच्चे का चयन करें / Select a Child
            </h3>
            <p className="text-gray-500">
              अपने बच्चे के अंक और फीस की स्थिति देखने के लिए ऊपर से चयन करें
            </p>
            <p className="text-gray-500 text-sm">
              Select from above to view your child's marks and fee status
            </p>
          </div>
        )}

        {/* No Students Found */}
        {studentList && studentList.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              कोई छात्र नहीं मिला / No Students Found
            </h3>
            <p className="text-gray-500">
              इस मोबाइल नंबर से कोई छात्र पंजीकृत नहीं है
            </p>
            <p className="text-gray-500 text-sm">
              No students are registered with this mobile number
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            समस्या होने पर स्कूल से संपर्क करें / Contact school for any issues
          </p>
          <p className="text-gray-400 text-xs mt-1">
            © 2025 Saraswati School. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ParentDashboard; 