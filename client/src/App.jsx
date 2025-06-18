import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateJob from './pages/CreateJob';
import ApplyJob from './pages/ApplyJob';
import Interview from './pages/Interview';
import Interviews from './pages/Interviews';
import Report from './pages/Report';
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import './app.css'
import MyJobs from "./pages/MyJobs"; //Import MyJobs

export default function App() {
  return (
    <div className="font-inter">
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/apply-job/:jobId" element={<ApplyJob />} />
            <Route path="/interview/:sessionId" element={<Interview />} />
            <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
            <Route path="/my-jobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
            <Route path="/report/:interviewId" element={<Report />} />

            {/* Protected Routes */}
           
            <Route 
              path="/create-job" 
              element={
                <ProtectedRoute requiredRole="recruiter">
                  <CreateJob />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}