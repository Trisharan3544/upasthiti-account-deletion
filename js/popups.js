/**
 * Popup and Modal Utilities
 * Shared popup functions for all pages
 */

/**
 * Show information popup
 * @param {string} title - Popup title
 * @param {string} content - Popup content (HTML supported)
 * @param {string} type - Popup type: 'info', 'warning', 'success', 'error'
 */
function showInfoPopup(title, content, type = 'info') {
    // Remove existing popup if any
    const existingPopup = document.getElementById('info-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'info-popup';
    popup.className = `info-popup info-popup-${type}`;
    
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h3>${title}</h3>
                <button class="popup-close" onclick="closeInfoPopup()" aria-label="Close">×</button>
            </div>
            <div class="popup-body">
                ${content}
            </div>
            <div class="popup-footer">
                <button class="btn btn-primary" onclick="closeInfoPopup()">Got it</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Close on background click
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closeInfoPopup();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeInfoPopup();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

/**
 * Close information popup
 */
function closeInfoPopup() {
    const popup = document.getElementById('info-popup');
    if (popup) {
        popup.remove();
    }
}

/**
 * Show tooltip
 * @param {HTMLElement} element - Element to show tooltip for
 * @param {string} text - Tooltip text
 * @param {string} position - Tooltip position: 'top', 'bottom', 'left', 'right'
 */
function showTooltip(element, text, position = 'top') {
    // Remove existing tooltip
    const existingTooltip = document.getElementById('tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    switch (position) {
        case 'top':
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltipRect.width / 2) + 'px';
            tooltip.style.top = rect.top - tooltipRect.height - 8 + 'px';
            break;
        case 'bottom':
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltipRect.width / 2) + 'px';
            tooltip.style.top = rect.bottom + 8 + 'px';
            break;
        case 'left':
            tooltip.style.left = rect.left - tooltipRect.width - 8 + 'px';
            tooltip.style.top = rect.top + (rect.height / 2) - (tooltipRect.height / 2) + 'px';
            break;
        case 'right':
            tooltip.style.left = rect.right + 8 + 'px';
            tooltip.style.top = rect.top + (rect.height / 2) - (tooltipRect.height / 2) + 'px';
            break;
    }
    
    // Remove tooltip after 3 seconds or on mouse leave
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.remove();
        }
    }, 3000);
    
    element.addEventListener('mouseleave', () => {
        if (tooltip.parentNode) {
            tooltip.remove();
        }
    }, { once: true });
}

/**
 * Show help icon with popup
 * @param {string} title - Popup title
 * @param {string} content - Popup content
 * @returns {HTMLElement} - Help icon element
 */
function createHelpIcon(title, content) {
    const icon = document.createElement('span');
    icon.className = 'help-icon';
    icon.innerHTML = 'ℹ️';
    icon.setAttribute('role', 'button');
    icon.setAttribute('aria-label', 'Show help information');
    icon.setAttribute('tabindex', '0');
    
    icon.addEventListener('click', () => {
        showInfoPopup(title, content, 'info');
    });
    
    icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showInfoPopup(title, content, 'info');
        }
    });
    
    return icon;
}

/**
 * Show confirmation modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 */
function showConfirmationModal(title, message, onConfirm, onCancel) {
    // Remove existing modal if any
    const existingModal = document.getElementById('confirmation-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'confirmation-modal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
                <button class="btn btn-primary" id="modal-confirm">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Event listeners
    document.getElementById('modal-confirm').addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = 'auto';
        if (onConfirm) onConfirm();
    });
    
    document.getElementById('modal-cancel').addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = 'auto';
        if (onCancel) onCancel();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
            if (onCancel) onCancel();
        }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', escapeHandler);
            if (onCancel) onCancel();
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Make functions globally available
window.popupUtils = {
    showInfoPopup,
    closeInfoPopup,
    showTooltip,
    createHelpIcon,
    showConfirmationModal
};

