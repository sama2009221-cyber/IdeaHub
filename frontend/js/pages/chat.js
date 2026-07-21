import { apiFetch } from '../api.js';
import { requireAuth } from '../auth.js';

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'msg-user' : 'msg-ai'}`;
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Load history
    apiFetch('/ideas/general_chat_history/')
        .then(history => {
            if (history && history.length > 0) {
                history.forEach(msg => {
                    addMessage(msg.message, !msg.is_bot);
                });
            }
        })
        .catch(err => console.error("Failed to load history", err));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, true);
        input.value = '';
        input.disabled = true;

        // Add loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message msg-ai';
        loadingDiv.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Searching ideas...';
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const res = await apiFetch('/ideas/rag_chat/', {
                method: 'POST',
                body: { question: text }
            });
            messagesContainer.removeChild(loadingDiv);
            addMessage(res.answer || "I couldn't generate a response.");
        } catch (error) {
            messagesContainer.removeChild(loadingDiv);
            addMessage("An error occurred while connecting to the AI.");
        } finally {
            input.disabled = false;
            input.focus();
        }
    });
});
