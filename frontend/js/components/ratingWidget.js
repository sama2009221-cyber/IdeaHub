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
                    <div id="star-rating" style="display: flex; gap: 8px; font-size: 26px; cursor: pointer; color: var(--surface-3); margin-bottom: 20px;">
                        <i class="ph-bold ph-star" data-value="1"></i>
                        <i class="ph-bold ph-star" data-value="2"></i>
                        <i class="ph-bold ph-star" data-value="3"></i>
                        <i class="ph-bold ph-star" data-value="4"></i>
                        <i class="ph-bold ph-star" data-value="5"></i>
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
