API REFERENCE - CAREER COCKPIT PLATFORM

Base URL: http://localhost:5000/api

AUTHENTICATION
All endpoints (except /public/*) require JWT Bearer token in Authorization header:
Authorization: Bearer <jwt_token>

PROFILE ENDPOINTS

Experiences
===========
GET /profile/experiences
Returns list of all user's experiences with linked skills.
Query Params: None
Response: List<ExperienceDto>
Status: 200

GET /profile/experiences/{id}
Returns single experience with all linked skills.
Params: id (int)
Response: ExperienceDto
Status: 200, 404

POST /profile/experiences
Creates new experience.
Body: ExperienceCreateUpdateDto {
  "title": "Senior Engineer",
  "organization": "TechCorp",
  "location": "San Francisco, CA",
  "startDate": "2020-01-01",
  "endDate": "2023-12-31",
  "isCurrent": false,
  "summary": "Led team of 5 engineers...",
  "bulletPoints": "- Designed new system\n- Mentored junior engineers",
  "technologies": "C#, Azure, SQL Server"
}
Response: ExperienceDto (with id, timestamps)
Status: 201

PUT /profile/experiences/{id}
Updates existing experience.
Params: id (int)
Body: ExperienceCreateUpdateDto
Response: None
Status: 204, 404

DELETE /profile/experiences/{id}
Deletes experience and all linked skills.
Params: id (int)
Response: None
Status: 204, 404

POST /profile/experiences/{id}/skills/{skillId}
Links skill to experience.
Params: id (int), skillId (int)
Response: None
Status: 204, 400 (already linked), 404

DELETE /profile/experiences/{id}/skills/{skillId}
Unlinks skill from experience.
Params: id (int), skillId (int)
Response: None
Status: 204, 404

Projects
========
GET /profile/projects
Returns all user's projects with skills.
Response: List<ProjectDto>
Status: 200

GET /profile/projects/{id}
Returns single project.
Response: ProjectDto
Status: 200, 404

POST /profile/projects
Creates new project.
Body: ProjectCreateUpdateDto {
  "name": "Job Portal",
  "role": "Lead Developer",
  "description": "Built job search platform...",
  "techStack": "React, .NET Core, PostgreSQL",
  "startDate": "2021-06-01",
  "endDate": "2021-12-31",
  "repositoryUrl": "https://github.com/...",
  "liveUrl": "https://..."
}
Response: ProjectDto
Status: 201

PUT /profile/projects/{id}
Updates project.
Response: None
Status: 204, 404

DELETE /profile/projects/{id}
Deletes project.
Response: None
Status: 204, 404

POST /profile/projects/{id}/skills/{skillId}
Links skill to project.
Response: None
Status: 204, 400, 404

DELETE /profile/projects/{id}/skills/{skillId}
Unlinks skill from project.
Response: None
Status: 204, 404

Skills
======
GET /profile/skills
Returns all user's skills (ordered by category, name).
Response: List<SkillDto>
Status: 200

POST /profile/skills
Creates new skill.
Body: SkillCreateUpdateDto {
  "name": "C#",
  "category": "language",
  "level": "advanced",
  "yearsOfExperience": 8
}
Category values: language, framework, cloud, database, tool, soft_skill, other
Level values: beginner, intermediate, advanced, expert
Response: SkillDto
Status: 201

PUT /profile/skills/{id}
Updates skill.
Body: SkillCreateUpdateDto
Response: None
Status: 204, 404

DELETE /profile/skills/{id}
Deletes skill (automatically unlinked from experiences/projects/stories).
Response: None
Status: 204, 404

Stories (STAR Format)
=====================
GET /profile/stories
Returns all user's STAR stories (ordered by last used date).
Response: List<StoryDto>
Status: 200

GET /profile/stories/{id}
Returns single story with linked skills.
Response: StoryDto
Status: 200, 404

POST /profile/stories
Creates new STAR story.
Body: StoryCreateUpdateDto {
  "situation": "Our team was struggling with code quality...",
  "task": "I was tasked with improving our QA process",
  "action": "I implemented automated testing and code reviews",
  "result": "Reduced bugs by 60%, faster releases",
  "linkedExperienceId": 1,
  "linkedProjectId": null,
  "tags": "Quality, Leadership, Process Improvement",
  "competency": "Quality Assurance Mindset",
  "primarySkills": "C#, Testing, Communication",
  "strengthRating": 5
}
Response: StoryDto
Status: 201

PUT /profile/stories/{id}
Updates story.
Body: StoryCreateUpdateDto
Response: None
Status: 204, 404

DELETE /profile/stories/{id}
Deletes story.
Response: None
Status: 204, 404

POST /profile/stories/{id}/skills/{skillId}
Links skill to story.
Response: None
Status: 204, 400, 404

DELETE /profile/stories/{id}/skills/{skillId}
Unlinks skill from story.
Response: None
Status: 204, 404

Resume Templates
================
GET /profile/templates
Returns all resume templates (default first, then by date).
Response: List<ResumeTemplateDto>
Status: 200

GET /profile/templates/{id}
Returns single template with full content.
Response: ResumeTemplateDto
Status: 200, 404

POST /profile/templates
Creates new resume template.
Body: ResumeTemplateCreateUpdateDto {
  "name": "Engineering Resume 2024",
  "content": "JOHN DOE\n...",
  "isDefault": true
}
Response: ResumeTemplateDto
Status: 201

PUT /profile/templates/{id}
Updates template. If isDefault=true, unsets default on other templates.
Body: ResumeTemplateCreateUpdateDto
Response: None
Status: 204, 404

DELETE /profile/templates/{id}
Deletes template.
Response: None
Status: 204, 404

JOBS ENDPOINTS

GET /jobs
Lists user's jobs with pagination and filtering.
Query Params:
  jobType: "State" | "Private" (optional)
  status: "Planned" | "Applied" | "Interview" | "Offer" | "Rejected" (optional)
  searchTerm: string (optional, searches title/company/summary)
  pageNumber: int (default 1)
  pageSize: int (default 20)
Response Headers:
  X-Total-Count: 45
  X-Page-Number: 1
  X-Page-Size: 20
Response: List<JobListItemDto> (with match score if analyzed)
Status: 200

Example: GET /jobs?jobType=Private&status=Interview&pageNumber=1&pageSize=10

GET /jobs/{id}
Returns job detail with analysis, assets, interview questions count.
Response: JobDetailDto {
  "id": 1,
  "title": "Senior Engineer",
  "jobType": "Private",
  "status": "Interview",
  "description": "...",
  "companyName": "TechCorp",
  "department": null,
  "classification": null,
  "salaryMin": 150000,
  "salaryMax": 200000,
  "aiAnalysis": { "matchScore": 78, "strengthsSummary": "...", ... },
  "assets": [ { "id": 1, "type": "Resume", "title": "...", "content": "..." } ],
  "interviewQuestionsCount": 5
}
Status: 200, 404

POST /jobs
Creates new job.
Body: JobCreateUpdateDto {
  "title": "Senior Engineer",
  "jobType": "Private",
  "status": "Planned",
  "description": "Senior software engineer role...",
  "companyName": "TechCorp",
  "department": null,
  "classification": null,
  "jcNumber": null,
  "examType": null,
  "soqRequired": false,
  "teamName": null,
  "jobBoard": null,
  "salaryMin": 150000,
  "salaryMax": 200000
}
JobType: "State" | "Private" (required)
Status: "Planned" | "Applied" | "Interview" | "Offer" | "Rejected"
Response: JobDetailDto
Status: 201

PUT /jobs/{id}
Updates job (cannot change JobType).
Body: JobCreateUpdateDto (only modifiable fields)
Response: None
Status: 204, 404

DELETE /jobs/{id}
Deletes job and all related data (cascade delete).
Response: None
Status: 204, 404

POST /jobs/{id}/parse
Parses job description and extracts structured data.
Body: { "jobDescription": "Full job posting text..." }
Response: None (sets ParsedSummary, KeyResponsibilities, ExtractedSkills)
Status: 204, 400, 404

JOB ANALYSIS ENDPOINTS

GET /jobs/{jobId}/analysis
Returns saved fit analysis (if exists).
Response: JobAiAnalysisDto {
  "id": 1,
  "matchScore": 78,
  "strengthsSummary": "Your experience in leadership aligns well with...",
  "gapsSummary": "You may want to highlight...",
  "recommendedHighlights": "- 8 years in management\n- Led teams of 20+",
  "skillGapsAndIdeas": "Consider emphasizing: Cloud architecture, DevOps"
}
Status: 200, 404

POST /jobs/{jobId}/analysis/run
Runs AI-powered fit analysis against user's profile.
Body: { "apiKey": "optional-override-key" }
Response: JobAiAnalysisDto
Status: 200, 400 (no job description), 404, 500 (analysis failed)

DELETE /jobs/{jobId}/analysis
Deletes saved analysis.
Response: None
Status: 204, 404

APPLICATION ASSETS ENDPOINTS

GET /jobs/{jobId}/assets
Returns all assets for job (resume, SOQ, cover letter, notes).
Response: List<ApplicationAssetDto>
Status: 200, 404

GET /jobs/{jobId}/assets/{assetId}
Returns single asset.
Response: ApplicationAssetDto {
  "id": 1,
  "type": "Resume",
  "title": "Tailored Resume for TechCorp",
  "content": "Full resume text...",
  "createdAt": "2024-12-09T10:30:00Z",
  "updatedAt": "2024-12-09T10:30:00Z"
}
Status: 200, 404

POST /jobs/{jobId}/assets
Creates new asset.
Body: ApplicationAssetCreateUpdateDto {
  "type": "Resume",
  "title": "Tailored Resume",
  "content": "..."
}
Type values: "Resume" | "Soq" | "CoverLetter" | "Notes"
Response: ApplicationAssetDto
Status: 201, 404

PUT /jobs/{jobId}/assets/{assetId}
Updates asset content/title.
Body: ApplicationAssetCreateUpdateDto
Response: None
Status: 204, 404

DELETE /jobs/{jobId}/assets/{assetId}
Deletes asset.
Response: None
Status: 204, 404

POST /jobs/{jobId}/assets/{assetId}/generate
AI-generates asset content (tailored for specific job).
Body: {
  "templateContent": "Optional resume template to use as base",
  "extraInstructions": "Emphasize leadership experience",
  "apiKey": "optional-override-key"
}
Response: ApplicationAssetDto (with AI-generated content)
Status: 200, 400 (no job description), 404, 500

INTERVIEW PREP ENDPOINTS

GET /jobs/{jobId}/interview-prep/questions
Returns all interview questions for job (ordered by index).
Response: List<InterviewQuestionDto> {
  "id": 1,
  "questionText": "Tell us about your leadership experience",
  "category": "Behavioral",
  "sourceType": "DutyStatement",
  "difficulty": 4,
  "needsPractice": false,
  "orderIndex": 0,
  "stories": [
    { "storyId": 5, "storyTitle": "Team Leadership", "isPrimary": true }
  ]
}
Status: 200, 404

GET /jobs/{jobId}/interview-prep/questions/{questionId}
Returns single question with all story options.
Response: InterviewQuestionDto
Status: 200, 404

POST /jobs/{jobId}/interview-prep/questions
Manually creates interview question.
Body: CreateInterviewQuestionRequest {
  "questionText": "Tell us about your leadership experience",
  "category": "Behavioral",
  "sourceType": "DutyStatement",
  "difficulty": 3,
  "needsPractice": false,
  "orderIndex": 0
}
Category: "Behavioral" | "Technical" | "Mixed"
SourceType: "DutyStatement" | "Internet"
Response: InterviewQuestionDto
Status: 201, 404

PUT /jobs/{jobId}/interview-prep/questions/{questionId}
Updates question.
Body: InterviewQuestionUpdateDto {
  "questionText": "...",
  "difficulty": 4,
  "needsPractice": true,
  "orderIndex": 0
}
Response: None
Status: 204, 404

DELETE /jobs/{jobId}/interview-prep/questions/{questionId}
Deletes question.
Response: None
Status: 204, 404

POST /jobs/{jobId}/interview-prep/questions/{questionId}/stories/{storyId}
Links story to question (multiple stories allowed, one can be primary).
Body: { "isPrimary": true }
Response: None
Status: 204, 400 (already linked), 404

DELETE /jobs/{jobId}/interview-prep/questions/{questionId}/stories/{storyId}
Unlinks story from question.
Response: None
Status: 204, 404

POST /jobs/{jobId}/interview-prep/generate-duty-statements
AI-generates questions based on job duties.
Body: { "apiKey": "optional-override-key" }
Response: GeneratedQuestionsResult {
  "questions": [ { /* InterviewQuestionDto */ } ],
  "count": 5
}
Status: 200, 400 (no job description), 404, 500

POST /jobs/{jobId}/interview-prep/generate-internet-patterns
AI-generates common questions for this job type.
Body: { "apiKey": "optional-override-key" }
Response: GeneratedQuestionsResult
Status: 200, 400, 404, 500

SHARE ENDPOINTS

POST /share/job/{jobId}
Creates public share link for job (with analysis, assets).
Params: jobId (int)
Body: { "expiresInDays": 30 }
Response: SharedLinkDto {
  "token": "a1b2c3d4e5f6g7h8",
  "type": "job_packet",
  "jobId": 1,
  "isActive": true,
  "createdAt": "2024-12-09T10:30:00Z",
  "expiresAt": "2025-01-08T10:30:00Z",
  "url": "/public/job/a1b2c3d4e5f6g7h8"
}
Status: 200, 404

POST /share/profile
Creates public share link for entire profile.
Body: { "expiresInDays": 30 }
Response: SharedLinkDto {
  "token": "x1y2z3...",
  "type": "profile",
  "isActive": true,
  "url": "/public/profile/x1y2z3..."
}
Status: 200

GET /share/links
Returns all share links created by user.
Response: List<SharedLinkDto>
Status: 200

PUT /share/links/{token}
Enables/disables share link (keeps token, revokes access).
Params: token (string)
Body: { "isActive": false }
Response: None
Status: 204, 404

DELETE /share/links/{token}
Deletes share link permanently.
Params: token (string)
Response: None
Status: 204, 404

PUBLIC ENDPOINTS (No Authentication)

GET /share/public/job/{token}
Returns public job packet (analysis, assets, basic info).
Params: token (string)
Response: {
  "id": 1,
  "title": "Senior Engineer",
  "jobType": "Private",
  "description": "...",
  "companyName": "TechCorp",
  "analysis": { "matchScore": 78, "strengthsSummary": "..." },
  "assets": [ { "type": "Resume", "content": "..." } ],
  "sharedAt": "2024-12-09T10:30:00Z",
  "expiresAt": "2025-01-08T10:30:00Z"
}
Status: 200, 404, 410 (expired)

GET /share/public/profile/{token}
Returns public profile (experiences, projects, skills).
Params: token (string)
Response: {
  "user": { "name": "John Doe", "email": "john@example.com" },
  "experiences": [
    { "title": "...", "organization": "...", "skills": ["C#", "Azure"] }
  ],
  "projects": [...],
  "skills": [...]
}
Status: 200, 404, 410

SETTINGS ENDPOINTS

GET /settings/profile
Returns user profile settings.
Response: UserSettingsDto {
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-12-09T10:30:00Z"
}
Status: 200

PUT /settings/profile
Updates user profile.
Body: { "name": "John Smith" }
Response: None
Status: 204

GET /settings/ai-settings
Returns AI configuration options.
Response: AiSettingsDto {
  "userId": 1,
  "apiKeyConfigured": false,
  "message": "AI API keys are managed client-side...",
  "supportedProviders": ["OpenAI", "Claude", "Google Gemini", "Local (Ollama)"]
}
Status: 200

GET /settings/stats
Returns user statistics.
Response: UserStatsDto {
  "jobsCount": 15,
  "jobsByStatus": { "Applied": 5, "Interview": 3, "Planned": 7 },
  "experiencesCount": 5,
  "projectsCount": 8,
  "skillsCount": 42,
  "storiesCount": 12,
  "interviewQuestionsCount": 28,
  "templatesCount": 3
}
Status: 200

DELETE /settings/account
Deletes user account and all associated data (cascade delete).
Response: None
Status: 204

ERROR RESPONSES

Common Error Codes:
- 400: Invalid request (bad data, missing fields, enum parse failed)
- 401: Unauthorized (no token or invalid token)
- 404: Resource not found
- 410: Gone (share link expired)
- 500: Server error (AI service failed, database error)

Error Response Format:
{
  "error": "Analysis failed",
  "message": "API key is invalid"
}

TESTING EXAMPLES

1. Create Experience and Link Skill:
POST /api/profile/experiences
{
  "title": "Senior Developer",
  "organization": "TechCorp",
  "location": "San Francisco",
  "startDate": "2020-01-01",
  "endDate": "2023-12-31",
  "isCurrent": false,
  "summary": "Led engineering team",
  "bulletPoints": "- Managed 5 engineers\n- Designed system architecture",
  "technologies": "C#, Azure, SQL"
}
→ Returns ExperienceDto with id=1

POST /api/profile/skills
{
  "name": "C#",
  "category": "language",
  "level": "advanced",
  "yearsOfExperience": 8
}
→ Returns SkillDto with id=1

POST /api/profile/experiences/1/skills/1
→ Links skill to experience

2. Create Job and Run Analysis:
POST /api/jobs
{
  "title": "Senior Engineer",
  "jobType": "Private",
  "status": "Planned",
  "description": "Full job posting text...",
  "companyName": "NewTech",
  "salaryMin": 150000,
  "salaryMax": 200000
}
→ Returns JobDetailDto with id=2

POST /api/jobs/2/analysis/run
{ "apiKey": null }
→ Runs DummyAiService, returns JobAiAnalysisDto

3. Generate Interview Questions:
POST /api/jobs/2/interview-prep/generate-duty-statements
{ "apiKey": null }
→ Creates 4-5 Behavioral questions from job description

POST /api/profile/stories
{
  "situation": "...",
  "task": "...",
  "action": "...",
  "result": "...",
  "competency": "Leadership"
}
→ Returns StoryDto with id=1

POST /api/jobs/2/interview-prep/questions/1/stories/1
{ "isPrimary": true }
→ Links story to question as primary

4. Create Share Link:
POST /api/share/job/2
{ "expiresInDays": 30 }
→ Returns token: "abc123xyz456"

GET /api/share/public/job/abc123xyz456
→ Returns public job packet (no auth required)

RESPONSE TIME EXPECTATIONS
- Simple reads (GET single/list): 50-100ms
- Create/Update operations: 100-200ms
- AI operations (analysis, generation): 800ms-2s (DummyAiService adds simulated delays)
- File downloads: Depends on content size
