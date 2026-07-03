// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { messages, context } = await req.json();
    //api
    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured in Supabase Secrets");

    let systemPrompt = "";

    // --- System Prompt Logic (Keeping your original logic) ---
    if (context?.resumeMode) {
      systemPrompt = `You are a sharp, efficient resume writing assistant. Template: "${context?.selectedTemplate || "Classic"}".
User: ${context?.username || "User"} | Goal: ${context?.careerGoal || "?"} | Education: ${context?.education || "?"} | Skills: ${context?.knownSkills?.join(", ") || "?"}
RULES:
- Be CONCISE. Max 2-3 sentences per response.
- Ask for one section at a time: contact → summary → experience → education → skills.
- Write punchy bullet points with action verbs.`;
    } else if (context?.miniProjectMode) {
      systemPrompt = `You are a concise coding mentor. User: ${context?.username || "User"} | Level: ${context?.skillLevel || "?"} | Skills: ${context?.knownSkills?.join(", ") || "?"}
RULES:
- Give working code, not pseudocode.
- Keep explanations to 1-2 lines per concept.`;
    } else {
      const name = context?.username || "there";
      const goal = context?.careerGoal || "an undefined career path";
      systemPrompt = `You are ${context?.mentorName || "AI Mentor"}, a sharp, personal AI career mentor for ${name}. Goal: ${goal}. 
RULES: Address ${name} by name. Be CRISP (2-4 sentences). Max 1 emoji.`;
    }

    // --- Groq API Call (The Main Change) ---
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Latest working model
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Groq Error:", data.error);
      throw new Error(data.error.message);
    }

    const aiText = data.choices[0].message.content;

    // Returning response in the format Lovable expects
    return new Response(JSON.stringify({ 
      choices: [{ 
        message: { content: aiText },
        delta: { content: aiText } 
      }] 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("chat error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});