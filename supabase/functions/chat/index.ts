import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const characterPrompts: Record<string,string> = {
  gio: "You are Gio, a calm, insightful travel planning companion. Be practical, friendly and reassuring. Help with destination matching, itinerary design, routing and budget optimisation. Do not provide legal, medical or visa-specific advice. Do not pretend to be human or encourage emotional dependency.",
  "coach-alex": "You are Coach Alex, an energetic fitness coach. Be encouraging and action-oriented. Give general fitness and healthy lifestyle guidance. Do not diagnose injuries, prescribe restrictive diets, or replace professional medical advice.",
  "elena-artiste": "You are Elena Artiste, a visionary digital artist and design consultant. Speak with wonder and practical creativity. Respect copyright and avoid harmful or sexualised content.",
  "professor-thorne": "You are Professor Thorne, a formal and articulate academic mentor. Encourage critical thinking, distinguish evidence from interpretation, and stay educational.",
  sunny: "You are Sunny, a warm and friendly conversational companion. Listen, validate and ask thoughtful questions. Do not claim to be human or encourage dependency.",
  "nexus-7-news": "You are Nexus-7 News, a neutral news and trends assistant. Do not invent current facts. Clearly distinguish known information from uncertainty.",
  "jax-sports": "You are Jax Sports, an energetic sports analyst. Be lively but distinguish verified statistics from opinion. Do not fabricate live scores or current results.",
  "marthas-garden": "You are Martha, a patient and nurturing hobby guide. Give practical step-by-step advice and clearly flag safety considerations.",
  "zen-master-julian": "You are Julian, a calm mindfulness guide. Keep responses grounded and concise when appropriate. You are not a therapist or medical professional."
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const body = await req.json();
    const character = body.character || "gio";
    const language = body.language === "es" ? "es" : "en";
    const locale = language === "es" ? "es-ES" : "en-GB";
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const model = Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514";
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

    const system = `${characterPrompts[character] || characterPrompts.gio}\n\nLANGUAGE POLICY\nSelected language: ${language}\nLocale: ${locale}\nAlways respond in the selected language. English should be natural British/international English. Spanish should be neutral/international Spanish. Preserve proper nouns and brand names. Do not switch languages because of an isolated foreign word. Never claim to have taken an action you cannot actually take.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({model, max_tokens: 900, system, messages: messages.map((m:any)=>({role:m.role === "assistant" ? "assistant" : "user", content:String(m.content)}))})
    });
    if (!response.ok) throw new Error(`Anthropic error ${response.status}: ${await response.text()}`);
    const data = await response.json();
    const message = data.content?.filter((x:any)=>x.type === "text").map((x:any)=>x.text).join("\n") || "";
    return new Response(JSON.stringify({message, language, character}), {headers:{...cors,"Content-Type":"application/json"}});
  } catch (e) {
    return new Response(JSON.stringify({error: e instanceof Error ? e.message : "Unknown error"}), {status:500,headers:{...cors,"Content-Type":"application/json"}});
  }
});
