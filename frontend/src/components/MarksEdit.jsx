import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEdit, FaSpinner, FaUser, FaClipboardList, FaGraduationCap, FaTimes, FaSave } from 'react-icons/fa';

const MarksEdit = ({ marksData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    remarks: '',
    changeReason: ''
  });
  const [marks, setMarks] = useState([]);
  const [originalMarks, setOriginalMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (marksData) {
      // Initialize form data
      setFormData({
        remarks: marksData.remarks || '',
        changeReason: ''
      });

      // Initialize marks array
      const marksArray = marksData.marks.map(mark => ({
        subject: mark.subject,
        subjectCode: mark.subjectCode,
        obtained: mark.obtained,
        maxMarks: mark.maxMarks,
        originalObtained: mark.obtained
      }));

      setMarks(marksArray);
      setOriginalMarks(marksArray.map(m => ({ ...m })));
    }
  }, [marksData]);

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
    if (!marksData) {
      toast.error('No marks data provided');
      return false;
    }

    // Check if any marks were changed
    const hasChanges = marks.some((mark, index) => 
      parseFloat(mark.obtained) !== parseFloat(originalMarks[index].obtained)
    ) || formData.remarks !== (marksData.remarks || '');

    if (!hasChanges) {
      toast.error('No changes detected. Please modify at least one field.');
      return false;
    }

    // Validate marks
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

    // Validate change reason if marks were modified
    const marksChanged = marks.some((mark, index) => 
      parseFloat(mark.obtained) !== parseFloat(originalMarks[index].obtained)
    );

    if (marksChanged && !formData.changeReason.trim()) {
      toast.error('Please provide a reason for changing the marks');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('teacherToken');
      
      // Prepare update data - only include marks that have changed
      const changedMarks = marks.filter((mark, index) => 
        parseFloat(mark.obtained) !== parseFloat(originalMarks[index].obtained)
      ).map(mark => ({
        subject: mark.subject,
        obtained: parseFloat(mark.obtained)
      }));

      const updateData = {
        marks: changedMarks,
        remarks: formData.remarks,
        changeReason: formData.changeReason
      };

      const response = await fetch(
        `/api/marks/update/${marksData.studentId}/${marksData.examType}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'Marks updated successfully!');
        if (onSuccess) onSuccess(data.data);
        if (onClose) onClose();
      } else {
        toast.error(data.message || 'Failed to update marks');
      }
    } catch (error) {
      console.error('Error updating marks:', error);
      toast.error('Network error while updating marks');
    } finally {
      setUpdating(false);
    }
  };

  if (!marksData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <p className="text-red-600">No marks data provided</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaEdit className="text-xl" />
                Edit Marks / अंक संपादित करें
              </h2>
              <p className="text-green-100 mt-1">
                Edit student exam marks / छात्र के परीक्षा अंक संपादित करें
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
          {/* Student Info Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">
              <FaGraduationCap className="inline mr-2" />
              Student Details / छात्र विवरण
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-medium">{marksData.studentName}</p>
              </div>
              <div>
                <span className="text-gray-600">SR Number:</span>
                <p className="font-medium">{marksData.srNumber}</p>
              </div>
              <div>
                <span className="text-gray-600">Class:</span>
                <p className="font-medium">{marksData.class} ({marksData.medium})</p>
              </div>
              <div>
                <span className="text-gray-600">Exam Type:</span>
                <p className="font-medium">{marksData.examType}</p>
              </div>
            </div>
          </div>

          {/* Current Result Summary */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">Current Result Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total:</span>
                <p className="font-medium">{marksData.totalObtained} / {marksData.totalMaxMarks}</p>
              </div>
              <div>
                <span className="text-gray-600">Percentage:</span>
                <p className="font-medium">{marksData.overallPercentage}%</p>
              </div>
              <div>
                <span className="text-gray-600">Grade:</span>
                <p className="font-medium">{marksData.overallGrade}</p>
              </div>
              <div>
                <span className="text-gray-600">Result:</span>
                <p className={`font-medium ${marksData.result === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {marksData.result}
                </p>
              </div>
            </div>
          </div>

          {/* Marks Entry */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Subject-wise Marks / विषयवार अंक संपादित करें
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marks.map((mark, index) => {
                const hasChanged = parseFloat(mark.obtained) !== parseFloat(mark.originalObtained);
                const currentPercentage = (mark.obtained / mark.maxMarks) * 100;
                
                return (
                  <div key={index} className={`border rounded-lg p-4 ${
                    hasChanged ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">{mark.subject}</h4>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Max: {mark.maxMarks}</span>
                        {hasChanged && (
                          <div className="text-xs text-yellow-600 font-medium">Modified</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="number"
                        min="0"
                        max={mark.maxMarks}
                        step="0.5"
                        value={mark.obtained}
                        onChange={(e) => handleMarkChange(index, e.target.value)}
                        placeholder="Enter marks"
                        className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          hasChanged ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                        }`}
                        required
                      />
                      <span className="text-gray-500">/ {mark.maxMarks}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div>
                        {hasChanged && (
                          <span className="text-yellow-600 font-medium">
                            Was: {mark.originalObtained}
                          </span>
                        )}
                      </div>
                      {mark.obtained && (
                        <span className={`font-medium ${
                          currentPercentage >= 35 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {currentPercentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Change Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Changes / परिवर्तन का कारण <span className="text-red-500">*</span>
            </label>
            <textarea
              name="changeReason"
              value={formData.changeReason}
              onChange={handleInputChange}
              rows={3}
              placeholder="Please provide a reason for changing the marks (required if marks are modified)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required={marks.some((mark, index) => 
                parseFloat(mark.obtained) !== parseFloat(originalMarks[index]?.obtained || 0)
              )}
            />
          </div>

          {/* Remarks */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Updated Remarks / अपडेटेड टिप्पणी (Optional)
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              placeholder="Update any remarks about the exam or student performance..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Change Summary */}
          {marks.some((mark, index) => 
            parseFloat(mark.obtained) !== parseFloat(originalMarks[index]?.obtained || 0)
          ) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Changes Summary / परिवर्तन सारांश</h4>
              <div className="space-y-2">
                {marks.map((mark, index) => {
                  const original = originalMarks[index];
                  if (parseFloat(mark.obtained) !== parseFloat(original?.obtained || 0)) {
                    return (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{mark.subject}:</span>
                        <span className="text-red-600 ml-2">{original?.obtained || 0}</span>
                        <span className="mx-2">→</span>
                        <span className="text-green-600">{mark.obtained}</span>
                        <span className="text-gray-500 ml-2">
                          ({((mark.obtained / mark.maxMarks) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    );
                  }
                  return null;
                }).filter(Boolean)}
              </div>
            </div>
          )}

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
              disabled={updating || loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updating ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave />
                  Update Marks / अंक अपडेट करें
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarksEdit; 