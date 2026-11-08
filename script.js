/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   KARTIK × DIYA — Romantic Proposal Experience
   script.js
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

'use strict';

/* ── Photos ── */
const photos = [
  ['Festive Bokeh Portrait Collage.png', 'A moment in light'],
  ['Sunlit Denim Selfie Amidst Greenery.png', 'Sunlit days'],
  ['WhatsApp Image 2026-11-03 at 6.05.55 AM (1).jpeg', 'A quiet morning'],
  ['WhatsApp Image 2026-11-03 at 6.05.55 AM.jpeg', 'Little moments'],
  ['WhatsApp Image 2026-11-03 at 6.05.56 AM (1).jpeg', 'Softly remembered'],
  ['WhatsApp Image 2026-11-03 at 6.05.56 AM.jpeg', 'A day to keep'],
  ['WhatsApp Image 2026-11-07 at 11.14.16 AM (1).jpeg', 'The happiest light'],
  ['WhatsApp Image 2026-11-07 at 11.14.16 AM.jpeg', 'Golden hour'],
  ['WhatsApp Image 2026-11-07 at 11.14.17 AM (1).jpeg', 'A beautiful smile'],
  ['WhatsApp Image 2026-11-07 at 11.14.17 AM.jpeg', 'Forever in focus'],
  ['WhatsApp Image 2026-11-07 at 11.14.18 AM (1).jpeg', 'Joy, unframed'],
  ['WhatsApp Image 2026-11-07 at 11.14.18 AM (2).jpeg', 'A little wonder'],
  ['WhatsApp Image 2026-11-07 at 11.14.18 AM.jpeg', 'Moments of magic'],
  ['WhatsApp Image 2026-11-07 at 11.14.19 AM (1).jpeg', 'Just like that'],
  ['WhatsApp Image 2026-11-07 at 11.14.19 AM.jpeg', 'A warm memory'],
  ['WhatsApp Image 2026-11-07 at 11.14.20 AM (1).jpeg', 'The light within'],
  ['WhatsApp Image 2026-11-07 at 11.14.20 AM (2).jpeg', 'A story to tell'],
  ['WhatsApp Image 2026-11-07 at 11.14.20 AM.jpeg', 'Sweet simplicity'],
  ['WhatsApp Image 2026-11-07 at 11.14.21 AM (1).jpeg', 'A cherished frame'],
  ['WhatsApp Image 2026-11-07 at 11.14.21 AM (2).jpeg', 'Light follows love'],
  ['WhatsApp Image 2026-11-07 at 11.14.21 AM.jpeg', 'Always shining'],
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let currentChapter = 0;      // 0 = welcome screen
const TOTAL_CHAPTERS = 11;
let storyStarted = false;
let petalInterval = null;
let responseChosen = false;
let proposalTimers = [];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AUDIO ENGINE  (Web Audio API)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const audio = {
  context: null, master: null, musicOsc: null, musicGain: null, effectsGain: null,
  musicOn: true, effectsOn: true, paused: false, volume: 0.45, started: false,

  start() {
    if (this.started) {
      if (this.context && this.context.state === 'suspended') this.context.resume();
      this.paused = false;
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.context = new AC();
    this.master = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.effectsGain = this.context.createGain();
    this.master.gain.value = this.volume;
    this.musicGain.gain.value = 0;
    this.effectsGain.gain.value = 1;
    this.musicGain.connect(this.master);
    this.effectsGain.connect(this.master);
    this.master.connect(this.context.destination);

    // Layered ambient: two slow oscillators detuned slightly for richness
    this._buildAmbient(174, 0.09);
    this._buildAmbient(220, 0.05);
    this._buildAmbient(130.8, 0.04);

    // Fade music in gently
    this.musicGain.gain.setTargetAtTime(0.07, this.context.currentTime, 2.5);
    this.started = true;
  },

  togglePlayback() {
    if (!this.started) this.start();
    this.paused = !this.paused;
    if (this.musicGain && this.context) {
      const target = this.paused || !this.musicOn ? 0 : 0.07;
      this.musicGain.gain.setTargetAtTime(target, this.context.currentTime, 0.35);
    }
    return !this.paused;
  },

  _buildAmbient(freq, gain) {
    const osc = this.context.createOscillator();
    const g   = this.context.createGain();
    const lfo = this.context.createOscillator();
    const lg  = this.context.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    lfo.frequency.value = 0.07; lg.gain.value = 2;
    g.gain.value = gain;
    lfo.connect(lg); lg.connect(osc.frequency);
    osc.connect(g); g.connect(this.musicGain);
    osc.start(); lfo.start();
  },

  tone(frequency, duration = 0.35, type = 'sine', delay = 0) {
    if (!this.started || !this.effectsOn || !this.context) return;
    const now = this.context.currentTime + delay;
    const osc = this.context.createOscillator();
    const g   = this.context.createGain();
    osc.type = type; osc.frequency.setValueAtTime(frequency, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.18, now + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(g); g.connect(this.effectsGain);
    osc.start(now); osc.stop(now + duration + 0.04);
  },

  chime()   { [523, 659, 784, 1047].forEach((n, i) => this.tone(n, 0.9, 'sine', i * 0.13)); },
  sparkle() { [1200, 1500, 1800].forEach((n, i) => this.tone(n, 0.3, 'sine', i * 0.08)); },
  bloom()   { [392, 523, 659, 784].forEach((n, i) => this.tone(n, 1.2, 'sine', i * 0.15)); },
  heartbeat() { this.tone(80, 0.08, 'sine'); setTimeout(() => this.tone(80, 0.08, 'sine'), 200); },
  reveal()  { [261, 329, 392, 523, 659].forEach((n, i) => this.tone(n, 1.5, 'sine', i * 0.1)); },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CANVAS — PARTICLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const canvas = document.getElementById('cinematic-canvas');
const ctx    = canvas.getContext('2d', { alpha: true });

const particles = [];
let   animFrame = null;

function resizeCanvas() {
  const r  = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = window.innerWidth  * r;
  canvas.height = window.innerHeight * r;
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(r, 0, 0, r, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* Particle types */
function spawnParticle(x, y, type = 'star') {
  const p = { x, y, type, life: 1, decay: 0 };

  if (type === 'star') {
    p.vx = (Math.random() - 0.5) * 1.2;
    p.vy = (Math.random() - 0.5) * 1.2 - 0.4;
    p.size = 1.5 + Math.random() * 2;
    p.decay = 0.006 + Math.random() * 0.006;
    p.color = ['#F3A5C5', '#B9A3E8', '#D9A46B', '#fff'][Math.floor(Math.random() * 4)];
  } else if (type === 'heart') {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 1;
    p.size = 6 + Math.random() * 8;
    p.decay = 0.015 + Math.random() * 0.01;
    p.color = Math.random() > 0.5 ? '#F3A5C5' : '#B9A3E8';
  } else if (type === 'bloom') {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.size = 4 + Math.random() * 6;
    p.decay = 0.02;
    p.color = ['#F3A5C5', '#D9A46B', '#fff', '#B9A3E8'][Math.floor(Math.random() * 4)];
  }
  particles.push(p);
}

function drawHeartShape(ctx, cx, cy, size) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.bezierCurveTo(5, -12, 16, -8, 16, 0);
  ctx.bezierCurveTo(16, 8, 0, 18, 0, 20);
  ctx.bezierCurveTo(0, 18, -16, 8, -16, 0);
  ctx.bezierCurveTo(-16, -8, -5, -12, 0, -5);
  ctx.closePath();
  ctx.restore();
}

function animateParticles() {
  animFrame = requestAnimationFrame(animateParticles);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02; // gentle gravity
    p.life -= p.decay;

    if (p.life <= 0) { particles.splice(i, 1); continue; }

    ctx.globalAlpha = Math.max(p.life, 0);

    if (p.type === 'heart' || p.type === 'bloom') {
      ctx.fillStyle = p.color;
      drawHeartShape(ctx, p.x, p.y, p.size);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
animateParticles();

/* Ambient star emitter (subtle background sparkle) */
let bgSparkTimer = null;
function startBgSparkle() {
  if (bgSparkTimer) return;
  bgSparkTimer = setInterval(() => {
    if (!storyStarted) return;
    spawnParticle(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight,
      'star'
    );
  }, 180);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PETALS (DOM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const petalLayer = document.getElementById('petal-layer');

function spawnPetal() {
  const petal = document.createElement('div');
  petal.className = 'petal';
  const size    = 8 + Math.random() * 14;
  const startX  = Math.random() * window.innerWidth;
  const dur     = 6 + Math.random() * 8;
  const drift   = (Math.random() - 0.5) * 200;
  petal.style.cssText = `
    left:${startX}px; top:-20px;
    width:${size}px; height:${size * 1.3}px;
    animation-duration:${dur}s;
    animation-delay:${Math.random() * 4}s;
    --drift:${drift}px;
    transform:rotate(${Math.random() * 360}deg);
  `;
  if (Math.random() > 0.6) petal.style.background = `radial-gradient(ellipse, #B9A3E8, rgba(185,163,232,.35))`;
  petalLayer.appendChild(petal);
  setTimeout(() => petal.remove(), (dur + 4) * 1000);
}

function startPetals(rate = 1200) {
  stopPetals();
  spawnPetal();
  petalInterval = setInterval(spawnPetal, rate);
}
function stopPetals() {
  if (petalInterval) { clearInterval(petalInterval); petalInterval = null; }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HEART BURST (envelope)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function burstHearts(container, count = 20) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className = 'heart-particle';
    h.textContent = Math.random() > 0.5 ? '❤' : '💕';
    h.style.cssText = `
      left:${40 + Math.random() * 20}%;
      top:${40 + Math.random() * 20}%;
      animation-delay:${Math.random() * 0.5}s;
      font-size:${10 + Math.random() * 16}px;
    `;
    container.appendChild(h);
    setTimeout(() => h.remove(), 1200);
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CHAPTER NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const overlay = document.getElementById('transition-overlay');

function goToChapter(n) {
  if (n < 1 || n > TOTAL_CHAPTERS) return;
  const target = document.getElementById(`ch${n}`);
  if (!target) return;

  overlay.classList.add('active');

  setTimeout(() => {
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    currentChapter = n;
    updateProgress(n);
    updateDots(n);
    onChapterEnter(n);

    setTimeout(() => overlay.classList.remove('active'), 400);
  }, 300);
}

function updateProgress(n) {
  const fill = document.getElementById('progress-fill');
  fill.style.width = `${(n / TOTAL_CHAPTERS) * 100}%`;
  document.getElementById('progress-bar').setAttribute('aria-valuenow', n);
}

function updateDots(n) {
  document.querySelectorAll('.chapter-dot').forEach((d, i) => {
    d.classList.toggle('active', i + 1 === n);
  });
}

/* Chapter-specific effects */
function onChapterEnter(n) {
  if (!storyStarted) return;
  activateIllustration(n);

  switch (n) {
    case 1:
      audio.chime();
      break;
    case 2:
      audio.tone(329, 0.8, 'sine');
      break;
    case 3:
      audio.tone(174, 1.2, 'triangle');
      break;
    case 4:
      audio.tone(220, 0.6, 'sine');
      break;
    case 5:
      audio.tone(130, 1.0, 'sine');
      break;
    case 6:
      audio.bloom();
      startPetals(900);
      triggerGardenAnimation();
      break;
    case 7:
      audio.chime();
      break;
    case 8:
      audio.tone(392, 1.0, 'sine');
      triggerTransformAnimation();
      break;
    case 9:
      audio.reveal();
      startPetals(600);
      triggerConfession();
      break;
    case 10:
      audio.bloom();
      startPetals(500);
      spawnProposalPetals();
      revealProposal();
      break;
    case 11:
      startPetals(800);
      break;
  }

  function activateIllustration(n) {
    document.querySelectorAll('.chapter-illustration.active').forEach(illustration => {
      illustration.classList.remove('active');
    });
    const illustration = document.querySelector(`#ch${n} .chapter-illustration`);
    if (!illustration) return;
    illustration.classList.add('active');
    if (n >= 6 && n <= 10) {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          spawnParticle(
            window.innerWidth * (0.56 + Math.random() * 0.3),
            window.innerHeight * (0.25 + Math.random() * 0.45),
            n === 6 || n === 10 ? 'bloom' : 'star'
          );
        }, i * 120);
      }
    }
  }

  function revealProposal() {
    const proposal = document.getElementById('ch10');
    if (!proposal || proposal.classList.contains('proposal-ready')) return;
    proposalTimers.forEach(clearTimeout);
    proposalTimers = [];
    proposal.classList.add('proposal-ready');
    const reveal = document.getElementById('proposal-reveal');
    if (!reveal) return;
    proposalTimers.push(setTimeout(() => reveal.classList.add('show-prelude'), 250));
    proposalTimers.push(setTimeout(() => reveal.classList.add('show-story'), 2200));
    proposalTimers.push(setTimeout(() => {
      reveal.classList.add('show-names');
      audio.reveal();
      for (let i = 0; i < 24; i++) {
        setTimeout(() => spawnParticle(window.innerWidth / 2 + (Math.random() - .5) * 260, window.innerHeight * .42, 'heart'), i * 70);
      }
    }, 4600));
  }

  // Canvas sparkle for chapters 6+
  if (n >= 6) {
    document.body.classList.add('canvas-active');
    startBgSparkle();
  }
}

/* Chapter 6 — garden */
function triggerGardenAnimation() {
  const flowers = document.querySelectorAll('.flower');
  flowers.forEach((f, i) => {
    f.style.opacity = '0';
    f.style.transform = 'translateY(30px)';
    setTimeout(() => {
      f.style.transition = 'opacity .8s ease, transform .8s ease';
      f.style.opacity = '0.65';
      f.style.transform = 'translateY(0)';
    }, i * 150);
  });
}

/* Chapter 8 — dark-to-light transition */
function triggerTransformAnimation() {
  const light = document.getElementById('transform-light');
  if (light) {
    setTimeout(() => light.classList.add('active'), 1200);
  }
}

/* Chapter 9 — confession */
function triggerConfession() {
  const glass = document.getElementById('glass-heart');
  if (glass) {
    glass.style.animation = 'heart-float 2s ease-in-out infinite';
    // Spawn heart particles from canvas center
    setTimeout(() => {
      for (let i = 0; i < 30; i++) {
        spawnParticle(
          window.innerWidth / 2 + (Math.random() - 0.5) * 100,
          window.innerHeight / 2 + (Math.random() - 0.5) * 100,
          'heart'
        );
      }
    }, 800);
  }
}

/* Chapter 10 — proposal petals */
function spawnProposalPetals() {
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      spawnParticle(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight * 0.5,
        'bloom'
      );
    }, i * 100);
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RESPONSE BUTTONS (Chapter 11)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function handleResponse(type) {
  if (responseChosen) return;
  responseChosen = true;

  const options = document.getElementById('response-options');
  options.style.transition = 'opacity .4s';
  options.style.opacity = '0';
  setTimeout(() => { options.style.display = 'none'; }, 400);

  const msgId = { yes: 'resp-msg-yes', time: 'resp-msg-time', friends: 'resp-msg-friends' }[type];
  const msg = document.getElementById(msgId);
  if (msg) msg.classList.add('shown');
  sendAnswerByEmail(type);

  // Particle effect per response
  if (type === 'yes') {
    audio.bloom();
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        spawnParticle(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          'bloom'
        );
      }, i * 60);
    }

    async function sendAnswerByEmail(type) {
      const status = document.getElementById('answer-status');
      const labels = {
        yes: 'YES — Let’s start something beautiful',
        time: 'I need some time',
        friends: 'Let’s stay friends',
      };
      const answer = labels[type];
      if (!status || !answer) return;
      status.classList.remove('error');
      status.textContent = 'Sending your answer...';

      try {
        const response = await fetch('https://formsubmit.co/ajax/kumarkartik2146@gmail.com', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _subject: `Kartik × Diya — ${answer}`,
            _template: 'table',
            _captcha: 'false',
            answer,
            submitted_at: new Date().toLocaleString(),
          }),
        });
        if (!response.ok) throw new Error(`Email service returned ${response.status}`);
        status.textContent = 'Your answer has been sent privately. ❤️';
      } catch (error) {
        status.classList.add('error');
        status.textContent = 'Email could not be sent right now. Please try again.';
        console.error('Unable to send answer email.', error);
      }
    }
    startPetals(300);
  } else if (type === 'time') {
    audio.chime();
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        spawnParticle(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          'heart'
        );
      }, i * 150);
    }
  } else {
    audio.tone(392, 1.5, 'sine');
    stopPetals();
  }
}

document.getElementById('resp-yes')    .addEventListener('click', () => handleResponse('yes'));
document.getElementById('resp-time')   .addEventListener('click', () => handleResponse('time'));
document.getElementById('resp-friends').addEventListener('click', () => handleResponse('friends'));

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ENVELOPE OPEN (Chapter 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function openEnvelope() {
  const env = document.getElementById('big-envelope');
  const particles = document.getElementById('heart-particles');
  if (!env.classList.contains('opened')) {
    env.classList.add('opened');
    audio.start();
    audio.chime();
    storyStarted = true;
    document.body.classList.add('canvas-active');
    startBgSparkle();

    // Show topbar
    document.getElementById('topbar').classList.add('visible');
    document.getElementById('progress-bar').classList.add('visible');

    burstHearts(particles, 25);

    setTimeout(() => {
      startPetals(1500);
      goToChapter(2);
    }, 1800);
  }
}

document.getElementById('open-envelope-btn').addEventListener('click', openEnvelope);
document.getElementById('big-envelope')     .addEventListener('click', openEnvelope);

/* Chapter 5 sunrise trigger */
document.getElementById('sunrise-btn').addEventListener('click', () => {
  const overlay5 = document.getElementById('sunrise-overlay');
  if (overlay5) overlay5.classList.add('active');
  setTimeout(() => goToChapter(6), 1500);
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NAV BUTTONS (prev / next)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => {
    // sunrise-trigger handled separately above for ch5
    if (btn.classList.contains('sunrise-trigger')) return;
    const n = parseInt(btn.dataset.next);
    goToChapter(n);
  });
});
document.querySelectorAll('[data-prev]').forEach(btn => {
  btn.addEventListener('click', () => {
    const n = parseInt(btn.dataset.prev);
    goToChapter(n);
  });
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CHAPTER DOTS — build + click
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const dotsContainer = document.getElementById('chapter-dots');
for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
  const dot = document.createElement('button');
  dot.className = 'chapter-dot';
  dot.type = 'button';
  dot.dataset.chapter = i;
  dot.setAttribute('aria-label', `Go to chapter ${i}`);
  dot.addEventListener('click', () => goToChapter(i));
  dotsContainer.appendChild(dot);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   WELCOME SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function startStory() {
  const welcome = document.getElementById('welcome-screen');
  if (welcome.classList.contains('opening')) return;
  welcome.classList.add('opening');
  storyStarted = true;
  audio.start();
  audio.chime();
  burstHearts(document.getElementById('welcome-hearts'), 18);
  setTimeout(() => {
    welcome.classList.add('dismissed');
    welcome.classList.remove('opening');
    audio.sparkle();
    const ch1 = document.getElementById('ch1');
    if (ch1) ch1.scrollIntoView({ behavior: 'instant', block: 'start' });
    currentChapter = 1;
    updateProgress(1);
    updateDots(1);
    document.getElementById('topbar').classList.add('visible');
    document.getElementById('progress-bar').classList.add('visible');
  }, 1100);
}

setTimeout(() => {
  const welcome = document.getElementById('welcome-screen');
  welcome.classList.add('story-ready');
  const button = document.getElementById('start-button');
  button.disabled = false;
}, 2000);

document.getElementById('start-button').addEventListener('click', startStory);
document.getElementById('brand-home')  .addEventListener('click', (e) => {
  e.preventDefault();
  if (storyStarted) goToChapter(1);
  else {
    document.getElementById('welcome-screen').classList.remove('dismissed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RESTART
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function restartStory() {
  responseChosen = false;
  proposalTimers.forEach(clearTimeout);
  proposalTimers = [];
  stopPetals();

  // Reset response UI
  document.getElementById('response-options').style.display = '';
  document.getElementById('response-options').style.opacity = '1';
  const answerStatus = document.getElementById('answer-status');
  answerStatus.textContent = '';
  answerStatus.classList.remove('error');
  ['resp-msg-yes', 'resp-msg-time', 'resp-msg-friends'].forEach(id => {
    document.getElementById(id).classList.remove('shown');
  });

  // Reset transform overlay
  const tl = document.getElementById('transform-light');
  if (tl) tl.classList.remove('active');
  const proposal = document.getElementById('ch10');
  if (proposal) proposal.classList.remove('proposal-ready');
  const proposalReveal = document.getElementById('proposal-reveal');
  if (proposalReveal) proposalReveal.classList.remove('show-prelude', 'show-story', 'show-names');

  // Reset envelope
  const env = document.getElementById('big-envelope');
  if (env) env.classList.remove('opened');

  // Reset flowers
  document.querySelectorAll('.flower').forEach(f => {
    f.style.opacity = ''; f.style.transform = '';
  });

  document.getElementById('welcome-screen').classList.remove('dismissed');
  window.scrollTo({ top: 0, behavior: 'instant' });
  currentChapter = 0;
  storyStarted = false;
  document.body.classList.remove('canvas-active');
  document.getElementById('topbar').classList.remove('visible');
  document.getElementById('progress-bar').classList.remove('visible');
  updateDots(0);
}

document.getElementById('restart-button')   .addEventListener('click', restartStory);
document.getElementById('restart-story-btn').addEventListener('click', restartStory);
document.getElementById('read-heart-btn').addEventListener('click', () => {
  audio.sparkle();
  goToChapter(11);
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MEMORIES GALLERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const gallery = document.getElementById('gallery');
photos.forEach(([src, caption], index) => {
  const card = document.createElement('figure');
  card.className = 'memory-card photo-reveal';
  card.style.setProperty('--tilt', `${index % 2 ? 1.5 : -1.5}deg`);
  card.style.setProperty('--depth', `${(index % 5) * 0.9}s`);
  card.innerHTML = `<img src="${src}" alt="${caption}" loading="lazy"><figcaption>${caption}</figcaption>`;
  card.addEventListener('click', () => openLightbox(index));
  gallery.appendChild(card);
});

// Photo reveal observer
const photoObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.photo-reveal').forEach((p, i) => {
        setTimeout(() => p.classList.add('photo-visible'), i * 80);
      });
      photoObs.disconnect();
    }
  });
}, { threshold: 0.05 });
photoObs.observe(gallery);

const memoriesSection = document.getElementById('memories');

document.getElementById('memories-btn').addEventListener('click', () => {
  memoriesSection.classList.add('open');
  document.body.style.overflow = 'hidden';
});
document.getElementById('close-memories').addEventListener('click', () => {
  memoriesSection.classList.remove('open');
  document.body.style.overflow = '';
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LIGHTBOX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let currentPhoto = 0;
const lightbox        = document.getElementById('lightbox');
const lightboxImage   = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');

function openLightbox(index) {
  currentPhoto = index;
  const [src, caption] = photos[index];
  lightboxImage.src = src;
  lightboxImage.alt = caption;
  lightboxCaption.textContent = `${caption} · ${index + 1} / ${photos.length}`;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (audio.started) audio.sparkle();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function movePhoto(dir) {
  openLightbox((currentPhoto + dir + photos.length) % photos.length);
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('prev-photo')    .addEventListener('click', () => movePhoto(-1));
document.getElementById('next-photo')    .addEventListener('click', () => movePhoto(1));

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   movePhoto(-1);
  if (e.key === 'ArrowRight')  movePhoto(1);
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AUDIO PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const audioPanel = document.getElementById('audio-panel');

document.getElementById('audio-open') .addEventListener('click', () => {
  audioPanel.classList.add('open');
  audioPanel.setAttribute('aria-hidden', 'false');
});
document.getElementById('audio-close').addEventListener('click', () => {
  audioPanel.classList.remove('open');
  audioPanel.setAttribute('aria-hidden', 'true');
});

document.getElementById('music-toggle').addEventListener('change', e => {
  audio.musicOn = e.target.checked;
  if (audio.musicGain) {
    const target = audio.musicOn && !audio.paused ? 0.07 : 0;
    audio.musicGain.gain.setTargetAtTime(target, audio.context.currentTime, 0.3);
  }
});

document.getElementById('effects-toggle').addEventListener('change', e => {
  audio.effectsOn = e.target.checked;
});

document.getElementById('volume').addEventListener('input', e => {
  audio.volume = Number(e.target.value);
  if (audio.master) audio.master.gain.value = audio.volume;
});

document.getElementById('audio-playback').addEventListener('click', e => {
  const playing = audio.togglePlayback();
  e.currentTarget.textContent = playing ? 'Pause ambience' : 'Play ambience';
  e.currentTarget.setAttribute('aria-pressed', String(!playing));
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INTERSECTION OBSERVER — chapter reveals
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
document.querySelectorAll('.chapter-illustration img').forEach(image => {
  image.addEventListener('error', () => {
    const illustration = image.closest('.chapter-illustration');
    if (!illustration) return;
    illustration.classList.add('illustration-missing');
    image.hidden = true;
  });
});

/* ── Scroll-based chapter tracker ── */
const chapterEls = document.querySelectorAll('.chapter[data-chapter]');
const scrollObs  = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && storyStarted) {
      const n = parseInt(e.target.dataset.chapter);
      if (n !== currentChapter) {
        currentChapter = n;
        updateProgress(n);
        updateDots(n);
        onChapterEnter(n);
      }
    }
  });
}, { threshold: 0.5 });

chapterEls.forEach(el => scrollObs.observe(el));

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   POINTER PARALLAX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let pointerFrame = null;
document.addEventListener('pointermove', e => {
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    document.documentElement.style.setProperty('--pointer-x', `${x * 10}px`);
    document.documentElement.style.setProperty('--pointer-y', `${y *  6}px`);
    pointerFrame = null;
  });
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOADING SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    ls.classList.add('hidden');
  }, 2200);
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TOUCH SWIPE (mobile chapter nav)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let touchStartY = 0;
document.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  if (!storyStarted || currentChapter < 1) return;
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 60) {
    if (dy > 0 && currentChapter < TOTAL_CHAPTERS) goToChapter(currentChapter + 1);
    if (dy < 0 && currentChapter > 1)              goToChapter(currentChapter - 1);
  }
}, { passive: true });

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   KEYBOARD NAV
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
document.addEventListener('keydown', e => {
  if (!storyStarted) return;
  if (lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    if (currentChapter < TOTAL_CHAPTERS) goToChapter(currentChapter + 1);
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    if (currentChapter > 1) goToChapter(currentChapter - 1);
  }
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   REDUCED MOTION GUARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  stopPetals();
  cancelAnimationFrame(animFrame);
}
