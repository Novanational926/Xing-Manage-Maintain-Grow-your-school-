// Authentication and Registration System

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthSystem();
});

function initializeAuthSystem() {
    // Role selector functionality
    const roleBtns = document.querySelectorAll('.role-btn');
    const schoolCodeGroup = document.getElementById('schoolCodeGroup');
    
    roleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            roleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const role = this.dataset.role;
            if (role === 'teacher' || role === 'student') {
                schoolCodeGroup.style.display = 'block';
                document.getElementById('schoolCode').required = true;
            } else {
                schoolCodeGroup.style.display = 'none';
                document.getElementById('schoolCode').required = false;
            }
        });
    });

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Registration modal
    const signupLink = document.getElementById('signupLink');
    const registrationModal = document.getElementById('registrationModal');
    const closeButtons = document.querySelectorAll('.close');
    
    if (signupLink) {
        signupLink.addEventListener('click', function(e) {
            e.preventDefault();
            registrationModal.style.display = 'block';
        });
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Registration form
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    // Subscription plan selection
    const planElements = document.querySelectorAll('.plan');
    planElements.forEach(plan => {
        plan.addEventListener('click', function() {
            planElements.forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Demo button
    const demoBtn = document.getElementById('demoBtn');
    if (demoBtn) {
        demoBtn.addEventListener('click', handleDemoLogin);
    }

    // Check if user is already logged in
    checkAuthState();
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const schoolCode = formData.get('schoolCode');
    const role = document.querySelector('.role-btn.active').dataset.role;

    showLoading(true);

    try {
        if (DEMO_MODE) {
            await handleDemoLogin(email, password, role, schoolCode);
        } else {
            await handleFirebaseLogin(email, password, role, schoolCode);
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed: ' + error.message, 'error');
        showLoading(false);
    }
}

// Handle demo login
async function handleDemoLogin(email = null, password = null, role = null, schoolCode = null) {
    showLoading(true);
    
    try {
        // Demo credentials
        const demoCredentials = {
            super: { email: 'superadmin@schoolmanager.com', password: 'admin123' },
            school: { 
                'school_001': { email: 'admin@starpublic.edu', password: 'admin123' },
                'school_002': { email: 'admin@brightfuture.edu', password: 'admin123' }
            },
            teacher: {
                'TEA001': { email: 'sunita.agarwal@starpublic.edu', password: 'teacher123', schoolId: 'school_001' },
                'TEA002': { email: 'ramesh.kumar@starpublic.edu', password: 'teacher123', schoolId: 'school_001' },
                'TEA003': { email: 'meera.reddy@brightfuture.edu', password: 'teacher123', schoolId: 'school_002' }
            },
            student: {
                'STU001': { email: 'aarav.patel@student.com', password: 'student123', schoolId: 'school_001' },
                'STU002': { email: 'sneha.gupta@student.com', password: 'student123', schoolId: 'school_001' },
                'STU003': { email: 'rohan.sharma@student.com', password: 'student123', schoolId: 'school_001' },
                'STU004': { email: 'ananya.singh@student.com', password: 'student123', schoolId: 'school_002' },
                'STU005': { email: 'karan.mehta@student.com', password: 'student123', schoolId: 'school_002' }
            }
        };

        if (!email || !password || !role) {
            // Show demo login options
            showDemoLoginOptions();
            showLoading(false);
            return;
        }

        let isValidLogin = false;
        let userInfo = null;
        let schoolId = null;

        // Validate credentials based on role
        if (role === 'super') {
            if (email === demoCredentials.super.email && password === demoCredentials.super.password) {
                isValidLogin = true;
                userInfo = { id: 'super_admin', name: 'Super Admin', email: email, role: 'super' };
            }
        } else if (role === 'school') {
            for (const [id, creds] of Object.entries(demoCredentials.school)) {
                if (email === creds.email && password === creds.password) {
                    isValidLogin = true;
                    schoolId = id;
                    const schools = getDemoData('Schools');
                    userInfo = {
                        id: 'admin_' + id,
                        name: schools[id].principal,
                        email: email,
                        role: 'school',
                        schoolId: id
                    };
                    break;
                }
            }
        } else if (role === 'teacher') {
            for (const [id, creds] of Object.entries(demoCredentials.teacher)) {
                if (email === creds.email && password === creds.password) {
                    if (!schoolCode || creds.schoolId === schoolCode) {
                        isValidLogin = true;
                        schoolId = creds.schoolId;
                        const teachers = getDemoData('Teachers');
                        const teacher = teachers[schoolId].find(t => t.id === id);
                        userInfo = {
                            id: id,
                            name: teacher.name,
                            email: email,
                            role: 'teacher',
                            schoolId: schoolId,
                            subject: teacher.subject,
                            classes: teacher.classes
                        };
                        break;
                    }
                }
            }
        } else if (role === 'student') {
            for (const [id, creds] of Object.entries(demoCredentials.student)) {
                if (email === creds.email && password === creds.password) {
                    if (!schoolCode || creds.schoolId === schoolCode) {
                        isValidLogin = true;
                        schoolId = creds.schoolId;
                        const students = getDemoData('Students');
                        const student = students[schoolId].find(s => s.id === id);
                        userInfo = {
                            id: id,
                            name: student.name,
                            email: email,
                            role: 'student',
                            schoolId: schoolId,
                            class: student.class,
                            section: student.section
                        };
                        break;
                    }
                }
            }
        }

        if (isValidLogin) {
            // Store user session
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            localStorage.setItem('currentSchool', schoolId || 'null');
            localStorage.setItem('userRole', role);

            // Set global variables
            currentUser = userInfo;
            currentSchool = schoolId;
            userRole = role;

            showNotification('Login successful!', 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                if (role === 'super') {
                    window.location.href = 'super-admin.html';
                } else if (role === 'school') {
                    window.location.href = 'dashboard.html';
                } else if (role === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else if (role === 'student') {
                    window.location.href = 'student-dashboard.html';
                }
            }, 1500);
        } else {
            throw new Error('Invalid credentials or school code');
        }
    } catch (error) {
        showNotification('Login failed: ' + error.message, 'error');
        showLoading(false);
    }
}

// Show demo login options
function showDemoLoginOptions() {
    const demoOptions = `
        <div id="demoLoginModal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Demo Login Options</h2>
                <div style="padding: 1.5rem;">
                    <div class="demo-login-options">
                        <h3>Super Admin</h3>
                        <button class="demo-login-btn" onclick="quickDemoLogin('superadmin@schoolmanager.com', 'admin123', 'super')">
                            <i class="fas fa-crown"></i>
                            Login as Super Admin
                        </button>
                        
                        <h3>School Admins</h3>
                        <button class="demo-login-btn" onclick="quickDemoLogin('admin@starpublic.edu', 'admin123', 'school')">
                            <i class="fas fa-school"></i>
                            Star Public School Admin
                        </button>
                        <button class="demo-login-btn" onclick="quickDemoLogin('admin@brightfuture.edu', 'admin123', 'school')">
                            <i class="fas fa-school"></i>
                            Bright Future Academy Admin
                        </button>
                        
                        <h3>Teachers</h3>
                        <button class="demo-login-btn" onclick="quickDemoLogin('sunita.agarwal@starpublic.edu', 'teacher123', 'teacher', 'school_001')">
                            <i class="fas fa-chalkboard-teacher"></i>
                            Prof. Sunita (Math Teacher)
                        </button>
                        
                        <h3>Students</h3>
                        <button class="demo-login-btn" onclick="quickDemoLogin('aarav.patel@student.com', 'student123', 'student', 'school_001')">
                            <i class="fas fa-user-graduate"></i>
                            Aarav Patel (Class 10)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', demoOptions);
    
    // Add styles for demo login
    const style = document.createElement('style');
    style.textContent = `
        .demo-login-options h3 {
            margin: 1.5rem 0 0.5rem 0;
            color: var(--text-primary);
            font-size: 1rem;
            font-weight: 600;
        }
        
        .demo-login-btn {
            width: 100%;
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: var(--bg-primary);
            border: 2px solid var(--gray-200);
            border-radius: var(--radius-lg);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 1rem;
            font-weight: 500;
        }
        
        .demo-login-btn:hover {
            border-color: var(--primary-blue);
            background: var(--bg-secondary);
        }
        
        .demo-login-btn i {
            font-size: 1.2rem;
            color: var(--primary-blue);
        }
    `;
    document.head.appendChild(style);
    
    // Add close functionality
    document.querySelector('#demoLoginModal .close').addEventListener('click', function() {
        document.getElementById('demoLoginModal').remove();
    });
}

// Quick demo login
function quickDemoLogin(email, password, role, schoolCode = null) {
    // Fill form fields
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
    if (schoolCode) {
        document.getElementById('schoolCode').value = schoolCode;
    }
    
    // Select role
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.role === role) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide school code field
    const schoolCodeGroup = document.getElementById('schoolCodeGroup');
    if (role === 'teacher' || role === 'student') {
        schoolCodeGroup.style.display = 'block';
    } else {
        schoolCodeGroup.style.display = 'none';
    }
    
    // Remove demo modal
    document.getElementById('demoLoginModal').remove();
    
    // Submit login
    handleDemoLogin(email, password, role, schoolCode);
}

// Handle registration
async function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const schoolData = {
        name: formData.get('schoolName'),
        principal: formData.get('principalName'),
        email: formData.get('schoolEmail'),
        phone: formData.get('schoolPhone'),
        address: formData.get('schoolAddress'),
        password: formData.get('adminPassword')
    };
    
    const selectedPlan = document.querySelector('.plan.selected').dataset.plan;
    
    // Validate data
    if (!schoolData.name || !schoolData.email || !schoolData.password) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Store registration data for payment
    localStorage.setItem('pendingRegistration', JSON.stringify({
        ...schoolData,
        plan: selectedPlan
    }));
    
    // Show payment modal
    showPaymentModal(selectedPlan);
}

// Show payment modal
function showPaymentModal(plan) {
    const paymentModal = document.getElementById('paymentModal');
    const registrationModal = document.getElementById('registrationModal');
    
    // Update payment details
    const planName = plan === 'monthly' ? 'Monthly Subscription' : 'Yearly Subscription';
    const amount = plan === 'monthly' ? '₹500' : '₹5000';
    
    document.getElementById('selectedPlan').textContent = planName;
    document.getElementById('paymentAmount').textContent = amount;
    
    // Hide registration modal and show payment modal
    registrationModal.style.display = 'none';
    paymentModal.style.display = 'block';
}

// Process payment
async function processPayment(method) {
    showLoading(true);
    
    try {
        const pendingRegistration = JSON.parse(localStorage.getItem('pendingRegistration'));
        
        if (method === 'demo') {
            // Demo payment - simulate success
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create new school in demo data
            const schoolId = generateId('school_');
            const schools = getDemoData('Schools') || {};
            
            schools[schoolId] = {
                id: schoolId,
                name: pendingRegistration.name,
                principal: pendingRegistration.principal,
                email: pendingRegistration.email,
                phone: pendingRegistration.phone,
                address: pendingRegistration.address,
                subscription: {
                    plan: pendingRegistration.plan,
                    status: 'active',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: getSubscriptionEndDate(pendingRegistration.plan),
                    amount: pendingRegistration.plan === 'monthly' ? 500 : 5000
                },
                classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                subjects: {
                    '1': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
                    '2': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
                    '3': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
                    '4': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
                    '5': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies']
                }
            };
            
            saveDemoData('Schools', schools);
            
            // Initialize empty data for new school
            const students = getDemoData('Students') || {};
            const teachers = getDemoData('Teachers') || {};
            const fees = getDemoData('Fees') || {};
            const attendance = getDemoData('Attendance') || {};
            
            students[schoolId] = [];
            teachers[schoolId] = [];
            fees[schoolId] = {};
            attendance[schoolId] = {};
            
            saveDemoData('Students', students);
            saveDemoData('Teachers', teachers);
            saveDemoData('Fees', fees);
            saveDemoData('Attendance', attendance);
            
            // Clear pending registration
            localStorage.removeItem('pendingRegistration');
            
            showNotification('School registered successfully!', 'success');
            showNotification('Login credentials sent to your email', 'info');
            
            // Close modals
            document.getElementById('paymentModal').style.display = 'none';
            
            // Auto-fill login form
            setTimeout(() => {
                document.getElementById('email').value = pendingRegistration.email;
                document.getElementById('password').value = pendingRegistration.password;
                document.querySelector('[data-role="school"]').click();
            }, 2000);
            
        } else {
            // Real payment integration would go here
            // For now, show coming soon message
            showNotification('Real payment integration coming soon! Use demo payment for now.', 'info');
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('Payment failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Get subscription end date
function getSubscriptionEndDate(plan) {
    const startDate = new Date();
    if (plan === 'monthly') {
        startDate.setMonth(startDate.getMonth() + 1);
    } else {
        startDate.setFullYear(startDate.getFullYear() + 1);
    }
    return startDate.toISOString().split('T')[0];
}

// Handle Firebase login (for production)
async function handleFirebaseLogin(email, password, role, schoolCode) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Get user role from database
        const userDoc = await database.ref(`users/${user.uid}`).once('value');
        const userData = userDoc.val();
        
        if (!userData || userData.role !== role) {
            throw new Error('Invalid role or user not found');
        }
        
        // Validate school code for teachers/students
        if ((role === 'teacher' || role === 'student') && userData.schoolId !== schoolCode) {
            throw new Error('Invalid school code');
        }
        
        // Set global variables
        currentUser = { ...userData, id: user.uid };
        currentSchool = userData.schoolId;
        userRole = role;
        
        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('currentSchool', currentSchool);
        localStorage.setItem('userRole', userRole);
        
        showNotification('Login successful!', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            if (role === 'super') {
                window.location.href = 'super-admin.html';
            } else if (role === 'school') {
                window.location.href = 'dashboard.html';
            } else if (role === 'teacher') {
                window.location.href = 'teacher-dashboard.html';
            } else if (role === 'student') {
                window.location.href = 'student-dashboard.html';
            }
        }, 1500);
        
    } catch (error) {
        throw error;
    }
}

// Check authentication state
function checkAuthState() {
    const storedUser = localStorage.getItem('currentUser');
    const storedSchool = localStorage.getItem('currentSchool');
    const storedRole = localStorage.getItem('userRole');
    
    if (storedUser && storedRole) {
        currentUser = JSON.parse(storedUser);
        currentSchool = storedSchool !== 'null' ? storedSchool : null;
        userRole = storedRole;
        
        // Redirect if already logged in and on login page
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            if (userRole === 'super') {
                window.location.href = 'super-admin.html';
            } else if (userRole === 'school') {
                window.location.href = 'dashboard.html';
            } else if (userRole === 'teacher') {
                window.location.href = 'teacher-dashboard.html';
            } else if (userRole === 'student') {
                window.location.href = 'student-dashboard.html';
            }
        }
    }
}

// Logout function
function logout() {
    // Clear Firebase auth
    if (auth.currentUser) {
        auth.signOut();
    }
    
    // Clear localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentSchool');
    localStorage.removeItem('userRole');
    
    // Clear global variables
    currentUser = null;
    currentSchool = null;
    userRole = null;
    
    showNotification('Logged out successfully!', 'success');
    
    // Redirect to login
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Show/hide loading overlay
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// Export functions for global use
window.logout = logout;
window.processPayment = processPayment;
window.quickDemoLogin = quickDemoLogin;