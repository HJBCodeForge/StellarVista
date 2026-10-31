require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://hjbcodeforge.github.io').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  callback(new Error('Not allowed by CORS'));
}}));

// NASA APOD Basic replaced the legacy API in October 2026. No API key is required.
// Official guide: https://api.nasa.gov/assets/files/apod/APOD-APIs-and-RSS-info.pdf
const API_BASE = process.env.APOD_API_BASE || 'https://science.nasa.gov/wp-json/wp/v2/apod-basic';
function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date &&
    date >= '1995-06-16' && date <= new Date().toISOString().slice(0, 10);
}
function mediaUrl(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value.replace(/&amp;/g, '&').replace(/&#0*38;/g, '&'), 'https://science.nasa.gov');
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}
app.get('/apod', async (req, res) => {
  const date = req.query.date;
  if (date !== undefined && !validDate(date)) return res.status(400).json({error:'Choose a valid date between 1995-06-16 and today (YYYY-MM-DD).'});
  const url = date ? `${API_BASE}/${date.slice(2).replace(/-/g, '')}` : `${API_BASE}?per_page=1`;
  try {
    const upstream = await fetch(url, {signal:AbortSignal.timeout(20000)});
    if (!upstream.ok) return res.status(upstream.status === 404 ? 404 : 502).json({error:upstream.status === 404 ? 'No astronomy picture is available for this date.' : 'NASA could not return this astronomy picture. Please try again later.'});
    const payload = await upstream.json();
    const data = Array.isArray(payload) ? payload[0] : payload;
    if (!data || !data.title || !data.date) throw new Error('Invalid NASA APOD response');
    const isVideo = ['video', 'iframe'].includes(data.media_type);
    // url is now an article permalink. Never use it as an image/video source.
    const embed = (data.basic_html || '').match(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
    const source = mediaUrl(isVideo ? embed?.[1] : data.hdurl);
    if (!source) throw new Error('NASA APOD has no supported media source');
    res.json({date:data.date, title:data.title, explanation:data.explanation || '', explanation_format:'html', media_type:isVideo ? 'video' : 'image', url:source, hdurl:isVideo ? undefined : source, alt:data.alt || data.title, copyright:data.copyright || '', permalink:data.permalink || data.url});
  } catch (err) {
    console.error('APOD proxy failed:', err.message);
    res.status(502).json({error:'Could not load the NASA astronomy picture. Please try again later.'});
  }
});
app.use((err, req, res, next) => {
  if (err?.message === 'Not allowed by CORS') return res.status(403).json({error:'Origin not allowed'});
  console.error(err);
  res.status(500).json({error:'Internal server error'});
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`StellarVista API listening on port ${PORT}`));
