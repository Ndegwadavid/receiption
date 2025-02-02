// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ReceptionForm from './components/ReceptionForm.jsx'
import Doctor from './components/Doctor.jsx'
import ReceptionStatus from './components/ReceptionStatus.jsx'
import Admin from './components/Admin.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reception" element={<ReceptionPage />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

// Reception page that shows both form and status
function ReceptionPage() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8">
          <ReceptionForm />
        </div>
        <div className="col-md-4">
          <ReceptionStatus />
        </div>
      </div>
    </div>
  )
}

function Home() {
  return (
    <div className="container">
      <div className="text-center my-5">
        <h1 className="display-4 mb-4">OptiPlus</h1>
        <div className="row justify-content-center mt-5">
          <div className="col-md-4 mb-3">
            <Link to="/reception" className="text-decoration-none">
              <div className="card">
                <div className="card-body text-center py-5">
                  <h3 className="card-title">Reception</h3>
                  <p className="card-text text-muted">Patient Registration & Sales</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-4 mb-3">
            <Link to="/doctor" className="text-decoration-none">
              <div className="card">
                <div className="card-body text-center py-5">
                  <h3 className="card-title">Doctor</h3>
                  <p className="card-text text-muted">Patient Examination</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/admin" className="btn btn-outline-secondary">
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  )
}

export default App