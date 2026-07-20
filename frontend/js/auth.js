export function getAccessToken() {
    return localStorage.getItem('access_token');
}

export function setTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

export async function refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token available');

    const res = await fetch('http://localhost:8000/api/auth/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
    });

    if (!res.ok) {
        clearTokens();
        throw new Error('Session expired');
    }

    const data = await res.json();
    setTokens(data.access, refresh);
}

export function requireAuth() {
    if (!getAccessToken()) {
        window.location.href = 'login.html';
    }
}

export async function fetchUserProfile() {
    try {
        const { apiFetch } = await import('./api.js');
        const user = await apiFetch('/users/me/');
        localStorage.setItem('user_role', user.role);
        return user;
    } catch (e) {
        console.error("Failed to fetch user profile", e);
        return null;
    }
}

