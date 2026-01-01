/**
 * Login Page - Step 1
 * Handles user authentication with email and password validation
 */

let auth;

// Wait for Firebase to initialize
function initializeLogin() {
    if (window.firebaseAuth && window.validationUtils) {
        auth = window.firebaseAuth;
        setupLoginForm();
    } else {
        setTimeout(initializeLogin, 100);
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const loginError = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    const emailHelpIcon = document.getElementById('email-help-icon');
    const passwordHelpIcon = document.getElementById('password-help-icon');
    
    if (!loginForm) return;
    
    // Add help icons
    if (emailHelpIcon && window.popupUtils) {
        const helpIcon = window.popupUtils.createHelpIcon(
            'Email Format Help',
            '<p>Please enter your registered email address in the following format:</p><ul><li>example@domain.com</li><li>name.surname@example.org</li></ul><p><strong>Valid formats:</strong></p><ul><li>Must contain @ symbol</li><li>Must have a valid domain (e.g., .com, .org, .edu)</li><li>Cannot contain consecutive dots (..)</li><li>Cannot start or end with a dot</li><li>Maximum 254 characters</li></ul>'
        );
        emailHelpIcon.appendChild(helpIcon);
    }
    
    if (passwordHelpIcon && window.popupUtils) {
        const helpIcon = window.popupUtils.createHelpIcon(
            'Password Requirements',
            '<p>Your password must meet the following requirements:</p><ul><li><strong>Minimum length:</strong> 6 characters</li><li><strong>Maximum length:</strong> 128 characters</li><li><strong>Cannot be:</strong> Common passwords like "password", "123456", etc.</li></ul><p><strong>Tips for a strong password:</strong></p><ul><li>Use a mix of letters, numbers, and symbols</li><li>Make it at least 8 characters long</li><li>Don\'t use personal information</li><li>Use a unique password for this account</li></ul>'
        );
        passwordHelpIcon.appendChild(helpIcon);
    }
    
    // Real-time email validation
    emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        const validation = window.validationUtils.validateEmail(email);
        if (!validation.valid) {
            window.validationUtils.showFieldError(emailError, validation.message);
        } else {
            window.validationUtils.hideFieldError(emailError);
        }
    });
    
    // Clear email error on input
    emailInput.addEventListener('input', () => {
        window.validationUtils.hideFieldError(emailError);
        window.validationUtils.hideError(loginError);
    });
    
    // Real-time password validation
    passwordInput.addEventListener('blur', () => {
        const password = passwordInput.value;
        const validation = window.validationUtils.validatePassword(password);
        if (!validation.valid) {
            window.validationUtils.showFieldError(passwordError, validation.message);
        } else {
            window.validationUtils.hideFieldError(passwordError);
        }
    });
    
    // Clear password error on input
    passwordInput.addEventListener('input', () => {
        window.validationUtils.hideFieldError(passwordError);
        window.validationUtils.hideError(loginError);
    });
    
    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Clear previous errors
        window.validationUtils.hideFieldError(emailError);
        window.validationUtils.hideFieldError(passwordError);
        window.validationUtils.hideError(loginError);
        
        // Validate email
        const emailValidation = window.validationUtils.validateEmail(email);
        if (!emailValidation.valid) {
            window.validationUtils.showFieldError(emailError, emailValidation.message);
            emailInput.focus();
            return;
        }
        
        // Validate password
        const passwordValidation = window.validationUtils.validatePassword(password);
        if (!passwordValidation.valid) {
            window.validationUtils.showFieldError(passwordError, passwordValidation.message);
            passwordInput.focus();
            return;
        }
        
        // Disable button and show loading
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        window.validationUtils.showLoading();
        
        try {
            const { signInWithEmailAndPassword } = window.firebaseFunctions;
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Store user email in sessionStorage for next page
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userId', userCredential.user.uid);
            
            // Redirect to re-authentication page
            window.location.href = 'reauth.html';
            
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. ';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage += 'No account found with this email address.';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Incorrect password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage += 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage += 'Too many failed login attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage += 'Network error. Please check your internet connection.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage += 'Invalid email or password.';
                    break;
                default:
                    errorMessage += 'Please check your credentials and try again.';
            }
            
            window.validationUtils.showError(loginError, errorMessage);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Log In';
            window.validationUtils.hideLoading();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLogin);
} else {
    initializeLogin();
}

