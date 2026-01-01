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
 * Setup deletion form validation - disable delete button until confirmation is complete
 * This ensures explicit confirmation as required by Google Play
 */
function setupDeletionFormValidation() {
    const confirmText = document.getElementById('confirm-text');
    const confirmCheckbox = document.getElementById('confirm-checkbox');
    const deleteBtn = document.getElementById('delete-btn');
    
    if (!confirmText || !confirmCheckbox || !deleteBtn) return;
    
    function validateDeletionForm() {
        const textMatches = confirmText.value.trim() === 'DELETE';
        const checkboxChecked = confirmCheckbox.checked;
        
        // Disable delete button until BOTH conditions are met
        deleteBtn.disabled = !(textMatches && checkboxChecked);
    }
    
    // Validate on input/change
    confirmText.addEventListener('input', validateDeletionForm);
    confirmCheckbox.addEventListener('change', validateDeletionForm);
    
    // Initially disable the button
    deleteBtn.disabled = true;
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
        
        // Mark as re-authenticated and record timestamp
        userReauthenticated = true;
        reauthTimestamp = Date.now();
        
        // CRITICAL: After re-authentication, show information screen (deletion section)
        // This ensures user sees what will be deleted before confirming
        hideSection('reauth-section');
        showDeletionSection();
        
        // Scroll to deletion section so user sees the information
        setTimeout(() => {
            document.getElementById('deletion-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
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
 * CRITICAL: This performs REAL deletion, not soft delete
 * Follows strict order: Firestore → Storage → Auth → Logout
 */
async function handleAccountDeletion() {
    if (!currentUser) {
        showError(document.getElementById('deletion-error'), 'User not authenticated. Please log in first.');
        closeModal();
        return;
    }
    
    // CRITICAL: Verify re-authentication is still valid (within last 5 minutes)
    // Firebase requires recent login for account deletion
    if (!userReauthenticated || !reauthTimestamp) {
        showError(document.getElementById('deletion-error'), 'Please re-authenticate before deleting your account.');
        closeModal();
        hideSection('deletion-section');
        showReauthSection();
        return;
    }
    
    const timeSinceReauth = Date.now() - reauthTimestamp;
    const REAUTH_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
    
    if (timeSinceReauth > REAUTH_VALIDITY_MS) {
        showError(document.getElementById('deletion-error'), 'Re-authentication expired. Please re-authenticate again.');
        closeModal();
        userReauthenticated = false;
        reauthTimestamp = null;
        hideSection('deletion-section');
        showReauthSection();
        return;
    }
    
    // Close modal and show loading
    closeModal();
    showLoading();
    
    const userId = currentUser.uid;
    const userEmailForLogging = currentUser.email; // For logging only (no personal data in logs)
    
    try {
        // Log deletion attempt (without personal data)
        logDeletionEvent('deletion_started', userId);
        
        // CRITICAL ORDER: Delete data first, then auth account
        // This ensures if auth deletion fails, we can retry without losing data reference
        
        // Step 1: Delete user data from Firestore
        // This includes: users collection, classes, students, attendance records
        await deleteUserData(userId);
        logDeletionEvent('firestore_deleted', userId);
        
        // Step 2: Delete user files from Firebase Storage
        // This includes: student photos, uploaded files
        await deleteUserFiles(userId);
        logDeletionEvent('storage_deleted', userId);
        
        // Step 3: Delete Firebase Authentication user
        // This is the final step - once this succeeds, user cannot log in
        const { deleteUser } = window.firebaseFunctions;
        await deleteUser(currentUser);
        logDeletionEvent('auth_deleted', userId);
        
        // Step 4: Sign out (user is already deleted, but ensure clean state)
        const { signOut } = window.firebaseFunctions;
        await signOut(auth);
        
        // Step 5: Log successful deletion
        logDeletionEvent('deletion_completed', userId);
        
        // Hide deletion section and show success section
        hideSection('deletion-section');
        showSuccessSection();
        
        // Clear user state
        currentUser = null;
        userEmail = '';
        userReauthenticated = false;
        reauthTimestamp = null;
        
    } catch (error) {
        console.error('Account deletion error:', error);
        hideLoading();
        
        // Log deletion failure
        logDeletionEvent('deletion_failed', userId, error.code);
        
        let errorMessage = 'Account deletion failed. ';
        let requiresReauth = false;
        
        switch (error.code) {
            case 'auth/requires-recent-login':
                // CRITICAL: Handle requires-recent-login error
                // This happens when user hasn't re-authenticated recently enough
                errorMessage += 'Your session has expired. Please re-authenticate and try again.';
                requiresReauth = true;
                userReauthenticated = false;
                reauthTimestamp = null;
                break;
            case 'auth/network-request-failed':
                errorMessage += 'Network error. Please check your internet connection and try again.';
                break;
            case 'auth/too-many-requests':
                errorMessage += 'Too many requests. Please wait a moment and try again.';
                break;
            case 'permission-denied':
                errorMessage += 'Permission denied. Some data may not have been deleted. Please contact support.';
                break;
            default:
                errorMessage += 'An error occurred. Please try again or contact support at teamupasthiti@gmail.com.';
        }
        
        showError(document.getElementById('deletion-error'), errorMessage);
        
        // If requires recent login, show re-authentication section
        if (requiresReauth) {
            hideSection('deletion-section');
            showReauthSection();
        }
    } finally {
        hideLoading();
    }
}

/**
 * Delete user data from Firestore
 * CRITICAL: This performs REAL deletion, not soft delete
 * 
 * Firestore Structure:
 * users/{userId}
 *   └── classes/{classId}
 *       ├── students/{studentId}
 *       └── attendance/{date}
 * 
 * Also deletes feedback collection entries for this user
 */
async function deleteUserData(userId) {
    const { collection, query, where, getDocs, getDoc, deleteDoc, doc } = window.firebaseFunctions;
    const deletePromises = [];
    const errors = [];
    
    try {
        // Step 1: Delete user document (if exists)
        // This is the root document at users/{userId}
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                await deleteDoc(userDocRef);
            }
        } catch (error) {
            // User document might not exist, which is fine
            if (error.code !== 'not-found' && error.code !== 'permission-denied') {
                errors.push(`User document: ${error.message}`);
            }
        }
        
        // Step 2: Delete all classes and their subcollections
        // Structure: users/{userId}/classes/{classId}
        try {
            const classesRef = collection(db, 'users', userId, 'classes');
            const classesSnapshot = await getDocs(classesRef);
            
            for (const classDoc of classesSnapshot.docs) {
                const classId = classDoc.id;
                const classPath = `users/${userId}/classes/${classId}`;
                
                // Delete all students in this class
                // Structure: users/{userId}/classes/{classId}/students/{studentId}
                try {
                    const studentsRef = collection(db, 'users', userId, 'classes', classId, 'students');
                    const studentsSnapshot = await getDocs(studentsRef);
                    
                    studentsSnapshot.forEach((studentDoc) => {
                        deletePromises.push(
                            deleteDoc(studentDoc.ref).catch(err => {
                                errors.push(`Student ${studentDoc.id} in class ${classId}: ${err.message}`);
                            })
                        );
                    });
                } catch (error) {
                    errors.push(`Students in class ${classId}: ${error.message}`);
                }
                
                // Delete all attendance records in this class
                // Structure: users/{userId}/classes/{classId}/attendance/{date}
                try {
                    const attendanceRef = collection(db, 'users', userId, 'classes', classId, 'attendance');
                    const attendanceSnapshot = await getDocs(attendanceRef);
                    
                    attendanceSnapshot.forEach((attendanceDoc) => {
                        deletePromises.push(
                            deleteDoc(attendanceDoc.ref).catch(err => {
                                errors.push(`Attendance ${attendanceDoc.id} in class ${classId}: ${err.message}`);
                            })
                        );
                    });
                } catch (error) {
                    errors.push(`Attendance in class ${classId}: ${error.message}`);
                }
                
                // Delete the class document itself
                deletePromises.push(
                    deleteDoc(classDoc.ref).catch(err => {
                        errors.push(`Class ${classId}: ${err.message}`);
                    })
                );
            }
        } catch (error) {
            errors.push(`Classes query: ${error.message}`);
        }
        
        // Step 3: Delete feedback entries for this user
        // Structure: feedback/{feedbackId} (top-level collection)
        try {
            const feedbackRef = collection(db, 'feedback');
            const feedbackQuery = query(feedbackRef, where('userId', '==', userId));
            const feedbackSnapshot = await getDocs(feedbackQuery);
            
            feedbackSnapshot.forEach((feedbackDoc) => {
                deletePromises.push(
                    deleteDoc(feedbackDoc.ref).catch(err => {
                        errors.push(`Feedback ${feedbackDoc.id}: ${err.message}`);
                    })
                );
            });
        } catch (error) {
            // Feedback deletion is optional - don't fail if it doesn't exist
            console.warn('Error deleting feedback:', error);
        }
        
        // Wait for all deletions to complete
        await Promise.all(deletePromises);
        
        if (errors.length > 0) {
            console.warn('Some Firestore deletions had errors:', errors);
            // Continue with deletion - some data might have been deleted
            // But log errors for support purposes
        }
        
        console.log('User data deleted from Firestore');
        
    } catch (error) {
        console.error('Error deleting user data from Firestore:', error);
        // CRITICAL: Throw error to prevent auth deletion if data deletion fails
        // This ensures we don't delete auth account while data still exists
        throw new Error(`Failed to delete user data: ${error.message}`);
    }
}

/**
 * Delete user files from Firebase Storage
 * CRITICAL: This performs REAL deletion of all user files
 */
async function deleteUserFiles(userId) {
    const { ref, listAll, deleteObject } = window.firebaseFunctions;
    const errors = [];
    
    try {
        // Delete user's storage folder
        const userStorageRef = ref(storage, `users/${userId}`);
        
        try {
            const listResult = await listAll(userStorageRef);
            
            const deletePromises = [];
            
            // Delete all files in root of user folder
            listResult.items.forEach((itemRef) => {
                deletePromises.push(
                    deleteObject(itemRef).catch(err => {
                        errors.push(`File ${itemRef.name}: ${err.message}`);
                    })
                );
            });
            
            // Recursively delete files in subdirectories (e.g., student photos)
            listResult.prefixes.forEach((prefixRef) => {
                deletePromises.push(
                    deleteFolderContents(prefixRef).catch(err => {
                        errors.push(`Folder ${prefixRef.name}: ${err.message}`);
                    })
                );
            });
            
            await Promise.all(deletePromises);
            
            if (errors.length > 0) {
                console.warn('Some Storage deletions had errors:', errors);
            } else {
                console.log('User files deleted from Storage');
            }
        } catch (listError) {
            // Folder might not exist, which is fine
            if (listError.code !== 'storage/object-not-found' && listError.code !== 'storage/unauthorized') {
                console.error('Error listing user files:', listError);
                // Don't throw - continue with deletion even if storage listing fails
            }
        }
        
        // Also try deleting from alternative paths (if your app uses different structure)
        const alternativePaths = [
            `students/${userId}`,
            `photos/${userId}`,
            `uploads/${userId}`
        ];
        
        for (const path of alternativePaths) {
            try {
                const altRef = ref(storage, path);
                const altListResult = await listAll(altRef);
                
                const altDeletePromises = [];
                altListResult.items.forEach((itemRef) => {
                    altDeletePromises.push(deleteObject(itemRef));
                });
                altListResult.prefixes.forEach((prefixRef) => {
                    altDeletePromises.push(deleteFolderContents(prefixRef));
                });
                
                await Promise.all(altDeletePromises);
            } catch (error) {
                // Path might not exist, which is fine
                if (error.code !== 'storage/object-not-found' && error.code !== 'storage/unauthorized') {
                    console.warn(`Error deleting from ${path}:`, error);
                }
            }
        }
        
    } catch (error) {
        console.error('Error deleting user files from Storage:', error);
        // Continue with deletion - storage errors shouldn't block account deletion
        // But log the error for support purposes
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

/**
 * Log deletion event (without personal data)
 * This helps with compliance and debugging
 */
function logDeletionEvent(eventType, userId, errorCode = null) {
    // CRITICAL: Do NOT log personal data (email, name, etc.)
    // Only log event type, timestamp, and error codes
    const logData = {
        event: eventType,
        userId: userId, // User ID is acceptable (not personal data)
        timestamp: new Date().toISOString(),
        ...(errorCode && { errorCode: errorCode })
    };
    
    // Log to console (in production, you might want to send to analytics)
    console.log('Deletion event:', logData);
    
    // Optional: Send to Firebase Analytics or your logging service
    // Example: analytics.logEvent('account_deletion', { event_type: eventType });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
    initializeFirebase();
}

