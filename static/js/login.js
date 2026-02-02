document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');

    // Form validation before submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const username = document.getElementById('username');
            const password = document.getElementById('password');
            let isValid = true;

            // Clear previous errors
            clearError(username);
            clearError(password);

            // Validate username
            if (username.value.trim() === '') {
                showError(username, "Please enter your username or email");
                isValid = false;
            }

            // Validate password
            if (password.value === '') {
                showError(password, "Please enter your password");
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    // Helper functions for Validation
    function showError(input, message) {
        input.style.border = '2px solid var(--danger-color)';

        // Remove existing error message if any
        const existingError = input.parentNode.querySelector('.error-message[data-for="' + input.id + '"]');
        if (existingError) {
            existingError.remove();
        }

        const errorMsg = document.createElement('div');
        errorMsg.innerText = message;
        errorMsg.setAttribute('data-for', input.id);
        errorMsg.style.color = 'var(--danger-color)';
        errorMsg.style.fontSize = '12px';
        errorMsg.style.marginTop = '-8px';
        errorMsg.style.marginBottom = '10px';
        errorMsg.style.marginLeft = '4px';
        errorMsg.classList.add('error-message');

        if (input.nextSibling) {
            input.parentNode.insertBefore(errorMsg, input.nextSibling);
        } else {
            input.parentNode.appendChild(errorMsg);
        }

        input.addEventListener('input', () => clearError(input), { once: true });
    }

    function clearError(input) {
        input.style.border = 'none';

        const errorMsg = input.parentNode.querySelector('.error-message[data-for="' + input.id + '"]');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
});
