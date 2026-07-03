import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import ParticleBackground from "@/components/ParticleBackground";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import AIRobot from "@/components/AIRobot";

const SKILL_LIST = ["Python", "Java", "JavaScript", "SQL", "React", "Node.js", "C++", "C#", "TypeScript", "HTML", "CSS", "R", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "Scala", "MATLAB", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Docker", "AWS", "Azure", "Git", "Linux", "MongoDB", "PostgreSQL", "MySQL", "Excel", "Tableau", "Power BI", "Figma", "Photoshop"];

const OnboardingPage = () => {
  const { updateProfile } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    education: "", careerGoal: "", skillLevel: "", learningTime: "",
    knownSkills: "", mentorName: "",
  });
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const steps = [
    { title: "🧑‍🎓 Education Level", key: "education", type: "select", options: ["School", "Diploma", "Undergraduate", "Postgraduate"], errMsg: "Please select your education level" },
    { title: "💡 Career Goal", key: "careerGoal", type: "select", options: ["Job", "Internship", "Higher Studies", "Startup"], errMsg: "Please choose a career goal" },
    { title: "🛠️ Skill Level", key: "skillLevel", type: "select", options: ["Beginner", "Intermediate", "Advanced"], errMsg: "Please select your skill level" },
    { title: "⏳ Daily Learning Time", key: "learningTime", type: "select", options: ["1 hour", "2–3 hours", "5+ hours"], errMsg: "Please select learning time" },
    { title: "🧾 Known Skills", key: "knownSkills", type: "text", placeholder: "Type any skills, comma-separated (e.g., React, Docker, AWS, Figma)", errMsg: "Enter at least one skill" },
    { title: "🎯 AI Mentor Name", key: "mentorName", type: "text", placeholder: "e.g., MentorX, Aira, Nova", errMsg: "Enter a name for your AI Mentor" },
  ];

  const current = steps[step];

  const validateStep = () => {
    const val = data[current.key as keyof typeof data];
    if (!val || !val.trim()) { setError(current.errMsg); return false; }
    if (current.key === "knownSkills") {
      const skills = val.split(",").map(s => s.trim()).filter(Boolean);
      if (skills.length === 0) { setError(current.errMsg); return false; }
    }
    setError("");
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setLoading(true);
      const skills = data.knownSkills.split(",").map(s => s.trim()).filter(Boolean);
      await updateProfile({
        education: data.education, careerGoal: data.careerGoal, skillLevel: data.skillLevel,
        learningTime: data.learningTime, knownSkills: skills, mentorName: data.mentorName,
        onboardingComplete: true,
      });
      navigate("/dashboard");
    }
  };

  const handleSkillInput = (val: string) => {
    setData(p => ({ ...p, knownSkills: val }));
    const last = val.split(",").pop()?.trim().toLowerCase() || "";
    setSuggestions(last.length > 0 ? SKILL_LIST.filter(s => s.toLowerCase().startsWith(last)).slice(0, 5) : []);
  };

  const addSuggestion = (s: string) => {
    const parts = data.knownSkills.split(",").map(x => x.trim()).filter(Boolean);
    parts.pop();
    parts.push(s);
    setData(p => ({ ...p, knownSkills: parts.join(", ") + ", " }));
    setSuggestions([]);
  };

  if (loading) return <LoadingSpinner message="Setting up your personalized AI career mentor…" />;

  return (
    <div className="min-h-screen gradient-bg relative flex items-center justify-center p-4">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-lg animate-scale-in">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>
          <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
        </div>

        <div className="glass-card p-8">
          <div className="flex justify-center mb-4"><AIRobot size="sm" /></div>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{current.title}</h2>

          {current.type === "select" ? (
            <div className="grid grid-cols-2 gap-3">
              {current.options?.map(opt => (
                <button key={opt} onClick={() => { setData(p => ({ ...p, [current.key]: opt })); setError(""); }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${data[current.key as keyof typeof data] === opt ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 text-foreground"}`}>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="relative">
              <Input value={data[current.key as keyof typeof data]} onChange={e => current.key === "knownSkills" ? handleSkillInput(e.target.value) : setData(p => ({ ...p, [current.key]: e.target.value }))} placeholder={current.placeholder} className="input-glow" onKeyDown={e => e.key === "Enter" && handleNext()} />
              {suggestions.length > 0 && current.key === "knownSkills" && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card rounded-lg overflow-hidden z-20">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => addSuggestion(s)} className="w-full text-left px-4 py-2 hover:bg-primary/10 text-sm text-foreground">{s}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-destructive text-sm mt-3">{error}</p>}

          <div className="flex gap-3 mt-8">
            {step > 0 && <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">Back</Button>}
            <Button onClick={handleNext} className="flex-1 btn-glow">
              {step === steps.length - 1 ? "Get Started 🚀" : "Next →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
