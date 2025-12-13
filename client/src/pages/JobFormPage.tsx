import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import careerCockpitService, { Job } from '../services/careerCockpitService';
import Loading from '../components/Loading';

const JOB_TYPES = ['Private', 'State', 'Federal'];
const JOB_STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

export default function JobFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  const jobId = isEditing ? parseInt(id, 10) : 0;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    department: '',
    postingUrl: '',
    description: '',
    jobType: 'Private',
    status: 'Saved',
    salaryMin: '',
    salaryMax: '',
    classification: '',
    jcNumber: '',
    examType: '',
    soqRequired: false,
    teamName: '',
    jobBoard: '',
  });

  useEffect(() => {
    if (isEditing) {
      loadJob();
    }
  }, [isEditing, jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const job = await careerCockpitService.getJob(jobId);
      setFormData({
        title: job.title || '',
        companyName: job.companyName || '',
        department: job.department || '',
        postingUrl: job.postingUrl || '',
        description: job.description || '',
        jobType: job.jobType || 'Private',
        status: job.status || 'Saved',
        salaryMin: job.salaryMin?.toString() || '',
        salaryMax: job.salaryMax?.toString() || '',
        classification: job.classification || '',
        jcNumber: job.jcNumber || '',
        examType: job.examType || '',
        soqRequired: job.soqRequired || false,
        teamName: job.teamName || '',
        jobBoard: job.jobBoard || '',
      });
    } catch {
      setError('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!formData.companyName.trim() && !formData.department.trim()) {
      setError('Company name or department is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const jobData: Partial<Job> = {
        title: formData.title,
        companyName: formData.companyName,
        department: formData.department,
        postingUrl: formData.postingUrl,
        description: formData.description,
        jobType: formData.jobType as any,
        status: formData.status as any,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
        classification: formData.classification || undefined,
        jcNumber: formData.jcNumber || undefined,
        examType: formData.examType || undefined,
        soqRequired: formData.soqRequired,
        teamName: formData.teamName || undefined,
        jobBoard: formData.jobBoard || undefined,
      };

      if (isEditing) {
        await careerCockpitService.updateJob(jobId, jobData);
      } else {
        await careerCockpitService.createJob(jobData);
      }

      navigate('/jobs');
    } catch {
      setError('Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading job..." />;
  }

  const isStateOrFederal = formData.jobType === 'State' || formData.jobType === 'Federal';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">
          {isEditing ? 'Edit Job' : 'Add New Job'}
        </h1>
        <button
          onClick={() => navigate('/jobs')}
          className="text-gray-400 hover:text-white transition"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Job Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., Google, Microsoft"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
            <input
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Engineering, Product"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Type and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Job Type</label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
            >
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Job URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Job URL</label>
          <input
            name="postingUrl"
            value={formData.postingUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Salary Min ($)</label>
            <input
              name="salaryMin"
              type="number"
              value={formData.salaryMin}
              onChange={handleChange}
              placeholder="e.g., 100000"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Salary Max ($)</label>
            <input
              name="salaryMax"
              type="number"
              value={formData.salaryMax}
              onChange={handleChange}
              placeholder="e.g., 150000"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            placeholder="Paste the full job description here..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* State/Federal specific fields */}
        {isStateOrFederal && (
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {formData.jobType} Job Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Classification</label>
                <input
                  name="classification"
                  value={formData.classification}
                  onChange={handleChange}
                  placeholder="e.g., Information Technology Specialist I"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">JC Number</label>
                <input
                  name="jcNumber"
                  value={formData.jcNumber}
                  onChange={handleChange}
                  placeholder="e.g., JC-123456"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Exam Type</label>
                <input
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  placeholder="e.g., Open, Promotional"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Team Name</label>
                <input
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="e.g., Digital Services"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Job Board</label>
                <input
                  name="jobBoard"
                  value={formData.jobBoard}
                  onChange={handleChange}
                  placeholder="e.g., CalCareers, USAJobs"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="soqRequired"
                  checked={formData.soqRequired}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-300">
                  SOQ Required
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Submit buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Job' : 'Add Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
