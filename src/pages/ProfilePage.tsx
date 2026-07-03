import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import ParticleBackground from "@/components/ParticleBackground";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ArrowLeft, Flame, Trophy, Mail, Phone, Edit } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { user, updateProfile } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user.username, phone: user.phone });

  const save = () => {
    updateProfile(form);
    setEditing(false);
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      <ProfileDropdown />
      <div className="relative z-10 max-w-2xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="glass-card p-8 text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4">
            {user.profilePhoto ? <img src={user.profilePhoto} className="w-24 h-24 rounded-full object-cover" /> : <span className="text-4xl">👤</span>}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{user.username || "User"}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex justify-center gap-6 mt-4">
            <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {user.streak} day streak</span>
            <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-yellow-500" /> {user.points} points</span>
          </div>
        </div>

        <div className="glass-card p-6 mt-4 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-foreground">Personal Info</h2>
            <Button size="sm" variant="outline" onClick={() => setEditing(!editing)} className="gap-1"><Edit className="w-3 h-3" /> {editing ? "Cancel" : "Edit"}</Button>
          </div>
          {editing ? (
            <div className="space-y-3">
              <Input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="Name" />
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
              <Button onClick={save} className="w-full btn-glow">Save Changes</Button>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-foreground"><Mail className="w-4 h-4 text-muted-foreground" /> {user.email || "Not set"}</p>
              <p className="flex items-center gap-2 text-foreground"><Phone className="w-4 h-4 text-muted-foreground" /> {user.phone || "Not set"}</p>
            </div>
          )}
        </div>

        <div className="glass-card p-6 mt-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="font-bold text-foreground mb-3">Career Info</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Goal:</span> <span className="text-foreground font-medium">{user.careerGoal}</span></div>
            <div><span className="text-muted-foreground">Level:</span> <span className="text-foreground font-medium">{user.skillLevel}</span></div>
            <div><span className="text-muted-foreground">Education:</span> <span className="text-foreground font-medium">{user.education}</span></div>
            <div><span className="text-muted-foreground">Learning:</span> <span className="text-foreground font-medium">{user.learningTime}</span></div>
          </div>
          <div className="mt-3">
            <span className="text-muted-foreground text-sm">Skills: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.knownSkills.map(s => (
                <span key={s} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
