document.addEventListener('DOMContentLoaded', () => {
    // Елементи DOM
    const container = document.getElementById('slider-container');
    const likeBtn = document.getElementById('likeBtn');
    const shareBtn = document.getElementById('shareBtn');
    const closeShareBtn = document.getElementById('closeShare');
    const shareMenu = document.querySelector('.main-window');
    const shareOverlay = document.querySelector('.overlay-share-window');
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    
    // Стан
    let currentIndex = 0;
    let isScrolling = false;
    let isEnded = false;
    
    // Рахуємо початкову кількість слайдів (ті 3, що прийшли з Django)
    let loadedCount = document.querySelectorAll('.slide').length;

    // --- Функція відображення слайду ---
    function showSlide(index) {
        const slides = document.querySelectorAll('.slide');
        
        // Захист від виходу за межі
        if (index < 0) return;
        if (isScrolling) return;

        // Якщо дійшли до кінця списку
        if (index >= slides.length) {
            if (isEnded) triggerEndScreen(); // Якщо база порожня
            return;
        }

        isScrolling = true;
        currentIndex = index;

        // Знімаємо active з усіх
        slides.forEach(s => s.classList.remove('active'));
        // Ставимо active новому
        slides[index].classList.add('active');

        // Оновлюємо стан лайка
        updateLikeUI();

        // Підвантажуємо нові, якщо наблизились до кінця
        // (наприклад, якщо ми на 3-му слайді з 3-х, вантажимо 4-й)
        if (index >= loadedCount - 2 && !isEnded) {
            fetchNextSlide(loadedCount);
        }

        // Затримка на анімацію (щоб не пролітати слайди миттєво)
        setTimeout(() => isScrolling = false, 600);
    }

    // --- Оновлення кнопки лайка ---
    function updateLikeUI() {
        const slides = document.querySelectorAll('.slide');
        const currentSlide = slides[currentIndex];
        
        if (!currentSlide) return;

        const isLiked = currentSlide.dataset.liked === 'true';
        
        if (isLiked) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
    }

    // --- API: Лайк ---
    likeBtn.addEventListener('click', async () => {
        const slides = document.querySelectorAll('.slide');
        const currentSlide = slides[currentIndex];
        const id = currentSlide.dataset.id;

        try {
            const response = await fetch(`/affirmations/api/like/${id}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': CSRF_TOKEN,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Оновлюємо атрибут в HTML, щоб запам'ятати стан
                currentSlide.dataset.liked = data.liked ? 'true' : 'false';
                updateLikeUI();
            } else {
                console.error("Like failed", response.status);
            }
        } catch (error) {
            console.error("Network error on like", error);
        }
    });

    // --- API: Завантаження наступного (+1) ---
    async function fetchNextSlide(indexToFetch) {
        try {
            console.log(`Fetching slide index: ${indexToFetch}`);
            const response = await fetch(`/affirmations/api/next/?index=${indexToFetch}`);
            const data = await response.json();

            if (data.end_of_content) {
                isEnded = true;
                console.log("End of content reached");
                return;
            }

            createSlideElement(data);
            loadedCount++; // Збільшуємо лічильник завантажених
        } catch (error) {
            console.error("Error fetching slide:", error);
        }
    }

    // Створення DOM елемента для нового слайду
    function createSlideElement(data) {
        const div = document.createElement('div');
        div.classList.add('slide'); // Спочатку невидимий
        div.dataset.id = data.id;
        div.dataset.liked = data.is_liked ? 'true' : 'false';
        
        let imgHtml = '';
        if (data.media_url) {
            imgHtml = `<img class="background-image" src="${data.media_url}" crossorigin="anonymous">`;
        }
        
        div.innerHTML = `
            ${imgHtml}
            <p>${data.text}</p>
        `;
        container.appendChild(div);
    }

    // --- Управління (Скрол, Кнопки) ---
    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) showSlide(currentIndex + 1);
        else if (e.deltaY < 0) showSlide(currentIndex - 1);
    });

    // Навігація кнопками
    if(btnUp) btnUp.addEventListener('click', () => showSlide(currentIndex - 1));
    if(btnDown) btnDown.addEventListener('click', () => showSlide(currentIndex + 1));

    // --- Вікно Share ---
    function toggleShare() {
        shareMenu.classList.toggle('opened');
        shareOverlay.classList.toggle('active');
    }

    if(shareBtn) shareBtn.addEventListener('click', toggleShare);
    if(shareOverlay) shareOverlay.addEventListener('click', toggleShare);
    if(closeShareBtn) closeShareBtn.addEventListener('click', toggleShare);

    // --- Кінець (Таймер) ---
    let timer;
    function triggerEndScreen() {
        const endScreen = document.getElementById('end-screen');
        if (!endScreen) return;
        
        endScreen.classList.add('active');
        
        resetTimer();
        // Відслідковуємо рухи, щоб скинути таймер
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
    }

    function resetTimer() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            window.location.href = '/homepage'; // Redirect to home
        }, 5000);
    }

    // Початкова ініціалізація UI
    updateLikeUI();
});