const queryBeamMPServer = require('../../utils/queryBeamMPServer');

async function handleBeammp(ip, port, res) {
  try {
    const responseData = await queryBeamMPServer(ip, port);

    if (responseData) {
      res.json({ success: true, data: responseData });
    } else {
      res.status(500).json({ success: false, error: 'No data received from the server.' });
    }
  } catch (error) {
    console.error(`Error querying BeamMP server: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = handleBeammp;