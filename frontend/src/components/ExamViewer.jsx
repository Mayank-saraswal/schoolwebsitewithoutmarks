import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Users, Award, Settings, Plus, Edit3, Eye, ChevronDown } from 'lucide-react';

const ExamViewer = ({ onSelectExam, onSetMaxMarks, onUploadMarks }) => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [maxMarksConfigs, setMaxMarksConfigs] = useState([]);
  const [teacherInfo, setTeacherInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [classSubjectsLoading, setClassSubjectsLoading] = useState(false);

  // Predefined class options
  const classOptions = [
    'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
    'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
  ];

  useEffect(() => {
    fetchTeacherExams();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedClass !== teacherInfo.class) {
      fetchSubjectsForClass(selectedClass);
    }
  }, [selectedClass, teacherInfo.class]);

  const fetchTeacherExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marks/teacher-exams', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setExams(data.data.examTypes || []);
        setSubjects(data.data.subjects || []);
        setMaxMarksConfigs(data.data.maxMarksConfigs || []);
        setTeacherInfo(data.data.teacherInfo || {});
        setAvailableClasses(data.data.availableClasses || classOptions);
        
        // Set default selected class to teacher's assigned class
        if (data.data.teacherInfo?.class) {
          setSelectedClass(data.data.teacherInfo.class);
        }
      } else {
        setError(data.message || 'Failed to fetch exam data');
      }
    } catch (error) {
      console.error('Fetch exams error:', error);
      setError('Failed to fetch exam data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsForClass = async (className) => {
    try {
      setClassSubjectsLoading(true);
      const response = await fetch(`/api/marks/subjects-for-class/${className}?medium=${teacherInfo.medium}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSubjects(data.data.subjects || []);
        // Also fetch exams for this class
        await fetchExamsForClass(className);
      } else {
        setSubjects([]);
        setError(data.message || 'Failed to fetch subjects for selected class');
      }
    } catch (error) {
      console.error('Fetch subjects error:', error);
      setSubjects([]);
      setError('Failed to fetch subjects for selected class');
    } finally {
      setClassSubjectsLoading(false);
    }
  };

  const fetchExamsForClass = async (className) => {
    try {
      const response = await fetch(`/api/marks/exams-for-class/${className}?medium=${teacherInfo.medium}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setExams(data.data.examTypes || []);
        setMaxMarksConfigs(data.data.maxMarksConfigs || []);
      }
    } catch (error) {
      console.error('Fetch exams for class error:', error);
    }
  };

  const handleClassChange = (className) => {
    setSelectedClass(className);
    setSelectedExam('');
    if (className === teacherInfo.class) {
      // If selecting teacher's own class, fetch original data
      fetchTeacherExams();
    } else {
      // Otherwise fetch subjects for selected class
      fetchSubjectsForClass(className);
    }
  };

  const handleExamSelect = (examType) => {
    setSelectedExam(examType);
    if (onSelectExam) {
      onSelectExam(examType);
    }
  };

  const getMaxMarksConfig = (examType) => {
    return maxMarksConfigs.find(config => config.examType === examType);
  };

  const hasMaxMarksConfig = (examType) => {
    return maxMarksConfigs.some(config => config.examType === examType);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">परीक्षा की जानकारी लोड हो रही है... / Loading exam information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-4 h-4 text-red-500 mr-2">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchTeacherExams}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            पुनः प्रयास करें / Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <BookOpen className="mr-3 text-blue-600" size={28} />
            परीक्षा प्रबंधन / Exam Management
          </h2>
          <div className="text-sm text-gray-600">
            <p>आपकी कक्षा / Your Class: <span className="font-semibold text-blue-600">{teacherInfo.class}</span></p>
            <p>माध्यम / Medium: <span className="font-semibold text-blue-600">{teacherInfo.medium}</span></p>
            <p>शैक्षणिक वर्ष / Academic Year: <span className="font-semibold text-blue-600">{teacherInfo.academicYear}</span></p>
          </div>
        </div>
      </div>

      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            कक्षा चुनें / Select Class
          </h3>
          <div className="text-sm text-gray-500">
            {selectedClass === teacherInfo.class ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                आपकी कक्षा / Your Class
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                चयनित कक्षा / Selected Class
              </span>
            )}
          </div>
        </div>
        
        <div className="relative">
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            disabled={classSubjectsLoading}
          >
            <option value="">कक्षा चुनें / Select Class</option>
            {availableClasses.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {classSubjectsLoading && (
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            विषय लोड हो रहे हैं... / Loading subjects...
          </div>
        )}

        {selectedClass && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>चयनित कक्षा / Selected Class:</strong> {selectedClass}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              <strong>विषयों की संख्या / Number of Subjects:</strong> {subjects.length}
            </p>
          </div>
        )}
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => {
          const config = getMaxMarksConfig(exam.examType);
          const hasConfig = hasMaxMarksConfig(exam.examType);
          
          return (
            <div
              key={exam._id}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 ${
                selectedExam === exam.examType ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <div className="p-6">
                {/* Exam Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Calendar className="text-blue-600 mr-2" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">{exam.examType}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hasConfig ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hasConfig ? 'कॉन्फ़िगर किया गया / Configured' : 'कॉन्फ़िगरेशन आवश्यक / Setup Required'}
                  </div>
                </div>

                {/* Exam Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="mr-2" size={16} />
                    <span>अधिकतम अंक / Max Marks: {exam.maxMarks || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2" size={16} />
                    <span>विषय / Subjects: {subjects.length}</span>
                  </div>
                  {config && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Settings className="mr-2" size={16} />
                      <span>डिफ़ॉल्ट अंक / Default: {config.defaultMaxMarks}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleExamSelect(exam.examType)}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedExam === exam.examType
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <Eye className="mr-2" size={16} />
                    {selectedExam === exam.examType ? 'चयनित / Selected' : 'चुनें / Select'}
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSetMaxMarks && onSetMaxMarks(exam.examType, config)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      {hasConfig ? <Edit3 className="mr-1" size={14} /> : <Plus className="mr-1" size={14} />}
                      {hasConfig ? 'संपादित करें / Edit' : 'सेटअप / Setup'}
                    </button>
                    
                    <button
                      onClick={() => onUploadMarks && onUploadMarks(exam.examType)}
                      disabled={!hasConfig}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasConfig 
                          ? 'bg-purple-50 text-purple-600 hover:bg-purple-100' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <BookOpen className="mr-1" size={14} />
                      अंक अपलोड / Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {exams.length === 0 && selectedClass && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            कोई परीक्षा नहीं मिली / No Exams Found
          </h3>
          <p className="text-gray-500 mb-4">
            {selectedClass} कक्षा के लिए कोई परीक्षा कॉन्फ़िगर नहीं की गई है।
            <br />
            No exams are configured for {selectedClass}.
          </p>
          <p className="text-sm text-gray-400">
            कृपया प्रशासक से संपर्क करें / Please contact administrator
          </p>
        </div>
      )}

      {/* Selected Exam Info */}
      {selectedExam && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            चयनित परीक्षा / Selected Exam: {selectedExam}
          </h4>
          <p className="text-blue-600 text-sm">
            कक्षा: {selectedClass} | विषय: {subjects.length}
            <br />
            अब आप इस परीक्षा के लिए अधिकतम अंक सेट कर सकते हैं या छात्रों के अंक अपलोड कर सकते हैं।
            <br />
            You can now set max marks for this exam or upload student marks.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExamViewer; 