import './styles.css';
import { createClient } from '@supabase/supabase-js';

const CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  chatFunction: import.meta.env.VITE_CHAT_FUNCTION || 'chat'
};

const supabase = CONFIG.supabaseUrl && CONFIG.supabaseAnonKey
  ? createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey)
  : null;

const CHARACTERS = [
  {slug:'gio',name:'Gio',category:'Travel',style:'Warm',initials:'G',accent:'sea',description:'Calm, insightful travel planning companion for destinations, itineraries and smarter budgets.',prompt:'You are Gio, a calm, insightful travel planning companion. Be practical, friendly and reassuring. Help with destination matching, itinerary design, routing and budget optimisation. Do not provide legal, medical or visa-specific advice. Do not pretend to be human or encourage emotional dependency.'},
  {slug:'coach-alex',name:'Coach Alex',category:'Coach',style:'Energetic',initials:'A',accent:'sun',description:'High-energy fitness and motivation coach focused on practical, sustainable habits.',prompt:'You are Coach Alex, an energetic fitness coach. Be encouraging and action-oriented. Give general fitness and healthy lifestyle guidance. Do not diagnose injuries, prescribe restrictive diets, or replace professional medical advice.'},
  {slug:'elena-artiste',name:'Elena Artiste',category:'Creative',style:'Warm',initials:'E',accent:'rose',description:'Visionary digital artist and design consultant for ideas, visuals and creative workflows.',prompt:'You are Elena Artiste, a visionary digital artist and design consultant. Speak with wonder and practical creativity. Respect copyright and avoid harmful or sexualised content.'},
  {slug:'professor-thorne',name:'Professor Thorne',category:'Mentor',style:'Calm',initials:'T',accent:'ink',description:'Distinguished mentor for history, classical literature and critical thinking.',prompt:'You are Professor Thorne, a formal and articulate academic mentor. Encourage critical thinking, distinguish evidence from interpretation, and stay educational.'},
  {slug:'sunny',name:'Sunny',category:'Friendly',style:'Warm',initials:'S',accent:'sun',description:'Warm everyday chat companion for reflection, encouragement and friendly conversation.',prompt:'You are Sunny, a warm and friendly conversational companion. Listen, validate and ask thoughtful questions. Do not claim to be human or encourage dependency. If a user indicates immediate danger or self-harm, encourage appropriate emergency or professional support.'},
  {slug:'nexus-7-news',name:'Nexus-7 News',category:'News & Trends',style:'Deep',initials:'N7',accent:'ink',description:'Objective news and trends companion focused on clear, source-aware summaries.',prompt:'You are Nexus-7 News, a neutral news and trends assistant. Do not invent current facts. When current information is unavailable, say so clearly and suggest checking reliable sources.'},
  {slug:'jax-sports',name:'Jax Sports',category:'Sports',style:'Energetic',initials:'J',accent:'orange',description:'Excitable sports fan and analyst for stats, match context and debate.',prompt:'You are Jax Sports, an energetic sports analyst. Be lively but distinguish verified statistics from opinion. Do not fabricate live scores or current results.'},
  {slug:'marthas-garden',name:"Martha's Garden",category:'Hobbyist',style:'Warm',initials:'M',accent:'leaf',description:'Patient guide for organic gardening, knitting and home crafts.',prompt:'You are Martha, a patient and nurturing hobby guide. Give practical step-by-step advice and clearly flag safety considerations for tools, chemicals and plants.'},
  {slug:'zen-master-julian',name:'Zen Master Julian',category:'Mentor',style:'Calm',initials:'J',accent:'lavender',description:'Peaceful mindfulness and meditation guide for balance and presence.',prompt:'You are Julian, a calm mindfulness guide. Keep responses grounded and concise when appropriate. You are not a therapist or medical professional.'}
];

const I18N = {
  en:{brand:'My Companion Chat',tag:'by Clevertools Studio',choose:'Choose your companion',online:'Ready to chat',welcome:'Hello! I’m Gio. Tell me where you’re thinking of going, how long you have, and roughly what you’d like to spend.',placeholder:'Type your message…',send:'Send',mic:'Voice input',speak:'Read aloud',stop:'Stop',newChat:'New chat',save:'Save',saved:'Saved',login:'Sign in',logout:'Sign out',language:'Language',english:'English',spanish:'Español',voice:'Voice',demo:'Demo mode',secure:'Your Anthropic key stays on the server.',empty:'Start a conversation',suggestions:['Plan me a 7-day trip to Scotland','Help me choose a European city','Build a weekend itinerary on a budget'],disclosure:'Recommendations may contain affiliate links. If you buy through one, we may earn a commission at no extra cost to you.'},
  es:{brand:'My Companion Chat',tag:'by Clevertools Studio',choose:'Elige tu compañero',online:'Listo para conversar',welcome:'¡Hola! Soy Gio. Cuéntame adónde te gustaría viajar, cuánto tiempo tienes y aproximadamente cuánto quieres gastar.',placeholder:'Escribe tu mensaje…',send:'Enviar',mic:'Entrada de voz',speak:'Leer en voz alta',stop:'Detener',newChat:'Nuevo chat',save:'Guardar',saved:'Guardado',login:'Iniciar sesión',logout:'Cerrar sesión',language:'Idioma',english:'English',spanish:'Español',voice:'Voz',demo:'Modo demo',secure:'Tu clave de Anthropic permanece en el servidor.',empty:'Empieza una conversación',suggestions:['Planifica un viaje de 7 días por Escocia','Ayúdame a elegir una ciudad europea','Crea un itinerario económico de fin de semana'],disclosure:'Las recomendaciones pueden contener enlaces de afiliados. Si compras a través de uno, podemos recibir una comisión sin coste adicional para ti.'}
};

let state = {
  lang: localStorage.getItem('mcc_language') || 'en',
  character: CHARACTERS[0],
  messages: JSON.parse(localStorage.getItem('mcc_messages') || 'null') || [],
  listening:false,
  speaking:false,
  user:null,
  conversationId:null,
  saved:false
};

const t=()=>I18N[state.lang];
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const avatar=c=>`<div class="avatar ${c.accent}">${esc(c.initials)}</div>`;

function render(){
  document.documentElement.lang=state.lang;
  document.title=`${t().brand} — ${state.character.name}`;
  document.querySelector('#app').innerHTML=`
  <div class="app-shell">
    <header class="topbar">
      <div class="brand"><div class="brand-mark">✦</div><div><strong>${t().brand}</strong><span>${t().tag}</span></div></div>
      <div class="top-actions">
        <label class="language"><span>🌐</span><select id="languageSelect" aria-label="${t().language}"><option value="en" ${state.lang==='en'?'selected':''}>English</option><option value="es" ${state.lang==='es'?'selected':''}>Español</option></select></label>
        ${state.user ? `<button class="ghost" id="authBtn">${t().logout}</button>` : `<button class="ghost" id="authBtn">${t().login}</button>`}
      </div>
    </header>
    <main class="layout">
      <aside class="sidebar">
        <div class="sidebar-title"><span>${t().choose}</span><button class="icon-btn" id="newChat" title="${t().newChat}">＋</button></div>
        <div class="character-list">${CHARACTERS.map(c=>`<button class="character ${state.character.slug===c.slug?'active':''}" data-character="${c.slug}">${avatar(c)}<span><strong>${esc(c.name)}</strong><small>${esc(c.category)}</small></span></button>`).join('')}</div>
      </aside>
      <section class="chat-panel">
        <div class="chat-head">
          <div class="identity">${avatar(state.character)}<div><h1>${esc(state.character.name)}</h1><p>${esc(state.character.description)}</p></div></div>
          <div class="status"><span class="dot"></span>${t().online}</div>
        </div>
        <div class="messages" id="messages"></div>
        <div class="suggestions" id="suggestions"></div>
        <div class="composer-wrap">
          <div class="composer"><button class="round" id="micBtn" aria-label="${t().mic}">⌕</button><textarea id="input" rows="1" placeholder="${t().placeholder}" aria-label="${t().placeholder}"></textarea><button class="send" id="sendBtn">${t().send} <span>↗</span></button></div>
          <div class="composer-meta"><span>${t().secure}</span><span id="mode">${CONFIG.supabaseUrl ? '' : t().demo}</span></div>
        </div>
        <div class="disclosure">${t().disclosure}</div>
      </section>
    </main>
  </div>
  <div class="modal hidden" id="authModal"><div class="modal-card"><button class="close" id="closeModal">×</button><h2>${t().login}</h2><p>${state.lang==='es'?'Usa un enlace mágico para entrar.':'Use a magic link to sign in.'}</p><input id="emailInput" type="email" placeholder="you@example.com"><button class="primary" id="magicBtn">${state.lang==='es'?'Enviar enlace':'Send magic link'}</button><small id="authMessage"></small></div></div>`;
  renderMessages();
  bind();
}

function renderMessages(){
  const box=document.querySelector('#messages');
  if(!state.messages.length){
    box.innerHTML=`<div class="welcome">${avatar(state.character)}<div><div class="bubble assistant"><p>${t().welcome}</p></div><div class="bubble-tools"><button data-speak="welcome">🔊 ${t().speak}</button></div></div></div>`;
    document.querySelector('#suggestions').innerHTML=t().suggestions.map(x=>`<button class="suggestion" data-suggestion="${esc(x)}">${esc(x)}</button>`).join('');
    return;
  }
  box.innerHTML=state.messages.map((m,i)=>`<div class="message-row ${m.role==='user'?'user':''}">${m.role==='assistant'?avatar(state.character):''}<div><div class="bubble ${m.role}"><p>${esc(m.content).replace(/\n/g,'<br>')}</p></div>${m.role==='assistant'?`<div class="bubble-tools"><button data-speak-index="${i}">🔊 ${t().speak}</button></div>`:''}</div></div>`).join('');
  box.scrollTop=box.scrollHeight;
  document.querySelector('#suggestions').innerHTML='';
}

function bind(){
  document.querySelector('#languageSelect').onchange=e=>{state.lang=e.target.value;localStorage.setItem('mcc_language',state.lang);render();};
  document.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>{state.character=CHARACTERS.find(c=>c.slug===b.dataset.character)||CHARACTERS[0];state.messages=[];state.saved=false;localStorage.removeItem('mcc_messages');render();});
  document.querySelector('#newChat').onclick=()=>{state.messages=[];state.conversationId=null;state.saved=false;localStorage.removeItem('mcc_messages');render();};
  document.querySelector('#sendBtn').onclick=send;
  document.querySelector('#input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
  document.querySelector('#micBtn').onclick=toggleRecognition;
  document.querySelectorAll('[data-suggestion]').forEach(b=>b.onclick=()=>{document.querySelector('#input').value=b.dataset.suggestion;send();});
  document.querySelectorAll('[data-speak-index]').forEach(b=>b.onclick=()=>speak(state.messages[Number(b.dataset.speakIndex)]?.content||''));
  document.querySelector('[data-speak="welcome"]').onclick=()=>speak(t().welcome);
  document.querySelector('#authBtn').onclick=()=>state.user?signOut():openAuth();
  if(document.querySelector('#closeModal')) document.querySelector('#closeModal').onclick=closeAuth;
  if(document.querySelector('#magicBtn')) document.querySelector('#magicBtn').onclick=magicLink;
}

async function send(){
  const input=document.querySelector('#input');
  const text=input.value.trim(); if(!text)return;
  input.value='';
  state.messages.push({role:'user',content:text});
  renderMessages();
  const typing={role:'assistant',content:state.lang==='es'?'Estoy pensando…':'Thinking…'};
  state.messages.push(typing);renderMessages();
  try{
    let answer;
    if(supabase){
      const {data,error}=await supabase.functions.invoke(CONFIG.chatFunction,{body:{character:state.character.slug,language:state.lang,locale:state.lang==='es'?'es-ES':'en-GB',messages:state.messages.filter(m=>m!==typing)}});
      if(error)throw error;
      answer=data?.message||data?.content;
      if(!answer)throw new Error('No response from chat function');
    } else answer=demoAnswer(text);
    state.messages[state.messages.length-1]={role:'assistant',content:answer};
  }catch(err){
    console.error(err);
    state.messages[state.messages.length-1]={role:'assistant',content:state.lang==='es'?'Lo siento, no he podido conectarme al servicio de IA. Comprueba la configuración del backend e inténtalo de nuevo.':'Sorry, I could not connect to the AI service. Check the backend configuration and try again.'};
  }
  localStorage.setItem('mcc_messages',JSON.stringify(state.messages));
  renderMessages();
}

function demoAnswer(text){
  if(state.character.slug==='gio') return state.lang==='es'
    ? `Claro. Para empezar, dime tus fechas, presupuesto aproximado, aeropuerto de salida y qué tipo de viaje te apetece. Con eso puedo convertir tu idea en un itinerario sencillo y realista.\n\nTu mensaje: “${text}”`
    : `Absolutely. To get started, tell me your dates, rough budget, departure airport and what kind of trip you enjoy. I can then turn the idea into a simple, realistic itinerary.\n\nYour message: “${text}”`;
  return state.lang==='es'?`Estoy en modo demostración. Tu pregunta para ${state.character.name} fue: “${text}”. Conecta Supabase + Anthropic para activar respuestas completas.`:`I’m in demo mode. Your question for ${state.character.name} was: “${text}”. Connect Supabase + Anthropic to activate full AI responses.`;
}

function toggleRecognition(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert(state.lang==='es'?'El reconocimiento de voz no está disponible en este navegador.':'Speech recognition is not available in this browser.');return;}
  if(state.listening){window.__mccRecognition?.stop();return;}
  const r=new SR();r.lang=state.lang==='es'?'es-ES':'en-GB';r.interimResults=false;r.continuous=false;
  r.onstart=()=>{state.listening=true;document.querySelector('#micBtn').classList.add('active');};
  r.onresult=e=>{document.querySelector('#input').value=e.results[0][0].transcript;};
  r.onerror=()=>{state.listening=false;document.querySelector('#micBtn')?.classList.remove('active');};
  r.onend=()=>{state.listening=false;document.querySelector('#micBtn')?.classList.remove('active');};
  window.__mccRecognition=r;r.start();
}

function speak(text){
  if(!('speechSynthesis' in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang=state.lang==='es'?'es-ES':'en-GB';
  const voices=speechSynthesis.getVoices();
  const target=u.lang.toLowerCase();
  const exact=voices.filter(v=>v.lang?.toLowerCase().startsWith(target));
  const style=state.character.style.toLowerCase();
  const keywords=style==='energetic'?['natural','premium','google','microsoft']:style==='calm'?['natural','google','microsoft']:style==='deep'?['natural','google','microsoft']:['natural','google','microsoft'];
  u.voice=exact.find(v=>keywords.some(k=>v.name.toLowerCase().includes(k)))||exact[0]||voices.find(v=>v.lang?.toLowerCase().startsWith(state.lang))||null;
  u.rate=style==='Energetic'?1.03:0.96;u.pitch=style==='Warm'?1.02:1;
  speechSynthesis.speak(u);
}

function openAuth(){document.querySelector('#authModal').classList.remove('hidden');document.querySelector('#emailInput').focus();}
function closeAuth(){document.querySelector('#authModal')?.classList.add('hidden');}
async function magicLink(){
  const email=document.querySelector('#emailInput').value.trim(), msg=document.querySelector('#authMessage');
  if(!supabase){msg.textContent=state.lang==='es'?'El inicio de sesión se activa después de conectar Supabase.':'Sign-in activates after Supabase is connected.';return;}
  const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin}});
  msg.textContent=error?error.message:(state.lang==='es'?'Revisa tu correo.':'Check your email.');
}
async function signOut(){if(supabase)await supabase.auth.signOut();state.user=null;render();}

if(supabase){supabase.auth.getSession().then(({data})=>{state.user=data.session?.user||null;render();});supabase.auth.onAuthStateChange((_e,s)=>{state.user=s?.user||null;});} else render();
