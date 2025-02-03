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
    previousRx: ''
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
      previousRx: ''
    })

    // Show success message
    alert('Patient information sent to doctor')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8">
      {/* Navigation */}
      <nav className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/optiplus.png" 
                alt="OptiPlus Logo" 
                className="h-12 w-auto mr-4"
              />
              <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                OptiPlus
              </span>
            </Link>
            <h2 className="text-xl font-semibold text-gray-800">Reception Panel</h2>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Patient Registration</h3>
              <p className="text-gray-500">Complete the form with patient's personal information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    id="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    placeholder="+254 712 345 678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    id="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Enter occupation"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="poboxNo" className="block text-sm font-medium text-gray-700">
                    P.O. Box No
                  </label>
                  <input
                    type="text"
                    name="poboxNo"
                    id="poboxNo"
                    value={formData.poboxNo}
                    onChange={handleChange}
                    placeholder="P.O. Box"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    id="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="Enter PIN"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    id="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Enter area"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                  />
                </div>
              </div>

              {/* Previous RX */}
              <div className="space-y-2">
                <label htmlFor="previousRx" className="block text-sm font-medium text-gray-700">
                  Previous RX
                </label>
                <textarea
                  name="previousRx"
                  id="previousRx"
                  rows={4}
                  value={formData.previousRx}
                  onChange={handleChange}
                  placeholder="Brief description of previous prescription (if any)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 ease-in-out"
                />
                <p className="mt-2 text-xs text-gray-500">Optional: Provide any relevant medical history</p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <Link
                  to="/"
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105"
                >
                  Send to Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceptionForm