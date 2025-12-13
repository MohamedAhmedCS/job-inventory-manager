import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5132/api';

// Public axios instance for unauthenticated endpoints
const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

// Interfaces for Career Cockpit API

export interface Skill {
  id: number;
  name: string;
  category: string;
  level: string;
  yearsOfExperience: number;
}

export interface Experience {
  id: number;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  summary: string;
  bulletPoints: string;
  technologies: string;
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  role: string;
  description: string;
  techStack: string;
  startDate: string;
  endDate: string | null;
  repositoryUrl: string;
  liveUrl: string;
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: number;
  situation: string;
  task: string;
  action: string;
  result: string;
  linkedExperienceId: number | null;
  linkedProjectId: number | null;
  tags: string;
  competency: string;
  primarySkills: string;
  strengthRating: number;
  usageCount: number;
  lastUsedDate: string | null;
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeTemplate {
  id: number;
  name: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: number;
  title: string;
  jobType: 'State' | 'Private' | 'Federal';
  status: 'Saved' | 'Planned' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
  description: string;
  postingUrl: string;
  companyName: string;
  department: string | null;
  classification: string | null;
  jcNumber: string | null;
  examType: string | null;
  soqRequired: boolean;
  teamName: string | null;
  jobBoard: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  parsedSummary: string | null;
  keyResponsibilities: string | null;
  extractedSkills: string | null;
  ksaPatterns: string | null;
  createdAt: string;
  updatedAt: string;
  aiAnalysis: JobAiAnalysis | null;
  assets: ApplicationAsset[];
  interviewQuestionsCount: number;
}

export interface JobAiAnalysis {
  id: number;
  matchScore: number;
  strengthsSummary: string;
  gapsSummary: string;
  recommendedHighlights: string;
  skillGapsAndIdeas: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationAsset {
  id: number;
  type: 'Resume' | 'Soq' | 'CoverLetter' | 'Notes';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: number;
  questionText: string;
  category: string;
  sourceType: string;
  difficulty: number;
  needsPractice: boolean;
  orderIndex: number;
  stories: Array<{ storyId: number; storyTitle: string; isPrimary: boolean }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  jobsCount: number;
  jobsByStatus: Record<string, number>;
  experiencesCount: number;
  projectsCount: number;
  skillsCount: number;
  storiesCount: number;
  interviewQuestionsCount: number;
  templatesCount: number;
}

export interface SharedLink {
  token: string;
  type: string;
  jobId: number | null;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
  url: string;
}

// API Service Class
class CareerCockpitService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // EXPERIENCES
  async getExperiences(): Promise<Experience[]> {
    const response = await this.api.get('/profile/experiences');
    return response.data;
  }

  async getExperience(id: number): Promise<Experience> {
    const response = await this.api.get(`/profile/experiences/${id}`);
    return response.data;
  }

  async createExperience(experience: Partial<Experience>): Promise<Experience> {
    const response = await this.api.post('/profile/experiences', experience);
    return response.data;
  }

  async updateExperience(id: number, experience: Partial<Experience>): Promise<void> {
    await this.api.put(`/profile/experiences/${id}`, experience);
  }

  async deleteExperience(id: number): Promise<void> {
    await this.api.delete(`/profile/experiences/${id}`);
  }

  async addSkillToExperience(experienceId: number, skillId: number): Promise<void> {
    await this.api.post(`/profile/experiences/${experienceId}/skills/${skillId}`);
  }

  async removeSkillFromExperience(experienceId: number, skillId: number): Promise<void> {
    await this.api.delete(`/profile/experiences/${experienceId}/skills/${skillId}`);
  }

  // PROJECTS
  async getProjects(): Promise<Project[]> {
    const response = await this.api.get('/profile/projects');
    return response.data;
  }

  async getProject(id: number): Promise<Project> {
    const response = await this.api.get(`/profile/projects/${id}`);
    return response.data;
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    const response = await this.api.post('/profile/projects', project);
    return response.data;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<void> {
    await this.api.put(`/profile/projects/${id}`, project);
  }

  async deleteProject(id: number): Promise<void> {
    await this.api.delete(`/profile/projects/${id}`);
  }

  async addSkillToProject(projectId: number, skillId: number): Promise<void> {
    await this.api.post(`/profile/projects/${projectId}/skills/${skillId}`);
  }

  async removeSkillFromProject(projectId: number, skillId: number): Promise<void> {
    await this.api.delete(`/profile/projects/${projectId}/skills/${skillId}`);
  }

  // SKILLS
  async getSkills(): Promise<Skill[]> {
    const response = await this.api.get('/profile/skills');
    return response.data;
  }

  async createSkill(skill: Partial<Skill>): Promise<Skill> {
    const response = await this.api.post('/profile/skills', skill);
    return response.data;
  }

  async updateSkill(id: number, skill: Partial<Skill>): Promise<void> {
    await this.api.put(`/profile/skills/${id}`, skill);
  }

  async deleteSkill(id: number): Promise<void> {
    await this.api.delete(`/profile/skills/${id}`);
  }

  // STORIES
  async getStories(): Promise<Story[]> {
    const response = await this.api.get('/profile/stories');
    return response.data;
  }

  async getStory(id: number): Promise<Story> {
    const response = await this.api.get(`/profile/stories/${id}`);
    return response.data;
  }

  async createStory(story: Partial<Story>): Promise<Story> {
    const response = await this.api.post('/profile/stories', story);
    return response.data;
  }

  async updateStory(id: number, story: Partial<Story>): Promise<void> {
    await this.api.put(`/profile/stories/${id}`, story);
  }

  async deleteStory(id: number): Promise<void> {
    await this.api.delete(`/profile/stories/${id}`);
  }

  async addSkillToStory(storyId: number, skillId: number): Promise<void> {
    await this.api.post(`/profile/stories/${storyId}/skills/${skillId}`);
  }

  async removeSkillFromStory(storyId: number, skillId: number): Promise<void> {
    await this.api.delete(`/profile/stories/${storyId}/skills/${skillId}`);
  }

  // RESUME TEMPLATES
  async getResumeTemplates(): Promise<ResumeTemplate[]> {
    const response = await this.api.get('/profile/templates');
    return response.data;
  }

  async getResumeTemplate(id: number): Promise<ResumeTemplate> {
    const response = await this.api.get(`/profile/templates/${id}`);
    return response.data;
  }

  async createResumeTemplate(template: Partial<ResumeTemplate>): Promise<ResumeTemplate> {
    const response = await this.api.post('/profile/templates', template);
    return response.data;
  }

  async updateResumeTemplate(id: number, template: Partial<ResumeTemplate>): Promise<void> {
    await this.api.put(`/profile/templates/${id}`, template);
  }

  async deleteResumeTemplate(id: number): Promise<void> {
    await this.api.delete(`/profile/templates/${id}`);
  }

  // JOBS
  async getJobs(params?: { jobType?: string; status?: string; searchTerm?: string; pageNumber?: number; pageSize?: number }): Promise<{ data: Job[]; headers: Record<string, string> }> {
    const response = await this.api.get('/jobs', { params });
    return {
      data: response.data,
      headers: response.headers as Record<string, string>,
    };
  }

  async getJob(id: number): Promise<Job> {
    const response = await this.api.get(`/jobs/${id}`);
    return response.data;
  }

  async createJob(job: Partial<Job>): Promise<Job> {
    const response = await this.api.post('/jobs', job);
    return response.data;
  }

  async updateJob(id: number, job: Partial<Job>): Promise<void> {
    await this.api.put(`/jobs/${id}`, job);
  }

  async deleteJob(id: number): Promise<void> {
    await this.api.delete(`/jobs/${id}`);
  }

  // JOB ANALYSIS
  async getJobAnalysis(jobId: number): Promise<JobAiAnalysis> {
    const response = await this.api.get(`/jobs/${jobId}/analysis`);
    return response.data;
  }

  async runJobAnalysis(jobId: number, apiKey?: string): Promise<JobAiAnalysis> {
    const response = await this.api.post(`/jobs/${jobId}/analysis/run`, { apiKey });
    return response.data;
  }

  async deleteJobAnalysis(jobId: number): Promise<void> {
    await this.api.delete(`/jobs/${jobId}/analysis`);
  }

  // APPLICATION ASSETS
  async getJobAssets(jobId: number): Promise<ApplicationAsset[]> {
    const response = await this.api.get(`/jobs/${jobId}/assets`);
    return response.data;
  }

  async getJobAsset(jobId: number, assetId: number): Promise<ApplicationAsset> {
    const response = await this.api.get(`/jobs/${jobId}/assets/${assetId}`);
    return response.data;
  }

  async createJobAsset(jobId: number, asset: Partial<ApplicationAsset>): Promise<ApplicationAsset> {
    const response = await this.api.post(`/jobs/${jobId}/assets`, asset);
    return response.data;
  }

  async updateJobAsset(jobId: number, assetId: number, asset: Partial<ApplicationAsset>): Promise<void> {
    await this.api.put(`/jobs/${jobId}/assets/${assetId}`, asset);
  }

  async deleteJobAsset(jobId: number, assetId: number): Promise<void> {
    await this.api.delete(`/jobs/${jobId}/assets/${assetId}`);
  }

  async generateJobAsset(jobId: number, assetId: number, params?: { templateContent?: string; extraInstructions?: string; apiKey?: string }): Promise<ApplicationAsset> {
    const response = await this.api.post(`/jobs/${jobId}/assets/${assetId}/generate`, params);
    return response.data;
  }

  // INTERVIEW PREP
  async getInterviewQuestions(jobId: number): Promise<InterviewQuestion[]> {
    const response = await this.api.get(`/jobs/${jobId}/interview-prep/questions`);
    return response.data;
  }

  async getInterviewQuestion(jobId: number, questionId: number): Promise<InterviewQuestion> {
    const response = await this.api.get(`/jobs/${jobId}/interview-prep/questions/${questionId}`);
    return response.data;
  }

  async createInterviewQuestion(jobId: number, question: Partial<InterviewQuestion>): Promise<InterviewQuestion> {
    const response = await this.api.post(`/jobs/${jobId}/interview-prep/questions`, question);
    return response.data;
  }

  async updateInterviewQuestion(jobId: number, questionId: number, question: Partial<InterviewQuestion>): Promise<void> {
    await this.api.put(`/jobs/${jobId}/interview-prep/questions/${questionId}`, question);
  }

  async deleteInterviewQuestion(jobId: number, questionId: number): Promise<void> {
    await this.api.delete(`/jobs/${jobId}/interview-prep/questions/${questionId}`);
  }

  async linkStoryToQuestion(jobId: number, questionId: number, storyId: number, isPrimary: boolean = false): Promise<void> {
    await this.api.post(`/jobs/${jobId}/interview-prep/questions/${questionId}/stories/${storyId}`, { isPrimary });
  }

  async unlinkStoryFromQuestion(jobId: number, questionId: number, storyId: number): Promise<void> {
    await this.api.delete(`/jobs/${jobId}/interview-prep/questions/${questionId}/stories/${storyId}`);
  }

  async generateDutyStatementQuestions(jobId: number, apiKey?: string): Promise<{ questions: InterviewQuestion[]; count: number }> {
    const response = await this.api.post(`/jobs/${jobId}/interview-prep/generate-duty-statements`, { apiKey });
    return response.data;
  }

  async generateInternetPatternQuestions(jobId: number, apiKey?: string): Promise<{ questions: InterviewQuestion[]; count: number }> {
    const response = await this.api.post(`/jobs/${jobId}/interview-prep/generate-internet-patterns`, { apiKey });
    return response.data;
  }

  // SHARING
  async createJobShareLink(jobId: number, expiresInDays?: number): Promise<SharedLink> {
    const response = await this.api.post(`/share/job/${jobId}`, { expiresInDays });
    return response.data;
  }

  async createProfileShareLink(expiresInDays?: number): Promise<SharedLink> {
    const response = await this.api.post('/share/profile', { expiresInDays });
    return response.data;
  }

  async getShareLinks(): Promise<SharedLink[]> {
    const response = await this.api.get('/share/links');
    return response.data;
  }

  async updateShareLink(token: string, isActive: boolean): Promise<void> {
    await this.api.put(`/share/links/${token}`, { isActive });
  }

  async deleteShareLink(token: string): Promise<void> {
    await this.api.delete(`/share/links/${token}`);
  }

  async getPublicJobPacket(token: string): Promise<Job> {
    const response = await publicApi.get(`/share/public/job/${token}`);
    return response.data;
  }

  // SETTINGS
  async getUserStats(): Promise<UserStats> {
    const response = await this.api.get('/settings/stats');
    return response.data;
  }

  async updateProfile(name: string): Promise<void> {
    await this.api.put('/settings/profile', { name });
  }

  async updateSettings(settings: Record<string, unknown>): Promise<void> {
    await this.api.put('/settings', settings);
  }

  async deleteAccount(): Promise<void> {
    await this.api.delete('/settings/account');
  }
}

const jobService = new CareerCockpitService();
export default jobService;
