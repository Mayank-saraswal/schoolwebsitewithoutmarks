import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Plus, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  Check,
  Edit2,
  Trash2,
  MapPin,
  DollarSign
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const BusFeeForm = () => {
  const { isAuthenticated, admin } = useAdmin();
  const [busRoutes, setBusRoutes] = useState([]);
  const [formData, setFormData] = useState({
    routeName: '',
    feeAmount: ''
  });
  const [editingRoute, setEditingRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated && admin) {
      fetchBusRoutes();
    }
  }, [isAuthenticated, admin]);

  const fetchBusRoutes = async () => {
    try {
      setLoading(true);
      console.log('Fetching bus routes as admin:', admin?.name);
      
      const response = await fetch('/api/admin/bus-fees', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Bus routes fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Bus routes data:', data);
      
      if (data.success) {
        setBusRoutes(data.data?.busRoutes || []);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Error loading bus routes / बस रूट लोड करने में त्रुटि' 
        });
      }
    } catch (error) {
      console.error('Error fetching bus routes:', error);
      setMessage({ 
        type: 'error', 
        text: `Authentication error: ${error.message} / प्रमाणीकरण त्रुटि` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.routeName.trim() || !formData.feeAmount || parseFloat(formData.feeAmount) < 0) {
      setMessage({ 
        type: 'error', 
        text: 'Please enter valid route name and fee amount / कृपया वैध रूट नाम और फीस राशि दर्ज करें' 
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      console.log('Creating/updating bus route as admin:', admin?.name);

      const url = editingRoute 
        ? `/api/admin/update-bus-route/${editingRoute._id}`
        : '/api/admin/create-bus-route';
      
      const method = editingRoute ? 'PUT' : 'POST';

      const requestData = {
        routeName: formData.routeName.trim(),
        feeAmount: parseFloat(formData.feeAmount)
      };

      console.log('Sending request to:', url);
      console.log('Request method:', method);
      console.log('Request data:', requestData);
      console.log('Admin context:', { name: admin?.name, role: admin?.role });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      console.log('Bus route save response status:', response.status);

      const data = await response.json();
      console.log('Bus route save data:', data);

      if (!response.ok) {
        // Show the actual error message from backend
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message 
        });
        
        // Reset form
        setFormData({ routeName: '', feeAmount: '' });
        setEditingRoute(null);
        setShowForm(false);
        
        // Refresh bus routes list
        await fetchBusRoutes();
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message 
        });
      }
    } catch (error) {
      console.error('Error saving bus route:', error);
      setMessage({ 
        type: 'error', 
        text: `Error saving bus route: ${error.message} / बस रूट सेव करने में त्रुटि` 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (route) => {
    setFormData({
      routeName: route.routeName,
      feeAmount: route.feeAmount.toString()
    });
    setEditingRoute(route);
    setShowForm(true);
  };

  const handleDelete = async (routeId) => {
    if (!confirm('Are you sure you want to delete this bus route? / क्या आप वाकई इस बस रूट को हटाना चाहते हैं?')) {
      return;
    }

    try {
      console.log('Deleting bus route as admin:', admin?.name);
      
      const response = await fetch(`/api/admin/delete-bus-route/${routeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message 
        });
        
        // Refresh bus routes list
        await fetchBusRoutes();
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else if (data.allowForceDelete) {
        // Ask user if they want to force delete and reassign students
        const forceDelete = confirm(
          `${data.message}\n\nPress OK to reassign students to "No Bus" and delete route, or Cancel to keep route.`
        );
        
        if (forceDelete) {
          await handleForceDelete(routeId);
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message 
        });
      }
    } catch (error) {
      console.error('Error deleting bus route:', error);
      setMessage({ 
        type: 'error', 
        text: `Error deleting bus route: ${error.message} / बस रूट हटाने में त्रुटि` 
      });
    }
  };

  const handleForceDelete = async (routeId) => {
    try {
      const response = await fetch(`/api/admin/force-delete-bus-route/${routeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message 
        });
        
        // Refresh bus routes list
        await fetchBusRoutes();
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message 
        });
      }
    } catch (error) {
      console.error('Error force deleting bus route:', error);
      setMessage({ 
        type: 'error', 
        text: `Error force deleting bus route: ${error.message} / बस रूट फोर्स डिलीट करने में त्रुटि` 
      });
    }
  };

  const resetForm = () => {
    setFormData({ routeName: '', feeAmount: '' });
    setEditingRoute(null);
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show loading if not authenticated as admin
  if (!isAuthenticated || !admin) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin context... / व्यवस्थापक संदर्भ लोड हो रहा है...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Context Debug Info */}
      <div className="bg-blue-50 p-3 rounded-lg text-sm">
        <p><strong>Admin:</strong> {admin?.name || 'Unknown'}</p>
        <p><strong>Role:</strong> {admin?.role || 'Unknown'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bus className="h-8 w-8 mr-3" />
            <div>
              <h2 className="text-2xl font-bold">
                Bus Route Fee Management / बस रूट फीस प्रबंधन
              </h2>
              <p className="text-green-100 mt-1">
                Add and manage bus routes with transportation fees / बस रूट और परिवहन शुल्क जोड़ें और प्रबंधित करें
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            {showForm ? 'Cancel / रद्द करें' : 'Add Route / रूट जोड़ें'}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingRoute ? 'Edit Bus Route / बस रूट संपादित करें' : 'Add New Bus Route / नया बस रूट जोड़ें'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name (Village Name) / रूट नाम (गांव का नाम) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="routeName"
                    name="routeName"
                    value={formData.routeName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter village/area name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="feeAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Bus Fee / वार्षिक बस फीस *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="feeAmount"
                    name="feeAmount"
                    value={formData.feeAmount}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter annual fee amount"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel / रद्द करें
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded-md text-white font-medium flex items-center ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                }`}
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving... / सेव हो रहा है...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingRoute ? 'Update Route / रूट अपडेट करें' : 'Add Route / रूट जोड़ें'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bus Routes List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Bus Routes & Fees / बस रूट और फीस ({busRoutes.length})
            </h3>
            <button
              onClick={fetchBusRoutes}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Loading bus routes...</p>
            </div>
          ) : busRoutes.length === 0 ? (
            <div className="text-center py-8">
              <Bus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No bus routes configured yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first bus route to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add First Route / पहला रूट जोड़ें
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route Name / रूट नाम
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route Code / रूट कोड
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Annual Fee / वार्षिक फीस
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Equivalent / मासिक समतुल्य
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions / कार्रवाई
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {busRoutes.map((route, index) => (
                    <tr key={route._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {route.routeName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-mono">
                          {route.routeCode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(route.feeAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatCurrency(Math.round(route.feeAmount / 12))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEdit(route)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(route._id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusFeeForm; 