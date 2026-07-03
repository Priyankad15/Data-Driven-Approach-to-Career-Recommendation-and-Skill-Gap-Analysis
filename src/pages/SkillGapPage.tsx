import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import ParticleBackground from "@/components/ParticleBackground";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ArrowLeft } from "lucide-react";

const CAREER_SKILLS: Record<string, string[]> = {
  "Data Analyst": ["Python", "SQL", "Excel", "Tableau", "Power BI", "Pandas", "NumPy", "Statistics", "R"],
  "Web Developer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "TypeScript", "Git", "MongoDB", "PostgreSQL"],
  "AI Engineer": ["Python", "TensorFlow", "PyTorch", "NumPy", "Pandas", "SQL", "Docker", "Linux", "Mathematics"],
  "Junior Developer": ["HTML", "CSS", "JavaScript", "Git", "React", "Node.js", "SQL"],
  "Data Intern": ["Python", "SQL", "Excel", "Pandas", "Statistics"],
  "ML Intern": ["Python", "NumPy", "Pandas", "TensorFlow", "Statistics"],
  "Research Analyst": ["Python", "R", "SQL", "Statistics", "Excel", "Tableau"],
  "AI Researcher": ["Python", "TensorFlow", "PyTorch", "Mathematics", "NumPy", "Pandas"],
  "Data Scientist": ["Python", "SQL", "R", "TensorFlow", "Pandas", "NumPy", "Statistics", "Tableau"],
  "Full Stack Dev": ["HTML", "CSS", "JavaScript", "React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL", "Docker", "Git"],
  "Product Analyst": ["SQL", "Excel", "Python", "Tableau", "Power BI", "Statistics"],
  "Tech Lead": ["JavaScript", "TypeScript", "React", "Node.js", "Docker", "AWS", "Git", "PostgreSQL", "MongoDB"],
};

const SkillGapPage = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  // Find the best matching career based on user's skills
  const userSkillsLowerAll = user.knownSkills.map(s => s.toLowerCase());
  let bestCareer = "Data Analyst";
  let bestMatch = 0;
  for (const [career, skills] of Object.entries(CAREER_SKILLS)) {
    const matched = skills.filter(s => userSkillsLowerAll.includes(s.toLowerCase())).length;
    const pct = matched / skills.length;
    if (pct > bestMatch) { bestMatch = pct; bestCareer = career; }
  }
  const primaryCareer = bestCareer;
  const required = CAREER_SKILLS[primaryCareer];
  const userSkillsLower = user.knownSkills.map(s => s.toLowerCase());

  const strong = required.filter(s => userSkillsLower.includes(s.toLowerCase()));
  const weak = required.filter(s => !userSkillsLower.includes(s.toLowerCase()));
  const gapPercent = Math.round((weak.length / required.length) * 100);

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      <ProfileDropdown />
      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="glass-card p-6 mb-6 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Your Skill Gap: {gapPercent}%</h1>
          <p className="text-muted-foreground mt-2">Based on your selected career and current skills</p>
          <div className="w-full bg-secondary rounded-full h-4 mt-4 max-w-md mx-auto">
            <div className="bg-primary rounded-full h-4 transition-all duration-1000" style={{ width: `${100 - gapPercent}%` }} />
          </div>
        </div>

        {/* Strong Skills */}
        <h2 className="text-lg font-bold text-foreground mb-3">✅ Strong Skills</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {strong.length > 0 ? strong.map(s => (
            <div key={s} className="glass-card p-4 border-l-4 border-success">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">{s}</span>
                <span className="text-sm text-success font-bold">Proficient</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div className="bg-success rounded-full h-2" style={{ width: "85%" }} />
              </div>
            </div>
          )) : <p className="text-muted-foreground">No matching skills yet</p>}
        </div>

        {/* Weak Skills */}
        <h2 className="text-lg font-bold text-foreground mb-3">❌ Skills to Learn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {weak.map(s => (
            <div key={s} className="glass-card p-4 border-l-4 border-destructive">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">{s}</span>
                <span className="text-sm text-destructive font-bold">Missing</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div className="bg-destructive/50 rounded-full h-2" style={{ width: "10%" }} />
              </div>
              <button onClick={() => navigate(`/skill-detail/${encodeURIComponent(s)}`)} className="mt-3 text-primary text-sm font-medium hover:underline">
                Start Learning →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;
export { CAREER_SKILLS };
