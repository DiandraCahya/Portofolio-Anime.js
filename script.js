// --- 0. FAIL-SAFE (Intro Overlay) ---
setTimeout(() => {
    const overlay = document.getElementById('intro-overlay');
    if (overlay && overlay.style.display !== 'none') {
        overlay.style.opacity = 0;
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
        document.body.style.overflowY = 'auto';
    }
}, 4000);

// --- CORE VARIABLES ---
const customThumb = document.getElementById('custom-thumb');
const scrollFloat = document.getElementById('scroll-float');
const canvas = document.getElementById('dynamic-bg');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('modal');

let isModalOpen = false;
let width, height;
let mx = 0,
    my = 0; // Mouse smooth coordinates
let targetMx = 0,
    targetMy = 0;

let scaleFactor = 1;

// Deteksi Mobile
let isMobile = window.innerWidth < 768;
let numParticles = isMobile ? 300 : 800;

// --- PARTICLE SYSTEM ---
const particles = [];

function initParticles() {
    particles.length = 0;
    // Sedikit kurangi jumlah partikel di HP agar performa tetap ngebut meski ukuran besar
    numParticles = window.innerWidth < 768 ? 180 : 600;

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: (Math.random() - 0.5) * window.innerWidth,
            y: (Math.random() - 0.5) * window.innerHeight,
            z: (Math.random() - 0.5) * 1000,
            tx: 0,
            ty: 0,
            tz: 0,
            offset: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.05 + 0.01
        });
    }
}

// --- RESIZE HANDLER ---
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    isMobile = width < 768;

    // UPDATE: Base scale factor sedikit diperbesar
    scaleFactor = Math.min(width, height) / 800;

    initParticles();
}
window.addEventListener('resize', resize);
resize();

// --- SCROLLBAR LOGIC ---
let scrollPercent = 0;

function updateCustomScroll() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollPercent = window.scrollY / totalHeight;
    if (totalHeight <= 0) scrollPercent = 0;

    const trackHeight = window.innerHeight - 100;
    const thumbPosition = scrollPercent * trackHeight;
    if (customThumb) customThumb.style.transform = `translateY(${thumbPosition}px)`;
    if (scrollFloat) {
        scrollFloat.style.transform = `translateY(${thumbPosition + 40}px)`;
        scrollFloat.innerText = `${Math.min(100, Math.max(0, Math.round(scrollPercent * 100)))}%`;
    }
}
window.addEventListener('scroll', updateCustomScroll);

// --- MOUSE TRACKING ---
window.addEventListener('mousemove', (e) => {
    targetMx = (e.clientX / width) * 2 - 1;
    targetMy = (e.clientY / height) * 2 - 1;

    const dot = document.querySelector('.cursor-dot');
    const circle = document.querySelector('.cursor-circle');
    if (dot && circle) {
        dot.style.cssText = `top:${e.clientY}px; left:${e.clientX}px`;
        circle.animate({
            top: `${e.clientY}px`,
            left: `${e.clientX}px`
        }, {
            duration: 500,
            fill: "forwards"
        });
    }
});

// --- 3D FORMULAS (UPSCALED) ---
function getTargetPosition(i, type, time) {
    const p = particles[i];
    const ratio = i / numParticles;
    let x, y, z;

    if (type === 'sphere') {
        // HERO: BOLA (Diperbesar Radiusnya)
        // Radius: 250 -> 350
        const r = 350 * scaleFactor;
        const theta = ratio * Math.PI * 2 * 20;
        const phi = Math.acos(2 * ratio - 1);
        x = r * Math.sin(phi) * Math.cos(theta + time * 0.1);
        y = r * Math.sin(phi) * Math.sin(theta + time * 0.1);
        z = r * Math.cos(phi);
    } else if (type === 'terrain') {
        // ARCHITECT: LANTAI (Lebih Lebar & Gelombang lebih tinggi)
        const size = width * 2.5; // Lebar x2.5 layar
        const gridX = (i % 20) / 20 * size - size / 2;
        const gridZ = Math.floor(i / 20) / (numParticles / 20) * size - size / 2;
        x = gridX;
        // Amplitude: 50 -> 90
        y = Math.sin((gridX + time * 100) * 0.01) * 90 + (250 * scaleFactor);
        z = gridZ + (time * 100 % 1000) - 500;
        if (z > 500) z -= 2000;
    } else if (type === 'helix') {
        // SKILLS: DNA HELIX (Lebih Gemuk & Tinggi)
        const r = 320 * scaleFactor; // Radius: 200 -> 320
        const h = 1100 * scaleFactor; // Tinggi helix
        const theta = ratio * Math.PI * 2 * 5 + time;
        x = r * Math.cos(theta);
        y = (ratio - 0.5) * h * 1.5;
        z = r * Math.sin(theta);
        if (i % 2 === 0) x *= -1;
    } else if (type === 'network') {
        // PROJECTS: NETWORK (Spread lebih luas)
        const spread = 1200 * scaleFactor; // Spread: 800 -> 1200
        x = Math.cos(p.offset) * spread + Math.sin(time * 0.2) * 100;
        y = Math.sin(p.offset * 2) * spread * 0.6;
        z = Math.sin(p.offset * 3) * spread;
    } else if (type === 'warp') {
        // FOOTER: WARP
        const spread = 2500 * scaleFactor;
        x = (Math.random() - 0.5) * spread * 2;
        y = (Math.random() - 0.5) * spread * 2;
        z = 1000;
    }

    return {
        x,
        y,
        z
    };
}

// --- MAIN RENDER LOOP ---
let time = 0;

function animate() {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    time += 0.02;

    mx += (targetMx - mx) * 0.05;
    my += (targetMy - my) * 0.05;

    let stage = scrollPercent * 4;
    let index = Math.floor(stage);
    let progress = stage - index;

    if (index < 0) index = 0;
    if (index > 3) {
        index = 3;
        progress = 1;
    }

    const scenes = ['sphere', 'terrain', 'helix', 'network', 'warp'];
    const currentScene = scenes[index];
    const nextScene = scenes[index + 1] || 'warp';

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(235, 77, 75, 0.3)';

    for (let i = 0; i < numParticles; i++) {
        let p = particles[i];

        let pos1 = getTargetPosition(i, currentScene, time);
        let pos2 = getTargetPosition(i, nextScene, time);

        if (nextScene === 'warp' && progress > 0.5) {
            p.z -= 25; // Speed up warp
            if (p.z < -500) p.z = 1000;
            pos2.x = p.x;
            pos2.y = p.y;
            pos2.z = p.z;
        }

        const ease = progress * progress * (3 - 2 * progress);

        p.tx = pos1.x + (pos2.x - pos1.x) * ease;
        p.ty = pos1.y + (pos2.y - pos1.y) * ease;
        p.tz = pos1.z + (pos2.z - pos1.z) * ease;

        p.x += (p.tx - p.x) * 0.1;
        p.y += (p.ty - p.y) * 0.1;
        p.z += (p.tz - p.z) * 0.1;

        let rx = p.x * Math.cos(mx) - p.z * Math.sin(mx);
        let rz = p.x * Math.sin(mx) + p.z * Math.cos(mx);
        let ry = p.y * Math.cos(my) - rz * Math.sin(my);
        rz = p.y * Math.sin(my) + rz * Math.cos(my);

        // --- UPDATE: ZOOM IN ---
        const fov = 400 * scaleFactor;
        // Offset kamera dikurangi dari 600 ke 350 agar objek terlihat LEBIH BESAR (Lebih dekat)
        const scale = fov / (fov + rz + 350);

        const screenX = width / 2 + rx * scale;
        const screenY = height / 2 + ry * scale;

        p.sx = screenX;
        p.sy = screenY;
        p.scale = scale;

        if (scale > 0) {
            const alpha = Math.min(1, scale * 1.5 - (scrollPercent > 0.8 && rz < 0 ? 1 : 0));
            ctx.globalAlpha = alpha;

            const isRedSection = (index === 2 || index === 3);
            ctx.fillStyle = isRedSection ? `rgba(235, 77, 75, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;

            // --- UPDATE: PARTICLE SIZE ---
            // Partikel dibuat lebih besar (scale * 5)
            const size = Math.max(0.8, scale * 5);
            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    if ((currentScene === 'network' || nextScene === 'network') && typeof scaleFactor !== 'undefined' && scaleFactor > 0.5) {
        ctx.lineWidth = 0.8; // Garis lebih tebal sedikit
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15})`;

        for (let i = 0; i < numParticles; i += 2) {
            for (let j = i + 1; j < i + 10; j++) {
                if (j >= numParticles) break;
                const p1 = particles[i];
                const p2 = particles[j];

                const dx = p1.sx - p2.sx;
                const dy = p1.sy - p2.sy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Jarak koneksi diperbesar agar jaring lebih rapat
                if (dist < 130 * scaleFactor && p1.scale > 0 && p2.scale > 0) {
                    ctx.beginPath();
                    ctx.moveTo(p1.sx, p1.sy);
                    ctx.lineTo(p2.sx, p2.sy);
                    ctx.stroke();
                }
            }
        }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
}

animate();

// --- UTILS ---
function openModal(el, event) {
    event.preventDefault();
    document.getElementById('m-title').innerText = el.getAttribute('data-title');
    document.getElementById('m-desc').innerText = el.getAttribute('data-desc');
    document.getElementById('m-stack').innerText = el.getAttribute('data-stack');
    document.getElementById('m-img').src = el.getAttribute('data-img');
    document.getElementById('m-link').href = el.getAttribute('data-link');
    modal.classList.add('modal-active');
    document.body.style.overflow = 'hidden';
    isModalOpen = true;
}

function closeModal() {
    modal.classList.remove('modal-active');
    document.body.style.overflowY = 'auto';
    isModalOpen = false;
}

function triggerScramble(element) {
    const targets = element.querySelectorAll('.scramble-wrapper');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    targets.forEach((target) => {
        const originalText = target.getAttribute('data-value');
        target.innerText = originalText;
        let iterations = 0;
        const interval = setInterval(() => {
            target.innerText = originalText.split("").map((letter, index) => {
                if (index < iterations) return originalText[index];
                return chars[Math.floor(Math.random() * chars.length)]
            }).join("");
            if (iterations >= originalText.length) {
                clearInterval(interval);
                target.innerText = originalText;
            }
            iterations += 1 / 3;
        }, 30);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof anime !== 'undefined') {
        anime.timeline({
            easing: 'easeOutExpo',
            complete: () => {
                anime({
                    targets: '#intro-overlay',
                    opacity: 0,
                    duration: 800,
                    easing: 'linear',
                    complete: () => {
                        document.getElementById('intro-overlay').style.display = 'none';
                        document.body.style.overflowY = 'auto';
                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    entry.target.classList.add('in-view');
                                    if (entry.target.querySelector('.count-up')) animateStats(entry.target);
                                    observer.unobserve(entry.target);
                                }
                            });
                        }, {
                            threshold: 0.1
                        });
                        document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
                        const h1 = document.querySelector('h1');
                        if (h1) triggerScramble(h1);
                        updateCustomScroll();
                    }
                });
            }
        }).add({
            targets: '.intro-counter',
            innerHTML: [0, 100],
            round: 1,
            duration: 2500,
            easing: 'easeInOutQuad'
        })
        .add({
            targets: '.intro-line',
            width: '200px',
            duration: 1000
        }, '-=1500')
        .add({
            targets: '.intro-text',
            opacity: [0, 1],
            duration: 800
        }, '-=1500');
    } else {
        document.getElementById('intro-overlay').style.display = 'none';
        document.body.style.overflowY = 'auto';
    }
});

function animateStats(el) {
    const counters = el.querySelectorAll('.count-up');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (typeof anime !== 'undefined') anime({
            targets: counter,
            innerHTML: [0, target],
            round: 1,
            easing: 'easeOutExpo',
            duration: 2000
        });
        else counter.innerHTML = target;
    });
}