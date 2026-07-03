import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserData {
  id?: string; // ✅ Added ID to identify user in DB
  username: string;
  email: string;
  isLoggedIn: boolean;
  onboardingComplete: boolean;
  education: string;
  careerGoal: string;
  skillLevel: string;
  learningTime: string;
  knownSkills: string[];
  mentorName: string;
  points: number;
  streak: number;
  lastStreakDate: string;
  completedDays: Record<string, boolean[]>;
  completedProjects: string[];
  resumes: ResumeData[];
  dailyChallengeDate: string;
  dailyChallengeScore: number;
  dailyChallengesCompleted: boolean[];
  profilePhoto: string;
  phone: string;
  theme: string;
  fontSize: string;
}

export interface ResumeData {
  id: string;
  name: string;
  template: string;
  date: string;
  data: Record<string, string>;
}

const defaultUser: UserData = {
  username: "",
  email: "",
  isLoggedIn: false,
  onboardingComplete: false,
  education: "",
  careerGoal: "",
  skillLevel: "",
  learningTime: "",
  knownSkills: [],
  mentorName: "",
  points: 0,
  streak: 0,
  lastStreakDate: "",
  completedDays: {},
  completedProjects: [],
  resumes: [],
  dailyChallengeDate: "",
  dailyChallengeScore: 0,
  dailyChallengesCompleted: [false, false, false, false, false],
  profilePhoto: "",
  phone: "",
  theme: "lavender",
  fontSize: "medium",
};

const THEME_COLORS: Record<string, { primary: string; accent: string; ring: string }> = {
  lavender: { primary: "262 83% 58%", accent: "280 60% 65%", ring: "262 83% 58%" },
  rose: { primary: "340 80% 60%", accent: "350 70% 65%", ring: "340 80% 60%" },
  sky: { primary: "200 80% 55%", accent: "210 70% 60%", ring: "200 80% 55%" },
  mint: { primary: "160 60% 45%", accent: "170 50% 50%", ring: "160 60% 45%" },
  amber: { primary: "38 90% 50%", accent: "45 80% 55%", ring: "38 90% 50%" },
  coral: { primary: "16 80% 55%", accent: "25 70% 60%", ring: "16 80% 55%" },
  teal: { primary: "180 60% 40%", accent: "190 50% 45%", ring: "180 60% 40%" },
  violet: { primary: "280 70% 55%", accent: "290 60% 60%", ring: "280 70% 55%" },
  peach: { primary: "25 80% 60%", accent: "30 70% 65%", ring: "25 80% 60%" },
  sage: { primary: "140 30% 45%", accent: "150 25% 50%", ring: "140 30% 45%" },
};

interface AppContextType {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
  updateUser: (partial: Partial<UserData>) => void;
  updateProfile: (partial: Partial<UserData>) => Promise<void>;
  logout: () => Promise<void>;
  isDark: boolean;
  toggleDark: () => void;
  authUser: User | null;
  authLoading: boolean;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

const applyThemeColors = (themeId: string, isDark: boolean) => {
  const colors = THEME_COLORS[themeId] || THEME_COLORS.lavender;
  const root = document.documentElement;
  if (isDark) {
    const parts = colors.primary.split(" ");
    root.style.setProperty("--primary", `${parts[0]} ${parts[1]} 65%`);
    root.style.setProperty("--accent", `${colors.accent.split(" ")[0]} ${colors.accent.split(" ")[1]} 70%`);
    root.style.setProperty("--ring", `${parts[0]} ${parts[1]} 65%`);
  } else {
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--ring", colors.ring);
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData>(defaultUser);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("career_app_dark") === "true");

  const loadProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(); // ✅ maybeSingle used to prevent crash if profile doesn't exist yet

      if (error) {
        console.error("Error loading profile:", error.message);
        return;
      }

      if (data) {
        setUser({
          ...defaultUser,
          id: data.user_id, // ✅ Essential for storing chats
          username: data.username || "",
          email: email || data.email || "",
          isLoggedIn: true,
          onboardingComplete: data.onboarding_complete || false,
          education: data.education || "",
          careerGoal: data.career_goal || "",
          skillLevel: data.skill_level || "",
          learningTime: data.learning_time || "",
          knownSkills: data.known_skills || [],
          mentorName: data.mentor_name || "",
          points: data.points || 0,
          streak: data.streak || 0,
          profilePhoto: data.profile_photo || "",
          phone: data.phone || "",
          theme: data.theme || "lavender",
          fontSize: data.font_size || "medium",
          completedDays: (data.completed_days as Record<string, boolean[]>) || {},
          lastStreakDate: data.last_streak_date || "",
        });
      }
    } catch (err) {
      console.error("Profile load system error:", err);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        loadProfile(session.user.id, session.user.email || "");
      } else {
        setAuthUser(null);
        setUser(defaultUser);
      }
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        loadProfile(session.user.id, session.user.email || "");
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem("career_app_dark", String(isDark));
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    applyThemeColors(user.theme, isDark);
  }, [isDark, user.theme]);

  useEffect(() => {
    const sizes: Record<string, string> = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = sizes[user.fontSize] || "16px";
  }, [user.fontSize]);

  const updateUser = (partial: Partial<UserData>) =>
    setUser(prev => ({ ...prev, ...partial }));

  const updateProfile = async (partial: Partial<UserData>) => {
    setUser(prev => ({ ...prev, ...partial }));
    if (!authUser) return;

    const dbFields: any = {};
    if (partial.username !== undefined) dbFields.username = partial.username;
    if (partial.email !== undefined) dbFields.email = partial.email;
    if (partial.education !== undefined) dbFields.education = partial.education;
    if (partial.careerGoal !== undefined) dbFields.career_goal = partial.careerGoal;
    if (partial.skillLevel !== undefined) dbFields.skill_level = partial.skillLevel;
    if (partial.learningTime !== undefined) dbFields.learning_time = partial.learningTime;
    if (partial.knownSkills !== undefined) dbFields.known_skills = partial.knownSkills;
    if (partial.mentorName !== undefined) dbFields.mentor_name = partial.mentorName;
    if (partial.onboardingComplete !== undefined) dbFields.onboarding_complete = partial.onboardingComplete;
    if (partial.points !== undefined) dbFields.points = partial.points;
    if (partial.streak !== undefined) dbFields.streak = partial.streak;
    if (partial.profilePhoto !== undefined) dbFields.profile_photo = partial.profilePhoto;
    if (partial.phone !== undefined) dbFields.phone = partial.phone;
    if (partial.theme !== undefined) dbFields.theme = partial.theme;
    if (partial.fontSize !== undefined) dbFields.font_size = partial.fontSize;
    if (partial.lastStreakDate !== undefined) dbFields.last_streak_date = partial.lastStreakDate;
    if (partial.completedDays !== undefined) dbFields.completed_days = partial.completedDays;

    if (Object.keys(dbFields).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(dbFields)
        .eq("user_id", authUser.id);
      if (error) console.error("Update error:", error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(defaultUser);
    setAuthUser(null);
    localStorage.removeItem("career_app_local");
  };

  const toggleDark = () => setIsDark(prev => !prev);

  return (
    <AppContext.Provider value={{ 
      user, 
      setUser, 
      updateUser, 
      updateProfile, 
      logout, 
      isDark, 
      toggleDark, 
      authUser, 
      authLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
};