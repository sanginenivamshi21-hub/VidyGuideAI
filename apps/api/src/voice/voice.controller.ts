import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import * as express from 'express';

@Controller('voice')
export class VoiceController {
  @Get('widget')
  async getWidget(@Res() res: express.Response) {
    try {
      const html = this.buildWidgetHtml();
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error serving widget: ' + err.message);
    }
  }

  @Post('chat')
  async chat(@Body('message') message: string) {
    const groqKey = process.env.GROQ_API_KEY;
    if (!message) {
      return { error: 'Message is required' };
    }
    if (!groqKey) {
      return { error: 'Groq API key not configured on server' };
    }
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + groqKey,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a career counselor for Indian students. Respond concisely in 2-3 sentences. Use emojis naturally. Speak in the language the user uses.' },
            { role: 'user', content: message },
          ],
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'I could not process that request.';
      return { reply };
    } catch (err) {
      return { error: err.message };
    }
  }

  private buildWidgetHtml(): string {
    return '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'<title>Voice Mentor</title>\n' +
'<style>\n' +
'  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
'  body {\n' +
'    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n' +
'    background: #0f172a; color: #e2e8f0; height: 100vh; display: flex; flex-direction: column;\n' +
'  }\n' +
'  .header {\n' +
'    padding: 12px 16px; background: #1e293b; border-bottom: 1px solid #334155;\n' +
'    display: flex; align-items: center; gap: 10px;\n' +
'  }\n' +
'  .header h1 { font-size: 14px; font-weight: 700; color: #fff; }\n' +
'  .header .status { margin-left: auto; font-size: 11px; padding: 4px 10px; border-radius: 20px; }\n' +
'  .status.idle { background: #1e293b; color: #64748b; border: 1px solid #334155; }\n' +
'  .status.listening { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }\n' +
'  .status.thinking { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }\n' +
'  .status.error { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }\n' +
'  .chat { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }\n' +
'  .message { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }\n' +
'  .user { background: #1e293b; border: 1px solid #334155; align-self: flex-end; border-bottom-right-radius: 4px; }\n' +
'  .ai { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); align-self: flex-start; border-bottom-left-radius: 4px; color: #d1fae5; }\n' +
'  .controls { padding: 12px 16px; background: #1e293b; border-top: 1px solid #334155; display: flex; gap: 8px; align-items: center; }\n' +
'  .btn {\n' +
'    padding: 10px 14px; border: none; border-radius: 10px; font-size: 13px; font-weight: 600;\n' +
'    cursor: pointer; transition: all 0.2s; white-space: nowrap;\n' +
'  }\n' +
'  .btn:disabled { opacity: 0.4; cursor: not-allowed; }\n' +
'  .btn-primary { background: #10b981; color: #fff; }\n' +
'  .btn-primary:hover:not(:disabled) { background: #059669; }\n' +
'  .btn-danger { background: #ef4444; color: #fff; }\n' +
'  .btn-danger:hover:not(:disabled) { background: #dc2626; }\n' +
'  .btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; }\n' +
'  .btn-ghost:hover:not(:disabled) { background: #1e293b; }\n' +
'  .btn-sm { padding: 6px 10px; font-size: 11px; }\n' +
'  textarea {\n' +
'    flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #334155;\n' +
'    background: #0f172a; color: #e2e8f0; font-size: 13px; resize: none;\n' +
'    outline: none; font-family: inherit;\n' +
'  }\n' +
'  textarea:focus { border-color: #10b981; }\n' +
'  .typing { display: flex; gap: 4px; padding: 8px 14px; align-self: flex-start; }\n' +
'  .typing span { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: bounce 1.4s infinite; }\n' +
'  .typing span:nth-child(2) { animation-delay: 0.2s; }\n' +
'  .typing span:nth-child(3) { animation-delay: 0.4s; }\n' +
'  @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }\n' +
'  .error-msg { color: #fca5a5; font-size: 12px; text-align: center; padding: 8px; }\n' +
'  .toolbar { display: flex; gap: 4px; padding: 4px 8px; background: #1e293b; border-top: 1px solid #334155; justify-content: center; }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="header">\n' +
'  <span style="font-size:18px">🎙️</span>\n' +
'  <h1>Voice Mentor</h1>\n' +
'  <span class="status idle" id="status">Idle</span>\n' +
'</div>\n' +
'<div class="chat" id="chat"></div>\n' +
'<div class="toolbar" id="toolbar">\n' +
'  <button class="btn btn-ghost btn-sm" id="stopBtn" disabled title="Stop speaking">🔇 Stop</button>\n' +
'  <button class="btn btn-ghost btn-sm" id="clearBtn" title="Clear conversation">🗑️ Clear</button>\n' +
'</div>\n' +
'<div class="controls" id="controls">\n' +
'  <textarea id="input" rows="1" placeholder="Type or speak a question..."></textarea>\n' +
'  <button class="btn btn-danger" id="recordBtn" title="Start Recording">🎤</button>\n' +
'  <button class="btn btn-primary" id="sendBtn">Send</button>\n' +
'</div>\n' +
'<script>\n' +
'(function(){\n' +
"const API = '';\n" +
"const chat = document.getElementById('chat');\n" +
"const input = document.getElementById('input');\n" +
"const recordBtn = document.getElementById('recordBtn');\n" +
"const sendBtn = document.getElementById('sendBtn');\n" +
"const statusEl = document.getElementById('status');\n" +
"const stopBtn = document.getElementById('stopBtn');\n" +
"const clearBtn = document.getElementById('clearBtn');\n" +
'let isListening = false;\n' +
'let recognition = null;\n' +
'let isSpeaking = false;\n' +
'let conversationHistory = [];\n' +
'\n' +
'function addMessage(text, role) {\n' +
"  const div = document.createElement('div');\n" +
"  div.className = 'message ' + role;\n" +
'  div.textContent = text;\n' +
"  const actions = document.createElement('div');\n" +
'  actions.style.cssText = "display:flex;gap:4px;margin-top:4px;";\n' +
"  if (role === 'ai') {\n" +
"    const speakBtn = document.createElement('button');\n" +
"    speakBtn.textContent = '🔊';\n" +
'    speakBtn.style.cssText = "background:none;border:none;cursor:pointer;font-size:11px;color:#94a3b8;padding:2px;";\n' +
"    speakBtn.title = 'Read aloud';\n" +
"    speakBtn.onclick = () => speakText(text);\n" +
'    actions.appendChild(speakBtn);\n' +
"    const retryBtn = document.createElement('button');\n" +
"    retryBtn.textContent = '🔄';\n" +
'    retryBtn.style.cssText = "background:none;border:none;cursor:pointer;font-size:11px;color:#94a3b8;padding:2px;";\n' +
"    retryBtn.title = 'Retry';\n" +
'    retryBtn.onclick = () => handleQuery(conversationHistory[conversationHistory.length - 1]?.user || input.value || text);\n' +
'    actions.appendChild(retryBtn);\n' +
'  }\n' +
'  div.appendChild(actions);\n' +
'  chat.appendChild(div);\n' +
'  chat.scrollTop = chat.scrollHeight;\n' +
'}\n' +
'\n' +
'function showTyping() {\n' +
"  const div = document.createElement('div');\n" +
"  div.className = 'typing';\n" +
"  div.id = 'typing';\n" +
"  div.innerHTML = '<span></span><span></span><span></span>';\n" +
'  chat.appendChild(div);\n' +
'  chat.scrollTop = chat.scrollHeight;\n' +
'}\n' +
'\n' +
'function hideTyping() {\n' +
"  const el = document.getElementById('typing');\n" +
'  if (el) el.remove();\n' +
'}\n' +
'\n' +
'function setStatus(state, msg) {\n' +
"  statusEl.className = 'status ' + state;\n" +
'  statusEl.textContent = msg || (state.charAt(0).toUpperCase() + state.slice(1));\n' +
'}\n' +
'\n' +
'async function queryBackend(text) {\n' +
'  try {\n' +
"    const res = await fetch(API + '/voice/chat', {\n" +
"      method: 'POST',\n" +
"      headers: { 'Content-Type': 'application/json' },\n" +
"      body: JSON.stringify({ message: text }),\n" +
'    });\n' +
'    const data = await res.json();\n' +
'    if (data.error) return "Error: " + data.error;\n' +
'    return data.reply || "I could not process that request.";\n' +
'  } catch (e) {\n' +
'    return "Connection error. Please ensure the backend is running.";\n' +
'  }\n' +
'}\n' +
'\n' +
'function speakText(text) {\n' +
'  if (!window.speechSynthesis) return;\n' +
'  window.speechSynthesis.cancel();\n' +
'  const utterance = new SpeechSynthesisUtterance(text.replace(/[\\*\\#\\[\\]\\\\(\\\)]/g, ""));\n' +
'  utterance.rate = 0.9;\n' +
'  utterance.pitch = 1.0;\n' +
'  isSpeaking = true;\n' +
"  stopBtn.disabled = false;\n" +
"  utterance.onend = () => { isSpeaking = false; stopBtn.disabled = true; };\n" +
'  window.speechSynthesis.speak(utterance);\n' +
'}\n' +
'\n' +
'function stopSpeaking() {\n' +
'  if (window.speechSynthesis) {\n' +
'    window.speechSynthesis.cancel();\n' +
'  }\n' +
'  isSpeaking = false;\n' +
"  stopBtn.disabled = true;\n" +
'}\n' +
'\n' +
'function clearConversation() {\n' +
"  chat.innerHTML = '';\n" +
'  conversationHistory = [];\n' +
"  addMessage('Hello! I am your Voice Mentor. Ask me anything about careers, education, or interviews.', 'ai');\n" +
'}\n' +
'\n' +
'async function handleQuery(text) {\n' +
"  addMessage(text, 'user');\n" +
"  input.value = '';\n" +
'  showTyping();\n' +
"  setStatus('thinking');\n" +
'  const reply = await queryBackend(text);\n' +
'  hideTyping();\n' +
"  conversationHistory.push({ user: text, ai: reply });\n" +
"  addMessage(reply, 'ai');\n" +
'  speakText(reply);\n' +
"  setStatus('idle');\n" +
'}\n' +
'\n' +
"sendBtn.addEventListener('click', () => {\n" +
'  const text = input.value.trim();\n' +
'  if (text) handleQuery(text);\n' +
'});\n' +
'\n' +
"input.addEventListener('keydown', (e) => {\n" +
"  if (e.key === 'Enter' && !e.shiftKey) {\n" +
'    e.preventDefault();\n' +
'    const text = input.value.trim();\n' +
'    if (text) handleQuery(text);\n' +
'  }\n' +
'});\n' +
'\n' +
"stopBtn.addEventListener('click', stopSpeaking);\n" +
"clearBtn.addEventListener('click', clearConversation);\n" +
'\n' +
"if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {\n" +
'  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;\n' +
'  recognition = new SpeechRecognition();\n' +
'  recognition.continuous = false;\n' +
'  recognition.interimResults = false;\n' +
"  recognition.lang = 'hi-IN';\n" +
'\n' +
'  recognition.onresult = (event) => {\n' +
'    const text = event.results[0][0].transcript;\n' +
'    isListening = false;\n' +
"    recordBtn.textContent = '🎤';\n" +
"    setStatus('idle');\n" +
'    handleQuery(text);\n' +
'  };\n' +
'\n' +
'  recognition.onerror = (event) => {\n' +
'    isListening = false;\n' +
"    recordBtn.textContent = '🎤';\n" +
"    setStatus('error', 'Mic error: ' + event.error);\n" +
"    if (event.error === 'not-allowed') {\n" +
"      addMessage('⚠️ Microphone access denied. Please allow microphone permissions in your browser settings and reload.', 'ai');\n" +
'    } else if (event.error === "no-speech") {\n' +
"      addMessage('🔇 No speech detected. Please try again.', 'ai');\n" +
'    }\n' +
'  };\n' +
'\n' +
'  recognition.onend = () => {\n' +
'    isListening = false;\n' +
"    recordBtn.textContent = '🎤';\n" +
"    if (statusEl.textContent === 'Listening') setStatus('idle');\n" +
'  };\n' +
'\n' +
"  recordBtn.addEventListener('click', () => {\n" +
'    if (isListening) {\n' +
'      recognition.stop();\n' +
'    } else {\n' +
'      try {\n' +
'        recognition.start();\n' +
'        isListening = true;\n' +
"        recordBtn.textContent = '⏹';\n" +
"        setStatus('listening');\n" +
'      } catch (e) {\n' +
"        addMessage('⚠️ Could not start microphone. Check permissions.', 'ai');\n" +
"        setStatus('idle');\n" +
'      }\n' +
'    }\n' +
'  });\n' +
'} else {\n' +
'  recordBtn.disabled = true;\n' +
"  recordBtn.title = 'Speech recognition not supported';\n" +
"  recordBtn.style.opacity = '0.4';\n" +
"  addMessage('ℹ️ Speech recognition is not available in this browser. Please use Chrome or Edge for voice input. You can still type your questions.', 'ai');\n" +
'}\n' +
'\n' +
"addMessage('Hello! I am your Voice Mentor. Ask me anything about careers, education, or interviews.', 'ai');\n" +
'})();\n' +
'</script>\n' +
'</body>\n' +
'</html>';
  }
}
