/* ============================================================
   SHAURYAN AEROSPACE — vfx.js
   Cyber Warfare Background Engine
   ============================================================ */

'use strict';

(function CyberVFX() {
    /* ── Canvas Setup ─────────────────────────────────────── */
    const canvas = document.getElementById('cyber-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = document.body.scrollHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); initAll(); });

    /* ── Config ───────────────────────────────────────────── */
    const CFG = {
        // Matrix rain
        RAIN_COLS: Math.floor(window.innerWidth / 18),
        RAIN_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&ΨΩΣΔΠΛΘαβγδεζηθ01110100011000010111010001100001',
        RAIN_SPEED: 0.35,
        RAIN_OPACITY: 0.13,

        // Network nodes
        NODE_COUNT: 55,
        NODE_SPEED: 0.18,
        LINK_DIST: 220,
        NODE_OPACITY: 0.55,

        // Data burst lines
        BURST_INTERVAL: 1400,
        BURST_LIFE: 90,

        // Hex grid
        HEX_SIZE: 38,
        HEX_OPACITY: 0.04,

        // Radar sweep
        RADAR_SPEED: 0.004,

        // NEW: Cyber Warfare Elements
        WARFARE_LEVEL: 0, // 0 to 1 intensity
        ALERT_CHANCE: 0.002, // Chance per frame to trigger alert
        TARGET_CHANCE: 0.005,
        BREACH_CHANCE: 0.008
    };

    /* ════════════════════════════════════════════════════════
       [ 1 ] MATRIX RAIN
    ══════════════════════════════════════════════════════════ */
    let rainDrops = [];

    function initRain() {
        rainDrops = [];
        const cols = Math.floor(canvas.width / 18);
        for (let i = 0; i < cols; i++) {
            rainDrops.push({
                x: i * 18,
                y: Math.random() * canvas.height,
                speed: 0.5 + Math.random() * 1.8,
                opacity: 0.04 + Math.random() * 0.12,
                size: 10 + Math.random() * 4,
                char: '',
                timer: 0,
                interval: 3 + Math.floor(Math.random() * 6),
            });
        }
    }

    function drawRain() {
        rainDrops.forEach(d => {
            d.timer++;
            if (d.timer >= d.interval) {
                d.char = CFG.RAIN_CHARS[Math.floor(Math.random() * CFG.RAIN_CHARS.length)];
                d.timer = 0;
            }

            // Bright head character
            ctx.font = `${d.size}px 'Share Tech Mono', monospace`;
            const rainAlpha = d.opacity * (1 + CFG.WARFARE_LEVEL * 2);
            ctx.fillStyle = `rgba(255,255,255,${rainAlpha * 2.5})`;
            ctx.fillText(d.char, d.x, d.y);

            // Trail glow char
            ctx.fillStyle = `rgba(200,200,200,${rainAlpha * 0.5})`;
            ctx.fillText(d.char, d.x, d.y - d.size * 1.4);

            d.y += d.speed * (1 + CFG.WARFARE_LEVEL * 0.5);
            if (d.y > canvas.height) {
                d.y = -20;
                d.speed = 0.5 + Math.random() * 1.8;
            }
        });
    }

    /* ════════════════════════════════════════════════════════
       [ 2 ] NETWORK NODES
    ══════════════════════════════════════════════════════════ */
    let nodes = [];

    function initNodes() {
        nodes = [];
        for (let i = 0; i < CFG.NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * CFG.NODE_SPEED,
                vy: (Math.random() - 0.5) * CFG.NODE_SPEED,
                r: 1 + Math.random() * 1.8,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.01 + Math.random() * 0.02,
            });
        }
    }

    function drawNodes() {
        // Update positions
        nodes.forEach(n => {
            n.x += n.vx * (1 + CFG.WARFARE_LEVEL);
            n.y += n.vy * (1 + CFG.WARFARE_LEVEL);
            n.pulse += n.pulseSpeed;
            if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
            if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        });

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CFG.LINK_DIST) {
                    const alpha = (1 - dist / CFG.LINK_DIST) * 0.18;
                    // Animated data packet along edge
                    const t = (Date.now() / (1200 - CFG.WARFARE_LEVEL * 600) + i * 0.3) % 1;
                    const px = nodes[i].x + (nodes[j].x - nodes[i].x) * t;
                    const py = nodes[i].y + (nodes[j].y - nodes[i].y) * t;

                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = CFG.WARFARE_LEVEL > 0.5 ? `rgba(255,50,50,${alpha})` : `rgba(255,255,255,${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();

                    // Packet dot
                    ctx.beginPath();
                    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = CFG.WARFARE_LEVEL > 0.5 ? `rgba(255,100,100,${alpha * 3})` : `rgba(255,255,255,${alpha * 3})`;
                    ctx.fill();
                }
            }
        }

        // Draw nodes
        nodes.forEach(n => {
            const pulse = 0.6 + 0.4 * Math.sin(n.pulse);
            const baseAlpha = CFG.NODE_OPACITY * 0.25;

            // Outer glow ring
            const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
            const color = CFG.WARFARE_LEVEL > 0.7 ? '255,50,50' : '255,255,255';
            grad.addColorStop(0, `rgba(${color},${baseAlpha * pulse})`);
            grad.addColorStop(1, `rgba(${color},0)`);
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color},${baseAlpha * 4 * pulse})`;
            ctx.fill();
        });
    }

    /* ════════════════════════════════════════════════════════
       [ 3 ] DATA BURST LINES
    ══════════════════════════════════════════════════════════ */
    let bursts = [];

    function spawnBurst() {
        const y = Math.random() * canvas.height;
        const dir = Math.random() > 0.5 ? 1 : -1;
        const x0 = dir > 0 ? -80 : canvas.width + 80;
        const speed = (6 + Math.random() * 10) * (1 + CFG.WARFARE_LEVEL);
        const segs = 3 + Math.floor(Math.random() * 4);
        const text = Array.from({ length: segs }, () =>
            CFG.RAIN_CHARS.slice(
                Math.floor(Math.random() * 20),
                Math.floor(Math.random() * 20) + 8
            )
        ).join('  ');

        bursts.push({ x: x0, y, speed: speed * dir, life: CFG.BURST_LIFE, maxLife: CFG.BURST_LIFE, text });
    }

    setInterval(() => {
        if (Math.random() < 0.3 || CFG.WARFARE_LEVEL > 0.4) spawnBurst();
    }, CFG.BURST_INTERVAL);

    function drawBursts() {
        bursts = bursts.filter(b => b.life > 0);
        bursts.forEach(b => {
            b.x += b.speed;
            b.life--;
            const progress = b.life / b.maxLife;
            const alpha = Math.min(progress, 1 - progress) * 2 * 0.35;

            ctx.font = '10px "Share Tech Mono", monospace';
            ctx.fillStyle = CFG.WARFARE_LEVEL > 0.8 ? `rgba(255,100,100,${alpha})` : `rgba(255,255,255,${alpha})`;
            ctx.fillText(b.text, b.x, b.y);

            // Leading spark
            ctx.beginPath();
            ctx.arc(b.x + (b.speed > 0 ? b.text.length * 6 : 0), b.y - 3, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${alpha * 2.5})`;
            ctx.fill();
        });
    }

    /* ════════════════════════════════════════════════════════
       [ 4 ] HEX GRID PULSE
    ══════════════════════════════════════════════════════════ */
    let hexPulses = [];

    function hexCorners(cx, cy, r) {
        const pts = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i - 30);
            pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
        }
        return pts;
    }

    function drawHexGrid() {
        const s = CFG.HEX_SIZE;
        const w = s * 2;
        const h = Math.sqrt(3) * s;

        // Only draw visible area hexes for performance if layout is huge
        const startRow = Math.floor(window.scrollY / h);
        const endRow = startRow + Math.ceil(window.innerHeight / h) + 1;

        for (let row = startRow; row < endRow; row++) {
            for (let col = 0; col * w * 0.75 < canvas.width + w; col++) {
                const cx = col * w * 0.75 + s;
                const cy = row * h + (col % 2 === 0 ? 0 : h / 2) + s;

                const corners = hexCorners(cx, cy, s - 1);
                ctx.beginPath();
                corners.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
                ctx.closePath();
                ctx.strokeStyle = `rgba(255,255,255,${CFG.HEX_OPACITY})`;
                ctx.lineWidth = 0.4;
                ctx.stroke();
            }
        }

        hexPulses = hexPulses.filter(p => p.r < 500);
        hexPulses.forEach(p => {
            p.r += 1.5 * (1 + CFG.WARFARE_LEVEL);
            const alpha = Math.max(0, 0.25 * (1 - p.r / 500));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.strokeStyle = CFG.WARFARE_LEVEL > 0.6 ? `rgba(255,50,50,${alpha})` : `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    setInterval(() => {
        hexPulses.push({
            x: Math.random() * canvas.width,
            y: window.scrollY + Math.random() * window.innerHeight,
            r: 0,
        });
    }, 2200 / (1 + CFG.WARFARE_LEVEL));

    /* ════════════════════════════════════════════════════════
       [ 5 ] RADAR SWEEP
    ══════════════════════════════════════════════════════════ */
    let radarAngle = 0;
    const RADAR_R = 300;

    function drawRadar() {
        const cx = canvas.width - 200;
        const cy = window.scrollY + 200;

        radarAngle += CFG.RADAR_SPEED * (1 + CFG.WARFARE_LEVEL);

        [0.25, 0.5, 0.75, 1].forEach(f => {
            ctx.beginPath();
            ctx.arc(cx, cy, RADAR_R * f, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.025)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });

        const endX = cx + Math.cos(radarAngle) * RADAR_R;
        const endY = cy + Math.sin(radarAngle) * RADAR_R;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, RADAR_R, radarAngle - 0.6, radarAngle, false);
        ctx.closePath();

        const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, RADAR_R);
        sweepGrad.addColorStop(0, CFG.WARFARE_LEVEL > 0.5 ? 'rgba(255,50,50,0.08)' : 'rgba(255,255,255,0.06)');
        sweepGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sweepGrad;
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = CFG.WARFARE_LEVEL > 0.5 ? 'rgba(255,50,50,0.2)' : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    /* ════════════════════════════════════════════════════════
       [ 6 ] CYBER WARFARE MODULES (Alerts, Targets, Breeches)
    ══════════════════════════════════════════════════════════ */
    let alerts = [];
    let targets = [];
    let breaches = [];

    function triggerAlert() {
        const msgs = ["SYSTEM COMPROMISED", "WARNING: DATA LEAK", "UNAUTHORIZED ACCESS", "ENCRYPTION FAILED", "PROTOCOL BREACH"];
        alerts.push({
            text: msgs[Math.floor(Math.random() * msgs.length)],
            x: Math.random() * (canvas.width - 200) + 100,
            y: window.scrollY + Math.random() * (window.innerHeight - 100) + 50,
            life: 120,
            alpha: 0
        });
    }

    function spawnTarget() {
        targets.push({
            x: Math.random() * canvas.width,
            y: window.scrollY + Math.random() * window.innerHeight,
            size: 40 + Math.random() * 60,
            life: 180,
            lock: 0 // animation state
        });
    }

    function spawnBreach() {
        breaches.push({
            y: window.scrollY + Math.random() * window.innerHeight,
            x: -200,
            width: 200 + Math.random() * 400,
            speed: 15 + Math.random() * 10,
            text: "INFILTRATING NODE_" + Math.floor(Math.random() * 9999)
        });
    }

    function drawWarfare() {
        // Handle triggers
        if (Math.random() < CFG.ALERT_CHANCE) triggerAlert();
        if (Math.random() < CFG.TARGET_CHANCE) spawnTarget();
        if (Math.random() < CFG.BREACH_CHANCE) spawnBreach();

        // Increase warfare intensity slowly
        CFG.WARFARE_LEVEL = Math.min(1, CFG.WARFARE_LEVEL + 0.0001);

        // Draw Alerts
        alerts.forEach((a, i) => {
            a.life--;
            a.alpha = Math.min(1, a.life / 20) * 0.4;
            ctx.font = 'bold 14px "Share Tech Mono", monospace';
            ctx.fillStyle = `rgba(255,50,50,${a.alpha})`;
            ctx.fillText("! " + a.text, a.x, a.y);
            if (a.life <= 0) alerts.splice(i, 1);
        });

        // Draw Targets
        targets.forEach((t, i) => {
            t.life--;
            t.lock = Math.min(1, t.lock + 0.05);
            const s = t.size * (1.2 - t.lock * 0.2);
            const alpha = Math.min(1, t.life / 30) * 0.3;

            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            if (t.life < 100 && t.life % 10 < 5) ctx.strokeStyle = `rgba(255,50,50,${alpha})`;

            ctx.lineWidth = 1;
            // Draw 4 corners
            const len = s * 0.3;
            ctx.beginPath();
            ctx.moveTo(t.x - s / 2, t.y - s / 2 + len); ctx.lineTo(t.x - s / 2, t.y - s / 2); ctx.lineTo(t.x - s / 2 + len, t.y - s / 2);
            ctx.moveTo(t.x + s / 2, t.y - s / 2 + len); ctx.lineTo(t.x + s / 2, t.y - s / 2); ctx.lineTo(t.x + s / 2 - len, t.y - s / 2);
            ctx.moveTo(t.x - s / 2, t.y + s / 2 - len); ctx.lineTo(t.x - s / 2, t.y + s / 2); ctx.lineTo(t.x - s / 2 + len, t.y + s / 2);
            ctx.moveTo(t.x + s / 2, t.y + s / 2 - len); ctx.lineTo(t.x + s / 2, t.y + s / 2); ctx.lineTo(t.x + s / 2 - len, t.y + s / 2);
            ctx.stroke();

            if (t.life <= 0) targets.splice(i, 1);
        });

        // Draw Breaches
        breaches.forEach((b, i) => {
            b.x += b.speed;
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(b.x, b.y, b.width, 1);
            ctx.font = '9px "Share Tech Mono", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillText(b.text, b.x, b.y - 5);
            if (b.x > canvas.width) breaches.splice(i, 1);
        });
    }

    /* ════════════════════════════════════════════════════════
       [ 7 ] GLITCH FLASHES
    ══════════════════════════════════════════════════════════ */
    let glitchTimer = 0;

    function drawGlitch() {
        glitchTimer++;
        const trigger = 180 / (1 + CFG.WARFARE_LEVEL);
        if (glitchTimer > trigger + Math.random() * 300) {
            const lines = 2 + Math.floor(Math.random() * 10 * CFG.WARFARE_LEVEL);
            for (let i = 0; i < lines; i++) {
                const y = window.scrollY + Math.random() * window.innerHeight;
                const h = 1 + Math.random() * 4;
                const x = Math.random() * canvas.width * 0.5;
                const w = 60 + Math.random() * 500;
                ctx.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.1 * CFG.WARFARE_LEVEL})`;
                ctx.fillRect(x, y, w, h);
            }
            if (Math.random() > 0.8) glitchTimer = 0;
        }
    }

    /* ════════════════════════════════════════════════════════
       INIT ALL
    ══════════════════════════════════════════════════════════ */
    function initAll() {
        initRain();
        initNodes();
    }
    initAll();

    for (let i = 0; i < 4; i++) {
        hexPulses.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 300 });
    }

    /* ════════════════════════════════════════════════════════
       RENDER LOOP
    ══════════════════════════════════════════════════════════ */
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawHexGrid();
        drawRadar();
        drawRain();
        drawNodes();
        drawBursts();
        drawWarfare();
        drawGlitch();

        requestAnimationFrame(render);
    }

    render();

    const resizeObs = new ResizeObserver(() => {
        canvas.height = document.body.scrollHeight;
    });

})();
