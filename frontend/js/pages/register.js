import { apiFetch } from '../api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-message');
    const successMsg = document.getElementById('success-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.classList.add('hidden');
        successMsg.classList.add('hidden');
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const company_name = document.getElementById('company_name').value;
        const role = document.getElementById('role').value;

        try {
            await apiFetch('/auth/register/', {
                method: 'POST',
                auth: false, // No token needed for registration
                body: { username, email, password, company_name, role }
            });
            
            // Auto login after registration
            const loginData = await apiFetch('/auth/login/', {
                method: 'POST',
                auth: false,
                body: { username, password }
            });
            
            import('../auth.js').then(async ({ setTokens, fetchUserProfile }) => {
                setTokens(loginData.access, loginData.refresh);
                await fetchUserProfile();
                window.location.href = 'dashboard.html';
            });
            
        } catch (error) {
            let errorText = 'Registration failed. ';
            if (error.payload) {
                if (error.payload.username) errorText += `Username: ${error.payload.username.join(' ')} `;
                if (error.payload.password) errorText += `Password: ${error.payload.password.join(' ')} `;
            }
            errorMsg.textContent = errorText;
            errorMsg.classList.remove('hidden');
        }
    });
});
