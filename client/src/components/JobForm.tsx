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
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h2>{isEditing ? 'Edit Job' : 'Add Job'}</h2>
      <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} required />
      <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
      <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
      <input name="appliedDate" type="date" value={formData.appliedDate} onChange={handleChange} required />
      <input name="status" placeholder="Status" value={formData.status} onChange={handleChange} />
      <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />
      <button type="submit">{isEditing ? 'Update Job' : 'Add Job'}</button>
    </form>
  );
}
