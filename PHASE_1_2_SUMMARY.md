# Phase 1 & 2: Career Cockpit Data Model & Core Services - Implementation Summary

**Status**: ✅ **Code compiles successfully. Ready for review and approval.**

---

## Overview

I have implemented Phase 1 (Data Model + Migrations) and Phase 2 (Core Services & Abstraction) of the career cockpit. The foundation is stable, compile-safe, and ready for the API controllers and UI in subsequent phases.

---

## Data Model & Entity Relationships

### Core Entities

#### 1. **Job** (replaces JobApplication)
- Unified entity for state and private jobs
- Fields:
  - `Title`, `PostingUrl`, `RawDescription`, `SalaryRange`, `ClosingDate`
  - `Status` (enum: Planned, Applied, Interview, Offer, Rejected)
  - `JobType` (enum: State, Private)
  - `AppliedDate`, `Notes`
  - **State-specific**: `Department`, `Classification`, `JcNumber`, `ExamType`, `SoqRequired`
  - **Private-specific**: `CompanyName`, `TeamName`, `JobBoard`
  - **AI-parsed fields**: `ParsedSummary`, `KeyResponsibilities`, `ExtractedSkills`, `KsaPatterns`
  - Ownership: Scoped to User via `UserId` FK
- Relationships:
  - 1:1 with `JobAiAnalysis` (optional)
  - 1:N with `ApplicationAsset`
  - 1:N with `InterviewQuestion`

#### 2. **Profile Entities** (User's "Brain")

##### **Skill**
- Fields: `Name`, `Category` (language, cloud, os, soft_skill, etc.), `Level`, `YearsOfExperience`
- Relationships: M2M with Experience, Project, Story (via join tables)
- Ownership: Per user

##### **Experience**
- Fields: `Title`, `Organization`, `Location`, `StartDate`, `EndDate`, `IsCurrent`
- Rich content: `Summary`, `BulletPoints` (stored as JSON/text), `Technologies`
- Relationships: M2M with Skill via `ExperienceSkill` join table
- Ownership: Per user

##### **Project**
- Fields: `Name`, `Role`, `Description`, `TechStack`, `StartDate`, `EndDate`, `RepositoryUrl`, `LiveUrl`
- Relationships: M2M with Skill via `ProjectSkill` join table
- Ownership: Per user

##### **Story** (STAR Stories)
- Fields: `Title`, `Situation`, `Task`, `Action`, `Result`
- Context: `LinkedExperienceId`, `LinkedProjectId` (optional, nullable)
- Metadata: `Tags`, `Competency`, `PrimarySkills`, `StrengthRating` (1-5), `UsageCount`, `LastUsedDate`
- Relationships:
  - M2M with Skill via `StorySkill` join table
  - M2M with InterviewQuestion via `InterviewQuestionStory` (with `IsPrimary` flag)
- Ownership: Per user

##### **ResumeTemplate**
- Fields: `Name`, `Content` (full resume text), `IsDefault`, `CreatedAt`, `UpdatedAt`
- Ownership: Per user (can have multiple templates; one marked as default)

#### 3. **Job-Related Entities**

##### **ApplicationAsset**
- Represents resume drafts, SOQ versions, cover letters, notes per job
- Fields: `JobId`, `Type` (enum: Resume, Soq, CoverLetter, Notes), `Title`, `Content`, timestamps
- Relationships: N:1 with Job (deleted when job deleted)
- Ownership: Implicit (via Job ownership)

##### **JobAiAnalysis**
- Stores AI-generated fit analysis
- Fields: `JobId`, `MatchScore` (0-100), `StrengthsSummary`, `GapsSummary`, `RecommendedHighlights`, `SkillGapsAndIdeas`, timestamps
- Relationships: 1:1 with Job (optional, deleted when job deleted)

#### 4. **Interview Prep Entities**

##### **InterviewQuestion**
- Fields: `JobId`, `QuestionText`, `Category` (enum: Behavioral, Technical, Mixed)
- Metadata: `SourceType` (enum: DutyStatement, Internet), `Difficulty` (1-5), `NeedsPractice`, `OrderIndex`
- Relationships: N:1 with Job; M2M with Story via `InterviewQuestionStory`

##### **InterviewQuestionStory** (Join Table)
- Links questions to stories with `IsPrimary` flag (only one primary story per question, but question can reference multiple stories)
- Fields: `InterviewQuestionId`, `StoryId`, `IsPrimary`

#### 5. **Sharing**

##### **SharedLink**
- Fields: `UserId`, `Token` (unique), `Type` ("job_packet" or "profile"), `JobId` (nullable), `IsActive`, `CreatedAt`, `ExpiresAt`
- Allows public access to job packets or profile without exposing API keys or sensitive data

---

## DTOs (Data Transfer Objects)

### Snapshot DTO (for AI)
- **ProfileSnapshotDto**: Compact representation of entire user profile (experiences, projects, skills, stories) for AI services
  - Used by all AI endpoints
  - Includes embedded summaries of related entities
  - No API keys or sensitive data

### Job DTOs
- **JobCreateUpdateDto**: Request body for creating/updating jobs
- **JobDetailDto**: Full job details with related assets, analysis, interview questions
- **JobListItemDto**: Lightweight item for list views (card data)
- **JobAiAnalysisDto**: Fit analysis results
- **ApplicationAssetDto / ApplicationAssetCreateUpdateDto**: Asset CRUD

### Profile DTOs
- **SkillDto / SkillCreateUpdateDto**: Skill management
- **ExperienceDto / ExperienceCreateUpdateDto**: Experience with related skills
- **ProjectDto / ProjectCreateUpdateDto**: Project with related skills
- **StoryDto / StoryCreateUpdateDto**: STAR story with linked experience/project and skills
- **ResumeTemplateDto / ResumeTemplateCreateUpdateDto**: Template management
- **InterviewQuestionDto / InterviewQuestionUpdateDto**: Question with linked stories

---

## AI Service Abstraction

### Interface: `IAiService`

```csharp
Task<JobFitAnalysisResult> AnalyzeJobFitAsync(
    ProfileSnapshotDto profile, Job job, string apiKey)
→ Returns: matchScore, strengthsSummary, gapsSummary, recommendedHighlights, skillGapIdeas

Task<string> GenerateApplicationAssetAsync(
    ProfileSnapshotDto profile, Job job, string assetType, 
    string templateContent, string extraInstructions, string apiKey)
→ assetType: "resume", "soq", "cover_letter"

Task<List<GeneratedQuestion>> GenerateDutyStatementQuestionsAsync(
    ProfileSnapshotDto profile, Job job, string apiKey)

Task<List<GeneratedQuestion>> GenerateInternetPatternQuestionsAsync(
    ProfileSnapshotDto profile, Job job, string apiKey)

Task<Dictionary<int, StoryMatchResult>> MatchStoriesToQuestionsAsync(
    ProfileSnapshotDto profile, IEnumerable<string> questionTexts, string apiKey)

Task<JobParseResult> ParseJobDescriptionAsync(Job job, string apiKey)
```

### Implementation: `DummyAiService`
- ✅ **Fully implemented** with realistic placeholder data
- No external API calls
- Returns structured, logically-shaped results (match scores, lists, summaries)
- Logs all calls for transparency
- Ready to be swapped for real implementations (OpenAI, Claude, LLMs, etc.)

### Supporting Service: `ProfileService`
- Generates `ProfileSnapshotDto` from database in real time
- Includes all user's experiences, projects, skills, stories
- Used by AI endpoints to send comprehensive profile context

---

## Database Migrations

**Migration Created**: `CareerCockpitPhase1`
- Adds all new entities (Job, Experience, Project, Skill, Story, etc.)
- Establishes all relationships (FKs, join tables, cascading deletes)
- Maintains existing User and JobApplication tables (for now; JobApplication can be retired after data migration)
- Migration applies on app startup via `db.Database.Migrate()`

**Backward Compatibility**: 
- JobApplication table still exists (can be dropped after verifying all data migrated to Job)
- All new entities are user-scoped via FK to User

---

## Dependency Injection Setup

Added to `Program.cs`:
```csharp
builder.Services.AddScoped<IAiService, DummyAiService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
```

---

## Key Design Decisions

1. **Unified Job Entity**: State and private jobs use one entity with type field + optional fields. Cleaner than inheritance; easier to query across both types.

2. **Many-to-Many for Skills**: Skills, Experiences, Projects, and Stories all relate to Skills via join tables. Allows flexible tagging and future skill insights.

3. **InterviewQuestionStory with IsPrimary**: One question can have multiple story options, but one is marked primary. Flexible for interview prep while keeping primary story clear.

4. **ProfileSnapshotDto**: Compact DTO sent to AI endpoints. Eliminates need to send raw entities and keeps API contract clean. Can be versioned independently if AI schema changes.

5. **DummyAiService**: Fully functional placeholder. Returns realistic, contextual data (e.g., match scores based on profile richness). Can be swapped without touching controllers.

6. **User Ownership**: All profile and job data scoped to authenticated user via FK. Queries filter by `UserId` automatically in services.

7. **Cascading Deletes**: Designed thoughtfully—deleting a job deletes its assets and interview questions; deleting experience/project/skill does not delete linked stories (they stand independently).

---

## What's Ready / What's Next

### ✅ Complete (Phase 1 & 2)
- Data model defined and migrated
- DTOs for all entities
- IAiService interface and DummyAiService implementation
- ProfileService for snapshot generation
- Dependency injection configured
- Code compiles successfully

### 🔄 Next (Phase 3)
- **Controllers**:
  - `ProfileController`: Experiences, Projects, Skills, Stories, Templates CRUD
  - `JobsController`: Job CRUD, list with filters, detail view
  - `ApplicationAssetsController`: Asset CRUD per job
  - `JobAnalysisController`: Fit analysis, parsing
  - `InterviewPrepController`: Generate questions, update, link stories
  - `ShareController`: Share links and public endpoints
- **Authentication**: AI key header validation
- **Error handling**: Proper HTTP responses

### 🎨 After Phase 3
- Frontend pages and components
- UI forms for all CRUD operations
- AI integration in UI (calling endpoints)
- Settings page for AI key management
- Sharing and public pages

---

## Questions & Approval Points

**Before I proceed to Phase 3 (controllers), please confirm:**

1. ✅ Does the data model match your vision? Any fields to add/remove?
2. ✅ Does the relationship structure make sense? (M2M skills, story linking, etc.)
3. ✅ Is the DTO structure appropriate for your API contract?
4. ✅ Is the AI service abstraction clear and extensible?
5. ✅ Any concerns about user-scoping or data isolation?

**If all approved**, I will proceed immediately to Phase 3: building all controllers and endpoints, with full CRUD and AI integration ready for UI consumption.

---

## File Structure Summary

```
server/
├── Models/
│   ├── Job.cs                   ✨ Unified job entity
│   ├── Experience.cs            ✨ With many-to-many skills
│   ├── Project.cs               ✨ With many-to-many skills
│   ├── Skill.cs                 ✨ Central skill entity
│   ├── Story.cs                 ✨ STAR stories
│   ├── ResumeTemplate.cs        ✨ Per-user resume templates
│   ├── ApplicationAsset.cs      ✨ Assets per job
│   ├── JobAiAnalysis.cs         ✨ Fit analysis storage
│   ├── InterviewQuestion.cs     ✨ With story linking
│   ├── SharedLink.cs            ✨ Public share tokens
│   └── User.cs, JobApplication.cs (unchanged)
├── DTOs/
│   ├── JobDtos.cs               ✨ Job-related DTOs
│   ├── ProfileDtos.cs           ✨ Profile entity DTOs
│   ├── ProfileSnapshotDto.cs    ✨ Compact AI snapshot
│   └── (existing ProfileDtos.cs)
├── Services/
│   ├── IAiService.cs            ✨ AI abstraction interface
│   ├── DummyAiService.cs        ✨ Dummy implementation
│   ├── IProfileService.cs       ✨ Profile snapshot service
│   ├── ProfileService.cs        ✨ Implementation
│   └── (existing PasswordHelper.cs, LoggingHelper.cs)
├── Data/
│   ├── AppDbContext.cs          ✏️ Updated with all new DbSets
│   └── Migrations/
│       └── *_CareerCockpitPhase1.cs ✨ New migration
└── Controllers/
    ├── AuthController.cs        (unchanged)
    └── (Phase 3: new controllers will go here)
```

---

**Build Status**: ✅ SUCCESS
**Next Step**: Awaiting your approval to proceed to Phase 3 (Controllers & Endpoints).

