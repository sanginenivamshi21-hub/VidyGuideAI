"""
voice_mentor.py — VidyGuide AI Voice Mentor
All language selection is INSIDE the widget — no Streamlit selectbox needed.
Language change immediately updates the system prompt and TTS voice.
"""

VOICE_WIDGET_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{
  font-family:-apple-system,'Segoe UI',Arial,sans-serif;
  background:transparent;color:#E2E8F0;
  height:100vh;overflow:hidden;
}
.card{
  display:flex;flex-direction:column;height:100vh;
  background:linear-gradient(160deg,#0C1E12 0%,#0D1117 55%);
  border:1px solid #2A3550;border-radius:16px;overflow:hidden;
}

/* Top bar */
.topbar{
  background:linear-gradient(90deg,#0D2818,#161B27);
  border-bottom:1px solid #1E3A28;
  padding:11px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;
}
.av{
  width:36px;height:36px;border-radius:50%;
  background:linear-gradient(135deg,#3DDC84,#1E6B42);
  display:flex;align-items:center;justify-content:center;
  font-size:1rem;flex-shrink:0;position:relative;
}
.av::after{
  content:'';position:absolute;bottom:1px;right:1px;
  width:8px;height:8px;background:#3DDC84;
  border:2px solid #0D2818;border-radius:50%;
}
.mn{font-weight:700;font-size:.9rem;color:#E2E8F0;}
.ms{font-size:.7rem;color:#7A8BA0;}
.tr{margin-left:auto;display:flex;align-items:center;gap:8px;}
.sdot{width:7px;height:7px;border-radius:50%;background:#3DDC84;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}
.btn-clr{
  background:transparent;border:1px solid #2A3550;border-radius:7px;
  color:#7A8BA0;padding:3px 9px;font-size:.7rem;cursor:pointer;
  font-family:inherit;transition:all .2s;
}
.btn-clr:hover{border-color:#FF6B6B;color:#FF6B6B;}

/* Language settings bar */
.lang-bar{
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding:8px 14px;background:#0D1117;
  border-bottom:1px solid #1C2333;flex-shrink:0;
}
.lang-bar label{font-size:.7rem;color:#7A8BA0;white-space:nowrap;}
.lang-bar select{
  background:#161B27;border:1px solid #2A3550;border-radius:7px;
  color:#E2E8F0;padding:4px 8px;font-size:.76rem;
  font-family:inherit;cursor:pointer;
  min-width:110px;flex:1;transition:border-color .2s;
}
.lang-bar select:focus{outline:none;border-color:#3DDC84;}
.lang-badge{
  background:rgba(61,220,132,.12);border:1px solid rgba(61,220,132,.25);
  border-radius:20px;padding:2px 10px;font-size:.7rem;color:#3DDC84;
  font-weight:600;white-space:nowrap;
}
.speed-group{display:flex;align-items:center;gap:5px;}
.speed-group input[type=range]{width:65px;accent-color:#3DDC84;cursor:pointer;}
.speed-group span{font-size:.7rem;color:#3DDC84;width:28px;}

/* Chat log */
.chat{
  flex:1;overflow-y:auto;padding:14px;
  display:flex;flex-direction:column;gap:10px;
  scrollbar-width:thin;scrollbar-color:#2A3550 transparent;
  min-height:0;
}
.chat::-webkit-scrollbar{width:3px;}
.chat::-webkit-scrollbar-thumb{background:#2A3550;border-radius:2px;}

.msg{display:flex;gap:8px;animation:msgIn .25s ease forwards;opacity:0;transform:translateY(6px);}
@keyframes msgIn{to{opacity:1;transform:translateY(0);}}
.msg.user{flex-direction:row-reverse;}

.bubble{
  max-width:82%;padding:11px 14px;border-radius:14px;
  font-size:.86rem;line-height:1.6;
  word-break:break-word;
}
/* USER bubble — bright green */
.msg.user .bubble{
  background:linear-gradient(135deg,#1E6B42,#0D3822);
  border:1px solid #3DDC84;
  border-bottom-right-radius:3px;
  color:#FFFFFF;
  font-weight:500;
}
/* MENTOR bubble — bright white text on dark */
.msg.mentor .bubble{
  background:#1A2340;
  border:1px solid #3A4A6A;
  border-bottom-left-radius:3px;
  color:#F0F4FF;
  font-weight:400;
}
.ico{
  width:26px;height:26px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:.85rem;flex-shrink:0;margin-top:2px;
}
.msg.user   .ico{background:#1E6B42;}
.msg.mentor .ico{background:#1C2A44;}

/* Typing dots */
.dots{display:flex;gap:4px;padding:4px 2px;align-items:center;}
.dots span{width:7px;height:7px;border-radius:50%;background:#3DDC84;animation:bounce .9s infinite;}
.dots span:nth-child(2){animation-delay:.15s;background:#5B9BD5;}
.dots span:nth-child(3){animation-delay:.30s;background:#F0A500;}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}

/* Waveform */
.wave{
  height:36px;display:flex;align-items:center;
  justify-content:center;gap:2px;padding:0 14px;flex-shrink:0;
}
.bar{
  width:3px;min-height:4px;border-radius:2px;
  background:linear-gradient(to top,#1E6B42,#3DDC84);
  transform:scaleY(0.15);transition:transform .08s ease;
}

/* Status */
.status{
  font-size:.76rem;text-align:center;min-height:18px;
  color:#9DB0C8;padding:2px 14px;flex-shrink:0;
  transition:color .2s;font-weight:500;
}

/* No support */
.nosup{
  display:none;
  background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.25);
  border-radius:8px;padding:8px 12px;font-size:.76rem;color:#FFB0B0;
  flex-shrink:0;margin:0 14px 4px;
}

/* Controls */
.controls{
  padding:10px 14px 13px;border-top:1px solid #1C2333;
  display:flex;flex-direction:column;gap:8px;flex-shrink:0;
  background:#0D1117;
}
.btn-row{display:flex;gap:8px;}
.btn{
  flex:1;padding:11px;border:none;border-radius:11px;
  font-family:inherit;font-weight:700;font-size:.86rem;
  cursor:pointer;display:flex;align-items:center;
  justify-content:center;gap:6px;transition:all .2s;
}
.btn:active{transform:scale(.96);}
.btn:disabled{opacity:.4;cursor:not-allowed;}

.btn-mic{
  background:linear-gradient(135deg,#3DDC84,#1E6B42);
  color:#fff;box-shadow:0 4px 12px rgba(61,220,132,.25);
}
.btn-mic.rec{
  background:linear-gradient(135deg,#FF6B6B,#C0392B);
  box-shadow:0 4px 12px rgba(255,107,107,.35);
  animation:recP 1.4s ease-in-out infinite;
}
@keyframes recP{
  0%,100%{box-shadow:0 4px 12px rgba(255,107,107,.35)}
  50%{box-shadow:0 4px 20px rgba(255,107,107,.65)}
}

/* Stop button — ALWAYS in DOM, shown via display not visibility */
.btn-stop{
  background:rgba(240,165,0,.15);
  border:2px solid rgba(240,165,0,.5);
  color:#F0A500;
  flex:0 0 auto;
  padding:11px 18px;
  display:none;         /* JS sets display:flex when speaking */
  font-weight:700;
}

.btn-ask{
  background:#1C2333;border:1px solid #2A3550;
  color:#7A8BA0;cursor:not-allowed;
}
.btn-ask.ready{
  background:linear-gradient(135deg,#3DDC84,#1E6B42);
  border-color:transparent;color:#fff;cursor:pointer;
  box-shadow:0 4px 12px rgba(61,220,132,.25);
}

/* Type row */
.type-row{display:flex;gap:6px;}
.type-inp{
  flex:1;background:#161B27;border:1px solid #2A3550;
  border-radius:9px;color:#E2E8F0;padding:9px 12px;
  font-family:inherit;font-size:.85rem;transition:border-color .2s;
}
.type-inp:focus{outline:none;border-color:#3DDC84;}
.type-inp::placeholder{color:#3A4A5E;}
.btn-send{
  background:linear-gradient(135deg,#3DDC84,#1E6B42);border:none;
  border-radius:9px;color:#fff;padding:9px 14px;
  font-family:inherit;font-size:.85rem;font-weight:700;
  cursor:pointer;white-space:nowrap;transition:all .2s;
}
.btn-send:hover{transform:translateY(-1px);}
</style>
</head>
<body>
<div class="card">

  <!-- Top bar -->
  <div class="topbar">
    <div class="av">🌿</div>
    <div>
      <div class="mn">VidyGuide AI Mentor</div>
      <div class="ms">Career Guidance · Voice Enabled</div>
    </div>
    <div class="tr">
      <div class="sdot"></div>
      <span class="lang-badge" id="activeLangBadge">🌐 English</span>
      <button class="btn-clr" onclick="clearChat()">🗑 Clear</button>
    </div>
  </div>

  <!-- Language + speed settings (fully inside widget) -->
  <div class="lang-bar">
    <label>🎙️ You speak:</label>
    <select id="spkLang" onchange="updateLangBadge()">
      <option value="en-IN">English (India)</option>
      <option value="te-IN">Telugu</option>
      <option value="hi-IN">Hindi</option>
      <option value="ta-IN">Tamil</option>
      <option value="kn-IN">Kannada</option>
      <option value="ml-IN">Malayalam</option>
      <option value="mr-IN">Marathi</option>
      <option value="bn-IN">Bengali</option>
      <option value="gu-IN">Gujarati</option>
    </select>
    <label>🔊 Mentor replies in:</label>
    <select id="repLang" onchange="updateLangBadge()">
      <option value="en-IN" data-code="en" data-name="English">English</option>
      <option value="te-IN" data-code="te" data-name="Telugu">Telugu</option>
      <option value="hi-IN" data-code="hi" data-name="Hindi">Hindi</option>
      <option value="ta-IN" data-code="ta" data-name="Tamil">Tamil</option>
      <option value="kn-IN" data-code="kn" data-name="Kannada">Kannada</option>
      <option value="ml-IN" data-code="ml" data-name="Malayalam">Malayalam</option>
      <option value="mr-IN" data-code="mr" data-name="Marathi">Marathi</option>
      <option value="bn-IN" data-code="bn" data-name="Bengali">Bengali</option>
      <option value="gu-IN" data-code="gu" data-name="Gujarati">Gujarati</option>
    </select>
    <div class="speed-group">
      <label>🐢</label>
      <input type="range" id="spd" min="0.6" max="1.5" step="0.05" value="0.92"
             oninput="document.getElementById('spdVal').textContent=parseFloat(this.value).toFixed(2)+'×'">
      <span id="spdVal">0.92×</span>
    </div>
  </div>

  <!-- Chat log -->
  <div class="chat" id="chatLog">
    <div class="msg mentor">
      <div class="ico">🌿</div>
      <div class="bubble">
        👋 Hi! I'm your VidyGuide AI Mentor. Select your language above, then click 🎙️ to speak or type below. I'll reply in the language you selected. Ask me anything about careers!
      </div>
    </div>
  </div>

  <!-- Waveform -->
  <div class="wave" id="wave">
    <div class="bar" id="b0"></div><div class="bar" id="b1"></div>
    <div class="bar" id="b2"></div><div class="bar" id="b3"></div>
    <div class="bar" id="b4"></div><div class="bar" id="b5"></div>
    <div class="bar" id="b6"></div><div class="bar" id="b7"></div>
    <div class="bar" id="b8"></div><div class="bar" id="b9"></div>
    <div class="bar" id="b10"></div><div class="bar" id="b11"></div>
  </div>

  <!-- Status text -->
  <div class="status" id="statusTxt">Select language above → click 🎙️ to speak</div>

  <!-- No support warning -->
  <div class="nosup" id="noSup">
    ⚠️ Voice input requires Chrome or Edge. You can still type below.
  </div>

  <!-- Controls -->
  <div class="controls">
    <div class="btn-row">
      <button class="btn btn-mic" id="btnMic" onclick="toggleMic()">
        🎙️ <span id="micLbl">Start Speaking</span>
      </button>
      <button class="btn btn-stop" id="btnStop" onclick="stopSpeak()">
        ⏹ Stop Speaking
      </button>
      <button class="btn btn-ask" id="btnAsk" onclick="askFromVoice()" disabled>
        ✦ Ask
      </button>
    </div>
    <div class="type-row">
      <input class="type-inp" id="typeInput"
             placeholder="Or type your question here and press Enter…">
      <button class="btn-send" onclick="askFromText()">Send →</button>
    </div>
  </div>

</div>

<script>
// ── Config injected by Python ────────────────────────────────────────────────
const GROQ_KEY   = "%%GROQ_KEY%%";
const GROQ_MODEL = "llama-3.1-8b-instant";

// ── State ────────────────────────────────────────────────────────────────────
let recognition     = null;
let isRecording     = false;
let isSpeaking      = false;
let voiceTranscript = "";
let waveTimer       = null;
let convoHistory    = [];   // multi-turn memory [{role,content}]

// ── Language helpers ─────────────────────────────────────────────────────────
function getReplyLangCode() {
  const sel = document.getElementById('repLang');
  return sel.options[sel.selectedIndex].dataset.code || 'en';
}
function getReplyLangName() {
  const sel = document.getElementById('repLang');
  return sel.options[sel.selectedIndex].dataset.name || 'English';
}
function getSystemPrompt() {
  const langName = getReplyLangName();
  return (
    "You are VidyGuide AI Mentor — a warm, experienced career counselor for Indian students. " +
    "CRITICAL INSTRUCTION: You MUST reply ONLY in " + langName + ". " +
    "Do NOT mix languages. Do NOT include English if the reply language is not English. " +
    "Give clear, practical, actionable career advice in 3-5 sentences. " +
    "Be encouraging but honest. End with one concrete next step the user can take today."
  );
}
function updateLangBadge() {
  document.getElementById('activeLangBadge').textContent = '🌐 ' + getReplyLangName();
}

// ── Mic ──────────────────────────────────────────────────────────────────────
function toggleMic() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    document.getElementById('noSup').style.display = 'block';
    return;
  }
  if (isSpeaking) { stopSpeak(); return; }
  isRecording ? stopRec() : startRec();
}

function startRec() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang           = document.getElementById('spkLang').value;
  recognition.continuous     = true;
  recognition.interimResults = true;
  voiceTranscript            = "";

  recognition.onstart = () => {
    isRecording = true;
    document.getElementById('btnMic').classList.add('rec');
    document.getElementById('micLbl').textContent = 'Stop Recording';
    document.getElementById('btnAsk').disabled = true;
    document.getElementById('btnAsk').classList.remove('ready');
    startWave();
    setStatus('🔴 Listening… speak your question', '#FF8888');
  };

  recognition.onresult = (e) => {
    let fin = '', tmp = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) fin += t + ' ';
      else tmp += t;
    }
    voiceTranscript = (voiceTranscript + fin).trim();
    const full = voiceTranscript + (tmp ? ' ' + tmp : '');
    setStatus('🎙️ ' + (full || 'Listening…'), '#C8E8C8');
  };

  recognition.onerror = (e) => {
    const msgs = {
      'not-allowed': 'Microphone permission denied — allow it in browser settings',
      'no-speech':   'No speech detected — speak clearly and try again',
      'network':     'Network error — check internet connection',
      'aborted':     'Recording stopped',
      'audio-capture': 'No microphone found',
    };
    setStatus('⚠️ ' + (msgs[e.error] || 'Error: ' + e.error), '#FFAA88');
    stopRec();
  };

  recognition.onend = () => {
    stopRec();
    if (voiceTranscript.trim().length > 3) {
      document.getElementById('btnAsk').disabled = false;
      document.getElementById('btnAsk').classList.add('ready');
      setStatus('✅ Got it! Click Ask or press Enter in text box.', '#88FFAA');
    } else {
      setStatus('🎙️ Click mic to speak, or type below', '#9DB0C8');
    }
  };

  try { recognition.start(); }
  catch(e) { setStatus('⚠️ Could not start mic: ' + e.message, '#FFAA88'); }
}

function stopRec() {
  isRecording = false;
  if (recognition) { try { recognition.stop(); } catch(e){} recognition = null; }
  document.getElementById('btnMic').classList.remove('rec');
  document.getElementById('micLbl').textContent = 'Start Speaking';
  stopWave();
}

function askFromVoice() {
  const q = voiceTranscript.trim();
  if (!q || q.length < 3) { setStatus('⚠️ Speak a question first', '#FFAA88'); return; }
  voiceTranscript = '';
  document.getElementById('btnAsk').disabled = true;
  document.getElementById('btnAsk').classList.remove('ready');
  askMentor(q);
}

function askFromText() {
  const inp = document.getElementById('typeInput');
  const q   = inp.value.trim();
  if (!q || q.length < 2) { setStatus('⚠️ Type something first', '#FFAA88'); return; }
  inp.value = '';
  askMentor(q);
}

// ── Core ask ─────────────────────────────────────────────────────────────────
async function askMentor(question) {
  if (!GROQ_KEY || GROQ_KEY.length < 10) {
    addMsg('mentor', '⚠️ Groq API key not set. Add GROQ_API_KEY to your .env file.');
    return;
  }

  addMsg('user', question);
  convoHistory.push({ role: 'user', content: question });
  if (convoHistory.length > 20) convoHistory = convoHistory.slice(-20);

  const typId = addTyping();
  setStatus('⏳ Mentor is thinking…', '#88AAFF');

  try {
    const messages = [
      { role: 'system', content: getSystemPrompt() },
      ...convoHistory
    ];

    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + GROQ_KEY
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages:    messages,
        max_tokens:  500,
        temperature: 0.7,
        stream:      false
      })
    });

    if (!resp.ok) {
      const e = await resp.json().catch(() => ({}));
      throw new Error(e?.error?.message || 'API error ' + resp.status);
    }

    const data   = await resp.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not respond.';
    convoHistory.push({ role: 'assistant', content: answer });

    removeTyping(typId);
    addMsg('mentor', answer);
    speakText(answer);

  } catch(e) {
    removeTyping(typId);
    const net = e.message.includes('fetch') || e.message.includes('network');
    const msg = net ? '⚠️ Cannot reach Groq API — check internet connection.' : '⚠️ ' + e.message;
    addMsg('mentor', msg);
    setStatus('❌ ' + (net ? 'Connection failed' : e.message), '#FF8888');
  }
}

// ── TTS ──────────────────────────────────────────────────────────────────────
function speakText(text) {
  if (!window.speechSynthesis) {
    setStatus('✅ Done — click 🎙️ to ask another question', '#88FFAA');
    return;
  }
  window.speechSynthesis.cancel();

  const targetLocale = document.getElementById('repLang').value;
  const targetCode   = targetLocale.split('-')[0];
  const voices       = window.speechSynthesis.getVoices();

  // Best-match voice: exact locale > language > English > any
  const voice =
    voices.find(v => v.lang === targetLocale) ||
    voices.find(v => v.lang.startsWith(targetCode)) ||
    voices.find(v => v.lang.startsWith('en')) ||
    (voices[0] || null);

  const utter   = new SpeechSynthesisUtterance(text.substring(0, 1000));
  utter.lang    = voice ? voice.lang : targetLocale;
  utter.rate    = parseFloat(document.getElementById('spd').value);
  utter.pitch   = 1.0;
  utter.volume  = 1.0;
  if (voice) utter.voice = voice;

  isSpeaking = true;
  document.getElementById('btnStop').style.display = 'flex';  // always show
  setStatus('🔊 Speaking… click ⏹ Stop Speaking to interrupt', '#88FFAA');

  utter.onend = utter.onerror = () => {
    isSpeaking = false;
    document.getElementById('btnStop').style.display = 'none';
    setStatus('✅ Done — click 🎙️ to ask another question', '#88FFAA');
  };

  setTimeout(() => window.speechSynthesis.speak(utter), 100);
}

function stopSpeak() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  isSpeaking = false;
  document.getElementById('btnStop').style.display = 'none';
  setStatus('⏸ Stopped — click 🎙️ to continue', '#9DB0C8');
}

// ── Chat helpers ──────────────────────────────────────────────────────────────
function addMsg(role, text) {
  const log    = document.getElementById('chatLog');
  const wrap   = document.createElement('div');
  wrap.className = 'msg ' + role;
  const ico    = document.createElement('div');
  ico.className   = 'ico';
  ico.textContent = role === 'user' ? '👤' : '🌿';
  const bub    = document.createElement('div');
  bub.className   = 'bubble';
  bub.textContent = text;
  if (role === 'user') { wrap.appendChild(bub); wrap.appendChild(ico); }
  else                  { wrap.appendChild(ico); wrap.appendChild(bub); }
  log.appendChild(wrap);
  requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
}

function addTyping() {
  const log  = document.getElementById('chatLog');
  const id   = 'typ_' + Date.now();
  const wrap = document.createElement('div');
  wrap.className = 'msg mentor'; wrap.id = id;
  wrap.innerHTML = '<div class="ico">🌿</div>'
    + '<div class="bubble"><div class="dots">'
    + '<span></span><span></span><span></span></div></div>';
  log.appendChild(wrap);
  log.scrollTop = log.scrollHeight;
  return id;
}
function removeTyping(id) { const el = document.getElementById(id); if (el) el.remove(); }

function clearChat() {
  const log = document.getElementById('chatLog');
  log.innerHTML = '<div class="msg mentor"><div class="ico">🌿</div>'
    + '<div class="bubble">Chat cleared! Ask me anything.</div></div>';
  convoHistory = []; voiceTranscript = '';
  document.getElementById('btnAsk').disabled = true;
  document.getElementById('btnAsk').classList.remove('ready');
  setStatus('Click 🎙️ to speak', '#9DB0C8');
}

// ── Waveform ──────────────────────────────────────────────────────────────────
const BARS = Array.from({length:12}, (_,i) => document.getElementById('b'+i));
function startWave() {
  let t = 0;
  waveTimer = setInterval(() => {
    t++;
    BARS.forEach((b,i) => {
      if (!b) return;
      b.style.transform = 'scaleY(' + (0.15 + 0.85*Math.abs(Math.sin((t+i*1.5)*0.4))).toFixed(2) + ')';
    });
  }, 80);
}
function stopWave() {
  if (waveTimer) { clearInterval(waveTimer); waveTimer = null; }
  BARS.forEach(b => { if (b) b.style.transform = 'scaleY(0.15)'; });
}

// ── Status ────────────────────────────────────────────────────────────────────
function setStatus(text, color) {
  const el = document.getElementById('statusTxt');
  el.textContent = text; el.style.color = color || '#9DB0C8';
}

// ── Keyboard ──────────────────────────────────────────────────────────────────
document.getElementById('typeInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askFromText(); }
});

// ── Voice list (update reply selector with ✓ marks) ───────────────────────────
function updateVoiceList() {
  const voices  = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  const repSel  = document.getElementById('repLang');
  Array.from(repSel.options).forEach(opt => {
    const lc       = opt.value.split('-')[0];
    const hasVoice = voices.some(v => v.lang === opt.value || v.lang.startsWith(lc));
    const name     = opt.dataset.name || opt.textContent.replace(/ [✓✗].*/, '');
    opt.textContent = hasVoice ? name + ' ✓' : name;
    opt.dataset.name = name;
  });
}
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = updateVoiceList;
  setTimeout(updateVoiceList, 600);
}

// Chrome TTS keep-alive (prevents cutting at ~15s)
setInterval(() => {
  if (isSpeaking && window.speechSynthesis?.speaking && !window.speechSynthesis?.paused) {
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }
}, 10000);
</script>
</body>
</html>"""


def render_voice_widget(groq_api_key: str = "", height: int = 660):
    """Render the fully self-contained voice mentor widget."""
    import streamlit.components.v1 as components
    import os
    key  = groq_api_key or os.getenv("GROQ_API_KEY", "")
    html = VOICE_WIDGET_HTML.replace("%%GROQ_KEY%%", key)
    components.html(html, height=height, scrolling=False)