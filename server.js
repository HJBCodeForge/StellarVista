require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Only the StellarVista site may call this API. Override with ALLOWED_ORIGINS
// (comma-separated) if the site ever moves.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://hjbcodeforge.github.io')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header (curl, server-to-server) pass;
      // browser requests must come from the StellarVista site.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
  })
);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Proxy for the NASA APOD API. The API key never leaves this server:
// the browser asks for a picture, we add the key server-side and forward
// the upstream response. (The old /apikey endpoint is gone on purpose —
// the NASA API key must never be handed out to browsers.)
app.get('/apod', async (req, res) => {
  const date = req.query.date;

  if (date !== undefined && !DATE_RE.test(String(date))) {
    return res.status(400).json({error: 'date must be YYYY-MM-DD'});
  }

  const params = new URLSearchParams();
  if (process.env.NASA_API_KEY) {
    params.set('api_key', process.env.NASA_API_KEY);
  } else {
    console.warn('NASA_API_KEY is not set — forwarding request without a key');
  }
  if (date) {
    params.set('date', String(date));
  }

  try {
    const upstream = await fetch(`https://api.nasa.gov/planetary/apod?${params}`);
    const body = await upstream.text();
    res
      .status(upstream.status)
      .type(upstream.headers.get('content-type') || 'application/json')
      .send(body);
  } catch (err) {
    console.error('APOD proxy failed:', err);
    res.status(502).json({error: 'Could not reach the NASA APOD API'});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`StellarVista API listening on port ${PORT}`));
