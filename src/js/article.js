const header = document.querySelector("header");
const progressBar = document.getElementById("progress-bar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    header.style.top = "0";
  } else {
    header.style.top = "-60px";
  }
});

const navLinks = {
  "overview": document.getElementById("link-overview"),
  "base-info": document.getElementById("link-article"),
  "comments": document.getElementById("link-comments")
};

// Якщо Overview – це початок сторінки без секції, можна підсвічувати по scrollY
function updateOverviewLink() {
  if (window.scrollY < document.getElementById('base-info').offsetTop - 50) {
    navLinks.overview.classList.add('active');
    navLinks["base-info"].classList.remove('active');
    navLinks.comments.classList.remove('active');
  }
}

// IntersectionObserver для article і comments
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const baseInfo = document.getElementById('base-info').offsetTop;
  const comments = document.getElementById('comments').offsetTop;

  if (y < baseInfo - 50) {
    navLinks.overview.classList.add('active');
    navLinks["base-info"].classList.remove('active');
    navLinks.comments.classList.remove('active');
  } else if (y >= baseInfo - 50 && y < comments - 50) {
    navLinks.overview.classList.remove('active');
    navLinks["base-info"].classList.add('active');
    navLinks.comments.classList.remove('active');
  } else if (y >= comments - 50) {
    navLinks.overview.classList.remove('active');
    navLinks["base-info"].classList.remove('active');
    navLinks.comments.classList.add('active');
  }
});

