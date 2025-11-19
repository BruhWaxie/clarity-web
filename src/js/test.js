document.addEventListener('DOMContentLoaded', function () {
    const before = document.querySelector('.before-test-info');
    const questions = Array.from(document.querySelectorAll('.question'));
    const resultWindow = document.querySelector('.result-window');
    const startingBtn = document.getElementById('startingBtn');
    const totalQuestions = questions.length;
    let currentIndex = -1; // -1 = ми ще у before-блоці

    // Ховаємо всі питання і скидаємо inline-стилі
    function hideAllQuestions() {
        questions.forEach(q => {
            q.classList.remove('active');
            q.style.display = 'none';
            q.style.opacity = '0';
            q.style.transform = 'translateX(0)';
        });
    }

    function showBefore() {
        hideAllQuestions();

        resultWindow.classList.remove('active');
        resultWindow.style.display = 'none';
        resultWindow.style.opacity = '';
        resultWindow.style.transform = '';

        before.classList.add('active');
        before.style.display = 'block';

        currentIndex = -1;
    }

    // Анімація переходу між питаннями
    function animateQuestionSwitch(oldQ, newQ, direction) {
        const offset = 40; // px

        // Перший перехід зі стартового екрану
        if (!oldQ) {
            hideAllQuestions();

            newQ.style.display = 'block';
            newQ.style.opacity = '0';
            newQ.style.transform = `translateX(${direction === 'next' ? offset : -offset}px)`;

            // тригер анімації
            void newQ.offsetWidth;

            newQ.style.transform = 'translateX(0)';
            newQ.style.opacity = '1';
            newQ.classList.add('active');

            return;
        }

        // Обидва видимі на час анімації
        oldQ.style.display = 'block';
        newQ.style.display = 'block';

        oldQ.classList.add('active');
        newQ.classList.add('active');

        // Початкові стани
        oldQ.style.transform = 'translateX(0)';
        oldQ.style.opacity = '1';

        newQ.style.transform = `translateX(${direction === 'next' ? offset : -offset}px)`;
        newQ.style.opacity = '0';

        // тригер перерахунку
        void newQ.offsetWidth;

        // Анімація: старе їде вбік, нове заїжджає
        oldQ.style.transform = `translateX(${direction === 'next' ? -offset : offset}px)`;
        oldQ.style.opacity = '0';

        newQ.style.transform = 'translateX(0)';
        newQ.style.opacity = '1';

        // Після анімації ховаємо старе питання
        setTimeout(() => {
            oldQ.style.display = 'none';
            oldQ.classList.remove('active');
        }, 350);
    }

    function showQuestion(index, direction = 'next') {
        before.classList.remove('active');
        before.style.display = 'none';

        resultWindow.classList.remove('active');
        resultWindow.style.display = 'none';

        const oldQ = currentIndex >= 0 ? questions[currentIndex] : null;
        const newQ = questions[index];

        animateQuestionSwitch(oldQ, newQ, direction);

        currentIndex = index;
        // БІЛЬШЕ НІЯКОГО scrollTo ВГОРУ — нічого не стрибає
    }

    function calculateScore() {
        let score = 0;
        for (let i = 1; i <= totalQuestions; i++) {
            const checked = document.querySelector(`input[name="qstn${i}"]:checked`);
            if (!checked) continue;

            if (checked.classList.contains('pts1')) score += 1;
            else if (checked.classList.contains('pts2')) score += 2;
            else if (checked.classList.contains('pts3')) score += 3;
        }
        return score;
    }

    function showResult(score) {
        // Ховаємо питання
        hideAllQuestions();
        before.classList.remove('active');
        before.style.display = 'none';

        // Текст балів
        const pointElems = resultWindow.querySelectorAll('.points-gained');
        pointElems.forEach(el => {
            el.textContent = `${score} points`;
        });

        // Вибір блоку результату
        const results = {
            minimal: resultWindow.querySelector('.min-result'),
            mild: resultWindow.querySelector('.low-result'),
            moderate: resultWindow.querySelector('.high-result'),
            severe: resultWindow.querySelector('.max-result')
        };

        Object.values(results).forEach(el => el && el.classList.remove('true'));

        let activeResult;
        if (score <= 4) activeResult = results.minimal;
        else if (score <= 9) activeResult = results.mild;
        else if (score <= 14) activeResult = results.moderate;
        else activeResult = results.severe;

        if (activeResult) activeResult.classList.add('true');

        // Шкала 0–21 → 0–100%
        const scoreLines = resultWindow.querySelectorAll('.score-line');
        const percentage = Math.max(0, Math.min(100, (score / 21) * 100));

        scoreLines.forEach(line => {
            line.style.width = `calc(${percentage}% - 8px)`; // анімація width з CSS
        });

        // Анімація появи результату (виїзд знизу)
        resultWindow.style.display = 'block';
        resultWindow.style.opacity = '0';
        resultWindow.style.transform = 'translateY(40px)';

        void resultWindow.offsetWidth;

        resultWindow.classList.add('active');
        resultWindow.style.opacity = '1';
        resultWindow.style.transform = 'translateY(0)';
        // scrollTo прибрав — результат не «стрибає» вгору, а просто зʼявляється
    }

    // Старт тесту
    if (startingBtn) {
        startingBtn.addEventListener('click', () => {
            showQuestion(0, 'next');
        });
    }

    // Next / Previous
    // Next / Previous
    questions.forEach((q, index) => {
        const nextBtn = q.querySelector('.btnNext') || q.querySelector('.test-btn:not(.btnPrev)');
        const prevBtn = q.querySelector('.btnPrev');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (index === totalQuestions - 1) {
                    const score = calculateScore();
                    showResult(score);
                } else {
                    showQuestion(index + 1, 'next');
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (index > 0) {
                    showQuestion(index - 1, 'prev');
                } else {
                    showBefore();
                }
            });
        }
    });

    // --- Блокування Next, поки не вибрана відповідь + "кнопка" для вибору ---
    questions.forEach(q => {
        const radios = q.querySelectorAll("input[type='radio'][name^='qstn']");
        const labels = q.querySelectorAll(".radio-label");
        const nextBtn = q.querySelector('.btnNext') || q.querySelector('.test-btn:not(.btnPrev)');

        // якщо в блоці немає кнопки Next або це не питання — пропускаємо
        if (!nextBtn || radios.length === 0) return;

        // Початково блокуємо Next
        nextBtn.disabled = true;
        nextBtn.classList.add('disabled-btn');

        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                // знімаємо виділення з усіх відповідей у цьому питанні
                labels.forEach(l => l.classList.remove('selected'));

                // додаємо виділення до поточної
                const label = radio.closest('.radio-label');
                if (label) {
                    label.classList.add('selected');
                }

                // розблоковуємо Next
                nextBtn.disabled = false;
                nextBtn.classList.remove('disabled-btn');
            });
        });
    });

    // Початковий стан
    showBefore();
});


// Заборона натискання Next, поки не вибрано відповідь
questions.forEach(q => {
    const radios = q.querySelectorAll("input[type='radio']");
    const nextBtn = q.querySelector(".btnNext") || q.querySelector(".test-btn:not(.btnPrev)");

    if (!nextBtn) return;

    // Початково — кнопка заблокована
    nextBtn.disabled = true;
    nextBtn.classList.add("disabled-btn");

    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            nextBtn.disabled = false;
            nextBtn.classList.remove("disabled-btn");
        });
    });
});

