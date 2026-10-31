# StellarVista

Astronomy Picture of the Day viewer. Frontend: https://hjbcodeforge.github.io/StellarVista/ . Backend: https://stellarvista.onrender.com/apod .

## NASA APOD migration (October 2026)

NASA's official notice at https://api.nasa.gov/ states the legacy APOD API will be archived December 1, 2026.

Official guide: https://api.nasa.gov/assets/files/apod/APOD-APIs-and-RSS-info.pdf

- Latest: `https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1`
- Date: `https://science.nasa.gov/wp-json/wp/v2/apod-basic/YYMMDD`
- No NASA API key is required.
- `url` is now an article permalink; image media uses `hdurl`.
- Video/iframe media uses the iframe source in `basic_html`.
- Explanations contain HTML; the frontend displays decoded text, not live HTML.

The backend keeps the `/apod?date=YYYY-MM-DD` contract and normalizes the new NASA data. Missing or unsupported media returns an error, never an article URL as an image.

## Development

Use Node.js 22 or newer (Render must use a supported Node runtime).

1. `npm ci`
2. `npm test`
3. `npm start`

Environment options are documented in `.env.example`. Never commit `.env`. `APOD_API_BASE` is an optional upstream override used by the regression tests.

The static frontend can be served separately; its API base is configured in `js/main.js`. Add the local frontend origin to `ALLOWED_ORIGINS` when testing against a local backend.

## Deployment

GitHub Pages serves the static site from `main`. Render should install with `npm ci` and start with `npm start` (existing `node server.js` start commands also work). Existing `NASA_API_KEY` environment values are no longer used. Do not expose them in frontend code.
