import React, { useState } from 'react';

interface FitAnalysisProps {
  matchScore?: number;
  strengths?: string;
  gaps?: string;
  highlights?: string;
  skillGaps?: string;
  isLoading?: boolean;
  onRunAnalysis?: () => void;
}

export const FitAnalysis: React.FC<FitAnalysisProps> = ({
  matchScore = 0,
  strengths = '',
  gaps = '',
  highlights = '',
  skillGaps = '',
  isLoading = false,
  onRunAnalysis,
}) => {
  const [expanded, setExpanded] = useState(true);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-900/20 border-green-700';
    if (score >= 50) return 'bg-yellow-900/20 border-yellow-700';
    return 'bg-red-900/20 border-red-700';
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-750 cursor-pointer hover:bg-gray-700 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold text-white">Fit Analysis</h3>
        <div className="flex items-center gap-4">
          {matchScore > 0 && (
            <div className={`text-2xl font-bold ${getScoreColor(matchScore)}`}>
              {matchScore}%
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRunAnalysis?.();
            }}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm font-medium text-white transition"
          >
            {isLoading ? 'Analyzing...' : 'Run Analysis'}
          </button>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expanded ? 'rotate-180' : ''
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
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4 border-t border-gray-700">
          {/* Match Score */}
          {matchScore > 0 && (
            <div className={`p-3 rounded border ${getScoreBg(matchScore)}`}>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Overall Match</span>
                <span className={`text-xl font-bold ${getScoreColor(matchScore)}`}>
                  {matchScore}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    matchScore >= 75
                      ? 'bg-green-500'
                      : matchScore >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${matchScore}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Strengths */}
          {strengths && (
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2">Strengths</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{strengths}</p>
            </div>
          )}

          {/* Gaps */}
          {gaps && (
            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-2">Gaps</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{gaps}</p>
            </div>
          )}

          {/* Recommended Highlights */}
          {highlights && (
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2">
                Recommended Highlights
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{highlights}</p>
            </div>
          )}

          {/* Skill Gaps */}
          {skillGaps && (
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">
                Skill Gap Ideas
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{skillGaps}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
