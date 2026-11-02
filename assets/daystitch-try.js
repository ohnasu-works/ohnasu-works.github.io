/* Daystitch「触れるToDo」デモ
 * アプリの ToDo と同じ並び：今日／いつか／完了（終わったものはここにまとまる）
 * チェック項目（サブタスク）・繰り返し・紙の色の切り替えを体験できる。データは保存しない。
 */
(function () {
  'use strict';
  var root = document.getElementById('dstry');
  if (!root) return;
  var screen = root.querySelector('.screen');
  var list = root.querySelector('.dstry-list');
  var toastEl = root.querySelector('.dstry-toast');
  var CHECK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5l2.6 2.6L10 3.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var uid = 0;
  function item(o) { o.id = ++uid; o.done = false; return o; }
  // アプリのスクリーンショットと同じ ToDo（今日・明日以降・いつか）
  var items = [
    item({ list: 'today', t: '企画書のドラフトを仕上げる', meta: '今日', sub: [['構成を決める', true], ['グラフを作る', true], ['見直して送る', false]] }),
    item({ list: 'today', t: '請求書を送る', meta: '今日', flag: '締切 今日' }),
    item({ list: 'today', t: '経費精算', meta: '今日' }),
    item({ list: 'today', t: '牛乳とパンを買う', meta: '今日' }),
    item({ list: 'later', t: 'ゴミ出し', meta: '明日', rep: '毎週' }),
    item({ list: 'later', t: '母に電話する', meta: '土曜' }),
    item({ list: 'someday', t: '気になるカフェに行く' }),
    item({ list: 'someday', t: '読みたい本をまとめる' })
  ];
  var tab = 'today';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('on'); }, 1800);
  }

  function render() {
    var shown = items.filter(function (i) { return tab === 'done' ? i.done : (!i.done && i.list === tab); });
    root.querySelectorAll('.dstry-tabs button').forEach(function (b) {
      b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false');
    });
    var doneCount = items.filter(function (i) { return i.done; }).length;
    root.querySelector('.dstry-tabs .badge').textContent = doneCount ? doneCount : '';
    root.querySelector('.bar b').textContent = 'ToDo';
    if (!shown.length) {
      list.innerHTML = '<li class="dstry-empty">' + (tab === 'done' ? 'チェックを付けると<br>ここにまとまります' : 'ToDoはありません 🎉') + '</li>';
      return;
    }
    list.innerHTML = shown.map(function (i) {
      var meta = [];
      if (i.rep) meta.push('<span class="rep">🔁 ' + esc(i.rep) + '</span>');
      if (i.meta) meta.push('<span>📅 ' + esc(i.meta) + '</span>');
      if (i.flag) meta.push('<span class="flag">⚑ ' + esc(i.flag) + '</span>');
      if (i.sub) meta.push('<span>' + i.sub.filter(function (s) { return s[1]; }).length + '/' + i.sub.length + '</span>');
      var sub = i.sub && !i.done ? '<ul class="dstry-sub">' + i.sub.map(function (s, k) {
        return '<li data-sub="' + k + '" class="' + (s[1] ? 'on' : '') + '" role="checkbox" aria-checked="' + s[1] + '" tabindex="0">' + esc(s[0]) + '</li>';
      }).join('') + '</ul>' : '';
      return '<li class="dstry-item' + (i.done ? ' done' : '') + '" data-id="' + i.id + '">' +
        '<button class="dstry-check" type="button" aria-label="' + esc(i.t) + (i.done ? ' を未完了に戻す' : ' を完了にする') + '">' + CHECK + '</button>' +
        '<span class="body"><span class="t">' + esc(i.t) + '</span>' + (meta.length ? '<span class="meta">' + meta.join('') + '</span>' : '') + sub + '</span></li>';
    }).join('');
  }

  function find(id) { return items.filter(function (i) { return i.id === id; })[0]; }

  list.addEventListener('click', function (e) {
    var li = e.target.closest('.dstry-item'); if (!li) return;
    var it = find(+li.dataset.id);
    var subEl = e.target.closest('[data-sub]');
    if (subEl) { var s = it.sub[+subEl.dataset.sub]; s[1] = !s[1]; render(); return; }
    if (!e.target.closest('.dstry-check')) return;
    if (it.done) { it.done = false; toast('「' + it.t + '」を未完了に戻しました'); render(); return; }
    li.classList.add('done');
    setTimeout(function () {
      li.classList.add('leaving');
      setTimeout(function () {
        it.done = true;
        if (it.rep) {
          // 繰り返しの ToDo は、次の分が自動でできる
          items.push(item({ list: 'later', t: it.t, meta: '来週', rep: it.rep }));
          toast('次の「' + it.t + '」を用意しました');
        } else {
          toast('「完了」にまとめました');
        }
        render();
      }, 320);
    }, 380);
  });
  list.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-sub]')) { e.preventDefault(); e.target.click(); }
  });

  root.querySelectorAll('.dstry-tabs button').forEach(function (b) {
    b.addEventListener('click', function () { tab = b.dataset.tab; render(); });
  });

  root.querySelector('.dstry-add').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = this.querySelector('input'), v = input.value.trim();
    if (!v) { input.focus(); return; }
    if (tab === 'done') tab = 'today';
    items.unshift(item({ list: tab, t: v.slice(0, 40), meta: 'さっき追加' }));
    input.value = ''; render();
  });

  var nameEl = root.querySelector('.dstry-papers .names');
  root.querySelectorAll('.dstry-papers button').forEach(function (b) {
    b.addEventListener('click', function () {
      screen.setAttribute('data-theme', b.dataset.theme);
      if (nameEl) nameEl.textContent = '着せ替え：' + b.getAttribute('aria-label');
      root.querySelectorAll('.dstry-papers button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
  });

  // 日付は今日にする
  var d = new Date(), w = '日月火水木金土'[d.getDay()];
  root.querySelector('.bar span').textContent = (d.getMonth() + 1) + '月' + d.getDate() + '日(' + w + ')';
  render();
})();
