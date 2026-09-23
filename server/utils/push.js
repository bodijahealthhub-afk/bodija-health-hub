// Web Push helper — fire-and-forget from createNotification().
// Degrades to a no-op when VAPID keys are not configured.

const db = require('../models/database');
const { resolvePermissions } = require('../middleware/authorize');

let webpush = null;
try {
  webpush = require('web-push');
} catch {
  // optional until installed
}

function getVapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;
  return {
    publicKey,
    privateKey,
    subject: process.env.VAPID_SUBJECT || 'mailto:info@bodijahealthhub.com',
  };
}

function isPushConfigured() {
  return Boolean(webpush && getVapidConfig());
}

function ensureConfigured() {
  const cfg = getVapidConfig();
  if (!webpush || !cfg) return null;
  try {
    webpush.setVapidDetails(cfg.subject, cfg.publicKey, cfg.privateKey);
    return cfg;
  } catch (err) {
    console.error('[push] invalid VAPID config:', err.message);
    return null;
  }
}

async function getEligibleUserIds() {
  const users = await db.prepare(
    `SELECT id, role FROM users WHERE status = 'active'`
  ).all();
  const ids = [];
  for (const u of users) {
    try {
      const perms = await resolvePermissions(u.role);
      if (perms.has('*') || perms.has('messages.view') || perms.has('messages.*')) {
        ids.push(u.id);
      }
    } catch {
      // skip users whose role cannot be resolved
    }
  }
  return ids;
}

async function getSubscriptionsForUserIds(userIds) {
  if (!userIds || userIds.length === 0) return [];
  const placeholders = userIds.map(() => '?').join(',');
  return db
    .prepare(
      `SELECT id, user_id, endpoint, p256dh, auth FROM push_subscriptions
       WHERE user_id IN (${placeholders})`
    )
    .all(...userIds);
}

async function deleteSubscription(id) {
  try {
    await db.prepare('DELETE FROM push_subscriptions WHERE id = ?').run(id);
  } catch (err) {
    console.error('[push] failed to prune subscription:', err.message);
  }
}

async function touchSubscription(id) {
  try {
    await db
      .prepare(`UPDATE push_subscriptions SET last_used_at = datetime('now') WHERE id = ?`)
      .run(id);
  } catch {
    /* non-critical */
  }
}

async function sendToSubscriptions(subs, payload) {
  const cfg = ensureConfigured();
  if (!cfg || !subs.length) return { sent: 0, failed: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
          { TTL: 60 * 60 * 24 }
        );
        sent += 1;
        await touchSubscription(sub.id);
      } catch (err) {
        failed += 1;
        const status = err && err.statusCode;
        if (status === 404 || status === 410) {
          await deleteSubscription(sub.id);
        } else if (status === 401 || status === 403) {
          console.error('[push] VAPID rejected:', err.message);
        } else {
          console.error('[push] send failed:', err.message);
        }
      }
    })
  );

  return { sent, failed };
}

/**
 * Send a web push for an in-app notification.
 * recipientUserId set → that user only; null → all users with messages.view.
 * Never throws — safe to fire-and-forget from request handlers.
 */
async function sendPushForNotification({ recipientUserId, title, message, link }) {
  try {
    if (!isPushConfigured()) return { sent: 0, failed: 0, skipped: true };

    const userIds = recipientUserId
      ? [Number(recipientUserId)]
      : await getEligibleUserIds();
    const subs = await getSubscriptionsForUserIds(userIds);
    if (!subs.length) return { sent: 0, failed: 0 };

    return sendToSubscriptions(subs, {
      title: title || 'Bodija Health Hub',
      body: message || '',
      url: link || '/admin',
    });
  } catch (err) {
    console.error('[push] sendPushForNotification error:', err.message);
    return { sent: 0, failed: 1 };
  }
}

module.exports = {
  isPushConfigured,
  getVapidConfig,
  getEligibleUserIds,
  sendPushForNotification,
};
