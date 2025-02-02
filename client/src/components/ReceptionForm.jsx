// src/components/ReceptionForm.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import io from 'socket.io-client'

const socket = io('http://localhost:5000')

function ReceptionForm() {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    mobile: '',
    occupation: '',
    gender: '',
    email: '',
    poboxNo: '',
    pinCode: '',
    area: '',
    previousRx: '',
    status: 'pending_examination'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    socket.emit('newPatient', formData)

    // Clear form
    setFormData({
      name: '',
      dateOfBirth: '',
      mobile: '',
      occupation: '',
      gender: '',
      email: '',
      poboxNo: '',
      pinCode: '',
      area: '',
      previousRx: '',
      status: 'pending_examination'
    })

    alert('Patient information sent to doctor')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="container mt-4">
      <nav className="navbar bg-light mb-4">
        <div className="container">
          <Link to="/" className="navbar-brand">OptiPlus</Link>
          <span className="navbar-text">Reception Panel</span>
        </div>
      </nav>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">New Patient Registration</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Mobile</label>
                <input
                  type="tel"
                  className="form-control"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Occupation</label>
                <input
                  type="text"
                  className="form-control"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">P.O. Box No</label>
                <input
                  type="text"
                  className="form-control"
                  name="poboxNo"
                  value={formData.poboxNo}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">PIN Code</label>
                <input
                  type="text"
                  className="form-control"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Area</label>
                <input
                  type="text"
                  className="form-control"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Previous RX</label>
                <textarea
                  className="form-control"
                  name="previousRx"
                  value={formData.previousRx}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Link to="/" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary">
                Send to Doctor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReceptionForm