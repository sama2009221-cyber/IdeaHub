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
        const [idea, currentUser] = await Promise.all([
            apiFetch(`/ideas/${ideaId}/`),
            apiFetch(`/users/me/`)
        ]);
        
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('idea-details').classList.remove('hidden');

        document.getElementById('idea-title').textContent = idea.title;
        document.getElementById('idea-author').textContent = idea.owner_name || 'Unknown';
        document.getElementById('idea-category').textContent = idea.category;
        
        const statusSpan = document.getElementById('idea-status');
        statusSpan.textContent = idea.status.replace('_', ' ').toUpperCase();
        
        const isOwner = currentUser.id === idea.owner;
        const canEdit = isOwner && ['draft', 'submitted'].includes(idea.status);

        if (canEdit) {
            document.getElementById('owner-actions').classList.remove('hidden');
        }

        const isManager = ['manager', 'owner'].includes(currentUser.role);
        const canDecide = isManager && idea.status === 'under_review';
        if (canDecide) {
            document.getElementById('manager-actions').classList.remove('hidden');
            
            document.getElementById('btn-approve-idea').addEventListener('click', async () => {
                if (confirm('هل أنت متأكد من اعتماد الفكرة لبدء التنفيذ؟')) {
                    try {
                        await apiFetch(`/ideas/${ideaId}/execute_decision/`, { method: 'POST', body: { decision: 'approved' } });
                        window.location.reload();
                    } catch (err) { alert('خطأ: ' + err.message); }
                }
            });

            document.getElementById('btn-reject-idea').addEventListener('click', async () => {
                if (confirm('هل أنت متأكد من رفض الفكرة؟')) {
                    try {
                        await apiFetch(`/ideas/${ideaId}/execute_decision/`, { method: 'POST', body: { decision: 'rejected' } });
                        window.location.reload();
                    } catch (err) { alert('خطأ: ' + err.message); }
                }
            });
        }

        let latestVersion = null;
        if (idea.versions && idea.versions.length > 0) {
            latestVersion = idea.versions[idea.versions.length - 1];
            document.getElementById('idea-description').textContent = latestVersion.description;
            
            // Render versions list
            const versionsList = document.getElementById('versions-list');
            idea.versions.forEach(v => {
                versionsList.innerHTML += `
                    <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 8px;">
                        <strong>Version ${v.version_number}</strong>
                        <p style="font-size: 13.5px; margin-top: 4px; color: var(--text-faint);">${escapeHTML(v.description).substring(0, 100)}...</p>
                    </div>
                `;
            });
        }

        // Render files
        const filesContainer = document.getElementById('idea-files');
        if (idea.files && idea.files.length > 0) {
            filesContainer.innerHTML = '';
            idea.files.forEach(f => {
                const fileName = f.file.split('/').pop();
                const fileEl = document.createElement('div');
                fileEl.className = 'file-row';
                
                let trashBtnHtml = '';
                if (isOwner) {
                    trashBtnHtml = `<button class="btn-delete-file" data-id="${f.id}" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:16px; padding:4px;"><i class="ph-bold ph-trash"></i></button>`;
                }

                fileEl.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <i class="ph-bold ph-file" style="color:var(--text-faint); font-size:18px;"></i>
                        <span style="font-size: 13.5px;">${escapeHTML(fileName)}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <a href="https://ideahub-production-67f3.up.railway.app${f.file}" target="_blank" style="color: var(--accent); text-decoration: none; font-size: 12.5px;">تحميل / عرض</a>
                        ${trashBtnHtml}
                    </div>
                `;
                filesContainer.appendChild(fileEl);
            });

            // Bind delete file events
            document.querySelectorAll('.btn-delete-file').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
                        try {
                            await apiFetch(`/ideas/${ideaId}/delete_file/`, {
                                method: 'DELETE',
                                body: { file_id: e.currentTarget.dataset.id }
                            });
                            window.location.reload();
                        } catch (err) {
                            alert('فشل حذف الملف: ' + err.message);
                        }
                    }
                });
            });

        } else {
            filesContainer.innerHTML = '<p style="color: var(--text-dim); font-size: 13.5px;">لا توجد ملفات مرفقة.</p>';
        }

        // Edit/Delete actions
        if (canEdit) {
            const editModal = document.getElementById('edit-modal');
            const editForm = document.getElementById('edit-idea-form');

            document.getElementById('btn-delete-idea').addEventListener('click', async () => {
                if (confirm('هل أنت متأكد من حذف هذه الفكرة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
                    try {
                        await apiFetch(`/ideas/${ideaId}/`, { method: 'DELETE' });
                        window.location.href = 'dashboard.html';
                    } catch (err) {
                        alert('فشل الحذف: ' + err.message);
                    }
                }
            });

            document.getElementById('btn-edit-idea').addEventListener('click', () => {
                document.getElementById('edit-title').value = idea.title;
                if (latestVersion) {
                    document.getElementById('edit-description').value = latestVersion.description || '';
                    document.getElementById('edit-problem').value = latestVersion.problem || '';
                    document.getElementById('edit-approach').value = latestVersion.approach || '';
                    document.getElementById('edit-impact').value = latestVersion.impact || '';
                }
                editModal.classList.remove('hidden');
                setTimeout(() => { editModal.style.opacity = '1'; }, 10);
            });

            document.getElementById('btn-cancel-edit').addEventListener('click', () => {
                editModal.style.opacity = '0';
                setTimeout(() => { editModal.classList.add('hidden'); }, 200);
            });

            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                document.getElementById('btn-save-edit').disabled = true;
                document.getElementById('btn-save-edit').textContent = 'جاري الحفظ...';
                
                try {
                    await apiFetch(`/ideas/${ideaId}/`, {
                        method: 'PATCH',
                        body: {
                            title: document.getElementById('edit-title').value,
                            description: document.getElementById('edit-description').value,
                            problem: document.getElementById('edit-problem').value,
                            approach: document.getElementById('edit-approach').value,
                            impact: document.getElementById('edit-impact').value,
                        }
                    });
                    window.location.reload();
                } catch (err) {
                    alert('فشل الحفظ: ' + err.message);
                    document.getElementById('btn-save-edit').disabled = false;
                    document.getElementById('btn-save-edit').textContent = 'حفظ التعديلات';
                }
            });
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

