import { apiFetch } from '../api.js';
import { escapeHTML } from '../utils.js';

export function createCommentThread(ideaId, comments = []) {
    const container = document.createElement('div');
    container.className = 'glass-panel flex flex-col';
    container.style.marginTop = 'var(--space-24)';
    container.style.padding = 'var(--space-24)';

    container.innerHTML = `
        <h3 style="margin-bottom: var(--space-16);">Comments</h3>
        <div id="comments-list" class="flex flex-col gap-4" style="margin-bottom: var(--space-24);">
            ${comments.length === 0 ? '<p style="color: var(--text-muted); font-size: var(--text-sm);">No comments yet.</p>' : ''}
        </div>
        <form id="comment-form" class="flex gap-2">
            <input type="text" id="comment-input" class="form-input" placeholder="Add a comment..." required>
            <button type="submit" class="btn btn-primary">Post</button>
        </form>
    `;

    const commentsList = container.querySelector('#comments-list');
    
    comments.forEach(c => {
        commentsList.innerHTML += renderComment(c);
    });

    const form = container.querySelector('#comment-form');
    const input = container.querySelector('#comment-input');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        try {
            const newComment = await apiFetch(`/ideas/${ideaId}/comments/`, {
                method: 'POST',
                body: { text: text }
            });
            
            if (comments.length === 0) commentsList.innerHTML = ''; // Clear "No comments" text
            commentsList.innerHTML += renderComment(newComment);
            input.value = '';
        } catch (err) {
            alert('Failed to post comment: ' + err.message);
        }
    });

    return container;
}

function renderComment(comment) {
    return `
        <div style="background: var(--bg-surface-raised); padding: var(--space-16); border-radius: 12px; border: 1px solid var(--border-subtle);">
            <div class="flex justify-between items-center" style="margin-bottom: var(--space-8);">
                <span style="font-weight: var(--weight-medium); font-size: var(--text-sm);">${escapeHTML(comment.user_name || 'User')}</span>
                <span style="color: var(--text-muted); font-size: var(--text-xs);">${new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <p style="color: var(--text-secondary); font-size: var(--text-sm);">${escapeHTML(comment.text)}</p>
        </div>
    `;
}

