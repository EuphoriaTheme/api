const express = require('express');
const { GameDig } = require('gamedig');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const compression = require('compression'); // For response compression
const handleGta5f = require('./gameHandlers/gta5fHandler');
const handleBeammp = require('./gameHandlers/beammpHandler');
const handleMinecraft = require('./gameHandlers/minecraftHandler');
const handleDefaultGame = require('./gameHandlers/defaultGameHandler');
const authenticate = require('../middleware/authenticate');
require('dotenv').config();

// Middleware for response compression
router.use(compression());

router.post('/translate/bulk', async (req, res) => {
  const { texts, targetLang} = req.body;

  // Validate required fields
  if (!texts || !Array.isArray(texts) || texts.length === 0 || !targetLang) {
    return res.status(400).json({ success: false, error: 'Texts and target language are required.' });
  }

      try {
        // Load the appropriate translation file
        const translationsPath = path.join(__dirname, `../private/translations/${targetLang}.json`);
        if (!fs.existsSync(translationsPath)) {
          return res.status(400).json({ success: false, error: `Translations for language "${targetLang}" are not available.` });
        }

        const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

        // Translate each text in the array
        const translationsResult = {};
        for (const text of texts) {
          if (text.trim() !== '') {
            translationsResult[text] = translations[text] || `Translation for "${text}" not found.`;
          }
        }

        res.json({ success: true, translations: translationsResult });
      } catch (error) {
        console.error('Error translating texts:', error);
        res.status(500).json({ success: false, error: 'Failed to translate texts.' });
      }
});

router.get('/translations/available', async (req, res) => {
  try {
    // Fetch the list of available translations
    const translationsDir = path.join(__dirname, '../private/translations');
    const availableTranslations = fs.readdirSync(translationsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const code = file.replace('.json', ''); // Remove the .json extension
        const readableNames = {
          ar: 'Arabic',
          zh: 'Chinese',
          zh_tw: 'Chinese (Traditional)',
          nl: 'Dutch',
          en: 'English',
          fr: 'French',
          de: 'German',
          it: 'Italian',
          ja: 'Japanese',
          pt: 'Portuguese',
          ru: 'Russian',
          es: 'Spanish',
          tr: 'Turkish',
        };
        return { code, name: readableNames[code] || code }; // Default to code if name is not found
      });

    res.json({ success: true, languages: availableTranslations });
  } catch (error) {
    console.error('Error fetching available translations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch available translations.' });
  }
});

// General Game server query
router.get('/:game/ip=:ip&port=:port', async (req, res) => {
  const { game, ip, port } = req.params;

  console.log(`Received request for game: ${game}, ip: ${ip}, port: ${port}`);

  if (game === 'gta5f') {
    return handleGta5f(ip, port, res);
  }

  if (game === 'beammp') {
    return handleBeammp(ip, port, res);
  }

  if (game === 'minecraft') {
    return handleMinecraft(ip, port, res);
  }

  return handleDefaultGame(game, ip, port, res);
});

// Example API endpoint for status
router.get('/status', (req, res) => {
  const ApiVersion = process.env.API_VERSION; // Get version from .env
  res.json({
    success: true,
    status: 'online',
    version: ApiVersion,
  });
});

// API endpoint to get the image file for a Minecraft version
router.get('/mclogs/version', (req, res) => {
  const { serverName } = req.query;

  if (!serverName) {
    return res.status(400).json({ error: "Minecraft version is required." });
  }

  const nameToImageMapping = {
    Arclight: 'arclight.png',
    BungeeCord: 'bungeecord.png',
    Canvas: 'canvas.png',
    Fabric: 'fabric.png',
    Folia: 'folia.png',
    Forge: 'forge.png',
    Leaves: 'leaves.png',
    Mohist: 'mohist.png',
    NeoForge: 'neoforge.png',
    Paper: 'paper.png',
    Pufferfish: 'pufferfish.png',
    Purpur: 'purpur.png',
    Quilt: 'quilt.png',
    Sponge: 'sponge.png',
    Vanilla: 'vanilla.png',
    Velocity: 'velocity.png',
    Waterfall: 'waterfall.png',
  };

  const imageFileName = nameToImageMapping[serverName] || 'vanilla.png';
  const imagePath = path.join(__dirname, '../private/mclogs', imageFileName);

  try {
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image not found for the specified Minecraft version." });
    }
    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error while serving the image file." });
  }
});

router.get('/js/sort', (req, res) => {
  res.sendFile(path.join(__dirname, '../private/js/Sortable.min.js'));
});

// Fetch GameAPI version with authentication
router.get('/version/game-api', authenticate, (req, res) => {
  const gameApiVersion = process.env.GAME_API_VERSION; // Get version from .env

  if (!gameApiVersion) {
    return res.status(500).json({ success: false, error: "Game API version is not defined in the environment variables." });
  }

  res.json({ success: true, version: gameApiVersion });
});

module.exports = router;