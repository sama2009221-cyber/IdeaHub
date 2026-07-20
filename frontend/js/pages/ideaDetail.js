import { apiFetch } from '../api.js';
import { requireAuth } from '../auth.js';
import { escapeHTML } from '../utils.js';
import { createRatingWidget } from '../components/ratingWidget.js?v=2';
import { createCommentThread } from '../components/commentThread.js';
import { createAINotesPanel } from '../components/aiNotesPanel.js?v=2';
import { createChatWidget } from '../components/chatWidget.js';

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    const urlParams = new URLSearchParams(window.location.search);
    const ideaId = urlParams.get('id');

    if (!ideaId) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Tabs logic
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // Fetch Idea Data
    try {
        const idea = await apiFetch(`/ideas/${ideaId}/`);
        
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('idea-details').classList.remove('hidden');

        document.getElementById('idea-title').textContent = idea.title;
        document.getElementById('idea-author').textContent = idea.owner_name || 'Unknown';
        document.getElementById('idea-category').textContent = idea.category;
        
        const statusSpan = document.getElementById('idea-status');
        statusSpan.textContent = idea.status.replace('_', ' ').toUpperCase();
        
        // Render current description (assuming idea.versions contains versions array, grab the latest)
        if (idea.versions && idea.versions.length > 0) {
            const latestVersion = idea.versions[idea.versions.length - 1];
            document.getElementById('idea-description').textContent = latestVersion.description;
            
            // Render versions list
            const versionsList = document.getElementById('versions-list');
            idea.versions.forEach(v => {
                versionsList.innerHTML += `
                    <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <strong>Version ${v.version_number}</strong>
                        <p style="font-size: 0.875rem; margin-top: 4px; color: #cbd5e1;">${escapeHTML(v.description).substring(0, 100)}...</p>
                    </div>
                `;
            });
        }

        // Render files
        const filesContainer = document.getElementById('idea-files');
        if (idea.files && idea.files.length > 0) {
            idea.files.forEach(f => {
                const fileName = f.file.split('/').pop();
                filesContainer.innerHTML += `
                    <div style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 14px;">${escapeHTML(fileName)}</span>
                        <a href="https://ideahub-production-67f3.up.railway.app${f.file}" target="_blank" style="color: var(--accent); text-decoration: none; font-size: 13px;">تحميل / عرض</a>
                    </div>
                `;
            });
        } else {
            filesContainer.innerHTML = '<p style="color: var(--text-dim); font-size: 14px;">لا توجد ملفات مرفقة.</p>';
        }

        // Initialize components
        document.getElementById('ratings-widget-container').innerHTML = '';
        document.getElementById('ratings-widget-container').appendChild(createRatingWidget(ideaId));
        
        document.getElementById('comments-thread-container').innerHTML = '';
        document.getElementById('comments-thread-container').appendChild(createCommentThread(ideaId));
        
        document.getElementById('ai-notes-container').innerHTML = '';
        document.getElementById('ai-notes-container').appendChild(createAINotesPanel(idea.ai_evaluation));
        
        document.getElementById('chat-widget-container').innerHTML = '';
        document.getElementById('chat-widget-container').appendChild(createChatWidget(ideaId));

    } catch (error) {
        document.getElementById('loading-state').textContent = 'Failed to load idea details.';
        console.error('Error fetching idea', error);
    }
});

