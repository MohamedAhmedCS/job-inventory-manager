namespace server.Models
{
    public enum JobType
    {
        Federal = 0,
        State = 1,
        Local = 2,
        Contractor = 3,
        Private = 4
    }

    public enum JobStatus
    {
        Applied = 0,
        Interviewing = 1,
        Offered = 2,
        Rejected = 3,
        Withdrawn = 4,
        Active = 5
    }

    public enum InterviewQuestionCategory
    {
        DutyStatement,
        InternetPattern,
        BehavioralStar,
        TechnicalSkill,
        Competency
    }

    public enum InterviewQuestionSourceType
    {
        DutyStatement = 0,
        Internet = 1,
        Custom = 2
    }

    public enum ApplicationAssetType
    {
        Resume,
        CoverLetter,
        Soq,
        Notes
    }
}
