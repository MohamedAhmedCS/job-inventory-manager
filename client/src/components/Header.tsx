import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex justify-between items-center mb-4">
          <div>
            <Link to="/" className="text-3xl font-bold text-white hover:text-blue-400 transition">
              Career Cockpit
            </Link>
            <p className="text-gray-400 text-sm mt-1">Manage your job search strategically</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition duration-200"
          >
            Logout
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1 border-t border-gray-700 pt-0">
          <Link
            to="/jobs"
            className={`px-4 py-3 font-medium border-b-2 transition ${
              isActive('/jobs')
                ? 'text-blue-400 border-blue-500'
                : 'text-gray-400 hover:text-gray-300 border-transparent'
            }`}
          >
            Jobs
          </Link>
          <Link
            to="/profile"
            className={`px-4 py-3 font-medium border-b-2 transition ${
              isActive('/profile')
                ? 'text-blue-400 border-blue-500'
                : 'text-gray-400 hover:text-gray-300 border-transparent'
            }`}
          >
            Profile
          </Link>
          <Link
            to="/share"
            className={`px-4 py-3 font-medium border-b-2 transition ${
              isActive('/share')
                ? 'text-blue-400 border-blue-500'
                : 'text-gray-400 hover:text-gray-300 border-transparent'
            }`}
          >
            Share
          </Link>
          <Link
            to="/settings"
            className={`px-4 py-3 font-medium border-b-2 transition ${
              isActive('/settings')
                ? 'text-blue-400 border-blue-500'
                : 'text-gray-400 hover:text-gray-300 border-transparent'
            }`}
          >
            Settings
          </Link>
          <Link
            to="/ai-settings"
            className={`px-4 py-3 font-medium border-b-2 transition ${
              isActive('/ai-settings')
                ? 'text-blue-400 border-blue-500'
                : 'text-gray-400 hover:text-gray-300 border-transparent'
            }`}
          >
            AI Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
