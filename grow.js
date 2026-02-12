// Grow page: Hold-to-water + Drag-the-sun
// Uses getState/setState from shared ../js/index.js
(() => {
  const playArea = document.getElementById('playArea');
  const sun = document.getElementById('sun');
  const sunTarget = document.getElementById('sunTarget');

  const plant = document.getElementById('plant');

  const waterBtn = document.getElementById('waterBtn');
  const waterFill = document.getElementById('waterFill');
  const sunFill = document.getElementById('sunFill');
  const waterPct = document.getElementById('waterPct');
  const sunPct = document.getElementById('sunPct');

  const growHint = document.getElementById('growHint');
  const growStatus = document.getElementById('growStatus');
  const nextBtn = document.getElementById('nextBtn');
  const resetGrow = document.getElementById('resetGrow');

  if (!playArea || !sun || !sunTarget || !plant) return;

  // Helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const getRect = (el) => el.getBoundingClientRect();

  // Shared state (optional)
  const state = (typeof getState === 'function') ? getState() : {};

  // Stage 1..3
  let stage = state.stage ? Number(state.stage) : 1;

  // Progress 0..100
  let water = Number(state.growWater ?? 0);
  let sunProg = Number(state.growSun ?? 0);

  // Water hold loop
  let watering = false;
  let waterRAF = null;

  // Sun loop + drag
  let sunInTarget = false;
  let sunRAF = null;
  let dragging = false;
  let dragOffset = { x: 0, y: 0 };

  function setPlantStage(s) {
    stage = clamp(s, 1, 3);
    plant.classList.remove('plant--stage1', 'plant--stage2', 'plant--stage3');
    plant.classList.add(`plant--stage${stage}`);

    if (typeof setState === 'function') setState({ stage });
  }

  function setMeters() {
    const w = clamp(water, 0, 100);
    const s = clamp(sunProg, 0, 100);

    waterFill.style.width = w + '%';
    sunFill.style.width = s + '%';

    waterPct.textContent = Math.round(w) + '%';
    sunPct.textContent = Math.round(s) + '%';

    // Helpful guidance: pulse water button early
    if (w < 35) waterBtn.classList.add('pulse');
    else waterBtn.classList.remove('pulse');

    if (typeof setState === 'function') setState({ growWater: w, growSun: s });
  }

  function setHintAndStatus() {
    if (water >= 100 && sunProg >= 100) {
      growHint.textContent = "Done ✅ Your plant is ready!";
      growStatus.textContent = "It bloomed 🌸 Tap Next for the leaf notes 🍃";
      return;
    }

    if (water < 100 && sunProg < 100) {
      if (water < 35) growHint.textContent = "Step 1: Press & hold Water 💧";
      else growHint.textContent = "Step 2: Drag the Sun into the pink box 🌤️";
      growStatus.textContent = "Water + sunshine… and it grows 💗";
      return;
    }

    if (water < 100) {
      growHint.textContent = "Press & hold Water 💧";
      growStatus.textContent = "A little more water, please…";
      return;
    }

    if (sunProg < 100) {
      growHint.textContent = "Drag the Sun into the pink box 🌤️";
      growStatus.textContent = "Keep the sun inside for a few seconds.";
      return;
    }
  }

  function maybeAdvanceStage() {
    const combo = (water + sunProg) / 2;

    if (combo >= 35 && stage < 2) setPlantStage(2);
    if (combo >= 75 && stage < 3) setPlantStage(3);

    if (water >= 100 && sunProg >= 100) {
      setPlantStage(3);
      nextBtn.classList.remove('is-hidden');
      if (typeof setState === 'function') setState({ growDone: true });
    }

    setHintAndStatus();
  }

  // Restore stage + meters
  setPlantStage(stage);
  setMeters();
  maybeAdvanceStage();

  // Sun positioning
  function checkSunTarget() {
    const sunR = getRect(sun);
    const tR = getRect(sunTarget);
    const cx = sunR.left + sunR.width / 2;
    const cy = sunR.top + sunR.height / 2;
    sunInTarget = (cx >= tR.left && cx <= tR.right && cy >= tR.top && cy <= tR.bottom);
  }

  function setSunPos(x, y) {
    const area = getRect(playArea);
    const sunRect = getRect(sun);

    const maxX = area.width - sunRect.width;
    const maxY = area.height - sunRect.height;

    const nx = clamp(x, 0, maxX);
    const ny = clamp(y, 0, maxY);

    sun.style.left = nx + 'px';
    sun.style.top = ny + 'px';

    if (typeof setState === 'function') setState({ sunX: nx, sunY: ny });
    checkSunTarget();
  }

  // Restore last sun position if present
  const savedX = Number(state.sunX);
  const savedY = Number(state.sunY);

  requestAnimationFrame(() => {
    if (!Number.isNaN(savedX) && !Number.isNaN(savedY)) setSunPos(savedX, savedY);
    else setSunPos(22, 26);
  });

  // Water hold logic
  function startWatering() {
    if (watering) return;
    watering = true;
    playArea.classList.add('watering');

    const tick = () => {
      if (!watering) return;
      water = clamp(water + 0.55, 0, 100);
      setMeters();
      maybeAdvanceStage();
      waterRAF = requestAnimationFrame(tick);
    };

    tick();
  }

  function stopWatering() {
    watering = false;
    playArea.classList.remove('watering');
    if (waterRAF) cancelAnimationFrame(waterRAF);
    waterRAF = null;
  }

  waterBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    waterBtn.setPointerCapture?.(e.pointerId);
    startWatering();
  });
  waterBtn.addEventListener('pointerup', stopWatering);
  waterBtn.addEventListener('pointercancel', stopWatering);
  waterBtn.addEventListener('pointerleave', stopWatering);

  // Sun fill loop
  function startSunFillLoop() {
    if (sunRAF) return;

    const tick = () => {
      // Fill inside target, decay outside
      if (sunInTarget) sunProg = clamp(sunProg + 0.45, 0, 100);
      else sunProg = clamp(sunProg - 0.10, 0, 100);

      setMeters();
      maybeAdvanceStage();
      sunRAF = requestAnimationFrame(tick);
    };

    tick();
  }
  startSunFillLoop();

  // Drag logic (pointer events for mobile)
  function onDragStart(e) {
    e.preventDefault();
    dragging = true;

    const sunR = getRect(sun);
    dragOffset.x = e.clientX - sunR.left;
    dragOffset.y = e.clientY - sunR.top;

    sun.setPointerCapture?.(e.pointerId);
  }

  function onDragMove(e) {
    if (!dragging) return;

    const area = getRect(playArea);
    const x = e.clientX - area.left - dragOffset.x;
    const y = e.clientY - area.top - dragOffset.y;
    setSunPos(x, y);
  }

  function onDragEnd() {
    dragging = false;
  }

  sun.addEventListener('pointerdown', onDragStart);
  window.addEventListener('pointermove', onDragMove, { passive: false });
  window.addEventListener('pointerup', onDragEnd);
  window.addEventListener('pointercancel', onDragEnd);

  // Optional keyboard support
  sun.addEventListener('keydown', (e) => {
    const step = 10;
    const x = parseFloat(sun.style.left || '0');
    const y = parseFloat(sun.style.top || '0');
    if (e.key === 'ArrowLeft') setSunPos(x - step, y);
    if (e.key === 'ArrowRight') setSunPos(x + step, y);
    if (e.key === 'ArrowUp') setSunPos(x, y - step);
    if (e.key === 'ArrowDown') setSunPos(x, y + step);
  });

  // Reset grow progress
  resetGrow.addEventListener('click', () => {
  water = 0;
  sunProg = 0;

  // Reset meters + visuals
  setMeters();
  setPlantStage(1);
  nextBtn.classList.add('is-hidden');

  // Move sun back to the starting position (outside the target box)
  // Also clears the "sun is in target" state immediately
  setSunPos(22, 26);
  sunInTarget = false;

  // Update shared saved state so refresh doesn’t bring it back into the box
  if (typeof setState === 'function') {
    setState({
      growWater: 0,
      growSun: 0,
      growDone: false,
      sunX: 22,
      sunY: 26
    });
  }

  growStatus.textContent = "Reset ✅ Start again!";
  maybeAdvanceStage();
});

})();