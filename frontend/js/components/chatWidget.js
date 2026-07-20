import { apiFetch } from '../api.js';
import { escapeHTML } from '../utils.js';

export function createChatWidget(ideaId) {
  const container = document.createElement('div');
  container.className = 'side-panel';

  container.innerHTML = `
    <div class="side-panel-head">
      <div class="ico" style="background:rgba(52,211,153,.10);color:var(--green)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>المساعد الذكي</h3>
      <div class="pulse" style="margin-inline-start:auto"></div>
    </div>

    <div class="chat-messages" id="chat-messages">
      <div class="msg-empty">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="display:block;margin:0 auto 10px;opacity:.35">
          <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        اسأل الذكاء الاصطناعي أي سؤال<br>عن هذه الفكرة...
      </div>
    </div>

    <form class="chat-form" id="chat-form">
      <input
        type="text"
        class="chat-input"
        id="chat-input"
        placeholder="اكتب سؤالك هنا..."
        autocomplete="off"
        required
      >
      <button type="submit" class="chat-send" id="chat-send-btn" title="إرسال">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </form>
  `;

  const messagesDiv = container.querySelector('#chat-messages');
  const form        = container.querySelector('#chat-form');
  const input       = container.querySelector('#chat-input');
  const sendBtn     = container.querySelector('#chat-send-btn');
  let firstMsg      = true;

  function scrollBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function appendMsg(html) {
    if (firstMsg) { messagesDiv.innerHTML = ''; firstMsg = false; }
    const el = document.createElement('div');
    el.innerHTML = html;
    messagesDiv.appendChild(el.firstElementChild);
    scrollBottom();
    return messagesDiv.lastElementChild;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // User bubble
    appendMsg(`<div class="msg-user">${escapeHTML(text)}</div>`);
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;
    sendBtn.style.opacity = '.5';

    // AI thinking bubble
    const thinkEl = appendMsg(`<div class="msg-ai thinking">جاري التفكير...</div>`);

    try {
      const response = await apiFetch(`/ideas/${ideaId}/chat/`, {
        method: 'POST',
        body: { message: text }
      });
      thinkEl.className = 'msg-ai';
      thinkEl.textContent = response.reply;
    } catch (err) {
      thinkEl.outerHTML = `<div class="msg-error">⚠ ${escapeHTML(err.message)}</div>`;
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
      input.focus();
      scrollBottom();
    }
  });

  return container;
}
