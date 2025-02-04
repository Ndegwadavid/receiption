// src/components/Admin.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Icon components
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// Stats Card Component
const StatCard = ({ title, value, icon, color }) => {
  const getIcon = () => {
    switch (icon) {
      case 'users': return <UsersIcon />;
      case 'clock': return <ClockIcon />;
      case 'check': return <CheckIcon />;
      case 'calendar': return <CalendarIcon />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-semibold mt-1 ${
            color === 'indigo' ? 'text-indigo-600' :
            color === 'yellow' ? 'text-yellow-600' :
            color === 'green' ? 'text-green-600' :
            'text-blue-600'
          }`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${
          color === 'indigo' ? 'bg-indigo-100' :
          color === 'yellow' ? 'bg-yellow-100' :
          color === 'green' ? 'bg-green-100' :
          'bg-blue-100'
        }`}>
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

// Client Card Component
const ClientCard = ({ client, onStatusChange, onClick }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{client.client_number}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          client.job_status === 'collected' 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {client.job_status === 'collected' ? 'Collected' : 'Pending'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Mobile</p>
          <p className="font-medium">{client.mobile}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Branch</p>
          <p className="font-medium">{client.branch}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onClick}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          View Details
        </button>
        {client.job_status === 'pending' && (
          <button
            onClick={() => onStatusChange(client.id, 'collected')}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Mark as Collected
          </button>
        )}
      </div>
    </div>
  </div>
);

// Info Item Component
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value || '-'}</p>
  </div>
);

// Main Admin Component
function Admin() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: { start: '', end: '' },
    jobStatus: 'all',
    customerType: 'all',
    branch: 'all'
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/examinations');
      const data = await response.json();
      setRecords(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleJobStatusChange = async (clientId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${clientId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchRecords();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredRecords = records.filter(record => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = 
      record.name?.toLowerCase().includes(searchLower) ||
      record.client_number?.toLowerCase().includes(searchLower) ||
      record.mobile?.includes(searchLower);

    const matchesJobStatus = filters.jobStatus === 'all' || record.job_status === filters.jobStatus;
    const matchesCustomerType = filters.customerType === 'all' || record.customerType === filters.customerType;
    const matchesBranch = filters.branch === 'all' || record.branch === filters.branch;

    if (!filters.dateRange.start && !filters.dateRange.end) {
      return matchesSearch && matchesJobStatus && matchesCustomerType && matchesBranch;
    }

    const recordDate = new Date(record.created_at);
    const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
    const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

    return matchesSearch && matchesJobStatus && matchesCustomerType && matchesBranch &&
      (!startDate || recordDate >= startDate) &&
      (!endDate || recordDate <= endDate);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">OptiPlus</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-xl font-semibold text-gray-900">Admin Dashboard</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clients"
            value={records.length}
            icon="users"
            color="indigo"
          />
          <StatCard
            title="Pending Jobs"
            value={records.filter(r => r.job_status === 'pending').length}
            icon="clock"
            color="yellow"
          />
          <StatCard
            title="Collected"
            value={records.filter(r => r.job_status === 'collected').length}
            icon="check"
            color="green"
          />
          <StatCard
            title="This Month"
            value={records.filter(r => 
              new Date(r.created_at).getMonth() === new Date().getMonth()
            ).length}
            icon="calendar"
            color="blue"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search clients..."
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filters.jobStatus}
                onChange={e => setFilters(prev => ({ ...prev, jobStatus: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="collected">Collected</option>
              </select>
            </div>
            <div>
              <select
                value={filters.customerType}
                onChange={e => setFilters(prev => ({ ...prev, customerType: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Customers</option>
                <option value="new">New Customers</option>
                <option value="existing">Existing Customers</option>
              </select>
            </div>
            <div>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={e => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={e => setFilters(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No records found
            </div>
          ) : (
            filteredRecords.map(record => (
              <ClientCard 
                key={record.id}
                client={record}
                onStatusChange={handleJobStatusChange}
                onClick={() => setSelectedClient(record)}
              />
            ))
          )}
        </div>
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onStatusChange={handleJobStatusChange}
        />
      )}
    </div>
  );
}

export default Admin;