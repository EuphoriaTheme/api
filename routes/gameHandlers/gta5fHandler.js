const axios = require('axios');
const pingServer = require('../../utils/ping.js');

async function handleGta5f(ip, port, res) {
  try {
    const playerData = await axios.get(`http://${ip}:${port}/players.json`);
    const serverData = await axios.get(`http://${ip}:${port}/info.json`);
    const ping = await pingServer(ip, parseInt(port, 10));

    const players = playerData.players.map((player) => ({
        name: player.name,
        uuid: player.identifiers.find((id) => id.startsWith("fivem")) || 'unknown',
        discord: player.identifiers.find((id) => id.startsWith("discord")),
        steam: player.identifiers.find((id) => id.startsWith("steam")),
        identifier: player.identifiers.find((id) => id.startsWith("license")),
        ping: player.ping,
    }));
  
    res.json({
      success: true,
      data: {
        players,
        maxPlayers: parseInt(serverData.sv_maxclients, 10),
        numPlayers: parseInt(serverData.clients, 10),
        ping,
      },
    });
  } catch (error) {
    console.error(`Error querying FiveM server: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = handleGta5f;