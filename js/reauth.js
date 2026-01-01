/**
 * Re-Authentication Page - Step 2
 * Handles password re-authentication with validation
 */

let auth;
let currentUser = null;
let userEmail = '';

// Wait for Firebase to initialize
function initializeReauth() {
    if (window.firebaseAuth && window.validationUtils) {
        auth = window.firebaseAuth;
        
        // Check if user is logged in
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                userEmail = user.email;
                
                // Display user email
                const emailDisplay = document.getElementById('user-email-display');
                if (emailDisplay) {
                    emailDisplay.textContent = userEmail;
                }
                
                setupReauthForm();
            } else {
                // User not logged in, redirect to login
                window.location.href = 'login.html';
            }
        });
    } else {
        setTimeout(initializeReauth, 100);
    }
}

function setupReauthForm() {
    const reauthForm = document.getElementById('reauth-form');
    const passwordInput = document.getElementById('reauth-password');
    const passwordError = document.getElementById('password-error');
    const reauthError = document.getElementById('reauth-error');
    const reauthBtn = document.getElementById('reauth-btn');
    const reauthHelpIcon = document.getElementById('reauth-help-icon');
    
    if (!reauthForm || !currentUser) return;
    
    // Add help icon for re-authentication
    if (reauthHelpIcon && window.popupUtils) {
        const helpIcon = window.popupUtils.createHelpIcon(
            'Why Re-authentication?',
            '<p>For your security, we require you to re-enter your password before deleting your account.</p><p><strong>This helps protect you by:</strong></p><ul><li>Preventing unauthorized account deletion</li><li>Ensuring you are the account owner</li><li>Adding an extra layer of security</li><li>Complying with security best practices</li></ul><p>Your re-authentication is valid for 5 minutes. If you take longer, you\'ll need to re-authenticate again.</p>'
        );
        reauthHelpIcon.appendChild(helpIcon);
    }
    
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
        window.validationUtils.hideError(reauthError);
    });
    
    // Form submission
    reauthForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            window.validationUtils.showError(reauthError, 'User not authenticated. Please log in again.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        const password = passwordInput.value;
        
        // Clear previous errors
        window.validationUtils.hideFieldError(passwordError);
        window.validationUtils.hideError(reauthError);
        
        // Validate password
        const passwordValidation = window.validationUtils.validatePassword(password);
        if (!passwordValidation.valid) {
            window.validationUtils.showFieldError(passwordError, passwordValidation.message);
            passwordInput.focus();
            return;
        }
        
        // Disable button and show loading
        reauthBtn.disabled = true;
        reauthBtn.textContent = 'Verifying...';
        window.validationUtils.showLoading();
        
        try {
            const { reauthenticateWithCredential, EmailAuthProvider } = window.firebaseFunctions;
            
            // Create credential for re-authentication
            const credential = EmailAuthProvider.credential(userEmail, password);
            
            // Re-authenticate user
            await reauthenticateWithCredential(currentUser, credential);
            
            // Store re-authentication timestamp
            sessionStorage.setItem('reauthTimestamp', Date.now().toString());
            sessionStorage.setItem('userReauthenticated', 'true');
            
            // Redirect to confirmation page
            window.location.href = 'confirm.html';
            
        } catch (error) {
            console.error('Re-authentication error:', error);
            let errorMessage = 'Re-authentication failed. ';
            
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage += 'Incorrect password. Please try again.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage += 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage += 'Network error. Please check your internet connection.';
                    break;
                case 'auth/user-mismatch':
                    errorMessage += 'The credential provided does not match the user.';
                    break;
                case 'auth/user-not-found':
                    errorMessage += 'User account not found.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage += 'Invalid credential. Please try again.';
                    break;
                default:
                    errorMessage += 'Please check your password and try again.';
            }
            
            window.validationUtils.showError(reauthError, errorMessage);
        } finally {
            reauthBtn.disabled = false;
            reauthBtn.textContent = 'Confirm Password';
            window.validationUtils.hideLoading();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReauth);
} else {
    initializeReauth();
}

