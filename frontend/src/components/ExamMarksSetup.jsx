import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaBookOpen, FaSave, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ExamMarksSetup = () => {
  const [teacherInfo, setTeacherInfo] = useState({});
  const [availableExams, setAvailableExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [maxMarksConfig, setMaxMarksConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examLoading, setExamLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch teacher info and exams on component mount
  useEffect(() => {
    fetchTeacherData();
  }, []);

  // Auto-fetch subjects when exam is selected
  useEffect(() => {
    if (selectedExam && teacherInfo.class && teacherInfo.medium) {
      fetchSubjectsForClass();
    }
  }, [selectedExam, teacherInfo.class, teacherInfo.medium]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      // Fetch teacher's exam data
      const response = await fetch('/api/marks/teacher-exams', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setTeacherInfo(data.data.teacherInfo || {});
        setAvailableExams(data.data.examTypes || []);
      } else {
        setMessage(data.message || 'Failed to fetch teacher data');
        toast.error('Failed to fetch teacher information');
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setMessage('Network error while fetching teacher data');
      toast.error('Network error while fetching teacher data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsForClass = async () => {
    try {
      setSubjectsLoading(true);
      setMessage('');

      // Auto-fetch subjects for teacher's class and medium
      const response = await fetch(
        `/api/subjects?className=${encodeURIComponent(teacherInfo.class)}&medium=${encodeURIComponent(teacherInfo.medium)}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSubjects(data.data || []);
        
        // Initialize max marks config with default values
        const initialConfig = data.data.map(subject => ({
          subject: subject,
          maxMarks: 100 // Default max marks
        }));
        setMaxMarksConfig(initialConfig);
        
        toast.success(`Found ${data.data.length} subjects for ${teacherInfo.class}`);
      } else {
        setSubjects([]);
        setMaxMarksConfig([]);
        setMessage(data.message || 'Subjects not configured by Admin for this class and medium');
        toast.warning('Subjects not configured by Admin for this class and medium');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
      setMaxMarksConfig([]);
      setMessage('Network error while fetching subjects');
      toast.error('Network error while fetching subjects');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleExamChange = (examId) => {
    setSelectedExam(examId);
    setSubjects([]);
    setMaxMarksConfig([]);
    setMessage('');
  };

  const handleMaxMarksChange = (index, value) => {
    const updatedConfig = [...maxMarksConfig];
    updatedConfig[index].maxMarks = parseInt(value) || 0;
    setMaxMarksConfig(updatedConfig);
  };

  const setDefaultMaxMarks = (defaultValue) => {
    const updatedConfig = maxMarksConfig.map(config => ({
      ...config,
      maxMarks: defaultValue
    }));
    setMaxMarksConfig(updatedConfig);
    toast.info(`Set all subjects to ${defaultValue} marks`);
  };

  const validateForm = () => {
    if (!selectedExam) {
      setMessage('Please select an exam / कृपया परीक्षा चुनें');
      return false;
    }

    if (maxMarksConfig.length === 0) {
      setMessage('No subjects available / कोई विषय उपलब्ध नहीं');
      return false;
    }

    // Validate marks
    const invalidMarks = maxMarksConfig.find(config => config.maxMarks <= 0);
    if (invalidMarks) {
      setMessage(`Please enter valid marks for ${invalidMarks.subject} / ${invalidMarks.subject} के लिए वैध अंक दर्ज करें`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setMessage('');

      const requestData = {
        examId: selectedExam,
        subjectList: maxMarksConfig
      };

      const response = await fetch('/api/teacher/set-max-marks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Max marks saved successfully! / अधिकतम अंक सफलतापूर्वक सेव किए गए!');
        toast.success('Max marks configuration saved successfully!');
      } else {
        setMessage(data.message || 'Error saving configuration');
        toast.error(data.message || 'Error saving configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setMessage('Network error / नेटवर्क त्रुटि');
      toast.error('Network error while saving configuration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl mr-3" />
            <span className="text-gray-600">Loading teacher information... / शिक्षक की जानकारी लोड हो रही है...</span>
          </div>
        </div>
      </div>
    );
  }

  const selectedExamDetails = availableExams.find(exam => exam._id === selectedExam);
  const totalMaxMarks = maxMarksConfig.reduce((total, config) => total + config.maxMarks, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <FaClipboardList className="mr-3 text-blue-600" />
          Exam Max Marks Setup / परीक्षा अधिकतम अंक सेटअप
        </h2>
        <p className="text-gray-600">
          Set maximum marks for each subject in the selected exam / चयनित परीक्षा में प्रत्येक विषय के लिए अधिकतम अंक सेट करें
        </p>
        
        {/* Teacher Info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Class:</span>
              <p className="text-blue-800 font-semibold">{teacherInfo.class}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Medium:</span>
              <p className="text-blue-800 font-semibold">{teacherInfo.medium}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Academic Year:</span>
              <p className="text-blue-800 font-semibold">{teacherInfo.academicYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Select Exam / परीक्षा चुनें
        </h3>
        
        <select
          value={selectedExam}
          onChange={(e) => handleExamChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={examLoading}
        >
          <option value="">Select an exam / परीक्षा चुनें</option>
          {availableExams.map((exam) => (
            <option key={exam._id} value={exam._id}>
              {exam.examType}
            </option>
          ))}
        </select>

        {selectedExamDetails && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Selected Exam:</strong> {selectedExamDetails.examType}
            </p>
          </div>
        )}
      </div>

      {/* Auto-fetched Subjects */}
      {selectedExam && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaBookOpen className="mr-2 text-green-600" />
              Auto-Fetched Subjects / स्वचालित रूप से लाए गए विषय
            </h3>
            
            {/* Quick Set Buttons */}
            {maxMarksConfig.length > 0 && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setDefaultMaxMarks(50)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Set All: 50
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultMaxMarks(100)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  Set All: 100
                </button>
              </div>
            )}
          </div>

          {subjectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-blue-600 text-xl mr-3" />
              <span className="text-gray-600">Auto-fetching subjects... / विषय स्वचालित रूप से लाए जा रहे हैं...</span>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8">
              <FaExclamationTriangle className="text-yellow-500 text-3xl mx-auto mb-3" />
              <p className="text-gray-600">
                Subjects not configured by Admin / व्यवस्थापक द्वारा विषय कॉन्फ़िगर नहीं किए गए
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please contact administrator to configure subjects for {teacherInfo.class} ({teacherInfo.medium} Medium)
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maxMarksConfig.map((config, index) => (
                  <div key={config.subject} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">{config.subject}</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Subject {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Max Marks:</span>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={config.maxMarks}
                        onChange={(e) => handleMaxMarksChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Display */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">
                    Total Maximum Marks / कुल अधिकतम अंक:
                  </span>
                  <span className="text-xl font-bold text-blue-900">
                    {totalMaxMarks}
                  </span>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  {maxMarksConfig.length} subjects configured / {maxMarksConfig.length} विषय कॉन्फ़िगर किए गए
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || maxMarksConfig.length === 0}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Saving... / सेव हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <FaSave />
                      <span>Save Max Marks / अधिकतम अंक सेव करें</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.includes('successfully') || message.includes('सफलतापूर्वक') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : message.includes('configured') || message.includes('कॉन्फ़िगर')
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            {message.includes('successfully') || message.includes('सफलतापूर्वक') ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm">{message}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedExam && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                How it works / यह कैसे काम करता है
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>1. Select an exam from the dropdown / ड्रॉपडाउन से परीक्षा चुनें</p>
                <p>2. Subjects will be auto-fetched for your class / आपकी कक्षा के लिए विषय स्वचालित रूप से लाए जाएंगे</p>
                <p>3. Set maximum marks for each subject / प्रत्येक विषय के लिए अधिकतम अंक सेट करें</p>
                <p>4. Save the configuration / कॉन्फ़िगरेशन को सेव करें</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamMarksSetup; 