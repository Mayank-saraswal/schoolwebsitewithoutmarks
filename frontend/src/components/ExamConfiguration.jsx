import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { toast } from 'react-toastify';

const ExamConfiguration = () => {
  const { selectedMedium, selectedYear, isReady } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [examConfigs, setExamConfigs] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load exam configurations
  const loadExamConfigs = async () => {
    if (!isReady) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/exam-configs?medium=${selectedMedium}&year=${selectedYear}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setExamConfigs(data.data);
      } else {
        toast.error(data.message || 'Failed to load exam configurations');
      }
    } catch (error) {
      console.error('Error loading exam configs:', error);
      toast.error('Failed to load exam configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadExamConfigs();
    }
  }, [isReady, selectedMedium, selectedYear]);

  if (!isReady) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Please select medium and year first</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Exam Configuration</h2>
          <p className="text-gray-600">
            Medium: {selectedMedium} | Year: {selectedYear}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Create New Exam
        </button>
      </div>

      {/* Create Form Modal */}
      <ExamConfigurationForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={loadExamConfigs}
        selectedMedium={selectedMedium}
        selectedYear={selectedYear}
      />

      {/* Exam Configurations List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : examConfigs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No exam configurations found</p>
            <p className="text-sm text-gray-500 mt-1">Create your first exam configuration to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examConfigs.map((config) => (
                  <tr key={config._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {config.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {config.examName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {config.totalMaxMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(config.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ExamConfigurationForm component
const ExamConfigurationForm = ({ isOpen, onClose, onSuccess, selectedMedium, selectedYear }) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    class: '',
    examName: '',
    subjects: []
  });

  const classOptions = [
    'Nursery', 'LKG', 'UKG', 
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 Science', 'Class 11 Arts', 'Class 11 Commerce',
    'Class 12 Science', 'Class 12 Arts', 'Class 12 Commerce'
  ];

  const examTypes = [
    'Unit Test 1', 'Unit Test 2', 'Unit Test 3',
    'Monthly Test', 'Weekly Test', 'Quarterly Exam',
    'Half Yearly', 'Pre-Board', 'Pre-Board 1', 'Pre-Board 2',
    'Annual Exam', 'Board Exam', '1st Test', '2nd Test', '3rd Test'
  ];

  // Load subjects for selected class
  const loadSubjects = async (className) => {
    if (!className) return;
    
    try {
      const response = await fetch(`/api/admin/subjects?class=${encodeURIComponent(className)}&medium=${selectedMedium}&academicYear=${selectedYear}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data.subjects);
        // Initialize subjects in form with default marks
        const subjectsWithMarks = data.data.subjects.map(subject => ({
          subjectName: subject,
          maxMarks: 50 // Default marks
        }));
        setFormData(prev => ({ ...prev, subjects: subjectsWithMarks }));
      } else {
        toast.error(data.message || 'Failed to load subjects');
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.class || !formData.examName || formData.subjects.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate subjects have valid marks
    const invalidSubjects = formData.subjects.filter(s => !s.maxMarks || s.maxMarks <= 0);
    if (invalidSubjects.length > 0) {
      toast.error('All subjects must have valid max marks');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/exam-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          class: formData.class,
          medium: selectedMedium,
          academicYear: selectedYear.toString(),
          examName: formData.examName,
          subjects: formData.subjects
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Exam configuration created successfully!');
        onSuccess();
        onClose();
        setFormData({ class: '', examName: '', subjects: [] });
      } else {
        toast.error(data.message || 'Failed to create exam configuration');
      }
    } catch (error) {
      console.error('Error creating exam config:', error);
      toast.error('Failed to create exam configuration');
    } finally {
      setLoading(false);
    }
  };

  // Handle class selection
  const handleClassChange = (className) => {
    setFormData(prev => ({ ...prev, class: className, subjects: [] }));
    loadSubjects(className);
  };

  // Handle subject marks change
  const handleSubjectMarksChange = (index, marks) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index].maxMarks = parseInt(marks) || 0;
    setFormData(prev => ({ ...prev, subjects: updatedSubjects }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Create Exam Configuration</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class *
            </label>
            <select
              value={formData.class}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Class</option>
              {classOptions.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Exam Name Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Name *
            </label>
            <select
              value={formData.examName}
              onChange={(e) => setFormData(prev => ({ ...prev, examName: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Exam Type</option>
              {examTypes.map(exam => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>
          </div>

          {/* Subjects and Marks */}
          {formData.subjects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Max Marks *
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-1 font-medium">{subject.subjectName}</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={subject.maxMarks}
                      onChange={(e) => handleSubjectMarksChange(index, e.target.value)}
                      className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Marks"
                      required
                    />
                    <span className="text-sm text-gray-500">marks</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Total Max Marks: {formData.subjects.reduce((sum, s) => sum + (s.maxMarks || 0), 0)}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.subjects.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamConfiguration;
export { ExamConfigurationForm };