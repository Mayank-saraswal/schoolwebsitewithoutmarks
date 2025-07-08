import React from 'react';
import ExamTypeConfigPanel from '../components/ExamTypeConfigPanel';

const ExamTypeManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ExamTypeConfigPanel />
      </div>
    </div>
  );
};

export default ExamTypeManagement; 