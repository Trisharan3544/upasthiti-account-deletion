/**
 * Validation Utilities
 * Email and password validation functions
 */

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {Object} - { valid: boolean, message: string }
 */
function validateEmail(email) {
    if (!email || email.trim() === '') {
        return { valid: false, message: 'Email address is required' };
    }
    
    const emailTrimmed = email.trim();
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
        return { valid: false, message: 'Please enter a valid email address' };
    }
    
    // Check for common typos
    if (emailTrimmed.includes('..')) {
        return { valid: false, message: 'Email address cannot contain consecutive dots' };
    }
    
    if (emailTrimmed.startsWith('.') || emailTrimmed.endsWith('.')) {
        return { valid: false, message: 'Email address cannot start or end with a dot' };
    }
    
    // Length validation
    if (emailTrimmed.length > 254) {
        return { valid: false, message: 'Email address is too long' };
    }
    
    // Domain validation (basic)
    const parts = emailTrimmed.split('@');
    if (parts.length !== 2) {
        return { valid: false, message: 'Please enter a valid email address' };
    }
    
    const domain = parts[1];
    if (domain.length < 4 || !domain.includes('.')) {
        return { valid: false, message: 'Please enter a valid email address' };
    }
    
    return { valid: true, message: '' };
}

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, message: string }
 */
function validatePassword(password) {
    if (!password || password === '') {
        return { valid: false, message: 'Password is required' };
    }
    
    // Minimum length
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long' };
    }
    
    // Maximum length (Firebase limit)
    if (password.length > 128) {
        return { valid: false, message: 'Password is too long (maximum 128 characters)' };
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', '12345678', 'qwerty', 'abc123'];
    if (commonPasswords.includes(password.toLowerCase())) {
        return { valid: false, message: 'Password is too common. Please choose a stronger password' };
    }
    
    return { valid: true, message: '' };
}

/**
 * Show field error
 * @param {HTMLElement} errorElement - Error element to show
 * @param {string} message - Error message
 */
function showFieldError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Hide field error
 * @param {HTMLElement} errorElement - Error element to hide
 */
function hideFieldError(errorElement) {
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }
}

/**
 * Show loading overlay
 */
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Show error message
 * @param {HTMLElement} errorDiv - Error div element
 * @param {string} message - Error message
 */
function showError(errorDiv, message) {
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Hide error message
 * @param {HTMLElement} errorDiv - Error div element
 */
function hideError(errorDiv) {
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
}

// Make functions globally available
window.validationUtils = {
    validateEmail,
    validatePassword,
    showFieldError,
    hideFieldError,
    showLoading,
    hideLoading,
    showError,
    hideError
};

