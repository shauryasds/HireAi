import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-yellow-400/20 px-6 py-4 font-inter fixed w-full top-0 z-50 shadow-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link
          to="/"
          className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-all duration-200"
        >
          HireAI
        </Link>

        {/* Hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-yellow-400 text-3xl focus:outline-none"
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <span className="text-gray-300 text-sm">
                Welcome, <span className="font-semibold text-yellow-300">{user?.fullName || user?.email}</span>
              </span>

              {user?.role === 'recruiter' && (
                <>
                  <NavItem to="/interviews" label="Dashboard" />
                  <NavItem to="/my-jobs" label="My Jobs" />
                  <Link
                    to="/create-job"
                    className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-300 transition-all duration-200 shadow"
                  >
                    + Create Job
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="text-white hover:text-yellow-400 transition duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavItem to="/login" label="Login" />
              <Link
                to="/signup"
                className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-300 transition-all duration-200 shadow"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden mt-4 flex flex-col gap-4 px-4 pb-4 border-t border-yellow-400/20"
          >
            {isAuthenticated ? (
              <>
                <span className="text-gray-300 text-sm">
                  Welcome, <span className="font-semibold text-yellow-300">{user?.fullName || user?.email}</span>
                </span>

                {user?.role === 'recruiter' && (
                  <>
                    <MobileNavItem to="/interviews" label="Dashboard" toggleMenu={toggleMenu} />
                    <MobileNavItem to="/my-jobs" label="My Jobs" toggleMenu={toggleMenu} />
                    <Link
                      to="/create-job"
                      onClick={toggleMenu}
                      className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-300 transition"
                    >
                      + Create Job
                    </Link>
                  </>
                )}

                <button
                  onClick={() => {
                    toggleMenu();
                    handleLogout();
                  }}
                  className="text-white hover:text-yellow-400 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileNavItem to="/login" label="Login" toggleMenu={toggleMenu} />
                <Link
                  to="/signup"
                  onClick={toggleMenu}
                  className="bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-300 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// Reusable nav link component
const NavItem = ({ to, label }) => (
  <Link
    to={to}
    className="text-white hover:text-yellow-400 transition duration-200"
  >
    {label}
  </Link>
);

// Reusable mobile nav item
const MobileNavItem = ({ to, label, toggleMenu }) => (
  <Link
    to={to}
    onClick={toggleMenu}
    className="text-white hover:text-yellow-400 transition"
  >
    {label}
  </Link>
);
