import { JobApplication } from '../services/jobService';

export function exportToCSV(jobs: JobApplication[], filename = 'job-applications.csv') {
  if (jobs.length === 0) {
    alert('No jobs to export');
    return;
  }

  // Create CSV header
  const headers = ['Company', 'Title', 'Location', 'Status', 'Applied Date', 'Notes'];
  
  // Create CSV rows
  const rows = jobs.map((job) => [
    `"${job.company}"`,
    `"${job.title}"`,
    `"${job.location || ''}"`,
    `"${job.status}"`,
    new Date(job.appliedDate).toLocaleDateString(),
    `"${(job.notes || '').replace(/"/g, '""')}"`, // Escape quotes in notes
  ]);

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(jobs: JobApplication[], filename = 'job-applications.json') {
  if (jobs.length === 0) {
    alert('No jobs to export');
    return;
  }

  const jsonContent = JSON.stringify(jobs, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
