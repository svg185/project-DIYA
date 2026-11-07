const photos = [
  ["Festive Bokeh Portrait Collage.png", "A festival glow"],
  ["Sunlit Denim Selfie Amidst Greenery.png", "Sunlit days"],
  ["WhatsApp Image 2026-11-03 at 6.05.55 AM (1).jpeg", "A quiet morning"],
  ["WhatsApp Image 2026-11-03 at 6.05.55 AM.jpeg", "Little moments"],
  ["WhatsApp Image 2026-11-03 at 6.05.56 AM (1).jpeg", "Softly remembered"],
  ["WhatsApp Image 2026-11-03 at 6.05.56 AM.jpeg", "A day to keep"],
  ["WhatsApp Image 2026-11-07 at 11.14.16 AM (1).jpeg", "The happiest light"],
  ["WhatsApp Image 2026-11-07 at 11.14.16 AM.jpeg", "Golden hour"],
  ["WhatsApp Image 2026-11-07 at 11.14.17 AM (1).jpeg", "A beautiful smile"],
  ["WhatsApp Image 2026-11-07 at 11.14.17 AM.jpeg", "Forever in focus"],
  ["WhatsApp Image 2026-11-07 at 11.14.18 AM (1).jpeg", "Joy, unframed"],
  ["WhatsApp Image 2026-11-07 at 11.14.18 AM (2).jpeg", "A little wonder"],
  ["WhatsApp Image 2026-11-07 at 11.14.18 AM.jpeg", "Moments of magic"],
  ["WhatsApp Image 2026-11-07 at 11.14.19 AM (1).jpeg", "Just like that"],
  ["WhatsApp Image 2026-11-07 at 11.14.19 AM.jpeg", "A warm memory"],
  ["WhatsApp Image 2026-11-07 at 11.14.20 AM (1).jpeg", "The light within"],
  ["WhatsApp Image 2026-11-07 at 11.14.20 AM (2).jpeg", "A story to tell"],
  ["WhatsApp Image 2026-11-07 at 11.14.20 AM.jpeg", "Sweet simplicity"],
  ["WhatsApp Image 2026-11-07 at 11.14.21 AM (1).jpeg", "A cherished frame"],
  ["WhatsApp Image 2026-11-07 at 11.14.21 AM (2).jpeg", "Light follows love"],
  ["WhatsApp Image 2026-11-07 at 11.14.21 AM.jpeg", "Always shining"]
];

const gallery = document.querySelector("#gallery");
photos.forEach(([src, caption], index) => {
  const card = document.createElement("figure");
  card.className = "memory-card photo-reveal";
  card.style.setProperty("--tilt", `${index % 2 ? 1.2 : -1.2}deg`);
  card.style.setProperty("--depth", `${(index % 5) * 0.8}s`);
  card.innerHTML = `<img src="${src}" alt="${caption}" loading="lazy"><figcaption>${caption}</figcaption>`;
  card.addEventListener("click", () => openLightbox(index));
  gallery.appendChild(card);
});

const audio = {
  context: null, master: null, music: null, musicGain: null, effectsGain: null,
  musicOn: true, effectsOn: true, volume: .45, started: false, fireworksTimer: null,
  start() {
    if (this.started) { if (this.context.state === "suspended") this.context.resume(); return; }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.effectsGain = this.context.createGain();
    this.master.gain.value = this.volume;
    this.musicGain.gain.value = .12;
    this.effectsGain.gain.value = 1;
    this.musicGain.connect(this.master); this.effectsGain.connect(this.master); this.master.connect(this.context.destination);
    this.music = this.context.createOscillator();
    const lfo = this.context.createOscillator();
    const lfoGain = this.context.createGain();
    this.music.type = "sine"; this.music.frequency.value = 174;
    lfo.frequency.value = .08; lfoGain.gain.value = 3;
    lfo.connect(lfoGain); lfoGain.connect(this.music.frequency); this.music.connect(this.musicGain);
    this.music.start(); lfo.start(); this.started = true;
  },
  tone(frequency, duration = .35, type = "sine", delay = 0) {
    if (!this.started || !this.effectsOn) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.22, now + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain); gain.connect(this.effectsGain); oscillator.start(now); oscillator.stop(now + duration + .03);
  },
  ignition() { this.tone(220, .16, "triangle"); this.tone(440, .5, "sine", .08); },
  fireworks() { this.tone(130, .22, "sawtooth"); this.tone(660, .35, "sine", .15); this.tone(880, .5, "sine", .3); },
  chime() { [523, 659, 784, 1047].forEach((note, i) => this.tone(note, .8, "sine", i * .12)); },
  sparkle() { this.tone(1200, .18, "sine"); }
};

const startAudio = () => audio.start();
let celebrationStarted = false;
const lightUp = () => {
  if (!celebrationStarted) {
    celebrationStarted = true;
    startAudio(); audio.ignition();
    startFireworks();
    document.body.classList.add("celebration-started");
  } else {
    startAudio();
  }
  document.body.classList.add("lit");
  document.querySelector(".light-wash").classList.remove("flash");
  void document.querySelector(".light-wash").offsetWidth;
  document.querySelector(".light-wash").classList.add("flash");
  document.querySelector("#main-diya").classList.add("active");
};
document.querySelector("#start-button").addEventListener("click", () => {
  lightUp();
  document.querySelector("#welcome-screen").classList.add("dismissed");
  document.querySelector("#diya").scrollIntoView({ behavior: "smooth" });
});
document.querySelector("#diya-button").addEventListener("click", lightUp);
document.querySelector("#main-diya").addEventListener("click", lightUp);
document.querySelector("#replay-button").addEventListener("click", () => {
  document.querySelector("#welcome-screen").classList.remove("dismissed");
  document.querySelector("#welcome-screen").scrollIntoView({ behavior: "smooth" });
  document.body.classList.remove("lit", "celebration-started");
  document.querySelector("#main-diya").classList.remove("active");
  celebrationStarted = false;
});
document.querySelector("#fireworks-button").addEventListener("click", () => {
  startAudio(); startFireworks(true); document.querySelector(".celebration").classList.add("show-fireworks");
});
document.querySelector("#letter-button").addEventListener("click", () => { startAudio(); audio.sparkle(); document.querySelector(".letter").classList.add("open"); });

const panel = document.querySelector("#audio-panel");
document.querySelector("#audio-open").addEventListener("click", () => { panel.classList.add("open"); panel.setAttribute("aria-hidden", "false"); });
document.querySelector("#audio-close").addEventListener("click", () => { panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); });
document.querySelector("#music-toggle").addEventListener("change", (event) => {
  audio.musicOn = event.target.checked;
  if (audio.musicGain) audio.musicGain.gain.setTargetAtTime(audio.musicOn ? .12 : 0, audio.context.currentTime, .08);
});
document.querySelector("#effects-toggle").addEventListener("change", (event) => { audio.effectsOn = event.target.checked; });
document.querySelector("#volume").addEventListener("input", (event) => { audio.volume = Number(event.target.value); if (audio.master) audio.master.gain.value = audio.volume; });
document.querySelector("#top-button").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

let currentPhoto = 0;
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
function openLightbox(index) {
  currentPhoto = index; const [src, caption] = photos[index];
  lightboxImage.src = src; lightboxImage.alt = caption; lightboxCaption.textContent = `${caption} · ${index + 1} / ${photos.length}`;
  lightbox.classList.add("open"); lightbox.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
}
function closeLightbox() { lightbox.classList.remove("open"); lightbox.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
function movePhoto(direction) { openLightbox((currentPhoto + direction + photos.length) % photos.length); }
document.querySelector("#lightbox-close").addEventListener("click", closeLightbox);
document.querySelector("#prev-photo").addEventListener("click", () => movePhoto(-1));
document.querySelector("#next-photo").addEventListener("click", () => movePhoto(1));
document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") movePhoto(-1);
  if (event.key === "ArrowRight") movePhoto(1);
});

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("visible"); }), { threshold: .12 });
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
const photoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      document.querySelectorAll(".photo-reveal").forEach((photo, index) => {
        window.setTimeout(() => photo.classList.add("photo-visible"), index * 90);
      });
      photoObserver.disconnect();
    }
  });
}, { threshold: .08 });
photoObserver.observe(document.querySelector("#gallery"));

const canvas = document.querySelector("#cinematic-canvas");
const context = canvas.getContext("2d", { alpha: true });
const rockets = [];
const sparks = [];
let fireworksRunning = false;
let frame = 0;
const resizeCanvas = () => {
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
};
const fireworkColors = ["#ffd477", "#e7a5d4", "#bc8ee2", "#fff2b0"];
const launchRocket = (large = false) => {
  if (audio.started) audio.fireworks();
  rockets.push({
    x: window.innerWidth * (.12 + Math.random() * .76),
    y: window.innerHeight + 10,
    targetY: window.innerHeight * (.15 + Math.random() * .28),
    speed: large ? 8 : 6,
    color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)]
  });
};
const explode = (rocket) => {
  const amount = window.innerWidth < 700 ? 34 : 62;
  for (let i = 0; i < amount; i += 1) {
    const angle = (Math.PI * 2 * i) / amount;
    const speed = 1.1 + Math.random() * (rocket.color === "#ffd477" ? 3.2 : 2.4);
    sparks.push({
      x: rocket.x, y: rocket.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 1, decay: .012 + Math.random() * .012, color: rocket.color
    });
  }
};
const drawFireworks = () => {
  if (!fireworksRunning) return;
  context.fillStyle = "rgba(8, 7, 14, .2)";
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  rockets.forEach((rocket, index) => {
    rocket.y -= rocket.speed;
    context.fillStyle = rocket.color;
    context.fillRect(rocket.x, rocket.y, 2, 8);
    if (rocket.y <= rocket.targetY) { explode(rocket); rockets.splice(index, 1); }
  });
  sparks.forEach((spark, index) => {
    spark.x += spark.vx; spark.y += spark.vy; spark.vy += .035; spark.life -= spark.decay;
    context.globalAlpha = Math.max(spark.life, 0);
    context.fillStyle = spark.color; context.fillRect(spark.x, spark.y, 2, 2);
    if (spark.life <= 0) sparks.splice(index, 1);
  });
  context.globalAlpha = 1;
  frame = window.requestAnimationFrame(drawFireworks);
};
function startFireworks(force = false) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!fireworksRunning) {
    fireworksRunning = true; resizeCanvas(); drawFireworks();
    window.setInterval(() => { if (fireworksRunning) launchRocket(); }, 2300);
  }
  launchRocket(force);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
window.addEventListener("pointermove", (event) => {
  const x = (event.clientX / window.innerWidth - .5) * 2;
  const y = (event.clientY / window.innerHeight - .5) * 2;
  document.documentElement.style.setProperty("--pointer-x", `${x * 10}px`);
  document.documentElement.style.setProperty("--pointer-y", `${y * 6}px`);
});
