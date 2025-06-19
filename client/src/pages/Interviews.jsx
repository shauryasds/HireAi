
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Interviews() {
  const { token } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, pending
  const [selectedJob, setSelectedJob] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interviewsRes, jobsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/interview/all`, {
            credentials:'include'
          }),
          fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/job/my-jobs`, {
            credentials:'include'
          })
        ]);

        const interviewsData = await interviewsRes.json();
        const jobsData = await jobsRes.json();
console.log(interviewsData, "interviewsData")
        setInterviews(interviewsData);
        setJobs(jobsData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const filteredInterviews = interviews.filter(interview => {
    const matchesFilter = filter === 'all' || interview.status === filter;
    const matchesJob = selectedJob === 'all' || interview.job?._id === selectedJob;
    const matchesSearch = 
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesJob && matchesSearch;
  });

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-inter pt-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse text-yellow-400 text-xl">Loading interviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-inter pt-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Interview Management</h1>
          <p className="text-gray-400">Monitor and review all candidate interviews</p>
        </div>

        {/* Filters */}
        <div className="bg-[#111] rounded-xl border border-yellow-400/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-black border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setSelectedJob('all');
                }}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-[#111] rounded-xl border border-yellow-400/20 p-6 text-center">
            <div className="text-2xl font-bold text-yellow-400">{interviews.length}</div>
            <div className="text-gray-400 text-sm">Total Interviews</div>
          </div>
          <div className="bg-[#111] rounded-xl border border-yellow-400/20 p-6 text-center">
            <div className="text-2xl font-bold text-green-400">
              {interviews.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="bg-[#111] rounded-xl border border-yellow-400/20 p-6 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {interviews.filter(i => i.status === 'pending').length}
            </div>
            <div className="text-gray-400 text-sm">Pending</div>
          </div>
          <div className="bg-[#111] rounded-xl border border-yellow-400/20 p-6 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {interviews.filter(i => i.status === 'completed' && i.totalScore >= 70).length}
            </div>
            <div className="text-gray-400 text-sm">High Scorers</div>
          </div>
        </div>

        {/* Interviews Table */}
        <div className="bg-[#111] rounded-xl border border-yellow-400/20 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-yellow-400">
              Interview Results ({filteredInterviews.length})
            </h2>
          </div>

          {filteredInterviews.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No interviews found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredInterviews.map((interview) => (
                    <tr key={interview._id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-white">{interview.candidateName}</div>
                          <div className="text-sm text-gray-400">{interview.candidateEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {interview.job?.title || 'Unknown Position'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          interview.status === 'completed'
                            ? 'bg-green-400/20 text-green-300'
                            : 'bg-yellow-400/20 text-yellow-300'
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {interview.status === 'completed' && interview.totalScore !== undefined ? (
                          <div>
                            <div className={`text-lg font-bold ${getScoreColor(interview.totalScore)}`}>
                              {interview.totalScore}%
                            </div>
                            <div className={`text-xs ${getScoreColor(interview.totalScore)}`}>
                              {getScoreLabel(interview.totalScore)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div>
                          {interview.completedAt ? (
                            <>
                              <div>Completed</div>
                              <div className="text-xs text-gray-500">
                                {new Date(interview.completedAt).toLocaleDateString()}
                              </div>
                            </>
                          ) : (
                            <>
                              <div>Started</div>
                              <div className="text-xs text-gray-500">
                                {new Date(interview.startedAt).toLocaleDateString()}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {interview.status === 'completed' ? (
                          <Link
                            to={`/report/${interview._id}`}
                            className="text-yellow-400 hover:text-yellow-300 font-medium"
                          >
                            View Report
                          </Link>
                        ) : (
                          <span className="text-gray-500">In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
