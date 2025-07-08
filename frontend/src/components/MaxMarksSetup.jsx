import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, BookOpen, Award, AlertCircle, Check } from 'lucide-react';

const MaxMarksSetup = ({ examType, existingConfig, subjects, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    examType: examType || '',
    defaultMaxMarks: 100,
    subjectMaxMarks: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (existingConfig) {
      setFormData({
        examType: existingConfig.examType,
        defaultMaxMarks: existingConfig.defaultMaxMarks || 100,
        subjectMaxMarks: existingConfig.subjectMaxMarks || [],
        notes: existingConfig.notes || ''
      });
    } else if (subjects && subjects.length > 0) {
      // Initialize with default values for all subjects
      const initialSubjects = subjects.map(subject => ({
        subject: subject.name,
        subjectCode: subject.code || subject.name.substring(0, 3).toUpperCase(),
        maxMarks: 100,
        isTheory: true,
        isPractical: false,
        passingMarks: 35
      }));
      setFormData(prev => ({
        ...prev,
        subjectMaxMarks: initialSubjects
      }));
    }
  }, [existingConfig, subjects]);

  const handleDefaultMaxMarksChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      defaultMaxMarks: value,
      subjectMaxMarks: prev.subjectMaxMarks.map(subject => ({
        ...subject,
        maxMarks: value,
        passingMarks: Math.ceil(value * 0.35)
      }))
    }));
  };

  const handleSubjectMaxMarksChange = (index, field, value) => {
    const updatedSubjects = [...formData.subjectMaxMarks];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: field === 'maxMarks' ? parseInt(value) || 0 : value
    };

    // Auto-calculate passing marks (35% of max marks)
    if (field === 'maxMarks') {
      updatedSubjects[index].passingMarks = Math.ceil((parseInt(value) || 0) * 0.35);
    }

    setFormData(prev => ({
      ...prev,
      subjectMaxMarks: updatedSubjects
    }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjectMaxMarks: [
        ...prev.subjectMaxMarks,
        {
          subject: '',
          subjectCode: '',
          maxMarks: prev.defaultMaxMarks,
          isTheory: true,
          isPractical: false,
          passingMarks: Math.ceil(prev.defaultMaxMarks * 0.35)
        }
      ]
    }));
  };

  const removeSubject = (index) => {
    setFormData(prev => ({
      ...prev,
      subjectMaxMarks: prev.subjectMaxMarks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate data
      if (!formData.examType) {
        throw new Error('Exam type is required');
      }

      if (formData.subjectMaxMarks.length === 0) {
        throw new Error('At least one subject is required');
      }

      for (const subject of formData.subjectMaxMarks) {
        if (!subject.subject || !subject.subjectCode || !subject.maxMarks) {
          throw new Error('All subject fields are required');
        }
        if (subject.maxMarks <= 0) {
          throw new Error('Max marks must be greater than 0');
        }
      }

      const response = await fetch('/api/marks/set-max-marks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        if (onSave) {
          onSave(data.data);
        }
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        console.error('Save max marks error:', data);
        setError(data.message || 'Failed to save max marks configuration');
      }
    } catch (error) {
      console.error('Save max marks error:', error);
      setError(error.message || 'Failed to save max marks configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Award className="mr-3 text-green-600" size={28} />
          अधिकतम अंक सेटअप / Max Marks Setup
        </h2>
        <div className="text-sm text-gray-600">
          {existingConfig ? 'संपादित करें / Edit Configuration' : 'नया कॉन्फ़िगरेशन / New Configuration'}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Check className="text-green-500 mr-2" size={20} />
            <p className="text-green-700">
              अधिकतम अंक कॉन्फ़िगरेशन सफलतापूर्वक सेव किया गया / Max marks configuration saved successfully
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            परीक्षा प्रकार / Exam Type
          </label>
          <input
            type="text"
            value={formData.examType}
            className="w-full p-3 border border-gray-300 bg-gray-50 rounded-lg cursor-not-allowed"
            placeholder="Exam type..."
            required
            disabled={true} // Always disabled as it comes from selected exam
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            परीक्षा प्रकार परीक्षा चयन से आता है / Exam type comes from exam selection
          </p>
        </div>

        {/* Default Max Marks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            डिफ़ॉल्ट अधिकतम अंक / Default Max Marks
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={formData.defaultMaxMarks}
              onChange={handleDefaultMaxMarksChange}
              min="1"
              max="1000"
              className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <span className="text-sm text-gray-600">
              सभी विषयों के लिए लागू होगा / Will apply to all subjects
            </span>
          </div>
        </div>

        {/* Subject Max Marks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              विषयवार अधिकतम अंक / Subject-wise Max Marks
            </label>
            <button
              type="button"
              onClick={addSubject}
              className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="mr-2" size={16} />
              विषय जोड़ें / Add Subject
            </button>
          </div>

          <div className="space-y-4">
            {formData.subjectMaxMarks.map((subject, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      विषय / Subject
                    </label>
                    <input
                      type="text"
                      value={subject.subject}
                      onChange={(e) => handleSubjectMaxMarksChange(index, 'subject', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Subject name..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      कोड / Code
                    </label>
                    <input
                      type="text"
                      value={subject.subjectCode}
                      onChange={(e) => handleSubjectMaxMarksChange(index, 'subjectCode', e.target.value.toUpperCase())}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Code..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      अधिकतम अंक / Max Marks
                    </label>
                    <input
                      type="number"
                      value={subject.maxMarks}
                      onChange={(e) => handleSubjectMaxMarksChange(index, 'maxMarks', e.target.value)}
                      min="1"
                      max="1000"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      <p>पासिंग मार्क्स / Passing: {subject.passingMarks}</p>
                      <p>प्रतिशत / Percentage: 35%</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {formData.subjectMaxMarks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="mx-auto mb-2" size={32} />
              <p>कोई विषय नहीं जोड़ा गया / No subjects added</p>
              <p className="text-sm">ऊपर "विषय जोड़ें" बटन पर क्लिक करें</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            टिप्पणी / Notes (वैकल्पिक / Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes about this configuration..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            रद्द करें / Cancel
          </button>
          <button
            type="submit"
            disabled={loading || formData.subjectMaxMarks.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                सहेजा जा रहा है... / Saving...
              </>
            ) : (
              <>
                <Save className="mr-2" size={16} />
                सहेजें / Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaxMarksSetup; 