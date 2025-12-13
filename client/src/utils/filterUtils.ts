import { JobApplication } from '../services/jobService';

interface FilterOptions {
  searchTerm: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export function applyFilters(jobs: JobApplication[], filters: FilterOptions): JobApplication[] {
  return jobs.filter((job) => {
    // Search filter
    const searchMatch =
      !filters.searchTerm ||
      job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(filters.searchTerm.toLowerCase());

    // Status filter
    const statusMatch = !filters.status || job.status === filters.status;

    // Date range filter
    const jobDate = new Date(job.appliedDate).getTime();
    const dateFromMatch =
      !filters.dateFrom || jobDate >= new Date(filters.dateFrom).getTime();
    const dateToMatch =
      !filters.dateTo || jobDate <= new Date(filters.dateTo).getTime();

    return searchMatch && statusMatch && dateFromMatch && dateToMatch;
  });
}

export function getUniqueStatuses(jobs: JobApplication[]): string[] {
  const statuses = new Set(jobs.map((job) => job.status));
  return Array.from(statuses).sort();
}
