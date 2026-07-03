import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import ParticleBackground from "@/components/ParticleBackground";
import AIRobot from "@/components/AIRobot";
import { BarChart3, BrainCircuit, FileText, Flame, Laptop, MessageSquare } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import { CAREER_SKILLS } from "@/pages/SkillGapPage";

// 🔥 Daily Quotes
const QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Push yourself, because no one else is going to do it for you.",
  "Dream big. Start small. Act now.",
  "Consistency is what transforms average into excellence.",
  "Your future is created by what you do today, not tomorrow.",
  "Small progress is still progress 💪",
  "Don’t stop until you're proud 🚀",
];

// 🔥 Daily Quote Logic
const getDailyQuote = () => {
  const day = new Date().getDate();
  return QUOTES[day % QUOTES.length];
};

// Career Match Logic
const computeCareerMatches = (knownSkills: string[]) => {
  const userSkillsLower = knownSkills.map(s => s.toLowerCase());
  const results: { title: string; icon: string; match: number }[] = [];

  const icons: Record<string, string> = {
    "Data Analyst": "📊", "Web Developer": "💻", "AI Engineer": "🤖",
    "Junior Developer": "💻", "Data Intern": "📊", "ML Intern": "🤖",
    "Research Analyst": "📊", "AI Researcher": "🤖", "Data Scientist": "🧬",
    "Full Stack Dev": "💻", "Product Analyst": "📊", "Tech Lead": "🚀",
  };

  for (const [career, required] of Object.entries(CAREER_SKILLS)) {
    const matched = required.filter(s => userSkillsLower.includes(s.toLowerCase())).length;
    const percent = Math.round((matched / required.length) * 100);
    results.push({ title: career, icon: icons[career] || "💼", match: percent });
  }

  return results.sort((a, b) => b.match - a.match).slice(0, 3);
};

const DashboardPage = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const careers = computeCareerMatches(user.knownSkills);
  const dailyQuote = getDailyQuote();

  const cards = [
    { title: "📅 Daily Challenges", desc: `Today's Score: ${user.dailyChallengeScore}`, path: "/daily-challenges", icon: BrainCircuit },
    { title: "📊 Skill Gap Analysis", desc: "View your personalized skill gaps", path: "/skill-gap", icon: BarChart3 },
    { title: "🧩 Mini Projects", desc: "Hands-on projects for your skills", path: "/mini-projects", icon: Laptop },
    { title: "📄 Resume Builder", desc: "Modern resume generator", path: "/resume-builder", icon: FileText },
  ];

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      <ProfileDropdown />

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Hero */}
        <div className="glass-card p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center gap-6 animate-fade-in">
          <AIRobot size="md" />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Hi {user.username || "there"}! Meet {user.mentorName || "your AI Mentor"} 🤖
            </h1>
            <p className="text-muted-foreground mt-2">
              Your AI Career Mentor is ready to guide you 🚀
            </p>
            <div className="flex gap-4 mt-3 justify-center md:justify-start">
              <span className="flex items-center gap-1 text-sm">
                <Flame className="w-4 h-4 text-orange-500" /> {user.streak} days
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/ai-mentor")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium btn-glow flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" /> Talk to Mentor
          </button>
        </div>

        {/* 🔥 PREMIUM QUOTE CARD */}
        <div className="mb-8 animate-fade-in">
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40">
            
            <div className="rounded-2xl px-6 py-5 text-center backdrop-blur-xl bg-white/60 dark:bg-black/40 transition-all hover:scale-[1.01]">
              
              <div className="text-2xl mb-2">💭</div>

              <p className="text-sm md:text-base font-medium text-foreground italic leading-relaxed">
                “{dailyQuote}”
              </p>

              <div className="mt-4 h-[2px] w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />

            </div>
          </div>
        </div>

        {/* Career Match */}
        <h2 className="text-xl font-bold text-foreground mb-4">🎯 Career Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {careers.map((role, i) => (
            <div
              key={i}
              onClick={() => navigate(`/career-details?career=${encodeURIComponent(role.title)}`)}
              className="glass-card-hover p-6 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl mb-3">{role.icon}</div>
              <h3 className="font-bold text-foreground">{role.title}</h3>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${role.match}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary">{role.match}%</span>
              </div>
              <button className="mt-3 text-primary text-sm font-medium hover:underline">
                View Details →
              </button>
            </div>
          ))}
        </div>

        {/* Modules */}
        <h2 className="text-xl font-bold text-foreground mb-4">📚 Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              onClick={() => navigate(card.path)}
              className="glass-card-hover p-6 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <card.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-foreground">{card.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{card.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;