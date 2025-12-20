const moodInput = document.querySelector('#moodInput');
const slider = document.querySelector('.slider');
const lotus = document.querySelector('.lotus-img');
const moodName = document.querySelector('.mood-tracker');

moodInput.addEventListener('pointerdown', () => {
  moodInput.classList.add('dragging');
});

moodInput.addEventListener('pointerup', () => {
  moodInput.classList.remove('dragging');
});

moodInput.addEventListener('pointerleave', () => {
  moodInput.classList.remove('dragging');
});

moodInput.addEventListener('input', () => {
  slider.style.width = moodInput.value + '%';

  if (moodInput.value <= 20) moodName.textContent = 'Very Bad';
  else if (moodInput.value <= 40) moodName.textContent = 'Bad';
  else if (moodInput.value <= 60) moodName.textContent = 'Normal';
  else if (moodInput.value <= 80) moodName.textContent = 'Good';
  else moodName.textContent = 'Very Good';
});

const FRAMES = 50;
const lotusFrames = [];
let loadedFrames = 0;

for (let i = 1; i <= FRAMES; i++) {
  const img = new Image();
  img.src = `/static/img/lotus-sequence/lotus-${i}.png`;

  img.onload = () => {
    loadedFrames++;
    if (loadedFrames === FRAMES) {
      console.log('🌸 Lotus sequence fully preloaded');
    }
  };

  lotusFrames.push(img);
}

const EASING = 0.08;
let targetProgress = 0.5;
let currentProgress = 0.5;
let animating = false;

moodInput.addEventListener('input', () => {
  targetProgress = moodInput.value / 100;

  if (!animating) {
    animating = true;
    requestAnimationFrame(animateLotus);
  }
});

function animateLotus() {
  currentProgress += (targetProgress - currentProgress) * EASING;
  updateLotus(currentProgress);

  if (Math.abs(targetProgress - currentProgress) > 0.001) {
    requestAnimationFrame(animateLotus);
  } else {
    currentProgress = targetProgress;
    updateLotus(currentProgress);
    animating = false;
  }
}

function updateLotus(progress) {
  const frame = Math.min(
    FRAMES,
    Math.max(1, Math.round(progress * (FRAMES - 1)) + 1)
  );

  /* ✅ ВАЖЛИВО: беремо з кешу */
  if (lotusFrames[frame - 1]) {
    lotus.src = lotusFrames[frame - 1].src;
  }

  lotus.style.filter = `grayscale(${100 - progress * 100}%)`;
  lotus.style.transform = `scale(${0.85 + progress * 0.3})`;
}
