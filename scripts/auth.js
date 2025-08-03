// Enhanced Authentication System for National School Manager
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.demoMode = window.DEMO_MODE || true;
        this.initializeEventListeners();
        this.checkAuthState();
    }

    initializeEventListeners() {
        // Form submissions
        const authForm = document.getElementById('authForm');
        const schoolRegisterForm = document.getElementById('schoolRegisterForm');
        
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (schoolRegisterForm) {
            schoolRegisterForm.addEventListener('submit', (e) => this.handleSchoolRegistration(e));
        }

        // Form toggles
        this.setupFormToggles();
        
        // Plan selection
        this.setupPlanSelection();
        
        // Real-time form validation
        this.setupFormValidation();
        
        // Enhanced UI interactions
        this.setupUIEnhancements();
    }

    setupFormToggles() {
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.animateFormTransition(loginForm, registerForm);
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.animateFormTransition(registerForm, loginForm);
            });
        }
    }

    animateFormTransition(hideForm, showForm) {
        hideForm.style.transform = 'translateX(-20px)';
        hideForm.style.opacity = '0';
        
        setTimeout(() => {
            hideForm.style.display = 'none';
            showForm.style.display = 'block';
            showForm.style.transform = 'translateX(20px)';
            showForm.style.opacity = '0';
            
            setTimeout(() => {
                showForm.style.transform = 'translateX(0)';
                showForm.style.opacity = '1';
                showForm.style.transition = 'all 0.3s ease';
            }, 50);
        }, 300);
    }

    setupPlanSelection() {
        const plans = document.querySelectorAll('.plan');
        plans.forEach(plan => {
            plan.addEventListener('click', () => {
                // Remove selection from all plans
                plans.forEach(p => {
                    p.classList.remove('selected');
                    p.style.transform = 'translateY(0)';
                });
                
                // Add selection to clicked plan
                plan.classList.add('selected');
                plan.style.transform = 'translateY(-5px)';
                
                // Add subtle pulse animation
                plan.style.animation = 'pulse 0.3s ease-out';
                setTimeout(() => {
                    plan.style.animation = '';
                }, 300);
            });

            // Add hover effects
            plan.addEventListener('mouseenter', () => {
                if (!plan.classList.contains('selected')) {
                    plan.style.transform = 'translateY(-3px)';
                }
            });

            plan.addEventListener('mouseleave', () => {
                if (!plan.classList.contains('selected')) {
                    plan.style.transform = 'translateY(0)';
                }
            });
        });
    }

    setupFormValidation() {
        // Real-time email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
            input.addEventListener('input', () => this.clearValidationError(input));
        });

        // Password strength indicator
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('input', () => this.checkPasswordStrength(input));
        });

        // Phone number formatting
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', () => this.formatPhoneNumber(input));
        });

        // School name validation
        const schoolNameInput = document.getElementById('schoolName');
        if (schoolNameInput) {
            schoolNameInput.addEventListener('blur', () => this.validateSchoolName(schoolNameInput));
        }
    }

    setupUIEnhancements() {
        // Add floating labels effect
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            const input = group.querySelector('input, select, textarea');
            if (input) {
                input.addEventListener('focus', () => {
                    group.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        group.classList.remove('focused');
                    }
                });
                
                // Check if input has value on page load
                if (input.value) {
                    group.classList.add('focused');
                }
            }
        });

        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', this.createRippleEffect);
        });
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(input.value);
        
        if (!isValid && input.value) {
            this.showFieldError(input, 'Please enter a valid email address');
            return false;
        }
        
        this.clearFieldError(input);
        return true;
    }

    checkPasswordStrength(input) {
        const password = input.value;
        const strength = this.calculatePasswordStrength(password);
        
        // Remove existing strength indicator
        const existingIndicator = input.parentNode.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (password.length > 0) {
            const indicator = document.createElement('div');
            indicator.className = 'password-strength';
            indicator.innerHTML = `
                <div class="strength-bar">
                    <div class="strength-fill strength-${strength.level}" style="width: ${strength.percentage}%"></div>
                </div>
                <span class="strength-text">${strength.text}</span>
            `;
            
            input.parentNode.appendChild(indicator);
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        const levels = [
            { level: 'weak', text: 'Weak', percentage: 20 },
            { level: 'fair', text: 'Fair', percentage: 40 },
            { level: 'good', text: 'Good', percentage: 60 },
            { level: 'strong', text: 'Strong', percentage: 80 },
            { level: 'excellent', text: 'Excellent', percentage: 100 }
        ];
        
        return levels[Math.min(score, 4)];
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('91')) {
            value = value.substring(2);
        }
        
        if (value.length <= 10) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            input.value = '+91-' + value;
        }
    }

    validateSchoolName(input) {
        const name = input.value.trim();
        
        if (name.length < 3) {
            this.showFieldError(input, 'School name must be at least 3 characters long');
            return false;
        }
        
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            this.showFieldError(input, 'School name should only contain letters and spaces');
            return false;
        }
        
        this.clearFieldError(input);
        return true;
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--danger-color);
            font-size: 0.85rem;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
            animation: slideInError 0.3s ease-out;
        `;
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-circle';
        errorDiv.prepend(icon);
        
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = 'var(--danger-color)';
    }

    clearFieldError(input) {
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }

    clearValidationError(input) {
        this.clearFieldError(input);
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.toLowerCase().trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('userRole').value;

        // Validate form
        if (!this.validateLoginForm(email, password, role)) {
            return;
        }

        this.showLoading(true, 'Authenticating...');
        
        try {
            if (this.demoMode) {
                await this.demoLogin(email, password, role);
            } else {
                await this.firebaseLogin(email, password, role);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    validateLoginForm(email, password, role) {
        let isValid = true;
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const roleSelect = document.getElementById('userRole');
        
        if (!email) {
            this.showFieldError(emailInput, 'Email is required');
            isValid = false;
        } else if (!this.validateEmail(emailInput)) {
            isValid = false;
        }
        
        if (!password) {
            this.showFieldError(passwordInput, 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showFieldError(passwordInput, 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (!role) {
            this.showFieldError(roleSelect, 'Please select your role');
            isValid = false;
        }
        
        return isValid;
    }

    async demoLogin(email, password, role) {
        // Simulate network delay
        await this.delay(1500);
        
        const demoData = window.getDemoData();
        const user = demoData.users[email];
        
        if (!user) {
            throw new Error('User not found. Please check your email address.');
        }
        
        if (user.password !== password) {
            throw new Error('Incorrect password. Please try again.');
        }
        
        if (user.role !== role) {
            throw new Error(`Invalid role selected. This user is registered as ${user.role}.`);
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        this.showSuccess('Login successful! Redirecting to dashboard...');
        
        // Add success animation
        this.addSuccessAnimation();
        
        setTimeout(() => {
            this.redirectToDashboard(user.role);
        }, 1500);
    }

    async firebaseLogin(email, password, role) {
        // Firebase authentication logic would go here
        throw new Error('Firebase authentication not implemented in demo mode');
    }

    async handleSchoolRegistration(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const selectedPlan = document.querySelector('.plan.selected');
        
        if (!this.validateRegistrationForm(formData, selectedPlan)) {
            return;
        }

        const schoolData = {
            name: formData.get('schoolName') || document.getElementById('schoolName').value,
            adminEmail: formData.get('adminEmail') || document.getElementById('adminEmail').value,
            password: formData.get('adminPassword') || document.getElementById('adminPassword').value,
            phone: formData.get('schoolPhone') || document.getElementById('schoolPhone').value,
            address: formData.get('schoolAddress') || document.getElementById('schoolAddress').value,
            plan: selectedPlan.dataset.plan,
            amount: selectedPlan.dataset.plan === 'monthly' ? 200 : 11500
        };

        this.showLoading(true, 'Processing registration and payment...');
        
        try {
            if (this.demoMode) {
                await this.demoRegisterSchool(schoolData);
            } else {
                await this.firebaseRegisterSchool(schoolData);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    validateRegistrationForm(formData, selectedPlan) {
        let isValid = true;
        
        const schoolName = document.getElementById('schoolName');
        const adminEmail = document.getElementById('adminEmail');
        const adminPassword = document.getElementById('adminPassword');
        const schoolPhone = document.getElementById('schoolPhone');
        const schoolAddress = document.getElementById('schoolAddress');
        
        // Validate school name
        if (!this.validateSchoolName(schoolName)) {
            isValid = false;
        }
        
        // Validate admin email
        if (!this.validateEmail(adminEmail)) {
            isValid = false;
        }
        
        // Validate password
        if (!adminPassword.value || adminPassword.value.length < 6) {
            this.showFieldError(adminPassword, 'Password must be at least 6 characters');
            isValid = false;
        }
        
        // Validate phone
        if (!schoolPhone.value) {
            this.showFieldError(schoolPhone, 'Phone number is required');
            isValid = false;
        }
        
        // Validate address
        if (!schoolAddress.value || schoolAddress.value.length < 10) {
            this.showFieldError(schoolAddress, 'Please enter a complete address (minimum 10 characters)');
            isValid = false;
        }
        
        // Validate plan selection
        if (!selectedPlan) {
            this.showError('Please select a subscription plan');
            isValid = false;
        }
        
        return isValid;
    }

    async demoRegisterSchool(schoolData) {
        // Simulate payment processing
        await this.delay(2000);
        
        // Simulate payment gateway
        const paymentResult = await this.processPayment(schoolData);
        
        if (!paymentResult.success) {
            throw new Error('Payment failed. Please try again.');
        }
        
        // Register school in demo data
        const demoData = window.getDemoData();
        const schoolId = 'school_' + Date.now().toString().substr(-6);
        
        const expiryDate = schoolData.plan === 'monthly' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const actualAmount = schoolData.plan === 'monthly' ? 200 : schoolData.amount;

        // Add school
        demoData.schools[schoolId] = {
            name: schoolData.name,
            adminEmail: schoolData.adminEmail,
            phone: schoolData.phone,
            address: schoolData.address,
            subscription: {
                plan: schoolData.plan,
                status: 'active',
                expiryDate: expiryDate,
                amount: actualAmount,
                regularAmount: schoolData.plan === 'monthly' ? 1000 : schoolData.amount,
                isIntroductory: schoolData.plan === 'monthly',
                transactionId: paymentResult.transactionId
            },
            students: {},
            teachers: {},
            attendance: {},
            exams: {},
            createdAt: new Date().toISOString()
        };

        // Add admin user
        demoData.users[schoolData.adminEmail] = {
            email: schoolData.adminEmail,
            password: schoolData.password,
            role: 'school_admin',
            schoolId: schoolId,
            name: schoolData.name + ' Admin'
        };

        window.setDemoData(demoData);
        
        this.showSuccess('🎉 School registered successfully! Payment confirmed. You can now login with your credentials.');
        
        // Add celebration animation
        this.addCelebrationAnimation();
        
        setTimeout(() => {
            // Switch to login form
            const registerForm = document.getElementById('registerForm');
            const loginForm = document.getElementById('loginForm');
            this.animateFormTransition(registerForm, loginForm);
            
            // Pre-fill email
            document.getElementById('email').value = schoolData.adminEmail;
            document.getElementById('userRole').value = 'school_admin';
        }, 3000);
    }

    async processPayment(schoolData) {
        // Simulate payment gateway API call
        await this.delay(1500);
        
        // Simulate 95% success rate
        if (Math.random() < 0.95) {
            return {
                success: true,
                transactionId: 'TXN' + Date.now(),
                amount: schoolData.amount,
                method: 'UPI/Card',
                timestamp: new Date().toISOString()
            };
        } else {
            return {
                success: false,
                error: 'Payment gateway timeout. Please try again.'
            };
        }
    }

    addSuccessAnimation() {
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'successPulse 0.6s ease-out';
        
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 600);
    }

    addCelebrationAnimation() {
        // Create confetti effect
        this.createConfetti();
        
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'celebrationBounce 1s ease-out';
        
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 1000);
    }

    createConfetti() {
        const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        const confettiContainer = document.createElement('div');
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        `;
        
        document.body.appendChild(confettiContainer);
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            `;
            
            confettiContainer.appendChild(confetti);
        }
        
        setTimeout(() => {
            confettiContainer.remove();
        }, 5000);
    }

    redirectToDashboard(role) {
        // Hide all sections
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show appropriate dashboard
        switch (role) {
            case 'super_admin':
                document.getElementById('super-admin-section').classList.add('active');
                if (window.superAdminDashboard) {
                    window.superAdminDashboard.loadData();
                }
                break;
            case 'school_admin':
                document.getElementById('school-admin-section').classList.add('active');
                if (this.currentUser.schoolId) {
                    const demoData = window.getDemoData();
                    const school = demoData.schools[this.currentUser.schoolId];
                    if (school) {
                        document.getElementById('schoolName').textContent = school.name;
                    }
                }
                if (window.schoolDashboard) {
                    window.schoolDashboard.loadSchoolData();
                }
                break;
            case 'teacher':
                this.showToast('Teacher dashboard coming soon! 👨‍🏫', 'info');
                break;
            case 'student':
                this.showToast('Student dashboard coming soon! 🎓', 'info');
                break;
            default:
                this.showError('Unknown user role');
        }
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.redirectToDashboard(this.currentUser.role);
            } catch (error) {
                localStorage.removeItem('currentUser');
                this.showError('Session expired. Please login again.');
            }
        }
    }

    isSubscriptionActive(schoolId) {
        if (!schoolId) return false;
        
        const demoData = window.getDemoData();
        const school = demoData.schools[schoolId];
        
        if (!school || !school.subscription) return false;
        
        const expiryDate = new Date(school.subscription.expiryDate);
        const today = new Date();
        
        return school.subscription.status === 'active' && expiryDate > today;
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        
        // Hide all sections
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show login section
        document.getElementById('login-section').classList.add('active');
        
        // Clear form fields
        document.getElementById('authForm').reset();
        
        this.showToast('Logged out successfully! 👋', 'success');
    }

    // UI Feedback Methods
    showLoading(show, message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageEl = overlay.querySelector('p');
        
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        overlay.classList.toggle('show', show);
        
        if (show) {
            overlay.style.animation = 'fadeIn 0.3s ease-out';
        }
    }

    showError(message) {
        this.showToast('❌ ' + message, 'error');
        this.shakeLoginCard();
    }

    showSuccess(message) {
        this.showToast('✅ ' + message, 'success');
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4'
        };

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas ${icons[type]}" style="font-size: 1.2rem; color: ${colors[type]};"></i>
                <span style="flex: 1;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--gray-500); cursor: pointer; font-size: 1.2rem;">×</button>
            </div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 25px;
            right: 25px;
            background: var(--white);
            color: var(--gray-800);
            padding: 16px 20px;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 10001;
            min-width: 350px;
            max-width: 500px;
            border-left: 4px solid ${colors[type]};
            animation: slideInRight 0.4s ease-out;
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.4s ease-out';
                setTimeout(() => toast.remove(), 400);
            }
        }, 5000);
    }

    shakeLoginCard() {
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
    
    // Add CSS animations for enhanced UX
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes slideInError {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        @keyframes successPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(16, 185, 129, 0.3); }
            100% { transform: scale(1); }
        }
        
        @keyframes celebrationBounce {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.1) rotate(2deg); }
            75% { transform: scale(1.05) rotate(-1deg); }
        }
        
        @keyframes confetti-fall {
            to {
                transform: translateY(100vh) rotate(720deg);
            }
        }
        
        .password-strength {
            margin-top: 8px;
        }
        
        .strength-bar {
            width: 100%;
            height: 4px;
            background: var(--gray-200);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 5px;
        }
        
        .strength-fill {
            height: 100%;
            transition: width 0.3s ease, background-color 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-fill.strength-weak { background: var(--danger-color); }
        .strength-fill.strength-fair { background: var(--warning-color); }
        .strength-fill.strength-good { background: var(--primary-color); }
        .strength-fill.strength-strong { background: var(--success-color); }
        .strength-fill.strength-excellent { background: var(--success-color); }
        
        .strength-text {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--gray-600);
        }
        
        .form-group.focused input,
        .form-group.focused select,
        .form-group.focused textarea {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .form-group.focused i {
            color: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
});

// Global logout function for navigation links
function logout() {
    if (window.authSystem) {
        window.authSystem.logout();
    }
}