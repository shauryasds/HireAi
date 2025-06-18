import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
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
import { useEffect } from "react";


export default function App() {
  
  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isOnhomePage = window.location.pathname === "/";

    if (isMobile && !isOnhomePage) {
      alert("Please use a desktop/laptop for the Better interview/DashboardExperience .");
      
    }
  }, []);
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
