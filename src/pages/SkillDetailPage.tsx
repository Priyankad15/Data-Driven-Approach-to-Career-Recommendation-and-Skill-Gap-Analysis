import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import ParticleBackground from "@/components/ParticleBackground";
import ProfileDropdown from "@/components/ProfileDropdown";
import Confetti from "@/components/Confetti";
import { ArrowLeft, Flame } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const SKILL_INFO: Record<string, { desc: string; why: string; overview: string; course: string; plan: string[] }> = {
  SQL: { desc: "SQL (Structured Query Language) is used to communicate with databases.", why: "Essential for querying and managing data in any data role.", overview: "SQL lets you create, read, update, and delete database records efficiently.", course: "https://www.w3schools.com/sql/", plan: ["SQL Basics & Setup", "SELECT Queries", "WHERE & Filtering", "JOINs", "GROUP BY & Aggregates", "Subqueries", "INSERT/UPDATE/DELETE", "Indexes & Optimization", "Practice Exercises", "Final Project"] },
  Python: { desc: "Python is a versatile programming language used in data science, web dev, and AI.", why: "The #1 language for data analysis, machine learning, and automation.", overview: "Python has simple syntax and vast libraries like Pandas, NumPy, TensorFlow.", course: "https://www.python.org/about/gettingstarted/", plan: ["Python Basics & Variables", "Data Types & Operators", "Control Flow (if/else, loops)", "Functions", "Lists, Tuples, Dicts", "File Handling", "Libraries (NumPy, Pandas)", "Data Visualization", "Practice Projects", "Advanced Topics"] },
  Excel: { desc: "Microsoft Excel is a spreadsheet tool for data analysis and visualization.", why: "Widely used in business analytics and reporting.", overview: "Excel offers formulas, pivot tables, charts, and macros.", course: "https://support.microsoft.com/excel", plan: ["Excel Basics", "Formulas & Functions", "Data Formatting", "Charts & Graphs", "Pivot Tables", "VLOOKUP/HLOOKUP", "Data Validation", "Macros Intro", "Dashboard Creation", "Practice"] },
  React: { desc: "React is a JavaScript library for building user interfaces.", why: "Most popular frontend framework used by top companies.", overview: "React uses components, state, and hooks for building dynamic UIs.", course: "https://react.dev/learn", plan: ["React Setup & JSX", "Components & Props", "State & Events", "Hooks (useState, useEffect)", "Conditional Rendering", "Lists & Keys", "Forms", "React Router", "API Integration", "Build a Project"] },
  JavaScript: { desc: "JavaScript is the language of the web, used for interactive websites.", why: "Foundation of web development, used everywhere.", overview: "JS enables dynamic content, DOM manipulation, and full-stack apps with Node.js.", course: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript", plan: ["JS Basics & Syntax", "Variables & Types", "Functions", "DOM Manipulation", "Events", "Arrays & Objects", "Async/Await", "Fetch API", "ES6+ Features", "Build Something"] },
};

const DEFAULT_INFO = {
  desc: "A valuable technical skill for your career.",
  why: "Important for your selected career path.",
  overview: "Learn the fundamentals and practice regularly.",
  course: "https://www.google.com/search?q=learn+",
  plan: ["Fundamentals", "Core Concepts", "Practice Basics", "Intermediate Topics", "Advanced Concepts", "Real-world Application", "Project Work", "Review & Practice", "Portfolio Piece", "Mastery"]
};

const SkillDetailPage = () => {
  const { skill } = useParams<{ skill: string }>();
  const { user, updateProfile } = useApp(); 
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);

  const info = SKILL_INFO[skill || ""] || { ...DEFAULT_INFO, course: DEFAULT_INFO.course + skill };
  
  
  const completedDays = user.completedDays[skill || ""] || new Array(info.plan.length).fill(false);
  const streak = user.streak;

  const toggleDay = async (index: number) => {
    const updated = [...completedDays];
    const wasCompleted = updated[index];
    updated[index] = !updated[index];

    const newCompleted = {
      ...user.completedDays,
      [skill || ""]: updated,
    };

    let newStreak = user.streak;
    const today = new Date().toDateString();

    if (!wasCompleted && updated[index]) {
      if (user.lastStreakDate !== today) {
        newStreak += 1;
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast({ title: `🔥 Streak: ${newStreak} days! Keep going!` });
      }
    }

    
    await updateProfile({
      completedDays: newCompleted,
      streak: newStreak,
      lastStreakDate: updated[index] ? today : user.lastStreakDate,
      points: Math.max(0, user.points + (updated[index] ? 5 : -5)),
    });
  };

  const completedCount = completedDays.filter(Boolean).length;

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      <ProfileDropdown />
      <Confetti show={showConfetti} />

      <div className="relative z-10 max-w-3xl mx-auto p-4 md:p-8">
        <button
          onClick={() => navigate("/skill-gap")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Skill Gap
        </button>

        <div className="glass-card p-6 mb-6 animate-fade-in">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-foreground">{skill}</h1>
            <div className="flex items-center gap-2 text-orange-500">
              <Flame className="w-5 h-5" />
              <span className="font-bold">{streak} days 🔥</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6 animate-slide-up">
            <h2 className="font-bold text-foreground text-lg mb-2">🧠 What is {skill}?</h2>
            <p className="text-muted-foreground">{info.desc}</p>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-bold text-foreground text-lg mb-2">🎯 Why {skill} for YOUR career?</h2>
            <p className="text-muted-foreground">{info.why}</p>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-bold text-foreground text-lg mb-2">💡 Overview</h2>
            <p className="text-muted-foreground">{info.overview}</p>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="font-bold text-foreground text-lg mb-2">
              📅 Daily Learning Plan ({user.learningTime}/day)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Progress: {completedCount}/{info.plan.length} days
            </p>
            <div className="w-full bg-secondary rounded-full h-2 mb-4">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${(completedCount / info.plan.length) * 100}%` }}
              />
            </div>
            <div className="space-y-3">
              {info.plan.map((day, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    completedDays[i] ? "bg-success/10" : "bg-secondary/50"
                  }`}
                >
                  <Checkbox
                    checked={completedDays[i]}
                    onCheckedChange={() => toggleDay(i)}
                  />
                  <span
                    className={`text-sm ${
                      completedDays[i]
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    Day {i + 1}: {day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetailPage;