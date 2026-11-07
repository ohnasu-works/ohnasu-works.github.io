/* にゃんパス web体験「スピードクイズ」
 * アプリ（SpeedQuizView）と同じ考え方：制限時間内に、意味に合う用語を4つから選ぶ。
 *   正解でスコア＋コンボ。まちがえるとコンボが切れて、正解を少し表示。
 * 用語はアプリの用語データ（レベル1）から抜粋。意味の文はアプリのオリジナル。
 */
(function () {
  'use strict';
  var root = document.getElementById('npplay');
  if (!root) return;

  var TERMS = [{"f": "ストラテジ", "t": "3C分析", "m": "顧客・競合・​自社の​3つの​視点で​経営環境を​分析する​方法"}, {"f": "ストラテジ", "t": "ビッグデータ", "m": "量が​多く、​種類もさまざまで、​次々と​生まれ続ける​大量の​データ"}, {"f": "ストラテジ", "t": "SaaS", "m": "ソフトウェアの​機能を、​インターネット経由の​サービスと​して​使う​形"}, {"f": "ストラテジ", "t": "ブレーンストーミング", "m": "批判を​せず、​自由に​たくさん​アイデアを​出し合う​発想法"}, {"f": "ストラテジ", "t": "電子商取引", "m": "インターネットなどを​使って​商品や​サービスを​売買する​こと"}, {"f": "ストラテジ", "t": "フィンテック", "m": "金融と​ITを​組み合わせた、​新しい​サービスや​技術"}, {"f": "ストラテジ", "t": "BCP", "m": "災害や​事故が​起きても、​重要な​業務を​続けたり​早く​再開したりする​ための​計画"}, {"f": "ストラテジ", "t": "経営理念", "m": "企業が​存在する​目的や​価値観を​示した、​経営の​根本と​なる​考え方"}, {"f": "ストラテジ", "t": "オンプレミス", "m": "サーバなどの機器を​自社で​用意して、​自社で​運用する​形"}, {"f": "ストラテジ", "t": "4P", "m": "製品・価格・流通・販売促進の​4つの​要素で​考える​マーケティングの​方法"}, {"f": "ストラテジ", "t": "コアコンピタンス", "m": "他社が​まねできない、​自社の​中心と​なる​強み"}, {"f": "ストラテジ", "t": "散布図", "m": "2つの​データを​縦軸と​横軸に​とって​点を​打ち、​相関関係を​見る​図"}, {"f": "ストラテジ", "t": "パレート図", "m": "項目を​多い​順に​並べた​棒グラフと、​累積の​割合の​折れ線を​組み合わせた​図"}, {"f": "ストラテジ", "t": "イノベーション", "m": "新しい​技術や​考え方で、​これまでに​ない​価値を​生み出す​こと"}, {"f": "ストラテジ", "t": "要件定義", "m": "システムに​必要な​機能や​性能などを​明らかに​して、​決める​作業"}, {"f": "ストラテジ", "t": "GPS", "m": "人工衛星からの​電波を​使って、​今いる​位置を​知るしくみ"}, {"f": "ストラテジ", "t": "BtoB", "m": "企業どうしで​行う​取引"}, {"f": "ストラテジ", "t": "CtoC", "m": "消費者どうしで​行う​取引"}, {"f": "マネジメント", "t": "WBS", "m": "プロジェクトの​作業を、​管理しやすい​大きさまで​段階的に​細かく​分けた​図"}, {"f": "マネジメント", "t": "サービスデスク", "m": "利用者からの​問い合わせや​依頼を、​1か所で​受け付ける​窓口"}, {"f": "マネジメント", "t": "システムテスト", "m": "システム全体が、​要件の​とおりに​動くかを​確かめる​テスト"}, {"f": "マネジメント", "t": "受入れテスト", "m": "発注した​側​（利用者）が、​システムが​要件を​満たしているかを​確かめる​テスト"}, {"f": "マネジメント", "t": "UPS", "m": "停電した​とき、​しばらくの​間​コンピュータに​電気を​送る​装置"}, {"f": "マネジメント", "t": "チャットボット", "m": "利用者の​質問に、​自動で​会話の​形で​答える​プログラム"}, {"f": "マネジメント", "t": "ステークホルダ", "m": "プロジェクトに​関わったり、​影響を​受けたりする​人や​組織"}, {"f": "マネジメント", "t": "内部統制", "m": "業務を​正しく​効率よく​進め、​不正や​誤りを​防ぐ​ために、​組織の​中に​作るしくみ"}, {"f": "マネジメント", "t": "プロジェクト", "m": "決められた​期間に、​特定の​目的を​達成する​ために​行う​一時的な​活動"}, {"f": "マネジメント", "t": "単体テスト", "m": "プログラムの​部品​（モジュール）を​1つずつ​確かめる​テスト"}, {"f": "マネジメント", "t": "ガントチャート", "m": "作業ごとの​予定と​実績を、​横棒で​表した​工程表"}, {"f": "マネジメント", "t": "結合テスト", "m": "複数の​モジュールを​組み合わせて、​正しく​連携するかを​確かめる​テスト"}, {"f": "テクノロジ", "t": "論理和", "m": "2つの​条件の​どちらか​一方でも​真なら、​真に​なる​演算"}, {"f": "テクノロジ", "t": "PNG", "m": "画質を​落とさずに​圧縮でき、​透明も​扱える​画像の​ファイル形式"}, {"f": "テクノロジ", "t": "バイト", "m": "8ビットを​ひとまとめに​した​情報の​単位"}, {"f": "テクノロジ", "t": "GUI", "m": "アイコンや​ボタンなどの​絵を​使って、​マウスや​指で​操作する​画面の​しくみ"}, {"f": "テクノロジ", "t": "完全性", "m": "情報が​正しく、​改ざんされていない​状態を​保つこと"}, {"f": "テクノロジ", "t": "DNS", "m": "ドメイン名と​IPアドレスを​結びつける​しくみ"}, {"f": "テクノロジ", "t": "HTTPS", "m": "HTTPの​通信を、​TLSで​暗号化して​安全に​した​もの"}, {"f": "テクノロジ", "t": "USB", "m": "パソコンと​周辺機器を​つなぐ​ための、​代表的な​インタフェース"}, {"f": "テクノロジ", "t": "WAN", "m": "離れた​場所に​ある​LANどうしを、​通信事業者の​回線で​つなぐ​ネットワーク"}, {"f": "テクノロジ", "t": "プロトコル", "m": "コンピュータどうしが​通信する​ために​決められた​約束ごと"}, {"f": "テクノロジ", "t": "アクセシビリティ", "m": "お年寄りや​障害の​ある​人も​含め、​だれもが​利用しやすい​こと"}, {"f": "テクノロジ", "t": "バックアップ", "m": "データが​壊れたり​消えたりした​ときの​ために、​複製を​別に​保存しておく​こと"}, {"f": "テクノロジ", "t": "平均値", "m": "データの​値を​すべて​足して、​データの​個数で​割った​値"}, {"f": "テクノロジ", "t": "テザリング", "m": "スマートフォンを​中継に​して、​パソコンなどを​インターネットに​つなぐ​こと"}, {"f": "テクノロジ", "t": "SSD", "m": "フラッシュメモリを​使った​記憶装置。​HDDより​速く、​衝撃に​強い"}, {"f": "テクノロジ", "t": "否定", "m": "真と​偽を​反対に​する​演算"}, {"f": "テクノロジ", "t": "ビット", "m": "コンピュータが​扱う​情報の​いちばん​小さい​単位。​0か​1かを​表す"}, {"f": "テクノロジ", "t": "bps", "m": "1秒間に​送れる​データの​ビット数を​表す、​通信速度の​単位"}, {"f": "テクノロジ", "t": "ウェアラブル端末", "m": "腕時計や​メガネのように、​身に​つけて​使う​端末"}, {"f": "テクノロジ", "t": "変数", "m": "プログラムの​中で、​値を​一時的に​入れておく​箱のような​もの"}, {"f": "テクノロジ", "t": "プログラム言語", "m": "コンピュータへの​指示を​書く​ための​言語"}, {"f": "テクノロジ", "t": "関係データベース", "m": "データを、​行と​列からなる​表の​形で​管理する​データベース"}, {"f": "テクノロジ", "t": "OS", "m": "ハードウェアを​管理し、​アプリが​動く​ための​土台に​なる​基本の​ソフトウェア"}, {"f": "テクノロジ", "t": "VR", "m": "コンピュータで​作った​仮想の​世界を、​まるで​現実のように​体験できる​技術"}];
  var SECONDS = 30, CHOICES = 4;

  var $ = function (s) { return root.querySelector(s); };
  var scr = { lobby: $('.nyplay-lobby'), play: $('.nyplay-play'), result: $('.nyplay-result') };

  // ---- 効果音（ブラウザ内で合成。最初はオフ）----
  var ac = null, muted = true;
  try { muted = localStorage.getItem('npplay.sound') !== 'on'; } catch (e) { muted = true; }
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
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  var SE = {
    go: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.08, 0.14, 'square', 0.08); }); },
    correct: function () { tone(988, 0.02, 0.09, 'square', 0.08); tone(1319, 0.11, 0.2, 'square', 0.08); },
    combo: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, 0.02 + i * 0.06, 0.12, 'square', 0.07); }); },
    wrong: function () { tone(220, 0.02, 0.18, 'sawtooth', 0.08, 160); },
    tick: function () { tone(1200, 0, 0.05, 'square', 0.05); },
    clear: function () { [523, 659, 784, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, i === 5 ? 0.5 : 0.13, 'square', 0.08); }); }
  };

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function show(name) { Object.keys(scr).forEach(function (k) { scr[k].hidden = k !== name; }); }

  var deck, cur, score, combo, best, correct, answered, log, endAt, timer, locked, lastTick;

  function start() {
    audio(); SE.go();
    deck = shuffle(TERMS.slice()); score = 0; combo = 0; best = 0; correct = 0; answered = 0; log = [];
    endAt = Date.now() + SECONDS * 1000; lastTick = SECONDS;
    show('play'); next(); updateTop();
    clearInterval(timer); timer = setInterval(tickTimer, 100);
  }

  function tickTimer() {
    var left = Math.max(0, (endAt - Date.now()) / 1000);
    var bar = $('.np-timebar i'); bar.style.width = (left / SECONDS * 100) + '%';
    bar.classList.toggle('hurry', left <= 5);
    $('.np-time').textContent = Math.ceil(left) + '秒';
    if (left <= 5 && Math.ceil(left) < lastTick) { lastTick = Math.ceil(left); SE.tick(); }
    if (left <= 0) finish();
  }

  function next() {
    if (!deck.length) deck = shuffle(TERMS.slice());
    cur = deck.pop(); locked = false;
    var pool = shuffle(TERMS.filter(function (t) { return t.f === cur.f && t.t !== cur.t; })).slice(0, CHOICES - 1);
    var opts = shuffle(pool.concat([cur]));
    $('.np-field').textContent = cur.f + '系';
    $('.np-meaning').textContent = cur.m;
    var box = $('.np-choices'); box.innerHTML = '';
    opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'np-choice'; b.textContent = o.t;
      b.addEventListener('click', function () { answer(b, o); });
      box.appendChild(b);
    });
  }

  function answer(btn, o) {
    if (locked) return; locked = true; answered++;
    var ok = o.t === cur.t;
    log.push({ t: cur.t, m: cur.m, ok: ok });
    if (ok) {
      combo++; best = Math.max(best, combo); correct++;
      var pts = 100 + Math.min(combo - 1, 5) * 20;
      score += pts;
      btn.classList.add('ok');
      (combo >= 3 ? SE.combo : SE.correct)();
      pop('+' + pts, false);
      updateTop();
      setTimeout(next, 350);
    } else {
      combo = 0; btn.classList.add('ng'); SE.wrong();
      [].forEach.call(root.querySelectorAll('.np-choice'), function (b) { if (b.textContent === cur.t) b.classList.add('ok'); });
      pop('ざんねん', true);
      updateTop();
      setTimeout(next, 1100);
    }
  }

  function pop(text, boo) {
    var el = document.createElement('div');
    el.className = 'np-pop' + (boo ? ' boo' : ''); el.textContent = text;
    $('.np-qcard').appendChild(el);
    setTimeout(function () { el.remove(); }, 800);
  }

  function updateTop() {
    $('.nyplay-score').textContent = score + '点';
    var c = $('.nyplay-combo');
    c.textContent = combo + 'コンボ';
    c.classList.toggle('on', combo >= 2);
  }

  function finish() {
    clearInterval(timer); locked = true;
    SE.clear();
    var stars = correct >= 10 ? 3 : correct >= 6 ? 2 : 1;
    var r = scr.result;
    r.querySelector('.nyplay-stars').innerHTML = '★★★'.slice(0, stars) + '<span class="off">' + '★★★'.slice(0, 3 - stars) + '</span>';
    r.querySelector('.nyplay-score').textContent = score + '点\u200b（' + answered + '問中\u00a0' + correct + '問正解・\u200b最大' + best + 'コンボ）';
    r.querySelector('.np-say').textContent = stars === 3 ? 'すごいニャ！\u200b本番も\u200bこの調子ニャ！' : stars === 2 ? 'いい感じニャ！\u200bアプリで\u200b用語を\u200bもっと\u200b覚えるニャ！' : 'まずは\u200b用語からニャ！\u200bアプリの\u200b教本で\u200bいっしょに\u200bがんばるニャ！';
    var ul = r.querySelector('.nyplay-words'); ul.innerHTML = '';
    log.slice(-8).forEach(function (w) {
      var li = document.createElement('li');
      var k = document.createElement('span'); k.className = 'k'; k.textContent = w.t;
      var m = document.createElement('span'); m.className = 'm'; m.textContent = w.m;
      var s = document.createElement('span'); s.className = 'ok'; s.textContent = w.ok ? '⭕' : '❌';
      li.appendChild(k); li.appendChild(m); li.appendChild(s); ul.appendChild(li);
    });
    ul.hidden = !log.length;
    show('result');
  }

  root.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'start') start();
    if (act === 'mute') {
      muted = !muted;
      try { localStorage.setItem('npplay.sound', muted ? 'off' : 'on'); } catch (e2) {}
      paintMute(); if (!muted) { audio(); SE.correct(); }
    }
  });
  var muteBtn = root.querySelector('[data-act="mute"]');
  function paintMute() {
    muteBtn.textContent = muted ? '🔇 音オフ' : '🔊 音オン';
    muteBtn.setAttribute('aria-pressed', muted ? 'false' : 'true');
    muteBtn.classList.toggle('on', !muted);
  }
  paintMute();
})();
