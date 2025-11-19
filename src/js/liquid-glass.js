(() => {
  const menu = document.querySelector('.homepage-menu');
  const bubble = document.querySelector('.liquid-bubble');
  const SELECTED_ANCHOR = menu.querySelector('.hmenu-item.selected');
  const menuRect = menu.getBoundingClientRect();
  bubble.style.top = `${menuRect.top + menuRect.height / 2}px`;  // центрування по Y

  if (!menu || !bubble) return;

  const BASE_SCALE_X = 1;
  const BASE_SCALE_Y = 1;
  const MAGNIFY_X = 0.14;
  const MAGNIFY_Y = 0.10;
  const STIFFNESS = 0.15;
  const DAMPING = 0.9;
  const SPEED_SMOOTHING = 0.65;
  const MAX_POINTER_IMPULSE = 4;
  const POINTER_INFLUENCE = 0.035;
  const SPEED_WOBBLE_X = 0.3;
  const SPEED_WOBBLE_Y = 0.02;
  const ALPHA_HOLD = 1;
  const ALPHA_RETURN = 0.35;
  const LERP_SPEED = 0.22;

  let isHolding = false;
  let isReturning = false;
  let pointerId = null;

  let bubbleWidth = 0;
  let bubbleHeight = 0;
  let bubbleRadiusX = 0;

  let currentX = 0;
  let targetX = 0;
  let velocity = 0;
  let pointerSpeed = 0;
  let lastPointerX = null;
  let lastPointerTime = null;
  let engage = 0;
  let engageTarget = 0;
  let alpha = 0;
  let alphaTarget = 0;
  let rafId = null;

  const SQUASH_MAX = 0.12;
  let returnStartDist = 1;
  let lastScaleX = 1, lastScaleY = 1;


  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  function setBaseTransform() {
    bubble.style.transform = `translate(-50%, -50%) scale(${BASE_SCALE_X}, ${BASE_SCALE_Y})`;
  }

  function computeSizes() {
    const selected = SELECTED_ANCHOR || menu.querySelector('.hmenu-item.selected');
    const baseEl = selected || menu.querySelector('.hmenu-item');
    const baseSize = baseEl ? baseEl.getBoundingClientRect().height : (menu.clientHeight || 56);

    bubbleHeight = Math.round(baseSize * 1.08);
    bubbleWidth = Math.round(baseSize * 1.35);
    bubbleRadiusX = bubbleWidth / 2;
  }

  function setBubbleAtClientX(clientX) {
    const rect = menu.getBoundingClientRect();
    const xInMenu = clientX - rect.left;
    const minX = bubbleRadiusX;
    const maxX = rect.width - bubbleRadiusX;
    targetX = clamp(xInMenu, minX, maxX);
  }

  function showBubble() {
    bubble.classList.add('active');
    bubble.classList.remove('resting');
    menu.classList.remove('bubble-resting');
    alphaTarget = ALPHA_HOLD;
    engageTarget = 1;
    bubble.style.opacity = alpha.toFixed(3);
    setBaseTransform();
  }

  function startHold(e) {
    if (e.button !== 0) return;

    isHolding = true;
    pointerId = e.pointerId;

    // Центр по Y відносно меню
    const menuRect = menu.getBoundingClientRect();
    bubble.style.top = `${menuRect.top + menuRect.height / 2}px`;

    // Початковий стан — бульку НЕ показуємо
    engageTarget = 0;
    alphaTarget = 0;
    bubble.style.opacity = "0";
    bubble.classList.remove('active');

    pointerSpeed = 0;
    lastPointerX = e.clientX;
    lastPointerTime = e.timeStamp ?? performance.now();

    computeSizes();

    // Початкове позиціонування по X
    const rect = menu.getBoundingClientRect();
    const selected = SELECTED_ANCHOR || menu.querySelector('.hmenu-item.selected');
    if (selected) {
      const sRect = selected.getBoundingClientRect();
      const centerX = (sRect.left + sRect.width / 2) - rect.left;
      currentX = clamp(centerX, bubbleRadiusX, rect.width - bubbleRadiusX);
    } else {
      currentX = clamp(e.clientX - rect.left, bubbleRadiusX, rect.width - bubbleRadiusX);
    }
    setBubbleAtClientX(e.clientX);
    bubble.style.left = `${currentX}px`;

    // ПОЯВА ТІЛЬКИ ПРИ УТРИМАННІ
    setTimeout(() => {
      if (!isHolding) return; // короткий тап → не показуємо

      menu.classList.add('holding');

      engageTarget = 1;
      alphaTarget = ALPHA_HOLD;

      showBubble();
      kick();
    }, 150);

    try { menu.setPointerCapture?.(pointerId); } catch (_) { }
  }



  function moveWhileHold(e) {
    if (!isHolding) return;

    const now = e.timeStamp ?? performance.now();
    if (lastPointerX != null && lastPointerTime != null) {
      const dt = Math.max(1, now - lastPointerTime);

      const delta = e.clientX - lastPointerX;
      const clampedDelta = Math.max(-MAX_POINTER_IMPULSE, Math.min(MAX_POINTER_IMPULSE, delta));
      const impulse = clampedDelta * POINTER_INFLUENCE;
      velocity += impulse * 0.85;

      const speedPxPerSec = Math.abs(delta) / dt * 1000;
      pointerSpeed = pointerSpeed * SPEED_SMOOTHING + speedPxPerSec * (1 - SPEED_SMOOTHING);
    }

    lastPointerX = e.clientX;
    lastPointerTime = now;

    setBubbleAtClientX(e.clientX);
    kick();
  }

  function beginReturn() {
    const rect = menu.getBoundingClientRect();
    const selected = SELECTED_ANCHOR || menu.querySelector('.hmenu-item.selected');

    let desired = rect.width / 2;

    if (selected) {
      const sRect = selected.getBoundingClientRect();
      targetX = (sRect.left + sRect.width / 2) - rect.left;
    } else {
      const desired = rect.width / 2;
      targetX = clamp(desired, bubbleRadiusX, rect.width - bubbleRadiusX);
    }
    returnStartDist = Math.max(1, Math.abs(targetX - currentX));
    isReturning = true;
    menu.classList.add('returning');
    bubble.classList.remove('resting');
    engageTarget = 0;
    alphaTarget = ALPHA_RETURN;
    bubble.style.opacity = alpha.toFixed(3);
    bubble.classList.add('active');
    kick();
  }

  function completeReturn() {
    if (!isReturning) return;
    isReturning = false;

    const rect = menu.getBoundingClientRect();
    const selected = SELECTED_ANCHOR || menu.querySelector('.hmenu-item.selected');
    if (!selected) return;

    const sRect = selected.getBoundingClientRect();
    const targetXFinal = (sRect.left + sRect.width / 2) - rect.left;

    const startX = currentX;
    const distance = targetXFinal - startX;
    const duration = 400; // мс
    const startTime = performance.now();

    const startScaleX = lastScaleX || 1;
    const startScaleY = lastScaleY || 1;

    function animate(time) {
      const t = Math.min(1, (time - startTime) / duration);

      const ease = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      currentX = startX + distance * ease;
      bubble.style.left = `${currentX}px`;

      let scaleProgress = 1;
      if (t > 0.6) {
        const local = (t - 0.6) / 0.4;
        scaleProgress = 1 - local * 0.1;
      }

      const phase = t < 0.6 ? t / 0.6 : (t - 0.6) / 0.4;
      let squashX = 1, squashY = 1;

      if (t < 0.6) {
        const k = Math.sin(phase * Math.PI) * 0.12;
        squashX = 1 + k;
        squashY = 1 - k;
      } else {
        const k = Math.sin(phase * Math.PI) * 0.1;
        squashX = 1 - k;
        squashY = 1 + k;
      }

      const scaleX = startScaleX * scaleProgress * squashX;
      const scaleY = startScaleY * scaleProgress * squashY;

      bubble.style.transform = `translate(-50%, -50%) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;

      if (t > 0.9) {
        bubble.style.opacity = `${1 - (t - 0.9) / 0.1}`;
      }

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        bubble.style.opacity = '0';
        bubble.classList.remove('active', 'resting');
        menu.classList.remove('holding', 'returning', 'bubble-resting');

        bubble.style.transform = 'translate(-50%, -50%) scale(0.9)';
      }
    }

    requestAnimationFrame(animate);
  }




  function endHold(e) {
    if (!isHolding) return;
    isHolding = false;

    try { if (pointerId != null) menu.releasePointerCapture?.(pointerId); } catch (_) { }
    pointerId = null;
    lastPointerX = null;
    lastPointerTime = null;
    menu.classList.remove('holding');

    beginReturn();
  }



  menu.addEventListener('pointerdown', startHold);
  menu.addEventListener('pointermove', moveWhileHold);
  window.addEventListener('pointermove', moveWhileHold);
  window.addEventListener('pointerup', endHold);
  window.addEventListener('pointercancel', endHold);
  window.addEventListener('blur', endHold);

  window.addEventListener('resize', () => {
    const currentLeft = parseFloat(getComputedStyle(bubble).left) || 0;
    computeSizes();
    const rect = menu.getBoundingClientRect();
    const minX = bubbleRadiusX;
    const maxX = rect.width - bubbleRadiusX;
    currentX = clamp(currentLeft, minX, maxX);
    if (!isHolding) {
      targetX = clamp(targetX, minX, maxX);
    }
    bubble.style.left = `${currentX}px`;

    if (isReturning) {
      beginReturn();
    }
  });

  computeSizes();
  setBaseTransform();
  bubble.style.opacity = alpha.toFixed(3);

  function frame() {
    const dx = targetX - currentX;
    const MAX_RETURN_STEP = 0.7;
    const adjDx = isReturning ? Math.sign(dx) * Math.min(Math.abs(dx), MAX_RETURN_STEP) : dx;

    velocity = (velocity + adjDx * STIFFNESS) * DAMPING;
    currentX += velocity;
    velocity = clamp(velocity, -2.2, 2.2);

    pointerSpeed *= isHolding ? SPEED_SMOOTHING : 0.85;

    engage += (engageTarget - engage) * LERP_SPEED;
    alpha += (alphaTarget - alpha) * LERP_SPEED;

    let wobbleX = 0, wobbleY = 0;
    if (isHolding && pointerSpeed > 700) {
      const wobbleIntensity = Math.min(pointerSpeed / 1800, 1);
      wobbleX = wobbleIntensity * SPEED_WOBBLE_X;
      wobbleY = wobbleIntensity * SPEED_WOBBLE_Y;
    }

    if (!isHolding) { wobbleX = wobbleY = 0; }

    if (!isHolding && !isReturning) {
      alphaTarget = 0;
    }

    let scaleX = BASE_SCALE_X + engage * MAGNIFY_X + wobbleX;
    let scaleY = BASE_SCALE_Y + engage * MAGNIFY_Y - wobbleY;

    let squashX = 1, squashY = 1;

    if (isHolding) {
      const v = Math.min(Math.abs(velocity), 2.2) / 2.2;
      const k = v * SQUASH_MAX;
      squashX = 1 + k;
      squashY = 1 - k;
    } else if (isReturning) {

      const dist = Math.abs(targetX - currentX);
      const progress = 1 - Math.min(1, dist / Math.max(1, returnStartDist));

      if (progress < 0.6) {
        const k = (progress / 0.6) * (SQUASH_MAX * 0.8);
        squashX = 1 + k;
        squashY = 1 - k;
      } else {
        const local = (progress - 0.6) / 0.4;
        const k = local * (SQUASH_MAX * 0.9);
        squashX = 1 - k;
        squashY = 1 + k;
      }
    }

    scaleX *= squashX;
    scaleY *= squashY;

    bubble.style.transform = `translate(-50%, -50%) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;

    lastScaleX = scaleX;
    lastScaleY = scaleY;

    bubble.style.left = `${currentX}px`;
    menu.style.setProperty('--glow-x', `${currentX}px`);
    bubble.style.opacity = Math.max(0, Math.min(1, alpha)).toFixed(3);

    const stillMoving = isHolding && pointerSpeed > 10;

    if (isReturning && !isHolding && !stillMoving) {
      completeReturn();
    }

    if (isHolding || isReturning || stillMoving || alphaTarget > 0.01 || alpha > 0.02) {
      rafId = requestAnimationFrame(frame);
    } else {
      rafId = null;
      setBaseTransform();
      bubble.style.left = `${currentX}px`;
      bubble.classList.remove('active');
      bubble.style.opacity = '0';
    }
  }


  function kick() {
    if (rafId == null) {
      rafId = requestAnimationFrame(frame);
    }
  }
})();
