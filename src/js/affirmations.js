const toFav = document.querySelector('.toFav');
const shareMenu = document.querySelector('.main-window');
const shareOverlay = document.querySelector('.overlay-share-window');

const slides = document.querySelectorAll('.slide');
let currentIndex = 0;
let isScrolling = false;

// масив лайків (false за замовчуванням)
let likedSlides = Array(slides.length).fill(false);

toFav.addEventListener('click', () => {
  likedSlides[currentIndex] = !likedSlides[currentIndex];
  updateLikeIcon();
});

function updateLikeIcon() {
  const outlined = toFav.querySelector('.outlined');
  const filled = toFav.querySelector('.filled');

  if (likedSlides[currentIndex]) {
    outlined.classList.remove('selected');
    filled.classList.add('selected');
  } else {
    outlined.classList.add('selected');
    filled.classList.remove('selected');
  }
}

function toggleShareMenu() {
  shareMenu.classList.toggle('opened');
  shareOverlay.classList.toggle('active');
}

shareOverlay.addEventListener('click', () => toggleShareMenu());

// показати потрібний слайд
function showSlide(index) {
  if (index < 0 || index >= slides.length || isScrolling) return;
  isScrolling = true;

  slides[currentIndex].classList.remove('active');
  slides[index].classList.add('active');
  currentIndex = index;

  updateLikeIcon(); // оновлюємо іконку при переході між слайдами

  setTimeout(() => isScrolling = false, 900);
}

// керування колесом
window.addEventListener('wheel', (e) => {
  if (e.deltaY > 0) {
    showSlide(currentIndex + 1);
  } else if (e.deltaY < 0) {
    showSlide(currentIndex - 1);
  }
});

// кнопки
document.querySelector('.btn-forward').addEventListener('click', () => {
  showSlide(currentIndex + 1);
});

document.querySelector('.btn-downward').addEventListener('click', () => {
  showSlide(currentIndex - 1);
});

// --- Генерація картинки для Share ---
async function generateShareImage() {
  // ⬅ гарантуємо, що шрифт Lexend точно завантажений
  try {
    await document.fonts.load('bold 42px "Lexend"');
  } catch(e) {
    console.warn("Font didn't load in time, using fallback.", e);
  }

  const slide = slides[currentIndex];
  const bgImg = slide.querySelector('.background-image').src;
  const text = slide.querySelector('p').innerText;

  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');


  // малюємо фон
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = bgImg;
  img.onload = () => {
    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    // масштабування без спотворення (object-fit: cover)
    if (imgAspect > canvasAspect) {
      drawHeight = canvas.height;
      drawWidth = img.width * (canvas.height / img.height);
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = canvas.width;
      drawHeight = img.height * (canvas.width / img.width);
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // затемнення фону
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // текст афірмації
    ctx.font = 'bold 42px "Lexend", sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lineHeight = 60;
    const lines = [];
    const words = text.split(' ');
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 580) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    const totalTextHeight = lines.length * lineHeight;
    let y = canvas.height / 2 - totalTextHeight / 2;

    for (const line of lines) {
      ctx.fillText(line, canvas.width / 2, y);
      y += lineHeight;
    }

    // логотип (білий)
    const logo = new Image();
    const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" id="Шар_1" data-name="Шар 1"
                            viewBox="0 0 47.50543 11.05664">
                            <defs>
                                <style>
                                    .cls-1 {
                                        fill: #FFF;
                                    }
                                </style>
                            </defs>
                            <path class="cls-1"
                                d="M43.95477,140.08816l0,0a.96132.96132,0,0,1-.37675-1.32205,7.8978,7.8978,0,0,1,10.64972-2.92467v0a.96132.96132,0,0,1,.37676,1.322l0,0A7.89777,7.89777,0,0,1,43.95477,140.08816Z"
                                transform="translate(-43.4306 -130.10791)" />
                            <path class="cls-1"
                                d="M52.40961,134.65143a8.33714,8.33714,0,0,0,.7572-3.46716v-.00007a1.08631,1.08631,0,0,0-1.09625-1.07611,8.59612,8.59612,0,0,0-8.64,7.95307A8.29335,8.29335,0,0,1,52.40961,134.65143Z"
                                transform="translate(-43.4306 -130.10791)" />
                            <path class="cls-1"
                                d="M57.8833,138.396a2.14107,2.14107,0,0,1-.91992-.93164,3.18952,3.18952,0,0,1-.31641-1.4795v-.82617a3.12559,3.12559,0,0,1,.31641-1.46191,2.13123,2.13123,0,0,1,.91992-.92285,3.094,3.094,0,0,1,1.45313-.31641,3.56365,3.56365,0,0,1,.917.11426,2.76116,2.76116,0,0,1,.77344.33105,2.08242,2.08242,0,0,1,.57128.52735l-.94921.89062a1.64679,1.64679,0,0,0-.5625-.38672,1.72955,1.72955,0,0,0-.67383-.13476,1.36937,1.36937,0,0,0-1.00781.35449,1.35257,1.35257,0,0,0-.35743,1.00488v.82617a1.40493,1.40493,0,0,0,.3545,1.02832,1.35433,1.35433,0,0,0,1.01074.36036,1.6308,1.6308,0,0,0,1.23633-.5625l.94921.94921a2.1671,2.1671,0,0,1-.57714.51856,2.75141,2.75141,0,0,1-.77344.32519,3.6278,3.6278,0,0,1-.91113.11133A3.07041,3.07041,0,0,1,57.8833,138.396Z"
                                transform="translate(-43.4306 -130.10791)" />
                            <path class="cls-1"
                                d="M64.19971,136.84033a.486.486,0,0,0,.11133.34278.41.41,0,0,0,.3164.12011h.416v1.3418h-.76172a1.41352,1.41352,0,0,1-1.09278-.42188,1.68836,1.68836,0,0,1-.38964-1.18945v-6.92578h1.40039Z"
                                transform="translate(-43.4306 -130.10791)" />
                            <path class="cls-1"
                                d="M66.44385,138.24951a1.80133,1.80133,0,0,1-.52149-1.415,1.68321,1.68321,0,0,1,.52735-1.35351,2.38162,2.38162,0,0,1,1.582-.45117h1.6289l.082,1.08984H68.0376a.94763.94763,0,0,0-.624.17578.66659.66659,0,0,0-.208.53906.63824.63824,0,0,0,.26953.56543,1.45193,1.45193,0,0,0,.81445.18457,2.54605,2.54605,0,0,0,.99316-.14648.48105.48105,0,0,0,.3252-.457l.123.86718a1.023,1.023,0,0,1-.34864.48047,1.70337,1.70337,0,0,1-.60058.29,2.88774,2.88774,0,0,1-.76758.09668A2.29589,2.29589,0,0,1,66.44385,138.24951Zm3.16406-3.47754a1.02813,1.02813,0,0,0-.30176-.791,1.20337,1.20337,0,0,0-.85254-.28125,2.20772,2.20772,0,0,0-.6914.11133,2.13474,2.13474,0,0,0-.60938.31054l-.93164-.78515a2.36346,2.36346,0,0,1,.9375-.64747,3.45037,3.45037,0,0,1,1.28906-.23144,3.01548,3.01548,0,0,1,1.32422.2666,1.89088,1.89088,0,0,1,.84082.77344,2.42165,2.42165,0,0,1,.29,1.22168v3.9082H69.60791Z"
                                transform="translate(-43.4306 -130.10791)" />
                            <path class="cls-1"
                                d="M72.60205,132.54541h1.459v6.082h-1.459Zm3.041,1.333a1.31363,1.31363,0,0,0-.47461-.0791,1.05826,1.05826,0,0,0-.81739.31347,1.23241,1.23241,0,0,0-.29.87012L73.938,133.606a2.17006,2.17006,0,0,1,.68847-.84668,1.57855,1.57855,0,0,1,.93458-.30176,2.051,2.051,0,0,1,.7207.12012,1.59177,1.59177,0,0,1,.5625.35449l-.85547,1.17773A.90658.90658,0,0,0,75.64307,133.87842Z"
                                transform="translate(-43.4306 -130.10791)" />
                            <path class="cls-1"
                                d="M77.68213,130.10791h1.39453v1.40039H77.68213Zm0,2.4375h1.39453v6.082H77.68213Z"
                                transform="translate(-43.4306 -130.10791)" />
                            <path class="cls-1"
                                d="M80.26611,132.54541h2.85938V133.77H80.26611Zm.98438,5.7041a1.7769,1.7769,0,0,1-.35742-1.2041v-6.26953h1.40039v6.07617a.57335.57335,0,0,0,.08789.34277.29932.29932,0,0,0,.25781.12012h.48633v1.3418h-.75A1.42181,1.42181,0,0,1,81.25049,138.24951Z"
                                transform="translate(-43.4306 -130.10791)" />
                            <path class="cls-1"
                                d="M84.00439,132.54541h1.36524l1.957,5.28516-.83789,1.29492Zm5.502,0-2.64844,7.50586a1.87147,1.87147,0,0,1-.37207.65918,1.26913,1.26913,0,0,1-.55957.34863,2.75413,2.75413,0,0,1-.82031.10547h-.29883V139.811H85.106a.857.857,0,0,0,.4834-.123.86764.86764,0,0,0,.30175-.416l2.25-6.72656Z"
                                transform="translate(-43.4306 -130.10791)" />
                            <path class="cls-1" d="M89.50635,137.19775H90.936v1.42969H89.50635Z"
                                transform="translate(-43.4306 -130.10791)" />
                        </svg>`;
    const svgBlob = new Blob([svgLogo], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    logo.src = url;

    logo.onload = () => {
      const logoWidth = 200;
      const logoHeight = (logo.height / logo.width) * logoWidth || 40;
      ctx.drawImage(logo, canvas.width / 2 - logoWidth / 2, canvas.height - logoHeight - 40, logoWidth, logoHeight);

      const imageFrame = document.querySelector('.image-frame');
      imageFrame.innerHTML = ''; // очистка перед вставкою
      const imgPreview = new Image();
      imgPreview.src = canvas.toDataURL('image/png');
      imgPreview.style.width = '100%';
      imgPreview.style.height = 'auto';
      imgPreview.style.borderRadius = '2vh';
      imageFrame.appendChild(imgPreview);
    };
  };
}

// оновлення при відкритті Share
function toggleShareMenu() {
  shareMenu.classList.toggle('opened');
  shareOverlay.classList.toggle('active');

  if (shareMenu.classList.contains('opened')) {
    generateShareImage();
  }
}

document.querySelectorAll('.app-icon').forEach(btn => {
  btn.addEventListener('click', async e => {
    e.preventDefault();

    const img = document.querySelector('.image-frame img');
    if (!img) return;

    const response = await fetch(img.src);
    const blob = await response.blob();
    const file = new File([blob], 'affirmation.png', { type: blob.type });

    const platform = btn.querySelector('.name').innerText.toLowerCase();

    try {
      // --- Якщо підтримується системне меню "Поділитись" (наприклад, Android) ---
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Daily Affirmation',
          text: 'Here’s my daily affirmation 🌿',
          files: [file]
        });
        return;
      }

      // --- Deep Links ---
      switch (platform) {
        case 'telegram':
          // Відкрити Telegram
          window.location.href = `tg://msg_url?text=${encodeURIComponent('Here’s my daily affirmation 🌿')}`;
          setTimeout(() => {
            window.open('https://t.me/share/url?text=' + encodeURIComponent('Here’s my daily affirmation 🌿'), '_blank');
          }, 1000);
          break;

        case 'whatsapp':
          // Відкрити WhatsApp
          window.location.href = `whatsapp://send?text=${encodeURIComponent('Here’s my daily affirmation 🌿')}`;
          setTimeout(() => {
            window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent('Here’s my daily affirmation 🌿'), '_blank');
          }, 1000);
          break;

        case 'instagram':
          // Відкрити Instagram Direct
          // (на мобільному відкриє додаток, на ПК — сторінку)
          window.location.href = 'instagram://direct';
          setTimeout(() => {
            window.open('https://www.instagram.com/direct/inbox/', '_blank');
          }, 1000);
          break;

        case 'more':
          if (navigator.share) {
            await navigator.share({
              title: 'Daily Affirmation',
              text: 'Here’s my daily affirmation 🌿'
            });
          } else {
            alert('Поділитись доступно лише на мобільних пристроях.');
          }
          break;
      }
    } catch (err) {
      console.error('Помилка при відкритті додатку:', err);
    }
  });
});

