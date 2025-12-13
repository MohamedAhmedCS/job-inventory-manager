import { useState, useEffect } from 'react';
import careerCockpitService, { Experience, Project, Skill, Story } from '../services/careerCockpitService';
import Loading from '../components/Loading';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'experiences' | 'projects' | 'skills' | 'stories'>('experiences');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Experience form state
  const [expForm, setExpForm] = useState({
    title: '',
    organization: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    summary: '',
    bulletPoints: '',
    technologies: '',
  });

  // Project form state
  const [projForm, setProjForm] = useState({
    name: '',
    role: '',
    description: '',
    techStack: '',
    startDate: '',
    endDate: '',
    repositoryUrl: '',
    liveUrl: '',
  });

  // Skill form state
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'language',
    level: 'intermediate',
    yearsOfExperience: 1,
  });

  // Story form state
  const [storyForm, setStoryForm] = useState({
    situation: '',
    task: '',
    action: '',
    result: '',
    linkedExperienceId: null as number | null,
    linkedProjectId: null as number | null,
    tags: '',
    competency: '',
    primarySkills: '',
    strengthRating: 5,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [exp, proj, sk, st] = await Promise.all([
        careerCockpitService.getExperiences(),
        careerCockpitService.getProjects(),
        careerCockpitService.getSkills(),
        careerCockpitService.getStories(),
      ]);
      setExperiences(exp);
      setProjects(proj);
      setSkills(sk);
      setStories(st);
    } catch {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Experience handlers
  const handleSaveExperience = async () => {
    try {
      if (editingId) {
        await careerCockpitService.updateExperience(editingId, expForm);
        setExperiences(experiences.map(e => e.id === editingId ? { ...e, ...expForm } : e));
      } else {
        const newExp = await careerCockpitService.createExperience(expForm);
        setExperiences([...experiences, newExp]);
      }
      resetForms();
    } catch {
      setError('Failed to save experience');
    }
  };

  const handleDeleteExperience = async (id: number) => {
    if (!window.confirm('Delete this experience?')) return;
    try {
      await careerCockpitService.deleteExperience(id);
      setExperiences(experiences.filter(e => e.id !== id));
    } catch {
      setError('Failed to delete experience');
    }
  };

  const handleEditExperience = (exp: Experience) => {
    setExpForm({
      title: exp.title,
      organization: exp.organization,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate || '',
      isCurrent: exp.isCurrent,
      summary: exp.summary,
      bulletPoints: exp.bulletPoints,
      technologies: exp.technologies,
    });
    setEditingId(exp.id);
    setShowForm(true);
  };

  // Project handlers
  const handleSaveProject = async () => {
    try {
      if (editingId) {
        await careerCockpitService.updateProject(editingId, projForm);
        setProjects(projects.map(p => p.id === editingId ? { ...p, ...projForm } : p));
      } else {
        const newProj = await careerCockpitService.createProject(projForm);
        setProjects([...projects, newProj]);
      }
      resetForms();
    } catch {
      setError('Failed to save project');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await careerCockpitService.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete project');
    }
  };

  const handleEditProject = (proj: Project) => {
    setProjForm({
      name: proj.name,
      role: proj.role,
      description: proj.description,
      techStack: proj.techStack,
      startDate: proj.startDate,
      endDate: proj.endDate || '',
      repositoryUrl: proj.repositoryUrl,
      liveUrl: proj.liveUrl,
    });
    setEditingId(proj.id);
    setShowForm(true);
  };

  // Skill handlers
  const handleSaveSkill = async () => {
    try {
      if (editingId) {
        await careerCockpitService.updateSkill(editingId, skillForm);
        setSkills(skills.map(s => s.id === editingId ? { ...s, ...skillForm } : s));
      } else {
        const newSkill = await careerCockpitService.createSkill(skillForm);
        setSkills([...skills, newSkill]);
      }
      resetForms();
    } catch {
      setError('Failed to save skill');
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await careerCockpitService.deleteSkill(id);
      setSkills(skills.filter(s => s.id !== id));
    } catch {
      setError('Failed to delete skill');
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setSkillForm({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      yearsOfExperience: skill.yearsOfExperience,
    });
    setEditingId(skill.id);
    setShowForm(true);
  };

  // Story handlers
  const handleSaveStory = async () => {
    try {
      if (editingId) {
        await careerCockpitService.updateStory(editingId, storyForm);
        setStories(stories.map(s => s.id === editingId ? { ...s, ...storyForm } : s));
      } else {
        const newStory = await careerCockpitService.createStory(storyForm);
        setStories([...stories, newStory]);
      }
      resetForms();
    } catch {
      setError('Failed to save story');
    }
  };

  const handleDeleteStory = async (id: number) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await careerCockpitService.deleteStory(id);
      setStories(stories.filter(s => s.id !== id));
    } catch {
      setError('Failed to delete story');
    }
  };

  const handleEditStory = (story: Story) => {
    setStoryForm({
      situation: story.situation,
      task: story.task,
      action: story.action,
      result: story.result,
      linkedExperienceId: story.linkedExperienceId,
      linkedProjectId: story.linkedProjectId,
      tags: story.tags,
      competency: story.competency,
      primarySkills: story.primarySkills,
      strengthRating: story.strengthRating,
    });
    setEditingId(story.id);
    setShowForm(true);
  };

  const resetForms = () => {
    setExpForm({
      title: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      summary: '',
      bulletPoints: '',
      technologies: '',
    });
    setProjForm({
      name: '',
      role: '',
      description: '',
      techStack: '',
      startDate: '',
      endDate: '',
      repositoryUrl: '',
      liveUrl: '',
    });
    setSkillForm({ name: '', category: 'language', level: 'intermediate', yearsOfExperience: 1 });
    setStoryForm({
      situation: '',
      task: '',
      action: '',
      result: '',
      linkedExperienceId: null,
      linkedProjectId: null,
      tags: '',
      competency: '',
      primarySkills: '',
      strengthRating: 5,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Career Profile</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-700">
          {(['experiences', 'projects', 'skills', 'stories'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowForm(false); }}
              className={`flex-1 px-4 py-3 text-center font-medium transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForms();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            {showForm ? 'Cancel' : `Add ${activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}`}
          </button>

          {showForm && (
            <div className="bg-gray-700 p-4 rounded-lg space-y-3">
              {activeTab === 'experiences' && (
                <>
                  <input type="text" placeholder="Job Title" value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Organization" value={expForm.organization} onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Location" value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="date" value={expForm.startDate} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="date" value={expForm.endDate} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} disabled={expForm.isCurrent} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50" />
                  <label className="flex items-center gap-2 text-white">
                    <input type="checkbox" checked={expForm.isCurrent} onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked, endDate: '' })} />
                    Currently working here
                  </label>
                  <textarea placeholder="Summary" value={expForm.summary} onChange={(e) => setExpForm({ ...expForm, summary: e.target.value })} rows={3} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <textarea placeholder="Bullet points (one per line)" value={expForm.bulletPoints} onChange={(e) => setExpForm({ ...expForm, bulletPoints: e.target.value })} rows={3} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Technologies" value={expForm.technologies} onChange={(e) => setExpForm({ ...expForm, technologies: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <button onClick={handleSaveExperience} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">Save</button>
                </>
              )}

              {activeTab === 'projects' && (
                <>
                  <input type="text" placeholder="Project Name" value={projForm.name} onChange={(e) => setProjForm({ ...projForm, name: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Your Role" value={projForm.role} onChange={(e) => setProjForm({ ...projForm, role: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <textarea placeholder="Description" value={projForm.description} onChange={(e) => setProjForm({ ...projForm, description: e.target.value })} rows={3} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Tech Stack" value={projForm.techStack} onChange={(e) => setProjForm({ ...projForm, techStack: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="date" value={projForm.startDate} onChange={(e) => setProjForm({ ...projForm, startDate: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="date" value={projForm.endDate} onChange={(e) => setProjForm({ ...projForm, endDate: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="url" placeholder="Repository URL" value={projForm.repositoryUrl} onChange={(e) => setProjForm({ ...projForm, repositoryUrl: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="url" placeholder="Live URL" value={projForm.liveUrl} onChange={(e) => setProjForm({ ...projForm, liveUrl: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <button onClick={handleSaveProject} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">Save</button>
                </>
              )}

              {activeTab === 'skills' && (
                <>
                  <input type="text" placeholder="Skill Name" value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <select value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none">
                    <option value="language">Language</option>
                    <option value="framework">Framework</option>
                    <option value="cloud">Cloud</option>
                    <option value="database">Database</option>
                    <option value="tool">Tool</option>
                    <option value="soft_skill">Soft Skill</option>
                  </select>
                  <select value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <input type="number" placeholder="Years of Experience" min="0" value={skillForm.yearsOfExperience} onChange={(e) => setSkillForm({ ...skillForm, yearsOfExperience: parseInt(e.target.value) })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <button onClick={handleSaveSkill} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">Save</button>
                </>
              )}

              {activeTab === 'stories' && (
                <>
                  <textarea placeholder="Situation" value={storyForm.situation} onChange={(e) => setStoryForm({ ...storyForm, situation: e.target.value })} rows={2} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <textarea placeholder="Task" value={storyForm.task} onChange={(e) => setStoryForm({ ...storyForm, task: e.target.value })} rows={2} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <textarea placeholder="Action" value={storyForm.action} onChange={(e) => setStoryForm({ ...storyForm, action: e.target.value })} rows={2} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <textarea placeholder="Result" value={storyForm.result} onChange={(e) => setStoryForm({ ...storyForm, result: e.target.value })} rows={2} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Competency" value={storyForm.competency} onChange={(e) => setStoryForm({ ...storyForm, competency: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Primary Skills" value={storyForm.primarySkills} onChange={(e) => setStoryForm({ ...storyForm, primarySkills: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <input type="text" placeholder="Tags" value={storyForm.tags} onChange={(e) => setStoryForm({ ...storyForm, tags: e.target.value })} className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-500 focus:border-blue-500 focus:outline-none" />
                  <div>
                    <label className="text-white text-sm mb-1 block">Strength Rating: {storyForm.strengthRating}</label>
                    <input type="range" min="1" max="5" value={storyForm.strengthRating} onChange={(e) => setStoryForm({ ...storyForm, strengthRating: parseInt(e.target.value) })} className="w-full" />
                  </div>
                  <button onClick={handleSaveStory} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">Save</button>
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div className="space-y-3">
            {activeTab === 'experiences' && experiences.map((exp) => (
              <div key={exp.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{exp.title}</p>
                    <p className="text-gray-400 text-sm">{exp.organization} {exp.location && `- ${exp.location}`}</p>
                    <p className="text-gray-500 text-xs mt-1">{exp.startDate} to {exp.isCurrent ? 'Present' : exp.endDate}</p>
                    <p className="text-gray-300 text-sm mt-2">{exp.summary}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditExperience(exp)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                    <button onClick={() => handleDeleteExperience(exp.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {activeTab === 'projects' && projects.map((proj) => (
              <div key={proj.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{proj.name}</p>
                    <p className="text-gray-400 text-sm">{proj.role}</p>
                    <p className="text-gray-300 text-sm mt-2">{proj.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditProject(proj)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                    <button onClick={() => handleDeleteProject(proj.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {activeTab === 'skills' && skills.map((skill) => (
              <div key={skill.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">{skill.name}</p>
                  <p className="text-gray-400 text-sm">{skill.category} - {skill.level} ({skill.yearsOfExperience} years)</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditSkill(skill)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                  <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>
              </div>
            ))}
            {activeTab === 'stories' && stories.map((story) => (
              <div key={story.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{story.competency}</p>
                    <p className="text-gray-300 text-sm mt-2"><span className="text-gray-400">Situation:</span> {story.situation}</p>
                    <p className="text-gray-300 text-sm"><span className="text-gray-400">Action:</span> {story.action}</p>
                    <p className="text-gray-300 text-sm"><span className="text-gray-400">Result:</span> {story.result}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditStory(story)} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                    <button onClick={() => handleDeleteStory(story.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
