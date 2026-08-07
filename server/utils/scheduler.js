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
}

module.exports = { startScheduler };
