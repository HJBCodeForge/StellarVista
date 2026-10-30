// ─────────────────────────────────────────────────────────────────────────────
// 1) Attach event listeners once the DOM is ready
// ─────────────────────────────────────────────────────────────────────────────
// When the user clicks “Explore Today,” call the todaysImage() function
document.getElementById('btnToday')
  .addEventListener('click', todaysImage);

// When the user clicks “Get Image,” call the getFetch() function
document.getElementById('btnGetImg')
  .addEventListener('click', getFetch);



// ─────────────────────────────────────────────────────────────────────────────
// 2) Initialize the date picker to today’s date
// ─────────────────────────────────────────────────────────────────────────────
// Immediately set the <input type="date"> value to the current day
const dateElem = document.getElementById('date');
const picker = new Datepicker(dateElem, {
  format: 'yyyy-mm-dd',   // enforce ISO format
  autohide: true,         // close after select
  maxDate: new Date(),    // can’t pick future
  minDate: new Date(1995, 5, 16),  // June is monthIndex 5 → June 16 1995
  todayBtn: true,         // “Today” shortcut
});

setDefaultdate();
function setDefaultdate() {
  const dateInput = document.getElementById("date");
  // ISO string is “YYYY-MM-DDTHH:mm:ss.sssZ”; slice to just “YYYY-MM-DD”
  dateInput.value = new Date().toISOString().slice(0, 10);
  return dateInput;  // return reference if you need it elsewhere
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) PreLoad daily image in document head.
// ─────────────────────────────────────────────────────────────────────────────
(async function preloadApodFetch() {
  // 1) Compute today’s date
  const today = new Date().toISOString().slice(0,10);
  // 2) Create the link tag pointing at the backend proxy
  //    (the NASA API key stays server-side and is never sent to the browser)
  const link  = document.createElement('link');
  link.rel    = 'preload';
  link.as     = 'fetch';
  link.crossOrigin = 'anonymous';
  link.href   = apodUrl(today);
  // 3) Append it to the head so the browser starts the request
  document.head.appendChild(link);
})();

// ─────────────────────────────────────────────────────────────────────────────
// 3) Fetch APOD data through the backend proxy
// ─────────────────────────────────────────────────────────────────────────────
// The browser never sees the NASA API key. It asks the Render-hosted backend
// for the APOD payload and the backend adds the key server-side.
const API_BASE = 'https://stellarvista.onrender.com';

function apodUrl(date) {
  return `${API_BASE}/apod${date ? `?date=${date}` : ''}`;
}


// ─────────────────────────────────────────────────────────────────────────────
// 4) Fetch & display today’s Astronomy Picture of the Day
// ─────────────────────────────────────────────────────────────────────────────
async function todaysImage() {
  // 4.1) Compute today’s date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);
  // 4.2) Ask the backend proxy for today’s APOD (key stays server-side)
  const url = apodUrl(today);
  console.log('Fetching:', url);

  // 4.5) Perform the fetch request to NASA
  fetch(url)
    .then(r => r.json())               // parse the JSON response
    .then(data => {
      console.log(data);               // debug log the API response

      // 4.6) Grab DOM elements once to avoid repeated lookups
      const img     = document.getElementById('todaysImg');
      const vid     = document.getElementById('todaysVid');
      const titleEl = document.getElementById('title');
      const explEl  = document.getElementById('explanation');

      // 4.7) Reset/hide previous media before rendering new
      img.style.display = 'none';
      vid.style.display = 'none';
      img.src = '';
      vid.src = '';

      // 4.8) Update title & explanation text
      titleEl.innerText = data.title       || '';
      explEl.innerText  = data.explanation || '';

      // 4.9) Conditionally render video or image
      if (data.media_type === 'video') {
        // Make sure the video-wrapper container is visible (in case it was hidden)
        const vidDisplay = document.getElementById('video-wrapper');
        vidDisplay.style.display = 'block';
        // Prefer embed_url if provided
        let embed = data.embed_url || data.url;

        // Convert standard YouTube watch link to embed link
        if (embed.includes('youtube.com/watch')) {
          embed = embed.replace('watch?v=', 'embed/');
        }

        vid.src           = embed;      // set iframe src
        vid.style.display = 'block';    // show the video
      }
      else {
        // It's a static image
        img.src           = data.hdurl || data.url;
        img.style.display = 'block';
      }
    setTimeout(() => {
      document.getElementById('onboarding').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
      });
    }, 300);
    })
    .catch(err => {
      // 4.10) Handle errors gracefully
      console.error(err);
      alert('Uh oh—could not load today’s image. Try again later.');
    });
  updateNextButtonState();
}


// ─────────────────────────────────────────────────────────────────────────────
// 5) Fetch & display the APOD for a user-selected date
// ─────────────────────────────────────────────────────────────────────────────
async function getFetch() {
  // 5.1) Get the user’s chosen date
  const getDate = document.querySelector('input').value;

  // 5.2) Ask the backend proxy for the APOD of the selected date
  const url = apodUrl(getDate);
  console.log('Fetching:', url);

  // 5.3) Perform the request just like in todaysImage()
  fetch(url)
    .then(r => r.json())
    .then(data => {
      console.log(data);

      // 5.4) Grab and reset DOM elements
      const img     = document.getElementById('todaysImg');
      const vid     = document.getElementById('todaysVid');
      const titleEl = document.getElementById('title');
      const explEl  = document.getElementById('explanation');

      img.style.display = 'none';
      vid.style.display = 'none';
      img.src = '';
      vid.src = '';

      // 5.5) Update title & explanation
      titleEl.innerText = data.title       || '';
      explEl.innerText  = data.explanation || '';

      // 5.6) Show video or image based on media_type
      if (data.media_type === 'video') {
        // Make sure the video-wrapper container is visible (in case it was hidden)
        const vidDisplay = document.getElementById('video-wrapper');
        vidDisplay.style.display = 'block';

        let embed = data.embed_url || data.url;
        if (embed.includes('youtube.com/watch')) {
          embed = embed.replace('watch?v=', 'embed/');
        }
        vid.src           = embed;
        vid.style.display = 'block';
      } else {
        img.src           = data.hdurl || data.url;
        img.style.display = 'block';
      }
    setTimeout(() => {
      document.getElementById('onboarding').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
      });
    }, 300);
    })
    .catch(err => {
      console.error(err);
      alert('Uh oh—could not load today’s image. Try again later.');
    });
  updateNextButtonState();
}


// ─────────────────────────────────────────────────────────────────────────────
// 6) Simple slider navigation for the onboarding section
// ─────────────────────────────────────────────────────────────────────────────

//This function handles the "prev" button click
async function prevDay() {
  //Get today’s date
  const getDate = new Date().toISOString().slice(0, 10);

  //Ask the backend proxy for the APOD of that date
  const url = apodUrl(getDate);
  console.log('Fetching:', url);

  //Perform the request just like in todaysImage()
  fetch(url)
    .then(r => r.json())
    .then(data => {
      console.log(data);

      //Grab and reset DOM elements
      const img     = document.getElementById('todaysImg');
      const vid     = document.getElementById('todaysVid');
      const titleEl = document.getElementById('title');
      const explEl  = document.getElementById('explanation');

      img.style.display = 'none';
      vid.style.display = 'none';
      img.src = '';
      vid.src = '';

      //Update title & explanation
      titleEl.innerText = data.title       || '';
      explEl.innerText  = data.explanation || '';

      //Show video or image based on media_type
      if (data.media_type === 'video') {
        // Make sure the video-wrapper container is visible (in case it was hidden)
        const vidDisplay = document.getElementById('video-wrapper');
        vidDisplay.style.display = 'block';

        let embed = data.embed_url || data.url;
        if (embed.includes('youtube.com/watch')) {
          embed = embed.replace('watch?v=', 'embed/');
        }
        vid.src           = embed;
        vid.style.display = 'block';
      } else {
        img.src           = data.hdurl || data.url;
        img.style.display = 'block';
      }
    setTimeout(() => {
      document.getElementById('onboarding').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
      });
    }, 300);
    })
    .catch(err => {
      console.error(err);
      alert('Uh oh—could not load today’s image. Try again later.');
    });
  updateNextButtonState();
}

// This function handles the "next" button click
async function nextDay() {
  //Get today’s date
  const getDate = new Date().toISOString().slice(0, 10);

  //Ask the backend proxy for the APOD of that date
  const url = apodUrl(getDate);
  console.log('Fetching:', url);

  //Perform the request just like in todaysImage()
  fetch(url)
    .then(r => r.json())
    .then(data => {
      console.log(data);

      //Grab and reset DOM elements
      const img     = document.getElementById('todaysImg');
      const vid     = document.getElementById('todaysVid');
      const titleEl = document.getElementById('title');
      const explEl  = document.getElementById('explanation');

      img.style.display = 'none';
      vid.style.display = 'none';
      img.src = '';
      vid.src = '';

      //Update title & explanation
      titleEl.innerText = data.title       || '';
      explEl.innerText  = data.explanation || '';

      //Show video or image based on media_type
      if (data.media_type === 'video') {
        // Make sure the video-wrapper container is visible (in case it was hidden)
        const vidDisplay = document.getElementById('video-wrapper');
        vidDisplay.style.display = 'block';

        let embed = data.embed_url || data.url;
        if (embed.includes('youtube.com/watch')) {
          embed = embed.replace('watch?v=', 'embed/');
        }
        vid.src           = embed;
        vid.style.display = 'block';
      } else {
        img.src           = data.hdurl || data.url;
        img.style.display = 'block';
      }

    setTimeout(() => {
      document.getElementById('onboarding').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
      });
    }, 300);
    })
    .catch(err => {
      console.error(err);
      alert('Uh oh—could not load today’s image. Try again later.');
    });
  updateNextButtonState();
}

// ─────────────────────────────────────────────────────────────────────────────
// Date next-Btn State: change the to be greyed out, when selected date matched urrent date
// ─────────────────────────────────────────────────────────────────────────────
function updateNextButtonState() {
  const dateInput = document.getElementById('date');
  const nextBtn = document.getElementById('next-btn');

  const currentDate = new Date();
  const selectedDateParts = dateInput.value.split('-').map(Number);
  const selectedDate = new Date(
    selectedDateParts[0],  // year
    selectedDateParts[1] - 1,  // month (zero-based)
    selectedDateParts[2]   // day
  );

  // Remove time to compare just the date portion
  currentDate.setHours(0,0,0,0);
  selectedDate.setHours(0,0,0,0);

  if (selectedDate.getTime() === currentDate.getTime()) {
    // Disable Next and grey it out
    nextBtn.classList.add('nav-button-greyed');
    nextBtn.disabled = true;
  } else {
    // Re-enable Next
    nextBtn.classList.remove('nav-button-greyed');
    nextBtn.disabled = false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7) Date Updater: change the date input when prev/next buttons are clicked
// ─────────────────────────────────────────────────────────────────────────────

// 7.1) Grab references to your date input and arrow buttons
const dateInput = document.getElementById('date');
const prevBtn   = document.getElementById('prev-btn');
const nextBtn   = document.getElementById('next-btn');
const nextBtnClass = document.getElementById('next-btn')

// 7.2) Helper: shift the date input by a given number of days,
//       clamping it so it never goes beyond today
function changeDateBy(days) {
  // 1) Parse the ISO-string as LOCAL date components
  const [year, month, day] = dateInput.value
    .split('-')
    .map(str => parseInt(str, 10));

  // monthIndex is zero-based!
  const current = new Date(year, month - 1, day);

  // 2) Shift by N days
  current.setDate(current.getDate() + days);

  // 3) Clamp to today (don’t go into the future)
  const today = new Date();
  if (current > today) {
    current.setTime(today.getTime());
  }

  // 4) Re-format as YYYY-MM-DD
  const y = current.getFullYear();
  const m = String(current.getMonth() + 1).padStart(2, '0');
  const d = String(current.getDate()).padStart(2, '0');
  dateInput.value = `${y}-${m}-${d}`;
}

// 7.3) Wire up the Prev/Next buttons
prevBtn.addEventListener('click', () => {
  changeDateBy(-1);
  getFetch();   // refresh the image for the new date
});

nextBtn.addEventListener('click', () => {
  changeDateBy(1);
  getFetch();   // refresh the image for the new date 
});
