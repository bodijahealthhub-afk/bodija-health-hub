const path = require('path');
const fs = require('fs');

const defaultDir = path.join(__dirname, '..', 'uploads');
let uploadsDir = process.env.UPLOADS_DIR || defaultDir;

try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.warn(`[uploads] Cannot create uploads directory ${uploadsDir} (${err.message}); using default path`);
  uploadsDir = defaultDir;
  fs.mkdirSync(uploadsDir, { recursive: true });
}

module.exports = { uploadsDir };
