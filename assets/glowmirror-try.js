/* Glow Mirror：ブラウザで試せる鏡（アプリの鏡の画面をまねた体験版）
   映像はこのページの中だけで表示し、どこにも送らず、保存もしない。 */
(function () {
  const root = document.getElementById('gmtry');
  if (!root) return;
  const ja = (root.dataset.lang || 'ja') === 'ja';
  const T = ja ? {
    hideAll: '全部隠す', light: 'ライト', video: '10秒動画', tools: 'ツール', show: '表示', stop: '停止',
    flip: '反転', flipping: '反転中', guide: 'ガイド', compare: '比較', reset: 'リセット', lighting: '光の再現',
    brightness: '明るさ', timer: 'タイマー', cancel: '中止', settings: '設定',
    close: '閉じる', addCompare: '比較に追加', save: '保存', prev: 'コマ戻し', next: 'コマ送り', play: '再生', pause: '一時停止', speed: '速度',
    open: '鏡をひらく', intro: 'カメラを使って、あなたの顔を映します。<br>映像はこの端末の中だけで表示されます。',
    resume: 'ページに戻りました。もう一度押すと鏡がひらきます', closed: '鏡をとじました。もう一度押すとひらきます',
    noCamera: 'カメラが使えないため、見本の写真で表示しています',
    noFrame: 'カメラの映像が届きませんでした。ほかのアプリ（グロウミラー本体など）がカメラを使っていたら閉じて、もう一度お試しください。今は見本の写真で表示しています',
    appOnly: 'この機能はアプリ版でお試しください', saveNote: 'アプリでは「写真」に保存されます（ここでは保存しません）',
    compareNote: 'アプリではビフォーアフターに追加されます', resetDone: '設定を元に戻しました',
    recLeft: '残り', sec: '秒', noRec: 'このブラウザでは動画を試せません', tapToShow: '右下の「表示」で戻ります'
  } : {
    hideAll: 'Hide All', light: 'Light', video: '10s Video', tools: 'Tools', show: 'Show', stop: 'Stop',
    flip: 'Flip', flipping: 'Flipped', guide: 'Guide', compare: 'Compare', reset: 'Reset', lighting: 'Lighting',
    brightness: 'Brightness', timer: 'Timer', cancel: 'Cancel', settings: 'Settings',
    close: 'Close', addCompare: 'Add to Compare', save: 'Save', prev: 'Prev Frame', next: 'Next Frame', play: 'Play', pause: 'Pause', speed: 'Speed',
    open: 'Open the mirror', intro: 'Uses your camera to show your face.<br>The video stays on this device.',
    resume: 'Welcome back. Tap to open the mirror again', closed: 'Mirror closed. Tap to open it again',
    noCamera: 'No camera available, showing a sample photo',
    noFrame: 'No video from the camera. If another app is using it, close that app and try again. Showing a sample photo for now',
    appOnly: 'Try this one in the app', saveNote: 'The app saves to Photos (nothing is saved here)',
    compareNote: 'The app adds it to Before & After', resetDone: 'Settings reset',
    recLeft: '', sec: 's left', noRec: 'Video isn’t supported in this browser', tapToShow: 'Tap Show (bottom right) to bring them back'
  };

  // SF Symbols に似せたアイコン
  const I = {
    eyeSlash: '<path d="M3 3l18 18"/><path d="M10.6 6.1A10 10 0 0 1 12 6c5 0 8.5 4 9.5 6-.4.9-1.3 2.2-2.6 3.4M6.3 7.6C4.5 8.9 3.1 10.6 2.5 12c1 2 4.5 6 9.5 6 1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    eye: '<path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6S3.5 14 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    bulbFill: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="currentColor"/>',
    video: '<rect x="2.5" y="6.5" width="13" height="11" rx="2.5"/><path d="m15.5 10.5 6-3.5v10l-6-3.5"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    flip: '<path d="M12 3v18"/><path d="M9 7 3 17h6z"/><path d="m15 7 6 10h-6z"/>',
    guide: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M12 4v16M4 12h16"/>',
    compare: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 5v14"/>',
    reset: '<path d="M4 4v5h5"/><path d="M4.6 9A8 8 0 1 1 4 13"/>',
    haze: '<circle cx="12" cy="10" r="3.5"/><path d="M12 2.5v1.5M5.5 5.5l1 1M18.5 5.5l-1 1M3 10h1.5M19.5 10H21M4 16h16M6 19.5h12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2.5h4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    pause: '<rect x="7.5" y="6" width="3" height="12" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="6" width="3" height="12" rx="1" fill="currentColor" stroke="none"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    xmark: '<path d="M6 6l12 12M18 6 6 18"/>',
    saveIcon: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5"/><path d="M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14"/>',
    stackPlus: '<rect x="3" y="8" width="13" height="12" rx="2"/><path d="M7 4h11a2 2 0 0 1 2 2v9"/><path d="M9.5 11v6M6.5 14h6"/>',
    back: '<path d="M18 5 9 12l9 7z" fill="currentColor" stroke="none"/><path d="M6 5v14"/>',
    fwd: '<path d="M6 5l9 7-9 7z" fill="currentColor" stroke="none"/><path d="M18 5v14"/>',
    tortoise: '<path d="M4 15c0-4 3.6-7 8-7s8 3 8 7z"/><path d="M20 13.5l2-1M6 15v2.5M17 15v2.5"/>',
    mag: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>'
  };
  const svg = (name, w) => '<svg viewBox="0 0 24 24" width="' + (w || 20) + '" height="' + (w || 20) + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[name] + '</svg>';
  const glass = (act, icon, label) => '<button type="button" class="gx" data-act="' + act + '"><span class="c">' + svg(icon) + '</span><span class="l">' + label + '</span></button>';

  const screen = root.querySelector('.screen');
  screen.classList.add('gmx');
  screen.innerHTML =
    '<div class="island"></div>' +
    '<div class="gx-mirror"><video playsinline muted></video><img class="fallback" alt="" hidden src="' + root.dataset.demo + '"></div>' +
    '<div class="gx-ring" aria-hidden="true"><i></i><i></i></div>' +
    '<div class="gx-guide" aria-hidden="true"><i class="v"></i><i class="h1"></i><i class="h2"></i></div>' +
    '<div class="gx-count" aria-live="polite"></div>' +
    '<div class="gx-ui">' +
      '<div class="gx-zoom">' + svg('mag', 14) + '<input type="range" min="1" max="3" step="0.05" value="1" aria-label="Zoom"><b>1.0x</b></div>' +
      '<div class="gx-rec"><i></i><span></span></div>' +
      '<div class="gx-tray" hidden>' +
        glass('flip', 'flip', T.flip) + glass('guide', 'guide', T.guide) + glass('compare', 'compare', T.compare) + glass('reset', 'reset', T.reset) +
        glass('lighting', 'haze', T.lighting) + glass('brightness', 'sun', T.brightness) + glass('timer', 'timer', T.timer) + glass('settings', 'gear', T.settings) +
      '</div>' +
      '<div class="gx-row">' +
        glass('hideAll', 'eyeSlash', T.hideAll) + glass('light', 'bulb', T.light) +
        '<button type="button" class="gx-shutter" data-act="freeze" aria-label="Freeze">' + svg('pause', 26) + '</button>' +
        glass('video', 'video', T.video) + glass('tools', 'grid', T.tools) +
      '</div>' +
    '</div>' +
    '<div class="gx-showbtn" hidden>' + glass('show', 'eye', T.show) + '</div>' +
    // 静止画の確認画面
    '<div class="gx-frozen" hidden><canvas></canvas>' +
      '<div class="gx-top">' + glass('fClose', 'xmark', T.close) + glass('fFlip', 'flip', T.flip) + '</div>' +
      '<div class="gx-bottom"><button type="button" class="gx-pill" data-act="fCompare">' + svg('stackPlus', 18) + '<span>' + T.addCompare + '</span></button>' +
      '<button type="button" class="gx-play" data-act="fResume" aria-label="Resume">' + svg('play', 24) + '</button>' +
      '<button type="button" class="gx-pill" data-act="fSave">' + svg('saveIcon', 18) + '<span>' + T.save + '</span></button></div>' +
    '</div>' +
    // 10秒動画の確認画面
    '<div class="gx-review" hidden><video playsinline muted loop></video>' +
      '<div class="gx-top">' + glass('rClose', 'xmark', T.close) + glass('rSave', 'saveIcon', T.save) + '</div>' +
      '<div class="gx-bottom col"><input class="gx-seek" type="range" min="0" max="1000" value="0" aria-label="Seek">' +
      '<div class="gx-row">' + glass('rPrev', 'back', T.prev) + glass('rPlay', 'pause', T.pause) + glass('rNext', 'fwd', T.next) + glass('rSpeed', 'tortoise', '1x') + '</div></div>' +
    '</div>' +
    '<div class="gx-toast" role="status"></div>' +
    '<div class="gm-start"><p>' + T.intro + '</p><button type="button">' + T.open + '</button></div>';

  const $ = (s) => screen.querySelector(s);
  const btn = (a) => screen.querySelector('[data-act="' + a + '"]');
  const video = $('.gx-mirror video'), fallback = $('.gx-mirror img'), start = $('.gm-start'), startMsg = start.querySelector('p');
  const ui = $('.gx-ui'), tray = $('.gx-tray'), toast = $('.gx-toast'), count = $('.gx-count'), zoom = $('.gx-zoom input'), zoomLabel = $('.gx-zoom b');
  const frozen = $('.gx-frozen'), fcanvas = frozen.querySelector('canvas'), review = $('.gx-review'), rvideo = review.querySelector('video'), seek = $('.gx-seek');
  const offBtn = root.querySelector('.gm-off');

  let stream = null, live = false, mirrored = true, light = false, guide = false, scale = 1, frozenMirrored = true;
  let timerId = 0, countdown = 0, recorder = null, chunks = [], recTimer = 0, recLeft = 0, dimTimer = 0, toastTimer = 0, speedIdx = 0, recUrl = '';

  function say(msg) { toast.textContent = msg; toast.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('on'), msg.length > 40 ? 5000 : 1800); }
  function setGlass(a, icon, label, active) {
    const b = btn(a); if (!b) return;
    if (icon) b.querySelector('.c').innerHTML = svg(icon);
    if (label) b.querySelector('.l').textContent = label;
    b.classList.toggle('on', !!active);
  }
  function apply() {
    const s = 'scale(' + scale + ')' + (mirrored ? ' scaleX(-1)' : '');
    video.style.transform = s; fallback.style.transform = s;
    screen.classList.toggle('lit', light); screen.classList.toggle('guided', guide);
    setGlass('light', light ? 'bulbFill' : 'bulb', null, light);
    setGlass('flip', null, mirrored ? T.flip : T.flipping, !mirrored);
    setGlass('guide', null, null, guide);
    zoomLabel.textContent = scale.toFixed(1) + 'x';
  }
  // 3秒さわらないとボタンが薄くなる
  function wake() { screen.classList.remove('dim'); clearTimeout(dimTimer); dimTimer = setTimeout(() => { if (tray.hidden) screen.classList.add('dim'); }, 3000); }
  screen.addEventListener('pointerdown', wake);

  async function open() {
    start.hidden = true; wake();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nocam');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      video.muted = true; video.setAttribute('playsinline', ''); video.setAttribute('autoplay', '');
      video.srcObject = stream;
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await Promise.race([video.play().catch(() => {}), wait(3000)]);
      // 映像が届くまで最大4秒待つ（ほかのアプリがカメラを使っていると真っ暗になるため）
      for (let i = 0; i < 20 && !video.videoWidth; i++) await wait(200);
      if (!video.videoWidth) { stream.getTracks().forEach((t) => t.stop()); stream = null; throw new Error('noframe'); }
      live = true; fallback.hidden = true;
    } catch (e) { live = false; fallback.hidden = false; video.srcObject = null; say(e && e.message === 'noframe' ? T.noFrame : T.noCamera); }
    if (offBtn) offBtn.hidden = false;
    apply();
  }
  function close(msg) {
    cancelTimer(); stopRecording(true);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null; live = false; video.srcObject = null;
    frozen.hidden = true; closeReview(); tray.hidden = true;
    start.hidden = false; startMsg.textContent = msg; if (offBtn) offBtn.hidden = true;
  }
  start.querySelector('button').addEventListener('click', open);
  if (offBtn) offBtn.addEventListener('click', () => close(T.closed));

  // 下の段
  btn('hideAll').addEventListener('click', () => { ui.hidden = true; $('.gx-showbtn').hidden = false; say(T.tapToShow); });
  btn('show').addEventListener('click', () => { ui.hidden = false; $('.gx-showbtn').hidden = true; wake(); });
  btn('light').addEventListener('click', () => { light = !light; apply(); });
  btn('tools').addEventListener('click', () => { tray.hidden = !tray.hidden; setGlass('tools', null, null, !tray.hidden); wake(); });
  btn('freeze').addEventListener('click', freeze);
  btn('video').addEventListener('click', () => (recorder ? stopRecording(false) : startRecording()));

  // ツールの棚
  btn('flip').addEventListener('click', () => { mirrored = !mirrored; apply(); });
  btn('guide').addEventListener('click', () => { guide = !guide; apply(); });
  btn('reset').addEventListener('click', () => { mirrored = true; light = false; guide = false; scale = 1; zoom.value = 1; apply(); say(T.resetDone); });
  btn('timer').addEventListener('click', () => (countdown ? cancelTimer() : startTimer()));
  ['compare', 'lighting', 'brightness', 'settings'].forEach((a) => btn(a).addEventListener('click', () => say(T.appOnly)));
  zoom.addEventListener('input', () => { scale = Number(zoom.value); apply(); });

  function startTimer() {
    countdown = 3; count.textContent = countdown; setGlass('timer', null, T.cancel, true); tray.hidden = true; setGlass('tools', null, null, false);
    timerId = setInterval(() => { countdown -= 1; if (countdown <= 0) { cancelTimer(); freeze(); } else count.textContent = countdown; }, 1000);
  }
  function cancelTimer() { clearInterval(timerId); countdown = 0; count.textContent = ''; setGlass('timer', null, T.timer, false); }

  // 静止画：押した瞬間の顔で止める（明るさや色は変えない）
  function freeze() {
    const src = live ? video : fallback;
    const w = live ? video.videoWidth : fallback.naturalWidth, h = live ? video.videoHeight : fallback.naturalHeight;
    if (!w || !h) return;
    fcanvas.width = w; fcanvas.height = h; fcanvas.getContext('2d').drawImage(src, 0, 0, w, h);
    frozenMirrored = mirrored; fcanvas.style.transform = 'scale(' + scale + ')' + (frozenMirrored ? ' scaleX(-1)' : '');
    frozen.hidden = false; tray.hidden = true; setGlass('tools', null, null, false);
  }
  btn('fClose').addEventListener('click', () => { frozen.hidden = true; wake(); });
  btn('fResume').addEventListener('click', () => { frozen.hidden = true; wake(); });
  btn('fFlip').addEventListener('click', () => { frozenMirrored = !frozenMirrored; fcanvas.style.transform = 'scale(' + scale + ')' + (frozenMirrored ? ' scaleX(-1)' : ''); });
  btn('fCompare').addEventListener('click', () => say(T.compareNote));
  btn('fSave').addEventListener('click', () => say(T.saveNote));

  // 10秒動画（このページの中だけで再生し、閉じれば消える）
  function startRecording() {
    if (!live || typeof MediaRecorder === 'undefined') { say(live ? T.noRec : T.appOnly); return; }
    chunks = [];
    try { recorder = new MediaRecorder(stream); } catch (e) { say(T.noRec); recorder = null; return; }
    recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = () => { const discard = recorder && recorder._discard; recorder = null; if (!discard && chunks.length) openReview(new Blob(chunks, { type: chunks[0].type })); };
    recorder.start(); recLeft = 10; screen.classList.add('recording'); tray.hidden = true; setGlass('tools', null, null, false);
    setGlass('video', 'stop', T.stop, true); $('.gx-rec span').textContent = ja ? T.recLeft + ' ' + recLeft + T.sec : recLeft + T.sec;
    recTimer = setInterval(() => { recLeft -= 1; $('.gx-rec span').textContent = ja ? T.recLeft + ' ' + recLeft + T.sec : recLeft + T.sec; if (recLeft <= 0) stopRecording(false); }, 1000);
  }
  function stopRecording(discard) {
    clearInterval(recTimer); screen.classList.remove('recording'); setGlass('video', 'video', T.video, false);
    if (recorder && recorder.state !== 'inactive') { recorder._discard = discard; recorder.stop(); }
  }
  const speeds = [1, 0.5, 0.25];
  function openReview(blob) {
    if (recUrl) URL.revokeObjectURL(recUrl);
    recUrl = URL.createObjectURL(blob); rvideo.src = recUrl;
    rvideo.style.transform = mirrored ? 'scaleX(-1)' : 'none';
    speedIdx = 0; rvideo.playbackRate = 1; setGlass('rSpeed', null, '1x');
    review.hidden = false; rvideo.play().catch(() => {}); setGlass('rPlay', 'pause', T.pause);
  }
  function closeReview() { review.hidden = true; rvideo.pause(); rvideo.removeAttribute('src'); rvideo.load(); if (recUrl) { URL.revokeObjectURL(recUrl); recUrl = ''; } }
  btn('rClose').addEventListener('click', () => { closeReview(); wake(); });
  btn('rSave').addEventListener('click', () => say(T.saveNote));
  btn('rPlay').addEventListener('click', () => { if (rvideo.paused) { rvideo.play(); setGlass('rPlay', 'pause', T.pause); } else { rvideo.pause(); setGlass('rPlay', 'play', T.play); } });
  const step = (d) => { rvideo.pause(); setGlass('rPlay', 'play', T.play); if (isFinite(rvideo.duration)) rvideo.currentTime = Math.max(0, Math.min(rvideo.duration, rvideo.currentTime + d)); };
  btn('rPrev').addEventListener('click', () => step(-1 / 30));
  btn('rNext').addEventListener('click', () => step(1 / 30));
  btn('rSpeed').addEventListener('click', () => { speedIdx = (speedIdx + 1) % speeds.length; rvideo.playbackRate = speeds[speedIdx]; setGlass('rSpeed', null, speeds[speedIdx] + 'x', speedIdx > 0); });
  rvideo.addEventListener('timeupdate', () => { if (isFinite(rvideo.duration) && rvideo.duration > 0) seek.value = Math.round(rvideo.currentTime / rvideo.duration * 1000); });
  seek.addEventListener('input', () => { if (isFinite(rvideo.duration)) { rvideo.pause(); setGlass('rPlay', 'play', T.play); rvideo.currentTime = seek.value / 1000 * rvideo.duration; } });

  // 画面から外れたら・別のタブに移ったらカメラを止める
  document.addEventListener('visibilitychange', () => { if (document.hidden && stream) close(T.resume); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting && stream && !recorder) close(T.resume); }), { threshold: 0 }).observe(root);
  }
  apply();
})();
