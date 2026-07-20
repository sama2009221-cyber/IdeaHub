import { apiFetch } from '../api.js';
import { requireAuth } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();

    const wrapper = document.getElementById('ideas-wrapper');
    const panel = document.getElementById('eval-panel');
    const evalForm = document.getElementById('eval-form');

    let currentIdeas = [];

    async function loadIdeas() {
        try {
            const ideas = await apiFetch('/ideas/');
            currentIdeas = ideas;
            wrapper.innerHTML = '';
            
            if (ideas.length === 0) {
                wrapper.innerHTML = '<p style="color: var(--text-muted); padding: 16px;">No ideas targeted to you for review.</p>';
                return;
            }

            ideas.forEach(idea => {
                const card = document.createElement('div');
                card.className = 'idea-card';
                card.innerHTML = `
                    <h4 style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${idea.title}</h4>
                    <span style="font-size: 12px; color: var(--text-muted);">${idea.owner_name} • ${new Date(idea.created_at).toLocaleDateString()}</span>
                `;
                card.addEventListener('click', () => selectIdea(idea, card));
                wrapper.appendChild(card);
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function selectIdea(idea, cardElement) {
        // active state
        document.querySelectorAll('.idea-card').forEach(c => c.classList.remove('active'));
        if (cardElement) cardElement.classList.add('active');

        panel.style.display = 'block';
        document.getElementById('detail-title').textContent = idea.title;
        document.getElementById('detail-author').textContent = `Submitted by ${idea.owner_name}`;
        document.getElementById('eval-idea-id').value = idea.id;
        document.getElementById('eval-success').style.display = 'none';
        
        // Clear previous eval form
        document.getElementById('human-score').value = '';
        document.getElementById('human-notes').value = '';

        // Fetch description
        try {
            const versions = await apiFetch(`/versions/?idea=${idea.id}`);
            const latest = versions.filter(v => v.idea === idea.id).sort((a,b) => b.version_number - a.version_number)[0];
            document.getElementById('detail-desc').textContent = latest ? latest.description : 'No description available.';
        } catch (e) {
            document.getElementById('detail-desc').textContent = 'Error loading description.';
        }

        // Fetch AI Eval from the idea object itself
        if (idea.ai_evaluation) {
            document.getElementById('ai-concept').textContent = idea.ai_evaluation.concept_score;
            document.getElementById('ai-feasibility').textContent = idea.ai_evaluation.feasibility_score;
            document.getElementById('ai-application').textContent = idea.ai_evaluation.application_score;
            document.getElementById('ai-notes').textContent = idea.ai_evaluation.overall_notes;
        } else {
            document.getElementById('ai-concept').textContent = "-";
            document.getElementById('ai-feasibility').textContent = "-";
            document.getElementById('ai-application').textContent = "-";
            document.getElementById('ai-notes').textContent = "جارِ التقييم بواسطة الذكاء الاصطناعي...";
        }
    }

    evalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ideaId = document.getElementById('eval-idea-id').value;
        const score = document.getElementById('human-score').value;
        const notes = document.getElementById('human-notes').value;

        try {
            await apiFetch(`/ideas/${ideaId}/evaluate/`, {
                method: 'POST',
                body: { numeric_score: parseInt(score), feedback_text: notes }
            });
            document.getElementById('eval-success').style.display = 'block';
        } catch (error) {
            alert('Failed to submit evaluation.');
        }
    });

    loadIdeas();
});
