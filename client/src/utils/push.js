import { getAdminToken } from './api';

const SW_URL = '/sw.js';

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
}

export async function registerServiceWorker() {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_URL, { scope: '/' });
    return reg;
  } catch (err) {
    console.error('[push] SW register failed:', err);
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function pushFetch(path, options = {}) {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

export async function getPushStatus() {
  if (!isPushSupported()) {
    return { supported: false, configured: false, subscribed: false, permission: 'unsupported' };
  }
  try {
    const { json } = await pushFetch('/api/admin/push/status');
    return {
      supported: true,
      configured: Boolean(json && json.configured),
      subscribed: Boolean(json && json.subscribed),
      permission: Notification.permission,
    };
  } catch {
    return {
      supported: true,
      configured: false,
      subscribed: false,
      permission: Notification.permission,
    };
  }
}

export async function enablePush() {
  if (!isPushSupported()) {
    return { ok: false, reason: 'unsupported' };
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    return { ok: false, reason: permission === 'denied' ? 'blocked' : 'dismissed' };
  }

  const reg = await registerServiceWorker();
  if (!reg) return { ok: false, reason: 'sw_failed' };

  const keyRes = await pushFetch('/api/admin/push/public-key');
  if (!keyRes.ok || !keyRes.json?.publicKey) {
    return { ok: false, reason: 'not_configured' };
  }

  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyRes.json.publicKey),
    });
  }

  const sub = subscription.toJSON();
  const save = await pushFetch('/api/admin/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys?.p256dh, auth: sub.keys?.auth },
      userAgent: navigator.userAgent,
    }),
  });

  if (!save.ok) return { ok: false, reason: 'save_failed' };
  return { ok: true, permission: 'granted' };
}

export async function disablePush() {
  if (!isPushSupported()) return { ok: true };
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const subscription = reg && (await reg.pushManager.getSubscription());
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await pushFetch('/api/admin/push/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint }),
      });
    }
    return { ok: true };
  } catch (err) {
    console.error('[push] disable failed:', err);
    return { ok: false };
  }
}

export async function sendTestPush() {
  const { ok, json, status } = await pushFetch('/api/admin/push/test', { method: 'POST' });
  return { ok, status, json };
}
