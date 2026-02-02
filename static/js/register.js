document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const startRegisterBtn = document.getElementById('startRegisterBtn');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const backBtn = document.getElementById('backBtn');
    const finishRegisterBtn = document.getElementById('finishRegisterBtn');

    // Windows
    const welcomeWindow = document.querySelector('.welcome.window');
    const step1Window = document.querySelector('.input-window-1');
    const step2Window = document.querySelector('.input-window-2');

    // Profile picture elements
    const profilePictureInput = document.getElementById('profilePictureInput');
    const profilePreview = document.getElementById('profilePreview');
    const croppedImageData = document.getElementById('croppedImageData');

    // Cropper modal elements
    const cropperModal = document.getElementById('cropperModal');
    const cropperOverlay = document.getElementById('cropperOverlay');
    const cropperImage = document.getElementById('cropperImage');
    const cancelCropBtn = document.getElementById('cancelCrop');
    const applyCropBtn = document.getElementById('applyCrop');

    // Form
    const registerForm = document.getElementById('registerForm');

    // Cropper instance
    let cropper = null;

    // Window transition helper function
    function switchWindow(fromWindow, toWindow) {
        if (fromWindow && toWindow) {
            fromWindow.classList.add('fade-out');

            setTimeout(() => {
                fromWindow.classList.remove('active', 'fade-out');
                toWindow.classList.add('active');
            }, 300);
        }
    }

    // Switch from Welcome to Step 1 (Role Selection)
    if (startRegisterBtn) {
        startRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchWindow(welcomeWindow, step1Window);
        });
    }

    // Switch from Step 1 to Step 2 (Account Details)
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Validate Step 1 fields
            const step1Inputs = step1Window.querySelectorAll('.text-inputs');
            let allValid = true;

            step1Inputs.forEach(input => {
                clearError(input);
                if (input.value.trim() === '') {
                    showError(input);
                    allValid = false;
                }
            });

            if (allValid) {
                switchWindow(step1Window, step2Window);
            }
        });
    }

    // Switch back from Step 2 to Step 1
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchWindow(step2Window, step1Window);
        });
    }

    // ===== IMAGE CROPPING FUNCTIONALITY =====

    // Open cropper modal when user selects an image
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    // Set the image source and open the modal
                    cropperImage.src = event.target.result;
                    openCropperModal();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Open cropper modal
    function openCropperModal() {
        cropperModal.classList.add('active');

        // Initialize Cropper after a small delay to ensure the image is loaded
        setTimeout(() => {
            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(cropperImage, {
                aspectRatio: 1, // 1:1 square
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.8,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                minContainerWidth: 200,
                minContainerHeight: 200,
                minCropBoxWidth: 50,
                minCropBoxHeight: 50,
            });
        }, 100);
    }

    // Close cropper modal
    function closeCropperModal() {
        cropperModal.classList.remove('active');
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        // Reset file input
        profilePictureInput.value = '';
    }

    // Cancel crop
    if (cancelCropBtn) {
        cancelCropBtn.addEventListener('click', closeCropperModal);
    }

    // Close on overlay click
    if (cropperOverlay) {
        cropperOverlay.addEventListener('click', closeCropperModal);
    }

    // Apply crop
    if (applyCropBtn) {
        applyCropBtn.addEventListener('click', () => {
            if (cropper) {
                // Get the cropped canvas
                const canvas = cropper.getCroppedCanvas({
                    width: 300,
                    height: 300,
                    imageSmoothingEnabled: true,
                    imageSmoothingQuality: 'high',
                });

                if (canvas) {
                    // Convert to base64 and set preview
                    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    profilePreview.src = croppedDataUrl;

                    // Store the cropped image data for form submission
                    croppedImageData.value = croppedDataUrl;
                }

                closeCropperModal();
            }
        });
    }

    // ===== END IMAGE CROPPING =====

    // Final registration validation and submission
    if (finishRegisterBtn) {
        finishRegisterBtn.addEventListener('click', (e) => {
            // Validate Step 2 fields
            const step2Inputs = step2Window.querySelectorAll('.text-inputs');
            let allValid = true;

            step2Inputs.forEach(input => {
                clearError(input);
                if (input.value.trim() === '') {
                    showError(input);
                    allValid = false;
                }
            });

            // Validate password match
            const password1 = document.getElementById('password1');
            const password2 = document.getElementById('password2');

            if (password1 && password2 && password1.value !== password2.value) {
                clearError(password2);
                showError(password2, "Passwords don't match");
                allValid = false;
            }

            if (!allValid) {
                e.preventDefault();
            }
            // If valid, form will submit naturally via the form action
        });
    }

    // Helper functions for Validation
    function showError(input, message = "This field can't be empty") {
        input.style.border = '2px solid var(--danger-color)';

        // Remove existing error message if any
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorMsg = document.createElement('div');
        errorMsg.innerText = message;
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

        let sibling = input.nextSibling;
        while (sibling) {
            if (sibling.nodeType === 1 && sibling.classList.contains('error-message')) {
                sibling.remove();
                break;
            }
            if (sibling.nodeType === 1 && !sibling.classList.contains('error-message')) {
                break;
            }
            sibling = sibling.nextSibling;
        }
    }
});
