const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const http = require('node:http');
let child, upstream, base, requests = [];
before(async () => {
  upstream = http.createServer((req, res) => {
    requests.push(req.url);
    res.setHeader('Content-Type', 'application/json');
    if (req.url.endsWith('/250102')) { res.statusCode = 404; return res.end('{"code":"not_found"}'); }
    if (req.url.endsWith('/250103')) return res.end('{}');
    if (req.url.endsWith('/250104')) return res.end('not json');
    const video = req.url.endsWith('/250105');
    const item = {date: video ? '2025-01-05' : '2026-10-31', title:'Night on a Spooky Planet', media_type:video ? 'video' : 'image', explanation:'<strong>Explanation:</strong> Aurora &amp; steam.', hdurl:'https://assets.science.nasa.gov/aurora.jpg', url:'https://science.nasa.gov/image-article/example/', basic_html: video ? '<iframe src="//www.youtube.com/embed/B1R3dTdcpSU?rel=0&amp;showinfo=0"></iframe>' : ''};
    res.end(JSON.stringify(req.url.includes('?') ? [item] : item));
  });
  await new Promise(r => upstream.listen(0, '127.0.0.1', r));
  child = spawn(process.execPath, ['server.js'], {env:{...process.env,PORT:'3199', APOD_API_BASE:`http://127.0.0.1:${upstream.address().port}/apod-basic`}, stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject) => { child.stdout.on('data', d => {if(d.toString().includes('listening')) resolve();}); child.on('exit', code => reject(new Error(`Server exited ${code}`))); setTimeout(()=>reject(new Error('Startup timed out')),10000).unref(); });
  base = 'http://127.0.0.1:3199';
});
after(async () => {child?.kill(); if(upstream) await new Promise(r=>upstream.close(r));});
test('uses new NASA date route and returns image, not article URL', async () => {
  const r = await fetch(`${base}/apod?date=2026-10-31`); const j = await r.json();
  assert.equal(r.status,200); assert.equal(requests.at(-1),'/apod-basic/261031'); assert.equal(j.url,j.hdurl); assert.match(j.url,/aurora.jpg/);
});
test('uses latest list when date is omitted', async () => { const r=await fetch(`${base}/apod`);const j=await r.json(); assert.equal(j.title,'Night on a Spooky Planet');assert.equal(requests.at(-1),'/apod-basic?per_page=1'); });
test('extracts HTTPS video embed rather than loading article or thumbnail', async () => {const j=await (await fetch(`${base}/apod?date=2025-01-05`)).json();assert.equal(j.media_type,'video'); assert.equal(j.url,'https://www.youtube.com/embed/B1R3dTdcpSU?rel=0&showinfo=0');});
test('rejects malformed, impossible and pre-archive dates without upstream request',async()=>{for(const date of ['bad','2025-02-30','1995-06-15','2025-01-01&date=2025-01-02']){const count=requests.length; const r=await fetch(`${base}/apod?date=${date}`);assert.equal(r.status,400);assert.equal(requests.length,count);}});
test('returns useful errors for missing and invalid NASA responses',async()=>{for(const [date,status] of [['2025-01-02',404],['2025-01-03',502],['2025-01-04',502]]){const r=await fetch(`${base}/apod?date=${date}`);assert.equal(r.status,status);assert.ok((await r.json()).error);}});
test('preserves allowed-origin CORS and rejects other origins',async()=>{const good=await fetch(`${base}/apod`,{headers:{Origin:'https://hjbcodeforge.github.io'}});assert.equal(good.headers.get('access-control-allow-origin'),'https://hjbcodeforge.github.io');const bad=await fetch(`${base}/apod`,{headers:{Origin:'https://evil.example'}});assert.equal(bad.status,403);});
