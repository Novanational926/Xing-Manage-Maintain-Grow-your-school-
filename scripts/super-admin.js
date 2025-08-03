// Super Admin Dashboard Manager
class SuperAdminDashboard {
    constructor() {
        this.currentUser = null;
        this.schools = {};
        this.users = {};
        this.init();
    }

    init() {
        // Check authentication
        this.checkAuth();
        this.loadData();
        this.bindEvents();
        this.initCharts();
    }

    checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (!savedUser) {
            window.location.href = 'index.html';
            return;
        }

        this.currentUser = JSON.parse(savedUser);
        if (this.currentUser.role !== 'super_admin') {
            window.location.href = 'index.html';
            return;
        }
    }

    loadData() {
        if (window.DEMO_MODE) {
            const demoData = window.getDemoData();
            this.schools = demoData.schools || {};
            this.users = demoData.users || {};
        } else {
            this.loadFirebaseData();
        }
        
        this.updateDashboard();
        this.updateSchoolsTable();
        this.updateSubscriptionsTable();
        this.updateUsersTable();
        this.updateAnalytics();
    }

    async loadFirebaseData() {
        try {
            // Load schools
            const schoolsSnapshot = await database.ref('schools').once('value');
            this.schools = schoolsSnapshot.val() || {};

            // Load users
            const usersSnapshot = await database.ref('users').once('value');
            this.users = usersSnapshot.val() || {};
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(e.target.dataset.section);
            });
        });

        // Search and filters
        document.getElementById('schoolSearch').addEventListener('input', () => this.filterSchools());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterSchools());
        document.getElementById('planFilter').addEventListener('change', () => this.filterSchools());

        document.getElementById('userSearch').addEventListener('input', () => this.filterUsers());
        document.getElementById('roleFilter').addEventListener('change', () => this.filterUsers());

        // Buttons
        document.getElementById('addSchoolBtn').addEventListener('click', () => this.showAddSchoolModal());
        document.getElementById('addUserBtn').addEventListener('click', () => this.showAddUserModal());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    }

    updateDashboard() {
        const stats = this.calculateStats();
        
        document.getElementById('totalSchools').textContent = stats.totalSchools;
        document.getElementById('activeSchools').textContent = stats.activeSchools;
        document.getElementById('monthlyRevenue').textContent = `₹${stats.monthlyRevenue.toLocaleString()}`;
        document.getElementById('expiringSchools').textContent = stats.expiringSchools;

        this.updateRecentSchools();
    }

    calculateStats() {
        const schools = Object.values(this.schools);
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const totalSchools = schools.length;
        const activeSchools = schools.filter(school => 
            this.isSubscriptionActive(school.subscription)
        ).length;

        const monthlyRevenue = schools.reduce((total, school) => {
            if (this.isSubscriptionActive(school.subscription)) {
                const amount = school.subscription.plan === 'monthly' ? 
                    school.subscription.amount : 
                    school.subscription.amount / 12;
                return total + amount;
            }
            return total;
        }, 0);

        const expiringSchools = schools.filter(school => {
            if (!school.subscription) return false;
            const expiryDate = new Date(school.subscription.expiryDate);
            return expiryDate > today && expiryDate <= thirtyDaysFromNow;
        }).length;

        return { totalSchools, activeSchools, monthlyRevenue, expiringSchools };
    }

    isSubscriptionActive(subscription) {
        if (!subscription) return false;
        const today = new Date();
        const expiryDate = new Date(subscription.expiryDate);
        return subscription.status === 'active' && today <= expiryDate;
    }

    updateRecentSchools() {
        const tbody = document.getElementById('recentSchools');
        const schools = Object.entries(this.schools)
            .map(([id, school]) => ({ id, ...school }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        tbody.innerHTML = schools.map(school => `
            <tr>
                <td>${school.name}</td>
                <td>${school.adminEmail}</td>
                <td>
                    <span class="status-badge ${school.subscription?.plan}">
                        ${school.subscription?.plan || 'N/A'}
                    </span>
                </td>
                <td>${new Date(school.createdAt).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${this.isSubscriptionActive(school.subscription) ? 'active' : 'inactive'}">
                        ${this.isSubscriptionActive(school.subscription) ? 'Active' : 'Inactive'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    updateSchoolsTable() {
        const tbody = document.getElementById('schoolsTable');
        const schools = Object.entries(this.schools).map(([id, school]) => ({ id, ...school }));

        tbody.innerHTML = schools.map(school => {
            const studentCount = Object.keys(school.students || {}).length;
            const isActive = this.isSubscriptionActive(school.subscription);
            
            return `
                <tr>
                    <td>${school.name}</td>
                    <td>${school.adminEmail}</td>
                    <td>${school.phone}</td>
                    <td>
                        <span class="status-badge ${school.subscription?.plan}">
                            ${school.subscription?.plan || 'N/A'}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${isActive ? 'active' : 'inactive'}">
                            ${isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>${school.subscription?.expiryDate || 'N/A'}</td>
                    <td>${studentCount}</td>
                    <td>
                        <button class="btn btn-outline" onclick="superAdmin.viewSchool('${school.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning" onclick="superAdmin.editSchool('${school.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!isActive ? `
                            <button class="btn btn-success" onclick="superAdmin.renewSchool('${school.id}')">
                                <i class="fas fa-refresh"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-danger" onclick="superAdmin.deleteSchool('${school.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateSubscriptionsTable() {
        const tbody = document.getElementById('subscriptionsTable');
        const schools = Object.entries(this.schools).map(([id, school]) => ({ id, ...school }));

        // Update subscription stats
        const monthlyCount = schools.filter(s => s.subscription?.plan === 'monthly').length;
        const yearlyCount = schools.filter(s => s.subscription?.plan === 'yearly').length;
        
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiringSoon = schools.filter(s => {
            if (!s.subscription) return false;
            const expiryDate = new Date(s.subscription.expiryDate);
            return expiryDate > today && expiryDate <= thirtyDaysFromNow;
        }).length;

        const expired = schools.filter(s => {
            if (!s.subscription) return true;
            const expiryDate = new Date(s.subscription.expiryDate);
            return expiryDate <= today;
        }).length;

        document.getElementById('monthlySubscriptions').textContent = monthlyCount;
        document.getElementById('yearlySubscriptions').textContent = yearlyCount;
        document.getElementById('expiringSoon').textContent = expiringSoon;
        document.getElementById('expiredSubscriptions').textContent = expired;

        tbody.innerHTML = schools.map(school => {
            const subscription = school.subscription;
            const isActive = this.isSubscriptionActive(subscription);
            
            return `
                <tr>
                    <td>${school.name}</td>
                    <td>
                        <span class="status-badge ${subscription?.plan}">
                            ${subscription?.plan || 'N/A'}
                        </span>
                    </td>
                    <td>₹${subscription?.amount?.toLocaleString() || '0'}</td>
                    <td>${school.createdAt ? new Date(school.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>${subscription?.expiryDate || 'N/A'}</td>
                    <td>
                        <span class="status-badge ${isActive ? 'active' : 'inactive'}">
                            ${isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-primary" onclick="superAdmin.renewSchool('${school.id}')">
                            <i class="fas fa-refresh"></i>
                            Renew
                        </button>
                        <button class="btn btn-outline" onclick="superAdmin.viewPaymentHistory('${school.id}')">
                            <i class="fas fa-history"></i>
                            History
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateUsersTable() {
        const tbody = document.getElementById('usersTable');
        const users = Object.entries(this.users)
            .filter(([email, user]) => user.role !== 'super_admin')
            .map(([email, user]) => ({ email, ...user }));

        tbody.innerHTML = users.map(user => {
            const school = this.schools[user.schoolId];
            const schoolName = school ? school.name : 'N/A';
            
            return `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>
                        <span class="status-badge ${user.role}">
                            ${user.role.replace('_', ' ').toUpperCase()}
                        </span>
                    </td>
                    <td>${schoolName}</td>
                    <td>N/A</td>
                    <td>
                        <span class="status-badge active">Active</span>
                    </td>
                    <td>
                        <button class="btn btn-warning" onclick="superAdmin.editUser('${user.email}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger" onclick="superAdmin.deleteUser('${user.email}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateAnalytics() {
        const schools = Object.values(this.schools);
        const totalRevenue = schools.reduce((total, school) => {
            return total + (school.subscription?.amount || 0);
        }, 0);

        const currentMonth = new Date().getMonth();
        const thisMonthRevenue = schools.filter(school => {
            if (!school.createdAt) return false;
            const createdDate = new Date(school.createdAt);
            return createdDate.getMonth() === currentMonth;
        }).reduce((total, school) => {
            return total + (school.subscription?.amount || 0);
        }, 0);

        const monthlyAverage = totalRevenue / Math.max(1, schools.length);
        const projectedRevenue = thisMonthRevenue * 1.2; // 20% growth assumption

        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
        document.getElementById('thisMonthRevenue').textContent = `₹${thisMonthRevenue.toLocaleString()}`;
        document.getElementById('averageRevenue').textContent = `₹${monthlyAverage.toLocaleString()}`;
        document.getElementById('projectedRevenue').textContent = `₹${projectedRevenue.toLocaleString()}`;
    }

    initCharts() {
        this.initRevenueChart();
        this.initSubscriptionChart();
        this.initMonthlyRevenueChart();
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        // Generate sample revenue data for last 6 months
        const months = [];
        const revenues = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('en-US', { month: 'short' }));
            
            // Calculate revenue for that month (simplified)
            const monthlyRevenue = Math.floor(Math.random() * 50000) + 10000;
            revenues.push(monthlyRevenue);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: revenues,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    initSubscriptionChart() {
        const ctx = document.getElementById('subscriptionChart').getContext('2d');
        
        const schools = Object.values(this.schools);
        const monthlyCount = schools.filter(s => s.subscription?.plan === 'monthly').length;
        const yearlyCount = schools.filter(s => s.subscription?.plan === 'yearly').length;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Monthly', 'Yearly'],
                datasets: [{
                    data: [monthlyCount, yearlyCount],
                    backgroundColor: ['#f59e0b', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initMonthlyRevenueChart() {
        const ctx = document.getElementById('monthlyRevenueChart').getContext('2d');
        
        // Generate sample data for last 12 months
        const months = [];
        const revenues = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            
            const monthlyRevenue = Math.floor(Math.random() * 100000) + 20000;
            revenues.push(monthlyRevenue);
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: revenues,
                    backgroundColor: '#4f46e5',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    filterSchools() {
        const searchTerm = document.getElementById('schoolSearch').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const planFilter = document.getElementById('planFilter').value;

        const rows = document.querySelectorAll('#schoolsTable tr');
        
        rows.forEach(row => {
            const schoolName = row.cells[0].textContent.toLowerCase();
            const adminEmail = row.cells[1].textContent.toLowerCase();
            const plan = row.cells[3].textContent.toLowerCase();
            const status = row.cells[4].textContent.toLowerCase();

            const matchesSearch = schoolName.includes(searchTerm) || adminEmail.includes(searchTerm);
            const matchesStatus = !statusFilter || status.includes(statusFilter);
            const matchesPlan = !planFilter || plan.includes(planFilter);

            row.style.display = matchesSearch && matchesStatus && matchesPlan ? '' : 'none';
        });
    }

    filterUsers() {
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        const roleFilter = document.getElementById('roleFilter').value;

        const rows = document.querySelectorAll('#usersTable tr');
        
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            const email = row.cells[1].textContent.toLowerCase();
            const role = row.cells[2].textContent.toLowerCase();

            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesRole = !roleFilter || role.includes(roleFilter.replace('_', ' '));

            row.style.display = matchesSearch && matchesRole ? '' : 'none';
        });
    }

    viewSchool(schoolId) {
        const school = this.schools[schoolId];
        if (!school) return;

        const modalContent = document.getElementById('schoolModalContent');
        modalContent.innerHTML = `
            <div class="form-container">
                <div class="form-section">
                    <h3>School Information</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>School Name</label>
                            <input type="text" value="${school.name}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Admin Email</label>
                            <input type="email" value="${school.adminEmail}" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" value="${school.phone}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Registration Date</label>
                            <input type="text" value="${new Date(school.createdAt).toLocaleDateString()}" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea readonly>${school.address}</textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Subscription Details</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Plan</label>
                            <input type="text" value="${school.subscription?.plan || 'N/A'}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Amount</label>
                            <input type="text" value="₹${school.subscription?.amount?.toLocaleString() || '0'}" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Status</label>
                            <input type="text" value="${this.isSubscriptionActive(school.subscription) ? 'Active' : 'Inactive'}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <input type="text" value="${school.subscription?.expiryDate || 'N/A'}" readonly>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Statistics</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Total Students</label>
                            <input type="text" value="${Object.keys(school.students || {}).length}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Total Teachers</label>
                            <input type="text" value="${Object.keys(school.teachers || {}).length}" readonly>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('schoolModal').classList.add('show');
    }

    renewSchool(schoolId) {
        if (confirm('Are you sure you want to renew this school\'s subscription?')) {
            const school = this.schools[schoolId];
            if (!school) return;

            // Extend subscription by 1 year
            const currentExpiry = new Date(school.subscription?.expiryDate || Date.now());
            const newExpiry = new Date(currentExpiry.getTime() + 365 * 24 * 60 * 60 * 1000);

            school.subscription = {
                ...school.subscription,
                status: 'active',
                expiryDate: newExpiry.toISOString().split('T')[0]
            };

            this.saveSchool(schoolId, school);
            this.loadData(); // Refresh data
            
            if (window.authSystem) {
                window.authSystem.showSuccess('School subscription renewed successfully!');
            }
        }
    }

    deleteSchool(schoolId) {
        if (confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
            delete this.schools[schoolId];
            
            // Remove associated users
            Object.keys(this.users).forEach(email => {
                if (this.users[email].schoolId === schoolId) {
                    delete this.users[email];
                }
            });

            this.saveData();
            this.loadData(); // Refresh data
            
            if (window.authSystem) {
                window.authSystem.showSuccess('School deleted successfully!');
            }
        }
    }

    saveSchool(schoolId, schoolData) {
        this.schools[schoolId] = schoolData;
        this.saveData();
    }

    saveData() {
        if (window.DEMO_MODE) {
            const demoData = window.getDemoData();
            demoData.schools = this.schools;
            demoData.users = this.users;
            window.setDemoData(demoData);
        } else {
            // Save to Firebase
            database.ref('schools').set(this.schools);
            database.ref('users').set(this.users);
        }
    }

    saveSettings() {
        const settings = {
            monthlyPrice: document.getElementById('monthlyPrice').value,
            yearlyPrice: document.getElementById('yearlyPrice').value,
            platformName: document.getElementById('platformName').value,
            supportEmail: document.getElementById('supportEmail').value,
            maxStudents: document.getElementById('maxStudents').value,
            trialPeriod: document.getElementById('trialPeriod').value,
            emailNotifications: document.getElementById('emailNotifications').checked,
            smsNotifications: document.getElementById('smsNotifications').checked
        };

        // Save settings (in demo mode, just show success)
        if (window.authSystem) {
            window.authSystem.showSuccess('Settings saved successfully!');
        }
    }
}

// Utility function to close modals
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Initialize Super Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.superAdmin = new SuperAdminDashboard();
});

// Add CSS for content sections
const style = document.createElement('style');
style.textContent = `
    .content-section {
        display: none;
    }
    
    .content-section.active {
        display: block;
    }
    
    .charts-grid canvas {
        max-height: 300px;
    }
    
    .form-actions {
        text-align: right;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid var(--gray-200);
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: var(--gray-700);
    }
    
    .form-group input[type="checkbox"] {
        width: auto;
        margin-right: 8px;
    }
`;
document.head.appendChild(style);