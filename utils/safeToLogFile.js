const path = require('path');
const fs = require('fs');

function saveToLogFile(prefix, data) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 0-indexed
    const year = now.getFullYear();
    const dateString = `${day}-${month}-${year}`;
    const filename = `${prefix}-${dateString}.log`;
  
    const logPath = path.join(__dirname, '..', 'logs', filename);
    const logEntry = JSON.stringify(data) + '\n';
  
    // Ensure logs directory exists
    const logsDir = path.dirname(logPath);
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  
    fs.appendFile(logPath, logEntry, err => {
      if (err) console.error(`Failed to write to ${filename}:`, err);
    });
}

module.exports = saveToLogFile;