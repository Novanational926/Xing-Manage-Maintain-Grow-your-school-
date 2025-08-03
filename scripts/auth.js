// Authentication system for National School Manager
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkAuthState();
        this.bindEvents();
    }

    bindEvents() {
        // Login form
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // School registration form
        const schoolRegisterForm = document.getElementById('schoolRegisterForm');
        if (schoolRegisterForm) {
            schoolRegisterForm.addEventListener('submit', (e) => this.handleSchoolRegistration(e));
        }

        // Google sign in
        const googleSignIn = document.getElementById('googleSignIn');
        if (googleSignIn) {
            googleSignIn.addEventListener('click', () => this.handleGoogleSignIn());
        }

        // Logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-logout]') || e.target.closest('[data-logout]')) {
                this.handleLogout();
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('userRole').value;

        if (!email || !password || !role) {
            this.showError('Please fill in all fields');
            return;
        }

        this.showLoading(true);

        try {
            if (window.DEMO_MODE) {
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

    async demoLogin(email, password, role) {
        const demoData = window.getDemoData();
        const users = demoData.users;

        // Find user by email
        const userKey = email.toLowerCase();
        const user = users[userKey];

        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        if (user.role !== role) {
            throw new Error('Invalid role selected');
        }

        // Check subscription status for school admins
        if (role === 'school_admin') {
            const school = demoData.schools[user.schoolId];
            if (!school || !this.isSubscriptionActive(school.subscription)) {
                throw new Error('School subscription is expired or inactive');
            }
        }

        // Set current user
        this.currentUser = {
            uid: userKey,
            email: user.email,
            role: user.role,
            name: user.name,
            schoolId: user.schoolId || null,
            teacherId: user.teacherId || null,
            studentId: user.studentId || null
        };

        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Redirect to appropriate dashboard
        this.redirectToDashboard();
    }

    async firebaseLogin(email, password, role) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Get user role from database
            const userDoc = await database.ref(`users/${user.uid}`).once('value');
            const userData = userDoc.val();

            if (!userData || userData.role !== role) {
                throw new Error('Invalid role or user data');
            }

            this.currentUser = {
                uid: user.uid,
                email: user.email,
                role: userData.role,
                name: userData.name,
                schoolId: userData.schoolId || null
            };

            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.redirectToDashboard();

        } catch (error) {
            throw new Error(error.message);
        }
    }

    async handleSchoolRegistration(e) {
        e.preventDefault();

        const schoolName = document.getElementById('schoolName').value;
        const adminEmail = document.getElementById('adminEmail').value;
        const adminPassword = document.getElementById('adminPassword').value;
        const schoolPhone = document.getElementById('schoolPhone').value;
        const schoolAddress = document.getElementById('schoolAddress').value;
        
        const selectedPlan = document.querySelector('.plan.selected');
        if (!selectedPlan) {
            this.showError('Please select a subscription plan');
            return;
        }

        const plan = selectedPlan.dataset.plan;
        const amount = plan === 'monthly' ? 200 : 11500;

        this.showLoading(true);

        try {
            // Simulate payment process
            const paymentResult = await this.processPayment(amount, plan);
            
            if (paymentResult.success) {
                // Register school
                await this.registerSchool({
                    name: schoolName,
                    adminEmail,
                    adminPassword,
                    phone: schoolPhone,
                    address: schoolAddress,
                    plan,
                    amount
                });

                this.showSuccess('School registered successfully! Please login with your credentials.');
                
                // Switch to login form
                document.getElementById('registerForm').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async processPayment(amount, plan) {
        // Simulate payment gateway
        return new Promise((resolve) => {
            setTimeout(() => {
                // For demo, always succeed
                resolve({
                    success: true,
                    transactionId: 'TXN' + Date.now(),
                    amount,
                    plan
                });
            }, 2000);
        });
    }

    async registerSchool(schoolData) {
        if (window.DEMO_MODE) {
            await this.demoRegisterSchool(schoolData);
        } else {
            await this.firebaseRegisterSchool(schoolData);
        }
    }

    async demoRegisterSchool(schoolData) {
        const demoData = window.getDemoData();
        const schoolId = 'school_' + Date.now();
        
        const expiryDate = schoolData.plan === 'monthly' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // For monthly plans, first month is ₹200, then ₹1000/month
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
                transactionId: 'TXN' + Date.now()
            },
            students: {},
            teachers: {},
            attendance: {},
            exams: {},
            createdAt: new Date().toISOString()
        };

        // Add admin user
        demoData.users[schoolData.adminEmail.toLowerCase()] = {
            email: schoolData.adminEmail,
            password: schoolData.adminPassword,
            role: 'school_admin',
            schoolId: schoolId,
            name: schoolData.name + ' Admin'
        };

        window.setDemoData(demoData);
    }

    async firebaseRegisterSchool(schoolData) {
        // Create admin user
        const userCredential = await auth.createUserWithEmailAndPassword(
            schoolData.adminEmail, 
            schoolData.adminPassword
        );
        
        const user = userCredential.user;
        const schoolId = 'school_' + user.uid;

        // Store school data
        await database.ref(`schools/${schoolId}`).set({
            name: schoolData.name,
            adminEmail: schoolData.adminEmail,
            phone: schoolData.phone,
            address: schoolData.address,
            subscription: {
                plan: schoolData.plan,
                status: 'active',
                expiryDate: schoolData.plan === 'monthly' 
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                amount: schoolData.amount
            },
            createdAt: new Date().toISOString()
        });

        // Store admin user data
        await database.ref(`users/${user.uid}`).set({
            email: schoolData.adminEmail,
            role: 'school_admin',
            schoolId: schoolId,
            name: schoolData.name + ' Admin'
        });
    }

    async handleGoogleSignIn() {
        if (window.DEMO_MODE) {
            this.showError('Google Sign-In not available in demo mode');
            return;
        }

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            
            // Handle Google sign-in result
            const user = result.user;
            
            // Check if user exists in database
            const userDoc = await database.ref(`users/${user.uid}`).once('value');
            
            if (!userDoc.exists()) {
                throw new Error('User not registered. Please register your school first.');
            }

            const userData = userDoc.val();
            this.currentUser = {
                uid: user.uid,
                email: user.email,
                role: userData.role,
                name: user.displayName,
                schoolId: userData.schoolId
            };

            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.redirectToDashboard();

        } catch (error) {
            this.showError(error.message);
        }
    }

    handleLogout() {
        if (window.DEMO_MODE) {
            localStorage.removeItem('currentUser');
            this.currentUser = null;
            window.location.href = 'index.html';
        } else {
            auth.signOut().then(() => {
                localStorage.removeItem('currentUser');
                this.currentUser = null;
                window.location.href = 'index.html';
            });
        }
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            
            // If we're on login page and user is logged in, redirect
            if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
                this.redirectToDashboard();
            }
        } else {
            // If we're not on login page and no user, redirect to login
            if (!window.location.pathname.includes('index.html')) {
                window.location.href = 'index.html';
            }
        }
    }

    redirectToDashboard() {
        if (!this.currentUser) return;

        switch (this.currentUser.role) {
            case 'super_admin':
                window.location.href = 'super-admin-dashboard.html';
                break;
            case 'school_admin':
                window.location.href = 'school-dashboard.html';
                break;
            case 'teacher':
                window.location.href = 'teacher-dashboard.html';
                break;
            case 'student':
                window.location.href = 'student-dashboard.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    }

    isSubscriptionActive(subscription) {
        if (!subscription) return false;
        
        const today = new Date();
        const expiryDate = new Date(subscription.expiryDate);
        
        return subscription.status === 'active' && today <= expiryDate;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    hasAccess(requiredRoles) {
        if (!this.currentUser) return false;
        return requiredRoles.includes(this.currentUser.role);
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('show', show);
        }
    }

    showError(message) {
        // Create error toast
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        // Create success toast
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;

        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#06b6d4'};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;

        // Add to document
        document.body.appendChild(toast);

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
        `;

        closeBtn.addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);

        // Add animation styles if not exist
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
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
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Export for use in other files
window.AuthSystem = AuthSystem;