import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, ResumeData } from "@/contexts/AppContext";
import ParticleBackground from "@/components/ParticleBackground";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ArrowLeft, Download, Edit, Camera, Image as ImageIcon, FileText, Eye, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ResumePreview from "@/components/ResumePreview";

const TEMPLATES = [
  { id: "azure-executive",  name: "Azure Executive",  desc: "Navy sidebar · Serif",         color: "#1e3a8a" },
  { id: "emerald-modern",   name: "Emerald Modern",   desc: "Green sidebar · Modern",        color: "#065f46" },
  { id: "crimson-bold",     name: "Crimson Bold",     desc: "Red right · Strong",            color: "#991b1b" },
  { id: "midnight-pro",     name: "Midnight Pro",     desc: "Slate · Corporate",             color: "#0f172a" },
  { id: "sunset-creative",  name: "Sunset Creative",  desc: "Orange band · Warm",            color: "#ea580c" },
  { id: "minimal-mono",     name: "Minimal Mono",     desc: "Black & white · Clean",         color: "#000000" },
  { id: "tech-cyan",        name: "Tech Cyan",        desc: "Mono font · Developer",         color: "#0e7490" },
  { id: "rose-elegant",     name: "Rose Elegant",     desc: "Centered · Serif",              color: "#9f1239" },
  { id: "violet-creative",  name: "Violet Creative",  desc: "Purple sidebar · Bold",         color: "#5b21b6" },
  { id: "gold-luxury",      name: "Gold Luxury",      desc: "Amber band · Premium",          color: "#b45309" },
  { id: "teal-clean",       name: "Teal Clean",       desc: "Two-column · Balanced",         color: "#0d9488" },
  { id: "graphite-classic", name: "Graphite Classic", desc: "Times serif · Traditional",     color: "#1f2937" },
  { id: "indigo-timeline",  name: "Indigo Timeline",  desc: "Vertical line · Story",         color: "#4f46e5" },
  { id: "olive-natural",    name: "Olive Natural",    desc: "Green earthy · Calm",           color: "#65a30d" },
  { id: "slate-corporate",  name: "Slate Corporate",  desc: "Slate band · Business",         color: "#475569" },
];

type Step = "templates" | "form" | "preview" | "history";
type FormData = Record<string, string>;

const FIELDS: { key: string; label: string; placeholder: string; multiline?: boolean; rows?: number; required?: boolean }[] = [
  { key: "name",           label: "Full Name *",        placeholder: "John Doe", required: true },
  { key: "title",          label: "Job Title / Role",   placeholder: "Software Engineer" },
  { key: "email",          label: "Email",              placeholder: "john@example.com" },
  { key: "phone",          label: "Phone",              placeholder: "+1 555 123 4567" },
  { key: "location",       label: "Location",           placeholder: "New York, USA" },
  { key: "linkedin",       label: "LinkedIn",           placeholder: "linkedin.com/in/johndoe" },
  { key: "website",        label: "Portfolio / Website", placeholder: "johndoe.dev" },
  { key: "summary",        label: "Professional Summary", placeholder: "A short 2-3 line summary about you...", multiline: true, rows: 3 },
  { key: "education",      label: "Education",          placeholder: "B.Tech in Computer Science\nXYZ University · 2020 - 2024 · CGPA 8.5", multiline: true, rows: 3 },
  { key: "experience",     label: "Work Experience",    placeholder: "Fresher? Delete this section using the 🗑 icon →", multiline: true, rows: 5 },
  { key: "projects",       label: "Projects",           placeholder: "E-commerce App — React, Node.js\n• 10k+ users, payment integration", multiline: true, rows: 4 },
  { key: "skills",         label: "Skills (comma separated)", placeholder: "React, Node.js, Python, SQL, AWS" },
  { key: "certifications", label: "Certifications",     placeholder: "AWS Certified Developer (2024)", multiline: true, rows: 2 },
  { key: "languages",      label: "Languages",          placeholder: "English, Spanish, French" },
  { key: "hobbies",        label: "Interests / Hobbies", placeholder: "Reading, Photography, Chess" },
];

const ResumeBuilderPage = () => {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);

  const selectTemplate = (t: typeof TEMPLATES[0]) => {
    setSelectedTemplate(t);
    // Pre-fill from profile
    setFormData({
      name: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      title: user.careerGoal || "",
      education: user.education || "",
      skills: user.knownSkills.join(", "),
    });
    setStep("form");
  };

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Use an image under 5MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, photo: reader.result as string }));
      toast({ title: "Photo added ✅" });
    };
    reader.readAsDataURL(file);
  };

  const goPreview = () => {
    if (!formData.name?.trim()) {
      toast({ title: "Name required", description: "Please enter your full name", variant: "destructive" });
      return;
    }
    setStep("preview");
  };

  const saveAndDownload = async (mode: "png" | "pdf") => {
    if (!selectedTemplate) return;
    setDownloading(true);
    const el = document.getElementById("resume-preview");
    if (!el) { setDownloading(false); return; }

    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, {
  scale: 1.5,
  useCORS: true,
  backgroundColor: "#ffffff",
  width: 794,
  height: 1123,
  windowWidth: 794,
  windowHeight: 1123,
  scrollX: 0,
  scrollY: 0,
  logging: false,
});
      const filename = `${(formData.name || "Resume").replace(/\s+/g, "_")}_${selectedTemplate.id}`;

      if (mode === "png") {
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        const { default: jsPDF } = await import("jspdf");
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        const imgH = (canvas.height * pdfW) / canvas.width;
        let position = 0;
        let heightLeft = imgH;
        pdf.addImage(imgData, "PNG", 0, position, pdfW, imgH);
        heightLeft -= pdfH;
        while (heightLeft > 0) {
          position = heightLeft - imgH;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfW, imgH);
          heightLeft -= pdfH;
        }
        pdf.save(`${filename}.pdf`);
      }

      // Save to history
      const newResume: ResumeData = {
        id: Date.now().toString(),
        name: `${formData.name || "Resume"} · ${selectedTemplate.name}`,
        template: selectedTemplate.id,
        date: new Date().toLocaleDateString(),
        data: formData,
      };
      updateUser({ resumes: [...user.resumes, newResume] });
      toast({ title: `Resume downloaded! 📥`, description: `Saved as ${mode.toUpperCase()}` });
    } catch (err) {
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      <ParticleBackground />
      <ProfileDropdown />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhoto} />

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <button
          onClick={() => (step === "templates" || step === "history" ? navigate("/dashboard") : setStep(step === "preview" ? "form" : "templates"))}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {step === "templates" || step === "history" ? "Dashboard" : "Back"}
        </button>

        <div className="flex gap-3 mb-6">
          <button onClick={() => setStep("templates")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${step !== "history" ? "bg-primary text-primary-foreground" : "glass-card text-foreground hover:bg-secondary"}`}>
            📝 New Resume
          </button>
          <button onClick={() => setStep("history")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${step === "history" ? "bg-primary text-primary-foreground" : "glass-card text-foreground hover:bg-secondary"}`}>
            🕘 History ({user.resumes.length})
          </button>
        </div>

        {/* TEMPLATE SELECTION */}
        {step === "templates" && (
          <div className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Choose a Template</h1>
            <p className="text-muted-foreground mb-6 text-sm">15 professional designs — pick one and start filling in details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {TEMPLATES.map(t => {
                const layoutType = ["azure-executive","emerald-modern","midnight-pro","olive-natural"].includes(t.id) ? "sidebar-left"
                  : ["crimson-bold","violet-creative"].includes(t.id) ? "sidebar-right"
                  : ["sunset-creative","gold-luxury","slate-corporate"].includes(t.id) ? "header-band"
                  : ["rose-elegant"].includes(t.id) ? "centered"
                  : ["indigo-timeline"].includes(t.id) ? "timeline"
                  : ["tech-cyan","teal-clean"].includes(t.id) ? "two-column"
                  : "minimal";

                return (
                  <div key={t.id} onClick={() => selectTemplate(t)} className="glass-card-hover cursor-pointer overflow-hidden group rounded-xl">
                    <div className="aspect-[3/4] relative overflow-hidden bg-white">
                      {/* Mini resume rendering */}
                      <div className="absolute inset-0 flex" style={{ fontSize: "4px" }}>
                        {layoutType === "sidebar-left" && (
                          <>
                            <div className="w-[35%] p-2 flex flex-col items-center" style={{ background: t.color, color: "#fff" }}>
                              <div className="w-6 h-6 rounded-full bg-white/30 mb-1.5" />
                              <div className="h-1 w-full bg-white/70 mb-0.5 rounded-sm" />
                              <div className="h-0.5 w-3/4 bg-white/50 mb-2 rounded-sm" />
                              <div className="w-full space-y-0.5 mb-2">{[...Array(4)].map((_,i)=><div key={i} className="h-0.5 bg-white/40 rounded-sm"/>)}</div>
                              <div className="h-1 w-1/2 bg-white/70 mb-0.5 rounded-sm" />
                              <div className="w-full flex flex-wrap gap-0.5">{[...Array(6)].map((_,i)=><div key={i} className="h-1 w-2.5 bg-white/40 rounded-full"/>)}</div>
                            </div>
                            <div className="flex-1 p-2 space-y-1.5">
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(4)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                            </div>
                          </>
                        )}
                        {layoutType === "sidebar-right" && (
                          <>
                            <div className="flex-1 p-2 space-y-1.5">
                              <div className="h-1.5 w-1/2 rounded-sm" style={{ background: t.color }} />
                              <div className="h-0.5 w-1/3 bg-gray-400 rounded-sm mb-1" />
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(4)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                            </div>
                            <div className="w-[35%] p-2 flex flex-col items-center" style={{ background: t.color, color: "#fff" }}>
                              <div className="w-6 h-6 rounded-full bg-white/30 mb-1.5" />
                              <div className="h-1 w-full bg-white/70 mb-0.5 rounded-sm" />
                              <div className="w-full space-y-0.5 mb-2">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-white/40 rounded-sm"/>)}</div>
                              <div className="w-full flex flex-wrap gap-0.5">{[...Array(5)].map((_,i)=><div key={i} className="h-1 w-2.5 bg-white/40 rounded-full"/>)}</div>
                            </div>
                          </>
                        )}
                        {layoutType === "header-band" && (
                          <div className="flex-1 flex flex-col">
                            <div className="p-2 flex items-center gap-1.5" style={{ background: t.color, color: "#fff" }}>
                              <div className="w-5 h-5 rounded-full bg-white/30" />
                              <div className="flex-1">
                                <div className="h-1 w-3/4 bg-white/80 rounded-sm mb-0.5" />
                                <div className="h-0.5 w-1/2 bg-white/50 rounded-sm" />
                              </div>
                            </div>
                            <div className="flex-1 p-2 space-y-1.5">
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(4)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                              <div className="flex flex-wrap gap-0.5 mt-1">{[...Array(6)].map((_,i)=><div key={i} className="h-1 w-3 rounded-full" style={{ background: t.color, opacity: 0.5 }}/>)}</div>
                            </div>
                          </div>
                        )}
                        {layoutType === "centered" && (
                          <div className="flex-1 p-2 flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full mb-1" style={{ background: t.color, opacity: 0.3 }} />
                            <div className="h-1.5 w-2/3 rounded-sm mb-0.5" style={{ background: t.color }} />
                            <div className="h-0.5 w-1/3 bg-gray-400 rounded-sm mb-1" />
                            <div className="h-px w-1/4 mb-1.5" style={{ background: t.color }} />
                            <div className="w-full space-y-1.5">
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                            </div>
                          </div>
                        )}
                        {layoutType === "two-column" && (
                          <div className="flex-1 p-2 flex flex-col">
                            <div className="pb-1 mb-1.5 border-b-2" style={{ borderColor: t.color }}>
                              <div className="h-1.5 w-1/2 rounded-sm mb-0.5" style={{ background: t.color }} />
                              <div className="h-0.5 w-1/3 bg-gray-400 rounded-sm" />
                            </div>
                            <div className="flex-1 grid grid-cols-[1.6fr_1fr] gap-1.5">
                              <div className="space-y-1">
                                <div className="h-1 w-1/2 rounded-sm" style={{ background: t.color }} />
                                <div className="space-y-0.5">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                                <div className="h-1 w-1/2 rounded-sm" style={{ background: t.color }} />
                                <div className="space-y-0.5">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="h-1 w-3/4 rounded-sm" style={{ background: t.color }} />
                                <div className="flex flex-wrap gap-0.5">{[...Array(5)].map((_,i)=><div key={i} className="h-1 w-2.5 rounded-full" style={{ background: t.color, opacity: 0.5 }}/>)}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {layoutType === "timeline" && (
                          <div className="flex-1 p-2">
                            <div className="pl-1.5 border-l-2 mb-2" style={{ borderColor: t.color }}>
                              <div className="h-1.5 w-1/2 rounded-sm" style={{ background: t.color }} />
                              <div className="h-0.5 w-1/3 bg-gray-400 rounded-sm mt-0.5" />
                            </div>
                            <div className="space-y-1.5">
                              {[...Array(3)].map((_,i)=>(
                                <div key={i} className="pl-1.5 border-l-2" style={{ borderColor: t.color, opacity: 0.6 }}>
                                  <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                                  <div className="h-0.5 w-3/4 bg-gray-300 rounded-sm mt-0.5" />
                                  <div className="h-0.5 w-2/3 bg-gray-300 rounded-sm mt-0.5" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {layoutType === "minimal" && (
                          <div className="flex-1 p-2.5">
                            <div className="pb-1 mb-1.5 border-b-2" style={{ borderColor: t.color }}>
                              <div className="h-2 w-2/3 rounded-sm mb-0.5" style={{ background: t.color }} />
                              <div className="h-0.5 w-1/3 bg-gray-500 rounded-sm" />
                            </div>
                            <div className="space-y-1.5">
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(3)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                              <div className="h-1 w-1/3 rounded-sm" style={{ background: t.color }} />
                              <div className="space-y-0.5">{[...Array(4)].map((_,i)=><div key={i} className="h-0.5 bg-gray-300 rounded-sm"/>)}</div>
                              <div className="flex flex-wrap gap-0.5 mt-1">{[...Array(5)].map((_,i)=><div key={i} className="h-1 w-3 rounded-full" style={{ background: t.color, opacity: 0.4 }}/>)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-semibold flex items-center gap-1.5 bg-primary px-3 py-2 rounded-full shadow-lg">
                          <Eye className="w-3.5 h-3.5" /> Use Template
                        </span>
                      </div>
                    </div>
                    <div className="p-3 border-t border-border">
                      <p className="font-semibold text-foreground text-sm truncate">{t.name}</p>
                      <p className="text-muted-foreground text-xs truncate">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FORM */}
        {step === "form" && selectedTemplate && (
          <div className="animate-fade-in grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 md:p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div>
                  <h2 className="font-bold text-foreground">Fill Your Details</h2>
                  <p className="text-xs text-muted-foreground">Template: <span className="font-medium" style={{ color: selectedTemplate.color }}>{selectedTemplate.name}</span></p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep("templates")}>Change</Button>
              </div>

              {/* Photo */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                {formData.photo ? (
                  <img src={formData.photo} className="w-16 h-16 rounded-full object-cover border-2 border-primary" alt="" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-2xl">👤</div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1">
                    <ImageIcon className="w-3 h-3" /> Upload
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => cameraInputRef.current?.click()} className="gap-1">
                    <Camera className="w-3 h-3" /> Camera
                  </Button>
                  {formData.photo && (
                    <Button size="sm" variant="ghost" onClick={() => updateField("photo", "")}>Remove</Button>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {FIELDS.map(f => {
                  if (hiddenFields.has(f.key)) return null;
                  return (
                    <div key={f.key} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor={f.key} className="text-xs font-medium">{f.label}</Label>
                        {!f.required && (
                          <button
                            type="button"
                            onClick={() => {
                              setHiddenFields(prev => new Set(prev).add(f.key));
                              setFormData(prev => ({ ...prev, [f.key]: "" }));
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                            title="Remove this section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {f.multiline ? (
                        <Textarea
                          id={f.key}
                          placeholder={f.placeholder}
                          value={formData[f.key] || ""}
                          onChange={e => updateField(f.key, e.target.value)}
                          rows={f.rows || 3}
                          className="text-sm"
                        />
                      ) : (
                        <Input
                          id={f.key}
                          placeholder={f.placeholder}
                          value={formData[f.key] || ""}
                          onChange={e => updateField(f.key, e.target.value)}
                          className="text-sm"
                        />
                      )}
                    </div>
                  );
                })}

                {hiddenFields.size > 0 && (
                  <div className="pt-3 mt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Removed sections — click to restore:</p>
                    <div className="flex flex-wrap gap-2">
                      {[...hiddenFields].map(key => {
                        const f = FIELDS.find(x => x.key === key);
                        if (!f) return null;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setHiddenFields(prev => { const n = new Set(prev); n.delete(key); return n; })}
                            className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> {f.label.replace(" *", "")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={goPreview} className="w-full btn-glow mt-5 gap-2">
                <Eye className="w-4 h-4" /> Preview Resume
              </Button>
            </div>

            {/* Live mini-preview */}
            <div className="hidden lg:block sticky top-6 self-start">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Live Preview</p>
              <div
  className="rounded-xl overflow-hidden shadow-2xl bg-white"
  style={{
    transform: "scale(0.5)",
    transformOrigin: "top left",
    width: "794px",
    height: "1123px",
    overflow: "hidden",
  }}
>
                <ResumePreview templateId={selectedTemplate.id} templateName={selectedTemplate.name} resumeData={formData} user={user} hiddenFields={hiddenFields} />
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {step === "preview" && selectedTemplate && (
          <div className="animate-fade-in">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Your Resume</h2>
                <span className="text-xs text-muted-foreground">{selectedTemplate.name}</span>
              </div>
              <div
  id="resume-preview"
  className="overflow-hidden rounded-xl mb-4 shadow-2xl bg-white"
  style={{
    width: "794px",
    height: "1123px",
    overflow: "hidden",
    pageBreakInside: "avoid",
  }}
>
                <ResumePreview templateId={selectedTemplate.id} templateName={selectedTemplate.name} resumeData={formData} user={user} hiddenFields={hiddenFields} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button onClick={() => setStep("form")} variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </Button>
                <Button onClick={() => saveAndDownload("png")} variant="outline" disabled={downloading} className="gap-2">
                  <Download className="w-4 h-4" /> PNG
                </Button>
                <Button onClick={() => saveAndDownload("pdf")} disabled={downloading} className="btn-glow gap-2">
                  <FileText className="w-4 h-4" /> {downloading ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {step === "history" && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground mb-6">🕘 Resume History</h1>
            {user.resumes.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground mb-4">No resumes yet. Create your first one!</p>
                <Button onClick={() => setStep("templates")} className="btn-glow">Create Resume</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.resumes.map(r => {
                  const t = TEMPLATES.find(t => t.id === r.template);
                  return (
                    <div key={r.id} className="glass-card p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-12 rounded-full" style={{ backgroundColor: t?.color || "#888" }} />
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground">{r.name}</h3>
                          <p className="text-muted-foreground text-xs">{r.date} · {t?.name || r.template}</p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => {
                              if (t) { setSelectedTemplate(t); setFormData(r.data); setStep("preview"); }
                            }}>View</Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              if (t) { setSelectedTemplate(t); setFormData(r.data); setStep("form"); }
                            }}>Edit</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
