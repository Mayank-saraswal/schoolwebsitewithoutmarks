import React, { useState, useEffect } from 'react';
import { useParent } from '../context/ParentContext';

const ProgressChart = ({ studentId }) => {
  const { getStudentMarks } = useParent();
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('all');

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
      setError('डेटा लाने में त्रुटि / Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = () => {
    if (!marksData || !marksData.marks) return null;

    // Get all unique exam types and sort them chronologically
    const examTypeOrder = ['1st Test', '2nd Test', 'Half Yearly', '3rd Test', 'Annual Exam', 'Pre-Board', 'Board Exam'];
    const allExamTypes = [...new Set(marksData.marks.flatMap(subject => subject.marks.map(mark => mark.examType)))];
    const sortedExamTypes = allExamTypes.sort((a, b) => {
      const aIndex = examTypeOrder.indexOf(a);
      const bIndex = examTypeOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    // Calculate average performance across all subjects or specific subject
    const chartData = sortedExamTypes.map(examType => {
      const relevantMarks = selectedSubject === 'all' 
        ? marksData.marks.flatMap(subject => subject.marks.filter(mark => mark.examType === examType))
        : marksData.marks.find(subject => subject.subject === selectedSubject)?.marks.filter(mark => mark.examType === examType) || [];

      const avgPercentage = relevantMarks.length > 0
        ? relevantMarks.reduce((sum, mark) => sum + mark.percentage, 0) / relevantMarks.length
        : 0;

      return {
        examType,
        percentage: Math.round(avgPercentage),
        count: relevantMarks.length
      };
    }).filter(item => item.count > 0);

    return chartData;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-blue-400';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-yellow-400';
    if (percentage >= 33) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPerformanceTrend = (chartData) => {
    if (chartData.length < 2) return null;
    
    const first = chartData[0].percentage;
    const last = chartData[chartData.length - 1].percentage;
    const difference = last - first;
    
    if (Math.abs(difference) < 2) return { type: 'stable', value: 0 };
    return difference > 0 
      ? { type: 'improving', value: difference }
      : { type: 'declining', value: Math.abs(difference) };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">चार्ट लोड हो रहा है... / Loading chart...</p>
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

  const chartData = processChartData();
  
  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-xl font-medium text-gray-700 mb-2">प्रगति डेटा उपलब्ध नहीं / No Progress Data Available</h3>
        <p className="text-gray-500">चार्ट बनाने के लिए पर्याप्त परीक्षा डेटा नहीं है</p>
        <p className="text-gray-500 text-sm">Not enough exam data to create chart</p>
      </div>
    );
  }

  const trend = getPerformanceTrend(chartData);
  const maxPercentage = Math.max(...chartData.map(item => item.percentage));

  return (
    <div className="space-y-6">
      {/* Subject Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          विषय चुनें / Select Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">सभी विषय (औसत) / All Subjects (Average)</option>
          {marksData?.marks?.map(subject => (
            <option key={subject.subject} value={subject.subject}>
              {subject.subject}
            </option>
          ))}
        </select>
      </div>

      {/* Performance Trend Indicator */}
      {trend && (
        <div className={`border rounded-lg p-4 ${
          trend.type === 'improving' ? 'bg-green-50 border-green-200' :
          trend.type === 'declining' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {trend.type === 'improving' ? (
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : trend.type === 'declining' ? (
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                trend.type === 'improving' ? 'text-green-800' :
                trend.type === 'declining' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                प्रदर्शन रुझान / Performance Trend
              </h3>
              <p className={`text-sm ${
                trend.type === 'improving' ? 'text-green-700' :
                trend.type === 'declining' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {trend.type === 'improving' && `सुधार हो रहा है (+${trend.value}%) / Improving (+${trend.value}%)`}
                {trend.type === 'declining' && `गिरावट (-${trend.value}%) / Declining (-${trend.value}%)`}
                {trend.type === 'stable' && `स्थिर प्रदर्शन / Stable Performance`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {selectedSubject === 'all' 
            ? 'समग्र प्रगति चार्ट / Overall Progress Chart'
            : `${selectedSubject} - प्रगति चार्ट / Progress Chart`
          }
        </h3>

        {/* Bar Chart */}
        <div className="space-y-4">
          {chartData.map((item, index) => (
            <div key={item.examType} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700 flex-shrink-0">
                {item.examType}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getGradeColor(item.percentage)}`}
                  style={{ 
                    width: `${(item.percentage / 100) * 100}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-white drop-shadow-lg">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600 text-right flex-shrink-0">
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>

        {/* Chart Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">ग्रेड स्केल / Grade Scale</h4>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>90-100% (A+)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>80-89% (A)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>70-79% (B+)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span>60-69% (B)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>50-59% (C+)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>40-49% (C)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>33-39% (D)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>0-32% (F)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
          <h4 className="text-lg font-bold text-blue-600">{chartData.length}</h4>
          <p className="text-sm text-blue-700">परीक्षाएं दी गईं / Exams Taken</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
          <h4 className="text-lg font-bold text-green-600">{maxPercentage}%</h4>
          <p className="text-sm text-green-700">सर्वोच्च प्रतिशत / Highest Percentage</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
          <h4 className="text-lg font-bold text-purple-600">
            {Math.round(chartData.reduce((sum, item) => sum + item.percentage, 0) / chartData.length)}%
          </h4>
          <p className="text-sm text-purple-700">औसत प्रतिशत / Average Percentage</p>
        </div>
      </div>

      {/* Note about Chart.js */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              उन्नत चार्ट फीचर / Advanced Chart Feature
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>• अधिक interactive charts के लिए Chart.js library install करें</p>
              <p>• For more interactive charts, install Chart.js library</p>
              <p className="text-xs mt-1 text-yellow-600">npm install chart.js react-chartjs-2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart; 