const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const authenticate = require('./middleware/authenticate');
const cookieParser = require('cookie-parser');
const jwtParser = require('./middleware/jwtParser'); // Import the middleware
const apiRouter = require('./routes/api');
const galleryRouter = require('./routes/gallery');
const authRouter = require('./routes/auth');
const accountRouter = require('./routes/account');
const dataRouter = require('./routes/data');
const downloadRouter = require('./routes/download');
const adminRouter = require('./routes/admin');
const cron = require('node-cron'); // Import node-cron
const fetchAndSaveProducts = require('./utils/fetchProducts'); // Import the function

dotenv.config();

const app = express();

// Schedule the task to run every 24 hours
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to fetch and save products...');
  fetchAndSaveProducts();
});

app.use(cookieParser());

// Middleware for static files and sessions
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use(jwtParser); // Add JWT parser middleware

app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/data', dataRouter);
app.use('/admin', authenticate, adminRouter);
app.use('/account', authenticate, accountRouter);
app.use('/gallery', authenticate, galleryRouter);
app.use('/download', authenticate, downloadRouter);

// Catch 404 Not Found errors
app.use((req, res) => {
  res.status(404).send('Error 404: Page Not Found');
});

// Global error handling
app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res.status(401).send('Error 401: Unauthorized');
  }
  if (err.status === 403) {
    return res.status(403).send('Error 403: Forbidden');
  }
  if (err.status === 500 || !err.status) {
    return res.status(500).send('Error 500: Internal Server Error');
  }
  next(err);
});

fetchAndSaveProducts();

const PORT = process.env.PORT || 3000; // Use the port from .env or default to 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});