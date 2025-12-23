function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'var(--success-color2)' : 'var(--danger-color)'};
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        z-index: 99999;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function clearError(element) {
    const existingError = element.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function showError(element, message) {
    clearError(element);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: var(--danger-color);
        font-size: 12px;
        margin-top: 5px;
    `;
    element.parentElement.appendChild(errorDiv);
}

function validateForm() {
    let isValid = true;
    
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const problemSelect = document.getElementById('problem-select');
    const reviewText = document.getElementById('review-text');

    if (!ratingInput) {
        showError(document.querySelector('.star-rating-box'), 'This field must not be empty');
        isValid = false;
    } else {
        clearError(document.querySelector('.star-rating-box'));
    }

    if (!problemSelect.value) {
        showError(problemSelect, 'This field must not be empty');
        isValid = false;
    } else {
        clearError(problemSelect);
    }

    if (!reviewText.value.trim()) {
        showError(reviewText, 'This field must not be empty');
        isValid = false;
    } else {
        clearError(reviewText);
    }

    return isValid;
}

document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
    document.head.appendChild(style);

    const openReviewBtn = document.querySelector('.btn-round-overlay');
    const reviewOverlay = document.querySelector('.review-overlay');
    const closeOverlayBtn = document.querySelector('.overflow-action-btn');

    if (openReviewBtn) {
        openReviewBtn.addEventListener('click', function() {
            reviewOverlay.classList.add('open');
        });
    }

    if (closeOverlayBtn) {
        closeOverlayBtn.addEventListener('click', function() {
            reviewOverlay.classList.remove('open');
        });
    }

    reviewOverlay.addEventListener('click', function(e) {
        if (e.target === reviewOverlay) {
            reviewOverlay.classList.remove('open');
        }
    });

    const postBtn = document.querySelector('.btn-post');
    
    if (postBtn) {
        postBtn.addEventListener('click', function(e) {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            const ratingValue = document.querySelector('input[name="rating"]:checked').value;
            const problemId = document.getElementById('problem-select').value;
            const reviewText = document.getElementById('review-text').value;
            
            const reviewsDiv = document.querySelector('.reviews');
            const psychologistId = reviewsDiv ? reviewsDiv.dataset.psychologistId : null;

            if (!psychologistId) {
                showToast('Something went wrong.', 'error');
                return;
            }

            const csrftoken = getCookie('csrftoken');

            const formData = new FormData();
            formData.append('rating', ratingValue);
            formData.append('problem', problemId);
            formData.append('text', reviewText);
            formData.append('psychologist', psychologistId);

            fetch('/add-review/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    reviewOverlay.classList.remove('open');
                    showToast('Successfully uploaded.', 'success');
                    
                    document.querySelector('input[name="rating"]:checked').checked = false;
                    document.getElementById('problem-select').value = '';
                    document.getElementById('review-text').value = '';

                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    showToast('Something went wrong.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Something went wrong.', 'error');
            });
        });
    }

    const ratingInputs = document.querySelectorAll('.star-rating input[type="radio"]');
    const problemSelect = document.getElementById('problem-select');
    const reviewText = document.getElementById('review-text');

    if (ratingInputs) {
        ratingInputs.forEach(input => {
            input.addEventListener('change', function() {
                clearError(document.querySelector('.star-rating-box'));
            });
        });
    }

    if (problemSelect) {
        problemSelect.addEventListener('change', function() {
            clearError(this);
        });
    }

    if (reviewText) {
        reviewText.addEventListener('input', function() {
            clearError(this);
        });
    }
});

function closeOverlay() {
    document.querySelector('.review-overlay').classList.remove('open');
}