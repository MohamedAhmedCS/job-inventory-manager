# Career Cockpit: Entity Relationship Overview

## User Profile ("Brain")

```
┌─────────────────────────────────────────────────────────────────┐
│ USER (existing)                                                 │
│ - Id, Username, PasswordHash, CreatedAt                         │
└────────────┬──────────────────────────────────────────────────┬─┘
             │                                                  │
      ┌──────▼──────────┐  ┌────────────────────┐  ┌──────────▼─────────┐
      │  EXPERIENCE     │  │    PROJECT         │  │     SKILL          │
      │ (Many per user) │  │ (Many per user)    │  │ (Central hub)      │
      │                 │  │                    │  │                    │
      │ - Title         │  │ - Name             │  │ - Name             │
      │ - Organization  │  │ - Role             │  │ - Category         │
      │ - Location      │  │ - Description      │  │ - Level            │
      │ - StartDate     │  │ - TechStack        │  │ - YearsExperience  │
      │ - EndDate       │  │ - StartDate        │  │                    │
      │ - IsCurrent     │  │ - EndDate          │  │                    │
      │ - Summary       │  │ - RepositoryUrl    │  │                    │
      │ - BulletPoints  │  │ - LiveUrl          │  │                    │
      │ - Technologies  │  │                    │  │                    │
      └──────┬──────────┘  └────────┬───────────┘  └────────────────────┘
             │                      │
             └──────┬───────────────┤───────────────┬────────────────────┐
                    │ Many-to-Many  │               │ Many-to-Many       │
                    ▼               ▼               ▼                    │
             ┌──────────────────────────────┐  ┌────────────────────────┘
             │  STORY                       │  │
             │  (STAR format)               │  │
             │                              │  │
             │  - Title                     │  │
             │  - Situation                 │  │
             │  - Task                      │  │
             │  - Action                    │  │
             │  - Result                    │  │
             │  - LinkedExperienceId (opt)  │  │
             │  - LinkedProjectId (opt)     │  │
             │  - Tags                      │  │
             │  - Competency                │  │
             │  - PrimarySkills             │  │
             │  - StrengthRating (1-5)      │  │
             │  - UsageCount                │  │
             │  - LastUsedDate              │  │
             │                              │◄──┘
             │  ↑  ↑  ↑                     │
             │  └──┼──┘                     │
             │     │ Many-to-Many (M2M)     │
             │     └────────────────────────┘
             │
             └──────────────────────┐
                                    │ M2M (can be linked)
                                    ▼
             ┌─────────────────────────────────┐
             │  INTERVIEW QUESTION             │
             │  (generated for each job)       │
             │                                 │
             │  - QuestionText                 │
             │  - Category                     │
             │  - SourceType                   │
             │  - Difficulty                   │
             │  - NeedsPractice                │
             │  - OrderIndex                   │
             │                                 │
             │  ↔ PrimaryStory (IsPrimary)     │
             └─────────────────────────────────┘

┌──────────────────────────────────┐
│  RESUME_TEMPLATE (Many per user) │
│                                  │
│  - Name                          │
│  - Content (full resume text)    │
│  - IsDefault                     │
│  - CreatedAt / UpdatedAt         │
└──────────────────────────────────┘
```

---

## Job Management

```
┌──────────────────────────────────────────────────────────────────┐
│  JOB (Unified: State + Private)                                  │
│  - Title                                                         │
│  - PostingUrl                                                    │
│  - RawDescription                                                │
│  - SalaryRange                                                   │
│  - ClosingDate                                                   │
│  - Status (Planned, Applied, Interview, Offer, Rejected)        │
│  - JobType (State or Private)                                    │
│  - AppliedDate, Notes                                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ State-Specific Fields (if JobType = State)                │ │
│  │ - Department, Classification, JcNumber, ExamType          │ │
│  │ - SoqRequired                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Private-Specific Fields (if JobType = Private)            │ │
│  │ - CompanyName, TeamName, JobBoard (LinkedIn, Indeed, etc)│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ AI-Parsed Fields (populated by ParseJobDescription)      │ │
│  │ - ParsedSummary                                           │ │
│  │ - KeyResponsibilities                                     │ │
│  │ - ExtractedSkills                                         │ │
│  │ - KsaPatterns (state jobs only)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────┬───────────────────────────────────────────────────────────┘
       │
       ├──1:1───────────────────────┐
       │                            ▼
       │                ┌──────────────────────────┐
       │                │  JOB_AI_ANALYSIS         │
       │                │  (1 per job)             │
       │                │                          │
       │                │ - MatchScore (0-100)     │
       │                │ - StrengthsSummary       │
       │                │ - GapsSummary            │
       │                │ - RecommendedHighlights  │
       │                │ - SkillGapsAndIdeas      │
       │                │ - GeneratedAt            │
       │                └──────────────────────────┘
       │
       ├──1:N───────────────────────┐
       │                            ▼
       │                ┌──────────────────────────┐
       │                │  APPLICATION_ASSET       │
       │                │  (Many per job)          │
       │                │                          │
       │                │ - Type (Resume, Soq,     │
       │                │   CoverLetter, Notes)    │
       │                │ - Title                  │
       │                │ - Content                │
       │                │ - CreatedAt / UpdatedAt  │
       │                └──────────────────────────┘
       │
       └──1:N───────────────────────┐
                                    ▼
                        ┌──────────────────────────┐
                        │  INTERVIEW_QUESTION      │
                        │  (Per job)               │
                        │                          │
                        │ - QuestionText           │
                        │ - Category               │
                        │ - SourceType             │
                        │ - Difficulty             │
                        │ - NeedsPractice          │
                        │ - OrderIndex             │
                        │                          │
                        │ ↔ STORY (M2M)            │
                        │   (IsPrimary flag)       │
                        └──────────────────────────┘
```

---

## Sharing

```
┌──────────────────────────────────────────┐
│  SHARED_LINK                             │
│  (Enables public access without keys)    │
│                                          │
│  - Token (unique)                        │
│  - Type ("job_packet" or "profile")      │
│  - JobId (nullable; required for packets)│
│  - IsActive                              │
│  - CreatedAt / ExpiresAt                 │
│                                          │
│  ↔ JOB (optional; for job packets)       │
│  ↔ USER (for ownership tracking)         │
└──────────────────────────────────────────┘
```

---

## Data Flow Summary

### Create Job Workflow
```
1. User creates job (POST /api/jobs)
   → Job entity created, UserId set
   → Assets start empty

2. User requests fit analysis (POST /api/jobs/{id}/analyze-fit)
   → Fetch Job + ProfileSnapshot
   → Call IAiService.AnalyzeJobFitAsync(profile, job, apiKey)
   → Save result in JobAiAnalysis (1:1)

3. User generates interview questions (POST /api/jobs/{id}/interview-prep/generate)
   → Fetch Job + ProfileSnapshot
   → Call GenerateDutyStatementQuestions + GenerateInternetPatternQuestions
   → Store InterviewQuestion records (1:N)
   → Call MatchStoriesToQuestions
   → Create InterviewQuestionStory links (M2M) with IsPrimary flag

4. User tailors resume (POST /api/jobs/{id}/assets/resume-from-template)
   → Fetch Job + ResumeTemplate + ProfileSnapshot
   → Call IAiService.GenerateApplicationAsset(profile, job, "resume", template, extraInstructions, apiKey)
   → Save result as ApplicationAsset (Type=Resume)
```

### AI Service Abstraction

```
┌─────────────────────────────────┐
│  Any Controller (JobsController │
│  InterviewPrepController, etc)  │
└────────┬────────────────────────┘
         │ calls via DI injection
         ▼
┌─────────────────────────────────┐
│  IAiService (interface)         │
│  - AnalyzeJobFitAsync           │
│  - GenerateApplicationAssetAsync│
│  - GenerateDutyStatementQAsync  │
│  - GenerateInternetPatternsAsync│
│  - MatchStoriesToQuestionsAsync │
│  - ParseJobDescriptionAsync     │
└────────┬────────────────────────┘
         │ implements
         ▼
┌─────────────────────────────────┐
│  DummyAiService (now)           │ ← Can be swapped for
│  Returns realistic placeholder  │   OpenAI, Claude, etc
│  data (no external API calls)   │   without changing
└─────────────────────────────────┘   controllers
```

---

## User Scoping & Data Isolation

All major entities include `UserId` FK to User:
- Job → User (cascade delete)
- Experience → User (cascade delete)
- Project → User (cascade delete)
- Skill → User (cascade delete)
- Story → User (cascade delete)
- ResumeTemplate → User (cascade delete)
- SharedLink → User (cascade delete)

**Queries always filter by authenticated user's ID:**
```csharp
// Example: Get all jobs for user
var jobs = await _context.Jobs
    .Where(j => j.UserId == authenticatedUserId)
    .ToListAsync();

// Example: Get profile snapshot
var profile = await _profileService.GetProfileSnapshotAsync(authenticatedUserId);
```

**Result**: Perfect data isolation. Multi-tenant ready. Each user only sees their own data.

---

## Next Steps

1. **Your Review**: Confirm data model, relationships, DTOs, and AI service design
2. **Phase 3 (Controllers)**: Build all CRUD endpoints and AI integration
3. **Phase 4 (Frontend)**: Create UI pages and forms
4. **Phase 5 (AI Wiring)**: Connect frontend to backend AI endpoints
5. **Phase 6 (Polish)**: Sharing, analytics, final UX tuning

