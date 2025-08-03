// School Dashboard Manager
class SchoolDashboard {
    constructor() {
        this.currentUser = null;
        this.schoolData = null;
        this.students = {};
        this.teachers = {};
        this.attendance = {};
        this.fees = {};
        this.exams = {};
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadSchoolData();
        this.bindEvents();
        this.initCurrentDate();
    }

    checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (!savedUser) {
            window.location.href = 'index.html';
            return;
        }

        this.currentUser = JSON.parse(savedUser);
        if (this.currentUser.role !== 'school_admin') {
            window.location.href = 'index.html';
            return;
        }
    }

    initCurrentDate() {
        // Set today's date for attendance
        const today = new Date().toISOString().split('T')[0];
        const attendanceDateInput = document.getElementById('attendanceDate');
        if (attendanceDateInput) {
            attendanceDateInput.value = today;
        }
    }

    loadSchoolData() {
        if (window.DEMO_MODE) {
            const demoData = window.getDemoData();
            this.schoolData = demoData.schools[this.currentUser.schoolId];
            
            if (this.schoolData) {
                this.students = this.schoolData.students || {};
                this.teachers = this.schoolData.teachers || {};
                this.attendance = this.schoolData.attendance || {};
                this.exams = this.schoolData.exams || {};
                
                // Update school name in sidebar
                document.getElementById('schoolName').textContent = this.schoolData.name;
            }
        } else {
            this.loadFirebaseData();
        }

        this.updateDashboard();
        this.updateTables();
    }

    async loadFirebaseData() {
        try {
            const schoolRef = database.ref(`schools/${this.currentUser.schoolId}`);
            const snapshot = await schoolRef.once('value');
            this.schoolData = snapshot.val();

            if (this.schoolData) {
                this.students = this.schoolData.students || {};
                this.teachers = this.schoolData.teachers || {};
                this.attendance = this.schoolData.attendance || {};
                this.exams = this.schoolData.exams || {};
                
                document.getElementById('schoolName').textContent = this.schoolData.name;
            }
        } catch (error) {
            console.error('Error loading school data:', error);
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

        // Student management
        document.getElementById('addStudentBtn').addEventListener('click', () => this.showAddStudentModal());
        document.getElementById('addStudentForm').addEventListener('submit', (e) => this.handleAddStudent(e));

        // Attendance
        document.getElementById('loadAttendanceBtn').addEventListener('click', () => this.loadAttendanceStudents());
        document.getElementById('markAllPresentBtn').addEventListener('click', () => this.markAllPresent());
        document.getElementById('saveAttendanceBtn').addEventListener('click', () => this.saveAttendance());

        // Filters
        document.getElementById('studentSearch').addEventListener('input', () => this.filterStudents());
        document.getElementById('classFilter').addEventListener('change', () => this.filterStudents());
        document.getElementById('sectionFilter').addEventListener('change', () => this.filterStudents());
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

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'students':
                this.updateStudentsTable();
                break;
            case 'teachers':
                this.updateTeachersTable();
                break;
            case 'attendance':
                // Attendance loads on demand when class/section is selected
                break;
            case 'fees':
                this.updateFeesData();
                break;
            case 'exams':
                this.updateExamsTable();
                break;
        }
    }

    updateDashboard() {
        const stats = this.calculateDashboardStats();
        
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('totalTeachers').textContent = stats.totalTeachers;
        document.getElementById('pendingFees').textContent = `₹${stats.pendingFees.toLocaleString()}`;
        document.getElementById('todayAbsent').textContent = stats.todayAbsent;

        this.updateRecentActivity();
    }

    calculateDashboardStats() {
        const students = Object.values(this.students);
        const teachers = Object.values(this.teachers);
        
        const totalStudents = students.length;
        const totalTeachers = teachers.length;
        
        // Calculate pending fees
        const pendingFees = students.reduce((total, student) => {
            return total + (student.fees?.due || 0);
        }, 0);

        // Calculate today's absent (simplified)
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = this.attendance[today] || {};
        let todayAbsent = 0;
        
        Object.values(todayAttendance).forEach(classAttendance => {
            Object.values(classAttendance).forEach(studentAttendance => {
                if (studentAttendance.status === 'absent') {
                    todayAbsent++;
                }
            });
        });

        return { totalStudents, totalTeachers, pendingFees, todayAbsent };
    }

    updateRecentActivity() {
        const tbody = document.getElementById('recentActivity');
        
        // Generate sample recent activity
        const activities = [
            { activity: 'Student Admission', name: 'Rahul Sharma', class: '10-A', time: '2 hours ago', status: 'Completed' },
            { activity: 'Fee Payment', name: 'Priya Patel', class: '10-A', time: '3 hours ago', status: 'Paid' },
            { activity: 'Attendance Marked', name: 'Class 9-B', class: '9-B', time: '1 day ago', status: 'Present: 25' },
            { activity: 'Exam Created', name: 'Math Mid-term', class: '10', time: '2 days ago', status: 'Scheduled' }
        ];

        tbody.innerHTML = activities.map(activity => `
            <tr>
                <td>${activity.activity}</td>
                <td>${activity.name}</td>
                <td>${activity.class}</td>
                <td>${activity.time}</td>
                <td>
                    <span class="status-badge ${activity.status.includes('Paid') ? 'active' : activity.status.includes('Present') ? 'success' : 'pending'}">
                        ${activity.status}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    updateTables() {
        this.updateStudentsTable();
        this.updateTeachersTable();
        this.updateFeesData();
        this.updateExamsTable();
    }

    updateStudentsTable() {
        const tbody = document.getElementById('studentsTable');
        const students = Object.entries(this.students).map(([id, student]) => ({ id, ...student }));

        tbody.innerHTML = students.map(student => {
            const feeStatus = this.getFeeStatus(student.fees);
            
            return `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.class}</td>
                    <td>${student.section}</td>
                    <td>${student.rollNo}</td>
                    <td>${student.phone || 'N/A'}</td>
                    <td>
                        <span class="status-badge ${feeStatus.class}">
                            ${feeStatus.text}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-outline" onclick="schoolDashboard.viewStudent('${student.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning" onclick="schoolDashboard.editStudent('${student.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger" onclick="schoolDashboard.deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateTeachersTable() {
        const tbody = document.getElementById('teachersTable');
        const teachers = Object.entries(this.teachers).map(([id, teacher]) => ({ id, ...teacher }));

        tbody.innerHTML = teachers.map(teacher => `
            <tr>
                <td>${teacher.id}</td>
                <td>${teacher.name}</td>
                <td>${teacher.subject}</td>
                <td>${teacher.classes ? teacher.classes.join(', ') : 'N/A'}</td>
                <td>${teacher.phone}</td>
                <td>${teacher.email}</td>
                <td>
                    <button class="btn btn-outline" onclick="schoolDashboard.viewTeacher('${teacher.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-warning" onclick="schoolDashboard.editTeacher('${teacher.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="schoolDashboard.deleteTeacher('${teacher.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateFeesData() {
        const students = Object.values(this.students);
        
        const totalCollected = students.reduce((sum, student) => sum + (student.fees?.paid || 0), 0);
        const totalPending = students.reduce((sum, student) => sum + (student.fees?.due || 0), 0);
        const overdueFees = students.reduce((sum, student) => {
            // Simplified overdue calculation
            const lastPayment = student.fees?.lastPayment;
            if (lastPayment) {
                const lastDate = new Date(lastPayment);
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                
                if (lastDate < oneMonthAgo && student.fees?.due > 0) {
                    return sum + student.fees.due;
                }
            }
            return sum;
        }, 0);
        
        const collectionRate = totalCollected + totalPending > 0 ? 
            Math.round((totalCollected / (totalCollected + totalPending)) * 100) : 0;

        document.getElementById('totalCollected').textContent = `₹${totalCollected.toLocaleString()}`;
        document.getElementById('totalPending').textContent = `₹${totalPending.toLocaleString()}`;
        document.getElementById('overdueFees').textContent = `₹${overdueFees.toLocaleString()}`;
        document.getElementById('collectionRate').textContent = `${collectionRate}%`;

        this.updateFeesTable();
    }

    updateFeesTable() {
        const tbody = document.getElementById('feesTable');
        const students = Object.entries(this.students).map(([id, student]) => ({ id, ...student }));

        tbody.innerHTML = students.map(student => {
            const fees = student.fees || {};
            const status = this.getFeeStatus(fees);
            
            return `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.class}-${student.section}</td>
                    <td>₹${fees.monthly?.toLocaleString() || '0'}</td>
                    <td>₹${fees.paid?.toLocaleString() || '0'}</td>
                    <td>₹${fees.due?.toLocaleString() || '0'}</td>
                    <td>${fees.lastPayment || 'N/A'}</td>
                    <td>
                        <span class="status-badge ${status.class}">
                            ${status.text}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-primary" onclick="schoolDashboard.collectFee('${student.id}')">
                            <i class="fas fa-money-bill"></i>
                            Collect
                        </button>
                        <button class="btn btn-outline" onclick="schoolDashboard.viewFeeHistory('${student.id}')">
                            <i class="fas fa-history"></i>
                            History
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateExamsTable() {
        const tbody = document.getElementById('examsTable');
        const exams = Object.entries(this.exams).map(([id, exam]) => ({ id, ...exam }));

        tbody.innerHTML = exams.map(exam => `
            <tr>
                <td>${exam.name}</td>
                <td>${exam.class}</td>
                <td>${exam.subject}</td>
                <td>${exam.date}</td>
                <td>${exam.totalMarks}</td>
                <td>
                    <span class="status-badge ${exam.status || 'pending'}">
                        ${exam.status || 'Pending'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-outline" onclick="schoolDashboard.viewExam('${exam.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-success" onclick="schoolDashboard.enterMarks('${exam.id}')">
                        <i class="fas fa-edit"></i>
                        Marks
                    </button>
                    <button class="btn btn-warning" onclick="schoolDashboard.editExam('${exam.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getFeeStatus(fees) {
        if (!fees) return { class: 'inactive', text: 'Not Set' };
        
        if (fees.due <= 0) {
            return { class: 'active', text: 'Paid' };
        } else if (fees.due > 0) {
            // Check if overdue (simplified)
            const lastPayment = fees.lastPayment;
            if (lastPayment) {
                const lastDate = new Date(lastPayment);
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                
                if (lastDate < oneMonthAgo) {
                    return { class: 'danger', text: 'Overdue' };
                }
            }
            return { class: 'warning', text: 'Pending' };
        }
        
        return { class: 'inactive', text: 'Unknown' };
    }

    showAddStudentModal() {
        document.getElementById('addStudentModal').classList.add('show');
    }

    handleAddStudent(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const studentData = {
            id: 'STD' + Date.now().toString().substr(-6),
            name: formData.get('name'),
            dob: formData.get('dob'),
            gender: formData.get('gender'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: formData.get('address'),
            class: formData.get('class'),
            section: formData.get('section'),
            rollNo: formData.get('rollNo'),
            admissionDate: formData.get('admissionDate') || new Date().toISOString().split('T')[0],
            guardianName: formData.get('guardianName'),
            guardianPhone: formData.get('guardianPhone'),
            fees: {
                monthly: parseInt(formData.get('monthlyFee')) || 0,
                paid: 0,
                due: parseInt(formData.get('monthlyFee')) || 0,
                lastPayment: null
            }
        };

        // Add student to data
        this.students[studentData.id] = studentData;
        this.saveSchoolData();
        
        // Update UI
        this.updateStudentsTable();
        this.updateDashboard();
        
        // Close modal and reset form
        this.closeModal('addStudentModal');
        e.target.reset();
        
        if (window.authSystem) {
            window.authSystem.showSuccess('Student added successfully!');
        }
    }

    loadAttendanceStudents() {
        const date = document.getElementById('attendanceDate').value;
        const className = document.getElementById('attendanceClass').value;
        const section = document.getElementById('attendanceSection').value;

        if (!date || !className || !section) {
            if (window.authSystem) {
                window.authSystem.showError('Please select date, class, and section');
            }
            return;
        }

        // Filter students by class and section
        const classStudents = Object.entries(this.students)
            .filter(([id, student]) => student.class === className && student.section === section)
            .map(([id, student]) => ({ id, ...student }))
            .sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''));

        if (classStudents.length === 0) {
            if (window.authSystem) {
                window.authSystem.showError('No students found for this class and section');
            }
            return;
        }

        // Load existing attendance if available
        const classKey = className + section;
        const existingAttendance = this.attendance[date]?.[classKey] || {};

        const tbody = document.getElementById('attendanceStudents');
        tbody.innerHTML = classStudents.map(student => {
            const attendance = existingAttendance[student.id] || { status: 'present', remarks: '' };
            
            return `
                <tr data-student-id="${student.id}">
                    <td>${student.rollNo}</td>
                    <td>${student.name}</td>
                    <td>
                        <label style="margin-right: 15px;">
                            <input type="radio" name="attendance_${student.id}" value="present" ${attendance.status === 'present' ? 'checked' : ''}>
                            Present
                        </label>
                        <label>
                            <input type="radio" name="attendance_${student.id}" value="absent" ${attendance.status === 'absent' ? 'checked' : ''}>
                            Absent
                        </label>
                    </td>
                    <td>
                        <input type="text" name="remarks_${student.id}" value="${attendance.remarks}" placeholder="Optional remarks">
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('attendanceTable').style.display = 'block';
    }

    markAllPresent() {
        const presentRadios = document.querySelectorAll('input[type="radio"][value="present"]');
        presentRadios.forEach(radio => {
            radio.checked = true;
        });
        
        if (window.authSystem) {
            window.authSystem.showSuccess('All students marked present');
        }
    }

    saveAttendance() {
        const date = document.getElementById('attendanceDate').value;
        const className = document.getElementById('attendanceClass').value;
        const section = document.getElementById('attendanceSection').value;
        const classKey = className + section;

        if (!date || !className || !section) {
            if (window.authSystem) {
                window.authSystem.showError('Please select date, class, and section');
            }
            return;
        }

        const attendanceData = {};
        const rows = document.querySelectorAll('#attendanceStudents tr');
        
        rows.forEach(row => {
            const studentId = row.dataset.studentId;
            const statusRadio = row.querySelector(`input[name="attendance_${studentId}"]:checked`);
            const remarksInput = row.querySelector(`input[name="remarks_${studentId}"]`);
            
            if (statusRadio) {
                attendanceData[studentId] = {
                    status: statusRadio.value,
                    remarks: remarksInput ? remarksInput.value : '',
                    time: new Date().toTimeString().split(' ')[0]
                };
            }
        });

        // Save attendance
        if (!this.attendance[date]) {
            this.attendance[date] = {};
        }
        this.attendance[date][classKey] = attendanceData;
        
        this.saveSchoolData();
        this.updateDashboard();
        
        if (window.authSystem) {
            window.authSystem.showSuccess('Attendance saved successfully!');
        }
    }

    collectFee(studentId) {
        const student = this.students[studentId];
        if (!student) return;

        const amount = prompt(`Enter fee amount to collect for ${student.name}:`);
        if (amount && !isNaN(amount) && amount > 0) {
            const feeAmount = parseFloat(amount);
            
            // Update fee data
            if (!student.fees) {
                student.fees = { monthly: 0, paid: 0, due: 0 };
            }
            
            student.fees.paid = (student.fees.paid || 0) + feeAmount;
            student.fees.due = Math.max(0, (student.fees.due || 0) - feeAmount);
            student.fees.lastPayment = new Date().toISOString().split('T')[0];
            
            this.saveSchoolData();
            this.updateFeesData();
            
            if (window.authSystem) {
                window.authSystem.showSuccess(`Fee of ₹${feeAmount} collected from ${student.name}`);
            }
        }
    }

    filterStudents() {
        const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
        const classFilter = document.getElementById('classFilter').value;
        const sectionFilter = document.getElementById('sectionFilter').value;

        const rows = document.querySelectorAll('#studentsTable tr');
        
        rows.forEach(row => {
            const name = row.cells[1].textContent.toLowerCase();
            const studentClass = row.cells[2].textContent;
            const section = row.cells[3].textContent;

            const matchesSearch = name.includes(searchTerm);
            const matchesClass = !classFilter || studentClass === classFilter;
            const matchesSection = !sectionFilter || section === sectionFilter;

            row.style.display = matchesSearch && matchesClass && matchesSection ? '' : 'none';
        });
    }

    viewStudent(studentId) {
        const student = this.students[studentId];
        if (!student) return;
        
        alert(`Student Details:\n\nName: ${student.name}\nClass: ${student.class}-${student.section}\nRoll No: ${student.rollNo}\nPhone: ${student.phone}\nGuardian: ${student.guardianName}\nFee Due: ₹${student.fees?.due || 0}`);
    }

    deleteStudent(studentId) {
        if (confirm('Are you sure you want to delete this student?')) {
            delete this.students[studentId];
            this.saveSchoolData();
            this.updateStudentsTable();
            this.updateDashboard();
            
            if (window.authSystem) {
                window.authSystem.showSuccess('Student deleted successfully');
            }
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    saveSchoolData() {
        if (window.DEMO_MODE) {
            const demoData = window.getDemoData();
            if (demoData.schools[this.currentUser.schoolId]) {
                demoData.schools[this.currentUser.schoolId].students = this.students;
                demoData.schools[this.currentUser.schoolId].teachers = this.teachers;
                demoData.schools[this.currentUser.schoolId].attendance = this.attendance;
                demoData.schools[this.currentUser.schoolId].exams = this.exams;
                window.setDemoData(demoData);
            }
        } else {
            // Save to Firebase
            const schoolRef = database.ref(`schools/${this.currentUser.schoolId}`);
            schoolRef.update({
                students: this.students,
                teachers: this.teachers,
                attendance: this.attendance,
                exams: this.exams
            });
        }
    }
}

// Utility function to close modals
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Initialize School Dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.schoolDashboard = new SchoolDashboard();
});

// Add CSS for content sections (reuse from super-admin)
const style = document.createElement('style');
style.textContent = `
    .content-section {
        display: none;
    }
    
    .content-section.active {
        display: block;
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
    
    .attendance-controls .form-row {
        background: var(--white);
        padding: 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
    }
    
    .quick-actions h3 {
        margin-bottom: 15px;
        color: var(--gray-800);
    }
`;
document.head.appendChild(style);