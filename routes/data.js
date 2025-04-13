const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml'); // Import js-yaml
const compression = require('compression'); // For response compression
require('dotenv').config();

// Middleware for response compression
router.use(compression());

router.get('/products', (req, res) => {

    const productsFilePath = path.join(__dirname, 'public', 'products.yml');
    let products = [];
    try {
        const fileContents = fs.readFileSync(productsFilePath, 'utf8');
        const parsedData = yaml.load(fileContents);
        products = parsedData.products;
    } catch (error) {
        console.error('Error loading donators.yml:', error);
    }

  res.json({
    success: true,
    products,
  });
});

router.get('/donators', (req, res) => {

    const donatorsFilePath = path.join(__dirname, 'public', 'donators.yml');
    let donators = [];
    try {
        const fileContents = fs.readFileSync(donatorsFilePath, 'utf8');
        const parsedData = yaml.load(fileContents);
        donators = parsedData.donators;
    } catch (error) {
        console.error('Error loading donators.yml:', error);
    }    

  res.json({
    success: true,
    donators,
  });
});

router.get('/contributors', (req, res) => {

    const contributorsFilePath = path.join(__dirname, 'public', 'contributors.yml');
    let contributors = [];
    try {
        const fileContents = fs.readFileSync(contributorsFilePath, 'utf8');
        const parsedData = yaml.load(fileContents);
        contributors = parsedData.contributors;
    } catch (error) {
        console.error('Error loading contributors.yml:', error);
    }

  res.json({
    success: true,
    contributors,
  });
});

module.exports = router;