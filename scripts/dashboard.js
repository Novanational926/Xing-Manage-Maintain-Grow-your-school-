// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!requireAuth()) return;
    
    initializeDashboard();
});

function initializeDashboard() {
    // Initialize sidebar toggle
    initializeSidebarToggle();
    
    // Load school and user information
    loadSchoolInfo();
    loadUserInfo();
    
    // Set today's date
    setTodayDate();
    
    // Load dashboard data
    loadDashboardStats();
    loadRecentStudents();
    loadPendingFees();
    loadAttendanceSummary();
    loadUpcomingEvents();
    
    // Initialize chart
    initializeChart();
    
    // Setup user menu
    setupUserMenu();
}

function initializeSidebarToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
    
    // Handle mobile responsiveness
    function handleResize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
}

function loadSchoolInfo() {
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    if (school) {
        document.getElementById('schoolInfo').innerHTML = `
            <div class="school-name">${school.name}</div>
            <div class="school-code">School ID: ${school.id}</div>
        `;
        
        document.getElementById('welcomeMessage').textContent = 
            `Welcome back, ${user.name}!`;
    }
}

function loadUserInfo() {
    const user = getCurrentUser();
    
    if (user) {
        const initials = getInitials(user.name);
        document.getElementById('userInitials').textContent = initials;
    }
}

function setTodayDate() {
    const today = new Date();
    const dateString = today.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.querySelector('#todayDate span').textContent = dateString;
}

function loadDashboardStats() {
    const schoolId = localStorage.getItem('currentSchool');
    if (!schoolId) return;
    
    // Get all data
    const students = getDemoData('Students')[schoolId] || [];
    const teachers = getDemoData('Teachers')[schoolId] || [];
    const fees = getDemoData('Fees')[schoolId] || {};
    const attendance = getDemoData('Attendance')[schoolId] || {};
    
    // Calculate stats
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    
    // Calculate today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance[today] || {};
    const presentToday = Object.values(todayAttendance).filter(a => a.status === 'present').length;
    const attendancePercentage = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
    
    // Calculate total fees due
    let totalDue = 0;
    let totalPaid = 0;
    Object.values(fees).forEach(fee => {
        totalDue += fee.dueAmount || 0;
        totalPaid += fee.paidAmount || 0;
    });
    
    const collectionPercentage = (totalPaid + totalDue) > 0 ? 
        Math.round((totalPaid / (totalPaid + totalDue)) * 100) : 0;
    
    // Update UI
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalTeachers').textContent = totalTeachers;
    document.getElementById('presentToday').textContent = presentToday;
    document.getElementById('totalDues').textContent = formatCurrency(totalDue);
    document.getElementById('attendancePercentage').textContent = `${attendancePercentage}% attendance`;
    document.getElementById('feesCollection').textContent = `${collectionPercentage}% collected`;
}

function loadRecentStudents() {
    const schoolId = localStorage.getItem('currentSchool');
    if (!schoolId) return;
    
    const students = getDemoData('Students')[schoolId] || [];
    const recentStudents = students
        .sort((a, b) => new Date(b.admissionDate) - new Date(a.admissionDate))
        .slice(0, 5);
    
    const container = document.getElementById('recentStudents');
    
    if (recentStudents.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No students found</p>';
        return;
    }
    
    container.innerHTML = recentStudents.map(student => `
        <div class="recent-list-item">
            <div class="student-avatar">
                ${getInitials(student.name)}
            </div>
            <div class="student-info">
                <h4>${student.name}</h4>
                <p>Class ${student.class}${student.section ? '-' + student.section : ''} • Roll: ${student.rollNumber}</p>
            </div>
        </div>
    `).join('');
}

function loadPendingFees() {
    const schoolId = localStorage.getItem('currentSchool');
    if (!schoolId) return;
    
    const students = getDemoData('Students')[schoolId] || [];
    const fees = getDemoData('Fees')[schoolId] || {};
    
    const pendingFees = students
        .map(student => {
            const studentFee = fees[student.id];
            if (studentFee && studentFee.dueAmount > 0) {
                return {
                    name: student.name,
                    amount: studentFee.dueAmount,
                    dueDate: studentFee.dueDate
                };
            }
            return null;
        })
        .filter(fee => fee !== null)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
    
    const container = document.getElementById('pendingFees');
    
    if (pendingFees.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No pending fees</p>';
        return;
    }
    
    container.innerHTML = pendingFees.map(fee => `
        <div class="fee-alert">
            <div>
                <div style="font-weight: 500;">${fee.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">
                    Due: ${formatDisplayDate(fee.dueDate)}
                </div>
            </div>
            <div class="fee-amount">${formatCurrency(fee.amount)}</div>
        </div>
    `).join('');
}

function loadAttendanceSummary() {
    const schoolId = localStorage.getItem('currentSchool');
    if (!schoolId) return;
    
    const students = getDemoData('Students')[schoolId] || [];
    const attendance = getDemoData('Attendance')[schoolId] || {};
    const today = new Date().toISOString().split('T')[0];
    
    // Group students by class
    const classSummary = {};
    students.forEach(student => {
        const className = student.class;
        if (!classSummary[className]) {
            classSummary[className] = { total: 0, present: 0 };
        }
        classSummary[className].total++;
        
        if (attendance[today] && attendance[today][student.id] && 
            attendance[today][student.id].status === 'present') {
            classSummary[className].present++;
        }
    });
    
    const container = document.getElementById('attendanceSummary');
    
    if (Object.keys(classSummary).length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No attendance data</p>';
        return;
    }
    
    container.innerHTML = Object.entries(classSummary)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([className, data]) => {
            const percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
            const statusClass = percentage >= 90 ? 'good' : percentage >= 75 ? 'average' : 'poor';
            
            return `
                <div class="attendance-item">
                    <span>Class ${className}</span>
                    <span class="attendance-percentage ${statusClass}">
                        ${data.present}/${data.total} (${percentage}%)
                    </span>
                </div>
            `;
        }).join('');
}

function loadUpcomingEvents() {
    // Demo events data
    const upcomingEvents = [
        {
            title: 'Parent-Teacher Meeting',
            date: '2024-02-15',
            description: 'Quarterly review meeting'
        },
        {
            title: 'Science Exhibition',
            date: '2024-02-20',
            description: 'Annual science fair'
        },
        {
            title: 'Sports Day',
            date: '2024-02-25',
            description: 'Inter-class sports competition'
        },
        {
            title: 'Term Exam',
            date: '2024-03-01',
            description: 'Second term examination'
        }
    ];
    
    const container = document.getElementById('upcomingEvents');
    
    container.innerHTML = upcomingEvents.map(event => {
        const eventDate = new Date(event.date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleDateString('en-IN', { month: 'short' });
        
        return `
            <div class="event-item">
                <div class="event-date">
                    <div class="day">${day}</div>
                    <div class="month">${month}</div>
                </div>
                <div class="event-info">
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                </div>
            </div>
        `;
    }).join('');
}

function initializeChart() {
    const chartContainer = document.getElementById('performanceChart');
    
    // Simple bar chart representation (in a real app, you'd use Chart.js or similar)
    const chartData = [
        { class: '1', value: 85 },
        { class: '2', value: 92 },
        { class: '3', value: 78 },
        { class: '4', value: 88 },
        { class: '5', value: 94 },
        { class: '6', value: 82 },
        { class: '7', value: 90 },
        { class: '8', value: 87 },
        { class: '9', value: 91 },
        { class: '10', value: 89 }
    ];
    
    const maxValue = Math.max(...chartData.map(d => d.value));
    
    chartContainer.innerHTML = `
        <div style="display: flex; align-items: end; gap: 10px; height: 250px; padding: 20px;">
            ${chartData.map(data => `
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                    <div style="
                        height: ${(data.value / maxValue) * 200}px;
                        background: linear-gradient(135deg, var(--primary-blue), var(--primary-dark));
                        border-radius: 4px 4px 0 0;
                        width: 100%;
                        margin-bottom: 8px;
                        position: relative;
                        display: flex;
                        align-items: start;
                        justify-content: center;
                        padding-top: 5px;
                        color: white;
                        font-size: 0.8rem;
                        font-weight: 600;
                    ">${data.value}%</div>
                    <div style="font-size: 0.8rem; font-weight: 500;">Class ${data.class}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Performance metric selector
    const metricSelector = document.getElementById('performanceMetric');
    metricSelector.addEventListener('change', function() {
        // In a real app, this would reload the chart with different data
        showNotification(`Chart updated for ${this.value}`, 'info');
    });
}

function setupUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    const userDropdown = document.getElementById('userDropdown');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userMenu.contains(e.target)) {
            userDropdown.style.display = 'none';
        }
    });
}

function toggleUserMenu() {
    const userDropdown = document.getElementById('userDropdown');
    userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
}

// Export functions for global use
window.toggleUserMenu = toggleUserMenu;