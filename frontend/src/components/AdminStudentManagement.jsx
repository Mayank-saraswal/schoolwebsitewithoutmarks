import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import AdminStudentCreateForm from './AdminStudentCreateForm';
import StudentList from './StudentList';
import { Plus, List, Users } from 'lucide-react';

const AdminStudentManagement = () => {
  const { selectedMedium, selectedYear } = useAdmin();
  const [activeView, setActiveView] = useState('list'); // 'list' or 'create'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStudentCreated = (newStudent) => {
    // Refresh the student list
    setRefreshTrigger(prev => prev + 1);
    // Switch back to list view
    setActiveView('list');
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-7 w-7 mr-3 text-blue-600" />
              Student Management / छात्र प्रबंधन
            </h2>
            <p className="text-gray-600 mt-1">
              Manage student records for {selectedMedium} Medium • Academic Year {selectedYear}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeView === 'list'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4 mr-2" />
              View Students / छात्र देखें
            </button>
            
            <button
              onClick={() => setActiveView('create')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeView === 'create'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student / छात्र जोड़ें
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {activeView === 'list' ? (
          <StudentList 
            refreshTrigger={refreshTrigger}
            mode="admin"
          />
        ) : (
          <AdminStudentCreateForm
            onStudentCreated={handleStudentCreated}
            onCancel={() => setActiveView('list')}
          />
        )}
      </div>
    </div>
  );
};

export default AdminStudentManagement;