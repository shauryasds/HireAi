
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/job/my-jobs`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setDeleting(jobId);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/job/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setJobs(jobs.filter(job => job._id !== jobId));
        alert('Job deleted successfully!');
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete job');
    } finally {
      setDeleting(null);
    }
  };

  const handleShare = async (jobId) => {
    const shareUrl = `${window.location.origin}/apply-job/${jobId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Job link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert(`Share this link: ${shareUrl}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-yellow-400 text-xl animate-pulse">Loading your jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 font-inter">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">My Job Posts</h1>
            <p className="text-gray-400">Manage all your job postings</p>
          </div>
          <Link
            to="/create-job"
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
          >
            + Create New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v2M8 8v10l4-4 4 4V8" />
              </svg>
              <h3 className="text-xl font-medium mb-2">No jobs posted yet</h3>
              <p>Create your first job posting to start hiring!</p>
            </div>
            <Link
              to="/create-job"
              className="inline-block bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
            >
              Create Your First Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
              key={job._id}
              className="bg-[#111] border border-yellow-400/20 rounded-xl p-6 hover:border-yellow-400/40 transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                    <span className={`mt-2 sm:mt-0 px-2 py-1 rounded-full text-xs font-medium ${
                      job.isActive 
                        ? 'bg-green-400/20 text-green-300' 
                        : 'bg-gray-400/20 text-gray-300'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
            
                  <p className="text-gray-400 mb-2">{job.company} • {job.location}</p>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{job.description}</p>
            
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skillsRequired?.slice(0, 4).map((skill, index) => (
                      <span key={index} className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired?.length > 4 && (
                      <span className="text-gray-400 text-xs px-2 py-1">
                        +{job.skillsRequired.length - 4} more
                      </span>
                    )}
                  </div>
            
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>Experience: {job.experienceRequired}</span>
                    <span>Type: {job.type}</span>
                    <span>Applications: {job.applicants?.length || 0}</span>
                    <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
            
                {/* Right section - action buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 md:ml-4 w-full md:w-auto">
                  <button
                    onClick={() => handleShare(job._id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition w-full md:w-auto"
                  >
                    Share Link
                  </button>
            
                  <Link
                    to={`/apply-job/${job._id}`}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition text-center w-full md:w-auto"
                  >
                    View Job
                  </Link>
            
                  <button
                    onClick={() => handleDelete(job._id)}
                    disabled={deleting === job._id}
                    className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition w-full md:w-auto"
                  >
                    {deleting === job._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            
              {job.salaryRange && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <span className="text-green-400 font-semibold">
                    ₹{job.salaryRange.min?.toLocaleString()} - ₹{job.salaryRange.max?.toLocaleString()} {job.salaryRange.currency}
                  </span>
                </div>
              )}
            </div>
            
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
