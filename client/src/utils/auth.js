export async function sha256(message) {
  const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getToken() { return localStorage.getItem('remember_token'); }
export function setToken(token) { localStorage.setItem('remember_token', token); }
export function clearToken() { localStorage.removeItem('remember_token'); }
