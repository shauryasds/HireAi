import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
console.log(user,'user')
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-black/95 backdrop-blur-sm border-b border-yellow-400/20 px-6 py-4 font-inter fixed w-full top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition">
          HireAI
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <span className="text-gray-300">
                Welcome, {user?.fullName || user?.email}
              </span>

              {user?.role === 'recruiter' && (
                <>
                  <Link
                    to="/interviews"
                    className="text-white hover:text-yellow-400 transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-jobs"
                    className="text-white hover:text-yellow-400 transition"
                  >
                    My Jobs
                  </Link>
                  
                  <Link
                    to="/create-job"
                    className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-300 transition"
                  >
                    Create Job
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="text-white hover:text-yellow-400 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:text-yellow-400 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-300 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}