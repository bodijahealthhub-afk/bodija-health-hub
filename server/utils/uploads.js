const path = require('path');
const fs = require('fs');

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

module.exports = { uploadsDir };
