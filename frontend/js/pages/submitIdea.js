import { apiFetch } from '../api.js';
import { requireAuth } from '../auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    const form = document.getElementById('submitIdeaForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // File upload logic
    const fileInput = document.getElementById('fileInput');
    const fileListContainer = document.getElementById('fileList');
    let selectedFiles = [];

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            selectedFiles.push(files[i]);
        }
        renderFileList();
    }

    function renderFileList() {
        fileListContainer.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.style.background = 'var(--surface-2)';
            fileItem.style.padding = '8px 12px';
            fileItem.style.borderRadius = '6px';
            fileItem.style.display = 'flex';
            fileItem.style.alignItems = 'center';
            fileItem.style.justifyContent = 'space-between';
            fileItem.style.border = '1px solid var(--border-soft)';

            const fileName = document.createElement('span');
            fileName.textContent = file.name;
            fileName.style.color = 'var(--text)';
            fileName.style.fontSize = '13px';
            
            const removeBtn = document.createElement('i');
            removeBtn.className = 'ph-bold ph-x';
            removeBtn.style.color = 'var(--red)';
            removeBtn.style.cursor = 'pointer';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                selectedFiles.splice(index, 1);
                renderFileList();
            };

            fileItem.appendChild(fileName);
            fileItem.appendChild(removeBtn);
            fileListContainer.appendChild(fileItem);
        });
    }

    // Command + Enter to submit
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> جاري الإرسال والتحليل بواسطة الذكاء الاصطناعي...';

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('status', 'submitted');
        
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            // Create the idea, save files, and evaluate all in one request
            await apiFetch('/ideas/', {
                method: 'POST',
                body: formData
            });

            // Redirect to dashboard
            window.location.href = `dashboard.html`;
        } catch (error) {
            console.error('Submit failed', error);
            alert('فشل تقديم الفكرة. راجع وحدة التحكم (Console) لمزيد من التفاصيل.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});
