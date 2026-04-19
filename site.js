// ── NOCTURNAL AUDIO — site.js ──
// Fetches content.yml and builds the page dynamically.
// Falls back gracefully if fetch fails (e.g. opening file:// locally).

const placeholderSVG = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1"><rect x="4" y="8" width="32" height="24" rx="2"/><circle cx="15" cy="18" r="4"/><path d="M4 28l8-7 6 5 5-4 13 10"/></svg>`;
const musicNoteSVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3 8.5l-4 2.5V5l4 2.5z"/></svg>`;
const serviceIcons = [
  `<svg style="width:28px;height:28px;margin-bottom:12px;color:var(--warm-1)" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="16" cy="16" r="10"/><circle cx="16" cy="16" r="4"/><line x1="16" y1="6" x2="16" y2="2"/><line x1="26" y1="16" x2="30" y2="16"/></svg>`,
  `<svg style="width:28px;height:28px;margin-bottom:12px;color:var(--warm-1)" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="10" width="8" height="12" rx="4"/><line x1="8" y1="22" x2="8" y2="28"/><line x1="4" y1="28" x2="12" y2="28"/><path d="M16 8c4.4 0 8 3.6 8 8s-3.6 8-8 8"/><path d="M16 4c6.6 0 12 5.4 12 12s-5.4 12-12 12"/></svg>`,
  `<svg style="width:28px;height:28px;margin-bottom:12px;color:var(--warm-1)" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="8" width="28" height="16" rx="2"/><circle cx="9" cy="16" r="3"/><line x1="16" y1="12" x2="26" y2="12"/><line x1="16" y1="16" x2="24" y2="16"/><line x1="16" y1="20" x2="22" y2="20"/></svg>`,
  `<svg style="width:28px;height:28px;margin-bottom:12px;color:var(--warm-1)" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="16" cy="10" r="5"/><path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10"/><path d="M22 14l4 2M24 18l3 1"/></svg>`,
  `<svg style="width:28px;height:28px;margin-bottom:12px;color:var(--warm-1)" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="20" height="24" rx="2"/><path d="M10 10h12M10 15h12M10 20h8"/><circle cx="22" cy="22" r="5"/><path d="M20 22l1.5 1.5L24 20"/></svg>`
];

let audio;
let tracks = [];
let currentTrackIndex = 0;
let isPlaying = false;

// ── BOOT ──
// Try fetching content.yml. If that fails (e.g. local file:// or CORS),
// show a helpful error rather than a blank loading screen.
fetch('/content.yml')
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  })
  .then(text => {
    const data = jsyaml.load(text);
    buildSite(data);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  })
  .catch(err => {
    console.warn('fetch /content.yml failed:', err.message);
    // Show friendly local dev message
    document.getElementById('loading').innerHTML = `
      <div style="color:#776e64;font-family:sans-serif;font-size:14px;text-align:center;max-width:400px;padding:2rem;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;color:#ede8df;margin-bottom:1rem;">
          NOCTURNAL<span style="color:#d4823a;">.</span>AUDIO
        </div>
        <p style="margin-bottom:0.75rem;">Could not load <code>content.yml</code>.</p>
        <p style="font-size:12px;color:#555;">
          If you're working locally, run:<br>
          <code style="background:#161616;padding:4px 8px;border-radius:2px;display:inline-block;margin-top:6px;">python3 -m http.server 8080</code><br>
          then open <strong>localhost:8080</strong> in your browser.
        </p>
      </div>`;
  });

// Netlify Identity redirect
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => { document.location.href = '/admin/'; });
    }
  });
}

// ── BUILD SITE ──
function buildSite(d) {

  // HERO
  const h = d.hero;
  document.getElementById('hero-eyebrow').textContent = h.eyebrow;
  document.getElementById('hero-title').innerHTML =
    `${h.headline_line1}<br>
     <span class="accent">${h.headline_line2}</span><br>
     <span class="dim">${h.headline_line3}</span><br>
     ${h.headline_line4}`;
  document.getElementById('hero-sub').textContent = h.subheading;
  document.getElementById('hero-actions').innerHTML =
    `<a href="#contact" class="btn-primary">${h.cta_primary}</a>
     <a href="#about" class="btn-outline">${h.cta_secondary}</a>`;

  // ABOUT
  document.getElementById('about-label').textContent = d.about.label;
  document.getElementById('about-text').textContent = d.about.text;

  // SERVICES
  document.getElementById('services-grid').innerHTML = d.services.map((s, i) => `
    <div class="service-item">
      ${serviceIcons[i] || ''}
      <div class="service-name">${s.name}</div>
      <div class="service-desc">${s.description}</div>
    </div>`).join('');

  // GALLERY
  document.getElementById('gallery-label').textContent = d.gallery.label;
  document.getElementById('gallery-title').textContent = d.gallery.title;
  document.getElementById('gallery-grid').innerHTML = d.gallery.items.map((item, i) => `
    <div class="gallery-item${i === 0 ? ' tall' : ''}">
      ${item.image
        ? `<img src="${item.image}" alt="${item.alt || ''}">`
        : `<div class="gallery-placeholder">${placeholderSVG}</div>`}
      <div class="gallery-tag">${item.tag}</div>
    </div>`).join('');

  // MUSIC
  document.getElementById('music-label').textContent = d.music.label;
  document.getElementById('music-title').textContent = d.music.title;
  tracks = d.music.tracks || [];
  renderTrackList();
  if (tracks[0]) document.getElementById('track-end').textContent = tracks[0].duration;

  // MERCH
  document.getElementById('merch-label').textContent = d.merch.label;
  document.getElementById('merch-title').textContent = d.merch.title;
  document.getElementById('merch-grid').innerHTML = d.merch.items.map(item => {
    const tag = item.url ? 'a' : 'div';
    const attrs = item.url ? `href="${item.url}" target="_blank" rel="noopener" class="merch-card-link"` : `class="merch-card"`;
    return `
    <${tag} ${attrs}>
      <div class="merch-img">
        ${item.image
          ? `<img src="${item.image}" alt="${item.alt || ''}">`
          : `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="#2a2520" stroke-width="1"><rect x="8" y="8" width="40" height="40" rx="4"/><path d="M8 20h40M20 8v40"/></svg>`}
      </div>
      <div class="merch-info">
        <div class="merch-name">${item.name}</div>
        <div class="merch-price">${item.price}</div>
        <button class="merch-add">${item.url ? 'View Product' : 'Add to Cart'}</button>
      </div>
    </${tag}>`;
  }).join('');

  // CONTACT
  document.getElementById('contact-label').textContent = d.contact.label;
  document.getElementById('contact-title').textContent = d.contact.title;
  document.getElementById('contact-body').textContent = d.contact.body;
  document.getElementById('contact-phone').textContent = d.site.phone;
  document.getElementById('contact-email').textContent = d.site.email;
  document.getElementById('contact-city').textContent = d.site.city;
  document.getElementById('contact-services').innerHTML = d.contact.services.map(s => `<option>${s}</option>`).join('');

  // FOOTER
  document.getElementById('footer-links').innerHTML = `
    <a href="${d.site.instagram}" target="_blank" rel="noopener">Instagram</a>
    <a href="${d.site.facebook}" target="_blank" rel="noopener">Facebook</a>
    <a href="${d.site.soundcloud}" target="_blank" rel="noopener">SoundCloud</a>`;
  document.getElementById('footer-copy').textContent = `© ${new Date().getFullYear()} ${d.site.title} LLC`;

  initPlayer();
  initContactForm();
}

// ── TRACK LIST ──
function renderTrackList() {
  document.getElementById('track-list').innerHTML = tracks.map((t, i) => `
    <div class="track-item${i === currentTrackIndex ? ' active' : ''}${i === currentTrackIndex && isPlaying ? ' playing' : ''}" data-index="${i}">
      <div class="track-bars"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>
      <div class="track-num-wrap"><span class="track-num">${i + 1}</span></div>
      <div class="track-art">${musicNoteSVG}</div>
      <div class="track-info">
        <div class="track-title">${t.title}</div>
        <div class="track-artist">${t.artist}</div>
      </div>
      <div class="track-duration">${t.duration}</div>
    </div>`).join('');
}

// ── PLAYER ──
function initPlayer() {
  audio = document.getElementById('audio-player');
  if (!audio || tracks.length === 0) return;

  updateTrackNote();
  loadTrack(currentTrackIndex);

  document.getElementById('track-list').addEventListener('click', e => {
    const item = e.target.closest('.track-item');
    if (!item) return;
    const index = Number(item.dataset.index);
    if (!Number.isNaN(index)) selectTrack(index);
  });

  document.getElementById('play-btn').addEventListener('click', () => {
    if (!tracks[currentTrackIndex] || !tracks[currentTrackIndex].url) return;
    isPlaying ? pauseTrack() : playTrack();
  });

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (tracks.length === 0) return;
    selectTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    if (tracks.length === 0) return;
    selectTrack((currentTrackIndex + 1) % tracks.length);
  });

  document.getElementById('progress-bar').addEventListener('click', e => {
    if (!audio.duration || !audio.src) return;
    const rect = document.getElementById('progress-bar').getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  });

  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', updateProgress);
  audio.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayButton();
    selectTrack((currentTrackIndex + 1) % tracks.length);
  });
}

function loadTrack(index) {
  const track = tracks[index];
  if (!track) return;
  currentTrackIndex = index;
  document.querySelectorAll('.track-item').forEach((t, i) => t.classList.toggle('active', i === index));
  document.getElementById('track-end').textContent = track.duration || '0:00';
  document.getElementById('track-current').textContent = '0:00';
  document.getElementById('progress-fill').style.width = '0%';
  if (track.url) {
    audio.src = track.url;
    audio.load();
  } else {
    audio.removeAttribute('src');
    audio.pause();
  }
  isPlaying = false;
  updatePlayButton();
  updateTrackNote();
  renderTrackList();
}

function selectTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  loadTrack(index);
}

function playTrack() {
  if (!audio.src) return;
  audio.play().then(() => { isPlaying = true; updatePlayButton(); updateTrackNote(); renderTrackList(); }).catch(() => { isPlaying = false; updatePlayButton(); updateTrackNote(); renderTrackList(); });
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  updatePlayButton();
  updateTrackNote();
  renderTrackList();
}

function updatePlayButton() {
  const playBtn = document.getElementById('play-btn');
  const icon = playBtn.querySelector('svg path');
  if (isPlaying) {
    icon.setAttribute('d', 'M6 6h4v12H6zm8 0h4v12h-4z');
    playBtn.setAttribute('aria-label', 'Pause');
  } else {
    icon.setAttribute('d', 'M8 5v14l11-7z');
    playBtn.setAttribute('aria-label', 'Play');
  }
}

function updateProgress() {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('track-current').textContent = formatTime(audio.currentTime);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

function updateTrackNote(msg) {
  const note = document.getElementById('music-note');
  if (!note) return;
  if (msg) { note.textContent = msg; return; }
  const track = tracks[currentTrackIndex];
  if (!track || !track.url) {
    note.textContent = 'Add audio files to your audio/ folder and set URLs in content.yml';
    return;
  }
  note.textContent = isPlaying
    ? `Now playing: ${track.title} — ${track.artist}`
    : `Ready to play: ${track.title} — ${track.artist}`;
}

// ── CONTACT FORM ──
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', () => {
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Sending...';
    btn.disabled = true;
  });

  document.addEventListener('nfFormSubmitSuccess', () => {
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Message Sent!';
    btn.style.background = 'var(--warm-1)';
    form.reset();
    setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; btn.disabled = false; }, 3000);
  });

  document.addEventListener('nfFormSubmitError', () => {
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Error — Try Again';
    btn.style.background = '#c0392b';
    setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; btn.disabled = false; }, 3000);
  });
}
