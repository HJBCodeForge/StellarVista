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
  // 1) Grab the key & compute today’s date
  const key   = await getApiKey();
  const today = new Date().toISOString().slice(0,10);
  // 2) Create the link tag
  const link  = document.createElement('link');
  link.rel    = 'preload';
  link.as     = 'fetch';
  link.crossOrigin = 'anonymous';
  link.href   = `https://api.nasa.gov/planetary/apod?api_key=${key}&date=${today}`;
  // 3) Append it to the head so the browser starts the request
  document.head.appendChild(link);
})();

// ─────────────────────────────────────────────────────────────────────────────
// 3) Retrieve the secret API key from your backend
// ─────────────────────────────────────────────────────────────────────────────
// This function calls your Render-hosted endpoint to fetch the NASA API key.
// Note: Exposing the key this way still makes it visible in browser devtools.
async function getApiKey() {
  // 3.1) Call your backend endpoint
  const response = await fetch('https://stellarvista.onrender.com/apikey');
  // 3.2) Parse JSON ({ apiKey: 'XYZ' })
  const data = await response.json();
  // 3.3) Return the raw key string
  return data.apiKey;
}


// ─────────────────────────────────────────────────────────────────────────────
// 4) Fetch & display today’s Astronomy Picture of the Day
// ─────────────────────────────────────────────────────────────────────────────
async function todaysImage() {
  // 4.1) Wait for the API key
  const key = await getApiKey();
  // 4.2) Compute today’s date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(0, 10);
  // 4.3) Build the NASA APOD URL
  const url = `https://api.nasa.gov/planetary/apod?api_key=${key}&date=${today}`;
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
}


// ─────────────────────────────────────────────────────────────────────────────
// 5) Fetch & display the APOD for a user-selected date
// ─────────────────────────────────────────────────────────────────────────────
async function getFetch() {
  // 5.1) Retrieve the API key and the user’s chosen date
  const key     = await getApiKey();
  const getDate = document.querySelector('input').value;

  // 5.2) Build the fetch URL with the selected date
  const url = `https://api.nasa.gov/planetary/apod?api_key=${key}&date=${getDate}`;
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
}


// ─────────────────────────────────────────────────────────────────────────────
// 6) Simple slider navigation for the onboarding section
// ─────────────────────────────────────────────────────────────────────────────

//This function handles the "prev" button click
async function prevDay() {
  //Retrieve the API key and the user’s chosen date
  const key     = await getApiKey();
  const getDate = new Date().toISOString().slice(0, 10);

  //Build the fetch URL with the selected date
  const url = `https://api.nasa.gov/planetary/apod?api_key=${key}&date=${getDate}`;
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
}

// This function handles the "next" button click
async function nextDay() {
  //Retrieve the API key and the user’s chosen date
  const key     = await getApiKey();
  const getDate = new Date().toISOString().slice(0, 10);

  //Build the fetch URL with the selected date
  const url = `https://api.nasa.gov/planetary/apod?api_key=${key}&date=${getDate}`;
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

  if (current >= today){
    nextBtnClass.className = ''
    nextBtnClass.className = 'nav-button-greyed'
  } else {
    nextBtnClass.className = 'nav-button'
  }
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

