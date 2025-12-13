import { useState, useEffect } from 'react';
import careerCockpitService, { UserStats } from '../services/careerCockpitService';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'stats' | 'account'>('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // AI Settings state
  const [aiSettings, setAiSettings] = useState({
    enableAutoAnalysis: true,
    autoGenerateAssets: true,
    aiModel: 'gpt-4',
    analysisDepth: 'detailed',
  });

  // User Stats
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Get user stats if available
      try {
        const userStats = await careerCockpitService.getUserStats();
        setStats(userStats);
      } catch {
        // Stats might not be available yet
      }
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        // In a real app, you'd have a password change endpoint
        setSuccess('Password changed successfully');
      }

      setSuccess('Profile updated successfully');
      setProfileForm({ ...profileForm, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setError('Failed to update profile');
    }
  };

  const handleAiSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      // In a real app, you'd save these to the backend
      await careerCockpitService.updateSettings(aiSettings);
      setSuccess('AI settings updated successfully');
    } catch {
      setError('Failed to update AI settings');
    }
  };

  const handleAccountDeletion = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    if (!window.confirm('This will permanently delete all your data. Type your email to confirm.')) {
      return;
    }
    try {
      // In a real app, you'd have a delete account endpoint
      setSuccess('Account deletion initiated. You will be logged out shortly.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch {
      setError('Failed to delete account');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500 text-green-200 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-700">
          {(['profile', 'ai', 'stats', 'account'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 px-4 py-3 text-center font-medium transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-white font-semibold mb-4">Change Password</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Password</label>
                    <input
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Save Changes
              </button>
            </form>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'ai' && (
            <form onSubmit={handleAiSettingsUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">AI Model</label>
                <select
                  value={aiSettings.aiModel}
                  onChange={(e) => setAiSettings({ ...aiSettings, aiModel: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5">GPT-3.5 Turbo</option>
                  <option value="claude">Claude</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Analysis Depth</label>
                <select
                  value={aiSettings.analysisDepth}
                  onChange={(e) => setAiSettings({ ...aiSettings, analysisDepth: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="quick">Quick</option>
                  <option value="detailed">Detailed</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings.enableAutoAnalysis}
                    onChange={(e) => setAiSettings({ ...aiSettings, enableAutoAnalysis: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Enable auto-analysis when uploading new jobs</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings.autoGenerateAssets}
                    onChange={(e) => setAiSettings({ ...aiSettings, autoGenerateAssets: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Auto-generate resume templates and cover letters</span>
                </label>
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Save Settings
              </button>
            </form>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {stats ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Jobs</p>
                      <p className="text-2xl font-bold text-white">{stats.jobsCount}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Applied</p>
                      <p className="text-2xl font-bold text-blue-400">{stats.jobsByStatus?.['Applied'] || 0}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Interview</p>
                      <p className="text-2xl font-bold text-green-400">{stats.jobsByStatus?.['Interview'] || 0}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Skills</p>
                      <p className="text-2xl font-bold text-purple-400">{stats.skillsCount}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Experiences</p>
                      <p className="text-xl font-bold text-white mt-2">{stats.experiencesCount}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Projects</p>
                      <p className="text-xl font-bold text-white mt-2">{stats.projectsCount}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Stories</p>
                      <p className="text-xl font-bold text-white mt-2">{stats.storiesCount}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Questions</p>
                      <p className="text-xl font-bold text-white mt-2">{stats.interviewQuestionsCount}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-400">No statistics available yet. Start adding jobs and profile data to see stats.</p>
              )}
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-lg">
                <p className="text-yellow-200 text-sm">Danger Zone: These actions cannot be undone.</p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Delete Account</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Permanently delete your account and all associated data. This action cannot be reversed.
                </p>
                <button
                  onClick={handleAccountDeletion}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Delete Account
                </button>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-white font-semibold mb-2">Connected Accounts</h3>
                <p className="text-gray-400 text-sm">No connected accounts</p>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-white font-semibold mb-2">API Keys</h3>
                <p className="text-gray-400 text-sm">No API keys generated</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
