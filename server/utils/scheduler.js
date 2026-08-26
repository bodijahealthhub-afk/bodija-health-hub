const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const db = require('../models/database');
const { exportAll } = require('./backupData');
const { uploadsDir } = require('./uploads');
const { uploadFile } = require('./objectStorage');

function startScheduler() {
  if (process.env.AUTO_BACKUP_ENABLED === 'false') {
    console.log('[scheduler] auto-backups disabled (AUTO_BACKUP_ENABLED=false)');
    return;
  }

  const schedule = process.env.BACKUP_CRON || '0 3 * * *';
  if (!cron.validate(schedule)) {
    console.error(`[scheduler] invalid BACKUP_CRON "${schedule}" — auto-backups disabled`);
    return;
  }

  const backupsDir = process.env.BACKUP_DIR || path.join(uploadsDir, '..', 'backups');
  fs.mkdirSync(backupsDir, { recursive: true });
  const retention = Math.max(1, parseInt(process.env.BACKUP_RETENTION || '14', 10));

  const run = async () => {
    try {
      const snapshot = await exportAll();
      const json = JSON.stringify(snapshot, null, 2);
      const filepath = path.join(backupsDir, `auto-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`);
      fs.writeFileSync(filepath, json);

      const result = await db.prepare(
        'INSERT INTO backups (filename, size, created_by, data) VALUES (?, ?, ?, ?)'
      ).run(path.basename(filepath), Buffer.byteLength(json), 'system', json);

      const files = fs.readdirSync(backupsDir).filter((f) => f.endsWith('.json')).sort();
      while (files.length > retention) {
        const oldest = path.join(backupsDir, files.shift());
        try { fs.unlinkSync(oldest); } catch (e) { /* ignore */ }
      }

      try {
        const remote = await uploadFile({
          key: `backups/${path.basename(filepath)}`,
          filePath: filepath,
          contentType: 'application/json',
        });
        if (remote) console.log(`[scheduler] auto-backup uploaded to object storage: ${remote}`);
      } catch (e) {
        console.error(`[scheduler] object storage upload failed: ${e.message}`);
      }

      console.log(`[scheduler] auto-backup created: ${path.basename(filepath)} (backup id=${result.lastInsertRowid})`);
    } catch (err) {
      console.error(`[scheduler] auto-backup failed: ${err.message}`);
    }
  };

  cron.schedule(schedule, run);
  console.log(`[scheduler] auto-backups scheduled at cron "${schedule}" (retention=${retention}, dir=${backupsDir})`);

  // Scheduled publishing: check every minute for content with publish_at/unpublish_at
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date().toISOString();

      // Publish blog posts whose publish_at has arrived
      const blogToPublish = await db.prepare(
        `SELECT id, title, slug FROM blog_posts WHERE status = 'pending_review' AND publish_at IS NOT NULL AND publish_at <= ?`
      ).all(now);
      for (const post of blogToPublish) {
        await db.prepare(
          `UPDATE blog_posts SET status = 'published', published_at = ?, publish_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).run(now, post.id);
        console.log(`[scheduler] Auto-published blog post: "${post.title}" (id=${post.id})`);
      }

      // Unpublish blog posts whose unpublish_at has arrived
      const blogToUnpublish = await db.prepare(
        `SELECT id, title, slug FROM blog_posts WHERE status = 'published' AND unpublish_at IS NOT NULL AND unpublish_at <= ?`
      ).all(now);
      for (const post of blogToUnpublish) {
        await db.prepare(
          `UPDATE blog_posts SET status = 'archived', unpublish_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).run(post.id);
        console.log(`[scheduler] Auto-unpublished blog post: "${post.title}" (id=${post.id})`);
      }

      // Publish events
      const eventsToPublish = await db.prepare(
        `SELECT id, title FROM events WHERE (status IS NULL OR status = 'draft') AND publish_at IS NOT NULL AND publish_at <= ?`
      ).all(now);
      for (const evt of eventsToPublish) {
        await db.prepare(
          `UPDATE events SET status = 'active', is_active = 1, publish_at = NULL WHERE id = ?`
        ).run(evt.id);
        console.log(`[scheduler] Auto-published event: "${evt.title}" (id=${evt.id})`);
      }

      // Unpublish events
      const eventsToUnpublish = await db.prepare(
        `SELECT id, title FROM events WHERE status = 'active' AND unpublish_at IS NOT NULL AND unpublish_at <= ?`
      ).all(now);
      for (const evt of eventsToUnpublish) {
        await db.prepare(
          `UPDATE events SET status = 'archived', is_active = 0, unpublish_at = NULL WHERE id = ?`
        ).run(evt.id);
        console.log(`[scheduler] Auto-unpublished event: "${evt.title}" (id=${evt.id})`);
      }

      // Publish programmes
      const programmesToPublish = await db.prepare(
        `SELECT id, title FROM programmes WHERE (status IS NULL OR status = 'draft') AND publish_at IS NOT NULL AND publish_at <= ?`
      ).all(now);
      for (const prog of programmesToPublish) {
        await db.prepare(
          `UPDATE programmes SET status = 'active', is_active = 1, publish_at = NULL WHERE id = ?`
        ).run(prog.id);
        console.log(`[scheduler] Auto-published programme: "${prog.title}" (id=${prog.id})`);
      }

      // Unpublish programmes
      const programmesToUnpublish = await db.prepare(
        `SELECT id, title FROM programmes WHERE status = 'active' AND unpublish_at IS NOT NULL AND unpublish_at <= ?`
      ).all(now);
      for (const prog of programmesToUnpublish) {
        await db.prepare(
          `UPDATE programmes SET status = 'archived', is_active = 0, unpublish_at = NULL WHERE id = ?`
        ).run(prog.id);
        console.log(`[scheduler] Auto-unpublished programme: "${prog.title}" (id=${prog.id})`);
      }
    } catch (err) {
      console.error('[scheduler] Scheduled publishing check failed:', err.message);
    }
  });
  console.log('[scheduler] Scheduled publishing checker running every minute');
}

module.exports = { startScheduler };
