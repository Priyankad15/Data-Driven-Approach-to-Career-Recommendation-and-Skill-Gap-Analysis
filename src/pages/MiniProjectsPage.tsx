import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import ParticleBackground from "@/components/ParticleBackground";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/Confetti";

type Project = {
  title: string;
  level: "Easy" | "Medium" | "Hard";
  desc: string;
  definition: string;
  why: string;
  learn: string;
  tools: string;
  steps: string[];
};

// ---------------- PROJECTS ----------------
const projects: Project[] = [
  // 🟢 EASY PROJECTS
  {
    title: "To-Do List App",
    level: "Easy",
    desc: "Simple task manager app",
    definition:
      "A basic app where users can add, delete, and mark tasks as completed.",
    why: "Helps understand basic app logic used in all software apps.",
    learn: "CRUD operations, state management, UI basics.",
    tools: "React / JavaScript",
    steps: [
      "Create input field",
      "Add task to list",
      "Display tasks",
      "Delete task",
      "Mark as completed",
    ],
  },
  {
    title: "Weather App",
    level: "Easy",
    desc: "Live weather tracker",
    definition:
      "An app that shows real-time weather details of any city using API.",
    why: "Teaches API integration used in real-world apps.",
    learn: "Fetching API data, JSON handling.",
    tools: "React + Weather API",
    steps: [
      "Get API key",
      "Create search input",
      "Fetch weather data",
      "Display temperature",
      "Show weather icon",
    ],
  },
  {
    title: "Calculator App",
    level: "Easy",
    desc: "Basic arithmetic calculator",
    definition:
      "A simple calculator that performs basic math operations.",
    why: "Builds logic and event handling skills.",
    learn: "Functions, events, conditions.",
    tools: "HTML / CSS / JavaScript",
    steps: [
      "Create UI buttons",
      "Capture input values",
      "Perform calculations",
      "Display result",
      "Add clear button",
    ],
  },
  {
    title: "Notes App",
    level: "Easy",
    desc: "Save personal notes",
    definition:
      "An app where users can write, save, and delete notes using browser storage.",
    why: "Teaches local storage concept.",
    learn: "localStorage, CRUD, UI updates.",
    tools: "React / JS",
    steps: [
      "Create note input",
      "Save to localStorage",
      "Display notes",
      "Delete notes",
      "Persist data on reload",
    ],
  },

  // 🟡 MEDIUM PROJECTS
  {
    title: "E-Commerce UI",
    level: "Medium",
    desc: "Shopping website frontend",
    definition:
      "A product listing website where users can view items like an online store.",
    why: "Real-world UI design practice used in companies.",
    learn: "Components, routing, UI structuring.",
    tools: "React + Tailwind CSS",
    steps: [
      "Design product cards",
      "Create homepage",
      "Add navigation",
      "Build cart UI",
      "Make responsive design",
    ],
  },
  {
    title: "Login Authentication System",
    level: "Medium",
    desc: "User login/signup system",
    definition:
      "A system where users can register, login, and access protected pages.",
    why: "Almost every app uses authentication.",
    learn: "Form validation, auth flow.",
    tools: "React + Firebase / Node.js",
    steps: [
      "Create signup form",
      "Create login form",
      "Validate inputs",
      "Store user data",
      "Protect routes",
    ],
  },

  // 🔴 HARD PROJECTS
  {
    title: "Job Portal (Full Stack)",
    level: "Hard",
    desc: "Job posting & applying platform",
    definition:
      "A full system where companies post jobs and users apply for them.",
    why: "Real industry-level project for placements.",
    learn: "Full stack development, database, APIs.",
    tools: "React + Node.js + MongoDB",
    steps: [
      "Design UI",
      "Create backend APIs",
      "Setup database",
      "Add job posting system",
      "Enable apply feature",
      "Deploy full app",
    ],
  },
  {
    title: "AI Chatbot System",
    level: "Hard",
    desc: "Smart AI assistant chatbot",
    definition:
      "A chatbot that can answer user questions using AI or API integration.",
    why: "Modern AI skill used in top companies.",
    learn: "API integration, AI logic handling.",
    tools: "React + OpenAI API",
    steps: [
      "Create chat UI",
      "Connect AI API",
      "Send user input",
      "Receive response",
      "Improve conversation flow",
    ],
  },
];

// ---------------- COMPONENT ----------------
const MiniProjectsPage = () => {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const markComplete = (title: string) => {
    if (!user.completedProjects.includes(title)) {
      updateUser({
        completedProjects: [...user.completedProjects, title],
        points: user.points + 50,
      });

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      <ProfileDropdown />
      <Confetti show={showConfetti} />

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <h1 className="text-2xl font-bold mb-6">
          🧩 Mini Projects (Easy → Hard Roadmap)
        </h1>

        {/* LIST VIEW */}
        {selected === null ? (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p, i) => (
              <div
                key={i}
                onClick={() => setSelected(i)}
                className="glass-card-hover p-5 cursor-pointer"
              >
                <h3 className="font-bold">
                  {p.title}{" "}
                  <span className="text-xs ml-2">
                    ({p.level})
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
                <p className="text-xs mt-2">🛠 {p.tools}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6">

            <button
              onClick={() => setSelected(null)}
              className="text-sm mb-4 text-primary"
            >
              ← Back
            </button>

            <h2 className="text-xl font-bold">
              {projects[selected].title}
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Level: {projects[selected].level}
            </p>

            <p className="mt-3">{projects[selected].desc}</p>

            <h3 className="mt-4 font-semibold">📌 What is this?</h3>
            <p className="text-sm">{projects[selected].definition}</p>

            <h3 className="mt-4 font-semibold">🎯 Why this project?</h3>
            <p className="text-sm">{projects[selected].why}</p>

            <h3 className="mt-4 font-semibold">🧠 What you will learn</h3>
            <p className="text-sm">{projects[selected].learn}</p>

            <h3 className="mt-4 font-semibold">🛠 Tools</h3>
            <p className="text-sm">{projects[selected].tools}</p>

            <h3 className="mt-4 font-semibold">📋 Steps</h3>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {projects[selected].steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>

            {!user.completedProjects.includes(projects[selected].title) && (
              <Button
                className="mt-5"
                onClick={() => markComplete(projects[selected].title)}
              >
                Mark Completed ✅
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniProjectsPage;
