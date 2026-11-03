/* Glow Mirror：ブラウザで試せる鏡。映像はこのページの中だけで表示し、どこにも送らない。 */
(function () {
  const root = document.getElementById('gmtry');
  if (!root) return;
  const t = (k) => root.dataset[k] || '';
  const mirror = root.querySelector('.gm-mirror');
  const video = mirror.querySelector('video');
  const canvas = mirror.querySelector('canvas');
  const fallback = mirror.querySelector('img.fallback');
  const start = root.querySelector('.gm-start');
  const startBtn = start.querySelector('button');
  const startMsg = start.querySelector('p');
  const badge = root.querySelector('.gm-badge');
  const zoom = root.querySelector('.gm-zoom input');
  const btn = (name) => root.querySelector('[data-act="' + name + '"]');
  let flipped = true, frozen = false, stream = null, live = false, scale = 1, badgeTimer = 0;

  function show(msg) {
    badge.textContent = msg; badge.classList.add('on');
    clearTimeout(badgeTimer); badgeTimer = setTimeout(() => badge.classList.remove('on'), 1400);
  }
  function applyTransform() {
    const s = 'scale(' + scale + ')' + (flipped ? ' scaleX(-1)' : '');
    [video, canvas, fallback].forEach((el) => { el.style.transform = s; });
  }
  async function begin() {
    startBtn.disabled = true;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nocam');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      video.srcObject = stream; await video.play(); live = true;
      fallback.hidden = true;
    } catch (e) {
      live = false; fallback.hidden = false;
      show(t('noCamera'));
    }
    start.hidden = true;
    applyTransform();
  }
  startBtn.addEventListener('click', begin);

  btn('flip').addEventListener('click', (e) => {
    flipped = !flipped; applyTransform();
    e.currentTarget.setAttribute('aria-pressed', String(!flipped));
    show(flipped ? t('mirrorOn') : t('mirrorOff'));
  });
  btn('light').addEventListener('click', (e) => {
    const on = mirror.classList.toggle('lit');
    e.currentTarget.setAttribute('aria-pressed', String(on));
    show(on ? t('lightOn') : t('lightOff'));
  });
  btn('guide').addEventListener('click', (e) => {
    const on = mirror.classList.toggle('guided');
    e.currentTarget.setAttribute('aria-pressed', String(on));
    show(on ? t('guideOn') : t('guideOff'));
  });
  btn('freeze').addEventListener('click', (e) => {
    frozen = !frozen;
    if (frozen && live && video.videoWidth) {
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
    }
    mirror.classList.toggle('frozen', frozen && live);
    e.currentTarget.setAttribute('aria-pressed', String(frozen));
    show(frozen ? t('frozen') : t('resumed'));
  });
  zoom.addEventListener('input', () => { scale = Number(zoom.value); applyTransform(); });

  // ページを離れたらカメラを止める
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && stream) { stream.getTracks().forEach((tr) => tr.stop()); stream = null; live = false; start.hidden = false; startBtn.disabled = false; startMsg.textContent = t('resume'); }
  });
  applyTransform();
})();
