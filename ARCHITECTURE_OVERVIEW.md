# 🏗️ Career Cockpit Architecture - Phase 1 & 2 Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CAREER COCKPIT - ARCHITECTURE OVERVIEW                   │
│                                                                              │
│  STATUS: ✅ Phase 1 & 2 Complete | Build: SUCCESS | Awaiting Approval     │
└─────────────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════════════╗
║                        USER-FACING LAYER (FRONTEND)                       ║
║  [React Components] ──── HTTP ──── [.NET Core API Controllers]            ║
╚════════════════════════════════════════════════════════════════════════════╝
                                  │
                                  │ JSON
                                  ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                      CONTROLLER LAYER (Phase 3)                           ║
║                        [7 Controllers + 40+ Endpoints]                    ║
║                                                                           ║
║  ProfileController ──────────────┐                                       ║
║  JobsController                  │  Each has full CRUD                   ║
║  ApplicationAssetsController     │  + business logic                     ║
║  JobAnalysisController           │  + AI integration                     ║
║  InterviewPrepController         │  + error handling                     ║
║  ShareController                 │  + logging                           ║
║  SettingsController              │                                       ║
╚────────────────────────────────────────────────────────────────────────────╝
                                  │
                                  │ Service Calls
                                  ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                      SERVICE LAYER (Phase 2 - COMPLETE)                  ║
║                                                                           ║
║  ┌──────────────────────────┐      ┌──────────────────────────┐        ║
║  │   IAiService             │      │  IProfileService         │        ║
║  │  (Abstraction Layer)     │      │  (Snapshot Generator)    │        ║
║  │                          │      │                          │        ║
║  │  • AnalyzeJobFit         │      │  • GetProfileSnapshot    │        ║
║  │  • GenerateApplicationAsset                              │        ║
║  │  • GenerateDutyStatementQ│      └──────────────────────────┘        ║
║  │  • GenerateInternetQs    │                                          ║
║  │  • MatchStoriesToQuestions                              │        ║
║  │  • ParseJobDescription   │                                          ║
║  └──────────────┬───────────┘                                          ║
║                │ DummyAiService (swappable)                            ║
║                │ • OpenAI, Claude, etc. later                          ║
║                │ • No external calls now (placeholder data)            ║
║                └────────────────────────────────────────────          ║
╚════════════════════════════════════════════════════════════════════════════╝
                                  │
                                  │ Data Access (EF Core)
                                  ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                    DATA MODEL LAYER (Phase 1 - COMPLETE)                  ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────┐        ║
║  │ USER'S PROFILE ("BRAIN")                                   │        ║
║  │                                                             │        ║
║  │  Skill (Hub)                   EXPERIENCE      PROJECT     │        ║
║  │    ├─ M2M ─ ExperienceSkill ─ ┤ + Details   └─ + Details  │        ║
║  │    ├─ M2M ─ ProjectSkill      └────────────┐              │        ║
║  │    └─ M2M ─ StorySkill                     │              │        ║
║  │                                    STORY ◄─┘              │        ║
║  │                            (STAR format)                  │        ║
║  │                            + metrics                      │        ║
║  │                            + competencies                 │        ║
║  │                            M2M→ Interview                │        ║
║  │                                Questions                  │        ║
║  │                                                            │        ║
║  │  RESUME_TEMPLATE (Per-user)                             │        ║
║  │    └─ Multiple versions, one default                     │        ║
║  └─────────────────────────────────────────────────────────────┘        ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────┐        ║
║  │ JOB MANAGEMENT                                             │        ║
║  │                                                             │        ║
║  │  JOB (Unified: State + Private)                            │        ║
║  │    ├─ JobType: State | Private                            │        ║
║  │    ├─ State-specific fields (conditional)                 │        ║
║  │    ├─ Private-specific fields (conditional)               │        ║
║  │    ├─ AI-parsed fields (populated by service)            │        ║
║  │    │                                                       │        ║
║  │    ├─ 1:1 → JOB_AI_ANALYSIS (fit score, summaries)       │        ║
║  │    │                                                       │        ║
║  │    ├─ 1:N → APPLICATION_ASSET (resume, SOQ, etc)         │        ║
║  │    │                                                       │        ║
║  │    └─ 1:N → INTERVIEW_QUESTION                           │        ║
║  │             └─ M2M → STORY (with IsPrimary flag)         │        ║
║  │                                                            │        ║
║  │  SHARED_LINK (Public access tokens)                      │        ║
║  │    ├─ job_packet | profile                               │        ║
║  │    └─ No sensitive data exposed                          │        ║
║  └─────────────────────────────────────────────────────────────┘        ║
║                                                                           ║
║                              🔐 All data scoped to User (FK)             ║
╚════════════════════════════════════════════════════════════════════════════╝
                                  │
                                  │ SQL Queries
                                  ▼
╔════════════════════════════════════════════════════════════════════════════╗
║                    DATABASE (SQLite)                                      ║
║                    (Auto-migrated on startup)                            ║
║                    CareerCockpitPhase1.cs ✨                             ║
╚════════════════════════════════════════════════════════════════════════════╝

```

---

## 📦 Dependency Injection Flow

```
Program.cs
  │
  ├─ builder.Services.AddScoped<IAiService, DummyAiService>()
  │  └─ Available in all controllers via constructor injection
  │
  ├─ builder.Services.AddScoped<IProfileService, ProfileService>()
  │  └─ Available in all controllers via constructor injection
  │
  └─ builder.Services.AddDbContext<AppDbContext>()
     └─ Data access layer

Example Controller:
  public JobsController(AppDbContext context, IAiService aiService, IProfileService profileService)
  {
      // All services auto-injected and ready to use
      // Controllers call services
      // Services call DbContext for data
      // Services call IAiService for AI features
  }
```

---

## 🔄 Data Flow Examples

### Example 1: Analyze Job Fit

```
User clicks "Analyze Fit" on Job Detail
  │
  ├─ [Frontend] POST /api/jobs/{id}/analyze-fit
  │
  ├─ [JobAnalysisController] AnalyzeJobFit()
  │  │
  │  ├─ Get Job from DbContext
  │  │
  │  ├─ Call ProfileService.GetProfileSnapshotAsync(userId)
  │  │  └─ Fetches all user's experiences, projects, skills, stories
  │  │
  │  ├─ Call IAiService.AnalyzeJobFitAsync(profile, job, apiKey)
  │  │  └─ DummyAiService returns fit analysis
  │  │
  │  ├─ Create JobAiAnalysis entity
  │  │
  │  └─ Save to DbContext and return JobAiAnalysisDto
  │
  └─ [Frontend] Display: Match Score, Strengths, Gaps, Ideas
```

### Example 2: Generate Interview Questions

```
User clicks "Generate Interview Questions"
  │
  ├─ [Frontend] POST /api/jobs/{id}/interview-prep/generate
  │
  ├─ [InterviewPrepController] GenerateQuestions()
  │  │
  │  ├─ Get Job from DbContext
  │  │
  │  ├─ Call ProfileService.GetProfileSnapshotAsync(userId)
  │  │
  │  ├─ Call IAiService.GenerateDutyStatementQuestionsAsync()
  │  │  └─ Returns ~3 questions from job duty statement
  │  │
  │  ├─ Call IAiService.GenerateInternetPatternQuestionsAsync()
  │  │  └─ Returns ~4 common interview questions
  │  │
  │  ├─ Call IAiService.MatchStoriesToQuestionsAsync(profile, questions)
  │  │  └─ Maps stories to questions with match scores
  │  │
  │  ├─ Create InterviewQuestion records (1:N with Job)
  │  │
  │  ├─ Create InterviewQuestionStory links (M2M with IsPrimary)
  │  │
  │  └─ Return list of questions with linked stories
  │
  └─ [Frontend] Display: Questions grouped by source, with linked stories
```

### Example 3: Tailor Resume from Template

```
User clicks "Tailor Resume from Template"
  │
  ├─ [Frontend] POST /api/jobs/{id}/assets/resume-from-template
  │  └─ Sends: { templateId, title, extraInstructions? }
  │
  ├─ [ApplicationAssetsController] GenerateResume()
  │  │
  │  ├─ Get Job from DbContext
  │  │
  │  ├─ Get ResumeTemplate from DbContext
  │  │
  │  ├─ Call ProfileService.GetProfileSnapshotAsync(userId)
  │  │
  │  ├─ Call IAiService.GenerateApplicationAssetAsync(
  │  │       profile, job, "resume", template.Content, extraInstructions, apiKey)
  │  │  └─ DummyAiService returns tailored resume text
  │  │
  │  ├─ Create ApplicationAsset(Type=Resume, Content=generated)
  │  │
  │  └─ Return ApplicationAssetDto with generated content
  │
  └─ [Frontend] Show generated resume in editor, allow edit/save
```

---

## 🎯 Key Design Principles

### 1. **Single Responsibility**
- Controllers: Route requests, validate inputs
- Services: Business logic, AI orchestration, profile snapshots
- DbContext: Data access and relationships
- DTOs: API contracts (separate from entities)

### 2. **Dependency Injection**
- All dependencies injected into constructors
- Loose coupling: Controllers depend on interfaces, not implementations
- Easy to swap DummyAiService for real implementations

### 3. **User Scoping**
- Every entity has `UserId` FK
- Queries always filter by authenticated user's ID
- Perfect multi-tenant isolation

### 4. **Separation of Concerns**
- Models: Entity definitions + relationships
- DTOs: API request/response contracts
- Services: Business logic and external integrations
- Controllers: HTTP routing and error handling

### 5. **Extensibility**
- AI service abstraction ready for real implementations
- New controllers can be added without touching existing ones
- New entities can be added with new join tables
- Migration-based database evolution

---

## 📊 File Count Summary

```
Entity Models:        12 files  (Job, Experience, Project, Skill, Story, etc.)
DTOs:                 3 files  (JobDtos, ProfileDtos, ProfileSnapshotDto)
Services:             3 files  (IAiService, DummyAiService, ProfileService)
Database:             1 file   (AppDbContext updated)
Migrations:           1 file   (CareerCockpitPhase1)
Controllers:          0 files  (Phase 3)
Tests:                0 files  (Optional future work)
───────────────────────────────────
Total Created:       20+ files
Total Modified:       2 files
Build Status:        ✅ SUCCESS
```

---

## ✅ What's Ready

- ✅ All 12 entities defined
- ✅ All relationships configured
- ✅ All DTOs created
- ✅ All services implemented (dummy)
- ✅ Migration generated
- ✅ DI configured
- ✅ Code compiles
- ✅ Type-safe throughout

---

## 🚀 What's Next (Phase 3)

- [ ] 7 Controllers with full CRUD
- [ ] 40+ API endpoints
- [ ] Request validation
- [ ] Error handling
- [ ] Logging and telemetry
- [ ] Swagger documentation updates

---

**Ready for approval. Standing by. 🎯**

