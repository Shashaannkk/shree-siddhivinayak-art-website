require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const dataService = require('./dataService');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Config CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local static file uploads if Cloudinary is not used
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Bootstrapping function
const startServer = async () => {
  try {
    // Initialize Database / seed data
    await dataService.init();

    app.listen(PORT, () => {
      console.log(`🚀 Shree Siddhivinayak Art backend is running on http://localhost:${PORT}`);
      console.log(`📡 Accepting client requests from: ${corsOptions.origin}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
