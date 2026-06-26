require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

/* MC_HEALTH_ROUTE
   Minimal health endpoints for frontend checks.
   - GET /health
   - GET /api/health
*/
app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json({
    ok: true,
    service: "microcourse-backend",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

app.get(["/ping", "/api/ping"], (req, res) => {
  res.status(200).json({ ok: true, pong: true, time: new Date().toISOString() });
});
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
    res.send('API is running');
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/speech';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => console.error('MongoDB connection error:', err));

