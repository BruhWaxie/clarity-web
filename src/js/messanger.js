const textarea = document.querySelector('.writing-input');
const container = document.querySelector('.writing-container');
const sendBtn = document.querySelector('.send-btn');
const chatContainer = document.querySelector('.chat-container')

function scrollChatToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

window.addEventListener('load', () => {
    scrollChatToBottom();
});     

textarea.addEventListener('input', () => {
    const value = textarea.value.trim();

    if (value === '') {
        // якщо нічого не введено
        textarea.style.height = '20px';
        container.style.height = '20px';
        textarea.style.overflowY = 'hidden';
        sendBtn.style.right = '3px';
        sendBtn.style.bottom = '3px';
        sendBtn.classList.add('disabled');
        return;
    } else {
        sendBtn.classList.remove('disabled');
    }

    // якщо є текст — твоя логіка
    textarea.style.height = 'auto';
    sendBtn.style.right = '5px';
    sendBtn.style.bottom = '5px';
    let newHeight = textarea.scrollHeight;
    

    if (newHeight > 120) {
        newHeight = 120;
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.overflowY = 'hidden';
    }

    textarea.style.height = newHeight + 'px';
    container.style.height = newHeight + 'px';
});



