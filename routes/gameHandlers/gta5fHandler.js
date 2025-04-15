const axios = require('axios');
const pingServer = require('../../utils/ping.js');

async function handleGta5f(ip, port, res) {
  try {
    // Fetch player and server data
    const playerDataResponse = await axios.get(`http://${ip}:${port}/players.json`);
    const serverDataResponse = await axios.get(`http://${ip}:${port}/info.json`);
    const ping = await pingServer(ip, parseInt(port, 10));

    // Extract player data
    const players = (playerDataResponse.data || []).map((player) => ({
      name: player.name || 'Unknown',
      uuid: player.identifiers?.find((id) => id.startsWith('fivem')) || 'unknown',
      discord: player.identifiers?.find((id) => id.startsWith('discord')) || null,
      steam: player.identifiers?.find((id) => id.startsWith('steam')) || null,
      identifier: player.identifiers?.find((id) => id.startsWith('license')) || null,
      ping: player.ping || 0,
    }));

    // Extract server data
    const serverData = serverDataResponse.data || {};
    const maxPlayers = parseInt(serverData.vars?.sv_maxClients, 10) || 0;
    const numPlayers = players.length; // Corrected: Accessing the length property

    // Send response
    res.json({
      success: true,
      data: {
        players,
        maxPlayers,
        numPlayers,
        ping,
      },
    });
  } catch (error) {
    console.error(`Error querying FiveM server: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = handleGta5f;