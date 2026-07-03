import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import ParticleBackground from "@/components/ParticleBackground";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const THEMES = [
  { id: "lavender", color: "hsl(262,83%,58%)", name: "Lavender" },
  { id: "rose", color: "hsl(340,80%,60%)", name: "Rose" },
  { id: "sky", color: "hsl(200,80%,55%)", name: "Sky" },
  { id: "mint", color: "hsl(160,60%,50%)", name: "Mint" },
  { id: "amber", color: "hsl(38,90%,55%)", name: "Amber" },
  { id: "coral", color: "hsl(16,80%,60%)", name: "Coral" },
  { id: "teal", color: "hsl(180,60%,45%)", name: "Teal" },
  { id: "violet", color: "hsl(280,70%,55%)", name: "Violet" },
  { id: "peach", color: "hsl(25,80%,65%)", name: "Peach" },
  { id: "sage", color: "hsl(140,30%,55%)", name: "Sage" },
];

const SettingsPage = () => {
  const { user, updateProfile, isDark, toggleDark, logout } = useApp();
  const navigate = useNavigate();

  const [careerGoal, setCareerGoal] = useState(user.careerGoal);
  const [skills, setSkills] = useState(user.knownSkills.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const saveCareer = async () => {
    setIsSaving(true);
    setShowSuccess(false);

    await updateProfile({
      careerGoal,
      knownSkills: skills.split(",").map(s => s.trim()).filter(Boolean),
    });

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }, 800);
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      <ProfileDropdown />

      <div className="relative z-10 max-w-2xl mx-auto p-4 md:p-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-6">
          ⚙️ Settings
        </h1>

        {/* Theme */}
        <div className="glass-card p-6 mb-4 animate-slide-up">
          <h2 className="font-bold text-foreground mb-4">
            🎨 Theme & Appearance
          </h2>

          <div className="flex items-center justify-between mb-4">
            <span className="text-foreground text-sm">Dark Mode</span>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Switch checked={isDark} onCheckedChange={toggleDark} />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-2">Theme Color</p>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => updateProfile({ theme: t.id })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  user.theme === t.id
                    ? "border-foreground scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: t.color }}
                title={t.name}
              />
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Font Size</p>
            <div className="flex gap-2">
              {["small", "medium", "large"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateProfile({ fontSize: s })}
                  className={`px-4 py-2 rounded-lg text-sm capitalize ${
                    user.fontSize === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Career */}
        <div
          className="glass-card p-6 mb-4 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h2 className="font-bold text-foreground mb-4">
            🎯 Career Preferences
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">
                Career Goal
              </label>
              <select
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg bg-secondary text-foreground border border-border"
              >
                {["Job", "Internship", "Higher Studies", "Startup"].map(
                  (o) => (
                    <option key={o}>{o}</option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">
                Skills (comma separated)
              </label>
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <Button
              onClick={saveCareer}
              className="w-full btn-glow transition-all active:scale-95"
              disabled={isSaving}
            >
              {isSaving ? "Updating..." : "Update Preferences"}
            </Button>

            {showSuccess && (
              <p className="text-green-500 text-sm mt-2 text-center">
                ✅ Preferences Updated
              </p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div
          className="glass-card p-6 mb-4 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="font-bold text-foreground mb-4">
            🔔 Notifications
          </h2>

          <div className="space-y-3">
            {[
              "Daily Reminder",
              "Challenge Reminder",
              "Motivation Messages",
            ].map((n) => (
              <div
                key={n}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-foreground">{n}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div
          className="glass-card p-6 mb-4 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="font-bold text-foreground mb-4">
            🔐 Account
          </h2>

          <Button
            variant="outline"
            className="w-full text-destructive"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;