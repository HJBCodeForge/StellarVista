// NASA data is normalized by our backend; no API keys are sent to the browser.
const API_BASE = 'https://stellarvista.onrender.com';
const FIRST_APOD = '1995-06-16';
const dateInput = document.getElementById('date');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const img = document.getElementById('todaysImg');
const vid = document.getElementById('todaysVid');
const videoWrapper = document.getElementById('video-wrapper');
const titleEl = document.getElementById('title');
const explanationEl = document.getElementById('explanation');
let requestNumber = 0;

// APOD publication dates use US Eastern time, not the browser's UTC day.
function todayDate() {
  return new Date().toLocaleDateString('en-CA', {timeZone:'America/New_York'});
}
const picker = new Datepicker(dateInput, {
  format:'yyyy-mm-dd', autohide:true, maxDate:new Date(),
  minDate:new Date(1995, 5, 16), todayBtn:true,
});
dateInput.value = todayDate();
function apodUrl(date) {
  return `${API_BASE}/apod?date=${encodeURIComponent(date)}`;
}
function updateButtons() {
  prevBtn.disabled = dateInput.value <= FIRST_APOD;
  nextBtn.disabled = dateInput.value >= todayDate();
  prevBtn.classList.toggle('nav-button-greyed', prevBtn.disabled);
  nextBtn.classList.toggle('nav-button-greyed', nextBtn.disabled);
}
function plainExplanation(data) {
  if (data.explanation_format !== 'html') return data.explanation || '';
  // Parse in a detached element, then render text only. Never inject NASA markup
  // into the live page (it contains links and occasionally local author paths).
  const detached = document.createElement('div');
  detached.innerHTML = data.explanation || '';
  return detached.textContent.replace(/^\s*Explanation:\s*/i, '').replace(/Tomorrow['’]s picture:[\s\S]*$/i, '').trim();
}
async function getFetch() {
  const currentRequest = ++requestNumber;
  updateButtons();
  explanationEl.textContent = 'Loading astronomy picture…';
  try {
    const response = await fetch(apodUrl(dateInput.value));
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'NASA could not load this astronomy picture.');
    if (!data.url || !['image', 'video'].includes(data.media_type)) throw new Error('NASA returned an unsupported picture format.');
    if (currentRequest !== requestNumber) return;
    img.style.display = 'none';
    vid.style.display = 'none';
    videoWrapper.style.display = 'none';
    img.removeAttribute('src');
    vid.removeAttribute('src');
    titleEl.textContent = data.title || '';
    explanationEl.textContent = plainExplanation(data);
    if (data.media_type === 'video') {
      videoWrapper.style.display = 'block';
      vid.src = data.url;
      vid.title = data.title || 'Astronomy video';
      vid.style.display = 'block';
    } else {
      img.alt = data.alt || data.title || 'Astronomy picture of the day';
      img.src = data.hdurl || data.url;
      img.style.display = 'block';
    }
    document.getElementById('onboarding').scrollIntoView({behavior:'smooth', block:'start'});
  } catch (err) {
    if (currentRequest !== requestNumber) return;
    explanationEl.textContent = err.message || 'Could not load this astronomy picture. Please try again later.';
  }
}
function todaysImage() {
  dateInput.value = todayDate();
  return getFetch();
}
function changeDateBy(days) {
  const date = new Date(`${dateInput.value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return;
  date.setUTCDate(date.getUTCDate() + days);
  dateInput.value = [FIRST_APOD, date.toISOString().slice(0, 10), todayDate()].sort()[1];
}
document.getElementById('btnToday').addEventListener('click', todaysImage);
document.getElementById('btnGetImg').addEventListener('click', getFetch);
prevBtn.addEventListener('click', () => {changeDateBy(-1); return getFetch();});
nextBtn.addEventListener('click', () => {changeDateBy(1); return getFetch();});
dateInput.addEventListener('changeDate', updateButtons);
dateInput.addEventListener('change', updateButtons);
updateButtons();
