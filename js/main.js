//Set default date to currentday
setDefaultdate();
function setDefaultdate(){
  const dateInput = document.getElementById("date");
  dateInput.value = new Date().toISOString().slice(0,10);
  return dateInput
};

async function getApiKey() {
    const response = await fetch('https://stellarvista.onrender.com/apikey');
    const data = await response.json();
    return data.apiKey;
}

// attach listener after DOM is ready
document.getElementById('btnToday')
        .addEventListener('click', todaysImage);

// Fetch Function to get Image by User Selected data
document.getElementById('btnGetImg')
        .addEventListener('click', getFetch);


// Fetch Function to get Image by todays data
async function todaysImage(){
  const key = await getApiKey();
  const today = new Date().toISOString().slice(0,10);
  const url   = `https://api.nasa.gov/planetary/apod?api_key=${key}&date=${today}`;
  console.log('Fetching:', url);

  const vidDisplay = document.getElementById('video-wrapper');
  vidDisplay.style.display = 'block';

  fetch(url)
    .then(r => r.json())
    .then(data => {
      console.log(data);

      // grab our elements once
      const img = document.getElementById('todaysImg');
      const vid = document.getElementById('todaysVid');
      const titleEl = document.getElementById('title');
      const explEl  = document.getElementById('explanation');

      // clear previous media
      img.style.display = 'none';
      vid.style.display = 'none';
      img.src = '';
      vid.src = '';

      // update title & explanation
      titleEl.innerText       = data.title || '';
      explEl.innerText        = data.explanation || '';

      if (data.media_type === 'video') {
        // If the API returns an embed_url, prefer that.
        let embed = data.embed_url || data.url;

        // If it's a YouTube watch page, convert it to a proper embed link:
        if (embed.includes('youtube.com/watch')) {
          embed = embed.replace('watch?v=', 'embed/');
        }

        vid.src           = embed;
        vid.style.display = 'block';
      }
      else {
        // An actual image file
        img.src           = data.hdurl || data.url;
        img.style.display = 'block';
      }
    })
    .catch(err => {
      console.error(err);
      alert('Uh oh—could not load today’s image. Try again later.');
    });
}


async function getFetch(){
  const key = await getApiKey();
  const getDate = document.querySelector('input').value;
  const url   = `https://api.nasa.gov/planetary/apod?api_key=${key}&date=${getDate}`;
  console.log('Fetching:', url);

  fetch(url)
    .then(r => r.json())
    .then(data => {
      console.log(data);

      // grab our elements once
      const img = document.getElementById('todaysImg');
      const vid = document.getElementById('todaysVid');
      const titleEl = document.getElementById('title');
      const explEl  = document.getElementById('explanation');

      // clear previous media
      img.style.display = 'none';
      vid.style.display = 'none';
      img.src = '';
      vid.src = '';

      // update title & explanation
      titleEl.innerText       = data.title || '';
      explEl.innerText        = data.explanation || '';

      if (data.media_type === 'video') {
        // If the API returns an embed_url, prefer that.
        let embed = data.embed_url || data.url;

        // If it's a YouTube watch page, convert it to a proper embed link:
        if (embed.includes('youtube.com/watch')) {
          embed = embed.replace('watch?v=', 'embed/');
        }

        vid.src           = embed;
        vid.style.display = 'block';
      }
      else {
        // An actual image file
        img.src           = data.hdurl || data.url;
        img.style.display = 'block';
      }
    })
    .catch(err => {
      console.error(err);
      alert('Uh oh—could not load today’s image. Try again later.');
    });
}

//Simple slider script
    const slides = document.getElementById('slides');
    const dots   = document.querySelectorAll('.dot');
    dots.forEach(dot => {
      dot.addEventListener('click', e => {
        const idx = e.target.dataset.slide;
        slides.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach(d=>d.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
