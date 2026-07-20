import { apiFetch } from '../api.js';
import { setTokens } from '../auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.classList.add('hidden');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const data = await apiFetch('/auth/login/', {
                method: 'POST',
                auth: false, // Don't attach token to login
                body: { username, password }
            });
            
            setTokens(data.access, data.refresh);
            const { fetchUserProfile } = await import('../auth.js');
            await fetchUserProfile();
            window.location.href = 'dashboard.html';
        } catch (error) {
            errorMsg.textContent = 'Invalid credentials. Please try again.';
            errorMsg.classList.remove('hidden');
        }
    });
});

