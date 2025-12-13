import React, { useState } from 'react';

interface GenerateAssetProps {
  jobId: number;
  assetType: 'Resume' | 'CoverLetter' | 'Soq';
  onGenerate: (content: string) => void;
  isLoading?: boolean;
}

export const GenerateAsset: React.FC<GenerateAssetProps> = ({
  jobId,
  assetType,
  onGenerate,
  isLoading = false,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const typeLabels = {
    Resume: 'Tailored Resume',
    CoverLetter: 'Cover Letter',
    Soq: 'Statement of Qualifications',
  };

  const typeDescriptions = {
    Resume: 'Generate a resume tailored to this job posting',
    CoverLetter: 'Generate a custom cover letter',
    Soq: 'Generate a statement of qualifications for federal jobs',
  };

  const handleGenerate = async () => {
    // Placeholder - would call API to generate
    const placeholder = `Generated ${typeLabels[assetType]} for Job ID ${jobId}\n\nThis is a placeholder. In a real implementation, the AI service would generate customized content based on the job posting and your profile.`;
    setGeneratedContent(placeholder);
    setShowPreview(true);
  };

  const handleUse = () => {
    onGenerate(generatedContent);
    setShowPreview(false);
    setGeneratedContent('');
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white">{typeLabels[assetType]}</h4>
          <p className="text-xs text-gray-400 mt-1">{typeDescriptions[assetType]}</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || showPreview}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded text-xs font-medium text-white transition whitespace-nowrap ml-4"
        >
          {isLoading ? 'Generating...' : showPreview ? 'Preview' : 'Generate'}
        </button>
      </div>

      {showPreview && (
        <div className="mt-4 p-3 bg-gray-750 rounded border border-gray-600 max-h-48 overflow-y-auto">
          <div className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
            {generatedContent}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUse}
              className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium text-white transition"
            >
              Use This
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs font-medium text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
