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
    referenceNumber: ''
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
    if (salesData.amount) {
      // Total is same as amount since it's price per item
      const total = parseFloat(salesData.amount)
      const advance = parseFloat(salesData.advance) || 0
      
      setSalesData(prev => ({
        ...prev,
        total: total.toString(),
        // Balance is total minus advance, minimum 0
        balance: Math.max(0, total - advance).toString()
      }))
    }
  }, [salesData.amount, salesData.advance])

  const handleSalesSubmit = async (e) => {
    e.preventDefault()
    
    socket.emit('salesComplete', {
      patientId: selectedExam.id,
      salesData: salesData
    })

    // Print receipt with current data
    await printReceipt(salesData, selectedExam)

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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending_examination':
        return 'bg-yellow-100 text-yellow-800'
      case 'examination_complete':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Status Board */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-indigo-600">
            <h3 className="text-lg font-medium text-white">Examination Status Board</h3>
          </div>

          {/* Status Counters */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border-b">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-500">Pending</span>
              <div className="mt-1">
                <span className="text-2xl font-semibold text-indigo-600">
                  {examinations.filter(e => e.status === 'pending_examination').length}
                </span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-gray-500">Ready for Sales</span>
              <div className="mt-1">
                <span className="text-2xl font-semibold text-green-600">
                  {examinations.filter(e => e.status === 'examination_complete').length}
                </span>
              </div>
            </div>
          </div>

          {/* Patient List */}
          <div className="divide-y divide-gray-200">
            {examinations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No active patients
              </div>
            ) : (
              examinations.map(exam => (
                <div 
                  key={exam.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{exam.name}</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(exam.created_at).toLocaleString('en-KE')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(exam.status)}`}>
                        {exam.status === 'pending_examination' 
                          ? 'With Doctor'
                          : exam.status === 'examination_complete'
                            ? 'Ready for Sales'
                            : 'Processing'
                        }
                      </span>
                      {exam.status === 'examination_complete' && (
                        <button
                          onClick={() => setSelectedExam(exam)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Enter Sales
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sales Form Modal */}
      {selectedExam && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setSelectedExam(null)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSalesSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Sales Entry - {selectedExam.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter sales information for the patient
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Product Details */}
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-4">Product Details</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brand
                          </label>
                          <input
                            type="text"
                            name="brand"
                            value={salesData.brand}
                            onChange={handleSalesChange}
                            required
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model
                          </label>
                          <input
                            type="text"
                            name="model"
                            value={salesData.model}
                            onChange={handleSalesChange}
                            required
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                          </label>
                          <input
                            type="text"
                            name="color"
                            value={salesData.color}
                            onChange={handleSalesChange}
                            required
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Details */}
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-4">Price Details</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            value={salesData.quantity}
                            onChange={handleSalesChange}
                            min="1"
                            required
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (KSH)
                          </label>
                          <input
                            type="number"
                            name="amount"
                            value={salesData.amount}
                            onChange={handleSalesChange}
                            required
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total (KSH)
                          </label>
                          <input
                            type="text"
                            name="total"
                            value={salesData.total}
                            readOnly
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 bg-gray-100 text-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Balance (KSH)
                          </label>
                          <input
                            type="text"
                            name="balance"
                            value={salesData.balance}
                            readOnly
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 bg-gray-100 text-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Advance (KSH)
                          </label>
                          <input
                            type="number"
                            name="advance"
                            value={salesData.advance}
                            onChange={handleSalesChange}
                            required
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 mb-4">Additional Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fitting Instructions
                          </label>
                          <textarea
                            name="fittingInstructions"
                            value={salesData.fittingInstructions}
                            onChange={handleSalesChange}
                            rows="3"
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Booked By
                          </label>
                          <input
                            type="text"
                            name="orderBookedBy"
                            value={salesData.orderBookedBy}
                            onChange={handleSalesChange}
                            required
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reference Number
                          </label>
                          <input
                            type="text"
                            name="referenceNumber"
                            value={salesData.referenceNumber}
                            onChange={handleSalesChange}
                            required
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Delivery Date
                          </label>
                          <input
                            type="date"
                            name="deliveryDate"
                            value={salesData.deliveryDate}
                            onChange={handleSalesChange}
                            required
                            className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-3 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Complete & Print
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    onClick={() => setSelectedExam(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function printReceipt(salesData, selectedExam) {
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the receipt')
    return
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Sales Receipt</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @media print {
            body { padding: 2rem; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body class="bg-white p-8">
        <div class="max-w-3xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold">OptiPlus</h1>
            <h2 class="text-xl mt-1">Sales Receipt</h2>
          </div>

          <!-- Customer Info -->
          <div class="mb-6">
            <div class="flex justify-between mb-4">
              <div>
                <p class="text-gray-600">Reference Number:</p>
                <p class="font-bold">${salesData.referenceNumber}</p>
              </div>
              <div>
                <p class="text-gray-600">Date:</p>
                <p class="font-bold">${new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-600">Customer Name:</p>
                <p class="font-bold">${selectedExam.name}</p>
              </div>
              <div>
                <p class="text-gray-600">Mobile:</p>
                <p class="font-bold">${selectedExam.mobile || 'N/A'}</p>
              </div>
            </div>
          </div>

          <!-- Product Details -->
          <div class="mb-6">
            <table class="w-full mb-4">
              <tr>
                <td class="font-bold">Brand:</td>
                <td>${salesData.brand}</td>
                <td class="font-bold">Model:</td>
                <td>${salesData.model}</td>
              </tr>
              <tr>
                <td class="font-bold">Color:</td>
                <td>${salesData.color}</td>
                <td class="font-bold">Quantity:</td>
                <td>${salesData.quantity}</td>
              </tr>
            </table>

            <!-- Financial Details -->
            <table class="w-full border-t border-gray-200">
              <tr>
                <td class="py-2 font-bold">Amount:</td>
                <td class="text-right">KSH ${parseFloat(salesData.amount).toLocaleString()}</td>
              </tr>
              <tr>
                <td class="py-2 font-bold">Total:</td>
                <td class="text-right">KSH ${parseFloat(salesData.total).toLocaleString()}</td>
              </tr>
              <tr>
                <td class="py-2 font-bold">Advance Paid:</td>
                <td class="text-right">KSH ${parseFloat(salesData.advance || 0).toLocaleString()}</td>
              </tr>
              <tr class="border-t border-gray-200">
                <td class="py-2 font-bold">Balance:</td>
                <td class="text-right font-bold">KSH ${parseFloat(salesData.balance || 0).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <!-- Additional Details -->
          <div class="mb-6">
            <p class="font-bold mb-2">Fitting Instructions:</p>
            <p class="mb-4">${salesData.fittingInstructions || 'N/A'}</p>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-600">Order Booked By:</p>
                <p class="font-bold">${salesData.orderBookedBy}</p>
              </div>
              <div>
                <p class="text-gray-600">Delivery Date:</p>
                <p class="font-bold">${new Date(salesData.deliveryDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div class="text-center mt-8">
            <p class="text-gray-600">Thank you for choosing OptiPlus!</p>
          </div>

          <!-- Print Button -->
          <div class="mt-8 text-center no-print">
            <button onclick="window.print()" class="px-6 py-2 bg-blue-600 text-white rounded">
              Print Receipt
            </button>
          </div>
        </div>

        <script>
          // Automatically trigger print when the page loads
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `)
  
  printWindow.document.close()
}

export default ReceptionStatus