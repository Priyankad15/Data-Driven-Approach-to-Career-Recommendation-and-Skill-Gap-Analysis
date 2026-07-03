import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import ParticleBackground from "@/components/ParticleBackground";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ArrowLeft } from "lucide-react";

const CareerDetailsPage = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      <ProfileDropdown />
      <div className="relative z-10 max-w-3xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="glass-card p-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Career Details</h1>
          <p className="text-muted-foreground mb-6">Based on your goal: {user.careerGoal}</p>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-bold text-foreground text-lg">📊 What does this role involve?</h2>
              <p className="text-muted-foreground mt-2">This role requires analyzing data, building solutions, and continuous learning. It aligns with your {user.skillLevel} level and {user.education} background.</p>
            </div>
            <div className="glass-card p-6">
              <h2 className="font-bold text-foreground text-lg">🛠️ Required Skills</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.knownSkills.map(s => <span key={s} className="px-3 py-1 bg-success/10 text-success rounded-full text-sm">{s} ✅</span>)}
              </div>
            </div>
            <div className="glass-card p-6">
              <h2 className="font-bold text-foreground text-lg">📈 Growth Path</h2>
              <p className="text-muted-foreground mt-2">With {user.learningTime}/day of practice, you can be job-ready in 2-4 months. Keep completing daily challenges and building projects!</p>
            </div>
            <div className="glass-card p-6">
              <h2 className="font-bold text-foreground text-lg">💰 Expected Salary Range</h2>
              <p className="text-muted-foreground mt-2">Entry level: $40,000 - $65,000/year. Grows significantly with experience and certifications.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDetailsPage;
