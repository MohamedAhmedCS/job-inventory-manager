import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import careerCockpitService, { Job, ApplicationAsset, InterviewQuestion } from '../services/careerCockpitService';
import { FitAnalysis } from '../components/FitAnalysis';
import { GenerateAsset } from '../components/GenerateAsset';
import Loading from '../components/Loading';

export default function JobDetailPage({ onNavigate }: { onNavigate?: (page: string, id?: number) => void }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = id ? parseInt(id, 10) : 0;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'analysis' | 'assets' | 'interview'>('details');
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [assets, setAssets] = useState<ApplicationAsset[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [newAssetType, setNewAssetType] = useState('Resume');
  const [newAssetTitle, setNewAssetTitle] = useState('');
  const [newAssetContent, setNewAssetContent] = useState('');
  const [showAssetForm, setShowAssetForm] = useState(false);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const jobData = await careerCockpitService.getJob(jobId);
      setJob(jobData);
      setAssets(jobData.assets || []);
      
      const questionsData = await careerCockpitService.getInterviewQuestions(jobId);
      setQuestions(questionsData);
    } catch (err) {
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  const handleRunAnalysis = async () => {
    try {
      setRunningAnalysis(true);
      const analysis = await careerCockpitService.runJobAnalysis(jobId);
      setJob(job ? { ...job, aiAnalysis: analysis } : null);
    } catch {
      setError('Failed to run analysis');
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleAddAsset = async () => {
    if (!newAssetTitle.trim() || !newAssetContent.trim()) {
      setError('Asset title and content are required');
      return;
    }

    try {
      const asset = await careerCockpitService.createJobAsset(jobId, {
        type: newAssetType as any,
        title: newAssetTitle,
        content: newAssetContent,
      });
      setAssets([...assets, asset]);
      setNewAssetType('Resume');
      setNewAssetTitle('');
      setNewAssetContent('');
      setShowAssetForm(false);
    } catch {
      setError('Failed to create asset');
    }
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await careerCockpitService.deleteJobAsset(jobId, assetId);
      setAssets(assets.filter(a => a.id !== assetId));
    } catch {
      setError('Failed to delete asset');
    }
  };

  const handleGenerateQuestions = async (type: 'duty' | 'internet') => {
    try {
      setRunningAnalysis(true);
      const result = type === 'duty'
        ? await careerCockpitService.generateDutyStatementQuestions(jobId)
        : await careerCockpitService.generateInternetPatternQuestions(jobId);
      setQuestions([...questions, ...result.questions]);
    } catch {
      setError('Failed to generate questions');
    } finally {
      setRunningAnalysis(false);
    }
  };

  if (loading) {
    return <Loading message="Loading job details..." />;
  }

  if (!job) {
    return <div className="text-center text-gray-400">Job not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{job.title}</h1>
          <p className="text-gray-400 text-lg">{job.companyName || job.department}</p>
          <div className="flex gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              job.jobType === 'State'
                ? 'bg-purple-900/30 text-purple-200'
                : 'bg-green-900/30 text-green-200'
            }`}>
              {job.jobType}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              job.status === 'Applied' ? 'bg-blue-900/30 text-blue-200' :
              job.status === 'Interview' ? 'bg-yellow-900/30 text-yellow-200' :
              job.status === 'Offer' ? 'bg-green-900/30 text-green-200' :
              'bg-gray-700 text-gray-300'
            }`}>
              {job.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/jobs')}
          className="text-gray-400 hover:text-white transition"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex border-b border-gray-700">
          {(['details', 'analysis', 'assets', 'interview'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-center font-medium transition capitalize ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'details' ? 'Details' : tab === 'analysis' ? 'AI Analysis' : tab === 'assets' ? 'Assets' : 'Interview'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.salaryMin && job.salaryMax && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Salary Range</h3>
                  <p className="text-gray-300">${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <FitAnalysis
                matchScore={job.aiAnalysis?.matchScore || 0}
                strengths={job.aiAnalysis?.strengthsSummary}
                gaps={job.aiAnalysis?.gapsSummary}
                highlights={job.aiAnalysis?.recommendedHighlights}
                skillGaps={job.aiAnalysis?.skillGapsAndIdeas}
                isLoading={runningAnalysis}
                onRunAnalysis={handleRunAnalysis}
              />

              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Generate Assets</h3>
                <div className="space-y-3">
                  <GenerateAsset
                    jobId={jobId}
                    assetType="Resume"
                    onGenerate={(content) => {
                      setNewAssetType('Resume');
                      setNewAssetContent(content);
                      setShowAssetForm(true);
                    }}
                    isLoading={runningAnalysis}
                  />
                  <GenerateAsset
                    jobId={jobId}
                    assetType="CoverLetter"
                    onGenerate={(content) => {
                      setNewAssetType('CoverLetter');
                      setNewAssetContent(content);
                      setShowAssetForm(true);
                    }}
                    isLoading={runningAnalysis}
                  />
                  <GenerateAsset
                    jobId={jobId}
                    assetType="Soq"
                    onGenerate={(content) => {
                      setNewAssetType('Soq');
                      setNewAssetContent(content);
                      setShowAssetForm(true);
                    }}
                    isLoading={runningAnalysis}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowAssetForm(!showAssetForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                {showAssetForm ? 'Cancel' : 'Add Asset'}
              </button>

              {showAssetForm && (
                <div className="bg-gray-700 p-4 rounded-lg space-y-4">
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value)}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Resume">Resume</option>
                    <option value="Soq">Statement of Qualifications</option>
                    <option value="CoverLetter">Cover Letter</option>
                    <option value="Notes">Notes</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Asset title"
                    value={newAssetTitle}
                    onChange={(e) => setNewAssetTitle(e.target.value)}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    placeholder="Asset content"
                    value={newAssetContent}
                    onChange={(e) => setNewAssetContent(e.target.value)}
                    rows={6}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddAsset}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Save Asset
                  </button>
                </div>
              )}

              {assets.length === 0 ? (
                <p className="text-gray-400">No assets yet</p>
              ) : (
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <div key={asset.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-white">{asset.title}</p>
                          <span className="text-xs text-gray-400">{asset.type}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-red-400 hover:text-red-300 text-sm transition"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-3">{asset.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerateQuestions('duty')}
                  disabled={runningAnalysis}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
                >
                  Generate Duty Questions
                </button>
                <button
                  onClick={() => handleGenerateQuestions('internet')}
                  disabled={runningAnalysis}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
                >
                  Generate Internet Questions
                </button>
              </div>

              {questions.length === 0 ? (
                <p className="text-gray-400">No interview questions yet</p>
              ) : (
                <div className="space-y-3">
                  {questions.map((question) => (
                    <div key={question.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-white font-medium">{question.questionText}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                              {question.category}
                            </span>
                            <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                              Difficulty: {question.difficulty}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {}}
                          className="text-blue-400 hover:text-blue-300 text-sm transition"
                        >
                          Link Story
                        </button>
                      </div>
                      {question.stories.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-xs text-gray-400 mb-2">Linked Stories:</p>
                          {question.stories.map((story) => (
                            <span key={story.storyId} className="inline-block text-xs bg-blue-900/30 text-blue-200 px-2 py-1 rounded mr-2 mb-2">
                              {story.storyTitle} {story.isPrimary && '(Primary)'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
