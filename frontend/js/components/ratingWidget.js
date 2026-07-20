import { apiFetch } from '../api.js';

export function createRatingWidget(ideaId, initialRating = null) {
    const container = document.createElement('div');
    container.className = 'glass-panel';
    container.style.padding = 'var(--space-24)';

    const role = localStorage.getItem('user_role');
    if (role === 'employee') {
        container.innerHTML = `
            <h3 style="margin-bottom: var(--space-16); font-size: var(--text-lg); color: var(--text-secondary);">Your Evaluation</h3>
            <div style="color: var(--text-muted); font-size: var(--text-sm); font-style: italic;">
                Evaluations are restricted to Managers and Owners.
            </div>
        `;
        return container;
    }

    container.innerHTML = `
        <h3 style="margin-bottom: var(--space-16); font-size: var(--text-lg);">Your Evaluation</h3>
        <form id="rating-form">
            <div class="form-group">
                <label class="form-label">Star Rating (Overall Impression)</label>
                <div id="star-rating" style="display: flex; gap: 8px; font-size: 24px; cursor: pointer; color: var(--text-muted); margin-bottom: 8px;">
                    <i class="ph-bold ph-star" data-value="1"></i>
                    <i class="ph-bold ph-star" data-value="2"></i>
                    <i class="ph-bold ph-star" data-value="3"></i>
                    <i class="ph-bold ph-star" data-value="4"></i>
                    <i class="ph-bold ph-star" data-value="5"></i>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="numeric-score">Numerical Score (1-10)</label>
                <input type="number" id="numeric-score" class="form-input mono-text" min="1" max="10" required value="${initialRating ? initialRating.numeric_score : ''}">
            </div>

            <div class="form-group">
                <label class="form-label" for="feedback">Professional Feedback</label>
                <textarea id="feedback" class="form-input" rows="4" placeholder="Share your strategic insights to help propel this idea forward!">${initialRating ? initialRating.feedback_text : ''}</textarea>
            </div>

            <button type="submit" class="btn btn-primary w-full">Submit Strategic Evaluation</button>
            <div id="rating-error" class="hidden" style="color: var(--danger); margin-top: var(--space-8); font-size: var(--text-sm);"></div>
            <div id="rating-success" class="hidden" style="color: var(--success); margin-top: var(--space-8); font-size: var(--text-sm);">Evaluation saved!</div>
        </form>
    `;

    const form = container.querySelector('#rating-form');
    const errorDiv = container.querySelector('#rating-error');
    const successDiv = container.querySelector('#rating-success');
    const stars = container.querySelectorAll('#star-rating i');
    const numericScoreInput = container.querySelector('#numeric-score');

    // Star rating logic
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const value = parseInt(e.target.dataset.value);
            // Update stars visually
            stars.forEach(s => {
                if (parseInt(s.dataset.value) <= value) {
                    s.classList.replace('ph-bold', 'ph-fill');
                    s.style.color = 'gold';
                } else {
                    s.classList.replace('ph-fill', 'ph-bold');
                    s.style.color = 'var(--text-muted)';
                }
            });
            // Update numeric score (1 star = 2 points)
            numericScoreInput.value = value * 2;
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');

        const payload = {
            idea: ideaId,
            numeric_score: parseInt(numericScoreInput.value),
            feedback_text: document.getElementById('feedback').value
        };

        try {
            await apiFetch(`/ideas/${ideaId}/evaluate/`, {
                method: 'POST',
                body: payload
            });
            successDiv.classList.remove('hidden');
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.classList.remove('hidden');
        }
    });

    return container;
}
