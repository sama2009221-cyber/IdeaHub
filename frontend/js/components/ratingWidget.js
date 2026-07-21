import { apiFetch } from '../api.js';

export function createRatingWidget(ideaId, initialRating = null) {
    const container = document.createElement('div');
    container.className = 'side-panel';

    const role = localStorage.getItem('user_role');
    if (role === 'employee') {
        container.innerHTML = `
            <div class="side-panel-head">
                <div class="ico" style="background:rgba(245,158,11,.12);color:var(--amber)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3>تقييمك الخاص</h3>
            </div>
            <div class="side-panel-body" style="color: var(--text-muted); font-size: 13px; font-style: italic; text-align: center;">
                التقييم متاح فقط للمديرين وأصحاب الصلاحية.
            </div>
        `;
        return container;
    }

    container.innerHTML = `
        <div class="side-panel-head">
            <div class="ico" style="background:rgba(245,158,11,.12);color:var(--amber)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
            </div>
            <h3>تقييمك الخاص</h3>
        </div>
        <div class="side-panel-body">
            <form id="rating-form">
                <div class="form-group">
                    <label class="form-label" style="font-size:12px; font-weight:700; color:var(--text-faint); text-transform:uppercase; margin-bottom:10px; display:block;">التقييم بالنجوم (الانطباع العام)</label>
                    <div id="star-rating" style="display: flex; gap: 8px; cursor: pointer; margin-bottom: 20px;">
                        <!-- SVGs will be injected via JS -->
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label" for="numeric-score" style="font-size:12px; font-weight:700; color:var(--text-faint); text-transform:uppercase; margin-bottom:8px; display:block;">التقييم الرقمي (١-١٠)</label>
                    <input type="number" id="numeric-score" class="rating-input" min="1" max="10" required placeholder="مثال: 8" value="${initialRating ? initialRating.numeric_score : ''}">
                </div>

                <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label" for="feedback" style="font-size:12px; font-weight:700; color:var(--text-faint); text-transform:uppercase; margin-bottom:8px; display:block;">ملاحظات التقييم</label>
                    <textarea id="feedback" class="rating-input rating-textarea" placeholder="شاركنا برأيك الاستراتيجي للمساعدة في تطوير هذه الفكرة!">${initialRating ? initialRating.feedback_text : ''}</textarea>
                </div>

                <button type="submit" class="btn" style="width:100%; background:linear-gradient(135deg, var(--accent), var(--accent-2)); color:#fff; border:none; padding:12px; border-radius:9px; cursor:pointer; font-size:13.5px; font-weight:600;">إرسال التقييم</button>
                <div id="rating-error" class="hidden" style="color: var(--red); margin-top: 10px; font-size: 12px; padding: 8px; background: rgba(248,113,113,.07); border-radius: 8px;"></div>
                <div id="rating-success" class="hidden" style="color: var(--green); margin-top: 10px; font-size: 12px; padding: 8px; background: rgba(52,211,153,.07); border-radius: 8px;">تم حفظ التقييم بنجاح!</div>
            </form>
        </div>
    `;

    const form = container.querySelector('#rating-form');
    const errorDiv = container.querySelector('#rating-error');
    const successDiv = container.querySelector('#rating-success');
    const starsContainer = container.querySelector('#star-rating');
    const numericScoreInput = container.querySelector('#numeric-score');

    // SVG templates
    const starEmpty = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" style="color:var(--surface-3);"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    const starHalf = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" style="color:#fbbf24;"><defs><linearGradient id="half"><stop offset="50%" stop-color="#fbbf24"/><stop offset="50%" stop-color="transparent" stop-opacity="1"/></linearGradient></defs><path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    const starFull = `<svg width="28" height="28" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

    function renderStars(score) {
        starsContainer.innerHTML = '';
        const outOf5 = (score || 0) / 2;
        for (let i = 1; i <= 5; i++) {
            const starWrapper = document.createElement('div');
            starWrapper.dataset.index = i;
            
            if (outOf5 >= i) {
                starWrapper.innerHTML = starFull;
            } else if (outOf5 >= i - 0.5) {
                starWrapper.innerHTML = starHalf;
            } else {
                starWrapper.innerHTML = starEmpty;
            }

            starsContainer.appendChild(starWrapper);
        }
    }

    // Initialize stars
    renderStars(parseInt(numericScoreInput.value) || 0);

    // Sync stars when input changes
    numericScoreInput.addEventListener('input', () => {
        let val = parseInt(numericScoreInput.value);
        if (val > 10) { val = 10; numericScoreInput.value = 10; }
        if (val < 1) { val = 1; numericScoreInput.value = 1; }
        renderStars(val);
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
