/* ═══════════════════════════════════════════════════
   Anusha Hasan Portfolio — script.js
   GSAP animations · Particle system · Neural canvas
   AI chatbot (Claude API) · Interactive features
═══════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────
   1. LOADING SCREEN
────────────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  const progress = document.getElementById('loaderProgress');
  const canvas = document.getElementById('loaderCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  let loaderDone = false;

  function hideLoader() {
    if (loaderDone) return;
    loaderDone = true;
    if (progress) progress.style.width = '100%';
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      initGSAP();
      initCounters();
    }, 400);
  }

  // Neural canvas animation (only if canvas exists)
  if (ctx) {
    let angle = 0;
    const nodes = Array.from({ length: 6 }, (_, i) => ({
      x: 60 + 40 * Math.cos((i / 6) * Math.PI * 2),
      y: 60 + 40 * Math.sin((i / 6) * Math.PI * 2),
    }));

    function drawLoader() {
      ctx.clearRect(0, 0, 120, 120);
      angle += 0.02;
      ctx.strokeStyle = 'rgba(99,102,241,0.25)';
      ctx.lineWidth = 1;
      nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
          if (j > i) {
            ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); ctx.stroke();
          }
        });
      });
      nodes.forEach((n, i) => {
        const pulse = Math.sin(angle * 2 + i) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${0.4 + pulse * 0.6})`;
        ctx.fill();
      });
      ctx.beginPath(); ctx.arc(60, 60, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee'; ctx.shadowBlur = 10; ctx.shadowColor = '#22d3ee';
      ctx.fill(); ctx.shadowBlur = 0;
      if (!loaderDone) requestAnimationFrame(drawLoader);
    }
    drawLoader();
  }

  // Animate progress bar
  if (progress) {
    let p = 0;
    const interval = setInterval(() => {
      p = Math.min(p + Math.random() * 18, 90);
      progress.style.width = p + '%';
      if (p >= 90) clearInterval(interval);
    }, 80);
  }

  // Hide as soon as DOM is interactive (DOMContentLoaded) — avoids
  // waiting for images/fonts which can stall indefinitely
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(hideLoader, 800));
  } else {
    // Already past DOMContentLoaded — hide immediately after brief pause
    setTimeout(hideLoader, 600);
  }

  // Hard fallback: always hide within 2.5s
  setTimeout(hideLoader, 2500);
})();


/* ──────────────────────────────────────────────────
   2. CUSTOM CURSOR
────────────────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');
  let mx = -100, my = -100;
  let tx = -100, ty = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  // Trailing cursor with lerp
  function animateTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top = ty + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Cursor scale on interactive elements
  document.querySelectorAll('a, button, .hover-lift, .filter-btn, .chat-suggest').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '40px';
      cursor.style.height = '40px';
      cursor.style.background = 'rgba(34,211,238,0.15)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '16px';
      cursor.style.height = '16px';
      cursor.style.background = '#22d3ee';
    });
  });
})();


/* ──────────────────────────────────────────────────
   3. PARTICLE BACKGROUND
────────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NUM = 80;
  const particles = Array.from({ length: NUM }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.4 + 0.1,
  }));

  let mouseX = -1000, mouseY = -1000;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      // Mouse repulsion
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.vx += dx / dist * 0.04;
        p.vy += dy / dist * 0.04;
      }

      p.vx *= 0.995;
      p.vy *= 0.995;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
      ctx.fill();
    });

    // Draw connections between nearby particles
    for (let i = 0; i < NUM; i++) {
      for (let j = i + 1; j < NUM; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 100) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }
  drawParticles();
})();


/* ──────────────────────────────────────────────────
   4. NEURAL NETWORK CANVAS (Hero)
────────────────────────────────────────────────── */
(function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 320, H = 320;

  // Define layers of a neural net
  const layers = [
    [{ x: 40, y: 80 }, { x: 40, y: 160 }, { x: 40, y: 240 }],
    [{ x: 120, y: 60 }, { x: 120, y: 130 }, { x: 120, y: 200 }, { x: 120, y: 270 }],
    [{ x: 200, y: 90 }, { x: 200, y: 160 }, { x: 200, y: 230 }],
    [{ x: 280, y: 130 }, { x: 280, y: 200 }],
  ];

  const colors = ['#6366f1', '#22d3ee', '#a78bfa', '#22d3ee'];
  let t = 0;

  // Animate signal pulses
  const pulses = [];
  function spawnPulse() {
    const fromLayer = Math.floor(Math.random() * (layers.length - 1));
    const fromNode = Math.floor(Math.random() * layers[fromLayer].length);
    const toNode = Math.floor(Math.random() * layers[fromLayer + 1].length);
    pulses.push({
      x1: layers[fromLayer][fromNode].x,
      y1: layers[fromLayer][fromNode].y,
      x2: layers[fromLayer + 1][toNode].x,
      y2: layers[fromLayer + 1][toNode].y,
      progress: 0,
      speed: 0.012 + Math.random() * 0.015,
      color: colors[fromLayer],
    });
  }
  setInterval(spawnPulse, 180);

  function drawNeural() {
    ctx.clearRect(0, 0, W, H);
    t += 0.02;

    // Draw connections
    layers.forEach((layer, li) => {
      if (li >= layers.length - 1) return;
      const nextLayer = layers[li + 1];
      layer.forEach(n1 => {
        nextLayer.forEach(n2 => {
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = 'rgba(99,102,241,0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });
    });

    // Draw pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.progress += p.speed;
      if (p.progress >= 1) { pulses.splice(i, 1); continue; }

      const px = p.x1 + (p.x2 - p.x1) * p.progress;
      const py = p.y1 + (p.y2 - p.y1) * p.progress;

      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw nodes
    layers.forEach((layer, li) => {
      layer.forEach((n, ni) => {
        const pulse = Math.sin(t * 1.5 + li * 1.2 + ni * 0.8) * 0.5 + 0.5;

        // Glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 12);
        grad.addColorStop(0, `rgba(99,102,241,${0.15 + pulse * 0.1})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Node
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4 + pulse * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = li === layers.length - 1 ? '#22d3ee' : '#6366f1';
        ctx.shadowBlur = 6 + pulse * 6;
        ctx.shadowColor = li === layers.length - 1 ? '#22d3ee' : '#6366f1';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    });

    requestAnimationFrame(drawNeural);
  }
  drawNeural();
})();


/* ──────────────────────────────────────────────────
   5. GSAP SCROLL ANIMATIONS
────────────────────────────────────────────────── */
function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance sequence
  const heroTl = gsap.timeline({ delay: 0.2 });
  heroTl
    .from('.hero-badge', { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' })
    .from('.hero-name', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, '-=0.3')
    .from('.hero-tagline', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    .from('.hero-desc', { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .from('.hero-cta', { opacity: 0, y: 12, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .from('.hero-social', { opacity: 0, y: 10, duration: 0.4, ease: 'power2.out' }, '-=0.2')
    .from('.hero-visual', { opacity: 0, x: 40, duration: 0.8, ease: 'power3.out' }, '-=0.6');

  // Reveal elements on scroll
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Staggered project cards
  gsap.from('.project-card', {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#projectsGrid',
      start: 'top 85%',
    },
  });

  // Skill bars animate in when visible
  gsap.utils.toArray('.skill-bar-fill').forEach(bar => {
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 90%',
      onEnter: () => {
        bar.style.width = getComputedStyle(bar).getPropertyValue('--w') || '80%';
      },
    });
  });

  // Timeline items
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      opacity: 0,
      x: -30,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
      },
    });
  });

  // Navbar scroll behavior
  ScrollTrigger.create({
    start: 60,
    onEnter: () => document.getElementById('navbar').classList.add('scrolled'),
    onLeaveBack: () => document.getElementById('navbar').classList.remove('scrolled'),
  });
}


/* ──────────────────────────────────────────────────
   6. ANIMATED STATS COUNTERS
────────────────────────────────────────────────── */
function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat-card').forEach((card, i) => {
        card.style.transitionDelay = (i * 100) + 'ms';
        card.classList.add('visible');
      });

      entry.target.querySelectorAll('.counter').forEach(counter => {
        const target = +counter.dataset.target;
        const duration = 1800;
        const step = target / (duration / 16);
        let current = 0;
        const update = () => {
          current = Math.min(current + step, target);
          counter.textContent = Math.floor(current);
          if (current < target) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats-section');
  if (statsSection) observer.observe(statsSection);
}


/* ──────────────────────────────────────────────────
   7. PROJECT FILTERING
────────────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.display = match ? '' : 'none';
      if (match) {
        gsap.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      }
    });
  });
});


/* ──────────────────────────────────────────────────
   8. MOBILE MENU
────────────────────────────────────────────────── */
document.getElementById('mobileMenuBtn').addEventListener('click', () => {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
  menu.classList.toggle('flex');
});

document.querySelectorAll('#mobileMenu a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.add('hidden');
    document.getElementById('mobileMenu').classList.remove('flex');
  });
});


/* ──────────────────────────────────────────────────
   9. AI CHAT ASSISTANT (Claude API)
────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are a friendly, concise portfolio assistant for Anusha Hasan, an AI Engineer based in Karachi, Pakistan.

Here is everything you know about Anusha:

NAME: Anusha Hasan
ROLE: AI Engineer Intern | Full-Stack AI Developer
EMAIL: anushahasan02@gmail.com
PHONE: +92 347 836 0623
GITHUB: https://github.com/Anusha-hasan25
LINKEDIN: https://www.linkedin.com/in/anushahasan25/

EDUCATION:
- BS Computer Science at Karachi Institute of Economics and Technology (KIET), Feb 2023 – Jan 2027 (Expected), CGPA 3.45/4.0

EXPERIENCE:
1. AI Engineer Intern at Folio3 (Oct 2025 – Nov 2025, Karachi)
   - Built multi-model RAG pipeline with GPT-4, Gemini, LLaMA across documents and YouTube transcripts
   - Developed agentic AI features with tool-use and memory orchestration
   - Built React + FastAPI full-stack interface for the learning assistant
   - Presented at demo-day; project won as an award-winning AI learning assistant

2. AI & SQA Intern at Digital Frontiers X (Dec 2025 – Mar 2026, Karachi)
   - Validated AI workflows and model integrity
   - Designed 20–50+ test cases across web and API surfaces
   - API testing with Postman, bug tracking with Jira

PROJECTS:
1. ProstheX AI — 7-DOF transhumeral prosthetic arm using sEMG, TinyML, edge AI for gesture recognition
2. SmartLearn AI — Multi-model RAG tutoring platform (GPT-4, Gemini, LLaMA) for adaptive learning
3. BrainBuddy — Multi-agent cognitive AI system for adaptive intelligence tracking and personalized recommendations
4. Legal AI Assistant — RAG-based legal research tool with document retrieval and conversational Q&A
5. TCP AI Chat System — Socket-based real-time AI communication platform
6. Grocery Management System — Flask web app with role-based auth, cart, checkout, admin dashboard

TECHNICAL SKILLS:
- AI/LLMs: GPT-4, Gemini, LLaMA, LangChain, RAG, Agentic AI, Prompt Engineering, Vector Databases
- Backend: Python, FastAPI, Flask, Django, REST APIs
- Frontend: React, JavaScript, HTML, CSS
- Tools: Postman, Jira, Git, Docker, Figma
- Hardware AI: TinyML, sEMG signal processing, edge AI

CERTIFICATIONS:
- Front-End Developer Capstone (Meta)
- HTML, CSS & JavaScript for Web Developers (Johns Hopkins)
- Foundations of UX Design (Google)
- Introduction to Cybersecurity
- Introduction to Project Management
- RESTful Web Services with JAX-RS

Answer questions concisely and helpfully, as if you are Anusha's personal assistant. Keep responses short (2-4 sentences usually). Be professional but warm. If asked something not in the above data, say you don't have that info but direct them to contact Anusha directly.`;

const chatHistory = [];

async function sendChatMessage(userMsg) {
  const messages = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');

  // Add user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-msg chat-msg--user';
  userBubble.innerHTML = `<div class="chat-bubble chat-bubble--user">${escapeHtml(userMsg)}</div>`;
  messages.appendChild(userBubble);

  // Add typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg chat-msg--bot';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `<div class="chat-bubble chat-bubble--bot"><span class="typing-dots">...</span></div>`;
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;

  chatHistory.push({ role: 'user', content: userMsg });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: chatHistory,
      }),
    });

    const data = await response.json();
    const reply = data.content?.map(c => c.text || '').join('') || 'Sorry, I had trouble with that. Please try again!';

    chatHistory.push({ role: 'assistant', content: reply });

    // Remove typing and add real reply
    document.getElementById('typing-indicator')?.remove();

    const botBubble = document.createElement('div');
    botBubble.className = 'chat-msg chat-msg--bot';
    botBubble.innerHTML = `<div class="chat-bubble chat-bubble--bot">${escapeHtml(reply)}</div>`;
    messages.appendChild(botBubble);
    messages.scrollTop = messages.scrollHeight;

  } catch (err) {
    document.getElementById('typing-indicator')?.remove();
    const errBubble = document.createElement('div');
    errBubble.className = 'chat-msg chat-msg--bot';
    errBubble.innerHTML = `<div class="chat-bubble chat-bubble--bot">I'm having connection trouble. Please reach Anusha directly at <a href="mailto:anushahasan02@gmail.com" class="text-indigo-400 hover:underline">anushahasan02@gmail.com</a></div>`;
    messages.appendChild(errBubble);
    messages.scrollTop = messages.scrollHeight;
  }

  input.value = '';
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.getElementById('chatSend').addEventListener('click', () => {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (msg) sendChatMessage(msg);
});

document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const msg = e.target.value.trim();
    if (msg) sendChatMessage(msg);
  }
});

function insertSuggestion(btn) {
  const input = document.getElementById('chatInput');
  input.value = btn.textContent;
  input.focus();
}


/* ──────────────────────────────────────────────────
   10. CONTACT FORM VALIDATION
────────────────────────────────────────────────── */
function submitForm() {
  const name = document.getElementById('contactName');
  const email = document.getElementById('contactEmail');
  const msg = document.getElementById('contactMsg');

  let valid = true;

  const nameErr = document.getElementById('nameErr');
  const emailErr = document.getElementById('emailErr');
  const msgErr = document.getElementById('msgErr');

  nameErr.classList.add('hidden');
  emailErr.classList.add('hidden');
  msgErr.classList.add('hidden');

  if (!name.value.trim()) {
    nameErr.classList.remove('hidden');
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    emailErr.classList.remove('hidden');
    valid = false;
  }

  if (msg.value.trim().length < 10) {
    msgErr.textContent = 'Please write at least 10 characters.';
    msgErr.classList.remove('hidden');
    valid = false;
  }

  if (valid) {
    // Create mailto link
    const subject = encodeURIComponent(`Portfolio Contact from ${name.value.trim()}`);
    const body = encodeURIComponent(`From: ${name.value.trim()}\nEmail: ${email.value.trim()}\n\n${msg.value.trim()}`);
    window.location.href = `mailto:anushahasan02@gmail.com?subject=${subject}&body=${body}`;

    // Show success
    name.value = '';
    email.value = '';
    msg.value = '';
    document.getElementById('formSuccess').classList.remove('hidden');
    setTimeout(() => document.getElementById('formSuccess').classList.add('hidden'), 5000);
  }
}
