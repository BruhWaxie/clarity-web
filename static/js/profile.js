const mainInfo = document.querySelector('.main-info-container');
const additionalInfo = document.querySelector('.additional-info');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    const additionalTop = additionalInfo.offsetTop;
    const additionalHeight = additionalInfo.offsetHeight;
    const mainHeight = mainInfo.offsetHeight;

    const stopPoint =
        additionalTop + additionalHeight - mainHeight - 72;

    if (scrollPosition >= 100 && scrollPosition < stopPoint) {
        mainInfo.style.position = 'fixed';
        mainInfo.style.marginTop = '-100px';
        mainInfo.style.top = '';
    } 
    else if (scrollPosition >= stopPoint) {
        mainInfo.style.position = 'absolute';
        mainInfo.style.marginTop = '0';
        mainInfo.style.top = `${72 + additionalHeight - mainHeight}px`;
    } 
    else {
        // початковий стан
        mainInfo.style.position = 'absolute';
        mainInfo.style.marginTop = '0';
        mainInfo.style.top = '';
    }
});
