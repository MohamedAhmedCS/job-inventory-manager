import { useState, useEffect } from 'react';
import { JobApplication } from '../services/jobService';

interface JobFormProps {
  onSubmit: (job: Partial<JobApplication>) => void;
  initialValues?: Partial<JobApplication>;
  isEditing?: boolean;
  onCancel?: () => void;
}

const JOB_STATUSES = ['Applied', 'Interview', 'In Progress', 'Offer', 'Rejected'];

export default function JobForm({ onSubmit, initialValues, isEditing, onCancel }: JobFormProps) {
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    company: '',
    title: '',
    location: '',
    status: 'Applied',
    appliedDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) setFormData(initialValues);
  }, [initialValues]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company?.trim()) newErrors.company = 'Company name is required';
    if (!formData.title?.trim()) newErrors.title = 'Job title is required';
    if (!formData.appliedDate) newErrors.appliedDate = 'Applied date is required';
    if (formData.company && formData.company.length < 2) newErrors.company = 'Company name must be at least 2 characters';
    if (formData.title && formData.title.length < 2) newErrors.title = 'Job title must be at least 2 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        company: '',
        title: '',
        location: '',
        status: 'Applied',
        appliedDate: '',
        notes: '',
      });
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Company *</label>
        <input
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="e.g., Google, Microsoft"
          className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition ${
            errors.company ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
          }`}
        />
        {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Job Title *</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Senior Developer"
          className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition ${
            errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
          }`}
        />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., San Francisco, CA"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Applied Date *</label>
        <input
          name="appliedDate"
          type="date"
          value={formData.appliedDate}
          onChange={handleChange}
          className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none transition ${
            errors.appliedDate ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
          }`}
        />
        {errors.appliedDate && <p className="text-red-400 text-xs mt-1">{errors.appliedDate}</p>}
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
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Add any notes (salary, interview date, etc.)"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition resize-none"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Job' : 'Add Job'}
        </button>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
