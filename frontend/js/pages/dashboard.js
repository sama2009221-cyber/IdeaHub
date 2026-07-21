import { apiFetch } from '../api.js';
import { requireAuth } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();

    const statusLabel = { draft: "مسودة", submitted: "قيد المراجعة", progress: "قيد التنفيذ", approved: "قيد التنفيذ", rejected: "مرفوضة", under_review: "تم التقييم", needs_improvement: "تحتاج تعديل", done: "مُكتملة" };
    const statusClass = { draft: "draft", submitted: "review", progress: "progress", approved: "done", rejected: "rejected", under_review: "under_review", needs_improvement: "rejected", done: "done" };

    function starRow(n) {
        let s = "";
        for (let i = 0; i < 5; i++) {
            s += `<svg viewBox="0 0 24 24" fill="${i < n ? '#F2B84B' : 'none'}" stroke="#F2B84B" stroke-width="1.4"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8L12 16.9 5.8 20.4l1.6-6.8L2.2 9l6.9-.7L12 2z"/></svg>`;
        }
        return `<div class="rating">${s}</div>`;
    }

    function cardHTML(idea) {
        const initials = idea.owner_name ? idea.owner_name.substring(0, 2).toUpperCase() : '؟';
        const rating = idea.ai_evaluation ? Math.round(idea.ai_evaluation.concept_score / 2) : 0; 
        
        let desc = idea.versions && idea.versions.length > 0 ? idea.versions[0].description : 'لا يوجد وصف...';
        if (desc.length > 100) desc = desc.substring(0, 100) + '...';

        return `<div class="card card-hover card-animated" tabindex="0" onclick="window.location.href='idea-detail.html?id=${idea.id}'">
    <div class="card-top">
      <h3>${idea.title}</h3>
      <span class="badge badge-${statusClass[idea.status] || 'review'}">${statusLabel[idea.status] || idea.status}</span>
    </div>
    <p>${desc}</p>
    <div class="card-foot">
      <div class="who">
        <div class="avatar">${initials}</div>
        <span>${idea.owner_name}</span>
      </div>
      ${rating > 0 ? starRow(rating) : ''}
    </div>
  </div>`;
    }

    function skeletonHTML() {
        return `<div class="skel-card">
    <div class="skel" style="height:14px;width:70%;"></div>
    <div class="skel" style="height:12px;width:95%;"></div>
    <div class="skel" style="height:12px;width:60%;"></div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
      <div class="skel" style="height:24px;width:24px;border-radius:50%;"></div>
      <div class="skel" style="height:10px;width:80px;"></div>
    </div>
  </div>`;
    }

    function emptyHTML(text, sub) {
        return `<div class="empty">
    <div class="empty-icon">
      <svg viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0012 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
    </div>
    <h4>${text}</h4>
    <p>${sub}</p>
  </div>`;
    }

    const newGrid = document.getElementById('newIdeasGrid');
    const evalGrid = document.getElementById('evalGrid');
    const negativeGrid = document.getElementById('negativeGrid');
    const statsEl = document.getElementById('stats');

    newGrid.innerHTML = skeletonHTML() + skeletonHTML() + skeletonHTML();
    evalGrid.innerHTML = skeletonHTML() + skeletonHTML() + skeletonHTML();
    if (negativeGrid) negativeGrid.innerHTML = skeletonHTML() + skeletonHTML() + skeletonHTML();

    try {
        const ideas = await apiFetch('/ideas/');
        
        const newIdeas = ideas.filter(i => i.status === 'submitted' || i.status === 'draft');
        const evalIdeas = ideas.filter(i => ['under_review', 'approved', 'progress', 'done'].includes(i.status));
        const negativeIdeas = ideas.filter(i => ['needs_improvement', 'rejected'].includes(i.status));

        const total = ideas.length;
        const review = newIdeas.length;
        const progress = ideas.filter(i => ['approved', 'progress'].includes(i.status)).length;
        const done = ideas.filter(i => ['under_review', 'approved', 'progress', 'done', 'needs_improvement', 'rejected'].includes(i.status)).length; // Evaluated means anything that is no longer 'submitted' or 'draft'

        const items = [
            { label: "إجمالي الأفكار", num: total, color: "#7C6CF6", bg: "rgba(124,108,246,.14)", icon: '<path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" stroke="#7C6CF6" stroke-width="1.6" stroke-linejoin="round"/>' },
            { label: "قيد المراجعة", num: review, color: "#F2B84B", bg: "rgba(242,184,75,.14)", icon: '<path d="M12 8v5l3 3" stroke="#F2B84B" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="#F2B84B" stroke-width="1.6"/>' },
            { label: "قيد التنفيذ", num: progress, color: "#5FA8F5", bg: "rgba(95,168,245,.14)", icon: '<path d="M4 12h16M4 6h10M4 18h13" stroke="#5FA8F5" stroke-width="1.8" stroke-linecap="round"/>' },
            { label: "تم تقييمها", num: done, color: "#3FD9A4", bg: "rgba(63,217,164,.14)", icon: '<path d="M20 6L9 17l-5-5" stroke="#3FD9A4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' },
        ];
        
        statsEl.innerHTML = items.map(it => `
<div class="stat-card">
  <div class="stat-top">
    <span class="stat-label">${it.label}</span>
    <div class="stat-icon" style="background:${it.bg}"><svg viewBox="0 0 24 24" fill="none">${it.icon}</svg></div>
  </div>
  <div class="stat-num">${it.num}</div>
</div>`).join('');

        newGrid.innerHTML = newIdeas.length ? newIdeas.map(cardHTML).join('') : emptyHTML("مفيش أفكار جديدة دلوقتي", "أول ما حد يقدّم فكرة جديدة هتظهر هنا عشان تتراجع.");
        evalGrid.innerHTML = evalIdeas.length ? evalIdeas.map(cardHTML).join('') : emptyHTML("مفيش أفكار متقيّمة لسه", "الأفكار اللي دخلت حيز التنفيذ أو في انتظار الاعتماد هتظهر هنا.");
        if (negativeGrid) negativeGrid.innerHTML = negativeIdeas.length ? negativeIdeas.map(cardHTML).join('') : emptyHTML("مفيش أفكار سلبية", "كل الأفكار الحالية ممتازة!");
        
        document.getElementById('newCount').textContent = newIdeas.length;
        document.getElementById('evalCount').textContent = evalIdeas.length;
        if (document.getElementById('negativeCount')) document.getElementById('negativeCount').textContent = negativeIdeas.length;

    } catch (error) {
        console.error("Failed to fetch ideas", error);
        newGrid.innerHTML = emptyHTML("حدث خطأ", "لم نتمكن من جلب الأفكار.");
        evalGrid.innerHTML = emptyHTML("حدث خطأ", "لم نتمكن من جلب الأفكار.");
    }

    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });
});
