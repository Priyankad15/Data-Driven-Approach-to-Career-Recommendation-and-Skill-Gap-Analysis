import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import ParticleBackground from "@/components/ParticleBackground";
import ProfileDropdown from "@/components/ProfileDropdown";
import Confetti from "@/components/Confetti";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface QuizQ { q: string; options: string[]; answer: number; }

const DailyChallengePage = () => {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = new Date().toDateString();

  // Use ALL known skills so questions can be mixed across them
  const skills = useMemo(() => {
    const list = (user.knownSkills && user.knownSkills.length > 0) ? user.knownSkills : ["JavaScript"];
    return list;
  }, [user.knownSkills]);

  const primarySkill = skills[0];

  // Learning day = (max completed days for primary skill) + 1, clamped 1..10
  const learningDay = useMemo(() => {
    const completed = user.completedDays?.[primarySkill] || [];
    const doneCount = completed.filter(Boolean).length;
    return Math.min(10, Math.max(1, doneCount + 1));
  }, [user.completedDays, primarySkill]);

  const [quizQuestions, setQuizQuestions] = useState<QuizQ[]>([]);
  const [interviewQ, setInterviewQ] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [{ data: quiz }, { data: interview }] = await Promise.all([
        supabase
          .from("daily_quiz")
          .select("skill, q, options, answer, q_order")
          .in("skill", skills)
          .eq("day", learningDay)
          .order("q_order", { ascending: true }),
        supabase
          .from("daily_interview")
          .select("skill, question")
          .in("skill", skills)
          .eq("day", learningDay),
      ]);
      if (!active) return;

      // Round-robin mix across skills → 4 questions total
      const bySkill: Record<string, any[]> = {};
      (quiz || []).forEach((r: any) => {
        (bySkill[r.skill] ||= []).push(r);
      });
      const order = skills.filter(s => bySkill[s]?.length);
      const mixed: any[] = [];
      while (mixed.length < 4 && order.some(s => bySkill[s]?.length)) {
        for (const s of order) {
          if (mixed.length >= 4) break;
          const pool = bySkill[s];
          if (pool && pool.length) mixed.push(pool.shift());
        }
      }

      setQuizQuestions(
        mixed.map((r: any) => ({
          q: skills.length > 1 ? `[${r.skill}] ${r.q}` : r.q,
          options: Array.isArray(r.options) ? r.options : JSON.parse(r.options),
          answer: r.answer,
        }))
      );

      // Rotate interview across skills by day
      const list = interview || [];
      if (list.length > 0) {
        const pickSkill = skills[(learningDay - 1) % skills.length];
        const chosen = list.find((r: any) => r.skill === pickSkill) || list[0];
        setInterviewQ(skills.length > 1 ? `[${chosen.skill}] ${chosen.question}` : chosen.question);
      } else {
        setInterviewQ("Explain a concept you learned recently and how you'd apply it.");
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [skills, learningDay]);

  const isNewDay = user.dailyChallengeDate !== today;
  const [score, setScore] = useState(isNewDay ? 0 : user.dailyChallengeScore);
  const [completed, setCompleted] = useState(isNewDay ? [false, false, false, false, false] : [...user.dailyChallengesCompleted]);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [practiceCode, setPracticeCode] = useState("");
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [explanationSubmitted, setExplanationSubmitted] = useState(false);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewSubmitted, setInterviewSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Reset answers array when quizQuestions length changes
  useEffect(() => {
    setQuizAnswers(new Array(quizQuestions.length).fill(null));
    setQuizSubmitted(false);
  }, [quizQuestions.length]);

  const addScore = (pts: number, taskIndex: number) => {
    const newScore = score + pts;
    const newCompleted = [...completed];
    newCompleted[taskIndex] = true;
    setScore(newScore);
    setCompleted(newCompleted);
    const allDone = newCompleted.every(Boolean);
    const bonus = allDone ? 25 : 0;
    updateUser({
      dailyChallengeDate: today,
      dailyChallengeScore: newScore + bonus,
      dailyChallengesCompleted: newCompleted,
      points: user.points + pts + bonus,
    });
    if (allDone) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      toast({ title: `Amazing ${user.username || "Champ"}! You're improving daily 🔥🚀` });
    }
  };

  const submitQuiz = () => {
    let correct = 0;
    quizQuestions.forEach((q, i) => { if (quizAnswers[i] === q.answer) correct++; });
    addScore(correct * 10, 0);
    setQuizSubmitted(true);
    toast({ title: `Quiz: ${correct}/${quizQuestions.length} correct! +${correct * 10} pts` });
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      <ProfileDropdown />
      <Confetti show={showConfetti} />
      <div className="relative z-10 max-w-3xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="glass-card p-6 mb-6 text-center animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">📅 Daily Challenges</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {skills.join(" · ")} · Day {learningDay} of 10
          </p>
          <div className="flex justify-center gap-6 mt-3">
            <span className="text-lg">Today's Score: <strong className="text-primary">{score}</strong></span>
            <span className="text-lg">Total: <strong className="text-primary">{user.points}</strong> <Trophy className="w-4 h-4 inline" /></span>
          </div>
        </div>

        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading today's challenges…</span>
          </div>
        ) : (
          <>
            {/* 1. Quiz */}
            <div className="glass-card p-6 mb-4 animate-slide-up">
              <h2 className="font-bold text-foreground text-lg mb-4">🧠 Concept Quiz {completed[0] && "✅"}</h2>
              {quizQuestions.length === 0 && (
                <p className="text-muted-foreground text-sm">No quiz available for this skill/day yet.</p>
              )}
              {quizQuestions.map((q, qi) => (
                <div key={qi} className="mb-4">
                  <p className="font-medium text-foreground mb-2">Q{qi + 1}. {q.q}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <button key={oi} disabled={quizSubmitted}
                        onClick={() => { const a = [...quizAnswers]; a[qi] = oi; setQuizAnswers(a); }}
                        className={`p-2 rounded-lg border text-sm transition-all text-left ${quizAnswers[qi] === oi ? "border-primary bg-primary/10" : "border-border"} ${quizSubmitted && oi === q.answer ? "border-success bg-success/10" : ""} ${quizSubmitted && quizAnswers[qi] === oi && oi !== q.answer ? "border-destructive bg-destructive/10" : ""}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!quizSubmitted && quizQuestions.length > 0 && (
                <Button onClick={submitQuiz} disabled={quizAnswers.some(a => a === null)} className="w-full btn-glow">Submit Quiz</Button>
              )}
            </div>

            {/* 2. Mini Practice */}
            <div className="glass-card p-6 mb-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="font-bold text-foreground text-lg mb-2">💻 Mini Practice Task {completed[1] && "✅"}</h2>
              <p className="text-muted-foreground text-sm mb-3">Write a small code snippet related to your current skills.</p>
              <Textarea value={practiceCode} onChange={e => setPracticeCode(e.target.value)} placeholder="Write your code here..." disabled={practiceSubmitted} />
              {!practiceSubmitted && <Button onClick={() => { setPracticeSubmitted(true); addScore(15, 1); toast({ title: "+15 points! 💻" }); }} disabled={!practiceCode.trim()} className="w-full mt-3 btn-glow">Submit</Button>}
            </div>

            {/* 3. Explain */}
            <div className="glass-card p-6 mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="font-bold text-foreground text-lg mb-2">💬 Explain What You Learned {completed[2] && "✅"}</h2>
              <Textarea value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Write 2 lines about what you learned..." disabled={explanationSubmitted} />
              {!explanationSubmitted && <Button onClick={() => { setExplanationSubmitted(true); addScore(10, 2); toast({ title: "+10 points! 💬" }); }} disabled={!explanation.trim()} className="w-full mt-3 btn-glow">Submit</Button>}
            </div>

            {/* 4. Interview */}
            <div className="glass-card p-6 mb-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="font-bold text-foreground text-lg mb-2">💼 Interview Question {completed[3] && "✅"}</h2>
              <p className="font-medium text-foreground mb-3">{interviewQ}</p>
              <Textarea value={interviewAnswer} onChange={e => setInterviewAnswer(e.target.value)} placeholder="Your answer..." disabled={interviewSubmitted} />
              {!interviewSubmitted && <Button onClick={() => { setInterviewSubmitted(true); addScore(20, 3); toast({ title: "+20 points! 💼" }); }} disabled={!interviewAnswer.trim()} className="w-full mt-3 btn-glow">Submit</Button>}
            </div>

            {/* 5. Consistency */}
            <div className="glass-card p-6 mb-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <h2 className="font-bold text-foreground text-lg mb-2">🔥 Consistency Challenge {completed[4] && "✅"}</h2>
              <p className="text-muted-foreground text-sm">Complete all tasks above for bonus points!</p>
              {completed[0] && completed[1] && completed[2] && completed[3] && !completed[4] && (
                <Button onClick={() => { addScore(25, 4); toast({ title: "🔥 Consistency bonus! +25 pts!" }); }} className="w-full mt-3 btn-glow">Claim Bonus 🚀</Button>
              )}
              {completed[4] && <p className="text-success font-bold mt-3">All challenges completed! 🎉</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DailyChallengePage;



