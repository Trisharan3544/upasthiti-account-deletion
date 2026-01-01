/**
 * Confirmation Page - Step 3
 * Handles account deletion confirmation and execution
 */

let auth, db, storage;
let currentUser = null;

// Wait for Firebase to initialize
function initializeConfirm() {
    if (window.firebaseAuth && window.firebaseDb && window.firebaseStorage && window.validationUtils) {
        auth = window.firebaseAuth;
        db = window.firebaseDb;
        storage = window.firebaseStorage;
        
        // Check if user is logged in and re-authenticated
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                
                // Verify re-authentication
                const reauthTimestamp = parseInt(sessionStorage.getItem('reauthTimestamp') || '0');
                const userReauthenticated = sessionStorage.getItem('userReauthenticated') === 'true';
                const REAUTH_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
                
                if (!userReauthenticated || !reauthTimestamp || (Date.now() - reauthTimestamp > REAUTH_VALIDITY_MS)) {
                    // Re-authentication expired or missing, redirect back
                    window.location.href = 'reauth.html';
                    return;
                }
                
                setupDeletionForm();
            } else {
                // User not logged in, redirect to login
                window.location.href = 'login.html';
            }
        });
    } else {
        setTimeout(initializeConfirm, 100);
    }
}

function setupDeletionForm() {
    const deletionForm = document.getElementById('deletion-form');
    const confirmText = document.getElementById('confirm-text');
    const confirmCheckbox = document.getElementById('confirm-checkbox');
    const confirmTextError = document.getElementById('confirm-text-error');
    const checkboxError = document.getElementById('checkbox-error');
    const deletionError = document.getElementById('deletion-error');
    const deleteBtn = document.getElementById('delete-btn');
    const cancelBtn = document.getElementById('cancel-delete');
    const confirmBtn = document.getElementById('confirm-delete');
    const deletionInfoIcon = document.getElementById('deletion-info-icon');
    
    if (!deletionForm) return;
    
    // Add help icon for deletion information
    if (deletionInfoIcon && window.popupUtils) {
        const helpIcon = window.popupUtils.createHelpIcon(
            'What Gets Deleted?',
            '<p>When you delete your account, the following data will be <strong>permanently removed</strong>:</p><ul><li><strong>Account Information:</strong> Email, name, phone number, profile</li><li><strong>Classes & Departments:</strong> All classes and organizational data</li><li><strong>Student Information:</strong> All student records, photos, contact details</li><li><strong>Attendance Records:</strong> All attendance data and history</li><li><strong>Uploaded Files:</strong> All student photos and files</li><li><strong>Settings:</strong> All app settings and preferences</li></ul><p><strong>Important:</strong> This deletion is immediate and irreversible. No data is retained after deletion.</p>'
        );
        deletionInfoIcon.appendChild(helpIcon);
    }
    
    // Real-time validation for DELETE text
    confirmText.addEventListener('input', () => {
        const text = confirmText.value.trim();
        if (text === 'DELETE') {
            window.validationUtils.hideFieldError(confirmTextError);
        } else if (text.length > 0) {
            window.validationUtils.showFieldError(confirmTextError, 'You must type "DELETE" exactly (case-sensitive)');
        } else {
            window.validationUtils.hideFieldError(confirmTextError);
        }
        validateDeletionForm();
    });
    
    // Checkbox change
    confirmCheckbox.addEventListener('change', () => {
        window.validationUtils.hideFieldError(checkboxError);
        validateDeletionForm();
    });
    
    // Validate form and enable/disable delete button
    function validateDeletionForm() {
        const textMatches = confirmText.value.trim() === 'DELETE';
        const checkboxChecked = confirmCheckbox.checked;
        
        deleteBtn.disabled = !(textMatches && checkboxChecked);
    }
    
    // Form submission
    deletionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const text = confirmText.value.trim();
        const checkboxChecked = confirmCheckbox.checked;
        
        // Clear previous errors
        window.validationUtils.hideFieldError(confirmTextError);
        window.validationUtils.hideFieldError(checkboxError);
        window.validationUtils.hideError(deletionError);
        
        // Validate
        if (text !== 'DELETE') {
            window.validationUtils.showFieldError(confirmTextError, 'You must type "DELETE" exactly (case-sensitive)');
            confirmText.focus();
            return;
        }
        
        if (!checkboxChecked) {
            window.validationUtils.showFieldError(checkboxError, 'You must check the confirmation checkbox');
            confirmCheckbox.focus();
            return;
        }
        
        // Show confirmation modal
        showModal();
    });
    
    // Modal buttons
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
 * Handle actual account deletion
 */
async function handleAccountDeletion() {
    if (!currentUser) {
        window.validationUtils.showError(document.getElementById('deletion-error'), 'User not authenticated.');
        closeModal();
        window.location.href = 'login.html';
        return;
    }
    
    // Verify re-authentication is still valid
    const reauthTimestamp = parseInt(sessionStorage.getItem('reauthTimestamp') || '0');
    const REAUTH_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
    
    if (!reauthTimestamp || (Date.now() - reauthTimestamp > REAUTH_VALIDITY_MS)) {
        window.validationUtils.showError(document.getElementById('deletion-error'), 'Re-authentication expired. Please re-authenticate again.');
        closeModal();
        window.location.href = 'reauth.html';
        return;
    }
    
    // Close modal and show loading
    closeModal();
    window.validationUtils.showLoading();
    
    const userId = currentUser.uid;
    
    try {
        // Log deletion attempt
        logDeletionEvent('deletion_started', userId);
        
        // Step 1: Delete user data from Firestore
        await deleteUserData(userId);
        logDeletionEvent('firestore_deleted', userId);
        
        // Step 2: Delete user files from Storage
        await deleteUserFiles(userId);
        logDeletionEvent('storage_deleted', userId);
        
        // Step 3: Delete Firebase Authentication user
        const { deleteUser } = window.firebaseFunctions;
        await deleteUser(currentUser);
        logDeletionEvent('auth_deleted', userId);
        
        // Step 4: Sign out
        const { signOut } = window.firebaseFunctions;
        await signOut(auth);
        
        // Step 5: Log successful deletion
        logDeletionEvent('deletion_completed', userId);
        
        // Clear session storage
        sessionStorage.clear();
        
        // Redirect to success page
        window.location.href = 'success.html';
        
    } catch (error) {
        console.error('Account deletion error:', error);
        window.validationUtils.hideLoading();
        
        logDeletionEvent('deletion_failed', userId, error.code);
        
        let errorMessage = 'Account deletion failed. ';
        let requiresReauth = false;
        
        switch (error.code) {
            case 'auth/requires-recent-login':
                errorMessage += 'Your session has expired. Please re-authenticate and try again.';
                requiresReauth = true;
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
        
        window.validationUtils.showError(document.getElementById('deletion-error'), errorMessage);
        
        if (requiresReauth) {
            setTimeout(() => {
                window.location.href = 'reauth.html';
            }, 3000);
        }
    }
}

/**
 * Delete user data from Firestore
 */
async function deleteUserData(userId) {
    const { collection, query, where, getDocs, getDoc, deleteDoc, doc } = window.firebaseFunctions;
    const deletePromises = [];
    const errors = [];
    
    try {
        // Delete user document
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                await deleteDoc(userDocRef);
            }
        } catch (error) {
            if (error.code !== 'not-found' && error.code !== 'permission-denied') {
                errors.push(`User document: ${error.message}`);
            }
        }
        
        // Delete all classes and their subcollections
        try {
            const classesRef = collection(db, 'users', userId, 'classes');
            const classesSnapshot = await getDocs(classesRef);
            
            for (const classDoc of classesSnapshot.docs) {
                const classId = classDoc.id;
                
                // Delete students
                try {
                    const studentsRef = collection(db, 'users', userId, 'classes', classId, 'students');
                    const studentsSnapshot = await getDocs(studentsRef);
                    studentsSnapshot.forEach((studentDoc) => {
                        deletePromises.push(deleteDoc(studentDoc.ref).catch(err => {
                            errors.push(`Student ${studentDoc.id}: ${err.message}`);
                        }));
                    });
                } catch (error) {
                    errors.push(`Students in class ${classId}: ${error.message}`);
                }
                
                // Delete attendance
                try {
                    const attendanceRef = collection(db, 'users', userId, 'classes', classId, 'attendance');
                    const attendanceSnapshot = await getDocs(attendanceRef);
                    attendanceSnapshot.forEach((attendanceDoc) => {
                        deletePromises.push(deleteDoc(attendanceDoc.ref).catch(err => {
                            errors.push(`Attendance ${attendanceDoc.id}: ${err.message}`);
                        }));
                    });
                } catch (error) {
                    errors.push(`Attendance in class ${classId}: ${error.message}`);
                }
                
                // Delete class
                deletePromises.push(deleteDoc(classDoc.ref).catch(err => {
                    errors.push(`Class ${classId}: ${err.message}`);
                }));
            }
        } catch (error) {
            errors.push(`Classes query: ${error.message}`);
        }
        
        // Delete feedback
        try {
            const feedbackRef = collection(db, 'feedback');
            const feedbackQuery = query(feedbackRef, where('userId', '==', userId));
            const feedbackSnapshot = await getDocs(feedbackQuery);
            feedbackSnapshot.forEach((feedbackDoc) => {
                deletePromises.push(deleteDoc(feedbackDoc.ref).catch(err => {
                    errors.push(`Feedback ${feedbackDoc.id}: ${err.message}`);
                }));
            });
        } catch (error) {
            // Optional
        }
        
        await Promise.all(deletePromises);
        if (errors.length > 0) {
            console.warn('Some Firestore deletions had errors:', errors);
        }
    } catch (error) {
        console.error('Error deleting user data:', error);
        throw new Error(`Failed to delete user data: ${error.message}`);
    }
}

/**
 * Delete user files from Storage
 */
async function deleteUserFiles(userId) {
    const { ref, listAll, deleteObject } = window.firebaseFunctions;
    
    try {
        const userStorageRef = ref(storage, `users/${userId}`);
        try {
            const listResult = await listAll(userStorageRef);
            const deletePromises = [];
            listResult.items.forEach((itemRef) => {
                deletePromises.push(deleteObject(itemRef));
            });
            listResult.prefixes.forEach((prefixRef) => {
                deletePromises.push(deleteFolderContents(prefixRef));
            });
            await Promise.all(deletePromises);
        } catch (listError) {
            if (listError.code !== 'storage/object-not-found' && listError.code !== 'storage/unauthorized') {
                console.warn('Error listing user files:', listError);
            }
        }
    } catch (error) {
        console.error('Error deleting user files:', error);
    }
}

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
 * Log deletion event (without personal data)
 */
function logDeletionEvent(eventType, userId, errorCode = null) {
    const logData = {
        event: eventType,
        userId: userId,
        timestamp: new Date().toISOString(),
        ...(errorCode && { errorCode: errorCode })
    };
    console.log('Deletion event:', logData);
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConfirm);
} else {
    initializeConfirm();
}

