// src/components/ReceptionStatus.jsx
import { useEffect, useState } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:5000')

function ReceptionStatus() {
  const [examinations, setExaminations] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [salesData, setSalesData] = useState({
    brand: '',
    model: '',
    color: '',
    quantity: '1',
    amount: '',
    total: '',
    advance: '',
    balance: '',
    fittingInstructions: '',
    orderBookedBy: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    referenceNumber: `OP${Date.now().toString().slice(-6)}`
  })

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    socket.on('updateExaminations', (updatedExaminations) => {
      console.log('Received examinations:', updatedExaminations)
      setExaminations(updatedExaminations)
    })

    return () => {
      socket.off('updateExaminations')
    }
  }, [])

  // Calculate total when amount and quantity change
  useEffect(() => {
    if (salesData.amount && salesData.quantity) {
      const total = parseFloat(salesData.amount) * parseInt(salesData.quantity)
      setSalesData(prev => ({
        ...prev,
        total: total.toString(),
        balance: (total - (parseFloat(prev.advance) || 0)).toString()
      }))
    }
  }, [salesData.amount, salesData.quantity])

  const handleSalesSubmit = async (e) => {
    e.preventDefault()
    
    socket.emit('salesComplete', {
      patientId: selectedExam.id,
      salesData: salesData
    })

    // Print receipt
    await printReceipt()

    // Reset form
    setSelectedExam(null)
    setSalesData({
      brand: '',
      model: '',
      color: '',
      quantity: '1',
      amount: '',
      total: '',
      advance: '',
      balance: '',
      fittingInstructions: '',
      orderBookedBy: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      referenceNumber: ''
    })
  }

  const handleSalesChange = (e) => {
    setSalesData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const printReceipt = async () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Receipt - ${selectedExam.name}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { padding: 20px; }
            .receipt-header { text-align: center; margin-bottom: 30px; }
            .receipt-footer { margin-top: 50px; }
            .amount-box { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
            @media print {
              .no-print { display: none; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="receipt-header">
              <h2>OptiPlus</h2>
              <h4>Sales Receipt</h4>
              <p>Reference: ${salesData.referenceNumber}</p>
            </div>

            <div class="row mb-4">
              <div class="col-6">
                <p><strong>Customer Name:</strong> ${selectedExam.name}</p>
                <p><strong>Mobile:</strong> ${selectedExam.mobile}</p>
              </div>
              <div class="col-6 text-end">
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Delivery Date:</strong> ${new Date(salesData.deliveryDate).toLocaleDateString()}</p>
              </div>
            </div>

            <table class="table table-bordered mb-4">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Brand</td>
                  <td>${salesData.brand}</td>
                </tr>
                <tr>
                  <td>Model</td>
                  <td>${salesData.model}</td>
                </tr>
                <tr>
                  <td>Color</td>
                  <td>${salesData.color}</td>
                </tr>
                <tr>
                  <td>Quantity</td>
                  <td>${salesData.quantity}</td>
                </tr>
              </tbody>
            </table>

            <div class="amount-box">
              <div class="row">
                <div class="col-6"><strong>Amount per unit:</strong></div>
                <div class="col-6 text-end">KSH ${parseFloat(salesData.amount).toLocaleString()}</div>
              </div>
              <div class="row">
                <div class="col-6"><strong>Total Amount:</strong></div>
                <div class="col-6 text-end">KSH ${parseFloat(salesData.total).toLocaleString()}</div>
              </div>
              <div class="row">
                <div class="col-6"><strong>Advance Paid:</strong></div>
                <div class="col-6 text-end">KSH ${parseFloat(salesData.advance).toLocaleString()}</div>
              </div>
              <div class="row">
                <div class="col-6"><strong>Balance:</strong></div>
                <div class="col-6 text-end">KSH ${parseFloat(salesData.balance).toLocaleString()}</div>
              </div>
            </div>

            <div class="mb-4">
              <strong>Fitting Instructions:</strong>
              <p>${salesData.fittingInstructions || 'N/A'}</p>
            </div>

            <div class="receipt-footer">
              <div class="row">
                <div class="col-6">
                  <p><strong>Order Booked By:</strong> ${salesData.orderBookedBy}</p>
                </div>
                <div class="col-6 text-end">
                  <p>Customer Signature: _________________</p>
                </div>
              </div>
            </div>

            <div class="text-center mt-4 mb-4">
              <p>Thank you for choosing OptiPlus!</p>
            </div>

            <div class="d-flex justify-content-center mt-4 no-print">
              <button onclick="window.print()" class="btn btn-primary">Print Receipt</button>
              <button onclick="window.close()" class="btn btn-secondary ms-2">Close</button>
            </div>
          </div>
        </body>
      </html>
    `)
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Examination Status Board</h5>
        </div>
        <div className="card-body p-0">
          {/* Status Counters */}
          <div className="d-flex justify-content-around p-3 bg-light border-bottom">
            <div className="text-center">
              <h6>Pending</h6>
              <span className="badge bg-warning">
                {examinations.filter(e => e.status === 'pending_examination').length}
              </span>
            </div>
            <div className="text-center">
              <h6>Ready for Sales</h6>
              <span className="badge bg-success">
                {examinations.filter(e => e.status === 'examination_complete').length}
              </span>
            </div>
          </div>

          {/* Examinations List */}
          <div className="list-group list-group-flush">
            {examinations.map(exam => (
              <div 
                key={exam.id}
                className="list-group-item"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{exam.name}</h6>
                    <small className="text-muted">
                      {new Date(exam.created_at).toLocaleString('en-KE')}
                    </small>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className={`badge me-2 ${
                      exam.status === 'pending_examination' 
                        ? 'bg-warning'
                        : exam.status === 'examination_complete'
                          ? 'bg-success'
                          : 'bg-secondary'
                    }`}>
                      {exam.status === 'pending_examination'
                        ? 'With Doctor'
                        : exam.status === 'examination_complete'
                          ? 'Ready for Sales'
                          : 'Completed'}
                    </span>
                    {exam.status === 'examination_complete' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setSelectedExam(exam)}
                      >
                        Enter Sales
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {examinations.length === 0 && (
              <div className="text-center p-4 text-muted">
                <p className="mb-0">No active examinations</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Form Modal */}
      {selectedExam && (
        <div className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sales Entry - {selectedExam.name}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setSelectedExam(null)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleSalesSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Brand</label>
                      <input
                        type="text"
                        className="form-control"
                        name="brand"
                        value={salesData.brand}
                        onChange={handleSalesChange}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Model</label>
                      <input
                        type="text"
                        className="form-control"
                        name="model"
                        value={salesData.model}
                        onChange={handleSalesChange}
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Color</label>
                      <input
                        type="text"
                        className="form-control"
                        name="color"
                        value={salesData.color}
                        onChange={handleSalesChange}
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={salesData.quantity}
                        onChange={handleSalesChange}
                        min="1"
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Amount (KSH)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="amount"
                        value={salesData.amount}
                        onChange={handleSalesChange}
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Total (KSH)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="total"
                        value={salesData.total}
                        readOnly
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Advance (KSH)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="advance"
                        value={salesData.advance}
                        onChange={handleSalesChange}
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Balance (KSH)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="balance"
                        value={salesData.balance}
                        readOnly
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Fitting Instructions</label>
                      <textarea
                        className="form-control"
                        name="fittingInstructions"
                        value={salesData.fittingInstructions}
                        onChange={handleSalesChange}
                        rows="2"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Order Booked By</label>
                      <input
                        type="text"
                        className="form-control"
                        name="orderBookedBy"
                        value={salesData.orderBookedBy}
                        onChange={handleSalesChange}
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Delivery Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="deliveryDate"
                        value={salesData.deliveryDate}
                        onChange={handleSalesChange}
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Reference Number</label>
                      <input
                        type="text"
                        className="form-control"
                        name="referenceNumber"
                        value={salesData.referenceNumber}
                        onChange={handleSalesChange}
                        required
                        placeholder='Enter reference Number'
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setSelectedExam(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Complete & Print Receipt
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReceptionStatus