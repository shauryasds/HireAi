import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateJob from "./pages/CreateJob";
import ApplyJob from "./pages/ApplyJob";
import Interview from "./pages/Interview";
import Report from "./pages/Report";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import './app.css'
import Login from "./pages/login";
import Signup from "./pages/Signup";
export default function App() {
  return (
    <div className="font-inter ">
    <Router>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route path="/apply-job/:jobId" element={<ApplyJob />} />
        <Route path="/interview/:sessionId" element={<Interview />} />
        <Route path="/report/:interviewId" element={<Report />} />
      </Routes>
    </Router>
    </div>
  );
}
