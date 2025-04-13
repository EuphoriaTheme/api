const net = require('net');

/**
 * Ping a server by IP and port.
 * @param {string} ip - The server's IP address.
 * @param {number} port - The server's port.
 * @returns {Promise<number>} - The ping in milliseconds.
 */
function pingServer(ip, port) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(5000); // Set a timeout of 5 seconds

    socket.connect(port, ip, () => {
      const ping = Date.now() - start;
      socket.destroy(); // Close the connection
      resolve(ping);
    });

    socket.on('error', (err) => {
      socket.destroy();
      reject(new Error(`Failed to connect to ${ip}:${port} - ${err.message}`));
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`Connection to ${ip}:${port} timed out`));
    });
  });
}

module.exports = pingServer;