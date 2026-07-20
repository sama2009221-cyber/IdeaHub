import { escapeHTML } from '../utils.js';

function getInitials(name) {
    if (!name) return 'م';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const statusLabel = {
    draft: "مسودة",
    submitted: "قيد المراجعة",
    under_review: "قيد المراجعة",
    approved: "مُقيَّمة",
    rejected: "مرفوضة"
};

const statusClass = {
    draft: "draft",
    submitted: "review",
    under_review: "review",
    approved: "done",
    rejected: "rejected"
};

function starRow(n) {
    let s = "";
    for (let i = 0; i < 5; i++) {
        s += `<svg viewBox="0 0 24 24" fill="${i < n ? '#F2B84B' : 'none'}" stroke="#F2B84B" stroke-width="1.4"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8L12 16.9 5.8 20.4l1.6-6.8L2.2 9l6.9-.7L12 2z"/></svg>`;
    }
    return `<div class="rating">${s}</div>`;
}

export function createIdeaCard(idea) {
    const card = document.createElement('div');
    card.className = 'card idea-card';
    card.tabIndex = 0;
    card.onclick = () => {
        window.location.href = `idea-detail.html?id=${idea.id}`;
    };

    const sLabel = statusLabel[idea.status] || idea.status;
    const sClass = statusClass[idea.status] || idea.status;
    const badgeHtml = `<span class="badge ${sClass}">${escapeHTML(sLabel)}</span>`;

    const categoryBadge = idea.category ? `<span class="badge" style="background: var(--surface-2); color: var(--text-dim); border: 1px solid var(--border-soft);">${escapeHTML(idea.category)}</span>` : '';

    let ratingScore = 0;
    if (idea.ai_evaluation && idea.ai_evaluation.concept_score) {
        ratingScore = Math.round((idea.ai_evaluation.concept_score + idea.ai_evaluation.feasibility_score + idea.ai_evaluation.application_score) / 3 / 2); // Map 10 point to 5 stars
    }

    const initials = getInitials(idea.owner_name);

    card.innerHTML = `
        <div class="card-top">
            <h3>${escapeHTML(idea.title)}</h3>
            <div class="flex items-center gap-2">
                ${categoryBadge}
                ${badgeHtml}
            </div>
        </div>
        <p>${escapeHTML(idea.description || 'لا يوجد وصف.')}</p>
        <div class="card-foot">
            <div class="who">
                <div class="avatar">${escapeHTML(initials)}</div>
                <span>${escapeHTML(idea.owner_name || 'مستخدم')}</span>
            </div>
            ${ratingScore > 0 ? starRow(ratingScore) : ''}
        </div>
    `;

    return card;
}

