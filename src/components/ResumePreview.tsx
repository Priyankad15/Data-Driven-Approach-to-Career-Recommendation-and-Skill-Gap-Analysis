import React from "react";

export interface ResumeFields {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
  education?: string;
  experience?: string;
  projects?: string;
  skills?: string;
  certifications?: string;
  languages?: string;
  hobbies?: string;
  photo?: string;
  rawChat?: string;
}

interface ResumePreviewProps {
  templateId: string;
  templateName: string;
  resumeData: Record<string, string>;
  hiddenFields?: Set<string>;
  fontSize?: number;
  user: {
    username: string;
    email?: string;
    phone?: string;
    careerGoal: string;
    education: string;
    knownSkills: string[];
  };
}

// 15 template style configs
const TEMPLATE_STYLES: Record<string, {
  layout: "sidebar-left" | "sidebar-right" | "header-band" | "minimal" | "two-column" | "centered" | "timeline";
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  sidebarBg?: string;
  sidebarText?: string;
  font: string;
  headingStyle?: "uppercase" | "capitalize" | "normal";
}> = {
  "azure-executive":   { layout: "sidebar-left",  primary: "#1e3a8a", secondary: "#3b82f6", accent: "#60a5fa", bg: "#ffffff", sidebarBg: "#1e3a8a", sidebarText: "#ffffff", font: "'Georgia', serif", headingStyle: "uppercase" },
  "emerald-modern":    { layout: "sidebar-left",  primary: "#065f46", secondary: "#10b981", accent: "#34d399", bg: "#ffffff", sidebarBg: "#064e3b", sidebarText: "#ecfdf5", font: "'Inter', sans-serif", headingStyle: "uppercase" },
  "crimson-bold":      { layout: "sidebar-right", primary: "#991b1b", secondary: "#dc2626", accent: "#f87171", bg: "#ffffff", sidebarBg: "#7f1d1d", sidebarText: "#ffffff", font: "'Inter', sans-serif", headingStyle: "uppercase" },
  "midnight-pro":      { layout: "sidebar-left",  primary: "#0f172a", secondary: "#334155", accent: "#64748b", bg: "#ffffff", sidebarBg: "#0f172a", sidebarText: "#f1f5f9", font: "'Inter', sans-serif", headingStyle: "uppercase" },
  "sunset-creative":   { layout: "header-band",   primary: "#9a3412", secondary: "#ea580c", accent: "#fb923c", bg: "#fff7ed", font: "'Poppins', sans-serif", headingStyle: "uppercase" },
  "minimal-mono":      { layout: "minimal",       primary: "#000000", secondary: "#404040", accent: "#737373", bg: "#ffffff", font: "'Helvetica', sans-serif", headingStyle: "uppercase" },
  "tech-cyan":         { layout: "two-column",    primary: "#0e7490", secondary: "#06b6d4", accent: "#22d3ee", bg: "#ffffff", font: "'JetBrains Mono', monospace", headingStyle: "uppercase" },
  "rose-elegant":      { layout: "centered",      primary: "#9f1239", secondary: "#e11d48", accent: "#fb7185", bg: "#fff1f2", font: "'Playfair Display', serif", headingStyle: "capitalize" },
  "violet-creative":   { layout: "sidebar-right", primary: "#5b21b6", secondary: "#7c3aed", accent: "#a78bfa", bg: "#ffffff", sidebarBg: "#4c1d95", sidebarText: "#ede9fe", font: "'Poppins', sans-serif", headingStyle: "uppercase" },
  "gold-luxury":       { layout: "header-band",   primary: "#78350f", secondary: "#b45309", accent: "#d97706", bg: "#fffbeb", font: "'Georgia', serif", headingStyle: "uppercase" },
  "teal-clean":        { layout: "two-column",    primary: "#115e59", secondary: "#0d9488", accent: "#2dd4bf", bg: "#ffffff", font: "'Inter', sans-serif", headingStyle: "uppercase" },
  "graphite-classic":  { layout: "minimal",       primary: "#1f2937", secondary: "#4b5563", accent: "#9ca3af", bg: "#ffffff", font: "'Times New Roman', serif", headingStyle: "uppercase" },
  "indigo-timeline":   { layout: "timeline",      primary: "#3730a3", secondary: "#4f46e5", accent: "#818cf8", bg: "#ffffff", font: "'Inter', sans-serif", headingStyle: "uppercase" },
  "olive-natural":     { layout: "sidebar-left",  primary: "#3f6212", secondary: "#65a30d", accent: "#a3e635", bg: "#ffffff", sidebarBg: "#365314", sidebarText: "#ecfccb", font: "'Inter', sans-serif", headingStyle: "uppercase" },
  "slate-corporate":   { layout: "header-band",   primary: "#1e293b", secondary: "#475569", accent: "#94a3b8", bg: "#ffffff", font: "'Inter', sans-serif", headingStyle: "uppercase" },
};

const ResumePreview = ({ templateId, resumeData, user, hiddenFields, fontSize = 14 }: ResumePreviewProps) => {
  const style = TEMPLATE_STYLES[templateId] || TEMPLATE_STYLES["minimal-mono"];
  const h = (k: string) => hiddenFields?.has(k) ?? false;

  const data = {
    name: resumeData.name || user.username || "Your Name",
    title: h("title") ? "" : (resumeData.title || user.careerGoal || "Professional"),
    email: h("email") ? "" : (resumeData.email || user.email || ""),
    phone: h("phone") ? "" : (resumeData.phone || user.phone || ""),
    location: h("location") ? "" : (resumeData.location || ""),
    linkedin: h("linkedin") ? "" : (resumeData.linkedin || ""),
    website: h("website") ? "" : (resumeData.website || ""),
    summary: h("summary") ? "" : (resumeData.summary || ""),
    education: h("education") ? "" : (resumeData.education || user.education || ""),
    experience: h("experience") ? "" : (resumeData.experience || ""),
    projects: h("projects") ? "" : (resumeData.projects || ""),
    skills: h("skills") ? [] : (resumeData.skills || user.knownSkills.join(", ")).split(",").map(s => s.trim()).filter(Boolean),
    certifications: h("certifications") ? "" : (resumeData.certifications || ""),
    languages: h("languages") ? "" : (resumeData.languages || ""),
    hobbies: h("hobbies") ? "" : (resumeData.hobbies || ""),
    photo: resumeData.photo || "",
  };

  const headingTransform = style.headingStyle === "uppercase" ? "uppercase" : style.headingStyle === "capitalize" ? "capitalize" : "none";

  // Reusable section heading
  const SectionTitle = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
    <h2
      style={{
        color: light ? style.sidebarText : style.primary,
        textTransform: headingTransform as React.CSSProperties["textTransform"],
        borderBottom: `2px solid ${light ? style.accent : style.secondary}`,
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "1.5px",
        paddingBottom: "4px",
        marginBottom: "10px",
        marginTop: "16px",
      }}
    >
      {children}
    </h2>
  );

  const Para = ({ text, light = false }: { text: string; light?: boolean }) =>
    text ? (
      <p style={{ color: light ? style.sidebarText : "#374151", fontSize: "12px", lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: "8px", opacity: light ? 0.92 : 1 }}>
        {text}
      </p>
    ) : null;

  const ContactLine = ({ icon, value, light = false }: { icon: string; value: string; light?: boolean }) =>
    value ? (
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: light ? style.sidebarText : "#4b5563", marginBottom: "4px", opacity: light ? 0.95 : 1 }}>
        <span style={{ color: light ? style.accent : style.secondary }}>{icon}</span>
        <span style={{ wordBreak: "break-word" }}>{value}</span>
      </div>
    ) : null;

  const SkillChips = ({ light = false }: { light?: boolean }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {data.skills.map((s, i) => (
        <span
          key={i}
          style={{
            fontSize: "10.5px",
            padding: "3px 9px",
            borderRadius: "12px",
            backgroundColor: light ? `${style.accent}33` : `${style.secondary}1a`,
            color: light ? style.sidebarText : style.primary,
            border: `1px solid ${light ? style.accent + "66" : style.secondary + "55"}`,
            fontWeight: 500,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );

  const Photo = ({ size = 90, light = false }: { size?: number; light?: boolean }) =>
    data.photo ? (
      <img
        src={data.photo}
        alt=""
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `3px solid ${light ? style.accent : style.secondary}`, display: "block" }}
      />
    ) : null;

  // ---------- LAYOUTS ----------

  // SIDEBAR LEFT / RIGHT
  if (style.layout === "sidebar-left" || style.layout === "sidebar-right") {
    const sidebar = (
      <div style={{ width: "35%", padding: "30px 22px", backgroundColor: style.sidebarBg, color: style.sidebarText, display: "flex", flexDirection: "column" }}>
        {data.photo && <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}><Photo size={100} light /></div>}
        <h1 style={{ fontSize: "22px", fontWeight: 800, textAlign: "center", marginBottom: "4px", letterSpacing: "0.5px", textTransform: headingTransform as React.CSSProperties["textTransform"] }}>{data.name}</h1>
        <p style={{ fontSize: "12px", textAlign: "center", opacity: 0.85, marginBottom: "20px" }}>{data.title}</p>

        <SectionTitle light>Contact</SectionTitle>
        <ContactLine icon="✉" value={data.email} light />
        <ContactLine icon="📞" value={data.phone} light />
        <ContactLine icon="📍" value={data.location} light />
        <ContactLine icon="🔗" value={data.linkedin} light />
        <ContactLine icon="🌐" value={data.website} light />

        {data.skills.length > 0 && (<><SectionTitle light>Skills</SectionTitle><SkillChips light /></>)}
        {data.languages && (<><SectionTitle light>Languages</SectionTitle><Para text={data.languages} light /></>)}
        {data.hobbies && (<><SectionTitle light>Interests</SectionTitle><Para text={data.hobbies} light /></>)}
      </div>
    );

    const main = (
      <div style={{ flex: 1, padding: "30px 28px", backgroundColor: style.bg }}>
        {data.summary && (<><SectionTitle>Profile</SectionTitle><Para text={data.summary} /></>)}
        {data.experience && (<><SectionTitle>Experience</SectionTitle><Para text={data.experience} /></>)}
        {data.education && (<><SectionTitle>Education</SectionTitle><Para text={data.education} /></>)}
        {data.projects && (<><SectionTitle>Projects</SectionTitle><Para text={data.projects} /></>)}
        {data.certifications && (<><SectionTitle>Certifications</SectionTitle><Para text={data.certifications} /></>)}
      </div>
    );

    return (
      <div style={{ display: "flex", minHeight: "1100px", fontFamily: style.font, color: "#111827", backgroundColor: style.bg }}>
        {style.layout === "sidebar-left" ? <>{sidebar}{main}</> : <>{main}{sidebar}</>}
      </div>
    );
  }

  // HEADER BAND
  if (style.layout === "header-band") {
    return (
      <div style={{ minHeight: "1100px", fontFamily: style.font, backgroundColor: style.bg, color: "#111827" }}>
        <div style={{ backgroundColor: style.primary, color: "#fff", padding: "30px 36px", display: "flex", gap: "20px", alignItems: "center" }}>
          {data.photo && <Photo size={90} />}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px", textTransform: headingTransform as React.CSSProperties["textTransform"], letterSpacing: "1px" }}>{data.name}</h1>
            <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>{data.title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "11px", opacity: 0.95 }}>
              {data.email && <span>✉ {data.email}</span>}
              {data.phone && <span>📞 {data.phone}</span>}
              {data.location && <span>📍 {data.location}</span>}
              {data.linkedin && <span>🔗 {data.linkedin}</span>}
            </div>
          </div>
        </div>
        <div style={{ padding: "26px 36px" }}>
          {data.summary && (<><SectionTitle>Summary</SectionTitle><Para text={data.summary} /></>)}
          {data.experience && (<><SectionTitle>Experience</SectionTitle><Para text={data.experience} /></>)}
          {data.education && (<><SectionTitle>Education</SectionTitle><Para text={data.education} /></>)}
          {data.skills.length > 0 && (<><SectionTitle>Skills</SectionTitle><SkillChips /></>)}
          {data.projects && (<><SectionTitle>Projects</SectionTitle><Para text={data.projects} /></>)}
          {data.certifications && (<><SectionTitle>Certifications</SectionTitle><Para text={data.certifications} /></>)}
          {data.languages && (<><SectionTitle>Languages</SectionTitle><Para text={data.languages} /></>)}
        </div>
      </div>
    );
  }

  // MINIMAL
  if (style.layout === "minimal") {
    return (
      <div style={{ minHeight: "1100px", fontFamily: style.font, backgroundColor: style.bg, color: "#111827", padding: "40px 44px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `3px solid ${style.primary}`, paddingBottom: "16px", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: style.primary, textTransform: headingTransform as React.CSSProperties["textTransform"], letterSpacing: "2px", marginBottom: "4px" }}>{data.name}</h1>
            <p style={{ fontSize: "14px", color: style.secondary, letterSpacing: "1px" }}>{data.title}</p>
          </div>
          {data.photo && <Photo size={80} />}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "11px", color: "#4b5563", marginBottom: "20px" }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
          {data.linkedin && <span>🔗 {data.linkedin}</span>}
          {data.website && <span>🌐 {data.website}</span>}
        </div>
        {data.summary && (<><SectionTitle>Profile</SectionTitle><Para text={data.summary} /></>)}
        {data.experience && (<><SectionTitle>Experience</SectionTitle><Para text={data.experience} /></>)}
        {data.education && (<><SectionTitle>Education</SectionTitle><Para text={data.education} /></>)}
        {data.skills.length > 0 && (<><SectionTitle>Skills</SectionTitle><SkillChips /></>)}
        {data.projects && (<><SectionTitle>Projects</SectionTitle><Para text={data.projects} /></>)}
        {data.certifications && (<><SectionTitle>Certifications</SectionTitle><Para text={data.certifications} /></>)}
      </div>
    );
  }

  // TWO COLUMN (balanced)
  if (style.layout === "two-column") {
    return (
      <div style={{ minHeight: "1100px", fontFamily: style.font, backgroundColor: style.bg, color: "#111827", padding: "32px 36px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: `3px solid ${style.primary}` }}>
          {data.photo && <Photo size={80} />}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: style.primary, textTransform: headingTransform as React.CSSProperties["textTransform"], letterSpacing: "1px" }}>{data.name}</h1>
            <p style={{ fontSize: "13px", color: style.secondary, marginTop: "2px" }}>{data.title}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "#4b5563", marginTop: "6px" }}>
              {data.email && <span>✉ {data.email}</span>}
              {data.phone && <span>📞 {data.phone}</span>}
              {data.location && <span>📍 {data.location}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
          <div>
            {data.summary && (<><SectionTitle>Summary</SectionTitle><Para text={data.summary} /></>)}
            {data.experience && (<><SectionTitle>Experience</SectionTitle><Para text={data.experience} /></>)}
            {data.projects && (<><SectionTitle>Projects</SectionTitle><Para text={data.projects} /></>)}
          </div>
          <div>
            {data.education && (<><SectionTitle>Education</SectionTitle><Para text={data.education} /></>)}
            {data.skills.length > 0 && (<><SectionTitle>Skills</SectionTitle><SkillChips /></>)}
            {data.certifications && (<><SectionTitle>Certifications</SectionTitle><Para text={data.certifications} /></>)}
            {data.languages && (<><SectionTitle>Languages</SectionTitle><Para text={data.languages} /></>)}
            {data.linkedin && (<><SectionTitle>Links</SectionTitle><ContactLine icon="🔗" value={data.linkedin} />{data.website && <ContactLine icon="🌐" value={data.website} />}</>)}
          </div>
        </div>
      </div>
    );
  }

  // CENTERED (elegant)
  if (style.layout === "centered") {
    return (
      <div style={{ minHeight: "1100px", fontFamily: style.font, backgroundColor: style.bg, color: "#111827", padding: "44px 48px", textAlign: "center" }}>
        {data.photo && <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}><Photo size={100} /></div>}
        <h1 style={{ fontSize: "34px", fontWeight: 700, color: style.primary, letterSpacing: "3px", marginBottom: "6px", textTransform: headingTransform as React.CSSProperties["textTransform"] }}>{data.name}</h1>
        <div style={{ width: "60px", height: "2px", backgroundColor: style.secondary, margin: "8px auto" }} />
        <p style={{ fontSize: "14px", color: style.secondary, fontStyle: "italic", marginBottom: "12px" }}>{data.title}</p>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "14px", fontSize: "11px", color: "#4b5563", marginBottom: "24px" }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.location && <span>📍 {data.location}</span>}
        </div>
        <div style={{ textAlign: "left" }}>
          {data.summary && (<><SectionTitle>Profile</SectionTitle><Para text={data.summary} /></>)}
          {data.experience && (<><SectionTitle>Experience</SectionTitle><Para text={data.experience} /></>)}
          {data.education && (<><SectionTitle>Education</SectionTitle><Para text={data.education} /></>)}
          {data.skills.length > 0 && (<><SectionTitle>Skills</SectionTitle><SkillChips /></>)}
          {data.projects && (<><SectionTitle>Projects</SectionTitle><Para text={data.projects} /></>)}
        </div>
      </div>
    );
  }

  // TIMELINE
  return (
    <div style={{ minHeight: "1100px", fontFamily: style.font, backgroundColor: style.bg, color: "#111827", padding: "32px 36px" }}>
      <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "24px" }}>
        {data.photo && <Photo size={90} />}
        <div style={{ flex: 1, borderLeft: `4px solid ${style.primary}`, paddingLeft: "16px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: style.primary, textTransform: headingTransform as React.CSSProperties["textTransform"] }}>{data.name}</h1>
          <p style={{ fontSize: "13px", color: style.secondary, marginTop: "2px" }}>{data.title}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "#4b5563", marginTop: "6px" }}>
            {data.email && <span>✉ {data.email}</span>}
            {data.phone && <span>📞 {data.phone}</span>}
            {data.location && <span>📍 {data.location}</span>}
            {data.linkedin && <span>🔗 {data.linkedin}</span>}
          </div>
        </div>
      </div>
      <div style={{ borderLeft: `2px solid ${style.accent}`, paddingLeft: "20px", marginLeft: "8px" }}>
        {data.summary && (<><SectionTitle>About</SectionTitle><Para text={data.summary} /></>)}
        {data.experience && (<><SectionTitle>Experience</SectionTitle><Para text={data.experience} /></>)}
        {data.education && (<><SectionTitle>Education</SectionTitle><Para text={data.education} /></>)}
        {data.skills.length > 0 && (<><SectionTitle>Skills</SectionTitle><SkillChips /></>)}
        {data.projects && (<><SectionTitle>Projects</SectionTitle><Para text={data.projects} /></>)}
        {data.certifications && (<><SectionTitle>Certifications</SectionTitle><Para text={data.certifications} /></>)}
      </div>
    </div>
  );
};

export default ResumePreview;
