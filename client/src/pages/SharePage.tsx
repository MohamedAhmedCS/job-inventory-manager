import { useState, useEffect } from 'react';
import careerCockpitService, { SharedLink } from '../services/careerCockpitService';

export default function SharePage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'profile'>('jobs');
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    shareType: 'job',
    itemId: '',
    expirationDays: 30,
  });

  useEffect(() => {
    loadSharedLinks();
  }, [activeTab]);

  const loadSharedLinks = async () => {
    try {
      setLoading(true);
      const links = await careerCockpitService.getShareLinks();
      setSharedLinks(links);
    } catch {
      setError('Failed to load shared links');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    try {
      setError('');
      setSuccess('');

      if (!form.itemId || form.itemId === 'all') {
        setError('Please select an item to share');
        return;
      }

      const itemId = parseInt(form.itemId, 10);
      let newLink: SharedLink;

      if (activeTab === 'jobs') {
        newLink = await careerCockpitService.createJobShareLink(itemId, form.expirationDays);
      } else {
        newLink = await careerCockpitService.createProfileShareLink(form.expirationDays);
      }

      setSharedLinks([...sharedLinks, newLink]);
      setSuccess('Sharing link created successfully');
      setShowForm(false);
      setForm({ shareType: 'job', itemId: '', expirationDays: 30 });
    } catch {
      setError('Failed to create sharing link');
    }
  };

  const handleToggleLink = async (token: string, currentActive: boolean) => {
    try {
      setError('');
      await careerCockpitService.updateShareLink(token, !currentActive);
      setSharedLinks(sharedLinks.map(l => l.token === token ? { ...l, isActive: !currentActive } : l));
      setSuccess(!currentActive ? 'Link activated' : 'Link deactivated');
    } catch {
      setError('Failed to update link');
    }
  };

  const handleDeleteLink = async (token: string) => {
    if (!window.confirm('Delete this sharing link?')) return;

    try {
      setError('');
      await careerCockpitService.deleteShareLink(token);
      setSharedLinks(sharedLinks.filter(l => l.token !== token));
      setSuccess('Link deleted');
    } catch {
      setError('Failed to delete link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Link copied to clipboard');
  };

  const filteredLinks = sharedLinks.filter(link => 
    activeTab === 'jobs' ? link.type === 'job' : link.type === 'profile'
  );

  if (loading) {
    return <div className="text-center text-gray-400">Loading shared links...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Share Your Profile</h1>

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
          {(['jobs', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowForm(false);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 px-4 py-3 text-center font-medium transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Share {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            {showForm ? 'Cancel' : 'Create Sharing Link'}
          </button>

          {showForm && (
            <div className="bg-gray-700 p-4 rounded-lg space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Select {activeTab === 'jobs' ? 'Job' : 'Profile'} to Share
                </label>
                <select
                  value={form.itemId}
                  onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select --</option>
                  {activeTab === 'jobs' && (
                    <option value="all">All Jobs</option>
                  )}
                  {activeTab === 'profile' && (
                    <option value="profile">Complete Profile</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Expiration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={form.expirationDays}
                  onChange={(e) => setForm({ ...form, expirationDays: parseInt(e.target.value) })}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleCreateLink}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Create Link
              </button>
            </div>
          )}

          {/* Shared Links List */}
          <div className="space-y-3">
            {filteredLinks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No sharing links yet. Create one to start sharing your {activeTab}.
              </p>
            ) : (
              filteredLinks.map((link) => (
                <div key={link.token} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-semibold">{link.type === 'job' ? 'Job' : 'Profile'} Link</span>
                        <span className={`px-2 py-1 rounded text-xs ${link.isActive ? 'bg-green-900 text-green-200' : 'bg-gray-600 text-gray-300'}`}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="bg-gray-600 p-3 rounded-lg mb-2">
                        <p className="text-gray-300 text-xs mb-2">Sharing Token:</p>
                        <p className="text-white text-sm break-all font-mono">{link.token}</p>
                      </div>
                      <p className="text-gray-400 text-xs">
                        Created: {new Date(link.createdAt).toLocaleDateString()}
                        {link.expiresAt && ` | Expires: ${new Date(link.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(link.url)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        title="Copy link"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleToggleLink(link.token, link.isActive)}
                        className={`text-sm ${link.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                      >
                        {link.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.token)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-900/20 border border-blue-600 p-4 rounded-lg">
        <p className="text-blue-200 text-sm">
          Shared links allow you to publicly share your job listings or complete profile with recruiters. 
          You can set expiration dates and disable links at any time.
        </p>
      </div>
    </div>
  );
}
