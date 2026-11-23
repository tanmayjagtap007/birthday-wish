/* =========================================================
   EDIT THIS PART  ✏️
   ========================================================= */
const CONFIG = {
  name: "Sis",                 // her name / nickname
  password: "2511",            // birthday as DDMM
  title: "Happy Birthday, {name}!",
  subtitle: "Wish You a Happiest Bday dear",
  footer: "Made with love by your friend 💛",
  // Put photos inside the /photos folder with these names (add/remove lines freely)
  photos: [
    { src: "photos/1.jpg", caption: "Queen mode 👑" },
    { src: "photos/2.jpg", caption: "Pure sunshine ☀️" },
    { src: "photos/3.jpg", caption: "Always smiling 😊" },
    { src: "photos/4.jpg", caption: "Birthday glow 🎈" },
    { src: "photos/5.jpg", caption: "Cutie pie 💛" },
    { src: "photos/6.jpg", caption: "Main character 🌟" }
  ],
  cards: [
    { emoji: "👭", title: "To My Sister", color: "#ffd93b",
      text: "You are the best sister I ever have even we are not blood related but my heart never finds the difference." },
    { emoji: "🤝", title: "My Best Friend", color: "#ff8fb1",
      text: "You are the only best friend of mine. I know I am not a good friend, but it's fine—you will always be my best friend." },
    { emoji: "🎂", title: "Birthday Wishes", color: "#8fd3ff",
      text: "Happy Birthday! May your year be full of cake, good grades, great trips and zero tension. Dream big, shine bright, and remember I'm always cheering for you! 🥳🎉" }
  ]
};
/* =========================================================  */

const $ = s => document.querySelector(s);
const gate = $("#gate"), main = $("#main"), bgm = $("#bgm");
bgm.volume = 0.25;

/* ---------- Gate ---------- */
$("#gateForm").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("#dateInput").value.replace(/\D/g, "");
  if (v === CONFIG.password) {
    $("#gateMsg").textContent = "";
    enter();
  } else {
    $("#gateMsg").textContent = "Hmm, wrong date! Are you even the birthday girl? 😜";
    const card = document.querySelector(".gate-card");
    card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
  }
});

function enter() {
  gate.classList.add("hidden");
  main.classList.remove("hidden");
  window.scrollTo(0, 0);
  bgm.play().catch(() => {});           // allowed: user just clicked
  $("#title").textContent = CONFIG.title.replace("{name}", CONFIG.name);
  $("#subtitle").textContent = CONFIG.subtitle;
  $("#footer").textContent = CONFIG.footer;
  buildPhotos(); buildCards();
  launchBalloons(); burstConfetti();
}

/* ---------- Music toggle ---------- */
$("#muteBtn").addEventListener("click", () => {
  if (bgm.paused) { bgm.play(); $("#muteBtn").textContent = "🔊"; }
  else { bgm.pause(); $("#muteBtn").textContent = "🔇"; }
});

/* ---------- Balloons ---------- */
const BCOLORS = ["#e8402f", "#ffd93b", "#4aa3df", "#5cb85c", "#ff8fb1", "#ff9f1c", "#b388ff"];
function launchBalloons() {
  const wrap = $("#balloons");
  const count = innerWidth < 600 ? 22 : 38;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const b = document.createElement("div");
      b.className = "balloon";
      const c = BCOLORS[i % BCOLORS.length];
      b.style.background = c; b.style.color = c;
      b.style.left = Math.random() * 94 + "vw";
      b.style.setProperty("--sway", (Math.random() * 80 - 40) + "px");
      b.style.animationDuration = (7 + Math.random() * 6) + "s";
      b.style.transform = `scale(${0.8 + Math.random() * 0.6})`;
      b.addEventListener("click", () => { b.classList.add("pop"); setTimeout(() => b.remove(), 250); });
      b.addEventListener("animationend", () => b.remove());
      wrap.appendChild(b);
    }, i * 220);
  }
}

/* ---------- Hanging photos (draggable) ---------- */
function buildPhotos() {
  const box = $("#photos"), svg = $("#wireSvg");
  box.innerHTML = "";
  CONFIG.photos.forEach((p, i) => {
    const el = document.createElement("div");
    el.className = "photo";
    el.innerHTML = `<div class="swing" style="--delay:${-(i * 0.7)}s">
      <div class="pin"></div>
      <div class="frame"><img src="${p.src}" alt="${p.caption}" draggable="false"><b>${p.caption}</b></div></div>`;
    box.appendChild(el);
    makeDraggable(el);
  });
  layoutPhotos();
}

function layoutPhotos() {
  const box = $("#photos"), svg = $("#wireSvg");
  const W = box.clientWidth, photos = [...box.children];
  const pw = photos[0] ? photos[0].offsetWidth : 150;
  const perRow = Math.max(1, Math.min(photos.length, Math.floor(W / (pw + 24))));
  const rows = Math.ceil(photos.length / perRow);
  const rowH = pw * 1.55 + 40, top0 = 50, sag = 36;
  box.style.height = (rows * rowH + 40) + "px";
  svg.style.height = box.style.height;
  let paths = "";
  for (let r = 0; r < rows; r++) {
    const y = top0 + r * rowH;
    paths += `<path d="M -10 ${y - 20} Q ${W / 2 + 10} ${y + sag * 1.6 - 20} ${W + 10} ${y - 20}"/>`;
  }
  svg.setAttribute("viewBox", `0 0 ${W + 20} ${rows * rowH + 40}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.innerHTML = paths;
  photos.forEach((el, i) => {
    if (el.dataset.moved) return;
    const r = Math.floor(i / perRow), idx = i % perRow;
    const inRow = Math.min(perRow, photos.length - r * perRow);
    const gap = (W - inRow * pw) / (inRow + 1);
    const x = gap + idx * (pw + gap);
    const t = (x + pw / 2) / W;
    const wireY = top0 + r * rowH - 20 + sag * 1.6 * 2 * t * (1 - t);
    el.style.left = x + "px";
    el.style.top = (wireY - 4) + "px";
  });
}
addEventListener("resize", () => { if (!main.classList.contains("hidden")) layoutPhotos(); });

function makeDraggable(el) {
  let sx, sy, ox, oy;
  el.addEventListener("pointerdown", e => {
    el.setPointerCapture(e.pointerId);
    el.classList.add("drag");
    sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop;
  });
  el.addEventListener("pointermove", e => {
    if (!el.classList.contains("drag")) return;
    const box = el.parentElement;
    let x = ox + e.clientX - sx, y = oy + e.clientY - sy;
    x = Math.max(-20, Math.min(box.clientWidth - el.offsetWidth + 20, x));
    y = Math.max(0, Math.min(box.clientHeight - el.offsetHeight + 20, y));
    el.style.left = x + "px"; el.style.top = y + "px";
    el.dataset.moved = "1";
  });
  const end = () => el.classList.remove("drag");
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}

/* ---------- Cards ---------- */
function buildCards() {
  const box = $("#cards");
  box.innerHTML = "";
  const rots = ["-3deg", "2deg", "-1.5deg", "3deg"];
  CONFIG.cards.forEach((c, i) => {
    const d = document.createElement("div");
    d.className = "card";
    d.style.setProperty("--rot", rots[i % rots.length]);
    d.innerHTML = `
      <div class="face front" style="--c:${c.color}"><div class="emoji">${c.emoji}</div><h3>${c.title}</h3><small>tap to open 💌</small></div>
      <div class="face back"><h3>${c.title}</h3><p>${c.text}</p></div>`;
    d.addEventListener("click", () => { d.classList.toggle("flip"); if (d.classList.contains("flip")) burstConfetti(40); });
    box.appendChild(d);
  });
}

/* ---------- Confetti ---------- */
const cv = $("#confetti"), cx = cv.getContext("2d");
let bits = [], raf;
function sizeCv() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener("resize", sizeCv); sizeCv();
function burstConfetti(n = 140) {
  for (let i = 0; i < n; i++) {
    bits.push({
      x: innerWidth / 2, y: innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 16, vy: Math.random() * -14 - 3,
      s: Math.random() * 8 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: BCOLORS[Math.floor(Math.random() * BCOLORS.length)], life: 140
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  bits = bits.filter(b => b.life-- > 0);
  bits.forEach(b => {
    b.vy += 0.35; b.x += b.vx; b.y += b.vy; b.r += b.vr;
    cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r);
    cx.fillStyle = b.c; cx.globalAlpha = Math.min(1, b.life / 40);
    cx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); cx.restore();
  });
  raf = bits.length ? requestAnimationFrame(tick) : null;
}
