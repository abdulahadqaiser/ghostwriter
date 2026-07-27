const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Section 6: Rate Limiting Middleware (100 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

app.use('/api/', apiLimiter);

// Routes
const profileRoutes = require('./routes/profile');
const repurposeRoutes = require('./routes/repurpose');
const correctionsRoutes = require('./routes/corrections');
const mindsRoutes = require('./routes/minds');
const historyRoutes = require('./routes/history');
const ingestRoutes = require('./routes/ingest');

app.use('/api/profile', profileRoutes);
app.use('/api/repurpose', repurposeRoutes);
app.use('/api/corrections', correctionsRoutes);
app.use('/api/minds', mindsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ingest', ingestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Ghostwriter Backend API', version: '1.0.0' });
});

// MongoDB Connection with graceful fallback
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ghostwriter';

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 3000
}).then(() => {
  console.log('✅ Connected to MongoDB successfully.');
}).catch((err) => {
  console.warn('⚠️ Could not connect to local MongoDB instance:', err.message);
  console.warn('⚠️ Operating with mock database storage active for demo execution.');
});

app.listen(PORT, () => {
  console.log(`🚀 Ghostwriter Express server running on port ${PORT}`);
});
