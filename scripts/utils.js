// Utility Functions for School Management System

// Authentication check for protected pages
function requireAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const userRole = localStorage.getItem('userRole');
    
    if (!currentUser || !userRole) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Get current user data
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Get current school data
function getCurrentSchool() {
    const schoolId = localStorage.getItem('currentSchool');
    if (!schoolId || schoolId === 'null') return null;
    
    const schools = getDemoData('Schools');
    return schools ? schools[schoolId] : null;
}

// Get current user role
function getCurrentRole() {
    return localStorage.getItem('userRole');
}

// Format phone number
function formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})(\d{2})$/);
    if (match) {
        return `+${match[1]}-${match[2]}${match[3]}${match[4]}`;
    }
    return phone;
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Calculate age from date of birth
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Generate student roll number
function generateRollNumber(className, section, count) {
    const classNum = className.toString().padStart(2, '0');
    const sectionCode = section.charCodeAt(0) - 64; // A=1, B=2, etc.
    const studentNum = count.toString().padStart(2, '0');
    return `${classNum}${sectionCode}${studentNum}`;
}

// Calculate attendance percentage
function calculateAttendancePercentage(presentDays, totalDays) {
    if (totalDays === 0) return 0;
    return Math.round((presentDays / totalDays) * 100);
}

// Get days between two dates
function getDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format date for display
function formatDisplayDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Get academic year
function getAcademicYear(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Academic year starts in April (month 3, 0-indexed)
    if (month >= 3) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}

// Get current month name
function getCurrentMonthName() {
    return new Date().toLocaleDateString('en-IN', { month: 'long' });
}

// Debounce function for search
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

// Sort array of objects by property
function sortByProperty(array, property, direction = 'asc') {
    return array.sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        
        if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// Filter array by search term
function filterBySearch(array, searchTerm, properties) {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
        return properties.some(prop => {
            const value = item[prop];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || !data.length) {
        showNotification('No data to export', 'error');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
}

// Print content
function printContent(elementId, title = 'Print') {
    const element = document.getElementById(elementId);
    if (!element) {
        showNotification('Element not found for printing', 'error');
        return;
    }
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
            <head>
                <title>${title}</title>
                <link rel="stylesheet" href="styles/style.css">
                <style>
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Capitalize first letter
function capitalize(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Generate random color
function generateRandomColor() {
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Get initials from name
function getInitials(name) {
    if (!name) return '';
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
}

// Validate required fields
function validateForm(formElement, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
        const element = formElement.querySelector(`[name="${field}"]`);
        if (!element || !element.value.trim()) {
            errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        }
    });
    
    return errors;
}

// Show confirmation dialog
function showConfirmDialog(message, onConfirm, onCancel = null) {
    const dialog = document.createElement('div');
    dialog.className = 'modal';
    dialog.style.display = 'block';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 400px; margin-top: 20%;">
            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Confirm Action</h3>
            <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="cancelConfirm()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmAction()">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event handlers
    window.confirmAction = () => {
        dialog.remove();
        if (onConfirm) onConfirm();
        // Clean up global functions
        delete window.confirmAction;
        delete window.cancelConfirm;
    };
    
    window.cancelConfirm = () => {
        dialog.remove();
        if (onCancel) onCancel();
        // Clean up global functions
        delete window.confirmAction;
        delete window.cancelConfirm;
    };
    
    // Close on outside click
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            window.cancelConfirm();
        }
    });
}

// File upload handler
function handleFileUpload(inputElement, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
        const file = inputElement.files[0];
        
        if (!file) {
            reject(new Error('No file selected'));
            return;
        }
        
        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            reject(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`));
            return;
        }
        
        // Check file size
        if (file.size > maxSize) {
            reject(new Error(`File size too large. Max size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsDataURL(file);
    });
}

// Create breadcrumb navigation
function createBreadcrumb(items) {
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumb';
    breadcrumb.innerHTML = items.map((item, index) => {
        const isLast = index === items.length - 1;
        return `
            <span class="breadcrumb-item ${isLast ? 'active' : ''}">
                ${isLast ? item.text : `<a href="${item.href}">${item.text}</a>`}
                ${!isLast ? '<i class="fas fa-chevron-right"></i>' : ''}
            </span>
        `;
    }).join('');
    
    return breadcrumb;
}

// Auto-save form data
function setupAutoSave(formElement, key, interval = 30000) {
    const saveData = () => {
        const formData = new FormData(formElement);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem(`autosave_${key}`, JSON.stringify(data));
    };
    
    const loadData = () => {
        const saved = localStorage.getItem(`autosave_${key}`);
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                const element = formElement.querySelector(`[name="${key}"]`);
                if (element) {
                    element.value = data[key];
                }
            });
        }
    };
    
    // Load saved data on initialization
    loadData();
    
    // Save data on form change
    formElement.addEventListener('change', saveData);
    formElement.addEventListener('input', debounce(saveData, 5000));
    
    // Auto-save at regular intervals
    const intervalId = setInterval(saveData, interval);
    
    // Clear auto-save on form submit
    formElement.addEventListener('submit', () => {
        localStorage.removeItem(`autosave_${key}`);
        clearInterval(intervalId);
    });
    
    return {
        save: saveData,
        load: loadData,
        clear: () => {
            localStorage.removeItem(`autosave_${key}`);
            clearInterval(intervalId);
        }
    };
}

// Export all utility functions to global scope
Object.assign(window, {
    requireAuth,
    getCurrentUser,
    getCurrentSchool,
    getCurrentRole,
    formatPhoneNumber,
    isValidEmail,
    isValidPhone,
    calculateAge,
    generateRollNumber,
    calculateAttendancePercentage,
    getDaysBetween,
    formatDisplayDate,
    getAcademicYear,
    getCurrentMonthName,
    debounce,
    sortByProperty,
    filterBySearch,
    exportToCSV,
    printContent,
    capitalize,
    generateRandomColor,
    getInitials,
    validateForm,
    showConfirmDialog,
    handleFileUpload,
    createBreadcrumb,
    setupAutoSave
});