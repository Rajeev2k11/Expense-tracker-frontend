// Small helpers for WebAuthn
export function toBase64Url(buffer: Uint8Array) {
  const b64 = btoa(String.fromCharCode(...Array.from(buffer)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function hasRegisteredPasskey() {
  const raw = localStorage.getItem('user');
  if (!raw) return false;
  try {
    const u = JSON.parse(raw) as any;
    return Array.isArray(u.passkeys) && u.passkeys.length > 0;
  } catch {
    return false;
  }
}
