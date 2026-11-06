/* مدرسة ريحانة — المعلمة الذكية سلمى */
'use strict';

const NAME = 'ريحانة';
const TEACHER = 'سلمى';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const clean = t => String(t).replace(/<[^>]+>/g, '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}«»]/gu, '').trim();

/* ---------- الحفظ ---------- */
const DEFAULT = { stars: 0, stats: {}, levels: {}, days: {}, seen: {}, breakShown: '', settings: { voice: true, rate: 0.85, goal: 20, qtime: 20 } };
let S;
try {
  S = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), JSON.parse(localStorage.getItem('rihana') || '{}'));
  S.settings = Object.assign({}, DEFAULT.settings, S.settings);
} catch (e) { S = JSON.parse(JSON.stringify(DEFAULT)); }
function save() { try { localStorage.setItem('rihana', JSON.stringify(S)); } catch (e) { /* تخزين غير متاح */ } }

/* ---------- الصوت: نطق ---------- */
const LANG = { ar: 'ar-SA', fr: 'fr-FR', en: 'en-US' };
let voices = [], speakToken = 0, lastParts = null;
const hasTTS = 'speechSynthesis' in window;
function loadVoices() { try { voices = speechSynthesis.getVoices(); } catch (e) { voices = []; } }
if (hasTTS) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function voiceFor(l) {
  const code = (LANG[l] || l).toLowerCase(), p = code.slice(0, 2);
  const list = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(p));
  return list.find(v => /female|salma|laila|hoda|amira|zeina|google|siri|samantha|amelie|audrey/i.test(v.name))
    || list.find(v => v.lang.toLowerCase().replace('_', '-') === code) || list[0];
}
function speak(parts) {
  if (typeof parts === 'string') parts = [[parts, 'ar']];
  lastParts = parts;
  const tok = ++speakToken;
  if (!S.settings.voice || !hasTTS) return Promise.resolve();
  try { if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel(); speechSynthesis.resume(); } catch (e) { /* */ }
  return new Promise(res => {
    let i = 0;
    const next = () => {
      if (tok !== speakToken || i >= parts.length) return res();
      const [t, l = 'ar'] = parts[i++];
      if (!t || !String(t).trim()) return next();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = LANG[l] || l;
      const v = voiceFor(l); if (v) u.voice = v;
      u.rate = S.settings.rate; u.pitch = 1.1;
      let done = false;
      const fin = () => { if (done) return; done = true; clearTimeout(guard); setTimeout(next, 150); };
      const guard = setTimeout(fin, 3000 + String(t).length * 260 / S.settings.rate);
      u.onend = fin; u.onerror = fin;
      try { speechSynthesis.speak(u); } catch (e) { fin(); }
    };
    next();
  });
}

/* ---------- المؤثرات الصوتية ---------- */
let actx;
function tone(freqs, dur = 0.12, type = 'sine', vol = 0.22) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f;
      const t = actx.currentTime + i * dur;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.03);
    });
  } catch (e) { /* */ }
}
const sfx = {
  ok: () => tone([523, 659, 784, 1047], 0.1, 'triangle'),
  no: () => tone([330, 247], 0.2, 'sine', 0.15),
  tap: () => tone([700], 0.05, 'triangle', 0.1),
  win: () => tone([523, 659, 784, 1047, 784, 1047, 1319], 0.12, 'triangle'),
};

/* ---------- المعلمة ---------- */
let SCR = 0; // رقم الشاشة الحالية
function teacher(text, parts) {
  const b = $('#bubble'); b.innerHTML = text;
  b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  const t = $('#teacher'); t.classList.add('talk');
  return speak(parts || [[clean(text), 'ar']]).then(() => t.classList.remove('talk'));
}

/* ---------- النجوم والملصقات ---------- */
function addStars(n = 1) {
  const before = Math.floor(S.stars / 10);
  S.stars += n; save(); renderStars(true);
  const after = Math.floor(S.stars / 10);
  if (after > before && after <= STICKERS.length) toast(`🎁 ملصق جديد لكِ: <span class="big-e">${STICKERS[after - 1]}</span>`, true);
}
function renderStars(pop) {
  const el = $('#stars'); el.textContent = '⭐ ' + S.stars;
  if (pop) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}
function toast(html, big) {
  const t = $('#toast'); t.innerHTML = html; t.classList.add('show');
  if (big) { celebrate(true); sfx.win(); }
  setTimeout(() => t.classList.remove('show'), 3500);
}
function celebrate(big) {
  const fx = $('#fx'), em = ['⭐', '🌟', '🎉', '🌸', '💖', '🎈', '✨', '🦋'];
  for (let i = 0; i < (big ? 40 : 14); i++) {
    const s = document.createElement('span');
    s.className = 'conf'; s.textContent = pick(em);
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDelay = Math.random() * 0.6 + 's';
    s.style.fontSize = (18 + Math.random() * 22) + 'px';
    fx.appendChild(s); setTimeout(() => s.remove(), 3000);
  }
}

/* ---------- الذاكرة الذكية: تتبع الأخطاء ---------- */
function rec(key, ok, label) {
  const s = S.stats[key] || (S.stats[key] = { c: 0, w: 0, l: label || key });
  if (label) s.l = label;
  ok ? s.c++ : s.w++; save();
}
function weight(key) {
  const s = S.stats[key]; if (!s) return 2.5; // لم يُرَ بعد
  return 1 + (s.w * 3) / (1 + s.c);
}
function pickWeighted(items, keyFn, avoid) {
  const pool = items.length > 1 ? items.filter(x => x !== avoid) : items;
  const ws = pool.map(x => weight(keyFn(x)));
  let r = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

/* ---------- مؤقت الدراسة اليومي ---------- */
let started = false, greeted = false;
setInterval(() => {
  if (!started || document.hidden) return;
  const d = today(); S.days[d] = (S.days[d] || 0) + 1;
  if (S.days[d] % 10 === 0) save();
  renderClock(); checkBreak();
}, 1000);
function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function renderClock() { $('#clock').textContent = '⏱️ ' + fmt(S.days[today()] || 0); }
function checkBreak() {
  const s = S.days[today()] || 0;
  if (s >= S.settings.goal * 60 && S.breakShown !== today()) {
    S.breakShown = today(); save(); addStars(5); celebrate(true); sfx.win();
    teacher(`🎉 رائع يا ${NAME}! درستِ ${S.settings.goal} دقيقة اليوم. هذه 5 نجوم هدية! حان وقت الاستراحة واللعب 🧸`);
  }
}

/* ---------- التنقل ---------- */
const stack = [];
let T = [], raf = null;
function later(f, ms) { const id = setTimeout(f, ms); T.push(id); return id; }
function clearT() { T.forEach(clearTimeout); T = []; if (raf) { cancelAnimationFrame(raf); raf = null; } }
function go(fn, ...args) { stack.push({ fn, args }); clearT(); fn(...args); window.scrollTo(0, 0); }
function replace(fn, ...args) { stack.pop(); go(fn, ...args); }
function back() { sfx.tap(); stack.pop(); const p = stack.pop(); if (p) go(p.fn, ...p.args); else go(home); }
function goHome() { stack.length = 0; go(home); }
function main(html) {
  SCR++;
  const m = $('#main'); m.innerHTML = html;
  m.classList.remove('enter'); void m.offsetWidth; m.classList.add('enter');
  return m;
}
const bar = title => `<div class="bar"><button class="back" onclick="back()">→ رجوع</button><h2>${title}</h2></div>`;

function menu(title, items) {
  main(bar(title) + `<div class="tiles">${items.map((it, i) =>
    `<button class="tile" data-i="${i}" style="--c:${it.c || '#ff8fab'}"><span class="ti">${it.i}</span><span class="tt">${it.t}</span>${it.s ? `<small>${it.s}</small>` : ''}</button>`).join('')}</div>`);
  $$('.tile').forEach(b => b.onclick = () => { sfx.tap(); const it = items[b.dataset.i]; go(it.f, ...(it.a || [])); });
}

/* ================= الصفحة الرئيسية ================= */
const SUBJECTS = [
  { id: 'ar', name: 'العربية', icon: '📝', sub: 'الحروف والحركات', c: '#ff7aa8', f: () => arMenu },
  { id: 'math', name: 'الرياضيات', icon: '🔢', sub: 'الأعداد والحساب', c: '#3fb8f5', f: () => mathMenu },
  { id: 'fr', name: 'الفرنسية', icon: '🇫🇷', sub: 'Français', c: '#7c83ff', f: () => langMenu, a: ['fr'] },
  { id: 'en', name: 'الإنجليزية', icon: '🇬🇧', sub: 'English', c: '#ffad33', f: () => langMenu, a: ['en'] },
];

function home(first) {
  const todaySec = S.days[today()] || 0, goal = S.settings.goal * 60;
  const unlocked = Math.min(Math.floor(S.stars / 10), STICKERS.length);
  const sug = suggestion();
  main(`
    <div class="subjects">${SUBJECTS.map((s, i) => `<button class="subj" style="--c:${s.c}" data-i="${i}"><span class="big">${s.icon}</span><b>${s.name}</b><small dir="auto">${s.sub}</small></button>`).join('')}</div>
    <button class="suggest" id="sug"><span class="ti">💡</span><span><b>اقتراح المعلمة ${TEACHER}:</b><br>${sug.text}</span><span class="go">▶</span></button>
    <div class="card goal"><div class="row"><b>🎯 هدف اليوم</b><span>${Math.floor(todaySec / 60)} / ${S.settings.goal} دقيقة</span></div>
      <div class="meter"><div style="width:${Math.min(100, todaySec / goal * 100)}%"></div></div></div>
    <div class="card"><div class="row"><b>🎁 ملصقاتي</b><span>${10 - (S.stars % 10)} نجوم للملصق التالي</span></div>
      <div class="stickers">${STICKERS.map((s, i) => `<span class="${i < unlocked ? 'on' : 'off'}">${i < unlocked ? s : '❔'}</span>`).join('')}</div></div>
  `);
  $$('.subj').forEach(b => b.onclick = () => { sfx.tap(); const s = SUBJECTS[b.dataset.i]; go(s.f(), ...(s.a || [])); });
  $('#sug').onclick = () => { sfx.tap(); go(sug.f, ...(sug.a || [])); };
  const h = new Date().getHours();
  const greet = h < 12 ? 'صباح الخير' : 'مساء الخير';
  const firstTime = first && !greeted; greeted = true;
  teacher(firstTime
    ? `${greet} يا ${NAME}! 🌸 أنا معلمتك ${TEACHER}. ${sug.text} أو اختاري المادة التي تحبينها!`
    : `ماذا نتعلم الآن يا ${NAME}؟ 😊`);
}

// المعلمة تقترح الدرس حسب الأخطاء والتقدّم
function suggestion() {
  const weak = Object.entries(S.stats).filter(([, s]) => s.w > 0 && s.w >= s.c * 0.5)
    .sort((a, b) => (b[1].w - b[1].c) - (a[1].w - a[1].c));
  for (const [k, s] of weak) {
    const r = routeFor(k);
    if (r) return { text: `لاحظتُ أن «${s.l}» يحتاج تدريبًا. هيا نتدرّب عليه معًا!`, ...r };
  }
  const areas = [
    { p: 'ar:L', t: 'لعبة الحروف العربية', f: arLetterQuiz },
    { p: 'ar:H', t: 'لعبة الحركات', f: harakaQuiz },
    { p: 'm:count', t: 'لعبة العدّ', f: countQuiz },
    { p: 'm:add', t: 'درس الجمع', f: mathIntro, a: ['add'] },
    { p: 'fr:', t: 'كلمات فرنسية', f: langQuiz, a: ['fr'] },
    { p: 'en:', t: 'كلمات إنجليزية', f: langQuiz, a: ['en'] },
    { p: 'm:sub', t: 'درس الطرح', f: mathIntro, a: ['sub'] },
    { p: 'm:mul', t: 'درس الضرب', f: mathIntro, a: ['mul'] },
    { p: 'm:div', t: 'درس القسمة', f: mathIntro, a: ['div'] },
  ];
  const count = p => Object.entries(S.stats).filter(([k]) => k.startsWith(p)).reduce((n, [, s]) => n + s.c + s.w, 0);
  let best = areas[0], min = Infinity;
  areas.forEach(a => { const c = count(a.p); if (c < min) { min = c; best = a; } });
  return { text: `اليوم أقترح عليكِ: ${best.t} 🌟`, f: best.f, a: best.a };
}
function routeFor(k) {
  if (k.startsWith('ar:L')) return { f: arLetterQuiz };
  if (k.startsWith('ar:H')) return { f: harakaQuiz };
  if (k === 'm:count') return { f: countQuiz };
  if (k.startsWith('m:')) return { f: mathQuiz, a: [k.slice(2)] };
  if (k.startsWith('fr:')) return { f: langQuiz, a: ['fr'] };
  if (k.startsWith('en:')) return { f: langQuiz, a: ['en'] };
  return null;
}

/* ================= محرك الأسئلة ================= */
function quiz(cfg) {
  const total = cfg.total || 8;
  let i = 0, score = 0;
  function show() {
    clearT();
    if (i >= total) return end();
    const q = cfg.make(i);
    let answered = false, wrongs = 0;
    const sid = main(bar(cfg.title) + `
      <div class="progress"><div style="width:${i / total * 100}%"></div><span>${i + 1} / ${total}</span></div>
      <div class="qbox">${q.html || ''}</div>
      <div class="timer" ${S.settings.qtime ? '' : 'hidden'}><div id="tbar"></div></div>
      <div class="choices ${q.cls || ''}">${q.choices.map((c, k) => `<button class="choice" data-k="${k}" ${c.dir ? `dir="${c.dir}"` : ''}>${c.h}</button>`).join('')}</div>
      <button class="hear" id="hearQ">🔊 أعيدي السؤال</button>`) && SCR;

    const stopTimer = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
    const startTimer = () => {
      if (!S.settings.qtime || answered || sid !== SCR) return;
      const dur = S.settings.qtime * 1000, t0 = performance.now(), b = $('#tbar');
      const step = now => {
        if (answered || sid !== SCR) return;
        const p = Math.min(1, (now - t0) / dur);
        b.style.width = (100 - p * 100) + '%';
        b.style.background = p > 0.75 ? '#ff6b6b' : p > 0.5 ? '#ffb84d' : '#4cd18a';
        if (p >= 1) return timeout();
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    teacher(q.text, q.say).then(startTimer);
    $('#hearQ').onclick = () => speak(q.say || [[clean(q.text), 'ar']]);

    const finish = () => { i++; show(); };
    $$('.choice').forEach(b => b.onclick = () => {
      if (answered) return;
      const c = q.choices[b.dataset.k];
      if (c.ok) {
        answered = true; stopTimer();
        b.classList.add('right'); sfx.ok(); celebrate();
        if (wrongs === 0) { score++; addStars(1); if (q.key) rec(q.key, true, q.label); cfg.onResult && cfg.onResult(true); }
        if (q.reveal) $('.qbox').innerHTML = q.reveal;
        const p = pick(PRAISE);
        teacher(p, [[clean(p), 'ar'], ...(q.afterSay || [])]).then(() => { if (sid === SCR) later(finish, 700); });
      } else {
        wrongs++; b.classList.add('wrong'); b.disabled = true; sfx.no();
        if (wrongs === 1) { if (q.key) rec(q.key, false, q.label); cfg.onResult && cfg.onResult(false); }
        if (wrongs >= 2) {
          $$('.choice').forEach((x, k) => { if (q.choices[k].ok) x.classList.add('hint'); });
          teacher('انظري، الجواب الصحيح يلمع ✨ اضغطي عليه');
        } else teacher(pick(TRY));
      }
    });
    function timeout() {
      answered = true;
      const k = q.choices.findIndex(c => c.ok);
      $$('.choice')[k].classList.add('right'); sfx.no();
      if (wrongs === 0 && q.key) { rec(q.key, false, q.label); cfg.onResult && cfg.onResult(false); }
      if (q.reveal) $('.qbox').innerHTML = q.reveal;
      teacher('انتهى الوقت ⏰ لا بأس! هذا هو الجواب الصحيح.', [['انتهى الوقت، لا بأس! هذا هو الجواب الصحيح', 'ar'], ...(q.afterSay || [])])
        .then(() => { if (sid === SCR) later(finish, 900); });
    }
  }
  function end() {
    const bonus = score === total ? 3 : 0;
    if (bonus) addStars(bonus);
    const medal = score >= total * 0.8 ? '🏆' : score >= total / 2 ? '🥈' : '🌱';
    main(bar(cfg.title) + `<div class="end"><div class="trophy">${medal}</div><h2>${score} / ${total}</h2>
      <div class="starsrow">${'⭐'.repeat(score)}</div>${bonus ? '<p>🎁 +3 نجوم هدية للعلامة الكاملة!</p>' : ''}
      <div class="btns"><button class="btn" id="again">🔁 مرة أخرى</button><button class="btn alt" onclick="back()">↩️ رجوع</button></div></div>`);
    celebrate(true); sfx.win();
    teacher(score === total ? `مذهل يا ${NAME}! كل الإجابات صحيحة! 🏆` : score >= total / 2 ? `أحسنتِ يا ${NAME}! حصلتِ على ${score} من ${total}. نتدرب أكثر لنصبح أبطالًا 💪` : `لا بأس يا ${NAME}، التعلّم يحتاج تدريبًا. سنعيد معًا وستصبحين أفضل 🌱`);
    $('#again').onclick = () => { i = 0; score = 0; show(); };
  }
  show();
}

/* ================= العربية ================= */
function arMenu() {
  menu('📝 اللغة العربية', [
    { i: '🔤', t: 'الحروف الهجائية', s: '28 حرفًا مع الصوت', f: arLetters, c: '#ff7aa8' },
    { i: '✨', t: 'الحركات', s: 'الفتحة والضمة والكسرة والسكون', f: harakat, c: '#c77dff' },
    { i: '✍️', t: 'أكتب الحروف', s: 'تتبّعي الحرف بإصبعك', f: trace, a: [AR_LETTERS.map(l => l.c), 0, 'ar'], c: '#4cd18a' },
    { i: '📖', t: 'أقرأ كلمات', s: 'نقرأ مقطعًا مقطعًا', f: arWords, c: '#3fb8f5' },
    { i: '🎧', t: 'لعبة الحروف', s: 'اسمعي واختاري', f: arLetterQuiz, c: '#ffad33' },
    { i: '🎯', t: 'لعبة الحركات', s: 'بَ أم بُ أم بِ؟', f: harakaQuiz, c: '#ff6b6b' },
  ]);
  teacher(`هيا نتعلم العربية يا ${NAME}! اختاري درسًا 📝`);
}

function arLetters() {
  main(bar('🔤 الحروف الهجائية') + `<div class="grid letters">${AR_LETTERS.map((l, i) =>
    `<button class="lt ar-font ${S.seen['ar' + i] ? 'seen' : ''}" data-i="${i}">${l.c}</button>`).join('')}</div>`);
  $$('.lt').forEach(b => b.onclick = () => { sfx.tap(); go(arLetter, +b.dataset.i); });
  teacher('اضغطي على أي حرف لتسمعيه وتتعلميه 👆');
}

function forms(l) {
  const c = l.c, t = 'ـ';
  return l.j ? [c, c + t, t + c + t, t + c] : [c, c, t + c, t + c];
}
function arLetter(i) {
  const show = () => {
    const l = AR_LETTERS[i], f = forms(l);
    main(bar('🔤 حرف ' + l.n) + `
      <div class="lcard">
        <div class="lbig ar-font" id="lbig">${l.c}</div>
        <div class="lname">حرف <b>${l.n}</b></div>
        <button class="example" id="ex"><span class="emo">${l.e}</span><span class="ar-font">${l.w}</span></button>
        <div class="forms"><div><span class="ar-font">${f[0]}</span><small>وحده</small></div><div><span class="ar-font">${f[1]}</span><small>في الأول</small></div><div><span class="ar-font">${f[2]}</span><small>في الوسط</small></div><div><span class="ar-font">${f[3]}</span><small>في الآخر</small></div></div>
        <div class="btns"><button class="btn sm" id="prev">→ السابق</button><button class="btn alt" id="hear">🔊 استمعي</button><button class="btn alt" id="write">✍️ اكتبيه</button><button class="btn sm" id="next">التالي ←</button></div>
      </div>`);
    const say = () => teacher(`هذا حرف ${l.n}. ${l.n} مثل ${l.w} ${l.e}`, [[`هذا حرف ${l.n}`, 'ar'], [`${l.n} ... مثل ${l.w}`, 'ar']]);
    say();
    if (!S.seen['ar' + i]) { S.seen['ar' + i] = 1; addStars(1); }
    $('#hear').onclick = $('#lbig').onclick = say;
    $('#ex').onclick = () => speak([[l.w, 'ar']]);
    $('#write').onclick = () => go(trace, AR_LETTERS.map(x => x.c), i, 'ar');
    $('#prev').onclick = () => { i = (i + 27) % 28; sfx.tap(); show(); };
    $('#next').onclick = () => { i = (i + 1) % 28; sfx.tap(); show(); };
  };
  show();
}

function harakat() {
  let li = 1;
  const show = () => {
    const l = AR_LETTERS[li], c = l.c;
    main(bar('✨ الحركات') + `
      <p class="lead">الحركات علامات صغيرة نضعها على الحرف لنعرف كيف ننطقه. اختاري حرفًا:</p>
      <div class="chips">${AR_LETTERS.map((x, k) => `<button class="chip ar-font ${k === li ? 'on' : ''}" data-k="${k}">${x.c}</button>`).join('')}</div>
      <div class="hgrid">${HARAKAT.map((h, k) => `<button class="hcard h${k}" data-k="${k}"><span class="syl ar-font">${c + h.m}</span><b>${h.n}</b><small>${h.d}</small></button>`).join('')}</div>
      <h3 class="sub">🎵 حروف المدّ (نمدّ الصوت)</h3>
      <div class="hgrid madd">${[['ا', 'الفتحة + ألف', 'َ'], ['و', 'الضمة + واو', 'ُ'], ['ي', 'الكسرة + ياء', 'ِ']].map(([m, d, h]) =>
        `<button class="hcard mcard" data-s="${c + h + m}"><span class="syl ar-font">${c + h + m}</span><small>${d}</small></button>`).join('')}</div>`);
    $$('.chip').forEach(b => b.onclick = () => { li = +b.dataset.k; sfx.tap(); show(); speak([[AR_LETTERS[li].n, 'ar']]); });
    $$('.hcard.h0,.hcard.h1,.hcard.h2,.hcard.h3').forEach(b => b.onclick = () => {
      const h = HARAKAT[b.dataset.k];
      const syl = h.id === 'sukun' ? 'أَ' + c + h.m : c + h.m;
      teacher(`${h.n}: ${h.d}. نقول: ${syl}`, [[h.n, 'ar'], [syl, 'ar'], [syl, 'ar']]);
    });
    $$('.mcard').forEach(b => b.onclick = () => speak([[b.dataset.s, 'ar'], [b.dataset.s, 'ar']]));
  };
  show();
  teacher(`انظري يا ${NAME}: الحرف نفسه يتغيّر صوته حسب الحركة! اضغطي على كل بطاقة لتسمعيها 👂`);
}

function arWords() {
  let wi = 0;
  const show = () => {
    const w = AR_WORDS[wi];
    main(bar('📖 أقرأ كلمات') + `
      <div class="lcard">
        <div class="emo-big">${w.e}</div>
        <p class="lead">اضغطي على كل جزء لتسمعيه، ثم اقرئي الكلمة كاملة</p>
        <div class="syls">${w.s.map((s, k) => `<button class="sylb ar-font" data-k="${k}">${s}</button>`).join('<span class="plus">+</span>')}</div>
        <button class="wordb ar-font" id="word">${w.w}</button>
        <div class="btns"><button class="btn sm" id="prev">→ السابق</button><button class="btn" id="read">🔊 اقرئي معي</button><button class="btn sm" id="next">التالي ←</button></div>
      </div>`);
    $$('.sylb').forEach(b => b.onclick = () => { b.classList.add('lit'); speak([[w.s[b.dataset.k], 'ar']]); });
    $('#word').onclick = () => speak([[w.w, 'ar']]);
    $('#read').onclick = () => {
      const bs = $$('.sylb'); bs.forEach(b => b.classList.remove('lit'));
      w.s.forEach((s, k) => later(() => { bs[k].classList.add('lit'); speak([[s, 'ar']]); }, k * 1300));
      later(() => { $('#word').classList.add('lit'); teacher(`الكلمة هي: ${w.w} ${w.e} أحسنتِ!`, [[w.w, 'ar'], [w.w, 'ar']]); }, w.s.length * 1300 + 200);
    };
    $('#prev').onclick = () => { wi = (wi + AR_WORDS.length - 1) % AR_WORDS.length; sfx.tap(); show(); };
    $('#next').onclick = () => { wi = (wi + 1) % AR_WORDS.length; sfx.tap(); if (wi % 3 === 0) addStars(1); show(); };
  };
  show();
  teacher('هيا نقرأ معًا! نقرأ كل جزء ثم نجمعها لتصبح كلمة 📖');
}

function arLetterQuiz() {
  let last;
  quiz({
    title: '🎧 لعبة الحروف', total: 8,
    make(i) {
      const l = pickWeighted(AR_LETTERS, x => 'ar:L:' + x.c, last); last = l;
      const others = shuffle(AR_LETTERS.filter(x => x !== l)).slice(0, 3);
      const choices = shuffle([l, ...others]).map(x => ({ h: `<span class="ar-font cbig">${x.c}</span>`, ok: x === l }));
      const base = { key: 'ar:L:' + l.c, label: 'حرف ' + l.n, choices, cls: 'four',
        afterSay: [[`حرف ${l.n}، مثل ${l.w}`, 'ar']] };
      if (i % 2 === 0) return { ...base, text: `أين حرف <b>${l.n}</b>؟ 👂`, say: [[`أين حرف ${l.n}؟`, 'ar']] };
      return { ...base, html: `<div class="emo-big">${l.e}</div><div class="ar-font qword">${l.w}</div>`,
        text: `بأي حرف تبدأ كلمة <b>${l.w}</b>؟`, say: [[`بأي حرف تبدأ كلمة ${l.w}؟`, 'ar']] };
    },
  });
}

function harakaQuiz() {
  const H3 = HARAKAT.slice(0, 3);
  quiz({
    title: '🎯 لعبة الحركات', total: 8,
    make(i) {
      const l = pick(AR_LETTERS.slice(1));
      if (i % 2 === 0) {
        const h = pickWeighted(H3, x => 'ar:H:' + x.id), syl = l.c + h.m;
        return {
          key: 'ar:H:' + h.id, label: h.n, cls: 'three',
          text: 'اسمعي جيدًا 👂 واختاري الصوت الصحيح', say: [['اسمعي جيدًا', 'ar'], [syl, 'ar'], [syl, 'ar']],
          html: '<div class="emo-big">👂</div>',
          choices: shuffle(H3).map(x => ({ h: `<span class="ar-font cbig">${l.c + x.m}</span>`, ok: x === h })),
          afterSay: [[syl, 'ar'], [h.n, 'ar']],
        };
      }
      const h = pickWeighted(HARAKAT, x => 'ar:H:' + x.id);
      return {
        key: 'ar:H:' + h.id, label: h.n, cls: 'two',
        html: `<div class="ar-font syl-q">${l.c + h.m}</div>`,
        text: 'ما اسم الحركة على هذا الحرف؟', say: [['ما اسم الحركة على هذا الحرف؟', 'ar']],
        choices: shuffle(HARAKAT).map(x => ({ h: `<span class="ar-font">${x.n}</span>`, ok: x === h })),
        afterSay: [[h.n, 'ar']],
      };
    },
  });
}

/* ================= الكتابة بالتتبّع ================= */
function trace(set, idx = 0, lang = 'ar') {
  let i = idx;
  const isAr = lang === 'ar', isNum = lang === 'num';
  const fontFam = isAr ? '"Noto Naskh Arabic", serif' : '"Baloo Bhaijaan 2", "Comic Sans MS", sans-serif';
  const nameOf = ch => {
    if (isAr) { const l = AR_LETTERS.find(x => x.c === ch); return [[`اكتبي حرف ${l.n}`, 'ar']]; }
    if (isNum) return [[`اكتبي الرقم ${AR(+ch)}`, 'ar']];
    return [[ch === ch.toUpperCase() ? 'اكتبي الحرف الكبير' : 'اكتبي الحرف الصغير', 'ar'], [ch.toLowerCase(), lang]];
  };
  const show = () => {
    const ch = set[i];
    main(bar('✍️ أكتب') + `
      <div class="trace-top"><button class="btn sm" id="tPrev">→</button><div class="tchar ${isAr ? 'ar-font' : ''}">${ch}</div><button class="btn sm" id="tNext">←</button></div>
      <div class="canvas-box" id="cbox"><canvas id="guide"></canvas><canvas id="draw"></canvas></div>
      <div class="btns"><button class="btn alt" id="tClear">🧽 امسحي</button><button class="btn" id="tCheck">✅ انتهيت</button><button class="btn alt" id="tHear">🔊</button></div>`);
    const sid = SCR, box = $('#cbox');
    const W = Math.min(box.clientWidth || 340, 420), dpr = Math.min(window.devicePixelRatio || 1, 2), P = Math.round(W * dpr);
    box.style.height = W + 'px';
    const g = $('#guide'), d = $('#draw');
    [g, d].forEach(c => { c.width = P; c.height = P; c.style.width = W + 'px'; c.style.height = W + 'px'; });
    const gx = g.getContext('2d'), dx = d.getContext('2d');
    gx.scale(dpr, dpr); dx.scale(dpr, dpr);
    const brush = W * 0.075;
    let font = '', strict = null, tol = null;

    const glyph = (ctx, fill, stroke, lw, dash) => {
      ctx.save(); ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      const m = ctx.measureText(ch);
      const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
      const x = W / 2 + ((m.actualBoundingBoxLeft || 0) - (m.actualBoundingBoxRight || 0)) / 2, y = W / 2 + (asc - desc) / 2;
      if (stroke) { ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; if (dash) ctx.setLineDash(dash); ctx.strokeText(ch, x, y); }
      if (fill) { ctx.fillStyle = fill; ctx.fillText(ch, x, y); }
      ctx.restore();
    };
    const drawGuide = () => {
      if (sid !== SCR) return;
      gx.font = `700 ${W * 0.6}px ${fontFam}`;
      const m = gx.measureText(ch);
      const gw = (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width), gh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent || W * 0.6;
      const size = W * 0.6 * Math.min(0.72 * W / gw, 0.72 * W / gh);
      font = `700 ${size}px ${fontFam}`;
      gx.clearRect(0, 0, W, W);
      // خطوط مساعدة
      gx.strokeStyle = '#e8eefc'; gx.lineWidth = 2; gx.setLineDash([8, 8]);
      [0.25, 0.5, 0.75].forEach(p => { gx.beginPath(); gx.moveTo(0, W * p); gx.lineTo(W, W * p); gx.stroke(); });
      gx.setLineDash([]);
      glyph(gx, '#ffe0ec', '#ff8fab', 3, [6, 6]);
      const mk = (lw) => { const c = document.createElement('canvas'); c.width = P; c.height = P; const x = c.getContext('2d'); x.scale(dpr, dpr); glyph(x, '#000', lw ? '#000' : null, lw); return x.getImageData(0, 0, P, P).data; };
      strict = mk(0); tol = mk(brush * 1.6);
    };
    (document.fonts ? document.fonts.load(`700 80px ${fontFam}`, ch).catch(() => 0) : Promise.resolve()).then(drawGuide);

    // الرسم بالإصبع
    let drawing = false, lastP = null, strokes = 0;
    const pt = e => { const r = d.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * W / r.height]; };
    dx.lineCap = 'round'; dx.lineJoin = 'round'; dx.lineWidth = brush; dx.strokeStyle = '#7c3aed'; dx.fillStyle = '#7c3aed';
    d.onpointerdown = e => { e.preventDefault(); drawing = true; strokes++; try { d.setPointerCapture(e.pointerId); } catch (x) { /* */ } lastP = pt(e); dx.beginPath(); dx.arc(lastP[0], lastP[1], brush / 2, 0, Math.PI * 2); dx.fill(); };
    d.onpointermove = e => { if (!drawing) return; e.preventDefault(); const p = pt(e); dx.beginPath(); dx.moveTo(lastP[0], lastP[1]); dx.lineTo(p[0], p[1]); dx.stroke(); lastP = p; };
    d.onpointerup = d.onpointercancel = d.onpointerleave = () => { drawing = false; };

    const say = () => teacher('مرّري إصبعك فوق الحرف الوردي 👆 ثم اضغطي «انتهيت»', [...nameOf(ch), ['مرّري إصبعك فوق الحرف الوردي', 'ar']]);
    say();
    $('#tHear').onclick = () => speak(nameOf(ch));
    $('#tClear').onclick = () => { dx.clearRect(0, 0, W, W); strokes = 0; sfx.tap(); };
    $('#tPrev').onclick = () => { i = (i + set.length - 1) % set.length; sfx.tap(); show(); };
    $('#tNext').onclick = () => { i = (i + 1) % set.length; sfx.tap(); show(); };
    $('#tCheck').onclick = () => {
      if (!strict) return;
      const u = dx.getImageData(0, 0, P, P).data;
      let tot = 0, cov = 0, user = 0, out = 0;
      for (let p = 3; p < u.length; p += 12) {
        const inS = strict[p] > 100, inT = tol[p] > 40, on = u[p] > 40;
        if (inS) { tot++; if (on) cov++; }
        if (on) { user++; if (!inT) out++; }
      }
      const coverage = tot ? cov / tot : 0, outside = user ? out / user : 1;
      const key = (isAr ? 'ar:W:' : isNum ? 'm:W:' : lang + ':W:') + ch;
      if (user < 15) return teacher('لم تكتبي شيئًا بعد 🙂 مرّري إصبعك فوق الحرف');
      if (coverage >= 0.5 && outside <= 0.4) {
        rec(key, true, 'كتابة ' + ch); sfx.ok(); celebrate(true); addStars(2);
        d.classList.add('done');
        const p = pick(PRAISE);
        teacher(p + ' كتابة جميلة! ✍️').then(() => { if (sid === SCR) later(() => { i = (i + 1) % set.length; show(); }, 600); });
      } else {
        rec(key, false, 'كتابة ' + ch); sfx.no();
        teacher(coverage < 0.5 ? 'جميل! لكن غطّي الحرف الوردي كله بإصبعك 🌸 حاولي مرة أخرى' : 'حاولي أن تبقي داخل الحرف الوردي ولا تخرجي كثيرًا 🙂');
      }
    };
  };
  show();
}

/* ================= الرياضيات ================= */
const OPS = {
  add: { t: 'الجمع', sym: '+', i: '➕', e: '🍎', c: '#4cd18a' },
  sub: { t: 'الطرح', sym: '−', i: '➖', e: '🎈', c: '#ff7aa8' },
  mul: { t: 'الضرب', sym: '×', i: '✖️', e: '⭐', c: '#ffad33' },
  div: { t: 'القسمة', sym: '÷', i: '➗', e: '🍬', c: '#7c83ff' },
};
const KIDS = ['👧', '👦', '🧒', '👶'];
const calc = (op, a, b) => op === 'add' ? a + b : op === 'sub' ? a - b : op === 'mul' ? a * b : a / b;

function mathMenu() {
  menu('🔢 الرياضيات', [
    { i: '🔢', t: 'الأعداد', s: 'من 0 إلى 20', f: numbers, c: '#3fb8f5' },
    { i: '🧮', t: 'لعبة العدّ', s: 'كم عددها؟', f: countQuiz, c: '#c77dff' },
    ...Object.entries(OPS).map(([k, o]) => ({ i: o.i, t: o.t, s: 'درس ثم لعبة', f: mathIntro, a: [k], c: o.c })),
    { i: '✍️', t: 'أكتب الأرقام', s: 'من 0 إلى 9', f: trace, a: ['0123456789'.split(''), 0, 'num'], c: '#4cd18a' },
  ]);
  teacher(`الرياضيات ممتعة يا ${NAME}! نبدأ بالأعداد ثم الجمع والطرح والضرب والقسمة 🔢`);
}

const objs = (n, e, cls = '') => Array.from({ length: n }, (_, k) => `<span class="o ${cls}" style="animation-delay:${k * 50}ms">${e}</span>`).join('');

function numbers() {
  main(bar('🔢 الأعداد') + `<div class="grid nums">${Array.from({ length: 21 }, (_, n) => `<button class="lt" data-n="${n}" dir="ltr">${n}</button>`).join('')}</div>`);
  $$('.lt').forEach(b => b.onclick = () => { sfx.tap(); go(numberCard, +b.dataset.n); });
  teacher('اضغطي على أي رقم لتسمعيه وتعدّي معي 🔢');
}
function numberCard(n) {
  const show = () => {
    const e = pick(['🍎', '⭐', '🐟', '🌸', '🍓', '🐥', '🍪', '🦋']);
    main(bar('🔢 العدد ' + n) + `<div class="lcard">
      <div class="lbig" dir="ltr">${n}</div><div class="lname"><b>${AR(n)}</b></div>
      <div class="objs ${n > 10 ? 'small' : ''}" dir="ltr">${n ? objs(n, e) : '<span class="lead">صفر يعني: لا شيء! 🫙</span>'}</div>
      <div class="btns"><button class="btn sm" id="prev">→</button><button class="btn" id="count">👆 عدّي معي</button><button class="btn sm" id="next">←</button></div></div>`);
    teacher(`هذا العدد ${AR(n)} ${n ? '' : '، صفر يعني لا شيء'}`, [[`هذا العدد ${AR(n)}`, 'ar']]);
    $('#count').onclick = () => {
      clearT(); const os = $$('.objs .o'); os.forEach(o => o.classList.remove('lit'));
      os.forEach((o, k) => later(() => { o.classList.add('lit'); speak([[AR(k + 1), 'ar']]); }, k * 900));
      later(() => { teacher(`المجموع ${AR(n)}! أحسنتِ 🌟`); }, os.length * 900 + 300);
    };
    $('#prev').onclick = () => { n = (n + 20) % 21; sfx.tap(); show(); };
    $('#next').onclick = () => { n = (n + 1) % 21; sfx.tap(); show(); };
  };
  show();
}

function numChoices(ans, n = 3) {
  const set = new Set([ans]); let tries = 0;
  while (set.size < n && tries++ < 50) { const c = ans + (Math.random() < 0.5 ? -1 : 1) * (1 + rnd(3)); if (c >= 0) set.add(c); }
  return shuffle([...set]).map(v => ({ h: `<span class="cnum">${v}</span>`, ok: v === ans, dir: 'ltr' }));
}

function countQuiz() {
  let lv = S.levels.count || 1, streak = 0;
  quiz({
    title: '🧮 لعبة العدّ', total: 8,
    onResult(ok) { streak = ok ? streak + 1 : 0; if (streak >= 3 && lv < 3) { lv++; streak = 0; S.levels.count = lv; save(); } if (!ok && lv > 1) { lv--; S.levels.count = lv; save(); } },
    make() {
      const max = [5, 10, 15][lv - 1], n = 1 + rnd(max), e = pick(['🍎', '⭐', '🐟', '🎈', '🌸', '🍓', '🐥', '🚗', '🐞']);
      return {
        key: 'm:count', label: 'العدّ', cls: 'three',
        html: `<div class="objs ${n > 10 ? 'small' : ''}" dir="ltr">${objs(n, e)}</div>`,
        text: 'كم عددها؟ عدّي جيدًا 👆', say: [['كم عددها؟ عُدّي جيدًا', 'ar']],
        choices: numChoices(n),
        afterSay: [[Array.from({ length: n }, (_, k) => AR(k + 1)).join('، '), 'ar']],
      };
    },
  });
}

function mathVisual(op, a, b, showAns) {
  const o = OPS[op], e = o.e, ans = calc(op, a, b);
  const eq = `<div class="eq" dir="ltr">${a} <b>${o.sym}</b> ${b} = <span class="ans">${showAns ? ans : '?'}</span></div>`;
  const many = (op === 'add' && a + b > 10) || (op === 'sub' && a > 10) || (op === 'div' && a > 10) ? 'small' : '';
  let v = '';
  if (op === 'add') v = `<div class="vis ${many}" dir="ltr"><div class="grp">${objs(a, e)}</div><b class="opb">+</b><div class="grp">${objs(b, e)}</div></div>`;
  if (op === 'sub') v = `<div class="vis ${many}" dir="ltr"><div class="grp">${objs(a - b, e)}${objs(b, e, 'gone')}</div></div>`;
  if (op === 'mul') v = `<div class="vis" dir="ltr">${Array.from({ length: a }, () => `<div class="grp box">${objs(b, e)}</div>`).join('')}</div>`;
  if (op === 'div') v = showAns
    ? `<div class="vis" dir="ltr">${Array.from({ length: b }, (_, k) => `<div class="grp box kid"><div class="kidf">${KIDS[k % 4]}</div>${objs(ans, e)}</div>`).join('')}</div>`
    : `<div class="vis ${many}" dir="ltr"><div class="grp">${objs(a, e)}</div></div><div class="kids">${Array.from({ length: b }, (_, k) => KIDS[k % 4]).join(' ')}</div>`;
  return v + eq;
}
function mathSay(op, a, b) {
  return {
    add: `${AR(a)} زائد ${AR(b)}، كم يساوي؟`,
    sub: `عندنا ${AR(a)}، طار منها ${AR(b)}. ${AR(a)} ناقص ${AR(b)}، كم يبقى؟`,
    mul: `${AR(a)} مجموعات، في كل مجموعة ${AR(b)}. ${AR(a)} ضرب ${AR(b)}، كم يساوي؟`,
    div: `عندنا ${AR(a)} حلوى، نوزّعها على ${AR(b)} أطفال بالتساوي. كم يأخذ كل طفل؟`,
  }[op];
}
function mathAnswerSay(op, a, b) {
  const w = { add: 'زائد', sub: 'ناقص', mul: 'ضرب', div: 'تقسيم' }[op];
  return `${AR(a)} ${w} ${AR(b)} يساوي ${AR(calc(op, a, b))}`;
}

const INTRO = {
  add: { ex: [2, 1], t: 'الجمع ➕ يعني نضع الأشياء معًا. عندنا تفاحتان، وأضفنا تفاحة واحدة، فصار عندنا ثلاث تفاحات!' },
  sub: { ex: [4, 1], t: 'الطرح ➖ يعني نأخذ أشياء ونبعدها. عندنا أربعة بالونات، طار بالون واحد، فبقي ثلاثة!' },
  mul: { ex: [2, 3], t: 'الضرب ✖️ يعني نكرّر نفس العدد. مجموعتان، في كل مجموعة ثلاث نجوم: المجموع ستّ نجوم!' },
  div: { ex: [6, 2], t: 'القسمة ➗ يعني نوزّع الأشياء بالتساوي. ستّ حلويات بين طفلين: كل طفل يأخذ ثلاثة!' },
};
function mathIntro(op) {
  const o = OPS[op], [a, b] = INTRO[op].ex;
  main(bar(o.i + ' ' + o.t) + `<div class="lcard">
    <p class="lead">${INTRO[op].t}</p>
    <div class="qbox" id="exv">${mathVisual(op, a, b, false)}</div>
    <div class="btns"><button class="btn alt" id="show">👀 أريني الجواب</button><button class="btn" id="play">🎮 هيا نلعب</button></div></div>`);
  teacher(INTRO[op].t);
  $('#show').onclick = () => { $('#exv').innerHTML = mathVisual(op, a, b, true); sfx.ok(); speak([[mathAnswerSay(op, a, b), 'ar']]); };
  $('#play').onclick = () => { sfx.tap(); replace(mathQuiz, op); };
}

function genMath(op, lv) {
  if (op === 'add') { const max = [5, 10, 20][lv - 1], a = 1 + rnd(max - 1), b = 1 + rnd(max - a); return [a, b]; }
  if (op === 'sub') { const max = [5, 10, 20][lv - 1], a = 2 + rnd(max - 1), b = 1 + rnd(a - 1); return [a, b]; }
  if (op === 'mul') { const [A, B] = [[2, 3], [3, 4], [4, 5]][lv - 1]; return [2 + rnd(A - 1), 1 + rnd(B)]; }
  const k = 2 + rnd([1, 2, 3][lv - 1]), each = 1 + rnd([3, 4, 5][lv - 1]); return [k * each, k];
}
function mathQuiz(op) {
  const o = OPS[op];
  let lv = S.levels[op] || 1, streak = 0, miss = 0, levelUp = false;
  quiz({
    title: o.i + ' ' + o.t, total: 8,
    onResult(ok) {
      if (ok) { streak++; miss = 0; if (streak >= 3 && lv < 3) { lv++; streak = 0; levelUp = true; } }
      else { streak = 0; miss++; if (miss >= 2 && lv > 1) { lv--; miss = 0; } }
      S.levels[op] = lv; save();
    },
    make() {
      const [a, b] = genMath(op, lv), ans = calc(op, a, b);
      const pre = levelUp ? `أنتِ بطلة! 💪 الآن أسئلة أصعب قليلًا. ` : '';
      levelUp = false;
      return {
        key: 'm:' + op, label: o.t, cls: 'three',
        html: mathVisual(op, a, b, false), reveal: mathVisual(op, a, b, true),
        text: pre + mathSay(op, a, b), say: [[pre + mathSay(op, a, b), 'ar']],
        choices: numChoices(ans), afterSay: [[mathAnswerSay(op, a, b), 'ar']],
      };
    },
  });
}

/* ================= الفرنسية والإنجليزية ================= */
function langMenu(lang) {
  const L = LANGS[lang];
  menu(L.flag + ' ' + L.name, [
    { i: '🔤', t: 'الحروف', s: 'A B C', f: langLetters, a: [lang], c: '#7c83ff' },
    ...Object.entries(L.themes).map(([k, th]) => ({ i: th.i, t: th.t, f: langTheme, a: [lang, k], c: pick(['#ff7aa8', '#3fb8f5', '#4cd18a', '#ffad33', '#c77dff']) })),
    { i: '✍️', t: 'أكتب الحروف', s: 'Aa Bb Cc', f: trace, a: [L.alpha.flatMap(x => [x[0], x[0].toLowerCase()]), 0, lang], c: '#4cd18a' },
    { i: '🎧', t: 'لعبة: اسمعي واختاري', f: langQuiz, a: [lang], c: '#ff6b6b' },
  ]);
  teacher(lang === 'fr' ? `هيا نتعلم الفرنسية يا ${NAME}! Bonjour 👋` : `هيا نتعلم الإنجليزية يا ${NAME}! Hello 👋`,
    [[lang === 'fr' ? 'هيا نتعلم الفرنسية' : 'هيا نتعلم الإنجليزية', 'ar'], [lang === 'fr' ? 'Bonjour Rihana!' : 'Hello Rihana!', lang]]);
}

function langLetters(lang) {
  const L = LANGS[lang];
  main(bar('🔤 ' + L.native) + `<div class="grid letters" dir="ltr">${L.alpha.map((x, i) => `<button class="lt latin ${S.seen[lang + i] ? 'seen' : ''}" data-i="${i}">${x[0]}${x[0].toLowerCase()}</button>`).join('')}</div>`);
  $$('.lt').forEach(b => b.onclick = () => { sfx.tap(); go(langLetter, lang, +b.dataset.i); });
  teacher('اضغطي على حرف لتسمعيه 👆');
}
function langLetter(lang, i) {
  const L = LANGS[lang];
  const show = () => {
    const [c, w, e, ar] = L.alpha[i];
    main(bar('🔤 ' + c) + `<div class="lcard">
      <div class="lbig latin" dir="ltr">${c} ${c.toLowerCase()}</div>
      <button class="example" id="ex" dir="ltr"><span class="emo">${e}</span><span class="latin">${w}</span></button>
      <div class="lname">يعني: <b>${ar}</b></div>
      <div class="btns"><button class="btn sm" id="prev">→ السابق</button><button class="btn alt" id="hear">🔊 استمعي</button><button class="btn alt" id="write">✍️ اكتبيه</button><button class="btn sm" id="next">التالي ←</button></div></div>`);
    const say = () => teacher(`الحرف ${c}، مثل ${w} ${e} يعني ${ar}`, [['الحرف', 'ar'], [c, lang], ['مثل', 'ar'], [w, lang], [`يعني ${ar}`, 'ar']]);
    say();
    if (!S.seen[lang + i]) { S.seen[lang + i] = 1; addStars(1); }
    $('#hear').onclick = say;
    $('#ex').onclick = () => speak([[w, lang]]);
    $('#write').onclick = () => go(trace, L.alpha.flatMap(x => [x[0], x[0].toLowerCase()]), i * 2, lang);
    $('#prev').onclick = () => { i = (i + 25) % 26; sfx.tap(); show(); };
    $('#next').onclick = () => { i = (i + 1) % 26; sfx.tap(); show(); };
  };
  show();
}

function langTheme(lang, key) {
  const th = LANGS[lang].themes[key];
  main(bar(th.i + ' ' + th.t) + `<div class="grid words">${th.items.map(([w, e, ar], k) =>
    `<button class="wcard" data-k="${k}"><span class="emo">${e}</span><b dir="ltr" class="latin">${w}</b><small>${ar}</small></button>`).join('')}</div>
    <div class="btns"><button class="btn" id="all">🔊 استمعي للكل</button></div>`);
  $$('.wcard').forEach(b => b.onclick = () => {
    const [w, , ar] = th.items[b.dataset.k];
    $$('.wcard').forEach(x => x.classList.remove('lit')); b.classList.add('lit');
    speak([[w, lang], [ar, 'ar']]);
  });
  $('#all').onclick = () => {
    clearT(); const cs = $$('.wcard');
    th.items.forEach(([w], k) => later(() => { cs.forEach(x => x.classList.remove('lit')); cs[k].classList.add('lit'); speak([[w, lang]]); }, k * 1800));
  };
  teacher(`هذه ${th.t} ${th.i} اضغطي على كل صورة لتسمعي الكلمة ومعناها`);
}

function langQuiz(lang) {
  const L = LANGS[lang];
  const pool = [...L.alpha.map(([, w, e, ar]) => ({ w, e, ar })), ...Object.values(L.themes).flatMap(t => t.items.map(([w, e, ar]) => ({ w, e, ar })))]
    .filter((x, k, a) => a.findIndex(y => y.w === x.w) === k);
  let last;
  quiz({
    title: L.flag + ' اسمعي واختاري', total: 8,
    make(i) {
      if (i % 4 === 3) { // تمييز الحروف
        const t = pickWeighted(L.alpha, x => lang + ':L:' + x[0]);
        const others = shuffle(L.alpha.filter(x => x !== t)).slice(0, 3);
        return {
          key: lang + ':L:' + t[0], label: 'الحرف ' + t[0], cls: 'four',
          text: 'أين هذا الحرف؟ 👂', say: [['أين الحرف', 'ar'], [t[0], lang]], html: '<div class="emo-big">🔤</div>',
          choices: shuffle([t, ...others]).map(x => ({ h: `<span class="cbig latin">${x[0]}</span>`, ok: x === t, dir: 'ltr' })),
          afterSay: [[t[0], lang], ['مثل', 'ar'], [t[1], lang]],
        };
      }
      const t = pickWeighted(pool, x => lang + ':w:' + x.w, last); last = t;
      const others = shuffle(pool.filter(x => x.e !== t.e)).slice(0, 3);
      return {
        key: lang + ':w:' + t.w, label: t.w + ' (' + t.ar + ')', cls: 'four',
        html: `<div class="qword latin" dir="ltr">${t.w}</div>`,
        text: `أين <b dir="ltr">${t.w}</b>؟ 👂`, say: [['أين', 'ar'], [t.w, lang]],
        choices: shuffle([t, ...others]).map(x => ({ h: `<span class="cemo">${x.e}</span>`, ok: x === t })),
        afterSay: [[t.w, lang], [`يعني ${t.ar}`, 'ar']],
      };
    },
  });
}

/* ================= ركن الوالدين ================= */
function parentGate() {
  const a = 6 + rnd(4), b = 6 + rnd(4);
  main(bar('👨‍👩‍👧 ركن الوالدين') + `<div class="lcard"><p class="lead">سؤال للوالدين فقط 🙂</p>
    <div class="eq" dir="ltr">${a} × ${b} = ?</div><input id="pg" type="number" inputmode="numeric" class="inp" dir="ltr">
    <div class="btns"><button class="btn" id="ok">دخول</button></div></div>`);
  $('#ok').onclick = () => { if (+$('#pg').value === a * b) replace(parent); else { sfx.no(); $('#pg').value = ''; } };
  teacher('هذا الركن خاص بماما وبابا 👨‍👩‍👧', [['هذا الركن خاص بماما وبابا', 'ar']]);
}
function parent() {
  const days = [...Array(7)].map((_, k) => { const d = new Date(); d.setDate(d.getDate() - (6 - k)); const key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); return { l: d.toLocaleDateString('ar', { weekday: 'short' }), m: Math.round((S.days[key] || 0) / 60) }; });
  const maxM = Math.max(S.settings.goal, ...days.map(d => d.m));
  const area = (p, t) => { const e = Object.entries(S.stats).filter(([k]) => k.startsWith(p)); const c = e.reduce((n, [, s]) => n + s.c, 0), w = e.reduce((n, [, s]) => n + s.w, 0); return { t, n: c + w, pct: c + w ? Math.round(c / (c + w) * 100) : null }; };
  const areas = [area('ar:L', 'الحروف العربية'), area('ar:H', 'الحركات'), area('ar:W', 'كتابة العربية'), area('m:count', 'العدّ'), area('m:add', 'الجمع'), area('m:sub', 'الطرح'), area('m:mul', 'الضرب'), area('m:div', 'القسمة'), area('fr:', 'الفرنسية'), area('en:', 'الإنجليزية')];
  const hard = Object.values(S.stats).filter(s => s.w > 0).sort((a, b) => (b.w - b.c) - (a.w - a.c)).slice(0, 8);
  const v = l => voiceFor(l) ? '✅ متوفر' : '❌ غير متوفر';
  main(bar('👨‍👩‍👧 ركن الوالدين') + `
    <div class="card"><b>⏱️ وقت الدراسة (آخر 7 أيام — بالدقائق)</b>
      <div class="chart">${days.map(d => `<div class="col"><span>${d.m}</span><div class="barc" style="height:${d.m / maxM * 100}%"></div><small>${d.l}</small></div>`).join('')}</div></div>
    <div class="card"><b>⭐ النجوم:</b> ${S.stars} &nbsp; <b>🎁 الملصقات:</b> ${Math.min(Math.floor(S.stars / 10), STICKERS.length)}</div>
    <div class="card"><b>📊 نسبة الإجابات الصحيحة</b><table class="tbl">${areas.map(a => `<tr><td>${a.t}</td><td>${a.pct === null ? '—' : `<div class="meter sm"><div style="width:${a.pct}%"></div></div>`}</td><td dir="ltr">${a.pct === null ? '' : a.pct + '% (' + a.n + ')'}</td></tr>`).join('')}</table></div>
    <div class="card"><b>🧠 ما تحتاج ريحانة إلى تدريب عليه (تختاره المعلمة تلقائيًا أكثر)</b>
      <div class="hard">${hard.length ? hard.map(s => `<span>${s.l} <small dir="ltr">✔${s.c} ✘${s.w}</small></span>`).join('') : '<span>لا شيء بعد 👍</span>'}</div></div>
    <div class="card"><b>🔊 أصوات الجهاز</b><p>العربية: ${v('ar')} · الفرنسية: ${v('fr')} · الإنجليزية: ${v('en')}</p>
      <small>إذا كان صوت غير متوفر: على أندرويد ثبّتوا «Google Text-to-Speech» وأضيفوا اللغة، وعلى آيفون: الإعدادات ← تسهيلات الاستخدام ← المحتوى المنطوق ← الأصوات. أفضل متصفح: Chrome أو Safari.</small></div>
    <div class="card settings">
      <label><input type="checkbox" id="sv" ${S.settings.voice ? 'checked' : ''}> تشغيل صوت المعلمة</label>
      <label>سرعة الكلام <input type="range" id="sr" min="0.5" max="1.2" step="0.05" value="${S.settings.rate}"></label>
      <label>هدف الدراسة اليومي <select id="sg">${[10, 15, 20, 30, 45].map(n => `<option ${n === S.settings.goal ? 'selected' : ''} value="${n}">${n} دقيقة</option>`).join('')}</select></label>
      <label>وقت كل سؤال <select id="sq">${[[0, 'بدون مؤقت'], [15, '15 ثانية'], [20, '20 ثانية'], [30, '30 ثانية'], [45, '45 ثانية']].map(([n, t]) => `<option ${n === S.settings.qtime ? 'selected' : ''} value="${n}">${t}</option>`).join('')}</select></label>
      <div class="btns"><button class="btn alt" id="test">🔊 تجربة الصوت</button><button class="btn danger" id="reset">🗑️ مسح كل التقدّم</button></div>
    </div>`);
  $('#sv').onchange = e => { S.settings.voice = e.target.checked; save(); };
  $('#sr').oninput = e => { S.settings.rate = +e.target.value; save(); };
  $('#sg').onchange = e => { S.settings.goal = +e.target.value; S.breakShown = ''; save(); };
  $('#sq').onchange = e => { S.settings.qtime = +e.target.value; save(); };
  $('#test').onclick = () => speak([[`مرحبًا ${NAME}`, 'ar'], ['Bonjour Rihana', 'fr'], ['Hello Rihana', 'en']]);
  let armed = false;
  $('#reset').onclick = e => {
    if (!armed) { armed = true; e.target.textContent = '⚠️ اضغطوا مرة ثانية للتأكيد'; later(() => { armed = false; const b = $('#reset'); if (b) b.textContent = '🗑️ مسح كل التقدّم'; }, 4000); return; }
    const st = S.settings; S = JSON.parse(JSON.stringify(DEFAULT)); S.settings = st; save(); renderStars(); renderClock(); goHome();
  };
  teacher('هنا تتابعون تقدّم ريحانة وتغيّرون الإعدادات ⚙️');
}

/* ================= البداية ================= */
$('#homeBtn').onclick = () => { sfx.tap(); goHome(); };
$('#parentBtn').onclick = () => { sfx.tap(); go(parentGate); };
$('#repeatBtn').onclick = () => { if (lastParts) speak(lastParts); };
$('#teacher').onclick = () => { if (lastParts) speak(lastParts); };
$('#startBtn').onclick = () => {
  started = true; tone([1], 0.01, 'sine', 0.0002); // تفعيل الصوت على الهواتف
  if (hasTTS) { try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) { /* */ } loadVoices(); }
  $('#start').classList.add('hide');
  setTimeout(() => { loadVoices(); voiceCheck(); }, 1200);
  stack.length = 0; go(home, true);
};
function voiceCheck() {
  const n = $('#voiceNote'); if (!n) return;
  let msg = '';
  if (!hasTTS) msg = '🔇 هذا المتصفح لا يدعم صوت المعلمة. افتحوا الرابط في متصفح Chrome (أو Safari على آيفون) مباشرة، وليس داخل تطبيق آخر.';
  else if (!voices.length) msg = '🔇 لم يجد المتصفح أي صوت على الجهاز. ثبّتوا «Google Text-to-Speech» (أندرويد) ثم أعيدوا فتح الصفحة.';
  else if (!voiceFor('ar')) msg = '🔇 لا يوجد صوت عربي على الجهاز. أندرويد: الإعدادات ← إمكانية الوصول ← تحويل النص إلى كلام ← محرك Google ← تثبيت بيانات الصوت ← العربية. آيفون: الإعدادات ← تسهيلات الاستخدام ← المحتوى المنطوق ← الأصوات ← العربية.';
  n.innerHTML = msg; n.hidden = !msg;
}
renderStars(); renderClock();
setTimeout(() => { loadVoices(); voiceCheck(); }, 1500);
$('#startName').textContent = NAME;
