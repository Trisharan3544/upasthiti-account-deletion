/**
 * Upasthiti Account Deletion - JavaScript
 * Handles Firebase authentication, re-authentication, and account deletion
 */

// Wait for Firebase to be initialized
let auth, db, storage;
let currentUser = null;
let userEmail = '';

// Initialize when Firebase is ready
function initializeFirebase() {
    if (window.firebaseAuth && window.firebaseDb && window.firebaseStorage) {
        auth = window.firebaseAuth;
        db = window.firebaseDb;
        storage = window.firebaseStorage;
        
        // Check if user is already logged in
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                userEmail = user.email;
                showReauthSection();
            }
        });
        
        setupEventListeners();
    } else {
        // Retry after a short delay
        setTimeout(initializeFirebase, 100);
    }
}

// Setup event listeners for forms
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Re-authentication form
    const reauthForm = document.getElementById('reauth-form');
    if (reauthForm) {
        reauthForm.addEventListener('submit', handleReauth);
    }
    
    // Deletion form
    const deletionForm = document.getElementById('deletion-form');
    if (deletionForm) {
        deletionForm.addEventListener('submit', handleDeletionRequest);
    }
    
    // Confirmation modal buttons
    const cancelBtn = document.getElementById('cancel-delete');
    const confirmBtn = document.getElementById('confirm-delete');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleAccountDeletion);
    }
    
    // Close modal on outside click
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const loginBtn = document.getElementById('login-btn');
    const errorDiv = document.getElementById('login-error');
    
    // Clear previous errors
    hideError(errorDiv);
    
    // Validate inputs
    if (!email || !password) {
        showError(errorDiv, 'Please enter both email and password.');
        return;
    }
    
    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        const { signInWithEmailAndPassword } = window.firebaseFunctions;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        currentUser = userCredential.user;
        userEmail = email;
        
        // Hide login section and show re-authentication section
        hideSection('login-section');
        showReauthSection();
        
        // Clear form
        document.getElementById('login-form').reset();
        
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
                errorMessage += 'Invalid email address.';
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
            default:
                errorMessage += 'Please check your credentials and try again.';
        }
        
        showError(errorDiv, errorMessage);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log In';
    }
}

/**
 * Handle re-authentication form submission
 */
async function handleReauth(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showError(document.getElementById('reauth-error'), 'Please log in first.');
        return;
    }
    
    const password = document.getElementById('reauth-password').value;
    const reauthBtn = document.getElementById('reauth-btn');
    const errorDiv = document.getElementById('reauth-error');
    
    // Clear previous errors
    hideError(errorDiv);
    
    // Validate input
    if (!password) {
        showError(errorDiv, 'Please enter your password.');
        return;
    }
    
    // Disable button and show loading
    reauthBtn.disabled = true;
    reauthBtn.textContent = 'Verifying...';
    
    try {
        const { reauthenticateWithCredential, EmailAuthProvider } = window.firebaseFunctions;
        
        // Create credential for re-authentication
        const credential = EmailAuthProvider.credential(userEmail, password);
        
        // Re-authenticate user
        await reauthenticateWithCredential(currentUser, credential);
        
        // Hide re-authentication section and show deletion section
        hideSection('reauth-section');
        showDeletionSection();
        
        // Clear form
        document.getElementById('reauth-form').reset();
        
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
            default:
                errorMessage += 'Please check your password and try again.';
        }
        
        showError(errorDiv, errorMessage);
    } finally {
        reauthBtn.disabled = false;
        reauthBtn.textContent = 'Confirm Password';
    }
}

/**
 * Handle deletion form submission (show confirmation modal)
 */
function handleDeletionRequest(e) {
    e.preventDefault();
    
    const confirmText = document.getElementById('confirm-text').value.trim();
    const confirmCheckbox = document.getElementById('confirm-checkbox').checked;
    const errorDiv = document.getElementById('deletion-error');
    
    // Clear previous errors
    hideError(errorDiv);
    
    // Validate confirmation
    if (confirmText !== 'DELETE') {
        showError(errorDiv, 'Please type "DELETE" exactly to confirm.');
        return;
    }
    
    if (!confirmCheckbox) {
        showError(errorDiv, 'Please check the confirmation checkbox.');
        return;
    }
    
    // Show confirmation modal
    showModal();
}

/**
 * Handle actual account deletion (called from modal confirmation)
 */
async function handleAccountDeletion() {
    if (!currentUser) {
        showError(document.getElementById('deletion-error'), 'User not authenticated.');
        return;
    }
    
    // Close modal and show loading
    closeModal();
    showLoading();
    
    try {
        // Step 1: Delete user data from Firestore
        await deleteUserData(currentUser.uid);
        
        // Step 2: Delete user files from Storage
        await deleteUserFiles(currentUser.uid);
        
        // Step 3: Delete Firebase Authentication user
        const { deleteUser } = window.firebaseFunctions;
        await deleteUser(currentUser);
        
        // Step 4: Sign out
        const { signOut } = window.firebaseFunctions;
        await signOut(auth);
        
        // Hide deletion section and show success section
        hideSection('deletion-section');
        showSuccessSection();
        
    } catch (error) {
        console.error('Account deletion error:', error);
        hideLoading();
        
        let errorMessage = 'Account deletion failed. ';
        
        switch (error.code) {
            case 'auth/requires-recent-login':
                errorMessage += 'Please re-authenticate and try again.';
                // Show re-authentication section again
                hideSection('deletion-section');
                showReauthSection();
                break;
            case 'auth/network-request-failed':
                errorMessage += 'Network error. Please check your internet connection and try again.';
                break;
            default:
                errorMessage += 'An error occurred. Please try again or contact support.';
        }
        
        showError(document.getElementById('deletion-error'), errorMessage);
    } finally {
        hideLoading();
    }
}

/**
 * Delete user data from Firestore
 */
async function deleteUserData(userId) {
    try {
        const { collection, query, where, getDocs, deleteDoc, doc } = window.firebaseFunctions;
        
        // Delete user document
        const userDocRef = doc(db, 'users', userId);
        await deleteDoc(userDocRef);
        
        // Delete all classes created by user
        const classesRef = collection(db, 'classes');
        const classesQuery = query(classesRef, where('userId', '==', userId));
        const classesSnapshot = await getDocs(classesQuery);
        
        const deletePromises = [];
        classesSnapshot.forEach((classDoc) => {
            deletePromises.push(deleteDoc(classDoc.ref));
        });
        
        // Delete all students in those classes
        const studentsRef = collection(db, 'students');
        const studentsQuery = query(studentsRef, where('userId', '==', userId));
        const studentsSnapshot = await getDocs(studentsQuery);
        
        studentsSnapshot.forEach((studentDoc) => {
            deletePromises.push(deleteDoc(studentDoc.ref));
        });
        
        // Delete all attendance records
        const attendanceRef = collection(db, 'attendance');
        const attendanceQuery = query(attendanceRef, where('userId', '==', userId));
        const attendanceSnapshot = await getDocs(attendanceQuery);
        
        attendanceSnapshot.forEach((attendanceDoc) => {
            deletePromises.push(deleteDoc(attendanceDoc.ref));
        });
        
        // Wait for all deletions to complete
        await Promise.all(deletePromises);
        
        console.log('User data deleted from Firestore');
        
    } catch (error) {
        console.error('Error deleting user data from Firestore:', error);
        // Continue with deletion even if Firestore deletion fails
        // (user can contact support if needed)
    }
}

/**
 * Delete user files from Firebase Storage
 */
async function deleteUserFiles(userId) {
    try {
        const { ref, listAll, deleteObject } = window.firebaseFunctions;
        
        // Delete user's storage folder
        const userStorageRef = ref(storage, `users/${userId}`);
        
        try {
            const listResult = await listAll(userStorageRef);
            
            const deletePromises = [];
            listResult.items.forEach((itemRef) => {
                deletePromises.push(deleteObject(itemRef));
            });
            
            // Also delete files in subdirectories (e.g., student photos)
            listResult.prefixes.forEach((prefixRef) => {
                deletePromises.push(deleteFolderContents(prefixRef));
            });
            
            await Promise.all(deletePromises);
            console.log('User files deleted from Storage');
        } catch (listError) {
            // Folder might not exist, which is fine
            if (listError.code !== 'storage/object-not-found') {
                console.error('Error listing user files:', listError);
            }
        }
        
    } catch (error) {
        console.error('Error deleting user files from Storage:', error);
        // Continue with deletion even if Storage deletion fails
    }
}

/**
 * Recursively delete folder contents
 */
async function deleteFolderContents(folderRef) {
    try {
        const { listAll, deleteObject } = window.firebaseFunctions;
        const listResult = await listAll(folderRef);
        
        const deletePromises = [];
        listResult.items.forEach((itemRef) => {
            deletePromises.push(deleteObject(itemRef));
        });
        
        listResult.prefixes.forEach((prefixRef) => {
            deletePromises.push(deleteFolderContents(prefixRef));
        });
        
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting folder contents:', error);
    }
}

/**
 * Show/hide sections
 */
function showReauthSection() {
    showSection('reauth-section');
}

function showDeletionSection() {
    showSection('deletion-section');
}

function showSuccessSection() {
    showSection('success-section');
    // Scroll to success message
    setTimeout(() => {
        document.getElementById('success-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
}

function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'none';
    }
}

/**
 * Error handling
 */
function showError(errorDiv, message) {
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function hideError(errorDiv) {
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
}

/**
 * Modal functions
 */
function showModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/**
 * Loading overlay functions
 */
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
    initializeFirebase();
}

