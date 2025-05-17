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
    <div style={{ padding: '2rem' }}>
      <h1>Job Inventory Manager</h1>
      <JobForm
        onSubmit={editingJob ? handleUpdate : handleJobAdded}
        initialValues={editingJob || undefined}
        isEditing={!!editingJob}
      />
      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job.id}>
              <strong>{job.title}</strong> at {job.company} — {job.status}
              <button onClick={() => setEditingJob(job)} style={{ marginLeft: '1rem' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(job.id)} style={{ marginLeft: '1rem', color: 'red' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
