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

  return (
    <div className="container-fluid">
      {/* Navigation */}
      <nav className="navbar bg-white shadow-sm mb-4">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <h4 className="mb-0">OptiPlus</h4>
          </Link>
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-success me-2"
              onClick={exportToExcel}
            >
              <i className="bi bi-file-excel me-2"></i>
              Export to Excel
            </button>
            <h5 className="mb-0 text-primary">Admin Panel</h5>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Search and Filters */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, mobile, email..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <div className="col-md-2">
                <button 
                  className="btn btn-primary w-100"
                  onClick={fetchRecords}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <p className="text-muted mb-0">No records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(record => (
                      <tr key={record.id}>
                        <td>{new Date(record.created_at).toLocaleDateString('en-KE')}</td>
                        <td>{record.name}</td>
                        <td>
                          {record.mobile}<br/>
                          <small className="text-muted">{record.email || '-'}</small>
                        </td>
                        <td>{record.referenceNumber || '-'}</td>
                        <td>
                          <span className={`badge bg-${
                            record.status === 'completed' ? 'success' :
                            record.status === 'examination_complete' ? 'warning' :
                            'info'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          {record.total ? (
                            <>
                              KSH {parseFloat(record.total).toLocaleString()}
                              {record.balance > 0 && (
                                <div>
                                  <small className="text-danger">
                                    Balance: KSH {parseFloat(record.balance).toLocaleString()}
                                  </small>
                                </div>
                              )}
                            </>
                          ) : '-'}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setSelectedRecord(record)}
                              title="View Details"
                            >
                              <i className="bi bi-info-circle"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(record.id)}
                              title="Delete Record"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedRecord(null)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-scrollable"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Client Details</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setSelectedRecord(null)}
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Personal Information */}
                  <div className="col-md-6 mb-4">
                    <h6 className="border-bottom pb-2">Personal Information</h6>
                    <p><strong>Name:</strong> {selectedRecord.name}</p>
                    <p><strong>Mobile:</strong> {selectedRecord.mobile}</p>
                    <p><strong>Email:</strong> {selectedRecord.email || '-'}</p>
                    <p><strong>Gender:</strong> {selectedRecord.gender}</p>
                    <p><strong>Date:</strong> {new Date(selectedRecord.created_at).toLocaleString('en-KE')}</p>
                  </div>

                  {/* Sales Information */}
                  <div className="col-md-6 mb-4">
                    <h6 className="border-bottom pb-2">Sales Information</h6>
                    {selectedRecord.brand ? (
                      <>
                        <p><strong>Reference:</strong> {selectedRecord.referenceNumber || '-'}</p>
                        <p><strong>Brand:</strong> {selectedRecord.brand}</p>
                        <p><strong>Model:</strong> {selectedRecord.model}</p>
                        <p><strong>Amount:</strong> KSH {parseFloat(selectedRecord.amount).toLocaleString()}</p>
                        <p><strong>Total:</strong> KSH {parseFloat(selectedRecord.total).toLocaleString()}</p>
                        <p><strong>Balance:</strong> KSH {parseFloat(selectedRecord.balance).toLocaleString()}</p>
                      </>
                    ) : (
                      <p className="text-muted">No sales information available</p>
                    )}
                  </div>

                  {/* Prescription Information */}
                  <div className="col-12">
                    <h6 className="border-bottom pb-2">Prescription Details</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th></th>
                            <th>SPH</th>
                            <th>CYL</th>
                            <th>AXIS</th>
                            <th>ADD</th>
                            <th>V/A</th>
                            <th>IPD</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th>R</th>
                            <td>{selectedRecord.right_sph || '-'}</td>
                            <td>{selectedRecord.right_cyl || '-'}</td>
                            <td>{selectedRecord.right_axis || '-'}</td>
                            <td>{selectedRecord.right_add || '-'}</td>
                            <td>{selectedRecord.right_va || '-'}</td>
                            <td>{selectedRecord.right_ipd || '-'}</td>
                          </tr>
                          <tr>
                            <th>L</th>
                            <td>{selectedRecord.left_sph || '-'}</td>
                            <td>{selectedRecord.left_cyl || '-'}</td>
                            <td>{selectedRecord.left_axis || '-'}</td>
                            <td>{selectedRecord.left_add || '-'}</td>
                            <td>{selectedRecord.left_va || '-'}</td>
                            <td>{selectedRecord.left_ipd || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {selectedRecord.clinical_history && (
                      <div className="mt-3">
                        <strong>Clinical History:</strong>
                        <p className="mb-0">{selectedRecord.clinical_history}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setSelectedRecord(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin