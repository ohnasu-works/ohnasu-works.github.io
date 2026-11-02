/* Daystitch 横断検索の見本
 * アプリの検索（PlannerStore.search）と同じ範囲を探す：
 *   予定（題名・場所・メモ）／ToDo（題名・メモ・タグ・チェック項目）／手書き（文字認識）／貼ったテキスト／録音（題名・要点・議事録・全文）
 * データは見本用。入力内容はどこにも送らない。
 */
(function () {
  'use strict';
  var root = document.getElementById('dsearch');
  if (!root) return;
  var input = root.querySelector('input');
  var list = root.querySelector('.srch-res');
  var DATA = [
    { ic: '📅', kind: '予定', tt: '見積もりの打ち合わせ', sn: '11月4日(水) 15:00 ・ 本社 ・ メモ：資料を印刷' },
    { ic: '✅', kind: 'ToDo（チェック項目）', tt: '見積書を送る', sn: '□ 金額を確認　□ 上長の承認　□ PDF で送付' },
    { ic: '✍️', kind: '手書き（10月27日のページ）', tt: '手書きの文字', sn: '「見積は金曜までに。A案で進める」' },
    { ic: '🎙', kind: '録音・全文（企画レビュー）', tt: '会議の文字起こし', sn: '…見積もりは金曜までに先方へ送りましょう。デザインは A 案で…' },
    { ic: '📅', kind: '予定', tt: '歯医者', sn: '10月28日(水) 10:00 ・ 駅前デンタル' },
    { ic: '✍️', kind: '手書き（10月20日のページ）', tt: '手書きの文字', sn: '「歯医者の次回は 28 日。薬は夜だけ」' },
    { ic: '✅', kind: 'ToDo', tt: '薬局で薬を受け取る', sn: '明日 ・ #家' },
    { ic: '📝', kind: '貼ったテキスト（10月27日のページ）', tt: 'テキスト', sn: '発売日は 12 月 5 日に決定。SNS 広告を先行して実施' },
    { ic: '🎙', kind: '録音・要点（企画レビュー）', tt: '議事録の要点', sn: '発売日は 12 月 5 日に決定 ／ 予算は前回比 10% 増で承認' },
    { ic: '✅', kind: 'ToDo（チェック項目）', tt: '企画書のドラフトを仕上げる', sn: '☑ 構成を決める　☑ グラフを作る　□ 見直して送る' }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return String(s).normalize('NFKC').toLowerCase(); }
  function hi(text, q) {
    var t = esc(text); if (!q) return t;
    var n = norm(text), i = n.indexOf(norm(q));
    if (i < 0) return t;
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function run() {
    var q = input.value.trim();
    root.querySelectorAll('.srch-chips button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.q === q ? 'true' : 'false'); });
    if (!q) { list.innerHTML = '<li class="srch-empty">上の言葉を押すか、入力してみてください</li>'; return; }
    var hits = DATA.filter(function (d) { return norm(d.tt + ' ' + d.sn).indexOf(norm(q)) >= 0; });
    if (!hits.length) { list.innerHTML = '<li class="srch-empty">見本のデータには見つかりませんでした。<br>「見積」「薬」「12 月」などで試してみてください</li>'; return; }
    list.innerHTML = hits.map(function (d) {
      return '<li><span class="ic" aria-hidden="true">' + d.ic + '</span><span><span class="kind">' + esc(d.kind) + '</span><br><span class="tt">' + hi(d.tt, q) + '</span><br><span class="sn">' + hi(d.sn, q) + '</span></span></li>';
    }).join('');
  }
  input.addEventListener('input', run);
  root.querySelectorAll('.srch-chips button').forEach(function (b) {
    b.addEventListener('click', function () { input.value = b.dataset.q; run(); });
  });
  run();
})();
