document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // STATE
  // ==========================================
  const state = {
    isMuted: true,
    activeSpecialSlide: 0,
    activeMemorySlide: 0,
    vgPage: 0
  };

  // ==========================================
  // NULL-SAFE LISTENER HELPER
  // ==========================================
  const safeOn = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };

  // ==========================================
  // ELEMENTS
  // ==========================================
  const birthdayMusic       = document.getElementById('birthday-music');
  const introVideo          = document.getElementById('intro-video');
  const screenEnter         = document.getElementById('screen-enter');
  const introVideoContainer = document.getElementById('intro-video-container');
  const introCssFallback    = document.getElementById('intro-css-fallback');
  const screenSurprises     = document.getElementById('screen-surprises');
  const screenMain          = document.getElementById('screen-main');
  const btnAudioToggle      = document.getElementById('btn-audio-toggle');

  // ==========================================
  // HERO VIDEO PLAYLIST (crossfade between 4 videos)
  // ==========================================
  const heroVideoSrcs = [
    './videos/hero1.mp4',
    './videos/hero2.mp4',
    './videos/hero3.mp4',
    './videos/hero4.mp4'
  ];

  let heroIdx       = 0;  // which src index is currently active
  let heroActiveEl  = 0;  // which element (0=A, 1=B) is visible
  const heroEls     = [
    document.getElementById('hero-video-a'),
    document.getElementById('hero-video-b')
  ];

  function initHeroPlaylist() {
    if (!heroEls[0] || !heroEls[1]) return;

    // Load first two videos
    heroEls[0].src  = heroVideoSrcs[0];
    heroEls[1].src  = heroVideoSrcs[1 % heroVideoSrcs.length];
    heroEls[0].muted = true;
    heroEls[1].muted = true;

    // Make A visible immediately
    heroEls[0].classList.add('hero-vid-active');

    // Both listen for end to advance
    heroEls[0].addEventListener('ended', advanceHero);
    heroEls[1].addEventListener('ended', advanceHero);

    heroEls[0].play().catch(() => {});
  }

  function advanceHero() {
    heroIdx              = (heroIdx + 1) % heroVideoSrcs.length;
    const nextEl         = 1 - heroActiveEl;
    const preloadIdx     = (heroIdx + 1) % heroVideoSrcs.length;

    // Crossfade: show next, hide current
    heroEls[nextEl].classList.add('hero-vid-active');
    heroEls[heroActiveEl].classList.remove('hero-vid-active');
    heroEls[nextEl].play().catch(() => {});

    heroActiveEl = nextEl;

    // Preload the video after next into the now-idle element
    setTimeout(() => {
      const idleEl       = 1 - heroActiveEl;
      heroEls[idleEl].src = heroVideoSrcs[preloadIdx];
      heroEls[idleEl].load();
    }, 1200);
  }

  function heroSetMuted(m)  { heroEls.forEach(v => { if (v) v.muted = m; }); }
  function heroPause()      { heroEls.forEach(v => { if (v) v.pause(); }); }
  function heroPlay()       { const a = heroEls[heroActiveEl]; if (a) a.play().catch(() => {}); }

  // ==========================================
  // SCREEN 1 — FLOATING HEARTS
  // ==========================================
  const heartsContainer = document.getElementById('hearts-container');
  if (heartsContainer) {
    const symbols = ['❤️', '💖', '✨', '🌸', '🌹'];
    for (let i = 0; i < 25; i++) {
      const heart             = document.createElement('div');
      heart.className         = 'heart-particle';
      heart.textContent       = symbols[Math.floor(Math.random() * symbols.length)];
      heart.style.left        = `${Math.random() * 100}vw`;
      heart.style.fontSize    = `${Math.random() * 20 + 12}px`;
      heart.style.animationDelay    = `${Math.random() * 5}s`;
      heart.style.animationDuration = `${Math.random() * 4 + 4}s`;
      heartsContainer.appendChild(heart);
    }
  }

  // ==========================================
  // INTRO VIDEO FLOW
  // ==========================================
  const btnEnterSite = document.getElementById('btn-enter-site');
  const btnSkipIntro = document.getElementById('btn-skip-intro');

  if (btnEnterSite) {
    btnEnterSite.addEventListener('click', () => {
      screenEnter.classList.add('hidden');
      screenEnter.classList.remove('active');
      introVideoContainer.classList.remove('hidden');

      introVideo.muted = false;
      const playP      = introVideo.play();
      const fallback   = setTimeout(() => { if (introVideo.paused) triggerIntroFallback(); }, 3500);

      if (playP !== undefined) {
        playP.then(() => clearTimeout(fallback))
             .catch(err => { console.warn('Intro autoplay blocked:', err); clearTimeout(fallback); triggerIntroFallback(); });
      }

      introVideo.addEventListener('ended', transitionToSurprises, { once: true });
      introVideo.addEventListener('error', () => { clearTimeout(fallback); triggerIntroFallback(); }, { once: true });
    });
  }

  if (btnSkipIntro) btnSkipIntro.addEventListener('click', () => { introVideo.pause(); transitionToSurprises(); });

  function triggerIntroFallback() {
    introVideo.style.display = 'none';
    if (introCssFallback) introCssFallback.classList.remove('hidden-fallback');
    setTimeout(transitionToSurprises, 3500);
  }

  function transitionToSurprises() {
    introVideoContainer.classList.add('hidden');
    screenSurprises.classList.remove('hidden');
    screenSurprises.classList.add('active');
  }

  // ==========================================
  // SCREEN 2 — SURPRISE SELECTION
  // ==========================================
  const cardCake    = document.getElementById('card-cake');
  const cardAngela  = document.getElementById('card-angela');
  const cardLetter  = document.getElementById('card-letter');
  const cardSpecial = document.getElementById('card-special');

  const overlayCake    = document.getElementById('overlay-cake');
  const overlayLetter  = document.getElementById('overlay-letter');
  const overlaySpecial = document.getElementById('overlay-special');

  const openOverlay  = o => { if (o) o.classList.remove('hidden-overlay'); };
  const closeOverlay = o => { if (o) o.classList.add('hidden-overlay');    };
  const resetEnvelope = () => {
    const env  = document.getElementById('envelope');
    const wrap = document.querySelector('.envelope-wrapper');
    if (env)  env.classList.remove('open');
    if (wrap) wrap.classList.remove('expanded');
  };

  safeOn('btn-close-cake', () => closeOverlay(overlayCake));
  safeOn('btn-close-letter', () => { closeOverlay(overlayLetter); resetEnvelope(); });
  safeOn('btn-close-special', () => closeOverlay(overlaySpecial));

  // 1. Birthday Cake
  if (cardCake) {
    cardCake.addEventListener('click', () => {
      openOverlay(overlayCake);
      const flame = document.getElementById('candle-flame');
      const glow  = document.getElementById('candle-glow');
      const text  = document.getElementById('cake-celebration-text');
      const btn   = document.getElementById('btn-cut-cake');
      if (flame) flame.style.display = 'block';
      if (glow)  glow.style.display  = 'block';
      if (text)  text.classList.add('hidden-text');
      if (btn)   btn.style.display   = 'inline-flex';
    });
  }

  const btnCutCake = document.getElementById('btn-cut-cake');
  if (btnCutCake) {
    btnCutCake.addEventListener('click', () => {
      const flame = document.getElementById('candle-flame');
      const glow  = document.getElementById('candle-glow');
      const text  = document.getElementById('cake-celebration-text');
      if (flame) flame.style.display = 'none';
      if (glow)  glow.style.display  = 'none';
      btnCutCake.style.display = 'none';
      if (text) text.classList.remove('hidden-text');
      startConfetti();
    });
  }

  // Confetti
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx    = confettiCanvas ? confettiCanvas.getContext('2d') : null;

  function startConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    confettiCanvas.width  = confettiCanvas.parentElement.clientWidth;
    confettiCanvas.height = confettiCanvas.parentElement.clientHeight;
    const colors = ['#e50914','#ffffff','#ffc3a0','#00c6ff','#11998e','#f5af19'];
    const parts  = Array.from({ length: 80 }, () => ({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 6 + 4, d: Math.random() * confettiCanvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5, tia: Math.random() * 0.07 + 0.02, ta: 0
    }));
    let active = true;
    const draw = () => {
      if (!active) return;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      parts.forEach((p, i) => {
        p.ta += p.tia;
        p.y  += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x  += Math.sin(p.ta);
        p.tilt = Math.sin(p.ta - i / 3) * 15;
        if (p.y > confettiCanvas.height) { p.y = -20; p.x = Math.random() * confettiCanvas.width; }
        confettiCtx.beginPath();
        confettiCtx.lineWidth = p.r;
        confettiCtx.strokeStyle = p.color;
        confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        confettiCtx.stroke();
      });
      requestAnimationFrame(draw);
    };
    draw();
    setTimeout(() => { active = false; confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); }, 5500);
  }

  // 2. Letter
  if (cardLetter) cardLetter.addEventListener('click', () => openOverlay(overlayLetter));
  safeOn('btn-open-envelope', () => {
    const env  = document.getElementById('envelope');
    const wrap = document.querySelector('.envelope-wrapper');
    if (env)  env.classList.add('open');
    if (wrap) wrap.classList.add('expanded');
  });

  // 3. Why Special
  if (cardSpecial) {
    cardSpecial.addEventListener('click', () => {
      state.activeSpecialSlide = 0;
      updateSpecialSlide();
      openOverlay(overlaySpecial);
    });
  }
  const specialSlides  = document.querySelectorAll('.special-slide');
  const slideIndicator = document.getElementById('slide-indicator');
  function updateSpecialSlide() {
    specialSlides.forEach((s, i) => s.classList.toggle('active-slide', i === state.activeSpecialSlide));
    if (slideIndicator) slideIndicator.textContent = `${state.activeSpecialSlide + 1} / ${specialSlides.length}`;
  }
  safeOn('btn-next-slide', () => { state.activeSpecialSlide = (state.activeSpecialSlide + 1) % specialSlides.length; updateSpecialSlide(); });
  safeOn('btn-prev-slide', () => { state.activeSpecialSlide = (state.activeSpecialSlide - 1 + specialSlides.length) % specialSlides.length; updateSpecialSlide(); });

  // ==========================================
  // MAIN BIRTHDAY SCREEN — ANGELA CARD
  // ==========================================
  if (cardAngela) {
    cardAngela.addEventListener('click', () => {
      screenSurprises.classList.add('hidden');
      screenSurprises.classList.remove('active');
      screenMain.classList.remove('hidden');
      screenMain.classList.add('active');
      if (btnAudioToggle) btnAudioToggle.classList.remove('hidden');

      // Audio
      state.isMuted = false;
      if (birthdayMusic) { birthdayMusic.muted = false; birthdayMusic.play().catch(() => {}); }

      // Hero playlist
      initHeroPlaylist();
      heroSetMuted(false);
      updateAudioButtonUI();

      // Cinematic title reveal
      document.querySelectorAll('.cinematic-title span').forEach(s => {
        s.style.animation = 'none';
        s.offsetHeight;
        s.style.animation = '';
      });

      // Build sections after short delay
      setTimeout(buildTimeline,    200);
      setTimeout(initTimelineObserver, 400);
      setTimeout(buildVideoGallery, 300);
    });
  }

  // Go Back
  safeOn('btn-back-to-surprises', () => {
    screenMain.classList.add('hidden');
    screenMain.classList.remove('active');
    if (btnAudioToggle) btnAudioToggle.classList.add('hidden');
    screenSurprises.classList.remove('hidden');
    screenSurprises.classList.add('active');
    if (birthdayMusic) birthdayMusic.pause();
    heroPause();
    pauseAllGalleryVideos();
  });

  // Audio toggle
  function updateAudioButtonUI() {
    const icon = btnAudioToggle ? btnAudioToggle.querySelector('.audio-icon') : null;
    if (icon) icon.textContent = state.isMuted ? '🔇' : '🔊';
  }
  if (btnAudioToggle) {
    btnAudioToggle.addEventListener('click', () => {
      state.isMuted = !state.isMuted;
      if (birthdayMusic) birthdayMusic.muted = state.isMuted;
      heroSetMuted(state.isMuted);
      if (state.isMuted) {
        if (birthdayMusic) birthdayMusic.pause();
        heroPause();
      } else {
        if (birthdayMusic) birthdayMusic.play().catch(() => {});
        heroPlay();
      }
      // Also update gallery videos
      document.querySelectorAll('.vg-video').forEach((v, i) => {
        const vis   = getVGVisible();
        const start = state.vgPage * vis;
        const end   = start + vis;
        if (i >= start && i < end) {
          v.muted = state.isMuted;
          if (!state.isMuted) v.play().catch(() => {});
          else v.pause();
        }
      });
      updateAudioButtonUI();
    });
  }

  // ==========================================
  // PLAY MEMORIES SLIDER
  // ==========================================
  const overlayMemories = document.getElementById('overlay-memories');
  const memorySlides    = document.querySelectorAll('.memory-slide');
  const memoryIndicator = document.getElementById('memory-indicator');
  function updateMemorySlide() {
    memorySlides.forEach((s, i) => s.classList.toggle('active-slide', i === state.activeMemorySlide));
    if (memoryIndicator) memoryIndicator.textContent = `${state.activeMemorySlide + 1} / ${memorySlides.length}`;
  }
  safeOn('btn-play-memories', () => { state.activeMemorySlide = 0; updateMemorySlide(); openOverlay(overlayMemories); });
  safeOn('btn-close-memories', () => closeOverlay(overlayMemories));
  safeOn('btn-next-memory', () => { state.activeMemorySlide = (state.activeMemorySlide + 1) % memorySlides.length; updateMemorySlide(); });
  safeOn('btn-prev-memory', () => { state.activeMemorySlide = (state.activeMemorySlide - 1 + memorySlides.length) % memorySlides.length; updateMemorySlide(); });

  // ==========================================
  // MORE INFO + SECRET
  // ==========================================
  const modalInfo     = document.getElementById('modal-info');
  const overlaySecret = document.getElementById('overlay-secret');
  safeOn('btn-more-info',          () => openOverlay(modalInfo));
  safeOn('btn-close-info',         () => closeOverlay(modalInfo));
  safeOn('btn-floating-secret',    () => openOverlay(overlaySecret));
  safeOn('btn-close-secret',       () => closeOverlay(overlaySecret));

  // ==========================================
  // OUR JOURNEY TIMELINE DATA (20 milestones)
  // ==========================================
  const journeyMilestones = [
    { id:1,  title:'The First Hello',           date:'12 March 2022',    emoji:'🌸', image:'./timeline/1.jpg',  description:'Two strangers, one moment that changed everything. Neither of us knew that a simple hello would be the first word of our favourite story.' },
    { id:2,  title:'Our First Coffee Together', date:'20 March 2022',    emoji:'☕', image:'./timeline/2.jpg',  description:'Hours turned into minutes when we were together. That little café became sacred ground — the place where we first truly laughed.' },
    { id:3,  title:'The Late Night Call',       date:'5 April 2022',     emoji:'🌙', image:'./timeline/3.jpg',  description:'We talked until 3am and forgot the time entirely. That night, I realised talking to you was my favourite thing in the world.' },
    { id:4,  title:'Dancing in the Rain',       date:'18 April 2022',    emoji:'🎵', image:'./timeline/4.jpg',  description:'The skies opened and instead of running, we danced. Soaked and laughing, we made magic out of an ordinary Tuesday.' },
    { id:5,  title:'The Beach at Sunset',       date:'1 May 2022',       emoji:'🌊', image:'./timeline/5.jpg',  description:'Sitting at the edge of the world as the sun melted into the sea. You said something beautiful. I never forgot it.' },
    { id:6,  title:'Picnic in the Park',        date:'15 May 2022',      emoji:'🧺', image:'./timeline/6.jpg',  description:'Sandwiches, lemonade, and you — the most perfect afternoon I can remember. Every bite tasted better with your laughter nearby.' },
    { id:7,  title:'Movie Night Marathons',     date:'30 May 2022',      emoji:'🍿', image:'./timeline/7.jpg',  description:'We argued about which film to watch and fell asleep through all of them. Best movie nights ever — zero movies actually watched.' },
    { id:8,  title:'Autumn Walk Together',      date:'10 October 2022',  emoji:'🍂', image:'./timeline/8.jpg',  description:'Crunching leaves underfoot, warm scarves, and your hand in mine. Some moments feel like they were designed just for us.' },
    { id:9,  title:'Our First Road Trip',       date:'25 October 2022',  emoji:'🚗', image:'./timeline/9.jpg',  description:'We got lost twice, found a hidden café once, and sang every song on the radio. Probably the best wrong turn we ever made.' },
    { id:10, title:'First Birthday Together',   date:'15 November 2022', emoji:'🎂', image:'./timeline/10.jpg', description:`You baked a lopsided cake and it was the most perfect thing I've ever tasted. Your smile that day — I keep it in my heart always.` },
    { id:11, title:'Christmas Eve Magic',       date:'24 December 2022', emoji:'🎄', image:'./timeline/11.jpg', description:'Warm lights, hot chocolate, and the kind of evening that feels like a scene from a beautiful film. You made it feel like a dream.' },
    { id:12, title:"New Year's Together",       date:'1 January 2023',   emoji:'🎆', image:'./timeline/12.jpg', description:'As the fireworks lit up the sky, I made a secret wish — that every new year begins exactly like this one. With you.' },
    { id:13, title:'Spontaneous Cooking Night', date:'14 February 2023', emoji:'🍝', image:'./timeline/13.jpg', description:'We tried to cook pasta from scratch. It was a disaster. We ordered pizza in the end and laughed the whole night. Perfection.' },
    { id:14, title:'Stargazing Night',          date:'20 March 2023',    emoji:'⭐', image:'./timeline/14.jpg', description:`Lying on a blanket beneath a million stars, you pointed at the sky and said "That one's mine." I said, "Then you already have the brightest one."` },
    { id:15, title:'The Concert',               date:'8 April 2023',     emoji:'🎶', image:'./timeline/15.jpg', description:'You sang every word of every song. Watching you lose yourself in the music was better than the music itself. You were the show.' },
    { id:16, title:'Rainy Day at Home',         date:'3 June 2023',      emoji:'🌧️', image:'./timeline/16.jpg', description:'No plans, nowhere to be, just you and a rainy window. Some of the best days look like nothing on paper and everything in memory.' },
    { id:17, title:'Our Favourite Restaurant',  date:'20 August 2023',   emoji:'🍽️', image:'./timeline/17.jpg', description:'We went back to the place we had our first real dinner. Same booth, same menu — but everything felt richer this time. Because we were more us.' },
    { id:18, title:'The Surprise I Planned',    date:'10 October 2023',  emoji:'🎁', image:'./timeline/18.jpg', description:'I had been planning it for weeks. The look on your face when you walked in made every second worth it ten times over.' },
    { id:19, title:'Sunrise at the Hill',       date:'1 January 2024',   emoji:'🌅', image:'./timeline/19.jpg', description:'We woke up early and climbed to watch the first light of the new year. Cold air, warm coffee, and you beside me. What a way to begin.' },
    { id:20, title:'Today — Your Birthday ❤️', date:'Right Now',        emoji:'🎉', image:'./timeline/20.jpg', description:`Every moment on this road has led to today. Happy Birthday, Angela. You are the most beautiful chapter of my life — and we're only just getting started.` }
  ];

  // ==========================================
  // VIDEO MEMORIES GALLERY DATA (10 videos)
  // ==========================================
  const videoMemories = [
    { title: 'First Meeting',      video: './videos/video1.mp4'  },
    { title: 'Coffee Date',        video: './videos/video2.mp4'  },
    { title: 'The Walk',           video: './videos/video3.mp4'  },
    { title: 'Beach Sunset',       video: './videos/video4.mp4'  },
    { title: 'Movie Night',        video: './videos/video5.mp4'  },
    { title: 'Autumn Together',    video: './videos/video6.mp4'  },
    { title: 'Our Road Trip',      video: './videos/video7.mp4'  },
    { title: 'Birthday Surprise',  video: './videos/video8.mp4'  },
    { title: 'Christmas Eve',      video: './videos/video9.mp4'  },
    { title: 'Today & Always',     video: './videos/video10.mp4' }
  ];

  function getVGVisible() {
    if (window.innerWidth <= 640)  return 1;
    if (window.innerWidth <= 1024) return 3;
    return 5;
  }

  let vgBuilt = false;

  function buildVideoGallery() {
    if (vgBuilt) return;
    const track = document.getElementById('vg-track');
    if (!track) return;
    vgBuilt = true;

    // Build 10 video cards
    videoMemories.forEach(mem => {
      const card = document.createElement('div');
      card.className = 'vg-card';

      const vid         = document.createElement('video');
      vid.className     = 'vg-video';
      vid.src           = mem.video;
      vid.playsInline   = true;
      vid.loop          = true;
      vid.muted         = true;
      vid.preload       = 'metadata';

      const overlay     = document.createElement('div');
      overlay.className = 'vg-card-overlay';
      overlay.innerHTML = `<span class="vg-card-title">${mem.title}</span>`;

      const fallback     = document.createElement('div');
      fallback.className = 'vg-card-fallback';
      fallback.innerHTML = `<span>🎬</span><p>${mem.title}</p>`;

      card.appendChild(vid);
      card.appendChild(overlay);
      card.appendChild(fallback);
      track.appendChild(card);
    });

    setVGCardWidths();
    buildVGDots();
    updateVGDots();
    updateVGNav();
    playVisibleVGVideos();

    // Navigation
    safeOn('vg-prev', () => slideVG(-1));
    safeOn('vg-next', () => slideVG(1));

    // Resize: reset to page 0 and recalculate
    window.addEventListener('resize', () => {
      state.vgPage = 0;
      setVGCardWidths();
      if (typeof gsap !== 'undefined') gsap.set('#vg-track', { x: 0 });
      else { const t = document.getElementById('vg-track'); if (t) t.style.transform = 'translateX(0)'; }
      buildVGDots();
      updateVGDots();
      updateVGNav();
      playVisibleVGVideos();
    });
  }

  function setVGCardWidths() {
    const viewport = document.getElementById('vg-viewport');
    const track    = document.getElementById('vg-track');
    if (!viewport || !track) return;
    const vis   = getVGVisible();
    const gap   = 16;
    const cardW = (viewport.offsetWidth - gap * (vis - 1)) / vis;
    track.querySelectorAll('.vg-card').forEach(c => {
      c.style.width    = cardW + 'px';
      c.style.minWidth = cardW + 'px';
    });
  }

  function slideVG(dir) {
    const vis        = getVGVisible();
    const totalPages = Math.ceil(videoMemories.length / vis);
    const newPage    = state.vgPage + dir;

    // Don't wrap — clamp to bounds
    if (newPage < 0 || newPage >= totalPages) return;
    state.vgPage = newPage;

    const card = document.querySelector('.vg-card');
    if (!card) return;
    const gap    = 16;
    const slideW = (card.offsetWidth + gap) * vis;
    const offset = -(state.vgPage * slideW);

    pauseAllGalleryVideos();

    if (typeof gsap !== 'undefined') {
      gsap.to('#vg-track', {
        x: offset,
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: () => { playVisibleVGVideos(); updateVGDots(); updateVGNav(); }
      });
    } else {
      const t = document.getElementById('vg-track');
      if (t) { t.style.transition = 'transform 0.65s cubic-bezier(0.87,0,0.13,1)'; t.style.transform = `translateX(${offset}px)`; }
      setTimeout(() => { playVisibleVGVideos(); updateVGDots(); updateVGNav(); }, 680);
    }
  }

  function playVisibleVGVideos() {
    const videos = document.querySelectorAll('.vg-video');
    const vis    = getVGVisible();
    const start  = state.vgPage * vis;
    const end    = start + vis;
    videos.forEach((v, i) => {
      if (i >= start && i < end) {
        v.muted = state.isMuted;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }

  function pauseAllGalleryVideos() {
    document.querySelectorAll('.vg-video').forEach(v => v.pause());
  }

  function buildVGDots() {
    const dotsEl = document.getElementById('vg-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const vis   = getVGVisible();
    const total = Math.ceil(videoMemories.length / vis);
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'vg-dot';
      dot.setAttribute('aria-label', `Page ${i + 1}`);
      dot.addEventListener('click', () => {
        const diff = i - state.vgPage;
        if (diff !== 0) slideVG(diff);
      });
      dotsEl.appendChild(dot);
    }
  }

  function updateVGDots() {
    document.querySelectorAll('.vg-dot').forEach((d, i) => d.classList.toggle('vg-dot-active', i === state.vgPage));
  }

  function updateVGNav() {
    const vis        = getVGVisible();
    const totalPages = Math.ceil(videoMemories.length / vis);
    const prev       = document.getElementById('vg-prev');
    const next       = document.getElementById('vg-next');
    if (prev) { prev.style.opacity = state.vgPage === 0 ? '0.3' : '1'; prev.style.pointerEvents = state.vgPage === 0 ? 'none' : 'auto'; }
    if (next) { next.style.opacity = state.vgPage >= totalPages - 1 ? '0.3' : '1'; next.style.pointerEvents = state.vgPage >= totalPages - 1 ? 'none' : 'auto'; }
  }

  // ==========================================
  // JOURNEY TIMELINE
  // ==========================================
  function buildTimeline() {
    const container = document.getElementById('journey-timeline');
    if (!container || container.children.length > 0) return;

    journeyMilestones.forEach((m, index) => {
      const side = index % 2 === 0 ? 'left' : 'right';
      const item = document.createElement('div');
      item.className = `timeline-item timeline-${side} timeline-hidden`;
      item.innerHTML = `
        <div class="timeline-node">
          <div class="timeline-dot"><span class="timeline-dot-number">${m.id}</span></div>
        </div>
        <div class="timeline-card">
          <div class="timeline-thumb-wrap">
            <img class="timeline-thumb" src="${m.image}" alt="${m.title}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="timeline-thumb-fallback">${m.emoji}</div>
          </div>
          <div class="timeline-card-body">
            <span class="timeline-date">${m.date}</span>
            <h3 class="timeline-card-title">${m.title}</h3>
            <p class="timeline-card-desc">${m.description.substring(0, 90)}…</p>
            <button class="timeline-read-more">Read More ❤️</button>
          </div>
        </div>`;
      container.appendChild(item);
      item.querySelector('.timeline-read-more').addEventListener('click', () => openJourneyModal(m));
      item.querySelector('.timeline-thumb-wrap').addEventListener('click', () => openJourneyModal(m));
    });
  }

  function initTimelineObserver() {
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.remove('timeline-hidden');
          e.target.classList.add('timeline-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(i => obs.observe(i));
  }

  // Journey modal
  const journeyModal = document.getElementById('journey-modal');
  const jmImg   = document.getElementById('jm-img');
  const jmEmoji = document.getElementById('jm-emoji');
  const jmDate  = document.getElementById('jm-date');
  const jmTitle = document.getElementById('jm-title');
  const jmDesc  = document.getElementById('jm-desc');

  function openJourneyModal(m) {
    if (jmImg)   { jmImg.style.display = 'block'; jmImg.src = m.image; jmImg.alt = m.title; }
    if (jmEmoji) { jmEmoji.style.display = 'none'; jmEmoji.textContent = m.emoji; }
    if (jmImg)   { jmImg.onerror = () => { jmImg.style.display = 'none'; if (jmEmoji) jmEmoji.style.display = 'flex'; }; }
    if (jmDate)  jmDate.textContent  = m.date;
    if (jmTitle) jmTitle.textContent = m.title;
    if (jmDesc)  jmDesc.textContent  = m.description;
    openOverlay(journeyModal);
  }

  safeOn('btn-close-journey-modal', () => closeOverlay(journeyModal));

  // ==========================================
  // GLOBAL OVERLAY CLOSE — backdrop & Escape
  // ==========================================
  const allOverlays = [overlayCake, overlayLetter, overlaySpecial, overlayMemories, modalInfo, overlaySecret, journeyModal];

  window.addEventListener('click',   e => { if (e.target.classList.contains('modal-overlay')) { allOverlays.forEach(closeOverlay); resetEnvelope(); } });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') { allOverlays.forEach(closeOverlay); resetEnvelope(); } });

});
