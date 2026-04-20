/* ============================================================
   SHAURYAN AEROSPACE — script.js
   POWER . PRECISION . PROTECTION .
   ============================================================ */

'use strict';

/* ── Utility ───────────────────────────────────────────────── */
const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;

/* ═══════════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════════════ */
(function initCursor() {
    const dot = qs('.cursor-dot');
    const ring = qs('.cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function animateCursor() {
        rx = lerp(rx, mx, 0.12);
        ry = lerp(ry, my, 0.12);
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover scale for interactive elements
    const hoverables = 'a, button, .tech-card, .mission-card, .team-card, .stat-block, input, textarea, select';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverables)) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverables)) ring.classList.remove('hover');
    });
})();

/* ═══════════════════════════════════════════════════════════
   FPV INTRO SEQUENCE
══════════════════════════════════════════════════════════════ */
(function initFpvIntro() {
    const overlay = qs('#fpv-overlay');
    const skipBtn = qs('#fpv-skip');
    const video = qs('#war-video');
    if (!overlay) return;

    // Play video
    if (video) {
        video.play().catch(e => console.warn("Autoplay blocked or video missing:", e));
        video.onended = breakOut;
    }

    // Prevent scroll during intro
    document.body.style.overflow = 'hidden';

    /* ── Telemetry counter animations ── */
    const readouts = {
        'fpv-speed': { val: 0, target: 124, unit: ' km/h', step: 3 },
        'fpv-alt': { val: 0, target: 4200, unit: ' m', step: 80 },
        'fpv-heading': { val: 0, target: 247, unit: '°', step: 5 },
        'fpv-signal': { val: 0, target: 98, unit: '%', step: 2 },
    };

    const counters = {};
    for (const id in readouts) {
        counters[id] = qs(`#${id}`);
    }

    let counterInterval = setInterval(() => {
        let allDone = true;
        for (const id in readouts) {
            const r = readouts[id];
            if (r.val < r.target) {
                r.val = Math.min(r.val + r.step, r.target);
                if (counters[id]) counters[id].textContent = r.val + r.unit;
                allDone = false;
            }
        }
        if (allDone) clearInterval(counterInterval);
    }, 40);

    /* ── Speed lines spawn ── */
    const linesContainer = qs('.fpv-lines');
    function spawnLine() {
        if (!linesContainer) return;
        const line = document.createElement('div');
        line.className = 'fpv-line';
        line.style.left = (Math.random() * 100) + '%';
        line.style.animationDelay = (Math.random() * 0.3) + 's';
        line.style.opacity = (Math.random() * 0.6 + 0.2).toString();
        linesContainer.appendChild(line);
        setTimeout(() => line.remove(), 900);
    }
    const lineTimer = setInterval(spawnLine, 120);

    /* ── Status text cycle ── */
    const statusEl = qs('.fpv-status-text');
    const statusMessages = [
        'INITIALIZING SYSTEMS',
        'CALIBRATING SENSORS',
        'GPS LOCK ACQUIRED',
        'AVIONICS ONLINE',
        'ALL SYSTEMS NOMINAL',
        'LAUNCHING...',
    ];
    let statusIdx = 0;
    const statusTimer = setInterval(() => {
        statusIdx++;
        if (statusIdx >= statusMessages.length) {
            clearInterval(statusTimer);
            return;
        }
        if (statusEl) statusEl.textContent = statusMessages[statusIdx];
    }, 800);

    /* ── Break-out transition ── */
    function breakOut() {
        clearInterval(counterInterval);
        clearInterval(lineTimer);
        clearInterval(statusTimer);

        // Glitch flash effect first
        overlay.style.filter = 'brightness(3) contrast(2)';
        setTimeout(() => { overlay.style.filter = ''; }, 80);
        setTimeout(() => { overlay.style.filter = 'brightness(2) invert(0.3)'; }, 160);
        setTimeout(() => { overlay.style.filter = ''; }, 200);

        // Start break animation
        setTimeout(() => {
            overlay.classList.add('breaking');
            overlay.addEventListener('animationend', () => {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
                // Trigger hero entrance
                qsa('.hero-content > *').forEach((el, i) => {
                    el.style.animationDelay = (i * 0.15) + 's';
                    el.style.animationPlayState = 'running';
                });
            }, { once: true });
        }, 300);
    }

    /* ── Auto-launch fallback ── */
    let autoTimer = setTimeout(breakOut, 15000); // Longer timeout if video fails

    /* ── Skip button ── */
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            clearTimeout(autoTimer);
            breakOut();
        });
    }
})();

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════════════ */
(function initNav() {
    const nav = qs('nav');
    const hamburger = qs('.nav-hamburger');
    const mobileMenu = qs('.mobile-menu');
    const navLinks = qsa('.nav-links a, .mobile-menu a[data-section]');
    let menuOpen = false;

    /* Scroll state */
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        /* Active section highlight */
        const sections = qsa('section[id]');
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
        });
        qsa('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
        });
    }, { passive: true });

    /* Hamburger */
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            menuOpen = !menuOpen;
            mobileMenu.classList.toggle('open', menuOpen);
            const spans = qsa('span', hamburger);
            if (menuOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
            } else {
                spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
            }
        });

        qsa('a', mobileMenu).forEach(a => {
            a.addEventListener('click', () => {
                menuOpen = false;
                mobileMenu.classList.remove('open');
                qsa('span', hamburger).forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
            });
        });
    }
})();

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
(function initReveal() {
    const els = qsa('.reveal, .reveal-left, .reveal-right');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const delay = e.target.dataset.delay || 0;
                setTimeout(() => e.target.classList.add('visible'), delay);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    els.forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════════════════════
   STAT COUNTER ANIMATION
══════════════════════════════════════════════════════════════ */
(function initCounters() {
    const counters = qsa('[data-count]');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseInt(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            const dur = 1800;
            const step = dur / 60;
            let current = 0;
            const inc = target / (dur / step);
            const timer = setInterval(() => {
                current += inc;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = Math.floor(current).toLocaleString() + suffix;
            }, step);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
})();

/* ═══════════════════════════════════════════════════════════
   TICKER — duplicate for seamless loop
══════════════════════════════════════════════════════════════ */
(function initTicker() {
    const ticker = qs('.stats-ticker');
    if (!ticker) return;
    const original = ticker.innerHTML;
    ticker.innerHTML = original + original; // seamless loop
})();

/* ═══════════════════════════════════════════════════════════
   PARALLAX — hero grid
══════════════════════════════════════════════════════════════ */
(function initParallax() {
    const hero = qs('#hero');
    if (!hero) return;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        hero.style.backgroundPositionY = (y * 0.3) + 'px';
    }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════
   FORM SUBMIT (demo)
══════════════════════════════════════════════════════════════ */
(function initForm() {
    const form = qs('#contact-form');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = qs('.form-submit', form);
        const original = btn.textContent;
        btn.textContent = 'TRANSMISSION SENT ✓';
        btn.style.background = '#1a1a1a';
        btn.style.color = '#fff';
        setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
            btn.style.color = '';
            form.reset();
        }, 3000);
    });
})();

/* ═══════════════════════════════════════════════════════════
   STAGGER REVEAL DELAYS
══════════════════════════════════════════════════════════════ */
(function setDelays() {
    qsa('[data-stagger]').forEach(parent => {
        const children = qsa(':scope > *', parent);
        children.forEach((child, i) => {
            child.classList.add('reveal');
            child.dataset.delay = i * 100;
        });
    });
})();
