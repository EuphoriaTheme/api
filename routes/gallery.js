const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = path.join(__dirname, '../uploads/gallery', req.user.userID.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true }); // Create the directory if it doesn't exist
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Fetch gallery images
router.get('/', async (req, res) => {
  if (!req.user || !req.user.userID) {
    return res.status(403).json({ success: false, message: 'Unauthorized access.' });
  }

  const userDir = path.join(__dirname, '../uploads/gallery', req.user.userID.toString());

  if (!fs.existsSync(userDir)) {
    console.log(`Directory does not exist for user: ${req.user.userID}`); // Debug log
    return res.json({ success: true, gallery: [] });
  }

  try {
    const files = fs.readdirSync(userDir);
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/.test(file))
      .map((file) => `/${req.user.userID}/${file}`); // Map file names to full paths
    res.json({ success: true, gallery: images });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch images.' });
  }
});

// Endpoint to upload an image
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.user || !req.user.userID) {
    return res.status(403).json({ success: false, message: 'Unauthorized access.' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  try {
    const imageUrl = `/${req.user.userID}/${req.file.filename}`; // Generate the URL for the uploaded image
    res.json({ success: true, imageUrl: imageUrl });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
});

// Delete gallery images
router.delete('/delete', async (req, res) => {
  const { imagePath } = req.body;

  if (!req.user || !req.user.userID) {
    console.error('Delete request without authentication.');
    return res.status(403).json({ success: false, message: 'Unauthorized access.' });
  }

  const userDir = path.join(__dirname, '../public', req.user.userID.toString());
  const fullPath = path.join(userDir, path.basename(imagePath));

  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      res.json({ success: true, message: 'Image deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Image not found.' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Failed to delete image.' });
  }
});


module.exports = router;
