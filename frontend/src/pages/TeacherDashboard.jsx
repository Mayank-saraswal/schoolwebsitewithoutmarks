import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentCreateForm from '../components/StudentCreateForm';
import StudentEditForm from '../components/StudentEditForm';
import StudentList from '../components/StudentList';
import MarksUploadForm from '../components/MarksUploadForm';
import MarksTable from '../components/MarksTable';
import MarksEdit from '../components/MarksEdit';
import ExamViewer from '../components/ExamViewer';
import MaxMarksSetup from '../components/MaxMarksSetup';
import ExamMarksSetup from '../components/ExamMarksSetup';
import { 
  GraduationCap, 
  User, 
  Phone, 
  Mail, 
  BookOpen, 
  Globe, 
  Award,
  Calendar,
  Clock,
  LogOut,
  Menu,
  X,
  UserPlus,
  Users as UsersIcon,
  FileText,
  Upload,
  BarChart3,
  Settings
} from 'lucide-react';
import { useState } from 'react';

const TeacherDashboard = () => {
  const { teacher, logout, isAuthenticated, hasRole, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshStudents, setRefreshStudents] = useState(0);
  const [showMarksUpload, setShowMarksUpload] = useState(false);
  const [showMarksEdit, setShowMarksEdit] = useState(false);
  const [selectedMarksForEdit, setSelectedMarksForEdit] = useState(null);
  const [refreshMarks, setRefreshMarks] = useState(0);
  const [showMaxMarksSetup, setShowMaxMarksSetup] = useState(false);
  const [selectedExamForSetup, setSelectedExamForSetup] = useState('');
  const [selectedExamConfig, setSelectedExamConfig] = useState(null);
  const [selectedExamForUpload, setSelectedExamForUpload] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [showStudentEdit, setShowStudentEdit] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [examManagementView, setExamManagementView] = useState('overview'); // 'overview', 'setup-marks'

  // Redirect if not authenticated or not a teacher
  useEffect(() => {
    if (!loading && (!isAuthenticated || !hasRole('teacher'))) {
      navigate('/teacher/login', { replace: true });
    }
  }, [isAuthenticated, hasRole, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/teacher/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard... / डैशबोर्ड लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Teacher information not found</p>
          <button
            onClick={() => navigate('/teacher/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    {
      name: 'Dashboard / डैशबोर्ड',
      icon: GraduationCap,
      key: 'dashboard',
      description: 'Overview / अवलोकन'
    },
    {
      name: 'Create Student / छात्र बनाएं',
      icon: UserPlus,
      key: 'create-student',
      description: 'Add new student / नया छात्र जोड़ें'
    },
    {
      name: 'My Students / मेरे छात्र',
      icon: UsersIcon,
      key: 'my-students',
      description: 'View student list / छात्र सूची देखें'
    },
    {
      name: 'Exam Management / परीक्षा प्रबंधन',
      icon: BookOpen,
      key: 'exam-management',
      description: 'Manage exams & marks / परीक्षा और अंक प्रबंधित करें'
    },
    {
      name: 'Set Max Marks / अधिकतम अंक सेट करें',
      icon: Settings,
      key: 'set-max-marks',
      description: 'Auto-fetch subjects & set max marks / विषय स्वचालित लाएं और अधिकतम अंक सेट करें'
    },
    {
      name: 'Upload Marks / अंक अपलोड करें',
      icon: Upload,
      key: 'upload-marks',
      description: 'Upload exam marks / परीक्षा अंक अपलोड करें'
    },
    {
      name: 'Marks Management / अंक प्रबंधन',
      icon: BarChart3,
      key: 'marks-management',
      description: 'View & edit marks / अंक देखें और संपादित करें'
    },
    {
      name: 'Classes / कक्षाएं',
      icon: BookOpen,
      key: 'classes',
      description: 'Coming Soon / जल्द आ रहा है'
    },
    {
      name: 'Attendance / उपस्थिति',
      icon: Calendar,
      key: 'attendance',
      description: 'Coming Soon / जल्द आ रहा है'
    },
    {
      name: 'Reports / रिपोर्ट',
      icon: Award,
      key: 'reports',
      description: 'Coming Soon / जल्द आ रहा है'
    }
  ];

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning / सुप्रभात';
    } else if (hour < 17) {
      return 'Good Afternoon / शुभ दोपहर';
    } else {
      return 'Good Evening / शुभ संध्या';
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleStudentCreated = (student) => {
    // Refresh the student list
    setRefreshStudents(prev => prev + 1);
    // Switch to student list tab
    setActiveTab('my-students');
  };

  const handleStudentUpdated = (student) => {
    setRefreshStudents(prev => prev + 1);
    setShowStudentEdit(false);
    setSelectedStudentForEdit(null);
  };

  const handleStudentDeleted = () => {
    // Refresh the student list after deletion
    setRefreshStudents(prev => prev + 1);
  };

  const handleEditStudent = (student) => {
    setSelectedStudentForEdit(student);
    setShowStudentEdit(true);
  };

  const handleCancelEdit = () => {
    setShowStudentEdit(false);
    setSelectedStudentForEdit(null);
  };

  const handleMarksUploaded = (marks) => {
    setRefreshMarks(prev => prev + 1);
    setShowMarksUpload(false);
    // Switch to marks management tab to view uploaded marks
    setActiveTab('marks-management');
  };

  const handleEditMarks = (marksData) => {
    setSelectedMarksForEdit(marksData);
    setShowMarksEdit(true);
  };

  const handleMarksUpdated = (updatedMarks) => {
    setRefreshMarks(prev => prev + 1);
    setShowMarksEdit(false);
    setSelectedMarksForEdit(null);
  };

  const handleSetMaxMarks = (examType, existingConfig) => {
    setSelectedExamForSetup(examType);
    setSelectedExamConfig(existingConfig);
    setShowMaxMarksSetup(true);
  };

  const handleMaxMarksSaved = (savedConfig) => {
    setShowMaxMarksSetup(false);
    setSelectedExamForSetup('');
    setSelectedExamConfig(null);
    // Optionally refresh exam data or show success message
  };

  const handleUploadMarksForExam = (examType) => {
    setSelectedExamForUpload(examType);
    setShowMarksUpload(true);
  };

  const handleExamSelected = (examType) => {
    setSelectedExamForUpload(examType);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600 text-white flex-shrink-0">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8" />
                          <span className="ml-2 text-lg font-semibold">Saraswati School</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Teacher info */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{teacher.fullName}</p>
              <p className="text-xs text-gray-600">{teacher.teacherId}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-4 px-2 pb-4">
          {sidebarItems.map((item, index) => (
            <div key={index} className="mb-2">
              <button
                onClick={() => handleTabChange(item.key)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === item.key
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${['classes', 'attendance', 'reports'].includes(item.key) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                disabled={['classes', 'attendance', 'reports'].includes(item.key)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <div className="flex-1 text-left">
                  <div>{item.name}</div>
                  {activeTab !== item.key && (
                    <div className="text-xs text-gray-400">{item.description}</div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout / लॉगआउट
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden -ml-2 mr-2 h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Teacher Dashboard / शिक्षक डैशबोर्ड
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {getGreeting()}, {teacher.fullName}!
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{teacher.medium} Medium</p>
                  <p className="text-xs text-gray-500">{teacher.classTeacherOf}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8 h-full">
            {/* Render content based on active tab */}
            {activeTab === 'dashboard' && (
              <>
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Welcome to Saraswati School / सरस्वती स्कूल में आपका स्वागत है
                      </h2>
                      <p className="text-blue-100 mb-4">
                        Empowering education through dedicated teaching / समर्पित शिक्षण के माध्यम से शिक्षा को सशक्त बनाना
                      </p>
                      <div className="flex items-center text-blue-100">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Last login: {formatDate(teacher.lastLogin)} / अंतिम लॉगिन: {formatDate(teacher.lastLogin)}</span>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <GraduationCap className="h-24 w-24 text-blue-200" />
                    </div>
                  </div>
                </div>

                {/* Teacher Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Personal Info Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <User className="h-6 w-6 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Personal Info / व्यक्तिगत जानकारी
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{teacher.mobile}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{teacher.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{teacher.qualification}</span>
                      </div>
                    </div>
                  </div>

                  {/* Class Information Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <BookOpen className="h-6 w-6 text-green-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Class Info / कक्षा जानकारी
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Class Teacher Of / कक्षा शिक्षक</span>
                        <p className="text-lg font-medium text-gray-900">{teacher.classTeacherOf}</p>
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{teacher.medium} Medium</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Status Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <Award className="h-6 w-6 text-purple-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Account Status / खाता स्थिति
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Teacher ID / शिक्षक आईडी</span>
                        <p className="text-lg font-medium text-gray-900">{teacher.teacherId}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm text-green-600">Active / सक्रिय</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Approved On / अनुमोदित दिनांक</span>
                        <p className="text-sm text-gray-900">{formatDate(teacher.approvedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quick Actions / त्वरित कार्रवाई
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get started with student management / छात्र प्रबंधन के साथ शुरुआत करें
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <button
                        onClick={() => handleTabChange('create-student')}
                        className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors"
                      >
                        <UserPlus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-blue-900">Create Student</p>
                        <p className="text-xs text-blue-600">Add new student to class</p>
                      </button>
                      
                      <button
                        onClick={() => handleTabChange('my-students')}
                        className="bg-green-50 hover:bg-green-100 rounded-lg p-4 text-center transition-colors"
                      >
                        <UsersIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-900">My Students</p>
                        <p className="text-xs text-green-600">View and manage students</p>
                      </button>

                      <button
                        onClick={() => handleTabChange('set-max-marks')}
                        className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 text-center transition-colors"
                      >
                        <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-purple-900">Set Max Marks</p>
                        <p className="text-xs text-purple-600">Auto-fetch subjects & set marks</p>
                      </button>

                      <button
                        onClick={() => handleTabChange('exam-management')}
                        className="bg-indigo-50 hover:bg-indigo-100 rounded-lg p-4 text-center transition-colors"
                      >
                        <BookOpen className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-indigo-900">Exam Management</p>
                        <p className="text-xs text-indigo-600">Setup exams & marks</p>
                      </button>

                      <button
                        onClick={() => handleTabChange('marks-management')}
                        className="bg-orange-50 hover:bg-orange-100 rounded-lg p-4 text-center transition-colors"
                      >
                        <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-orange-900">Marks Management</p>
                        <p className="text-xs text-orange-600">View and edit marks</p>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'create-student' && (
              <StudentCreateForm 
                onStudentCreated={handleStudentCreated}
                onCancel={() => handleTabChange('dashboard')}
              />
            )}

            {activeTab === 'my-students' && (
              <StudentList 
                refreshTrigger={refreshStudents} 
                onEditStudent={handleEditStudent}
                onStudentDeleted={handleStudentDeleted}
              />
            )}

            {activeTab === 'upload-marks' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upload Student Marks / छात्र अंक अपलोड करें
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload exam marks for your students / अपने छात्रों के लिए परीक्षा अंक अपलोड करें
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="text-center py-8">
                    <Upload className="mx-auto h-16 w-16 text-purple-300 mb-4" />
                    <h4 className="text-xl font-medium text-gray-900 mb-2">
                      Ready to Upload Marks? / अंक अपलोड करने के लिए तैयार हैं?
                    </h4>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Select a student, choose exam type, and enter subject-wise marks with automatic grade calculation.
                    </p>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      एक छात्र चुनें, परीक्षा प्रकार चुनें, और स्वचालित ग्रेड गणना के साथ विषयवार अंक दर्ज करें।
                    </p>
                    <button
                      onClick={() => setShowMarksUpload(true)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Upload className="h-5 w-5" />
                      Start Uploading Marks / अंक अपलोड करना शुरू करें
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exam-management' && (
              <ExamViewer 
                onSelectExam={handleExamSelected}
                onSetMaxMarks={handleSetMaxMarks}
                onUploadMarks={handleUploadMarksForExam}
              />
            )}

            {activeTab === 'set-max-marks' && (
              <ExamMarksSetup />
            )}

            {activeTab === 'marks-management' && (
              <MarksTable 
                key={refreshMarks}
                onEditMarks={handleEditMarks}
              />
            )}

            {/* Marks Upload Modal */}
            {showMarksUpload && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <MarksUploadForm
                    onSuccess={handleMarksUploaded}
                    onCancel={() => setShowMarksUpload(false)}
                  />
                </div>
              </div>
            )}

            {/* Max Marks Setup Modal */}
            {showMaxMarksSetup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                  <MaxMarksSetup 
                    examType={selectedExamForSetup}
                    existingConfig={selectedExamConfig}
                    subjects={subjects}
                    onSave={handleMaxMarksSaved}
                    onCancel={() => {
                      setShowMaxMarksSetup(false);
                      setSelectedExamForSetup('');
                      setSelectedExamConfig(null);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Marks Edit Modal */}
            {showMarksEdit && selectedMarksForEdit && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <MarksEdit
                    marksData={selectedMarksForEdit}
                    onSuccess={handleMarksUpdated}
                    onCancel={() => setShowMarksEdit(false)}
                  />
                </div>
              </div>
            )}

            {/* Student Edit Modal */}
            {showStudentEdit && selectedStudentForEdit && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <StudentEditForm
                    student={selectedStudentForEdit}
                    onStudentUpdated={handleStudentUpdated}
                    onCancel={handleCancelEdit}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 