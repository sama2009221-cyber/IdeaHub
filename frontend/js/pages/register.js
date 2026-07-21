import { apiFetch } from '../api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-message');
    const successMsg = document.getElementById('success-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.classList.add('hidden');
        successMsg.classList.add('hidden');
        
        const first_name = document.getElementById('first_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const company_name = document.getElementById('company_name').value;
        const role = document.getElementById('role').value;

        // Generate a valid username for Django backend
        const username = email.split('@')[0] + Math.floor(Math.random() * 10000);

        try {
            await apiFetch('/auth/register/', {
                method: 'POST',
                auth: false, // No token needed for registration
                body: { username, first_name, email, password, company_name, role }
            });
            
            // Auto login after registration - use email
            const loginData = await apiFetch('/auth/login/', {
                method: 'POST',
                auth: false,
                body: { username: email, password }
            });
            
            import('../auth.js').then(async ({ setTokens, fetchUserProfile }) => {
                setTokens(loginData.access, loginData.refresh);
                await fetchUserProfile();
                window.location.href = 'dashboard.html';
            });
            
        } catch (error) {
            let errorText = 'فشل التسجيل: ';
            if (error.payload && Object.keys(error.payload).length > 0) {
                if (error.payload.username) errorText += 'الاسم مسجل مسبقاً. ';
                if (error.payload.email) errorText += 'هذا البريد الإلكتروني مسجل مسبقاً. ';
                if (error.payload.password) errorText += 'كلمة المرور غير صالحة. ';
                if (error.payload.detail) errorText += error.payload.detail;
                // Show raw error for debugging
                const allErrors = Object.entries(error.payload).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
                if (allErrors) errorText += allErrors;
            } else if (error.status) {
                errorText += `خطأ ${error.status} - يرجى المحاولة مرة أخرى.`;
            } else {
                errorText += 'تعذّر الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
            }
            errorMsg.textContent = errorText;
            errorMsg.classList.remove('hidden');
        }
    });
});
