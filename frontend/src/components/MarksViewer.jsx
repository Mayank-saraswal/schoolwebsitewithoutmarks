import React, { useState, useEffect } from 'react';
import { useParent } from '../context/ParentContext';

const MarksViewer = ({ studentId }) => {
  const { getStudentMarks } = useParent();
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchMarks();
    }
  }, [studentId]);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStudentMarks(studentId);
      
      if (response.ok && response.data.success) {
        setMarksData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch marks');
      }
    } catch (error) {
      console.error('Error fetching marks:', error);
      setError('अंक लाने में त्रुटि / Error fetching marks');
    } finally {
      setLoading(false);
    }
  };

  const getGradeFromPercentage = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600 bg-green-100' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600 bg-green-100' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600 bg-blue-100' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-600 bg-blue-100' };
    if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-600 bg-yellow-100' };
    if (percentage >= 40) return { grade: 'C', color: 'text-yellow-600 bg-yellow-100' };
    if (percentage >= 33) return { grade: 'D', color: 'text-orange-600 bg-orange-100' };
    return { grade: 'F', color: 'text-red-600 bg-red-100' };
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
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">अंक लोड हो रहे हैं... / Loading marks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">त्रुटि / Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchMarks}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200"
        >
          पुनः प्रयास करें / Retry
        </button>
      </div>
    );
  }

  if (!marksData || !marksData.marks || marksData.marks.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-medium text-gray-700 mb-2">कोई अंक नहीं मिले / No Marks Found</h3>
        <p className="text-gray-500">इस छात्र के लिए अभी तक कोई अंक दर्ज नहीं किए गए हैं</p>
        <p className="text-gray-500 text-sm">No marks have been entered for this student yet</p>
      </div>
    );
  }

  // Get all unique exam types from all subjects
  const allExamTypes = [...new Set(
    marksData.marks.flatMap(subject => subject.marks.map(mark => mark.examType))
  )].sort();

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">छात्र विवरण / Student Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600">नाम / Name:</span>
            <p className="font-medium">{marksData.student.name}</p>
          </div>
          <div>
            <span className="text-blue-600">कक्षा / Class:</span>
            <p className="font-medium">{marksData.student.class}</p>
          </div>
          <div>
            <span className="text-blue-600">माध्यम / Medium:</span>
            <p className="font-medium">{marksData.student.medium}</p>
          </div>
          <div>
            <span className="text-blue-600">विषयों की संख्या / Total Subjects:</span>
            <p className="font-medium">{marksData.totalSubjects}</p>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                विषय / Subject
              </th>
              {allExamTypes.map(examType => (
                <th key={examType} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  {examType}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {marksData.marks.map((subjectData, index) => (
              <tr key={subjectData.subject} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {subjectData.subject}
                </td>
                {allExamTypes.map(examType => {
                  const mark = subjectData.marks.find(m => m.examType === examType);
                  return (
                    <td key={examType} className="px-6 py-4 whitespace-nowrap text-center">
                      {mark ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {mark.score}/{mark.maxMarks}
                          </div>
                          <div className="flex items-center justify-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeFromPercentage(mark.percentage).color}`}>
                              {mark.percentage}% ({getGradeFromPercentage(mark.percentage).grade})
                            </span>
                          </div>
                          {mark.remarks && (
                            <div className="text-xs text-gray-500 italic">
                              {mark.remarks}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {marksData.marks.map((subjectData) => (
          <div key={subjectData.subject} className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
              {subjectData.subject}
            </h4>
            <div className="space-y-3">
              {subjectData.marks.map((mark, index) => {
                const gradeInfo = getGradeFromPercentage(mark.percentage);
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{mark.examType}</p>
                      <p className="text-sm text-gray-500">{formatDate(mark.date)}</p>
                      {mark.remarks && (
                        <p className="text-xs text-gray-500 italic mt-1">{mark.remarks}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{mark.score}/{mark.maxMarks}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${gradeInfo.color}`}>
                        {mark.percentage}% ({gradeInfo.grade})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Overall Performance Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          समग्र प्रदर्शन सारांश / Overall Performance Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{marksData.totalSubjects}</p>
            <p className="text-sm text-gray-600">कुल विषय / Total Subjects</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {marksData.marks.reduce((total, subject) => total + subject.marks.length, 0)}
            </p>
            <p className="text-sm text-gray-600">कुल परीक्षाएं / Total Exams</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(
                marksData.marks.reduce((total, subject) => 
                  total + subject.marks.reduce((subTotal, mark) => subTotal + mark.percentage, 0), 0
                ) / marksData.marks.reduce((total, subject) => total + subject.marks.length, 0)
              ) || 0}%
            </p>
            <p className="text-sm text-gray-600">औसत प्रतिशत / Average Percentage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksViewer; 