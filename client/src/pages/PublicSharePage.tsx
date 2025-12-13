import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import careerCockpitService from '../services/careerCockpitService';

interface PublicJobPacket {
  id: number;
  title: string;
  jobType: string;
  description: string;
  companyName: string;
  department?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  classification?: string | null;
  jcNumber?: string | null;
  examType?: string | null;
  teamName?: string | null;
  jobBoard?: string | null;
  soqRequired?: boolean;
  aiAnalysis?: {
    matchScore: number;
    strengthsSummary: string;
    gapsSummary: string;
    skillGapsAndIdeas: string;
    recommendedHighlights: string;
  } | null;
  assets: Array<{
    id: number;
    type: string;
    title: string;
    content: string;
  }>;
}

const PublicSharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [packet, setPacket] = useState<PublicJobPacket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedAsset, setExpandedAsset] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    const loadPacket = async () => {
      try {
        setLoading(true);
        // This would call the actual API endpoint
        const response = await careerCockpitService.getPublicJobPacket(token);
        setPacket(response);
      } catch (err) {
        setError('This share link is invalid or has expired');
      } finally {
        setLoading(false);
      }
    };

    loadPacket();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Loading shared content...</p>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !packet) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0 4v2M8 15H6m2-6h2M6 9h2"
            />
          </svg>
          <h1 className="text-2xl font-bold mb-2">Share Link Invalid</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{packet.title}</h1>
          <p className="text-gray-400 text-lg">
            {packet.companyName || packet.department}
          </p>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-200">
              {packet.jobType}
            </span>
            {packet.classification && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-900/30 text-purple-200">
                {packet.classification}
              </span>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Job Description</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{packet.description}</p>

          {packet.salaryMin && packet.salaryMax && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-300">
                <span className="font-semibold">Salary Range:</span> ${packet.salaryMin.toLocaleString()} -
                ${packet.salaryMax.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Analysis */}
        {packet.aiAnalysis && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">AI Analysis</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Overall Match</span>
                  <span className="text-2xl font-bold text-green-400">
                    {packet.aiAnalysis.matchScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${packet.aiAnalysis.matchScore}%` }}
                  ></div>
                </div>
              </div>

              {packet.aiAnalysis.strengthsSummary && (
                <div>
                  <h3 className="text-sm font-semibold text-green-400 mb-2">Strengths</h3>
                  <p className="text-gray-300 text-sm">{packet.aiAnalysis.strengthsSummary}</p>
                </div>
              )}

              {packet.aiAnalysis.gapsSummary && (
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-2">Gaps</h3>
                  <p className="text-gray-300 text-sm">{packet.aiAnalysis.gapsSummary}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assets */}
        {packet.assets && packet.assets.length > 0 && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Shared Documents</h2>
            <div className="space-y-2">
              {packet.assets.map((asset) => (
                <div key={asset.id}>
                  <button
                    onClick={() =>
                      setExpandedAsset(expandedAsset === asset.id ? null : asset.id)
                    }
                    className="w-full text-left p-3 bg-gray-750 hover:bg-gray-700 rounded border border-gray-600 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium">{asset.title}</p>
                      <p className="text-xs text-gray-400">{asset.type}</p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedAsset === asset.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>

                  {expandedAsset === asset.id && (
                    <div className="mt-2 p-4 bg-gray-750 rounded border border-gray-600 whitespace-pre-wrap text-sm text-gray-300 font-mono max-h-64 overflow-y-auto">
                      {asset.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicSharePage;
