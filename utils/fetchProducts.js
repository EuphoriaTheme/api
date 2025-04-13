const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const axios = require('axios');

// File path for products.yml
const productsFilePath = path.join(__dirname, '..', 'public', 'products.yml');

// List of extensions to fetch
const extensions = [
  'euphoriatheme',
  'mclogs',
  'refreshtheme',
  'playerlisting',
  'serverbackgrounds',
  'consolelogs',
  'resourcealerts',
  'translations',
  'laravellogs',
];

// Function to fetch and save products
async function fetchAndSaveProducts() {
  try {
    const products = [];

    for (const extension of extensions) {
      const apiUrl = `https://api.blueprintframe.work/api/extensions/${extension}`;

      try {
        // Fetch product data from the API
        const response = await axios.get(apiUrl);
        const productData = response.data;

        // Transform the data to match the desired structure
        products.push({
          name: productData.name,
          description: productData.summary,
          image: productData.banner,
          installations: productData.stats.panels,
          price: productData.price,
          links: Object.keys(productData.platforms).map((platform) => ({
            price: productData.platforms[platform].price,
            currency: productData.platforms[platform].currency,
            label: platform,
            url: productData.platforms[platform].url,
          })),
        });
      } catch (error) {
        console.error(`Error fetching data for extension "${extension}": ${error.message}`);
      }
    }

    // Save all products to products.yml
    const yamlData = yaml.dump({ products });
    fs.writeFileSync(productsFilePath, yamlData, 'utf8');
    console.log('Products data successfully updated in products.yml');
  } catch (error) {
    console.error(`Error saving products: ${error.message}`);
  }
}

module.exports = fetchAndSaveProducts;