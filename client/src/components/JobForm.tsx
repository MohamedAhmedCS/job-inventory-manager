import { useState, useEffect } from 'react';
import { JobApplication } from '../services/jobService';

interface JobFormProps {
  onSubmit: (job: Partial<JobApplication>) => void;
  initialValues?: Partial<JobApplication>;
  isEditing?: boolean;
}

export default function JobForm({ onSubmit, initialValues, isEditing }: JobFormProps) {
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    company: '',
    title: '',
    location: '',
    status: 'Applied',
    appliedDate: '',
    notes: '',
  });

  useEffect(() => {
    if (initialValues) setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      company: '',
      title: '',
      location: '',
      status: 'Applied',
      appliedDate: '',
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Company</label>
        <input
          name="company"
          value={formData.company}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Applied Date</label>
        <input
          name="appliedDate"
          type="date"
          value={formData.appliedDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <input
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
        >
          {isEditing ? 'Update Job' : 'Add Job'}
        </button>
      </div>
    </form>
  );
}
