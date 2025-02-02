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
      socket.connect();
    }

    socket.emit('register_as_doctor');

    socket.on('connect', () => {
      console.log('Connected to server as doctor');
      socket.emit('register_as_doctor');
    });

    socket.on('updateExaminations', (examinations) => {
      console.log('Received examinations:', examinations);
      const pending = examinations.filter(exam => 
        exam.status === 'pending_examination'
      );
      setPendingPatients(pending);
    });

    socket.on('newPatientNotification', (data) => {
      console.log('New patient notification:', data);
      setNotifications(prev => [data, ...prev].slice(0, 5));
      setShowNotification(true);
      
      try {
        const audio = new Audio('/notification.mp3');
        audio.play();
      } catch (error) {
        console.log('Notification sound not available');
      }

      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    });

    return () => {
      socket.off('connect');
      socket.off('updateExaminations');
      socket.off('newPatientNotification');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all required fields
    const requiredFields = Object.keys(prescriptionData);
    const emptyFields = requiredFields.filter(field => !prescriptionData[field]);
    
    if (emptyFields.length > 0) {
      alert('Please fill in all prescription fields');
      return;
    }

    socket.emit('examinationComplete', {
      patientId: selectedPatient.id,
      examinationData: prescriptionData
    });

    // Option to print
    const printConfirm = window.confirm('Would you like to print the prescription?');
    if (printConfirm) {
      printPrescription();
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
    });
    setSelectedPatient(null);
    alert('Examination completed successfully');
  };

  const handleChange = (e) => {
    setPrescriptionData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const printPrescription = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${selectedPatient.name}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { padding: 20px; }
            .prescription-header { text-align: center; margin-bottom: 30px; }
            .prescription-details { margin-bottom: 30px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="prescription-header">
              <h2>OptiPlus</h2>
              <h4>Eye Examination Prescription</h4>
              <p>${new Date().toLocaleDateString()}</p>
            </div>

            <div class="row mb-4">
              <div class="col-6">
                <p><strong>Patient Name:</strong> ${selectedPatient.name}</p>
                <p><strong>Age:</strong> ${calculateAge(selectedPatient.dateOfBirth)}</p>
              </div>
              <div class="col-6 text-end">
                <p><strong>Patient ID:</strong> ${selectedPatient.id}</p>
                <p><strong>Gender:</strong> ${selectedPatient.gender}</p>
              </div>
            </div>

            <div class="prescription-details">
              <table class="table table-bordered">
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
                    <td>${prescriptionData.right_sph}</td>
                    <td>${prescriptionData.right_cyl}</td>
                    <td>${prescriptionData.right_axis}</td>
                    <td>${prescriptionData.right_add}</td>
                    <td>${prescriptionData.right_va}</td>
                    <td>${prescriptionData.right_ipd}</td>
                  </tr>
                  <tr>
                    <th>L</th>
                    <td>${prescriptionData.left_sph}</td>
                    <td>${prescriptionData.left_cyl}</td>
                    <td>${prescriptionData.left_axis}</td>
                    <td>${prescriptionData.left_add}</td>
                    <td>${prescriptionData.left_va}</td>
                    <td>${prescriptionData.left_ipd}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mb-4">
              <strong>Clinical History:</strong>
              <p>${prescriptionData.clinical_history}</p>
            </div>

            <div class="mt-5">
              <div class="row">
                <div class="col-6">
                  <p><strong>Optometrist:</strong> ${prescriptionData.optometrist_name}</p>
                </div>
                <div class="col-6 text-end">
                  <p>Signature: _________________</p>
                </div>
              </div>
            </div>

            <div class="text-center mt-4 no-print">
              <button onclick="window.print()" class="btn btn-primary">Print</button>
              <button onclick="window.close()" class="btn btn-secondary ms-2">Close</button>
            </div>
          </div>
        </body>
      </html>
    `);
  };

  return (
    <div className="container-fluid">
      {/* Notification Toast */}
      {showNotification && notifications[0] && (
        <div 
          className="toast show position-fixed top-0 end-0 m-4"
          style={{ zIndex: 1050 }}
        >
          <div className="toast-header bg-primary text-white">
            <strong className="me-auto">New Patient</strong>
            <button 
              type="button" 
              className="btn-close btn-close-white"
              onClick={() => setShowNotification(false)}
            />
          </div>
          <div className="toast-body">
            <p className="mb-1">{notifications[0].message}</p>
            <small className="text-muted">Just now</small>
          </div>
        </div>
      )}

      <nav className="navbar bg-light mb-4">
        <div className="container">
          <Link to="/" className="navbar-brand">OptiPlus</Link>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary me-2">
              {pendingPatients.length} Pending
            </span>
            <span className="navbar-text">Doctor's Panel</span>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="row">
          {/* Pending Patients List */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Pending Examinations</h5>
              </div>
              <div className="card-body p-0">
                {pendingPatients.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <p className="mb-0">No pending examinations</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {pendingPatients.map(patient => (
                      <div 
                        key={patient.id}
                        className={`list-group-item list-group-item-action ${
                          selectedPatient?.id === patient.id ? 'active' : ''
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">{patient.name}</h6>
                          <small>
                            {new Date(patient.created_at).toLocaleTimeString()}
                          </small>
                        </div>
                        <p className="mb-1">
                          Age: {calculateAge(patient.dateOfBirth)} | 
                          Gender: {patient.gender}
                        </p>
                        <small>Mobile: {patient.mobile}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Examination Form */}
          {selectedPatient ? (
            <div className="col-md-8">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Examination - {selectedPatient.name}</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setSelectedPatient(null)}
                  />
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {/* Patient Info Summary */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Mobile:</strong> {selectedPatient.mobile}</p>
                        <p className="mb-1"><strong>Age:</strong> {calculateAge(selectedPatient.dateOfBirth)}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Previous RX:</strong></p>
                        <p className="text-muted">{selectedPatient.previousRx || 'None'}</p>
                      </div>
                    </div>

                    {/* Prescription Table */}
                    <table className="table table-bordered mb-4">
                      <thead className="table-light">
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
                        {/* Right Eye */}
                        <tr>
                          <th className="table-light">R</th>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="right_sph"
                              value={prescriptionData.right_sph}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="right_cyl"
                              value={prescriptionData.right_cyl}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="right_axis"
                              value={prescriptionData.right_axis}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="right_add"
                              value={prescriptionData.right_add}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="right_va"
                              value={prescriptionData.right_va}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="right_ipd"
                              value={prescriptionData.right_ipd}
                              onChange={handleChange}
                              required
                              placeholder="Right IPD"
                            />
                          </td>
                        </tr>
                        {/* Left Eye */}
                        <tr>
                          <th className="table-light">L</th>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="left_sph"
                              value={prescriptionData.left_sph}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="left_cyl"
                              value={prescriptionData.left_cyl}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="left_axis"
                              value={prescriptionData.left_axis}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="left_add"
                              value={prescriptionData.left_add}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="left_va"
                              value={prescriptionData.left_va}
                              onChange={handleChange}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              name="left_ipd"
                              value={prescriptionData.left_ipd}
                              onChange={handleChange}
                              required
                              placeholder="Left IPD"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Clinical Details */}
                    <div className="row mb-3">
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Clinical History</label>
                        <textarea
                          className="form-control"
                          name="clinical_history"
                          value={prescriptionData.clinical_history}
                          onChange={handleChange}
                          rows="3"
                          required
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label">Optometrist Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="optometrist_name"
                          value={prescriptionData.optometrist_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setSelectedPatient(null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Complete Examination
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-md-8">
              <div className="text-center text-muted mt-5">
                <h4>Select a patient from the list to begin examination</h4>
                <p>No patient selected</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Utility function to calculate age
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export default Doctor;