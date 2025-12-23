// Клас для управління завантаженням відгуків
class ReviewLoader {
    constructor(psychologistId) {
        this.psychologistId = psychologistId;
        this.offset = 1; // Починаємо з 1, бо перший відгук вже показаний
        this.limit = 5;
        this.loading = false;
        this.hasMore = true;
        
        this.reviewsContainer = document.querySelector('.reviews');
        this.loadMoreBtn = document.querySelector('.primary-btn-overlay');
        
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
    }
    
    async loadMore() {
        if (this.loading || !this.hasMore) return;
        
        this.loading = true;
        this.loadMoreBtn.disabled = true;
        this.loadMoreBtn.textContent = 'Loading...';
        
        try {
            const response = await fetch(
                `/api/reviews/psychologist_reviews/?psychologist_id=${this.psychologistId}&offset=${this.offset}&limit=${this.limit}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to load reviews');
            }
            
            const data = await response.json();
            
            // Додаємо нові відгуки
            this.appendReviews(data.reviews);
            
            // Оновлюємо стан
            this.offset += data.reviews.length;
            this.hasMore = data.has_more;
            
            // Оновлюємо кнопку
            if (this.hasMore) {
                const remaining = data.total - this.offset;
                this.loadMoreBtn.textContent = `View more(${remaining})`;
                this.loadMoreBtn.disabled = false;
            } else {
                this.loadMoreBtn.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.loadMoreBtn.textContent = 'Error loading reviews. Try again';
            this.loadMoreBtn.disabled = false;
        } finally {
            this.loading = false;
        }
    }
    
    appendReviews(reviews) {
        reviews.forEach(review => {
            const reviewElement = this.createReviewElement(review);
            // Вставляємо перед кнопкою
            this.loadMoreBtn.insertAdjacentHTML('beforebegin', reviewElement);
        });
    }
    
    createReviewElement(review) {
        const stars = this.generateStars(review.rating);
        const authorName = review.author ? review.author.first_name : 'Anonymous';
        const pfpUrl = review.author && review.author.pfp ? review.author.pfp : '';
        
        return `
            <div class="review">
                <div class="review-head">
                    <div class="user">
                        <div class="icon" ${pfpUrl ? `style="background-image: url('${pfpUrl}')"` : ''}></div>
                        <span class="time-name">
                            <div class="name">${authorName}</div>
                            <div class="date">${review.created_at}</div>
                        </span>
                    </div>
                    <div class="review-stars">
                        ${stars}
                    </div>
                </div>
                <div class="text-content">
                    ${review.text}
                </div>
            </div>
        `;
    }
    
    generateStars(rating) {
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            const filled = i < rating;
            starsHtml += `
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                    <path
                        d="M7.63025 1.50635C7.8266 1.07521 7.92482 0.85964 8.06155 0.793256C8.18029 0.735581 8.31973 0.735581 8.43847 0.793256C8.5752 0.85964 8.67342 1.07521 8.86977 1.50635L10.4338 4.94041C10.4919 5.06786 10.5209 5.13159 10.5659 5.18039C10.6055 5.22357 10.6541 5.25811 10.7083 5.28175C10.7697 5.30848 10.8406 5.31581 10.9824 5.33045L14.8028 5.72509C15.2824 5.77463 15.5222 5.7994 15.629 5.90614C15.7217 5.99885 15.7648 6.12868 15.7455 6.25705C15.7232 6.40481 15.5441 6.56277 15.1858 6.87879L12.332 9.39582C12.2261 9.48921 12.1731 9.53594 12.1396 9.5928C12.1099 9.64319 12.0914 9.69906 12.0852 9.75683C12.0781 9.82216 12.0929 9.89039 12.1225 10.0269L12.9196 13.7049C13.0197 14.1667 13.0697 14.3975 12.999 14.5298C12.9375 14.6449 12.8247 14.7251 12.694 14.7467C12.5435 14.7716 12.3346 14.6538 11.9168 14.4179L8.58902 12.5394C8.46553 12.4697 8.40378 12.4349 8.33813 12.4212C8.28003 12.4092 8.21998 12.4092 8.16188 12.4212C8.09623 12.4349 8.03449 12.4697 7.91099 12.5394L4.58322 14.4179C4.16542 14.6538 3.95653 14.7716 3.80605 14.7467C3.67534 14.7251 3.5625 14.6449 3.50106 14.5298C3.43033 14.3975 3.48036 14.1667 3.58044 13.7049L4.37752 10.0269C4.4071 9.89039 4.42189 9.82216 4.41487 9.75683C4.40865 9.69906 4.3901 9.64319 4.36042 9.5928C4.32687 9.53594 4.27391 9.48921 4.168 9.39582L1.31423 6.87879C0.955956 6.56277 0.776814 6.40481 0.754541 6.25705C0.735203 6.12868 0.778298 5.99885 0.871037 5.90614C0.977805 5.7994 1.21762 5.77463 1.69727 5.72509L5.51767 5.33045C5.65947 5.31581 5.73036 5.30848 5.79166 5.28175C5.8459 5.25811 5.89447 5.22357 5.93421 5.18039C5.97913 5.13159 6.00815 5.06786 6.06621 4.94041L7.63025 1.50635Z"
                        stroke="#FFCC00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    ${filled ? `<path
                        d="M6.04258 5.13292L8.07819 1.14844L10.5209 5.13292L15.4064 6.32826L12.1494 9.91429L12.5565 14.6957L8.07819 12.305L3.59985 14.2972L4.4141 9.91429L0.75 5.92981L6.04258 5.13292Z"
                        fill="#FFCC00" />` : ''}
                </svg>
            `;
        }
        return starsHtml;
    }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    const psychologistIdElement = document.querySelector('[data-psychologist-id]');
    if (psychologistIdElement) {
        const psychologistId = psychologistIdElement.dataset.psychologistId;
        new ReviewLoader(psychologistId);
    }
});