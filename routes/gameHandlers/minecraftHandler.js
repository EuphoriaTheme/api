const { queryFull } = require('minecraft-server-util');

async function handleMinecraft(ip, port, res) {
  try {
    // Query the Minecraft server
    const serverData = await queryFull(ip, parseInt(port, 10));

    // Transform the data into a structured response
    const response = {
      success: true,
      data: {
        motd: serverData.motd.clean, // Message of the Day
        version: serverData.version.name, // Server version
        players: {
          online: serverData.players.online, // Number of online players
          max: serverData.players.max, // Max players
          list: serverData.players.sample || [], // List of player names (if available)
        },
        latency: serverData.latency, // Server latency
        favicon: serverData.favicon || null, // Server icon (if available)
      },
    };

    res.json(response);
  } catch (error) {
    console.error(`Error querying Minecraft server: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = handleMinecraft;