const { GameDig } = require('gamedig');

async function handleDefaultGame(game, ip, port, res) {
  try {
    const data = await GameDig.query({ type: game, host: ip, port: parseInt(port, 10) });
    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error querying game server: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = handleDefaultGame;