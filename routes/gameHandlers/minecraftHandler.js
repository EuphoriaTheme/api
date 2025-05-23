const { GameDig } = require('gamedig');

async function handleMinecraft(ip, port, res) {
  try {
    // Query the Minecraft server
    const serverData = await GameDig.query({ type: 'minecraft', host: ip, port: parseInt(port, 10) });
    console.log(serverData); // Log the server data for debugging
    // Transform the data into a structured response
    const response = {
      success: true,
      data: {
        motd: serverData.name || 'Unknown Server', // Message of the Day
        version: serverData.version || 'Unknown Version', // Server version
        numplayers: serverData.numplayers || 0, // Number of online players
        maxplayers: serverData.maxplayers || 0, // Max players
        players: (serverData.players || []).map((player) => ({
          name: player.name || 'Unknown', // Ensure each player has a name property
        })), // Map each player's name into an object
        ping: serverData.ping || 0, // Server latency
        address: serverData.connect || `${ip}:${port}`, // Server address
      },
    };

    res.json(response);
  } catch (error) {
    console.error(`Error querying Minecraft server: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = handleMinecraft;