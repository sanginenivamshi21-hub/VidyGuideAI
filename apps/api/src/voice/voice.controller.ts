import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import * as express from 'express';

@Controller('voice')
export class VoiceController {
  @Get('widget')
  async getWidget(@Res() res: express.Response) {
    try {
      const groqKey = process.env.GROQ_API_KEY || '';
      const html = this.buildWidgetHtml(groqKey);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error serving widget: ' + err.message);
    }
  }

  private buildWidgetHtml(groqKey: string): string {
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
'    background: #0f172a; color: #e2e8f0; height: 100vh;\n' +
'    display: flex; flex-direction: column;\n' +
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
'  .chat { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }\n' +
'  .message { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; }\n' +
'  .user { background: #1e293b; border: 1px solid #334155; align-self: flex-end; border-bottom-right-radius: 4px; }\n' +
'  .ai { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); align-self: flex-start; border-bottom-left-radius: 4px; color: #d1fae5; }\n' +
'  .controls { padding: 12px 16px; background: #1e293b; border-top: 1px solid #334155; display: flex; gap: 8px; }\n' +
'  .btn {\n' +
'    flex: 1; padding: 10px; border: none; border-radius: 10px; font-size: 13px; font-weight: 600;\n' +
'    cursor: pointer; transition: all 0.2s;\n' +
'  }\n' +
'  .btn:disabled { opacity: 0.4; cursor: not-allowed; }\n' +
'  .btn-record { background: #ef4444; color: #fff; }\n' +
'  .btn-record:hover:not(:disabled) { background: #dc2626; }\n' +
'  .btn-stop { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }\n' +
'  .btn-stop:hover:not(:disabled) { background: #334155; }\n' +
'  .btn-send { background: #10b981; color: #fff; }\n' +
'  .btn-send:hover:not(:disabled) { background: #059669; }\n' +
'  textarea {\n' +
'    flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #334155;\n' +
'    background: #0f172a; color: #e2e8f0; font-size: 13px; resize: none;\n' +
'    outline: none; font-family: inherit;\n' +
'  }\n' +
'  textarea:focus { border-color: #10b981; }\n' +
'  .typing { display: flex; gap: 4px; padding: 4px 0; }\n' +
'  .typing span { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: bounce 1.4s infinite; }\n' +
'  .typing span:nth-child(2) { animation-delay: 0.2s; }\n' +
'  .typing span:nth-child(3) { animation-delay: 0.4s; }\n' +
'  @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="header">\n' +
'  <span style="font-size:18px">🎙️</span>\n' +
'  <h1>Voice Mentor</h1>\n' +
'  <span class="status idle" id="status">Idle</span>\n' +
'</div>\n' +
'<div class="chat" id="chat"></div>\n' +
'<div class="controls" id="controls">\n' +
'  <textarea id="input" rows="1" placeholder="Type or speak a question..."></textarea>\n' +
'  <button class="btn btn-record" id="recordBtn" title="Start Recording">🎤</button>\n' +
'  <button class="btn btn-send" id="sendBtn">Send</button>\n' +
'</div>\n' +
'<script>\n' +
"const GROQ_KEY = '" + groqKey + "';\n" +
"const chat = document.getElementById('chat');\n" +
"const input = document.getElementById('input');\n" +
"const recordBtn = document.getElementById('recordBtn');\n" +
"const sendBtn = document.getElementById('sendBtn');\n" +
"const statusEl = document.getElementById('status');\n" +
'\n' +
'let isListening = false;\n' +
'let recognition = null;\n' +
'\n' +
'function addMessage(text, role) {\n' +
"  const div = document.createElement('div');\n" +
"  div.className = 'message ' + role;\n" +
'  div.textContent = text;\n' +
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
'function setStatus(state) {\n' +
"  statusEl.className = 'status ' + state;\n" +
"  statusEl.textContent = state.charAt(0).toUpperCase() + state.slice(1);\n" +
'}\n' +
'\n' +
'async function queryGroq(text) {\n' +
"  if (!GROQ_KEY) return 'Groq API key is not configured. Please set GROQ_API_KEY.';\n" +
'  try {\n' +
"    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {\n" +
"      method: 'POST',\n" +
"      headers: {\n" +
"        'Content-Type': 'application/json',\n" +
"        'Authorization': 'Bearer ' + GROQ_KEY,\n" +
"      },\n" +
"      body: JSON.stringify({\n" +
"        model: 'llama3-8b-8192',\n" +
'        messages: [\n' +
"          { role: 'system', content: 'You are a helpful career counselor for Indian students. Answer concisely in 2-3 sentences. Respond in the language the user speaks.' },\n" +
"          { role: 'user', content: text },\n" +
'        ],\n' +
'      }),\n' +
'    });\n' +
'    const data = await res.json();\n' +
"    return data.choices?.[0]?.message?.content || 'I could not process that request.';\n" +
'  } catch (e) {\n' +
"    return 'Error: ' + e.message;\n" +
'  }\n' +
'}\n' +
'\n' +
'function speakText(text) {\n' +
'  if (!window.speechSynthesis) return;\n' +
'  window.speechSynthesis.cancel();\n' +
'  const utterance = new SpeechSynthesisUtterance(text);\n' +
'  utterance.rate = 1.0;\n' +
'  utterance.pitch = 1.0;\n' +
"  utterance.lang = 'hi-IN';\n" +
'  window.speechSynthesis.speak(utterance);\n' +
'}\n' +
'\n' +
'async function handleQuery(text) {\n' +
"  addMessage(text, 'user');\n" +
"  input.value = '';\n" +
'  showTyping();\n' +
"  setStatus('thinking');\n" +
'  const reply = await queryGroq(text);\n' +
'  hideTyping();\n' +
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
'  recognition.onerror = () => {\n' +
'    isListening = false;\n' +
"    recordBtn.textContent = '🎤';\n" +
"    setStatus('idle');\n" +
"    addMessage('Voice recognition error. Please try again.', 'ai');\n" +
'  };\n' +
'\n' +
'  recognition.onend = () => {\n' +
'    isListening = false;\n' +
"    recordBtn.textContent = '🎤';\n" +
"    setStatus('idle');\n" +
'  };\n' +
'\n' +
"  recordBtn.addEventListener('click', () => {\n" +
'    if (isListening) {\n' +
'      recognition.stop();\n' +
'      isListening = false;\n' +
"      recordBtn.textContent = '🎤';\n" +
"      setStatus('idle');\n" +
'    } else {\n' +
'      try {\n' +
'        recognition.start();\n' +
'        isListening = true;\n' +
"        recordBtn.textContent = '⏹';\n" +
"        setStatus('listening');\n" +
'      } catch (e) {\n' +
"        setStatus('idle');\n" +
'      }\n' +
'    }\n' +
'  });\n' +
'} else {\n' +
'  recordBtn.disabled = true;\n' +
"  recordBtn.title = 'Speech recognition not supported in this browser';\n" +
'}\n' +
'\n' +
"addMessage('Hello! I am your Voice Mentor. Ask me anything about careers, education, or interviews.', 'ai');\n" +
'</script>\n' +
'</body>\n' +
'</html>';
  }
}
