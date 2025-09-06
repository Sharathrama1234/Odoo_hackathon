// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Auto-submit filter forms on change
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            this.closest('form').submit();
        });
    });
    
    // Confirm delete actions
    const deleteForms = document.querySelectorAll('.delete-form');
    deleteForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Are you sure you want to delete this item?')) {
                e.preventDefault();
            }
        });
    });
    
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });
    
    // Image preview functionality
    const imageInputs = document.querySelectorAll('input[type="file"][name="images"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            handleImagePreview(e.target.files, document.getElementById('image-preview'));
        });
    });
    
    // Drag and drop functionality
    const uploadAreas = document.querySelectorAll('.file-upload-area');
    uploadAreas.forEach(area => {
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.type.startsWith('image/')
            );
            
            if (files.length > 0) {
                const input = document.getElementById('images');
                // Create a new FileList object
                const dt = new DataTransfer();
                files.forEach(file => dt.items.add(file));
                input.files = dt.files;
                
                handleImagePreview(files, document.getElementById('image-preview'));
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading state to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            }
        });
    });
    
    // Email validation for login form
    const loginForm = document.querySelector('form[action="/auth/login"]');
    if (loginForm) {
        const emailInput = loginForm.querySelector('input[name="email"]');
        const submitButton = loginForm.querySelector('button[type="submit"]');
        
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                const email = this.value;
                if (email && !isValidEmail(email)) {
                    this.style.borderColor = '#dc3545';
                    showInputError(this, 'Please enter a valid email address');
                } else {
                    this.style.borderColor = '#4a7c59';
                    hideInputError(this);
                }
            });
        }
    }
    
    // Enhanced form validation for registration
    const registerForm = document.querySelector('form[action="/auth/register"]');
    if (registerForm) {
        const fields = {
            username: registerForm.querySelector('input[name="username"]'),
            email: registerForm.querySelector('input[name="email"]'),
            password: registerForm.querySelector('input[name="password"]'),
            confirmPassword: registerForm.querySelector('input[name="confirmPassword"]')
        };
        
        // Real-time validation
        if (fields.email) {
            fields.email.addEventListener('input', function() {
                if (this.value && !isValidEmail(this.value)) {
                    this.style.borderColor = '#dc3545';
                    showInputError(this, 'Please enter a valid email address');
                } else {
                    this.style.borderColor = '#4a7c59';
                    hideInputError(this);
                }
            });
        }
        
        if (fields.password) {
            fields.password.addEventListener('input', function() {
                if (this.value && this.value.length < 6) {
                    this.style.borderColor = '#dc3545';
                    showInputError(this, 'Password must be at least 6 characters');
                } else {
                    this.style.borderColor = '#4a7c59';
                    hideInputError(this);
                }
            });
        }
        
        if (fields.confirmPassword) {
            fields.confirmPassword.addEventListener('input', function() {
                if (this.value && this.value !== fields.password.value) {
                    this.style.borderColor = '#dc3545';
                    showInputError(this, 'Passwords do not match');
                } else {
                    this.style.borderColor = '#4a7c59';
                    hideInputError(this);
                }
            });
        }
    }
});

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Image handling functions
function handleImagePreview(files, previewContainer) {
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    if (files.length === 0) return;
    
    // Validate file count
    if (files.length > 5) {
        showError('Maximum 5 images allowed');
        return;
    }
    
    Array.from(files).forEach((file, index) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError(`File ${file.name} is not an image`);
            return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showError(`File ${file.name} is too large (max 5MB)`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewItem = createImagePreviewItem(e.target.result, file.name, index);
            previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

function createImagePreviewItem(src, filename, index) {
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.innerHTML = `
        <img src="${src}" alt="${filename}">
        <button type="button" class="remove-image" onclick="removePreviewImage(this, ${index})">
            <i class="fas fa-times"></i>
        </button>
    `;
    return div;
}

function removePreviewImage(button, index) {
    const previewItem = button.parentElement;
    const previewContainer = previewItem.parentElement;
    const fileInput = document.getElementById('images');
    
    // Remove from preview
    previewItem.remove();
    
    // Remove from file input (create new FileList without this file)
    const dt = new DataTransfer();
    Array.from(fileInput.files).forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    fileInput.files = dt.files;
    
    // Update preview with remaining files
    handleImagePreview(fileInput.files, previewContainer);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'file-error';
    errorDiv.textContent = message;
    
    const uploadArea = document.querySelector('.file-upload-area');
    if (uploadArea) {
        const existingError = uploadArea.parentElement.querySelector('.file-error');
        if (existingError) {
            existingError.remove();
        }
        uploadArea.parentElement.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Form validation helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showInputError(input, message) {
    hideInputError(input); // Remove existing error first
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.textContent = message;
    
    input.parentElement.appendChild(errorDiv);
}

function hideInputError(input) {
    const existingError = input.parentElement.querySelector('.input-error');
    if (existingError) {
        existingError.remove();
    }
}

// Search functionality enhancement
function initializeSearch() {
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // This could trigger auto-search in a real implementation
                console.log('Search query:', this.value);
            }, 500);
        });
    }
}

// Initialize search when DOM is loaded
initializeSearch();

// Product detail image gallery
function changeMainImage(imageSrc, thumbnail) {
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = imageSrc;
        
        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        thumbnail.classList.add('active');
    }
}

// Theme switching (placeholder for future implementation)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}
