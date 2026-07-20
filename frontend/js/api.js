import { getAccessToken, refreshToken } from './auth.js';

const BASE_URL = 'https://stunning-youth-production.up.railway.app/api';

class ApiError extends Error {
    constructor(status, payload) {
        super(`API Error: ${status}`);
        this.status = status;
        this.payload = payload;
    }
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
    const headers = {};
    let fetchBody = undefined;
    
    if (body instanceof FormData) {
        fetchBody = body;
    } else if (body) {
        headers['Content-Type'] = 'application/json';
        fetchBody = JSON.stringify(body);
    }
    
    if (auth) {
        const token = getAccessToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    let res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: fetchBody,
    });

    if (res.status === 401 && auth) {
        try {
            await refreshToken();
            // Retry with new token
            headers['Authorization'] = `Bearer ${getAccessToken()}`;
            res = await fetch(`${BASE_URL}${path}`, {
                method,
                headers,
                body: fetchBody,
            });
        } catch (err) {
            // Refresh failed, redirect to login
            window.location.href = 'login.html';
            throw err;
        }
    }

    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new ApiError(res.status, payload);
    }

    return res.status === 204 ? null : res.json();
}

