/* にゃんグル web体験「バルーンキャッチ」
 * アプリ（BalloonListeningView）と同じルール：
 *   DJハムが韓国語を言う → その言葉の風船が下から上がる → 空に逃げる前にタップして割る
 *   ちがう風船を割る・逃がすとライフが減る（ライフ3）
 * 単語はアプリの単語データ（レベル1）から抜粋。読み上げはブラウザの韓国語音声を使う。
 */
(function () {
  'use strict';
  var root = document.getElementById('nyplay');
  if (!root) return;

  // ---- 単語（アプリの VocabularyData・レベル1から）----
  var WORDS = [
    ['안녕하세요', 'こんにちは', 'greet'], ['감사합니다', 'ありがとうございます', 'greet'], ['미안해요', 'ごめんなさい', 'greet'], ['괜찮아요', '大丈夫です', 'greet'],
    ['엄마', 'お母さん', 'family'], ['아빠', 'お父さん', 'family'], ['친구', '友達', 'family'], ['동생', '弟・妹', 'family'],
    ['오늘', '今日', 'time'], ['내일', '明日', 'time'], ['어제', '昨日', 'time'], ['지금', '今', 'time'],
    ['밥', 'ご飯', 'food'], ['물', '水', 'food'], ['김치', 'キムチ', 'food'], ['커피', 'コーヒー', 'food'],
    ['집', '家', 'place'], ['학교', '学校', 'place'], ['회사', '会社', 'place'], ['가게', '店', 'place'],
    ['가다', '行く', 'verb'], ['오다', '来る', 'verb'], ['먹다', '食べる', 'verb'], ['마시다', '飲む', 'verb'],
    ['사랑해요', '愛してます', 'emo'], ['보고 싶어요', '会いたいです', 'emo'], ['행복해요', '幸せです', 'emo'], ['슬퍼요', '悲しいです', 'emo'],
    ['노래', '歌', 'stage'], ['가수', '歌手', 'stage'], ['춤', 'ダンス', 'stage'], ['팬', 'ファン', 'stage'],
    ['바다', '海', 'nature'], ['날씨', '天気', 'nature'], ['비', '雨', 'nature'], ['버스', 'バス', 'nature']
  ];
  var ROUNDS = 5, LIVES = 3, CHOICES = 3, RISE = 7.2; // RISE: 風船が下から上まで上がる秒数
  var COLORS = ['#FF5C93', '#37A7FF', '#1FCB8B', '#FF8C2E', '#7B61FF'];
  var IMG = root.getAttribute('data-img') || '../assets/img/nyangul/';

  var $ = function (s) { return root.querySelector(s); };
  var stage = $('.nyplay-stage'), sky = $('.nyplay-sky');
  var scr = { lobby: $('.nyplay-lobby'), play: $('.nyplay-play'), result: $('.nyplay-result') };

  // ---- 効果音（ブラウザ内で合成。ファイル読み込みなし）----
  var ac = null, muted = false;
  function audio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, start, dur, type, vol, slideTo) {
    var a = audio(); if (!a || muted) return;
    var t = a.currentTime + start, o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(start, dur, vol) {
    var a = audio(); if (!a || muted) return;
    var len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    var s = a.createBufferSource(), g = a.createGain(), t = a.currentTime + start;
    s.buffer = buf; g.gain.value = vol || 0.3; s.connect(g); g.connect(a.destination); s.start(t);
  }
  var SE = {
    go: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.08, 0.14, 'square', 0.08); }); },
    pop: function () { noise(0, 0.12, 0.35); tone(900, 0, 0.08, 'triangle', 0.1, 300); },
    correct: function () { tone(988, 0.02, 0.09, 'square', 0.08); tone(1319, 0.11, 0.2, 'square', 0.08); },
    combo: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, 0.02 + i * 0.06, 0.12, 'square', 0.07); }); },
    wrong: function () { tone(220, 0.02, 0.18, 'sawtooth', 0.08, 160); tone(165, 0.2, 0.25, 'sawtooth', 0.08, 110); },
    whoosh: function () { tone(500, 0, 0.3, 'sine', 0.08, 1400); },
    clear: function () { [523, 659, 784, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, i === 5 ? 0.5 : 0.13, 'square', 0.08); }); },
    over: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, i * 0.16, 0.2, 'triangle', 0.12); }); }
  };

  // ---- 韓国語の読み上げ（端末に韓国語音声がある時だけ）----
  var koVoice = null, canSpeak = 'speechSynthesis' in window;
  function pickVoice() {
    if (!canSpeak) return;
    var vs = speechSynthesis.getVoices() || [];
    koVoice = vs.filter(function (v) { return /^ko/i.test(v.lang); })[0] || null;
  }
  if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, slow) {
    if (!canSpeak || muted) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR'; if (koVoice) u.voice = koVoice; u.rate = slow ? 0.55 : 0.9;
      speechSynthesis.speak(u);
    } catch (e) { /* 読み上げできない端末ではヒントだけで遊べる */ }
  }

  // ---- 状態 ----
  var st = {};
  function show(name) { Object.keys(scr).forEach(function (k) { scr[k].hidden = k !== name; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function start() {
    audio(); SE.go();
    st = { lives: LIVES, score: 0, combo: 0, round: 0, log: [], deck: shuffle(WORDS).slice(0, ROUNDS), q: null, balloons: [], result: null, raf: 0, busy: false };
    renderTop(); show('play');
    // スマホではゲーム画面全体が見える位置までスクロール
    var rect = stage.getBoundingClientRect();
    if (rect.top < 60 || rect.bottom > window.innerHeight) {
      try { stage.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { stage.scrollIntoView(); }
    }
    setTimeout(next, 650);
  }

  function next() {
    var item = st.deck[st.round];
    // ダミーは同じジャンル優先＋他ジャンルから（意味が近すぎない3択）
    var same = shuffle(WORDS.filter(function (w) { return w[2] === item[2] && w[0] !== item[0]; }));
    var other = shuffle(WORDS.filter(function (w) { return w[2] !== item[2]; }));
    var choices = shuffle([item, same[0], other[0]].slice(0, CHOICES));
    var lanes = shuffle([0, 0.5, 1]);
    st.q = { item: item, choices: choices, answer: choices.indexOf(item) };
    st.result = null; st.busy = false;
    sky.innerHTML = '';
    var flash = $('.nyplay-flash'); if (flash) flash.remove();
    st.balloons = choices.map(function (w, i) {
      var el = document.createElement('button');
      el.type = 'button'; el.className = 'nyb'; el.setAttribute('aria-label', w[0]);
      var c = COLORS[(st.round + i) % COLORS.length];
      el.style.setProperty('--c', c);
      el.innerHTML = '<span class="body" style="background:' + c + '"><span class="word">' + w[0] + '</span></span>' +
        '<span class="knot"></span><svg width="16" height="46" viewBox="0 0 16 46"><path d="M8 0 C16 16, 0 32, 8 46" fill="none" stroke="#2B2135" stroke-width="2"/></svg>';
      el.style.border = '0'; el.style.background = 'none'; el.style.padding = '0';
      el.addEventListener('pointerdown', function (e) { e.preventDefault(); tap(i); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(i); } });
      sky.appendChild(el);
      return { el: el, lane: lanes[i], delay: Math.random() * 0.9, speed: 0.88 + Math.random() * 0.24, sway: Math.random() * 6, popped: false };
    });
    $('.nyplay-hint small').textContent = koVoice ? '聞こえた言葉の風船を割ろう！' : 'この意味の風船を割ろう！';
    $('.nyplay-hint b').textContent = 'ヒント：' + item[1];
    $('.nyplay-round').textContent = (st.round + 1) + ' / ' + ROUNDS;
    st.t0 = performance.now() + 500;
    speak(item[0]);
    cancelAnimationFrame(st.raf);
    st.raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    var W = sky.clientWidth, H = sky.clientHeight;
    var fleeT = st.result ? (now - st.resultAt) / 1000 : 0;
    st.balloons.forEach(function (b, i) {
      if (b.popped) return;
      var t = (now - st.t0) / 1000 - b.delay;
      var p = Math.max(0, t) / RISE * b.speed;
      var y = H + 30 - p * (H + 230) - fleeT * 520;
      var x = (0.17 + b.lane * 0.66) * W + Math.sin(t * 1.6 + b.sway) * 12;
      var tilt = Math.sin(t * 1.6 + b.sway) * 6;
      b.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + tilt.toFixed(1) + 'deg)';
      b.el.style.visibility = t > -0.05 ? 'visible' : 'hidden';
      b.x = x; b.y = y;
      // 正解の風船が空へ逃げたらミス
      if (!st.result && i === st.q.answer && p >= 1.05) { SE.whoosh(); resolve(false); }
    });
    if (!(st.result && fleeT > 1.2)) st.raf = requestAnimationFrame(frame);
  }

  function tap(i) {
    if (st.result || !st.q) return;
    var b = st.balloons[i]; b.popped = true;
    SE.pop(); burst(b.x, b.y + 58, b.el.style.getPropertyValue('--c'), i === st.q.answer);
    b.el.remove();
    resolve(i === st.q.answer);
  }

  function burst(x, y, color, good) {
    var box = document.createElement('div'); box.className = 'nyplay-burst';
    box.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    for (var k = 0; k < 10; k++) {
      var a = k / 10 * Math.PI * 2, s = document.createElement('i');
      s.style.background = k % 2 ? '#FFC928' : color;
      s.style.transform = 'rotate(' + (a + Math.PI / 2) + 'rad)';
      s.style.setProperty('--dx', (Math.cos(a) * 80).toFixed(0) + 'px');
      s.style.setProperty('--dy', (Math.sin(a) * 80).toFixed(0) + 'px');
      s.style.setProperty('--r', (a * 57 + 90).toFixed(0) + 'deg');
      box.appendChild(s);
    }
    var w = document.createElement('b'); w.textContent = good ? 'POP!' : 'BOO!'; if (!good) w.className = 'boo';
    box.appendChild(w); sky.appendChild(box);
    setTimeout(function () { box.remove(); }, 900);
  }

  function resolve(correct) {
    if (st.result) return;
    var q = st.q, gain = 0;
    st.result = correct ? 'ok' : 'miss'; st.resultAt = performance.now();
    st.round += 1;
    if (correct) {
      st.combo += 1;
      var target = st.balloons[q.answer], t = (performance.now() - st.t0) / 1000 - target.delay;
      var remaining = Math.max(0, 1 - t / RISE * target.speed);
      gain = 10 + Math.round(remaining * 8) + Math.min(st.combo, 5);
      st.score += gain;
      (st.combo >= 3 ? SE.combo : SE.correct)();
    } else {
      st.combo = 0; st.lives -= 1; SE.wrong();
      setTimeout(function () { speak(q.item[0]); }, 250);
    }
    st.log.push({ w: q.item, ok: correct });
    $('.nyplay-hint b').textContent = q.item[0] + ' ＝ ' + q.item[1];
    var f = document.createElement('div'); f.className = 'nyplay-flash';
    f.textContent = correct ? '+' + gain : 'ミス！';
    f.style.color = correct ? '#FFC928' : '#FF4757';
    stage.querySelector('.nyplay-play').appendChild(f);
    renderTop();
    setTimeout(function () {
      if (scr.play.hidden) return; // 途中で止めた時は進めない
      if (st.lives <= 0 || st.round >= ROUNDS) finish(); else next();
    }, correct ? 950 : 1750);
  }

  function renderTop() {
    var h = '';
    for (var i = 0; i < LIVES; i++) h += i < st.lives ? '❤️' : '🤍';
    $('.nyplay-hearts').textContent = h;
    $('.nyplay-hearts').setAttribute('aria-label', 'ライフ ' + st.lives);
    $('.nyplay-score').textContent = '⭐ ' + st.score;
    var c = $('.nyplay-combo');
    c.textContent = st.combo + ' COMBO!';
    c.classList.toggle('on', st.combo >= 2);
  }

  function finish() {
    cancelAnimationFrame(st.raf);
    if (canSpeak) speechSynthesis.cancel();
    var okCount = st.log.filter(function (l) { return l.ok; }).length;
    var cleared = st.lives > 0;
    var stars = okCount === ROUNDS ? 3 : okCount >= 3 ? 2 : okCount >= 1 ? 1 : 0;
    (cleared ? SE.clear : SE.over)();
    var r = scr.result;
    r.querySelector('.pic').src = IMG + (cleared ? 'react_trio_perfect.jpg' : 'cast_nyan.jpg');
    r.querySelector('.pic').alt = cleared ? 'ユナ・テヒョン・ニャンが大喜びしているイラスト' : 'サングラスのネコ、ニャン';
    r.querySelector('.nyplay-title').textContent = okCount === ROUNDS ? 'パーフェクト！' : cleared ? 'クリア！' : 'ゲームオーバー';
    r.querySelector('.nyplay-stars').textContent = '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars);
    r.querySelector('.nyplay-score').textContent = 'スコア ' + st.score + '　・　' + st.log.length + '問中 ' + okCount + '問正解';
    var ul = r.querySelector('.nyplay-words'); ul.innerHTML = '';
    st.log.forEach(function (l) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="k"></span><span class="j"></span><span class="ok">' + (l.ok ? '⭕' : '❌') + '</span>';
      li.querySelector('.k').textContent = l.w[0];
      li.querySelector('.j').textContent = l.w[1];
      if (canSpeak && koVoice) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = '🔊'; b.setAttribute('aria-label', l.w[0] + ' を聞く');
        b.addEventListener('click', function () { speak(l.w[0]); });
        li.insertBefore(b, li.firstChild);
      }
      ul.appendChild(li);
    });
    show('result');
    r.scrollTop = 0;
  }

  // ---- ボタン ----
  root.querySelectorAll('[data-act="start"]').forEach(function (b) { b.addEventListener('click', start); });
  root.querySelector('[data-act="say"]').addEventListener('click', function () { if (st.q) speak(st.q.item[0]); });
  root.querySelector('[data-act="slow"]').addEventListener('click', function () { if (st.q) speak(st.q.item[0], true); });
  var muteBtn = root.querySelector('[data-act="mute"]');
  muteBtn.addEventListener('click', function () {
    muted = !muted; muteBtn.textContent = muted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', muted ? '音を出す' : '音を消す');
    if (muted && canSpeak) speechSynthesis.cancel();
  });
  // 読み上げボタンは、韓国語の音声が使える端末だけ表示
  function syncSpeakButtons() {
    var on = !!(canSpeak && koVoice);
    root.querySelectorAll('.nyplay-speak').forEach(function (b) { b.hidden = !on; });
  }
  syncSpeakButtons();
  if (canSpeak) speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', syncSpeakButtons);

  // 画面外に出たら止める（スクロールで離れた時に音が鳴り続けないように）
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting && !scr.play.hidden && st.q) { cancelAnimationFrame(st.raf); if (canSpeak) speechSynthesis.cancel(); show('lobby'); st.q = null; }
      });
    }, { threshold: 0.15 }).observe(stage);
  }
  show('lobby');
})();
