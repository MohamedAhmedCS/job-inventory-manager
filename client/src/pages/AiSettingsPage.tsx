import React, { useState, useEffect } from 'react';

const AiSettingsPage: React.FC = () => {
  const [apiProvider, setApiProvider] = useState('OpenAI');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [analysisDepth, setAnalysisDepth] = useState('balanced');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('aiSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setApiProvider(settings.apiProvider || 'OpenAI');
      setApiKey(settings.apiKey || '');
      setAutoGenerate(settings.autoGenerate !== false);
      setAnalysisDepth(settings.analysisDepth || 'balanced');
    }
  }, []);

  const handleSave = () => {
    const settings = {
      apiProvider,
      apiKey: apiKey ? apiKey.substring(0, 8) + '...' : '', // Store masked key
      autoGenerate,
      analysisDepth,
    };
    localStorage.setItem('aiSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Settings</h1>
          <p className="text-gray-400">Configure your AI assistant preferences</p>
        </div>

        {/* API Configuration */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 7H7v6h6V7z" />
            </svg>
            API Configuration
          </h2>

          <div className="space-y-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Provider
              </label>
              <select
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              >
                <option>OpenAI</option>
                <option>Anthropic Claude</option>
                <option>Google Gemini</option>
                <option>Local (Ollama)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select your preferred AI service provider
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key {apiProvider !== 'Local (Ollama)' && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    apiProvider === 'Local (Ollama)'
                      ? 'Not required for local'
                      : 'sk-...'
                  }
                  disabled={apiProvider === 'Local (Ollama)'}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:bg-gray-800 disabled:text-gray-500"
                />
                {apiProvider !== 'Local (Ollama)' && (
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {apiProvider === 'OpenAI' &&
                  'Get your API key from https://platform.openai.com/api-keys'}
                {apiProvider === 'Anthropic Claude' &&
                  'Get your API key from https://console.anthropic.com'}
                {apiProvider === 'Google Gemini' &&
                  'Get your API key from https://makersuite.google.com/app/apikey'}
                {apiProvider === 'Local (Ollama)' &&
                  'Make sure Ollama is running locally on port 11434'}
              </p>
            </div>
          </div>
        </div>

        {/* AI Behavior */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            </svg>
            AI Behavior
          </h2>

          <div className="space-y-4">
            {/* Auto-generate */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Auto-generate on job upload
                </label>
                <p className="text-xs text-gray-500">
                  Automatically run analysis and generate assets when you add a new job
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-5 h-5 bg-gray-700 border border-gray-600 rounded cursor-pointer"
              />
            </div>

            {/* Analysis Depth */}
            <div className="border-t border-gray-700 pt-4">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Analysis Depth
              </label>
              <div className="flex gap-3">
                {['quick', 'balanced', 'deep'].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="depth"
                      value={option}
                      checked={analysisDepth === option}
                      onChange={(e) => setAnalysisDepth(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-300 capitalize">{option}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {analysisDepth === 'quick' &&
                  'Fast analysis - surface level insights (30 seconds)'}
                {analysisDepth === 'balanced' &&
                  'Balanced approach - good insights in reasonable time (1-2 min)'}
                {analysisDepth === 'deep' &&
                  'Deep analysis - comprehensive insights (3-5 min)'}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium text-white transition"
          >
            Save Settings
          </button>
          <button
            onClick={() => {
              setApiProvider('OpenAI');
              setApiKey('');
              setAutoGenerate(true);
              setAnalysisDepth('balanced');
              localStorage.removeItem('aiSettings');
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium text-white transition"
          >
            Reset
          </button>
        </div>

        {/* Saved Feedback */}
        {saved && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded text-green-400 text-sm">
            ✓ Settings saved successfully
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded text-blue-300 text-sm">
          <p>
            <strong>Note:</strong> Your API key is stored locally in your browser. We never send it
            to our servers. You can revoke it anytime by clearing your browser data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiSettingsPage;
