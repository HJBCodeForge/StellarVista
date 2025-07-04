require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/apikey', (req, res) => {
    res.json({ apiKey: process.env.NASA_API_KEY });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
