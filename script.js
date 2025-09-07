/* ===========================
   Theme toggle + persistence
   =========================== */
const body = document.body;
const modeBtn = document.getElementById('mode-toggle');
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') body.classList.add('dark');
modeBtn && (modeBtn.textContent = body.classList.contains('dark') ? '☀️' : '🌙');
modeBtn && modeBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  modeBtn.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
});

/* ===========================
   Sticky navbar (scroll)
   =========================== */
const navbar = document.getElementById('navbar');
function onScrollNav(){
  if(window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}
window.addEventListener('scroll', onScrollNav, {passive:true});
onScrollNav();

/* ===========================
   Typing effect (hero)
   =========================== */
const typingEl = document.getElementById('typing');
const words = ["Java Based Software 💻"];
let wIdx = 0, cIdx = 0, deleting = false;
function tick(){
  if(!typingEl) return;
  const word = words[wIdx];
  if(!deleting){
    typingEl.textContent = word.slice(0, ++cIdx);
    if(cIdx === word.length){ deleting = true; setTimeout(tick, 1200); return; }
  } else {
    typingEl.textContent = word.slice(0, --cIdx);
    if(cIdx === 0){ deleting = false; wIdx = (wIdx+1)%words.length; }
  }
  setTimeout(tick, deleting ? 50 : 110);
}
tick();

/* ===========================
   Smooth scrolling for anchors
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const target = a.getAttribute('href');
    if(target.length>1){
      e.preventDefault();
      const el = document.querySelector(target);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

/* ===========================
   Reveal on scroll (IntersectionObserver)
   =========================== */
const revealTargets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .timeline-item, .blog-card');
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold: 0.15});
revealTargets.forEach(t => observer.observe(t));

/* ===========================
   Lightweight hero particle background
   =========================== */
(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;
  const particleCount = Math.round((width*height)/50000) + 18;
  const particles = [];

  function rnd(min,max){ return Math.random()*(max-min)+min; }
  function resize(){
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', () => { resize(); });

  class P {
    constructor(){
      this.x = rnd(0,width);
      this.y = rnd(0,height);
      this.r = rnd(0.6,2.2);
      this.vx = rnd(-0.3,0.6);
      this.vy = rnd(-0.2,0.6);
      this.alpha = rnd(0.08,0.35);
    }
    step(){
      this.x += this.vx;
      this.y += this.vy;
      if(this.x < -10) this.x = width + 10;
      if(this.x > width + 10) this.x = -10;
      if(this.y < -10) this.y = height + 10;
      if(this.y > height + 10) this.y = -10;
    }
    draw(){
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  for(let i=0;i<particleCount;i++) particles.push(new P());

  function loop(){
    ctx.clearRect(0,0,width,height);
    // subtle gradient overlay for depth
    const g = ctx.createLinearGradient(0,0,width,height);
    if(document.body.classList.contains('dark')){
      g.addColorStop(0, 'rgba(10,12,20,0.12)');
      g.addColorStop(1, 'rgba(10,12,20,0.28)');
    } else {
      g.addColorStop(0, 'rgba(255,255,255,0.02)');
      g.addColorStop(1, 'rgba(255,255,255,0.06)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0,0,width,height);

    for(const p of particles){
      p.step();
      p.draw();
    }
    requestAnimationFrame(loop);
  }
  // ensure canvas sized correctly then animate
  resize();
  loop();
})();


// Expandable blog content
document.querySelectorAll('.blog-card').forEach(card => {
    const btn = card.querySelector('.read-more');
    const content = card.querySelector('.full-content');

    btn.addEventListener('click', () => {
        if(content.style.maxHeight && content.style.maxHeight !== '0px') {
            // Collapse
            content.style.maxHeight = '0px';
            btn.textContent = 'Read →';
        } else {
            // Expand
            content.style.maxHeight = content.scrollHeight + 'px';
            btn.textContent = 'Collapse ←';
        }
    });
});
