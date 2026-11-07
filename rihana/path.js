/* رحلة ريحانة: مسار مرتب خطوة بخطوة، مناسب لطفلة تتشتت بسهولة
   - مهمة واحدة في كل شاشة، وكل تعليمة مسموعة
   - لا يوجد سؤال يحتاج قراءة قبل أن تتعلم القراءة
   - دروس قصيرة (3 إلى 5 دقائق) ثم استراحة حركة
   - الدرس التالي يُفتح فقط بعد إتقان الدرس الحالي */
'use strict';

const H = Object.fromEntries(HARAKAT.map(h => [h.id, h]));
const MOUTH = { fatha: '😮', damma: '😗', kasra: '😁', sukun: '🤐' };
const letterOf = c => AR_LETTERS.find(l => l.c === c);
const hsyl = (c, h) => h === 'sukun' ? 'أَ' + c + H.sukun.m : c + H[h].m;
const chA = (txt, ok, extra = '') => ({ h: `<span class="ar-font cbig">${txt}</span>${extra}`, ok });
const plain = w => w.replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا');

// حرفان مشتّتان من الحروف التي تعلّمتها (أو من غيرها إن لم يكفِ)
function arOthers(target, learned, n = 2) {
  let o = shuffle(learned.filter(c => c !== target));
  if (o.length < n) o = o.concat(shuffle(AR_LETTERS.map(l => l.c).filter(c => c !== target && !o.includes(c))));
  return o.slice(0, n);
}

/* ---------- المناهج ---------- */
// ترتيب تعليم العربية: حروف سهلة أولًا، والحركات تأتي بعد أن تعرف بعض الحروف
const AR_ORDER = ['م', 'ب', 'fatha', 'ت', 'ن', 'damma', 'ر', 'س', 'kasra', 'review', 'د', 'ل', 'sukun', 'ك', 'ف', 'madd', 'ع', 'ق', 'review',
  'ح', 'ج', 'words', 'ه', 'و', 'ي', 'ا', 'review', 'ش', 'ص', 'words', 'ط', 'ز', 'خ', 'review', 'ض', 'ظ', 'ث', 'ذ', 'غ', 'review', 'words'];

function buildArPath() {
  const out = []; let learned = [], harakat = [];
  for (const x of AR_ORDER) {
    const base = () => ({ learned: [...learned], harakat: [...harakat] });
    if (x.length === 1) { learned.push(x); out.push({ type: 'letter', c: x, t: 'حرف ' + letterOf(x).n, i: x, ...base() }); }
    else if (H[x]) { harakat.push(x); out.push({ type: 'haraka', h: x, t: H[x].n, i: '◌' + H[x].m, ...base() }); }
    else if (x === 'madd') out.push({ type: 'madd', t: 'حروف المدّ', i: 'بَا', ...base() });
    else if (x === 'review') out.push({ type: 'review', t: 'مراجعة', i: '🔁', ...base() });
    else if (x === 'words') out.push({ type: 'words', t: 'أقرأ كلمات', i: '📖', ...base() });
  }
  return out;
}

const MATH_PATH = [
  { type: 'count', max: 3, meet: [1, 2, 3], t: 'نعدّ حتى 3', i: '3' },
  { type: 'count', max: 5, meet: [4, 5], t: 'نعدّ حتى 5', i: '5' },
  { type: 'numrec', max: 5, t: 'أين الرقم؟', i: '🔢' },
  { type: 'count', max: 10, meet: [6, 7, 8, 9, 10], t: 'نعدّ حتى 10', i: '10' },
  { type: 'numrec', max: 10, t: 'أرقام حتى 10', i: '🔟' },
  { type: 'op', op: 'add', lv: 1, t: 'الجمع', i: '➕' },
  { type: 'op', op: 'sub', lv: 1, t: 'الطرح', i: '➖' },
  { type: 'op', op: 'add', lv: 2, t: 'الجمع حتى 10', i: '➕' },
  { type: 'op', op: 'sub', lv: 2, t: 'الطرح حتى 10', i: '➖' },
  { type: 'op', op: 'mul', lv: 1, t: 'الضرب', i: '✖️' },
  { type: 'op', op: 'div', lv: 1, t: 'القسمة', i: '➗' },
  { type: 'numrec', max: 20, meet: [11, 12, 15, 20], t: 'أرقام حتى 20', i: '20' },
  { type: 'op', op: 'add', lv: 3, t: 'الجمع حتى 20', i: '➕' },
  { type: 'op', op: 'sub', lv: 3, t: 'الطرح حتى 20', i: '➖' },
  { type: 'op', op: 'mul', lv: 2, t: 'الضرب 2', i: '✖️' },
  { type: 'op', op: 'div', lv: 2, t: 'القسمة 2', i: '➗' },
  { type: 'op', op: 'mul', lv: 3, t: 'الضرب 3', i: '✖️' },
  { type: 'op', op: 'div', lv: 3, t: 'القسمة 3', i: '➗' },
];

const LANG_ORDER = [['theme', 'hello', 0, 4], ['theme', 'colors', 0, 5], ['theme', 'numbers', 0, 5], ['letters', 0, 5], ['theme', 'animals', 0, 5],
  ['theme', 'fruits', 0, 4], ['theme', 'colors', 5, 10], ['theme', 'numbers', 5, 10], ['letters', 5, 10], ['theme', 'animals', 5, 10],
  ['theme', 'fruits', 4, 8], ['theme', 'hello', 4, 7], ['letters', 10, 15], ['letters', 15, 20], ['letters', 20, 26]];
function buildLangPath(lang) {
  return LANG_ORDER.map(([type, k, a, b]) => {
    if (type === 'letters') { const al = LANGS[lang].alpha; return { type, a: k, b: a, t: `الحروف ${al[k][0]}–${al[a - 1][0]}`, i: al[k][0] + al[k][0].toLowerCase() }; }
    const th = LANGS[lang].themes[k];
    return { type, k, a, b, t: th.t + (a ? ' 2' : ''), i: th.i };
  });
}

const PATHS = { ar: buildArPath(), math: MATH_PATH, fr: buildLangPath('fr'), en: buildLangPath('en') };
const SUBJ = {
  ar: { n: 'العربية', i: '📝', c: '#ff7aa8' }, math: { n: 'الرياضيات', i: '🔢', c: '#3fb8f5' },
  fr: { n: 'الفرنسية', i: '🇫🇷', c: '#7c83ff' }, en: { n: 'الإنجليزية', i: '🇬🇧', c: '#ffad33' },
};
const progOf = s => Math.min(S.path[s] || 0, PATHS[s].length - 1);

/* ---------- خطة اليوم: 3 دروس قصيرة ---------- */
function todayPlan() {
  if (!S.plan || S.plan.d !== today()) {
    const lang = new Date().getDate() % 2 ? 'fr' : 'en';
    S.plan = { d: today(), items: ['ar', 'math', lang], done: [0, 0, 0], prize: 0 }; save();
  }
  return S.plan;
}

/* ---------- الصفحة الرئيسية ---------- */
function home(first) {
  const plan = todayPlan(), nextI = plan.done.indexOf(0);
  const doneN = plan.done.filter(Boolean).length;
  const nextS = nextI >= 0 ? plan.items[nextI] : null;
  const nextL = nextS ? PATHS[nextS][progOf(nextS)] : null;
  const todaySec = S.days[today()] || 0, goal = S.settings.goal * 60;
  const unlocked = Math.min(Math.floor(S.stars / 10), STICKERS.length);
  main(`
    <div class="plan">
      <div class="row"><b>📅 خطة اليوم</b><span>${doneN} / 3</span></div>
      <div class="plan-steps">${plan.items.map((s, i) => `<div class="pstep ${plan.done[i] ? 'done' : i === nextI ? 'now' : ''}" style="--c:${SUBJ[s].c}">
        <span class="pi">${plan.done[i] ? '✅' : SUBJ[s].i}</span><small>${SUBJ[s].n}</small></div>`).join('<span class="arrow">←</span>')}</div>
      ${nextL ? `<button class="btn big start-lesson" id="goNext" style="--c:${SUBJ[nextS].c}">▶ ابدئي: ${nextL.t}</button>`
    : `<div class="plan-done">🏆 أنهيتِ خطة اليوم! أنتِ بطلة<br><small>يمكنكِ اللعب الحر أو الاستراحة</small></div>`}
    </div>
    <div class="maps">${['ar', 'math', 'fr', 'en'].map(mapRow).join('')}</div>
    <button class="suggest" id="free"><span class="ti">🎮</span><span><b>اللعب الحر</b><br>كل الدروس والألعاب</span><span class="go">▶</span></button>
    <div class="card goal"><div class="row"><b>🎯 وقت الدراسة اليوم</b><span>${Math.floor(todaySec / 60)} / ${S.settings.goal} دقيقة</span></div>
      <div class="meter"><div style="width:${Math.min(100, todaySec / goal * 100)}%"></div></div></div>
    <div class="card"><div class="row"><b>🎁 ملصقاتي</b><span>${10 - (S.stars % 10)} نجوم للملصق التالي</span></div>
      <div class="stickers">${STICKERS.slice(0, unlocked).map(s => `<span class="on">${s}</span>`).join('')}${unlocked < STICKERS.length ? '<span class="off">🎁</span>' : ''}</div></div>`);
  if (nextL) $('#goNext').onclick = () => { sfx.tap(); go(runLesson, nextS, progOf(nextS)); };
  $('#free').onclick = () => { sfx.tap(); go(freePlay); };
  $$('.stone').forEach(b => b.onclick = () => {
    const s = b.dataset.s, i = +b.dataset.i;
    if (i > (S.path[s] || 0)) { sfx.no(); return teacher('🔒 هذا الدرس مقفول. نكمل الدرس الذي قبله أولًا 🙂'); }
    sfx.tap(); go(runLesson, s, i);
  });
  const h = new Date().getHours(), greet = h < 12 ? 'صباح الخير' : 'مساء الخير';
  const firstTime = first && !greeted; greeted = true;
  if (!nextL) return teacher(`أنهيتِ خطة اليوم يا ${NAME}! 🏆 أنا فخورة بكِ`);
  teacher(firstTime
    ? `${greet} يا ${NAME}! 🌸 أنا المعلمة ${TEACHER}. اليوم عندنا 3 دروس قصيرة. هيا نبدأ: ${nextL.t}! اضغطي على الزر الكبير ▶`
    : `${doneN ? 'رائع! ' : ''}الدرس التالي: ${nextL.t}. اضغطي على الزر الكبير ▶`);
}

// خريطة صغيرة: تعرض الدروس القريبة فقط حتى لا تتشتت
function mapRow(s) {
  const P = PATHS[s], prog = S.path[s] || 0, from = Math.max(0, Math.min(prog - 2, P.length - 6)), to = Math.min(P.length, from + 6);
  const done = Math.min(prog, P.length);
  const stones = [];
  for (let i = from; i < to; i++) {
    const L = P[i], st = i < prog ? 'done' : i === prog ? 'now' : 'lock';
    stones.push(`<button class="stone ${st}" data-s="${s}" data-i="${i}" title="${L.t}"><span class="${s === 'ar' ? 'ar-font' : ''}">${st === 'lock' ? '🔒' : L.i}</span>${st === 'done' ? `<small>${'⭐'.repeat(S.lessonStars[s + i] || 1)}</small>` : ''}</button>`);
  }
  return `<div class="map" style="--c:${SUBJ[s].c}"><div class="map-h"><b>${SUBJ[s].i} ${SUBJ[s].n}</b><small>${done} / ${P.length} درسًا</small></div>
    <div class="meter sm"><div style="width:${done / P.length * 100}%;background:${SUBJ[s].c}"></div></div>
    <div class="stones">${stones.join('')}</div></div>`;
}

function freePlay() {
  main(bar('🎮 اللعب الحر') + `<div class="subjects">${SUBJECTS.map((s, i) => `<button class="subj" style="--c:${s.c}" data-i="${i}"><span class="big">${s.icon}</span><b>${s.name}</b><small dir="auto">${s.sub}</small></button>`).join('')}</div>`);
  $$('.subj').forEach(b => b.onclick = () => { sfx.tap(); const s = SUBJECTS[b.dataset.i]; go(s.f(), ...(s.a || [])); });
  teacher('اختاري أي مادة تحبينها 🎮');
}

/* ---------- محرك الدرس ---------- */
function lessonBar() {
  return `<div class="bar lbar"><button class="back" onclick="back()" aria-label="خروج">✖</button><h2>${LES.title}</h2>
    <div class="dots">${Array.from({ length: LES.n }, (_, i) => `<span class="${i < LES.k ? 'd' : i === LES.k ? 'c' : ''}"></span>`).join('')}</div></div>`;
}

function runLesson(subj, idx) {
  const L = PATHS[subj][idx];
  const steps = STEPS[L.type](L, subj);
  const me = LES = { title: L.t, k: 0, n: steps.length, score: 0, total: 0 };
  const next = () => {
    if (LES !== me) return;
    if (me.k >= steps.length) return lessonDone(subj, idx);
    steps[me.k](() => { if (LES !== me) return; me.k++; next(); });
  };
  next();
}

// خطوة «تعرّفي»: تضغط على كل بطاقة لتسمعها، وزر التالي يظهر فقط بعدها
function meetStep(instr, cards, done) {
  main(lessonBar() + `<div class="meet-instr">👆 ${instr.t}</div>
    <div class="meet n${Math.min(cards.length, 5)}">${cards.map((c, k) => `<button class="meetc" data-k="${k}">${c.h}<span class="tick">✔</span></button>`).join('')}</div>
    <button class="btn big next-btn" id="nx" hidden>التالي ←</button>`);
  const sid = SCR, seen = new Set();
  teacher(instr.t, instr.say);
  $$('.meetc').forEach(b => b.onclick = () => {
    const c = cards[b.dataset.k];
    $$('.meetc').forEach(x => x.classList.remove('lit')); b.classList.add('lit', 'seen'); sfx.tap();
    seen.add(b.dataset.k);
    const all = seen.size === cards.length;
    speak(c.say).then(() => {
      if (all && sid === SCR && $('#nx').hidden) { $('#nx').hidden = false; teacher('أحسنتِ! الآن اضغطي «التالي» ←'); }
    });
  });
  $('#nx').onclick = () => { sfx.tap(); done(); };
}

function pickStep(n, make, done) {
  quiz({
    title: LES.title, total: n, make,
    onEnd: (s, t) => { if (LES) { LES.score += s; LES.total += t; } done(); },
  });
}

// خطوة «شاهدي»: مثال بالصور مع زر لإظهار الجواب
function showStep(text, before, after, sayAfter, done) {
  main(lessonBar() + `<div class="lcard"><p class="lead">${text}</p><div class="qbox" id="exv">${before}</div>
    <div class="btns"><button class="btn alt" id="show">👀 أريني</button><button class="btn big next-btn" id="nx" hidden>التالي ←</button></div></div>`);
  teacher(text);
  $('#show').onclick = () => { $('#exv').innerHTML = after; sfx.ok(); $('#show').hidden = true; speak(sayAfter).then(() => { $('#nx').hidden = false; }); };
  $('#nx').onclick = () => { sfx.tap(); done(); };
}

const ear = '<div class="emo-big ear">👂</div>';
const STEPS = {
  letter(L) {
    const l = letterOf(L.c), s = hsyl(L.c, 'fatha');
    const old = L.learned.filter(c => c !== L.c);
    return [
      done => meetStep({ t: `هذا حرف ${l.n}. اضغطي على البطاقتين 👆`, say: [[`هذا حرف ${l.n}. اضغطي على البطاقتين`, 'ar']] }, [
        { h: `<span class="ar-font huge">${L.c}</span>`, say: [[`حرف ${l.n}`, 'ar'], [s, 'ar'], [s, 'ar']] },
        { h: `<span class="emo">${l.e}</span><span class="ar-font wrd">${l.w}</span>`, say: [[l.w, 'ar'], [`${l.w} تبدأ بحرف ${l.n}`, 'ar']] },
      ], done),
      done => pickStep(4, i => {
        const t = i === 2 && old.length ? pick(old) : L.c, tl = letterOf(t);
        const q = i === 3
          ? { html: `<div class="emo-big">${tl.e}</div>`, text: `${tl.e} ${tl.w}... أين حرفها الأول؟`, say: [[tl.w, 'ar'], ['أين حرفها الأول؟', 'ar']] }
          : { html: ear, text: `أين حرف ${tl.n}؟ 👂`, say: [[`أين حرف ${tl.n}؟`, 'ar']] };
        return { ...q, key: 'ar:L:' + t, label: 'حرف ' + tl.n, cls: 'three',
          choices: shuffle([t, ...arOthers(t, L.learned)]).map(c => chA(c, c === t)), afterSay: [[`حرف ${tl.n}`, 'ar']] };
      }, done),
      done => trace([L.c], 0, 'ar', done),
    ];
  },

  haraka(L) {
    const h = H[L.h], letters = L.learned.slice(-3), known = L.harakat;
    return [
      done => meetStep({ t: `هذه ${h.n} ${MOUTH[L.h]} اضغطي عليها لتسمعي`, say: [[`هذه ${h.n}. اضغطي عليها`, 'ar']] }, [
        { h: `<span class="ar-font huge mark">◌${h.m}</span><span class="emo">${MOUTH[L.h]}</span>`, say: [[h.n, 'ar'], [h.d, 'ar']] },
      ], done),
      done => meetStep({ t: `اسمعي كل حرف مع ${h.n} 👂`, say: [[`اسمعي كل حرف مع ${h.n}`, 'ar']] },
        letters.map(c => ({ h: `<span class="ar-font huge">${hsyl(c, L.h)}</span>`, say: [[hsyl(c, L.h), 'ar'], [hsyl(c, L.h), 'ar']] })), done),
      done => pickStep(4, i => {
        const c = pick(letters), hid = known.length > 1 && i % 2 ? pick(known) : L.h, t = hsyl(c, hid);
        const opts = known.length > 1
          ? [hid, ...shuffle(known.filter(x => x !== hid)).slice(0, 2)].map(x => hsyl(c, x))
          : [c, ...arOthers(c, L.learned)].map(x => hsyl(x, hid));
        return { key: 'ar:H:' + hid, label: H[hid].n, cls: 'three', html: ear, text: 'اسمعي واختاري ما سمعتِ 👂',
          say: [['اسمعي', 'ar'], [t, 'ar'], [t, 'ar']], choices: shuffle(opts).map(x => chA(x, x === t)), afterSay: [[t, 'ar']] };
      }, done),
    ];
  },

  madd(L) {
    const forms = c => [c + H.fatha.m + 'ا', c + H.damma.m + 'و', c + H.kasra.m + 'ي'];
    const letters = L.learned.slice(-3);
    return [
      done => meetStep({ t: 'نمدّ الصوت طويلًا: آآآ، أوووو، إيييي. اضغطي واسمعي 👂', say: [['نمدّ الصوت طويلًا. اضغطي واسمعي', 'ar']] },
        forms(letters[0]).map(f => ({ h: `<span class="ar-font huge">${f}</span>`, say: [[f, 'ar'], [f, 'ar']] })), done),
      done => pickStep(4, () => {
        const c = pick(letters), opts = forms(c), t = pick(opts);
        return { key: 'ar:M', label: 'حروف المدّ', cls: 'three', html: ear, text: 'اسمعي واختاري 👂', say: [['اسمعي', 'ar'], [t, 'ar'], [t, 'ar']],
          choices: shuffle(opts).map(x => chA(x, x === t)), afterSay: [[t, 'ar']] };
      }, done),
    ];
  },

  review(L) {
    return [done => pickStep(6, i => {
      if (i % 2 === 0 || L.harakat.length < 2) {
        const t = pickWeighted(L.learned, c => 'ar:L:' + c), tl = letterOf(t);
        return { key: 'ar:L:' + t, label: 'حرف ' + tl.n, cls: 'three', html: ear, text: `أين حرف ${tl.n}؟ 👂`, say: [[`أين حرف ${tl.n}؟`, 'ar']],
          choices: shuffle([t, ...arOthers(t, L.learned)]).map(c => chA(c, c === t)), afterSay: [[`حرف ${tl.n}`, 'ar']] };
      }
      const c = pick(L.learned), hid = pickWeighted(L.harakat, x => 'ar:H:' + x), t = hsyl(c, hid);
      const opts = [hid, ...shuffle(L.harakat.filter(x => x !== hid)).slice(0, 2)].map(x => hsyl(c, x));
      return { key: 'ar:H:' + hid, label: H[hid].n, cls: 'three', html: ear, text: 'اسمعي واختاري 👂', say: [['اسمعي', 'ar'], [t, 'ar'], [t, 'ar']],
        choices: shuffle(opts).map(x => chA(x, x === t)), afterSay: [[t, 'ar']] };
    }, done)];
  },

  words(L) {
    const ok = w => [...plain(w.w)].every(ch => L.learned.includes(ch));
    let ws = AR_WORDS.filter(ok); if (ws.length < 3) ws = AR_WORDS;
    ws = shuffle(ws).slice(0, 3);
    return [
      done => meetStep({ t: 'اضغطي على كل كلمة: نقرأ جزءًا جزءًا ثم الكلمة كلها 📖', say: [['اضغطي على كل كلمة. نقرأ جزءًا جزءًا', 'ar']] },
        ws.map(w => ({ h: `<span class="emo">${w.e}</span><span class="ar-font wrd">${w.s.join(' - ')}</span><span class="ar-font wrd2">${w.w}</span>`,
          say: [...w.s.map(x => [x, 'ar']), [w.w, 'ar']] })), done),
      done => pickStep(3, i => {
        const t = ws[i % ws.length], others = shuffle(AR_WORDS.filter(x => x.e !== t.e)).slice(0, 2);
        return { key: 'ar:W:' + t.w, label: 'قراءة ' + t.w, cls: 'three', html: `<div class="ar-font qread">${t.w}</div>`,
          text: 'اقرئي الكلمة، ثم اختاري صورتها 🖼️', say: [['اقرئي الكلمة، ثم اختاري صورتها', 'ar']],
          choices: shuffle([t, ...others]).map(x => ({ h: `<span class="cemo">${x.e}</span>`, ok: x === t })), afterSay: [[t.w, 'ar']] };
      }, done),
    ];
  },

  count(L) {
    const e = pick(['🍎', '⭐', '🐟', '🎈', '🍓', '🐥']);
    return [
      done => meetStep({ t: 'اضغطي على كل رقم وعدّي معي 🔢', say: [['اضغطي على كل رقم وعدّي معي', 'ar']] },
        L.meet.map(n => ({ h: `<span class="huge num">${n}</span><span class="dots-o">${e.repeat(n)}</span>`,
          say: [[Array.from({ length: n }, (_, k) => AR(k + 1)).join('، '), 'ar']] })), done),
      done => pickStep(5, () => {
        const n = 1 + rnd(L.max), em = pick(['🍎', '⭐', '🐟', '🎈', '🌸', '🍓', '🐥', '🐞']);
        return { key: 'm:count', label: 'العدّ', cls: 'three', html: `<div class="objs ${n > 10 ? 'small' : ''}" dir="ltr">${objs(n, em)}</div>`,
          text: 'كم عددها؟ عدّي بإصبعك 👆', say: [['كم عددها؟ عُدّي بإصبعك', 'ar']], choices: numChoices(n).map(c => ({ ...c, ok: c.ok })),
          afterSay: [[Array.from({ length: n }, (_, k) => AR(k + 1)).join('، '), 'ar']] };
      }, done),
    ];
  },

  numrec(L) {
    const steps = [];
    if (L.meet) steps.push(done => meetStep({ t: 'اضغطي على كل رقم لتسمعي اسمه 🔢', say: [['اضغطي على كل رقم لتسمعي اسمه', 'ar']] },
      L.meet.map(n => ({ h: `<span class="huge num">${n}</span>`, say: [[AR(n), 'ar']] })), done));
    steps.push(done => pickStep(5, () => {
      const n = (L.meet && Math.random() < 0.6) ? pick(L.meet) : rnd(L.max + 1);
      const set = new Set([n]); while (set.size < 3) set.add(rnd(L.max + 1));
      return { key: 'm:num:' + n, label: 'الرقم ' + n, cls: 'three', html: ear, text: `أين الرقم ${AR(n)}؟ 👂`, say: [[`أين الرقم ${AR(n)}؟`, 'ar']],
        choices: shuffle([...set]).map(v => ({ h: `<span class="cnum">${v}</span>`, ok: v === n, dir: 'ltr' })), afterSay: [[AR(n), 'ar']] };
    }, done));
    return steps;
  },

  op(L) {
    const [a, b] = INTRO[L.op].ex;
    return [
      done => showStep(INTRO[L.op].t, mathVisual(L.op, a, b, false), mathVisual(L.op, a, b, true), [[mathAnswerSay(L.op, a, b), 'ar']], done),
      done => pickStep(5, () => {
        const [x, y] = genMath(L.op, L.lv);
        return { key: 'm:' + L.op, label: OPS[L.op].t, cls: 'three', html: mathVisual(L.op, x, y, false), reveal: mathVisual(L.op, x, y, true),
          text: mathSay(L.op, x, y), say: [[mathSay(L.op, x, y), 'ar']], choices: numChoices(calc(L.op, x, y)), afterSay: [[mathAnswerSay(L.op, x, y), 'ar']] };
      }, done),
    ];
  },

  theme(L, lang) {
    const items = LANGS[lang].themes[L.k].items.slice(L.a, L.b);
    return [
      done => meetStep({ t: 'اضغطي على كل صورة لتسمعي الكلمة 👂', say: [['اضغطي على كل صورة لتسمعي الكلمة', 'ar']] },
        items.map(([w, e, ar]) => ({ h: `<span class="emo">${e}</span><b class="latin" dir="ltr">${w}</b><small>${ar}</small>`, say: [[w, lang], [w, lang], [ar, 'ar']] })), done),
      done => pickStep(4, () => {
        const t = pickWeighted(items, x => lang + ':w:' + x[0]), others = shuffle(items.filter(x => x !== t)).slice(0, 2);
        return { key: lang + ':w:' + t[0], label: t[0] + ' (' + t[2] + ')', cls: 'three', html: ear, text: `أين <b dir="ltr">${t[0]}</b>؟ 👂`,
          say: [['أين', 'ar'], [t[0], lang]], choices: shuffle([t, ...others]).map(x => ({ h: `<span class="cemo">${x[1]}</span>`, ok: x === t })),
          afterSay: [[t[0], lang], [`يعني ${t[2]}`, 'ar']] };
      }, done),
    ];
  },

  letters(L, lang) {
    const al = LANGS[lang].alpha.slice(L.a, L.b);
    return [
      done => meetStep({ t: 'اضغطي على كل حرف لتسمعيه 👂', say: [['اضغطي على كل حرف لتسمعيه', 'ar']] },
        al.map(([c, w, e]) => ({ h: `<span class="huge latin" dir="ltr">${c}${c.toLowerCase()}</span><span class="emo sm">${e}</span>`, say: [[c, lang], [w, lang]] })), done),
      done => pickStep(4, () => {
        const t = pickWeighted(al, x => lang + ':L:' + x[0]), others = shuffle(al.filter(x => x !== t)).slice(0, 2);
        return { key: lang + ':L:' + t[0], label: 'الحرف ' + t[0], cls: 'three', html: ear, text: 'أين هذا الحرف؟ 👂', say: [['أين الحرف', 'ar'], [t[0], lang]],
          choices: shuffle([t, ...others]).map(x => ({ h: `<span class="cbig latin">${x[0]}</span>`, ok: x === t, dir: 'ltr' })), afterSay: [[t[0], lang], [t[1], lang]] };
      }, done),
      done => trace([al[0][0]], 0, lang, done),
    ];
  },
};

/* ---------- نهاية الدرس ---------- */
function lessonDone(subj, idx) {
  const me = LES, pct = me.total ? me.score / me.total : 1;
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1, pass = pct >= 0.6;
  if (pass && idx >= (S.path[subj] || 0)) S.path[subj] = idx + 1;
  if (pass) S.lessonStars[subj + idx] = Math.max(S.lessonStars[subj + idx] || 0, stars);
  const plan = todayPlan(), pi = plan.items.findIndex((s, i) => s === subj && !plan.done[i]);
  if (pi >= 0) plan.done[pi] = 1;
  const allDone = plan.done.every(Boolean) && !plan.prize;
  if (allDone) plan.prize = 1;
  save();
  addStars(stars + (allDone ? 5 : 0));
  LES = null;
  main(`<div class="end"><div class="trophy">${pass ? '🏆' : '🌱'}</div>
    <div class="big-stars">${[1, 2, 3].map(k => `<span class="${k <= stars ? 'on' : ''}">⭐</span>`).join('')}</div>
    <h2 class="end-t">${pass ? 'أنهيتِ الدرس!' : 'محاولة جميلة!'}</h2>
    ${allDone ? '<p class="lead">🎁 أنهيتِ خطة اليوم كلها: +5 نجوم!</p>' : ''}
    <div class="btns"><button class="btn big" id="brk">🤸 استراحة حركة</button></div></div>`);
  celebrate(true); sfx.win();
  teacher(pass ? `رائع يا ${NAME}! أنهيتِ درس ${PATHS[subj][idx].t} 🌟 الآن استراحة صغيرة نحرك فيها جسمنا!`
    : `أحسنتِ المحاولة يا ${NAME}! 💪 سنعيد هذا الدرس مرة أخرى لنصبح أقوى. الآن استراحة صغيرة!`);
  $('#brk').onclick = () => { sfx.tap(); replace(brainBreak); };
}

/* ---------- استراحة الحركة: تساعد على التركيز ---------- */
const BREAKS = [
  { e: '🐸', t: 'اقفزي مثل الضفدع 5 مرات!', n: 5 },
  { e: '👏', t: 'صفّقي معي 5 مرات!', n: 5 },
  { e: '🎈', t: 'خذي نفسًا عميقًا من أنفك، ثم انفخي ببطء مثل البالون. 3 مرات', n: 3, slow: 1 },
  { e: '🐧', t: 'امشي مثل البطريق ونحن نعدّ إلى 5', n: 5 },
  { e: '🦒', t: 'تمدّدي للأعلى مثل الزرافة، ثم انزلي. 3 مرات', n: 3, slow: 1 },
  { e: '🌳', t: 'قفي على رجل واحدة مثل الشجرة ونحن نعدّ إلى 5', n: 5, slow: 1 },
  { e: '🙆‍♀️', t: 'المسي رأسك، ثم كتفيك، ثم ركبتيك. 3 مرات', n: 3, slow: 1 },
];
function brainBreak() {
  const b = pick(BREAKS);
  main(`<div class="brk"><h2>🤸 استراحة حركة</h2><div class="brk-e">${b.e}</div><p class="lead">${b.t}</p>
    <div class="count" id="cnt"></div><button class="btn big" id="bdone" hidden>✔ انتهيت، أنا جاهزة!</button></div>`);
  const sid = SCR;
  teacher(b.t).then(() => {
    if (sid !== SCR) return;
    let k = 0;
    const step = () => {
      if (sid !== SCR) return;
      k++; $('#cnt').textContent = k; $('#cnt').classList.remove('pop'); void $('#cnt').offsetWidth; $('#cnt').classList.add('pop');
      sfx.tap(); speak([[AR(k), 'ar']]);
      if (k < b.n) later(step, b.slow ? 3200 : 1400);
      else later(() => { $('#bdone').hidden = false; teacher('برافو! جسمك نشيط والآن عقلك جاهز للتعلم 🧠'); }, 1200);
    };
    later(step, 700);
  });
  $('#bdone').onclick = () => { addStars(1); goHome(); };
}
