using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Core
        public DbSet<User> Users { get; set; }

        // Jobs & Assets
        public DbSet<Job> Jobs { get; set; }
        public DbSet<ApplicationAsset> ApplicationAssets { get; set; }
        public DbSet<JobAiAnalysis> JobAiAnalyses { get; set; }

        // Profile: Experiences, Projects, Skills
        public DbSet<Experience> Experiences { get; set; }
        public DbSet<ExperienceSkill> ExperienceSkills { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectSkill> ProjectSkills { get; set; }
        public DbSet<Skill> Skills { get; set; }

        // Stories & Interview Prep
        public DbSet<Story> Stories { get; set; }
        public DbSet<StorySkill> StorySkills { get; set; }
        public DbSet<InterviewQuestion> InterviewQuestions { get; set; }
        public DbSet<InterviewQuestionStory> InterviewQuestionStories { get; set; }

        // Templates & Sharing
        public DbSet<ResumeTemplate> ResumeTemplates { get; set; }
        public DbSet<SharedLink> SharedLinks { get; set; }

        // Backwards compatibility (deprecated, will be removed after migration)
        public DbSet<JobApplication> JobApplications { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            // Suppress the pending migrations warning
            optionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Job relationships
            modelBuilder.Entity<Job>()
                .HasOne(j => j.User)
                .WithMany()
                .HasForeignKey(j => j.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Job>()
                .HasOne(j => j.AiAnalysis)
                .WithOne(a => a.Job)
                .HasForeignKey<JobAiAnalysis>(a => a.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            // ApplicationAsset relationships
            modelBuilder.Entity<ApplicationAsset>()
                .HasOne(a => a.Job)
                .WithMany(j => j.ApplicationAssets)
                .HasForeignKey(a => a.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            // Experience relationships
            modelBuilder.Entity<Experience>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ExperienceSkill>()
                .HasOne(es => es.Experience)
                .WithMany(e => e.ExperienceSkills)
                .HasForeignKey(es => es.ExperienceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ExperienceSkill>()
                .HasOne(es => es.Skill)
                .WithMany(s => s.ExperienceSkills)
                .HasForeignKey(es => es.SkillId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ExperienceSkill>()
                .HasKey(es => new { es.ExperienceId, es.SkillId });

            // Project relationships
            modelBuilder.Entity<Project>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectSkill>()
                .HasOne(ps => ps.Project)
                .WithMany(p => p.ProjectSkills)
                .HasForeignKey(ps => ps.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectSkill>()
                .HasOne(ps => ps.Skill)
                .WithMany(s => s.ProjectSkills)
                .HasForeignKey(ps => ps.SkillId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectSkill>()
                .HasKey(ps => new { ps.ProjectId, ps.SkillId });

            // Skill relationships
            modelBuilder.Entity<Skill>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Story relationships
            modelBuilder.Entity<Story>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Story>()
                .HasOne(s => s.LinkedExperience)
                .WithMany()
                .HasForeignKey(s => s.LinkedExperienceId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Story>()
                .HasOne(s => s.LinkedProject)
                .WithMany()
                .HasForeignKey(s => s.LinkedProjectId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<StorySkill>()
                .HasOne(ss => ss.Story)
                .WithMany(s => s.StorySkills)
                .HasForeignKey(ss => ss.StoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StorySkill>()
                .HasOne(ss => ss.Skill)
                .WithMany(s => s.StorySkills)
                .HasForeignKey(ss => ss.SkillId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StorySkill>()
                .HasKey(ss => new { ss.StoryId, ss.SkillId });

            // Interview relationships
            modelBuilder.Entity<InterviewQuestion>()
                .HasOne(iq => iq.Job)
                .WithMany(j => j.InterviewQuestions)
                .HasForeignKey(iq => iq.JobId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewQuestionStory>()
                .HasOne(iqs => iqs.InterviewQuestion)
                .WithMany(iq => iq.Stories)
                .HasForeignKey(iqs => iqs.InterviewQuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewQuestionStory>()
                .HasOne(iqs => iqs.Story)
                .WithMany(s => s.InterviewQuestionStories)
                .HasForeignKey(iqs => iqs.StoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InterviewQuestionStory>()
                .HasKey(iqs => new { iqs.InterviewQuestionId, iqs.StoryId });

            // ResumeTemplate relationships
            modelBuilder.Entity<ResumeTemplate>()
                .HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // SharedLink relationships
            modelBuilder.Entity<SharedLink>()
                .HasOne(sl => sl.User)
                .WithMany()
                .HasForeignKey(sl => sl.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SharedLink>()
                .HasOne(sl => sl.Job)
                .WithMany()
                .HasForeignKey(sl => sl.JobId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<SharedLink>()
                .HasIndex(sl => sl.Token)
                .IsUnique();
        }
    }
}
