import { JobApplication } from '../services/jobService';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

interface ActionBarProps {
  jobs: JobApplication[];
  filteredCount: number;
  onRefresh: () => void;
}

export default function ActionBar({ jobs, filteredCount, onRefresh }: ActionBarProps) {
  const handleExportCSV = () => {
    exportToCSV(jobs, `job-applications-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportJSON = () => {
    exportToJSON(jobs, `job-applications-${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-gray-300 text-sm">
          Showing <span className="font-bold text-blue-400">{filteredCount}</span> of{' '}
          <span className="font-bold text-blue-400">{jobs.length}</span> applications
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={jobs.length === 0}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            📥 Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            disabled={jobs.length === 0}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            📥 Export JSON
          </button>
        </div>
      </div>
    </div>
  );
}
