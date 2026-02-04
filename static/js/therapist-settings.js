// Therapist Settings Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Section Navigation
    initSectionNavigation();

    // Profile Picture Upload
    initProfilePictureUpload();

    // Education Modal
    initEducationModal();

    // Abilities Management
    initAbilitiesManagement();

    // Searchable Dropdowns
    initSearchableDropdowns();

    // Form Submission
    initFormSubmission();
});

// ==========================================
// Section Navigation
// ==========================================
function initSectionNavigation() {
    const navItems = document.querySelectorAll('.settings-nav-item');
    const sections = document.querySelectorAll('.settings-section');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const sectionId = this.dataset.section;

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// ==========================================
// Profile Picture Upload
// ==========================================
function initProfilePictureUpload() {
    const pfpInput = document.getElementById('pfp-upload');
    const previewImage = document.getElementById('previewImage');

    if (pfpInput && previewImage) {
        pfpInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showToast('Please select an image file', 'error');
                    return;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Image size must be less than 5MB', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (event) {
                    previewImage.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// ==========================================
// Education Modal
// ==========================================
function initEducationModal() {
    const modal = document.getElementById('educationModal');
    const addBtn = document.getElementById('addEducationBtn');
    const closeBtn = document.getElementById('closeEducationModal');
    const cancelBtn = document.getElementById('cancelEducation');
    const saveBtn = document.getElementById('saveEducation');
    const educationList = document.getElementById('education-list');

    if (!modal || !addBtn) return;

    // Open modal
    addBtn.addEventListener('click', function () {
        clearEducationForm();
        modal.classList.add('show');
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('show');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Save education
    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            const institution = document.getElementById('edu_institution').value.trim();
            const degree = document.getElementById('edu_degree').value.trim();
            const field = document.getElementById('edu_field').value.trim();
            const startYear = document.getElementById('edu_start_year').value;
            const endYear = document.getElementById('edu_end_year').value;

            // Validate
            if (!institution || !degree || !field || !startYear) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            // Create new education item
            const tempId = 'new_' + Date.now();
            const educationItem = createEducationElement({
                id: tempId,
                institution: institution,
                degree: degree,
                field_of_study: field,
                start_year: startYear,
                end_year: endYear || 'Present'
            });

            // Remove empty state if exists
            const emptyState = educationList.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }

            educationList.appendChild(educationItem);
            closeModal();
            updateEducationsData();
            showToast('Education added successfully', 'success');
        });
    }

    // Remove education
    document.addEventListener('click', function (e) {
        if (e.target.closest('.remove-education-btn')) {
            const btn = e.target.closest('.remove-education-btn');
            const item = btn.closest('.education-item');
            item.remove();
            updateEducationsData();
            showToast('Education removed', 'success');
        }
    });
}

function createEducationElement(edu) {
    const div = document.createElement('div');
    div.className = 'education-item';
    div.dataset.id = edu.id;
    div.innerHTML = `
        <div class="education-header">
            <h4>${escapeHtml(edu.institution)}</h4>
            <button type="button" class="remove-education-btn" data-id="${edu.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
        <p class="education-details">${escapeHtml(edu.degree)} in ${escapeHtml(edu.field_of_study)}</p>
        <p class="education-years">${edu.start_year} - ${edu.end_year}</p>
    `;
    return div;
}

function clearEducationForm() {
    document.getElementById('edu_institution').value = '';
    document.getElementById('edu_degree').value = '';
    document.getElementById('edu_field').value = '';
    document.getElementById('edu_start_year').value = '';
    document.getElementById('edu_end_year').value = '';
}

function updateEducationsData() {
    const educationItems = document.querySelectorAll('.education-item');
    const educations = [];

    educationItems.forEach(item => {
        const id = item.dataset.id;
        const institution = item.querySelector('h4').textContent;
        const details = item.querySelector('.education-details').textContent;
        const years = item.querySelector('.education-years').textContent;

        // Parse details
        const detailsParts = details.split(' in ');
        const degree = detailsParts[0];
        const field = detailsParts[1] || '';

        // Parse years
        const yearsParts = years.split(' - ');
        const startYear = yearsParts[0];
        const endYear = yearsParts[1] === 'Present' ? null : yearsParts[1];

        educations.push({
            id: id,
            institution: institution,
            degree: degree,
            field_of_study: field,
            start_year: startYear,
            end_year: endYear
        });
    });

    document.getElementById('educationsData').value = JSON.stringify(educations);
}

// ==========================================
// Abilities Management
// ==========================================
function initAbilitiesManagement() {
    const addBtn = document.getElementById('addAbilityBtn');
    const input = document.getElementById('newAbility');
    const abilitiesList = document.getElementById('abilities-list');

    if (!addBtn || !input || !abilitiesList) return;

    function addAbility() {
        const ability = input.value.trim();
        if (!ability) {
            showToast('Please enter an ability', 'error');
            return;
        }

        // Remove empty state if exists
        const emptyState = abilitiesList.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const tempId = 'new_' + Date.now();
        const abilityItem = createAbilityElement({
            id: tempId,
            ability: ability
        });

        abilitiesList.appendChild(abilityItem);
        input.value = '';
        updateAbilitiesData();
        showToast('Ability added', 'success');
    }

    addBtn.addEventListener('click', addAbility);

    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAbility();
        }
    });

    // Remove ability
    document.addEventListener('click', function (e) {
        if (e.target.closest('.remove-ability-btn')) {
            const btn = e.target.closest('.remove-ability-btn');
            const item = btn.closest('.ability-item');
            item.remove();
            updateAbilitiesData();
            showToast('Ability removed', 'success');
        }
    });
}

function createAbilityElement(ability) {
    const div = document.createElement('div');
    div.className = 'ability-item';
    div.dataset.id = ability.id;
    div.innerHTML = `
        <span class="ability-text">${escapeHtml(ability.ability)}</span>
        <button type="button" class="remove-ability-btn" data-id="${ability.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </button>
    `;
    return div;
}

function updateAbilitiesData() {
    const abilityItems = document.querySelectorAll('.ability-item');
    const abilities = [];

    abilityItems.forEach(item => {
        abilities.push({
            id: item.dataset.id,
            ability: item.querySelector('.ability-text').textContent
        });
    });

    document.getElementById('abilitiesData').value = JSON.stringify(abilities);
}

// ==========================================
// Form Submission
// ==========================================
function initFormSubmission() {
    const form = document.getElementById('therapistSettingsForm');

    if (!form) return;

    // Update hidden data before submit
    form.addEventListener('submit', function (e) {
        updateEducationsData();
        updateAbilitiesData();
    });
}

// ==========================================
// Utility Functions
// ==========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageEl = toast.querySelector('.toast-message');

    toast.classList.remove('success', 'error');
    toast.classList.add(type);
    messageEl.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// Searchable Dropdowns
// ==========================================
function initSearchableDropdowns() {
    const dropdowns = document.querySelectorAll('.searchable-dropdown');
    dropdowns.forEach(dropdown => {
        new SearchableDropdown(dropdown);
    });
}

class SearchableDropdown {
    constructor(element) {
        this.element = element;
        this.type = element.dataset.type;
        this.mode = element.dataset.mode; // 'single' or 'multi'

        this.searchInput = element.querySelector('.search-input');
        this.dropdownList = element.querySelector('.dropdown-list');
        this.addBtn = element.querySelector('.add-term-btn');
        this.selectedContainer = element.querySelector('.selected-chips');

        // CSRF Token
        this.csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

        this.bindEvents();
        this.setupInitialState();
    }

    bindEvents() {
        // Search input
        this.searchInput.addEventListener('input', debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));

        this.searchInput.addEventListener('focus', () => {
            if (this.dropdownList.children.length > 0) {
                this.showDropdown();
            }
        });

        // Add new term button
        this.addBtn.addEventListener('click', () => {
            this.createNewTerm(this.searchInput.value);
        });

        // Dropdown selection (delegation)
        this.dropdownList.addEventListener('click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (item) {
                this.selectItem(item.dataset.id, item.dataset.name);
            }
            if (e.target.closest('.create-new-prompt')) {
                this.createNewTerm(this.searchInput.value);
            }
        });

        // Remove chips (delegation)
        this.selectedContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.remove-chip');
            if (btn) {
                const chip = btn.closest('.selected-chip');
                this.removeItem(chip);
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.hideDropdown();
            }
        });

        // Prevent form submission on enter in search input
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // If there is an exact match or create prompt, maybe trigger it?
                // For now just prevent submit
            }
        });
    }

    setupInitialState() {
        // Any specific initialization logic if needed
    }

    async handleSearch(query) {
        if (!query.trim()) {
            this.hideDropdown();
            this.addBtn.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`/api/metadata/search/?type=${this.type}&q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const results = await response.json();
                this.renderResults(results, query);
                this.showDropdown();

                // Show add button if no exact match (or always show for convenience)
                const hasExactMatch = results.some(r => r.name.toLowerCase() === query.toLowerCase());
                if (!hasExactMatch) {
                    this.addBtn.classList.remove('hidden');
                } else {
                    this.addBtn.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    renderResults(results, query) {
        this.dropdownList.innerHTML = '';

        if (results.length === 0) {
            this.dropdownList.innerHTML = `
                <div class="no-results">
                    No matches found for "${escapeHtml(query)}"
                    <span class="create-new-prompt">Create "${escapeHtml(query)}"?</span>
                </div>`;
            return;
        }

        results.forEach(result => {
            // Check if already selected
            const isSelected = this.isSelected(result.id);
            if (isSelected) return; // Skip currently selected items

            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.dataset.id = result.id;
            item.dataset.name = result.name;
            item.textContent = result.name;
            this.dropdownList.appendChild(item);
        });

        if (this.dropdownList.children.length === 0) {
            // All results selected
            this.dropdownList.innerHTML = `<div class="no-results">All matching items selected</div>`;
        }
    }

    isSelected(id) {
        if (this.mode === 'single') {
            const hidden = this.element.querySelector('input[type="hidden"]');
            return hidden && hidden.value == id;
        } else {
            const chips = this.selectedContainer.querySelectorAll('.selected-chip');
            for (let chip of chips) {
                if (chip.dataset.id == id) return true;
            }
            return false;
        }
    }

    selectItem(id, name) {
        if (this.mode === 'single') {
            // Clear previous selection
            this.selectedContainer.innerHTML = '';
            const hidden = this.element.querySelector('input[type="hidden"]');
            if (hidden) hidden.value = id;
        }

        // Add chip
        this.addChip(id, name);

        // Reset search
        this.searchInput.value = '';
        this.hideDropdown();
        this.addBtn.classList.add('hidden');
    }

    removeItem(chip) {
        const id = chip.dataset.id;
        chip.remove();

        if (this.mode === 'single') {
            const hidden = this.element.querySelector('input[type="hidden"]');
            if (hidden) hidden.value = '';
        }
    }

    addChip(id, name) {
        const chip = document.createElement('div');
        chip.className = 'selected-chip';
        chip.dataset.id = id;

        // Hidden input for form submission
        let hiddenInputName = this.type;
        if (this.type === 'therapy') hiddenInputName = 'type_of_therapy';
        else if (this.type === 'problem') hiddenInputName = 'problems';

        // Note: For single select, the hidden input is outside the chip container
        // For multi select, we put hidden input inside the chip

        let hiddenInputHtml = '';
        if (this.mode === 'multi') {
            hiddenInputHtml = `<input type="hidden" name="${hiddenInputName}" value="${id}">`;
        } // For single, existing hidden input is updated in selectItem

        chip.innerHTML = `
            ${escapeHtml(name)}
            <button type="button" class="remove-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
            </button>
            ${hiddenInputHtml}
        `;

        this.selectedContainer.appendChild(chip);
    }

    // Correct implementation of createNewTerm
    async createNewTerm(name) {
        if (!name.trim()) return;

        try {
            const response = await fetch('/api/metadata/create_term/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken
                },
                body: JSON.stringify({
                    type: this.type,
                    name: name.trim()
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.selectItem(result.id, result.name);
                showToast(`${result.name} added successfully`, 'success');
            } else {
                const err = await response.json();
                showToast(err.error || 'Failed to add term', 'error');
            }
        } catch (error) {
            console.error('Create failed:', error);
            showToast('Failed to create new term', 'error');
        }
    }

    showDropdown() {
        this.dropdownList.classList.add('show');
    }

    hideDropdown() {
        this.dropdownList.classList.remove('show');
    }
}

// Debounce Utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
