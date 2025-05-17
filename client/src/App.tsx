import { useEffect, useState } from 'react';
import { getAllJobs, createJob, updateJob, deleteJob, JobApplication } from './services/jobService';
import JobForm from './components/JobForm';

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    getAllJobs()
      .then((data) => setJobs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleJobAdded = async (job: Partial<JobApplication>) => {
    const newJob = await createJob(job);
    setJobs((prev) => [...prev, newJob]);
  };

  const handleUpdate = async (updated: Partial<JobApplication>) => {
    if (!editingJob) return;
    const updatedJob = await updateJob(editingJob.id, { ...editingJob, ...updated });
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    setEditingJob(null);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this job?');
    if (!confirmed) return;
    await deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Job Inventory Manager</h1>

      <div className="bg-white shadow-md rounded-md p-6 mb-8">
        <JobForm
          onSubmit={editingJob ? handleUpdate : handleJobAdded}
          initialValues={editingJob || undefined}
          isEditing={!!editingJob}
        />
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500 italic">No job applications found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white shadow-md p-4 rounded-md border border-gray-200">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-600 mb-1">{job.company}</p>
              <p className="text-sm text-gray-500 italic">{job.location}</p>
              <p className="mt-2 text-sm text-blue-700">Status: {job.status}</p>
              <p className="text-sm text-gray-400">Applied: {job.appliedDate}</p>
              <p className="text-sm mt-2 text-gray-700">{job.notes}</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditingJob(job)}
                  className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
