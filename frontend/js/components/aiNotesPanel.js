import { escapeHTML } from '../utils.js';

export function createAINotesPanel(note) {
  const container = document.createElement('div');
  container.className = 'side-panel';

  if (!note) {
    container.innerHTML = `
      <div class="side-panel-head">
        <div class="ico" style="background:rgba(96,165,250,.12);color:var(--blue)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"
              stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>تقييم الذكاء الاصطناعي</h3>
        <span class="ai-badge" style="margin-inline-start:auto">AI</span>
      </div>
      <div class="side-panel-body">
        <p style="color:var(--text-faint);font-size:13px;text-align:center;padding:16px 0">
          لم يتم تقييم هذه الفكرة بعد
        </p>
      </div>`;
    return container;
  }

  const c = note.concept_score     || 0;
  const f = note.feasibility_score || 0;
  const a = note.application_score || 0;
  const overall = (c && f && a) ? Math.round((c + f + a) / 3) : (note.computed_score || '-');

  const scoreColor = overall >= 8 ? 'var(--green)' : overall >= 5 ? 'var(--amber)' : 'var(--red)';
  const notes = escapeHTML(note.overall_notes || note.notes || '');

  const scoreBox = (label, val, color) => `
    <div class="score-box">
      <div class="s-label">${label}</div>
      <div class="s-val" style="color:${color}">${val}</div>
      <div class="s-bar">
        <div class="s-bar-fill" style="width:${val * 10}%;background:${color}"></div>
      </div>
    </div>`;

  container.innerHTML = `
    <div class="side-panel-head">
      <div class="ico" style="background:rgba(96,165,250,.12);color:var(--blue)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"
            stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>تقييم الذكاء الاصطناعي</h3>
      <span class="ai-badge" style="margin-inline-start:auto">AI</span>
    </div>

    <div class="side-panel-body">
      <div class="ai-overall-score">
        <div>
          <div class="ai-big-score" style="color:${scoreColor}">${overall}</div>
          <div class="ai-big-label">overall score</div>
        </div>
        <div style="flex:1">
          <div style="height:6px;background:var(--surface-3);border-radius:99px;overflow:hidden;margin-bottom:8px">
            <div style="height:100%;border-radius:99px;background:${scoreColor};width:${typeof overall === 'number' ? overall * 10 : 50}%;transition:width .6s ease"></div>
          </div>
          <div style="font-size:11px;color:var(--text-faint)">من أصل 10 نقاط</div>
        </div>
      </div>

      <div class="ai-scores-row">
        ${scoreBox('الفكرة', c, 'var(--accent)')}
        ${scoreBox('الجدوى', f, 'var(--green)')}
        ${scoreBox('التطبيق', a, 'var(--blue)')}
      </div>

      ${notes ? `
      <div style="font-size:11px;font-weight:700;color:var(--text-faint);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">
        ملاحظات المحلل الذكي
      </div>
      <div class="ai-notes-text">${notes}</div>` : ''}
    </div>`;

  return container;
}
