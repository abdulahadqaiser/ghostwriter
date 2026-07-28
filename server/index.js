const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// ─── TASK 2: SECRETS FAIL-FAST ────────────────────────────────────────────────
// If critical secrets are missing at boot, refuse to start rather than running
// in a broken/insecure state.
const REQUIRED_ENV = ['MINDS_BUILDER_API_KEY', 'MONGODB_URI', 'GEMINI_API_KEY'];
const missingEnv = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
  console.error('');
  console.error('╔══════════════════════════════════════════════════════════╗');
  console.error('║  FATAL: Missing required environment variables.           ║');
  console.error('║  Server cannot start without these secrets.               ║');
  console.error('╠══════════════════════════════════════════════════════════╣');
  missingEnv.forEach(k => console.error(`║  ✗  ${k.padEnd(52)} ║`));
  console.error('╠══════════════════════════════════════════════════════════╣');
  console.error('║  Add them to your .env file and restart.                  ║');
  console.error('╚══════════════════════════════════════════════════════════╝');
  console.error('');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// ─── TASK 1: RATE LIMITING ────────────────────────────────────────────────────
// Global limiter: 100 req / 15 min per IP (covers all /api/* routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait 15 minutes and try again.'
    });
  }
});

// Strict repurpose limiter: 10 req / 15 min per IP
// Protects the expensive Minds AI generation endpoint from abuse.
const repurposeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Generation limit reached (10 per 15 minutes). Please wait before repurposing again.'
    });
  }
});

// Apply global limiter to all /api routes
app.use('/api/', globalLimiter);

// Apply strict limiter specifically to the AI generation route
app.use('/api/repurpose', repurposeLimiter);

// Routes
const profileRoutes     = require('./routes/profile');
const repurposeRoutes   = require('./routes/repurpose');
const correctionsRoutes = require('./routes/corrections');
const mindsRoutes       = require('./routes/minds');
const historyRoutes     = require('./routes/history');
const ingestRoutes      = require('./routes/ingest');

app.use('/api/profile',      profileRoutes);
app.use('/api/repurpose',    repurposeRoutes);
app.use('/api/corrections',  correctionsRoutes);
app.use('/api/minds',        mindsRoutes);
app.use('/api/history',      historyRoutes);
app.use('/api/ingest',       ingestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Ghostwriter Backend API', version: '1.0.0' });
});

const { seedPersonas } = require('./services/personaSeeder');

// ─── MongoDB Connection ───────────────────────────────────────────────────────
// MONGODB_URI is guaranteed to exist here (fail-fast above).
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
}).then(async () => {
  console.log('✅ Connected to MongoDB successfully.');
  await seedPersonas();
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.error('   Check MONGODB_URI in your .env file.');
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🚀 Ghostwriter Express server running on port ${PORT}`);
  console.log(`   Rate limit: 100 req/15min (global) | 10 req/15min (repurpose)`);
});
