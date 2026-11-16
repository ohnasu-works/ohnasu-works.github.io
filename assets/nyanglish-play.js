/* にゃんグリッシュ：ブラウザで遊べるタイピング体験（45秒） */
(function () {
  var root = document.getElementById('typplay');
  if (!root) return;
  var WORDS = [
    ['apple','りんご'],['happy','うれしい'],['school','学校'],['friend','友だち'],['water','水'],['music','音楽'],
    ['dream','夢'],['house','家'],['family','家族'],['morning','朝'],['summer','夏'],['winter','冬'],['teacher','先生'],
    ['study','勉強する'],['bread','パン'],['garden','庭'],['window','窓'],['flower','花'],['travel','旅行する'],
    ['camera','カメラ'],['answer','答え'],['question','質問'],['library','図書館'],['station','駅'],['kitchen','台所'],
    ['weather','天気'],['holiday','休日'],['picture','写真'],['country','国'],['language','言語'],['breakfast','朝食'],
    ['umbrella','かさ'],['birthday','誕生日'],['beautiful','美しい'],['important','大切な'],['remember','覚えている'],
    ['practice','練習する'],['hospital','病院'],['airport','空港'],['monster','怪物'],['brave','勇敢な'],['quiet','静かな'],
    ['strong','強い'],['tomorrow','明日'],['yesterday','昨日'],['welcome','ようこそ'],['thank','感謝する'],['sorry','すまなく思う']
  ];
  var FOES = ['f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12'];
  var $ = function (s) { return root.querySelector(s); };
  var lobby = $('.typ-lobby'), play = $('.typ-play'), result = $('.typ-result');
  var foeEl = $('.typ-foe'), foeImg = $('.typ-foe img'), jaEl = $('.typ-word .ja'), enEl = $('.typ-word .en');
  var timeEl = $('.typ-time'), scoreEl = $('.typ-score'), comboEl = $('.typ-combo'), heartsEl = $('.typ-hearts');
  var input = $('.typ-input'), muteBtn = $('.typ-mute');
  var sound = false, running = false, word = null, typed = 0, miss = false;
  var score = 0, combo = 0, best = 0, lives = 3, left = 45, approach = 0, keys = 0, beaten = [];
  var tickId = null, last = 0, queue = [];

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function show(el) { [lobby, play, result].forEach(function (s) { s.hidden = s !== el; }); }
  function say(t) {
    if (!sound || !('speechSynthesis' in window)) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {}
  }
  function beep(f, d) {
    if (!sound) return;
    try {
      var c = beep.c || (beep.c = new (window.AudioContext || window.webkitAudioContext)());
      var o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; o.type = 'triangle';
      g.gain.setValueAtTime(.12, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + d);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d);
    } catch (e) {}
  }
  function nextWord() {
    if (!queue.length) queue = shuffle(WORDS.slice());
    word = queue.pop(); typed = 0; miss = false; approach = 0;
    foeImg.src = 'img/foes/' + FOES[Math.floor(Math.random() * FOES.length)] + '.webp';
    foeEl.classList.remove('hit'); jaEl.textContent = word[1]; input.value = ''; draw();
  }
  function draw() {
    var w = word[0];
    enEl.innerHTML = '<span class="ok">' + w.slice(0, typed) + '</span><span class="' + (miss ? 'miss' : 'rest') + '">' + w.slice(typed) + '</span>';
    scoreEl.textContent = score + '点';
    comboEl.textContent = combo >= 2 ? combo + ' COMBO' : '';
    heartsEl.textContent = '♥'.repeat(lives) + '♡'.repeat(3 - lives);
    var s = 0.35 + approach * 0.65;
    foeEl.style.transform = 'translateX(-50%) scale(' + s.toFixed(3) + ')';
  }
  function key(ch) {
    if (!running || !word) return;
    ch = ch.toLowerCase();
    if (!/^[a-z]$/.test(ch)) return;
    keys++;
    if (ch === word[0][typed]) {
      typed++; miss = false; beep(660 + typed * 30, .06);
      if (typed >= word[0].length) {
        combo++; best = Math.max(best, combo);
        score += word[0].length * 10 + Math.min(combo, 10) * 5 + Math.round((1 - approach) * 20);
        beaten.push(word[0]); say(word[0]); foeEl.classList.add('hit'); beep(990, .15);
        var w = word; word = null; draw2(w);
        setTimeout(function () { if (running) nextWord(); }, 420);
        return;
      }
    } else { miss = true; combo = 0; beep(180, .12); }
    draw();
  }
  function draw2(w) { enEl.innerHTML = '<span class="ok">' + w[0] + '</span>'; scoreEl.textContent = score + '点'; comboEl.textContent = combo >= 2 ? combo + ' COMBO' : ''; }
  function loop(t) {
    if (!running) return;
    var dt = last ? (t - last) / 1000 : 0; last = t;
    left -= dt; timeEl.textContent = Math.max(0, Math.ceil(left)) + '秒';
    if (word) {
      approach += dt / 6.5;
      if (approach >= 1) { lives--; combo = 0; beep(120, .25); if (lives <= 0) return end(); nextWord(); }
      else draw();
    }
    if (left <= 0) return end();
    tickId = requestAnimationFrame(loop);
  }
  function start() {
    score = 0; combo = 0; best = 0; lives = 3; left = 45; keys = 0; beaten = []; queue = []; last = 0;
    show(play); running = true; nextWord();
    if (matchMedia('(pointer: coarse)').matches) setTimeout(function () { input.focus(); }, 50);
    tickId = requestAnimationFrame(loop);
  }
  function end() {
    running = false; cancelAnimationFrame(tickId); word = null; show(result);
    $('.typ-result .big').textContent = score + '点';
    $('.typ-result .sub').textContent = beaten.length + '体たおした · 最大' + best + 'コンボ';
    var ul = $('.typ-list'); ul.innerHTML = '';
    beaten.forEach(function (w) { var li = document.createElement('li'); li.textContent = w; ul.appendChild(li); });
  }
  root.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'start') start();
    if (act === 'mute') { sound = !sound; a.textContent = sound ? '🔊 音オン' : '🔇 音オフ'; a.setAttribute('aria-pressed', sound); }
  });
  document.addEventListener('keydown', function (e) {
    if (!running || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.activeElement === input) return; // handled by input
    if (e.key.length === 1) { key(e.key); e.preventDefault(); }
  });
  input.addEventListener('input', function () {
    var v = input.value; input.value = '';
    for (var i = 0; i < v.length; i++) key(v[i]);
  });
  play.addEventListener('click', function () { if (matchMedia('(pointer: coarse)').matches) input.focus(); });
})();
