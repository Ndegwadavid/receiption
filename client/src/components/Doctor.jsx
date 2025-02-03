// src/components/Doctor.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'

const socket = io('http://localhost:5000')

function Doctor() {
  const [pendingPatients, setPendingPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotification, setShowNotification] = useState(false)
  
  const [prescriptionData, setPrescriptionData] = useState({
    // Right Eye
    right_sph: '',
    right_cyl: '',
    right_axis: '',
    right_add: '',
    right_va: '',
    right_ipd: '',
    // Left Eye
    left_sph: '',
    left_cyl: '',
    left_axis: '',
    left_add: '',
    left_va: '',
    left_ipd: '',
    // Common fields
    clinical_history: '',
    optometrist_name: ''
  })

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    socket.emit('register_as_doctor')

    socket.on('updateExaminations', (examinations) => {
      console.log('Received examinations:', examinations)
      const pending = examinations.filter(exam => 
        exam.status === 'pending_examination'
      )
      setPendingPatients(pending)
    })

    socket.on('newPatientNotification', (data) => {
      console.log('New patient notification:', data)
      setNotifications(prev => [data, ...prev].slice(0, 5))
      setShowNotification(true)
      
      try {
        const audio = new Audio('/notification.mp3')
        audio.play()
      } catch (error) {
        console.log('Notification sound not available')
      }

      setTimeout(() => {
        setShowNotification(false)
      }, 5000)
    })

    return () => {
      socket.off('updateExaminations')
      socket.off('newPatientNotification')
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    socket.emit('examinationComplete', {
      patientId: selectedPatient.id,
      examinationData: prescriptionData
    })

    // Option to print
    const printConfirm = window.confirm('Would you like to print the prescription?')
    if (printConfirm) {
      printPrescription()
    }

    // Reset form
    setPrescriptionData({
      right_sph: '',
      right_cyl: '',
      right_axis: '',
      right_add: '',
      right_va: '',
      right_ipd: '',
      left_sph: '',
      left_cyl: '',
      left_axis: '',
      left_add: '',
      left_va: '',
      left_ipd: '',
      clinical_history: '',
      optometrist_name: ''
    })
    setSelectedPatient(null)
  }

  const handleChange = (e) => {
    setPrescriptionData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {showNotification && notifications[0] && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg max-w-sm w-full overflow-hidden">
          <div className="p-4 bg-indigo-600">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium text-white">New Patient</h3>
              <button 
                onClick={() => setShowNotification(false)}
                className="bg-indigo-600 rounded-md p-1 hover:bg-indigo-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-900">{notifications[0].message}</p>
            <p className="mt-1 text-sm text-gray-500">Just now</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              OptiPlus
            </Link>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {pendingPatients.length} Pending
              </span>
              <h2 className="text-lg font-semibold text-gray-900">Doctor's Panel</h2>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Pending Patients List */}
          <div className="w-1/4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 bg-indigo-600">
                <h3 className="text-lg font-medium text-white">Pending Examinations</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {pendingPatients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No pending examinations
                  </div>
                ) : (
                  pendingPatients.map(patient => (
                    <div 
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPatient?.id === patient.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{patient.name}</h4>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>Age: {calculateAge(patient.dateOfBirth)} | {patient.gender}</p>
                        <p className="mt-1">Mobile: {patient.mobile}</p>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(patient.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Examination Form */}
          <div className="w-3/4">
            {selectedPatient ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Examination - {selectedPatient.name}
                    </h3>
                    <button 
                      onClick={() => setSelectedPatient(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  {/* Patient Info Summary */}
                  <div className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Mobile</p>
                      <p className="font-medium text-gray-900">{selectedPatient.mobile}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium text-gray-900">{calculateAge(selectedPatient.dateOfBirth)} years</p>
                    </div>
                    {selectedPatient.previousRx && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Previous RX</p>
                        <p className="font-medium text-gray-900">{selectedPatient.previousRx}</p>
                      </div>
                    )}
                  </div>

                  {/* Prescription Table */}
                  <div className="bg-white mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"></th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SPH</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CYL</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AXIS</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ADD</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">V/A</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IPD</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Right Eye */}
                        <tr>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">R</td>
                          {['sph', 'cyl', 'axis', 'add', 'va', 'ipd'].map(field => (
                            <td key={field} className="px-3 py-4">
                              <input
                                type="text"
                                name={`right_${field}`}
                                value={prescriptionData[`right_${field}`]}
                                onChange={handleChange}
                                required
                                className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                                placeholder={field.toUpperCase()}
                              />
                            </td>
                          ))}
                        </tr>
                        {/* Left Eye */}
                        <tr>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">L</td>
                          {['sph', 'cyl', 'axis', 'add', 'va', 'ipd'].map(field => (
                            <td key={field} className="px-3 py-4">
                              <input
                                type="text"
                                name={`left_${field}`}
                                value={prescriptionData[`left_${field}`]}
                                onChange={handleChange}
                                required
                                className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                                placeholder={field.toUpperCase()}
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Clinical Details */}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="clinical_history" className="block text-sm font-medium text-gray-700 mb-2">
                        Clinical History
                      </label>
                      <textarea
                        id="clinical_history"
                        name="clinical_history"
                        rows={4}
                        value={prescriptionData.clinical_history}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                        placeholder="Enter clinical history..."
                      />
                    </div>

                    <div>
                      <label htmlFor="optometrist_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Optometrist Name
                      </label>
                      <input
                        type="text"
                        id="optometrist_name"
                        name="optometrist_name"
                        value={prescriptionData.optometrist_name}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-3 text-lg rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                        placeholder="Enter optometrist name"
                      />
                    </div>

{/* Form Actions */}
<div className="flex justify-end space-x-4 pt-6">
  <button
    type="button"
    onClick={() => setSelectedPatient(null)}
    className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
  >
    Complete Examination
  </button>
</div>
</div>
</form>
</div>
) : (
<div className="bg-white rounded-lg shadow p-6 text-center">
<svg
className="mx-auto h-12 w-12 text-gray-400"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
<path
strokeLinecap="round"
strokeLinejoin="round"
strokeWidth={2}
d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
/>
</svg>
<h3 className="mt-4 text-lg font-medium text-gray-900">No Patient Selected</h3>
<p className="mt-2 text-sm text-gray-500">
Select a patient from the list to begin examination
</p>
</div>
)}
</div>
</div>
</div>
</div>
)
}

// Utility function to calculate age
function calculateAge(dateOfBirth) {
const today = new Date()
const birthDate = new Date(dateOfBirth)
let age = today.getFullYear() - birthDate.getFullYear()
const monthDiff = today.getMonth() - birthDate.getMonth()

if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
age--
}

return age
}

function printPrescription() {
const printWindow = window.open('', '_blank');
// Add print layout here similar to before but with Tailwind classes
}

export default Doctor