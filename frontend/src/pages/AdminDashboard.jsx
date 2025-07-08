import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import AdmissionViewer from '../components/AdmissionViewer';
import TeacherRequestViewer from '../components/TeacherRequestViewer';
import StudentList from '../components/StudentList';
import ExamTypeConfigPanel from '../components/ExamTypeConfigPanel';
import SubjectSetup from '../components/SubjectSetup';
import PaymentApprovalPanel from '../components/PaymentApprovalPanel';
import AdminAnnouncementForm from '../components/AdminAnnouncementForm';
import AdminAnnouncementList from '../components/AdminAnnouncementList';
import AdminDashboardStats from '../components/AdminDashboardStats';
import AdminAuditLogPage from '../components/AdminAuditLogPage';
import ClassFeeForm from '../components/ClassFeeForm';
import BusFeeForm from '../components/BusFeeForm';

const AdminDashboard = () => {
  const { 
    isAuthenticated, 
    admin, 
    selectedMedium, 
    selectedYear,
    availableYears,
    loading, 
    logout, 
    setYear,
    isReady,
    hasSelectedMedium 
  } = useAdmin();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [refreshAnnouncements, setRefreshAnnouncements] = useState(0);
  const [feeManagementTab, setFeeManagementTab] = useState('class'); // 'class' or 'bus'

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin', { replace: true });
    } else if (isAuthenticated && !hasSelectedMedium) {
      navigate('/admin/medium-select', { replace: true });
    }
  }, [isAuthenticated, loading, hasSelectedMedium, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin', { replace: true });
  };

  const handleYearChange = (year) => {
    setYear(parseInt(year));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-blue-900 text-white w-64 fixed inset-y-0 left-0 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out lg:static lg:inset-0 z-30`}>
        
        <div className="flex items-center justify-between h-16 px-6 bg-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="https://allpngfree.com/apf-prod-storage-api/storage/thumbnails/saraswati-png-image-download-thumbnail-1643211966.jpg" 
                alt="Saraswati School Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <h2 className="font-bold text-lg">Saraswati School</h2>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {admin?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{admin?.name || 'Administrator'}</p>
              <p className="text-blue-200 text-xs">{admin?.role || 'Admin'}</p>
            </div>
          </div>
        </div>

        {/* Current Settings */}
        <div className="px-6 py-4 border-b border-blue-800">
          <div className="space-y-3">
            {/* Current Medium */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-200">Current Medium:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedMedium === 'Hindi' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {selectedMedium === 'Hindi' ? 'हिन्दी' : 'English'}
              </span>
            </div>
            
            {/* Year Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-200">Academic Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-blue-800 text-white text-xs px-2 py-1 rounded border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Change Medium Button */}
            <button
              onClick={() => navigate('/admin/medium-select', { state: { changeMedium: true } })}
              className="w-full text-xs text-blue-200 hover:text-white hover:bg-blue-800 py-1 px-2 rounded transition-colors duration-200"
            >
              Change Medium / माध्यम बदलें
            </button>
          </div>
        </div>

        <nav className="mt-6">
          <div className="space-y-1 px-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              📊 Dashboard / डैशबोर्ड
            </button>
            <button
              onClick={() => setActiveTab('admissions')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'admissions' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              📋 Admission Forms / प्रवेश फॉर्म
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'teachers' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              🎓 Teacher Management / शिक्षक प्रबंधन
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'students' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              👥 Student Management / छात्र प्रबंधन
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'fees' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              💰 Fee Management / फीस प्रबंधन
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'subjects' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              📚 Subject Management / विषय प्रबंधन
            </button>
            <button
              onClick={() => setActiveTab('examTypes')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'examTypes' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              📝 Exam Configuration / परीक्षा कॉन्फ़िगरेशन
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'payments' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              💳 Payment Approval / भुगतान अनुमोदन
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'announcements' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              📢 Announcements / घोषणाएं
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'audit' 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              🔍 Audit Logs / ऑडिट लॉग
            </button>
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white rounded-lg transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400"
              >
                ☰
              </button>

              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl font-semibold text-gray-900">
                  {activeTab === 'dashboard'
                    ? 'Admin Dashboard / व्यवस्थापक डैशबोर्ड'
                    : activeTab === 'admissions' 
                    ? `Admission Forms - ${selectedMedium} Medium` 
                    : activeTab === 'teachers'
                    ? 'Teacher Management / शिक्षक प्रबंधन'
                    : activeTab === 'students'
                    ? 'Student Management / छात्र प्रबंधन'
                    : activeTab === 'fees'
                    ? 'Fee Management / फीस प्रबंधन'
                    : activeTab === 'subjects'
                    ? 'Subject Management / विषय प्रबंधन'
                    : activeTab === 'examTypes'
                    ? 'Exam Configuration / परीक्षा कॉन्फ़िगरेशन'
                    : activeTab === 'payments'
                    ? 'Payment Approval / भुगतान अनुमोदन'
                    : activeTab === 'announcements'
                    ? 'Announcements Management / घोषणा प्रबंधन'
                    : 'Audit Logs / ऑडिट लॉग'
                  }
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {activeTab === 'dashboard' && (
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMedium === 'Hindi' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedMedium} Medium • {selectedYear}
                    </span>
                    <div className="text-sm text-gray-500">
                      Complete overview of school statistics
                    </div>
                  </div>
                )}

                {activeTab === 'admissions' && (
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMedium === 'Hindi' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedMedium} Medium • {selectedYear}
                    </span>
                  </div>
                )}
                
                {activeTab === 'teachers' && (
                  <div className="text-sm text-gray-500">
                    Manage teacher applications and approvals
                  </div>
                )}

                {activeTab === 'students' && (
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMedium === 'Hindi' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedMedium} Medium • {selectedYear}
                    </span>
                    <div className="text-sm text-gray-500">
                      View and manage student records
                    </div>
                  </div>
                )}

                {activeTab === 'fees' && (
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Configure class and bus transportation fees
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setFeeManagementTab('class')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          feeManagementTab === 'class'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Class Fees
                      </button>
                      <button
                        onClick={() => setFeeManagementTab('bus')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          feeManagementTab === 'bus'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Bus Fees
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'examTypes' && (
                  <div className="text-sm text-gray-500">
                    Configure exam types and maximum marks
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="text-sm text-gray-500">
                    Review and approve parent payment requests
                  </div>
                )}

                {activeTab === 'announcements' && (
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Create and manage school announcements
                    </div>
                    <button
                      onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        showAnnouncementForm
                          ? 'bg-gray-600 hover:bg-gray-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {showAnnouncementForm ? 'View All / सभी देखें' : 'Create New / नई बनाएं'}
                    </button>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMedium === 'Hindi' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedMedium} Medium • {selectedYear}
                    </span>
                    <div className="text-sm text-gray-500">
                      Track all admin actions and system events
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' ? (
            <AdminDashboardStats />
          ) : activeTab === 'admissions' ? (
            <AdmissionViewer 
              selectedMedium={selectedMedium} 
              selectedYear={selectedYear.toString()}
            />
          ) : activeTab === 'teachers' ? (
            <TeacherRequestViewer />
          ) : activeTab === 'students' ? (
            <StudentList />
          ) : activeTab === 'fees' ? (
            feeManagementTab === 'class' ? <ClassFeeForm /> : <BusFeeForm />
          ) : activeTab === 'subjects' ? (
            <SubjectSetup />
          ) : activeTab === 'examTypes' ? (
            <ExamTypeConfigPanel />
          ) : activeTab === 'payments' ? (
            <PaymentApprovalPanel />
          ) : activeTab === 'announcements' ? (
            showAnnouncementForm ? (
              <AdminAnnouncementForm
                onSuccess={(announcement) => {
                  setShowAnnouncementForm(false);
                  setRefreshAnnouncements(prev => prev + 1);
                }}
                onCancel={() => setShowAnnouncementForm(false)}
              />
            ) : (
              <AdminAnnouncementList refreshTrigger={refreshAnnouncements} />
            )
          ) : activeTab === 'audit' ? (
            <AdminAuditLogPage />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 