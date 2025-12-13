# API Reference - Career Cockpit

**Base URL:** `http://localhost:5132/api`

**Authentication:** Bearer Token (JWT)

---

## Authentication

### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "johndoe",
  "name": "John Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error:** `401 Unauthorized`
```json
{
  "error": "Invalid username or password"
}
```

---

## Jobs

### List Jobs

```http
GET /api/jobs
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| pageSize | int | 10 | Items per page (max 100) |
| search | string | - | Search in title, company, description |
| status | string | - | Filter by status (Planned, Applied, Interview, Offer, Rejected) |
| jobType | string | - | Filter by type (State, Private) |
| sortBy | string | createdAt | Sort field |
| sortOrder | string | desc | Sort order (asc, desc) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "title": "Software Engineer",
      "companyName": "Tech Corp",
      "department": "Engineering",
      "jobType": "Private",
      "status": "Applied",
      "description": "We are looking for...",
      "salaryMin": 100000,
      "salaryMax": 150000,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z",
      "aiAnalysis": {
        "matchScore": 85,
        "strengthsSummary": "Strong technical background...",
        "gapsSummary": "Could improve on...",
        "recommendedHighlights": "Leadership experience..."
      },
      "interviewQuestionsCount": 5
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

---

### Get Job Details

```http
GET /api/jobs/{id}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Software Engineer",
  "companyName": "Tech Corp",
  "department": "Engineering",
  "classification": "Senior",
  "jcNumber": "JC-12345",
  "examType": "Open",
  "jobType": "State",
  "status": "Interview",
  "description": "Full job description...",
  "soqRequired": true,
  "teamName": "Platform Team",
  "jobBoard": "CalCareers",
  "salaryMin": 100000,
  "salaryMax": 150000,
  "parsedSummary": "AI-generated summary...",
  "keyResponsibilities": "• Lead development\n• Code review",
  "extractedSkills": "Python, React, AWS",
  "ksaPatterns": "Problem solving, Leadership",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z",
  "aiAnalysis": {
    "id": 1,
    "jobId": 1,
    "matchScore": 85,
    "strengthsSummary": "Strong technical skills...",
    "gapsSummary": "Limited cloud experience...",
    "skillGapsAndIdeas": "Consider AWS certification...",
    "recommendedHighlights": "Leadership projects...",
    "analyzedAt": "2025-01-15T11:00:00Z"
  },
  "assets": [
    {
      "id": 1,
      "type": "Resume",
      "title": "Tailored Resume v1",
      "content": "Resume content...",
      "createdAt": "2025-01-15T12:00:00Z"
    }
  ],
  "interviewQuestionsCount": 5
}
```

---

### Create Job

```http
POST /api/jobs
```

**Request Body:**
```json
{
  "title": "Software Engineer",
  "companyName": "Tech Corp",
  "department": "Engineering",
  "classification": "Senior",
  "jcNumber": "JC-12345",
  "examType": "Open",
  "jobType": "State",
  "status": "Planned",
  "description": "We are looking for an experienced software engineer...",
  "soqRequired": true,
  "teamName": "Platform Team",
  "jobBoard": "CalCareers",
  "salaryMin": 100000,
  "salaryMax": 150000
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "Software Engineer",
  ...
}
```

---

### Update Job

```http
PUT /api/jobs/{id}
```

**Request Body:** Same as Create Job

**Response:** `200 OK`

---

### Delete Job

```http
DELETE /api/jobs/{id}
```

**Response:** `204 No Content`

---

### Update Job Status

```http
PATCH /api/jobs/{id}/status
```

**Request Body:**
```json
{
  "status": "Interview"
}
```

**Valid Status Values:** `Planned`, `Applied`, `Interview`, `Offer`, `Rejected`

**Response:** `200 OK`

---

## Job Analysis (AI)

### Run Job Fit Analysis

```http
POST /api/job-analysis/{jobId}/analyze
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "jobId": 1,
  "matchScore": 85,
  "strengthsSummary": "Your experience in Python and React aligns well with the requirements...",
  "gapsSummary": "The role requires AWS experience which is not prominently featured...",
  "skillGapsAndIdeas": "Consider highlighting any cloud projects or obtaining AWS certification...",
  "recommendedHighlights": "• Led team of 5 developers\n• Reduced deployment time by 40%",
  "analyzedAt": "2025-01-15T11:00:00Z"
}
```

---

### Generate Resume

```http
POST /api/job-analysis/{jobId}/generate-resume
```

**Response:** `200 OK`
```json
{
  "content": "JOHN DOE\nSoftware Engineer\n\nPROFESSIONAL SUMMARY\n...",
  "format": "text",
  "generatedAt": "2025-01-15T12:00:00Z"
}
```

---

### Generate Cover Letter

```http
POST /api/job-analysis/{jobId}/generate-cover-letter
```

**Response:** `200 OK`
```json
{
  "content": "Dear Hiring Manager,\n\nI am writing to express my interest...",
  "format": "text",
  "generatedAt": "2025-01-15T12:00:00Z"
}
```

---

### Generate SOQ (Statement of Qualifications)

```http
POST /api/job-analysis/{jobId}/generate-soq
```

**Response:** `200 OK`
```json
{
  "content": "STATEMENT OF QUALIFICATIONS\n\nQuestion 1: Describe your experience...",
  "format": "text",
  "generatedAt": "2025-01-15T12:00:00Z"
}
```

---

## Application Assets

### List Assets for Job

```http
GET /api/assets/job/{jobId}
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "jobId": 1,
    "type": "Resume",
    "title": "Tailored Resume v1",
    "content": "Resume content...",
    "createdAt": "2025-01-15T12:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z"
  },
  {
    "id": 2,
    "jobId": 1,
    "type": "CoverLetter",
    "title": "Cover Letter",
    "content": "Dear Hiring Manager...",
    "createdAt": "2025-01-15T12:30:00Z",
    "updatedAt": "2025-01-15T12:30:00Z"
  }
]
```

---

### Create Asset

```http
POST /api/assets
```

**Request Body:**
```json
{
  "jobId": 1,
  "type": "Resume",
  "title": "Tailored Resume v1",
  "content": "Resume content..."
}
```

**Valid Types:** `Resume`, `CoverLetter`, `Soq`, `Notes`, `Other`

**Response:** `201 Created`

---

### Update Asset

```http
PUT /api/assets/{id}
```

**Request Body:**
```json
{
  "title": "Tailored Resume v2",
  "content": "Updated resume content..."
}
```

**Response:** `200 OK`

---

### Delete Asset

```http
DELETE /api/assets/{id}
```

**Response:** `204 No Content`

---

## Interview Prep

### Get Interview Questions for Job

```http
GET /api/interview-prep/job/{jobId}/questions
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "jobId": 1,
    "question": "Tell me about a time you led a team through a difficult project",
    "category": "Leadership",
    "source": "AI Generated",
    "suggestedAnswer": "Use STAR method...",
    "linkedStories": [
      {
        "id": 1,
        "situation": "When I was leading the platform team...",
        "task": "We needed to migrate to microservices...",
        "action": "I organized the team into squads...",
        "result": "We completed the migration 2 weeks early..."
      }
    ],
    "createdAt": "2025-01-15T13:00:00Z"
  }
]
```

---

### Generate Interview Questions

```http
POST /api/interview-prep/job/{jobId}/generate
```

**Request Body:**
```json
{
  "count": 10,
  "categories": ["Technical", "Behavioral", "Leadership"]
}
```

**Response:** `200 OK`
```json
{
  "questions": [
    {
      "id": 1,
      "question": "Describe your experience with distributed systems",
      "category": "Technical",
      "source": "AI Generated"
    }
  ],
  "generatedCount": 10
}
```

---

### Link Story to Question

```http
POST /api/interview-prep/questions/{questionId}/stories/{storyId}
```

**Response:** `200 OK`

---

## Profile

### Get Profile

```http
GET /api/profile
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "headline": "Senior Software Engineer",
  "summary": "10+ years of experience...",
  "experiences": [
    {
      "id": 1,
      "title": "Senior Software Engineer",
      "organization": "Tech Corp",
      "location": "San Francisco, CA",
      "startDate": "2020-01-01",
      "endDate": null,
      "isCurrent": true,
      "summary": "Lead development of core platform...",
      "bulletPoints": "• Led team of 5\n• Improved performance by 40%",
      "technologies": "Python, React, AWS",
      "skills": [
        { "id": 1, "name": "Python", "category": "Programming", "level": "Expert", "yearsOfExperience": 8 }
      ]
    }
  ],
  "projects": [...],
  "skills": [...],
  "stories": [...],
  "resumeTemplates": [...]
}
```

---

### Update Profile

```http
PUT /api/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "headline": "Senior Software Engineer",
  "summary": "Updated summary..."
}
```

**Response:** `200 OK`

---

### Add Experience

```http
POST /api/profile/experiences
```

**Request Body:**
```json
{
  "title": "Software Engineer",
  "organization": "Startup Inc",
  "location": "Remote",
  "startDate": "2018-06-01",
  "endDate": "2019-12-31",
  "isCurrent": false,
  "summary": "Built core features...",
  "bulletPoints": "• Feature 1\n• Feature 2",
  "technologies": "Node.js, MongoDB"
}
```

**Response:** `201 Created`

---

### Update Experience

```http
PUT /api/profile/experiences/{id}
```

**Response:** `200 OK`

---

### Delete Experience

```http
DELETE /api/profile/experiences/{id}
```

**Response:** `204 No Content`

---

### Add Project

```http
POST /api/profile/projects
```

**Request Body:**
```json
{
  "name": "Open Source Library",
  "role": "Creator",
  "description": "A utility library for...",
  "techStack": "TypeScript, Jest",
  "startDate": "2021-01-01",
  "endDate": null,
  "repositoryUrl": "https://github.com/...",
  "liveUrl": "https://..."
}
```

**Response:** `201 Created`

---

### Add Skill

```http
POST /api/profile/skills
```

**Request Body:**
```json
{
  "name": "Python",
  "category": "Programming",
  "level": "Expert",
  "yearsOfExperience": 8
}
```

**Valid Categories:** `Programming`, `Framework`, `Database`, `Cloud`, `Tools`, `Soft Skills`

**Valid Levels:** `Beginner`, `Intermediate`, `Advanced`, `Expert`

**Response:** `201 Created`

---

### Add Story (STAR Format)

```http
POST /api/profile/stories
```

**Request Body:**
```json
{
  "situation": "When I joined the team, deployments took 4 hours...",
  "task": "I was asked to improve the deployment pipeline...",
  "action": "I implemented CI/CD with GitHub Actions...",
  "result": "Reduced deployment time to 15 minutes, 94% improvement...",
  "tags": "DevOps, Leadership, Process Improvement",
  "competency": "Technical Leadership",
  "primarySkills": "CI/CD, GitHub Actions, Docker",
  "strengthRating": 5
}
```

**Response:** `201 Created`

---

## Sharing

### Create Job Share Link

```http
POST /api/share/job/{jobId}
```

**Request Body:**
```json
{
  "expiresInDays": 30
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "token": "abc123xyz789",
  "type": "job_packet",
  "url": "/public/job/abc123xyz789",
  "isActive": true,
  "createdAt": "2025-01-15T14:00:00Z",
  "expiresAt": "2025-02-14T14:00:00Z"
}
```

---

### Create Profile Share Link

```http
POST /api/share/profile
```

**Request Body:**
```json
{
  "expiresInDays": 90
}
```

**Response:** `201 Created`

---

### Get My Share Links

```http
GET /api/share/links
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "token": "abc123xyz789",
    "type": "job_packet",
    "jobId": 1,
    "isActive": true,
    "url": "/public/job/abc123xyz789",
    "createdAt": "2025-01-15T14:00:00Z",
    "expiresAt": "2025-02-14T14:00:00Z"
  }
]
```

---

### Update Share Link

```http
PUT /api/share/links/{token}
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:** `200 OK`

---

### Delete Share Link

```http
DELETE /api/share/links/{token}
```

**Response:** `204 No Content`

---

### Get Public Job Packet (No Auth Required)

```http
GET /api/share/public/job/{token}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Software Engineer",
  "companyName": "Tech Corp",
  "description": "Job description...",
  "aiAnalysis": {
    "matchScore": 85,
    "strengthsSummary": "..."
  },
  "assets": [...]
}
```

**Error:** `404 Not Found` (if expired or invalid)

---

### Get Public Profile (No Auth Required)

```http
GET /api/share/public/profile/{token}
```

**Response:** `200 OK`
```json
{
  "name": "John Doe",
  "headline": "Senior Software Engineer",
  "experiences": [...],
  "projects": [...],
  "skills": [...]
}
```

---

## Settings

### Get User Stats

```http
GET /api/settings/stats
```

**Response:** `200 OK`
```json
{
  "totalJobs": 25,
  "appliedCount": 15,
  "interviewCount": 5,
  "offerCount": 2,
  "rejectedCount": 3,
  "averageMatchScore": 72,
  "topSkills": ["Python", "React", "AWS"],
  "applicationsByMonth": {
    "2025-01": 8,
    "2024-12": 10,
    "2024-11": 7
  }
}
```

---

### Update Profile Settings

```http
PUT /api/settings/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:** `200 OK`

---

### Change Password

```http
PUT /api/settings/password
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:** `200 OK`

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "salaryMin": "Must be a positive number"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Job not found"
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

### 500 Internal Server Error

```json
{
  "error": "An unexpected error occurred",
  "requestId": "abc-123-xyz"
}
```

---

## Rate Limiting

| Endpoint Category | Limit |
|-------------------|-------|
| Authentication | 5 requests/minute |
| AI Generation | 10 requests/minute |
| Other Endpoints | 100 requests/minute |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Webhooks (Future)

Webhook support is planned for:
- Job status changes
- New AI analysis complete
- Share link accessed

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5132/api',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get jobs
const { data } = await api.get('/jobs', {
  params: { page: 1, pageSize: 10, status: 'Applied' }
});

// Create job
const newJob = await api.post('/jobs', {
  title: 'Software Engineer',
  companyName: 'Tech Corp',
  description: '...'
});

// Run AI analysis
const analysis = await api.post(`/job-analysis/${jobId}/analyze`);
```

### Python

```python
import requests

BASE_URL = 'http://localhost:5132/api'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Get jobs
response = requests.get(f'{BASE_URL}/jobs', headers=headers, params={
    'page': 1,
    'pageSize': 10,
    'status': 'Applied'
})
jobs = response.json()

# Create job
new_job = requests.post(f'{BASE_URL}/jobs', headers=headers, json={
    'title': 'Software Engineer',
    'companyName': 'Tech Corp',
    'description': '...'
})

# Run AI analysis
analysis = requests.post(f'{BASE_URL}/job-analysis/{job_id}/analyze', headers=headers)
```

### cURL

```bash
# Login
curl -X POST http://localhost:5132/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'

# Get jobs (with token)
curl http://localhost:5132/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create job
curl -X POST http://localhost:5132/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Engineer","companyName":"Corp","description":"..."}'
```
