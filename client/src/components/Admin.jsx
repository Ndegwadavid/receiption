// src/components/Admin.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'

function Admin() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/examinations')
      const data = await response.json()
      setRecords(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching records:', error)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/examinations/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setRecords(records.filter(record => record.id !== id))
          alert('Record deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting record:', error)
        alert('Failed to delete record')
      }
    }
  }

  const exportToExcel = () => {
    const exportData = records.map(record => ({
      'Date': new Date(record.created_at).toLocaleDateString('en-KE'),
      'Name': record.name,
      'Mobile': record.mobile,
      'Email': record.email || '-',
      'Status': record.status,
      'Reference': record.referenceNumber || '-',
      'Total Amount': record.total ? `KSH ${parseFloat(record.total).toLocaleString()}` : '-',
      'Balance': record.balance ? `KSH ${parseFloat(record.balance).toLocaleString()}` : '-'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'OptiPlus Records')
    XLSX.writeFile(wb, `optiplus_records_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const filteredRecords = records.filter(record => {
    const searchString = filter.toLowerCase()
    const matchesSearch = 
      record.name?.toLowerCase().includes(searchString) ||
      record.mobile?.includes(searchString) ||
      record.email?.toLowerCase().includes(searchString) ||
      record.referenceNumber?.toLowerCase().includes(searchString)

    if (!dateRange.start && !dateRange.end) return matchesSearch

    const recordDate = new Date(record.created_at)
    const startDate = dateRange.start ? new Date(dateRange.start) : null
    const endDate = dateRange.end ? new Date(dateRange.end) : null

    return matchesSearch && 
      (!startDate || recordDate >= startDate) &&
      (!endDate || recordDate <= endDate)
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'examination_complete':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              OptiPlus
            </Link>
            <div className="flex items-center gap-4">
              <button 
                onClick={exportToExcel}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Export to Excel
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name, mobile, email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button 
              onClick={fetchRecords}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.created_at).toLocaleDateString('en-KE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{record.mobile}</div>
                      <div className="text-xs">{record.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.referenceNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.total ? (
                        <div>
                          <div>KSH {parseFloat(record.total).toLocaleString()}</div>
                          {record.balance > 0 && (
                            <div className="text-xs text-red-600">
                              Balance: KSH {parseFloat(record.balance).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">
                        Patient Details
                      </h3>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                        <p className="text-sm text-gray-900">Name: {selectedRecord.name}</p>
                        <p className="text-sm text-gray-900">Mobile: {selectedRecord.mobile}</p>
                        <p className="text-sm text-gray-900">Email: {selectedRecord.email || '-'}</p>
                      </div>

                      {selectedRecord.brand && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Sales Information</h4>
                          <p className="text-sm text-gray-900">Brand: {selectedRecord.brand}</p>
                          <p className="text-sm text-gray-900">Model: {selectedRecord.model}</p>
                          <p className="text-sm text-gray-900">Amount: KSH {parseFloat(selectedRecord.amount).toLocaleString()}</p>
                          <p className="text-sm text-gray-900">Total: KSH {parseFloat(selectedRecord.total).toLocaleString()}</p>
                          <p className="text-sm text-gray-900">Balance: KSH {parseFloat(selectedRecord.balance).toLocaleString()}</p>
                        </div>
                      )}

                      {selectedRecord.right_sph && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Prescription Details</h4>
                          <div className="border rounded-md overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-xs text-gray-500"></th>
                                  <th className="px-3 py-2 text-xs text-gray-500">SPH</th>
                                  <th className="px-3 py-2 text-xs text-gray-500">CYL</th>
                                  <th className="px-3 py-2 text-xs text-gray-500">AXIS</th>
                                  <th className="px-3 py-2 text-xs text-gray-500">ADD</th>
                                  <th className="px-3 py-2 text-xs text-gray-500">V/A</th>
                                  <th className="px-3 py-2 text-xs text-gray-500">IPD</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                <tr>
                                  <td className="px-3 py-2 text-xs font-medium text-gray-900">R</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.right_sph}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.right_cyl}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.right_axis}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.right_add}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.right_va}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.right_ipd}</td>
                                </tr>
                                <tr>
                                  <td className="px-3 py-2 text-xs font-medium text-gray-900">L</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.left_sph}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.left_cyl}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.left_axis}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.left_add}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.left_va}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{selectedRecord.left_ipd}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setSelectedRecord(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin