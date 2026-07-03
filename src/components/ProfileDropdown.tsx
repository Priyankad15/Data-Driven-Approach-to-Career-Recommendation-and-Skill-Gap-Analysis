import { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, User, Settings, FileText, LogOut, ChevronDown } from "lucide-react";

const ProfileDropdown = () => {
  const { user, isDark, toggleDark, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning ☀️" : hour < 18 ? "Good Afternoon 🌤️" : "Good Evening 🌙";

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2" ref={ref}>
      <button onClick={toggleDark} className="p-2 rounded-full glass-card">
        {isDark ? <Sun className="w-4 h-4 text-foreground" /> : <Moon className="w-4 h-4 text-foreground" />}
      </button>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 glass-card px-3 py-2 rounded-full">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          {user.profilePhoto ? <img src={user.profilePhoto} className="w-8 h-8 rounded-full object-cover" /> : <User className="w-4 h-4 text-primary" />}
        </div>
        <span className="text-sm font-medium text-foreground hidden sm:block">{user.username || "User"}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 glass-card rounded-xl p-2 animate-scale-in">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium text-foreground">{greeting}</p>
            <p className="text-xs text-muted-foreground">Hi, {user.username || "User"} 😄</p>
          </div>
          {[
            { label: "View Profile", icon: User, path: "/profile" },
            { label: "Settings", icon: Settings, path: "/settings" },
            { label: "My Resumes", icon: FileText, path: "/resume-builder" },
          ].map(item => (
            <button key={item.label} onClick={() => { navigate(item.path); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/60 text-sm text-foreground">
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
          <button onClick={() => { logout(); navigate("/"); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm text-destructive mt-1">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
