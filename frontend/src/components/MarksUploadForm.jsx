import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUpload, FaSpinner, FaUser, FaClipboardList, FaGraduationCap, FaTimes } from 'react-icons/fa';

const MarksUploadForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    examType: '',
    remarks: ''
  });
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [maxMarksConfig, setMaxMarksConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const examTypes = [
    '1st Test',
    '2nd Test', 
    'Half-Yearly',
    '3rd Test',
    'Yearly',
    'Pre-Board',
    'Final'
  ];

  // Fetch teacher's students
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch subjects when student is selected
  useEffect(() => {
    if (formData.studentId) {
      fetchSubjects();
    }
  }, [formData.studentId]);

  // Fetch max marks when student and exam type are selected
  useEffect(() => {
    if (formData.studentId && formData.examType) {
      fetchMaxMarks();
    }
  }, [formData.studentId, formData.examType]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students/my-students', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Network error while fetching students');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const selectedStudent = students.find(s => s._id === formData.studentId);
      if (!selectedStudent) return;

      const response = await fetch(
        `/api/config/subjects/${selectedStudent.class}?medium=${selectedStudent.medium}`,
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
        setSubjects(data.data.subjects);
        // Initialize marks array
        const initialMarks = data.data.subjects.map(subject => ({
          subject: subject.name,
          subjectCode: subject.code,
          obtained: '',
          maxMarks: 100 // Default, will be updated by max marks config
        }));
        setMarks(initialMarks);
      } else {
        toast.error(data.message || 'Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Network error while fetching subjects');
    }
  };

  const fetchMaxMarks = async () => {
    try {
      const selectedStudent = students.find(s => s._id === formData.studentId);
      if (!selectedStudent) return;

      // Use default max marks for now - the backend will validate against configured max marks
        const updatedMarks = marks.map(mark => ({
          ...mark,
        maxMarks: 100 // Default max marks
        }));
        setMarks(updatedMarks);
    } catch (error) {
      console.error('Error setting max marks:', error);
      // Continue with default max marks
      const updatedMarks = marks.map(mark => ({
        ...mark,
        maxMarks: 100
      }));
      setMarks(updatedMarks);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMarkChange = (index, value) => {
    const updatedMarks = [...marks];
    updatedMarks[index].obtained = value;
    setMarks(updatedMarks);
  };

  const validateForm = () => {
    if (!formData.studentId) {
      toast.error('Please select a student');
      return false;
    }

    if (!formData.examType) {
      toast.error('Please select an exam type');
      return false;
    }

    if (marks.length === 0) {
      toast.error('No subjects found. Please check subject configuration.');
      return false;
    }

    for (let i = 0; i < marks.length; i++) {
      const mark = marks[i];
      if (mark.obtained === '' || mark.obtained === null || mark.obtained === undefined) {
        toast.error(`Please enter marks for ${mark.subject}`);
        return false;
      }

      const obtainedMarks = parseFloat(mark.obtained);
      if (isNaN(obtainedMarks) || obtainedMarks < 0 || obtainedMarks > mark.maxMarks) {
        toast.error(`Marks for ${mark.subject} must be between 0 and ${mark.maxMarks}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setUploading(true);
      
      const uploadData = {
        studentId: formData.studentId,
        examType: formData.examType,
        marks: marks.map(mark => ({
          subject: mark.subject,
          subjectCode: mark.subjectCode,
          obtained: parseFloat(mark.obtained),
          maxMarks: mark.maxMarks
        })),
        remarks: formData.remarks
      };

      const response = await fetch('/api/marks/upload', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'Marks uploaded successfully!');
        if (onSuccess) onSuccess(data.data);
        if (onClose) onClose();
      } else {
        toast.error(data.message || 'Failed to upload marks');
      }
    } catch (error) {
      console.error('Error uploading marks:', error);
      toast.error('Network error while uploading marks');
    } finally {
      setUploading(false);
    }
  };

  const selectedStudent = students.find(s => s._id === formData.studentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaUpload className="text-xl" />
                Upload Marks / अंक अपलोड करें
              </h2>
              <p className="text-blue-100 mt-1">
                Upload student exam marks / छात्र के परीक्षा अंक अपलोड करें
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Student and Exam Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Select Student / छात्र चुनें <span className="text-red-500">*</span>
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Loading students...' : 'Select a student / छात्र चुनें'}
                </option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.studentName} - {student.srNumber} ({student.class})
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaClipboardList className="inline mr-2" />
                Exam Type / परीक्षा प्रकार <span className="text-red-500">*</span>
              </label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select exam type / परीक्षा प्रकार चुनें</option>
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Info Display */}
          {selectedStudent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">
                <FaGraduationCap className="inline mr-2" />
                Student Details / छात्र विवरण
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{selectedStudent.studentName}</p>
                </div>
                <div>
                  <span className="text-gray-600">SR Number:</span>
                  <p className="font-medium">{selectedStudent.srNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Class:</span>
                  <p className="font-medium">{selectedStudent.class}</p>
                </div>
                <div>
                  <span className="text-gray-600">Medium:</span>
                  <p className="font-medium">{selectedStudent.medium}</p>
                </div>
              </div>
            </div>
          )}

          {/* Marks Entry */}
          {marks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Subject-wise Marks / विषयवार अंक
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marks.map((mark, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">{mark.subject}</h4>
                      <span className="text-sm text-gray-600">
                        Max: {mark.maxMarks}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={mark.maxMarks}
                        step="0.5"
                        value={mark.obtained}
                        onChange={(e) => handleMarkChange(index, e.target.value)}
                        placeholder="Enter marks"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <span className="text-gray-500">/ {mark.maxMarks}</span>
                    </div>
                    {mark.obtained && (
                      <div className="mt-2 text-sm">
                        <span className={`font-medium ${
                          (mark.obtained / mark.maxMarks) * 100 >= 35 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {((mark.obtained / mark.maxMarks) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks / टिप्पणी (Optional)
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Add any remarks about the exam or student performance..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel / रद्द करें
            </button>
            <button
              type="submit"
              disabled={uploading || loading || marks.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload />
                  Upload Marks / अंक अपलोड करें
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarksUploadForm; 