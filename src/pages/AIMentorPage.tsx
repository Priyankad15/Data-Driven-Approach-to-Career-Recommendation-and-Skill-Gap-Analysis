// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";

import ParticleBackground from "@/components/ParticleBackground";
import ProfileDropdown from "@/components/ProfileDropdown";
import AIRobot from "@/components/AIRobot";

import { ArrowLeft, Send, MessageSquare, Plus, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const CHAT_URL = "https://yfsurrorbdpxfxzufzxz.supabase.co/functions/v1/aimentor";
const ANON_KEY = "sb_publishable_dnyUni7fNeI8DG5oXNRDLg_VHbtrAZa"; 

const AIMentorPage = () => {
  const { user, authUser } = useApp(); // authUser use pannuna extra safety
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConv, setCurrentConv] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const scrollRef = useRef(null);

  const suggestions = [
    "How to start DSA?",
    "Give me a React roadmap",
    "Explain JavaScript closures",
    "Mock interview question please",
  ];

  // 🛡️ Load Conversations - Fixed logic
  const loadConversations = async () => {
    const currentUserId = authUser?.id || (user?.isLoggedIn ? user.id : null);
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });
    
    if (!error) setConversations(data || []);
  };

  useEffect(() => {
    if (authUser?.id || user?.isLoggedIn) {
      loadConversations();
    }
  }, [authUser, user?.isLoggedIn]);

  // 📂 Load Existing Chat
  const loadChat = async (id) => {
    setCurrentConv(id);
    const { data } = await supabase
      .from("chats")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    const formatted = data?.flatMap((c) => [
      { role: "user", content: c.message },
      { role: "assistant", content: c.response },
    ]) || [];

    setMessages(formatted);
    setShowSidebar(false);
  };

  const send = async (text) => {
    const finalInput = text || input;
    const currentUserId = authUser?.id;
    if (!finalInput.trim() || isLoading || !currentUserId) return;

    let convId = currentConv;
    setMessages((prev) => [...prev, { role: "user", content: finalInput }]);
    setInput("");
    setIsLoading(true);

    try {
      if (!convId) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert([{ user_id: currentUserId, title: finalInput.slice(0, 30) }])
          .select().single();
        if (newConv) {
          convId = newConv.id;
          setCurrentConv(convId);
        }
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: finalInput }], 
          context: { username: user.username, skillLevel: user.skillLevel } 
        }),
      });

      const result = await resp.json();
      const aiText = result.choices?.[0]?.message?.content || "No response";

      setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);
      
      // ✅ Insert into chats
      await supabase.from("chats").insert([{
        user_id: currentUserId,
        conversation_id: convId,
        message: finalInput,
        response: aiText,
      }]);
      
      loadConversations();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Blank page fix: loading check
  if (!authUser && !user?.isLoggedIn) {
    return <div className="h-screen w-full bg-[#0B0E14] flex items-center justify-center text-white">Loading Mentor...</div>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0B0E14] relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <ParticleBackground />
      </div>

      {/* 🧱 SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] w-80 bg-black/80 backdrop-blur-3xl border-r border-white/10 transition-transform duration-300 md:relative md:translate-x-0 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 flex flex-col h-full relative z-[110]">
          <Button onClick={() => {setMessages([]); setCurrentConv(null);}} className="w-full mb-6 py-6 gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-white rounded-xl cursor-pointer">
            <Plus size={20} /> <span className="font-bold">New Chat</span>
          </Button>
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.map((c) => (
              <div key={c.id} onClick={() => loadChat(c.id)} className={`p-4 rounded-xl cursor-pointer transition-all border ${currentConv === c.id ? "bg-primary/20 border-primary" : "bg-white/5 border-transparent hover:bg-white/10"} text-muted-foreground hover:text-white`}>
                <span className="truncate block text-sm">{c.title}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 🧠 MAIN Area */}
      <main className="flex-1 flex flex-col relative z-20 w-full min-w-0 h-full">
        <div className="relative z-[150]">
          <ProfileDropdown />
        </div>

        <header className="flex items-center gap-3 p-4 border-b border-white/5 bg-background/50 backdrop-blur-md relative z-[100]">
          <button className="md:hidden p-2" onClick={() => setShowSidebar(!showSidebar)}><Menu size={22} /></button>
          <button onClick={() => navigate("/dashboard")} className="p-2"><ArrowLeft size={22} /></button>
          <AIRobot size="sm" animate={isLoading} />
          <div>
            <h1 className="font-bold text-base">{user.mentorName || "Nova"}</h1>
            <p className="text-[10px] text-green-500 font-bold uppercase">Online</p>
          </div>
        </header>

        {/* CHAT WINDOW */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col relative z-50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 text-center space-y-4">
               <AIRobot size="lg" />
               <h2 className="text-2xl font-bold">Hey {user.username}!</h2>
               <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                   I'm <span className="text-white">{user.mentorName || "Nova"}</span>, your personal learning partner. 
                   Let's build something amazing today!
                 </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm border shadow-xl ${msg.role === "user" ? "bg-primary text-white" : "bg-[#1A1F26] text-white border-white/10"}`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[#0B0E14] to-transparent relative z-[120]">
          {messages.length === 0 && (
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto mb-6">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => send(s)} className="px-4 py-2 text-xs bg-white/10 hover:bg-primary/30 border border-white/10 rounded-full cursor-pointer">{s}</button>
              ))}
            </div>
          )}
          <div className="max-w-4xl mx-auto flex gap-2 items-center bg-[#161B22] px-4 py-2.5 rounded-2xl border border-white/10 relative z-[130]">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message Nova..." className="flex-1 bg-transparent border-none text-white focus-visible:ring-0" />
            <Button onClick={() => send()} disabled={isLoading || !input.trim()} size="icon" className="bg-primary cursor-pointer"><Send className="w-4 h-4 text-white" /></Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIMentorPage; 