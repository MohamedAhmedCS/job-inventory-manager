import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import careerCockpitService, { Job } from '../services/careerCockpitService';
import Loading from '../components/Loading';

export default function JobsPage({ onNavigate }: { onNavigate?: (page: string, id?: number) => void } = {}) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    jobType: '',
    status: '',
    searchTerm: '',
  });
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10; // Fixed page size
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [filters, pageNumber, pageSize]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await careerCockpitService.getJobs({
        jobType: filters.jobType || undefined,
        status: filters.status || undefined,
        searchTerm: filters.searchTerm || undefined,
        pageNumber,
        pageSize,
      });
      setJobs(response.data);
      setTotalCount(parseInt(response.headers['x-total-count'] || '0', 10));
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await careerCockpitService.deleteJob(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch {
      setError('Failed to delete job');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Jobs</h1>
        <button
          onClick={() => navigate('/jobs/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Add Job
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.searchTerm}
            onChange={(e) => {
              setFilters({ ...filters, searchTerm: e.target.value });
              setPageNumber(1);
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={filters.jobType}
            onChange={(e) => {
              setFilters({ ...filters, jobType: e.target.value });
              setPageNumber(1);
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="State">State</option>
            <option value="Private">Private</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPageNumber(1);
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <div className="text-center text-gray-400 p-8">No jobs found</div>
      ) : (
        <>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                    <p className="text-gray-400">{job.companyName || job.department || 'Unknown'}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.jobType === 'State'
                        ? 'bg-purple-900/30 text-purple-200'
                        : 'bg-green-900/30 text-green-200'
                    }`}>
                      {job.jobType}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === 'Applied' ? 'bg-blue-900/30 text-blue-200' :
                      job.status === 'Interview' ? 'bg-yellow-900/30 text-yellow-200' :
                      job.status === 'Offer' ? 'bg-green-900/30 text-green-200' :
                      job.status === 'Rejected' ? 'bg-red-900/30 text-red-200' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>

                {job.aiAnalysis && (
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Match Score:</span>
                      <div className="flex-1 max-w-xs bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${job.aiAnalysis.matchScore}%` }}
                        />
                      </div>
                      <span className="font-semibold text-green-400">{job.aiAnalysis.matchScore}%</span>
                    </div>
                  </div>
                )}

                <p className="text-gray-300 text-sm line-clamp-2">{job.description}</p>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {job.interviewQuestionsCount} questions {job.assets?.length || 0} assets
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(job.id);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPageNumber(i + 1)}
                    className={`px-3 py-2 rounded-lg transition ${
                      pageNumber === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                disabled={pageNumber === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
