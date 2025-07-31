import React, { useState, useEffect } from 'react';
import { useAdminAPI } from '../context/AdminContext';

const AdminDashboardStats = () => {
  const { apiCall, selectedMedium, selectedYear, isReady } = useAdminAPI();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard stats
  const loadStats = async () => {
    if (!isReady) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall('/api/admin/dashboard-stats');
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to load statistics');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Load stats when component mounts or year/medium changes
  useEffect(() => {
    loadStats();
  }, [selectedYear, selectedMedium, isReady]);

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        <div className="flex items-center">
          <span className="text-red-500 mr-2">⚠️</span>
          <div>
            <strong>Error:</strong> {error}
            <button
              onClick={loadStats}
              className="ml-4 text-red-600 hover:text-red-800 underline"
            >
              Retry / पुनः प्रयास करें
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded mb-6 text-center">
        No statistics available / कोई आंकड़े उपलब्ध नहीं हैं
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              📊 Dashboard Overview / डैशबोर्ड अवलोकन
            </h3>
            <p className="text-blue-100 text-sm">
              {selectedMedium} Medium • Academic Year {selectedYear}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-xs">Last Updated:</p>
            <p className="text-sm">
              {new Date(stats.overview.lastUpdated).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Student Statistics */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          👥 Student Statistics / छात्र आंकड़े
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Students"
            subtitle="कुल छात्र"
            value={stats.students.total}
            icon="👨‍🎓"
            color="blue"
          />
          <StatCard
            title="Fee Paid"
            subtitle="शुल्क भुगतान"
            value={stats.students.byFeeStatus.paid}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Partial Fee"
            subtitle="आंशिक शुल्क"
            value={stats.students.byFeeStatus.partial}
            icon="⚠️"
            color="yellow"
          />
          <StatCard
            title="Fee Unpaid"
            subtitle="अवैतनिक शुल्क"
            value={stats.students.byFeeStatus.unpaid}
            icon="❌"
            color="red"
          />
          <StatCard
            title="Collection Rate"
            subtitle="संग्रह दर"
            value={stats.students.collectionRate}
            icon="📈"
            color="purple"
          />
        </div>
      </div>

      {/* Financial Statistics */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          💰 Financial Overview / वित्तीय अवलोकन
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            subtitle="कुल आय"
            value={`₹${stats.finance.totalRevenue.toLocaleString()}`}
            icon="💵"
            color="green"
          />
          <StatCard
            title="Pending Revenue"
            subtitle="लंबित आय"
            value={`₹${stats.finance.pendingRevenue.toLocaleString()}`}
            icon="⏳"
            color="orange"
          />
          <StatCard
            title="Class Fees Collected"
            subtitle="कक्षा शुल्क संग्रह"
            value={`₹${stats.finance.classFees.collected.toLocaleString()}`}
            icon="🏫"
            color="blue"
          />
          <StatCard
            title="Bus Fees Collected"
            subtitle="बस शुल्क संग्रह"
            value={`₹${stats.finance.busFees.collected.toLocaleString()}`}
            icon="🚌"
            color="purple"
          />
        </div>
      </div>

      {/* Bus Service Statistics */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          🚌 Bus Service / बस सेवा
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            title="With Bus"
            subtitle="बस के साथ"
            value={stats.students.byBusService.withBus}
            icon="🚌"
            color="green"
          />
          <StatCard
            title="Without Bus"
            subtitle="बस के बिना"
            value={stats.students.byBusService.withoutBus}
            icon="🚶"
            color="gray"
          />
          <StatCard
            title="Bus Utilization"
            subtitle="बस उपयोग दर"
            value={stats.students.total > 0 
              ? `${Math.round((stats.students.byBusService.withBus / stats.students.total) * 100)}%`
              : '0%'
            }
            icon="📊"
            color="blue"
          />
        </div>
      </div>



      {/* Academic Statistics */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          📚 Academic Overview / शैक्षणिक अवलोकन
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Admissions"
            subtitle="कुल प्रवेश"
            value={stats.admissions.total}
            icon="📝"
            color="blue"
          />
          <StatCard
            title="Pending Admissions"
            subtitle="लंबित प्रवेश"
            value={stats.admissions.pending}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="Announcements"
            subtitle="घोषणाएं"
            value={stats.academic.announcements.total}
            icon="📢"
            color="purple"
          />
          <StatCard
            title="Recent Announcements"
            subtitle="हाल की घोषणाएं"
            value={stats.academic.announcements.recent}
            icon="🆕"
            color="green"
          />
        </div>
      </div>
    </div>
  );
};

// Reusable StatCard component
const StatCard = ({ title, subtitle, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    gray: 'text-gray-600'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color] || colorClasses.blue} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`text-2xl ${iconColorClasses[color] || iconColorClasses.blue}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {value}
          </div>
        </div>
      </div>
      <div>
        <div className="font-medium text-sm">
          {title}
        </div>
        <div className="text-xs opacity-75">
          {subtitle}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardStats; 