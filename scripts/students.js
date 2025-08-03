// Students Management JavaScript

let allStudents = [];
let filteredStudents = [];
let currentStudent = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!requireAuth()) return;
    
    initializeStudentsPage();
});

function initializeStudentsPage() {
    // Initialize sidebar toggle
    initializeSidebarToggle();
    
    // Load school and user information
    loadSchoolInfo();
    loadUserInfo();
    
    // Load students data
    loadStudents();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize form
    setupFormCalculations();
    
    // Check for URL parameters
    handleURLParameters();
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
    handleResize();
}

function loadSchoolInfo() {
    const school = getCurrentSchool();
    const user = getCurrentUser();
    
    if (school) {
        document.getElementById('schoolInfo').innerHTML = `
            <div class="school-name">${school.name}</div>
            <div class="school-code">School ID: ${school.id}</div>
        `;
    }
    
    if (user) {
        const initials = getInitials(user.name);
        document.getElementById('userInitials').textContent = initials;
    }
}

function loadUserInfo() {
    const user = getCurrentUser();
    
    if (user) {
        const initials = getInitials(user.name);
        document.getElementById('userInitials').textContent = initials;
    }
}

function loadStudents() {
    const schoolId = localStorage.getItem('currentSchool');
    if (!schoolId) return;
    
    const studentsData = getDemoData('Students');
    allStudents = studentsData[schoolId] || [];
    filteredStudents = [...allStudents];
    
    // Load classes for filters
    loadClassFilters();
    
    // Update statistics
    updateStatistics();
    
    // Render students table
    renderStudentsTable();
}

function loadClassFilters() {
    const school = getCurrentSchool();
    const classFilter = document.getElementById('classFilter');
    const studentClass = document.getElementById('studentClass');
    
    if (school && school.classes) {
        const classOptions = school.classes.map(cls => 
            `<option value="${cls}">Class ${cls}</option>`
        ).join('');
        
        classFilter.innerHTML = '<option value="">All Classes</option>' + classOptions;
        if (studentClass) {
            studentClass.innerHTML = '<option value="">Select Class</option>' + classOptions;
        }
    }
}

function updateStatistics() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newThisMonth = allStudents.filter(student => {
        const admissionDate = new Date(student.admissionDate);
        return admissionDate.getMonth() === currentMonth && 
               admissionDate.getFullYear() === currentYear;
    }).length;
    
    const uniqueClasses = [...new Set(allStudents.map(s => s.class))].length;
    
    document.getElementById('totalStudentsCount').textContent = allStudents.length;
    document.getElementById('newStudentsCount').textContent = newThisMonth;
    document.getElementById('totalClassesCount').textContent = uniqueClasses;
}

function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div style="padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-users fa-3x" style="margin-bottom: 1rem; opacity: 0.3;"></i>
                        <p>No students found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredStudents.map(student => `
        <tr>
            <td>
                <div class="student-avatar" style="width: 40px; height: 40px; font-size: 0.8rem;">
                    ${student.photo ? 
                        `<img src="${student.photo}" alt="${student.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` :
                        getInitials(student.name)
                    }
                </div>
            </td>
            <td><strong>${student.id}</strong></td>
            <td>
                <div>
                    <div class="font-semibold">${student.name}</div>
                    <div class="text-sm text-secondary">${student.email || 'No email'}</div>
                </div>
            </td>
            <td>
                <span class="badge">${student.class}${student.section ? '-' + student.section : ''}</span>
            </td>
            <td>${student.rollNumber || 'N/A'}</td>
            <td>
                <div class="text-sm">
                    <div>${student.phone || 'N/A'}</div>
                </div>
            </td>
            <td>
                <div class="text-sm">
                    <div class="font-semibold">${student.guardianName}</div>
                    <div class="text-secondary">${student.guardianPhone}</div>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="viewStudent('${student.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editStudent('${student.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Filter functionality
    document.getElementById('classFilter').addEventListener('change', handleFilters);
    document.getElementById('sectionFilter').addEventListener('change', handleFilters);
    
    // Form submission
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
    
    // Photo upload
    document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
    
    // Class and section change for roll number generation
    document.getElementById('studentClass').addEventListener('change', generateRollNumber);
    document.getElementById('section').addEventListener('change', generateRollNumber);
    
    // User menu setup
    setupUserMenu();
}

function setupFormCalculations() {
    const feeInputs = ['tuitionFee', 'libraryFee', 'sportsFee', 'examFee'];
    
    feeInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('input', calculateTotalFee);
    });
}

function calculateTotalFee() {
    const tuition = parseFloat(document.getElementById('tuitionFee').value) || 0;
    const library = parseFloat(document.getElementById('libraryFee').value) || 0;
    const sports = parseFloat(document.getElementById('sportsFee').value) || 0;
    const exam = parseFloat(document.getElementById('examFee').value) || 0;
    
    const total = tuition + library + sports + exam;
    document.getElementById('totalFee').value = total;
}

function generateRollNumber() {
    const className = document.getElementById('studentClass').value;
    const section = document.getElementById('section').value;
    
    if (className && section) {
        // Count existing students in the same class and section
        const existingCount = allStudents.filter(s => 
            s.class === className && s.section === section
        ).length;
        
        const rollNumber = generateRollNumber(className, section, existingCount + 1);
        document.getElementById('rollNumber').value = rollNumber;
    }
}

function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'add') {
        showAddStudentForm();
    }
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        filteredStudents = [...allStudents];
    } else {
        filteredStudents = allStudents.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.id.toLowerCase().includes(searchTerm) ||
            student.email?.toLowerCase().includes(searchTerm) ||
            student.phone?.includes(searchTerm) ||
            student.guardianName.toLowerCase().includes(searchTerm) ||
            student.guardianPhone?.includes(searchTerm)
        );
    }
    
    applyFilters();
    renderStudentsTable();
}

function handleFilters() {
    applyFilters();
    renderStudentsTable();
}

function applyFilters() {
    const classFilter = document.getElementById('classFilter').value;
    const sectionFilter = document.getElementById('sectionFilter').value;
    
    filteredStudents = filteredStudents.filter(student => {
        const classMatch = !classFilter || student.class === classFilter;
        const sectionMatch = !sectionFilter || student.section === sectionFilter;
        return classMatch && sectionMatch;
    });
}

function showStudentsList() {
    document.getElementById('studentsListView').style.display = 'block';
    document.getElementById('addStudentView').style.display = 'none';
    document.getElementById('studentDetailView').style.display = 'none';
    
    // Reset form
    document.getElementById('studentForm').reset();
    document.getElementById('photoPreview').innerHTML = '<i class="fas fa-user fa-3x"></i>';
    currentStudent = null;
    isEditMode = false;
}

function showAddStudentForm() {
    document.getElementById('studentsListView').style.display = 'none';
    document.getElementById('addStudentView').style.display = 'block';
    document.getElementById('studentDetailView').style.display = 'none';
    
    document.getElementById('formTitle').textContent = 'Add New Student';
    isEditMode = false;
    currentStudent = null;
    
    // Set default values
    document.getElementById('admissionDate').value = new Date().toISOString().split('T')[0];
    
    // Set default fees (you can customize these based on class)
    document.getElementById('tuitionFee').value = 8000;
    document.getElementById('libraryFee').value = 500;
    document.getElementById('sportsFee').value = 300;
    document.getElementById('examFee').value = 200;
    calculateTotalFee();
}

function viewStudent(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;
    
    currentStudent = student;
    
    document.getElementById('studentsListView').style.display = 'none';
    document.getElementById('addStudentView').style.display = 'none';
    document.getElementById('studentDetailView').style.display = 'block';
    
    renderStudentDetail(student);
}

function editStudent(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;
    
    currentStudent = student;
    isEditMode = true;
    
    document.getElementById('studentsListView').style.display = 'none';
    document.getElementById('addStudentView').style.display = 'block';
    document.getElementById('studentDetailView').style.display = 'none';
    
    document.getElementById('formTitle').textContent = 'Edit Student';
    
    // Populate form with student data
    populateForm(student);
}

function populateForm(student) {
    document.getElementById('studentName').value = student.name || '';
    document.getElementById('dateOfBirth').value = student.dateOfBirth || '';
    document.getElementById('gender').value = student.gender || '';
    document.getElementById('studentEmail').value = student.email || '';
    document.getElementById('studentPhone').value = student.phone || '';
    document.getElementById('address').value = student.address || '';
    document.getElementById('studentClass').value = student.class || '';
    document.getElementById('section').value = student.section || '';
    document.getElementById('rollNumber').value = student.rollNumber || '';
    document.getElementById('admissionDate').value = student.admissionDate || '';
    document.getElementById('guardianName').value = student.guardianName || '';
    document.getElementById('guardianPhone').value = student.guardianPhone || '';
    document.getElementById('guardianRelation').value = student.guardianRelation || 'Father';
    
    // Fee structure
    if (student.feesStructure) {
        document.getElementById('tuitionFee').value = student.feesStructure.tuitionFee || 0;
        document.getElementById('libraryFee').value = student.feesStructure.libraryFee || 0;
        document.getElementById('sportsFee').value = student.feesStructure.sportsFee || 0;
        document.getElementById('examFee').value = student.feesStructure.examFee || 0;
        calculateTotalFee();
    }
    
    // Photo
    if (student.photo) {
        document.getElementById('photoPreview').innerHTML = 
            `<img src="${student.photo}" alt="${student.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }
}

function renderStudentDetail(student) {
    const content = document.getElementById('studentDetailContent');
    
    content.innerHTML = `
        <div class="text-center mb-4">
            <div class="student-avatar-large">
                ${student.photo ? 
                    `<img src="${student.photo}" alt="${student.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` :
                    getInitials(student.name)
                }
            </div>
            <h2 style="margin: 0.5rem 0; color: var(--text-primary);">${student.name}</h2>
            <p style="margin: 0; color: var(--text-secondary);">Student ID: ${student.id}</p>
        </div>
        
        <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Date of Birth</div>
                    <div class="detail-value">${formatDisplayDate(student.dateOfBirth)} (Age: ${calculateAge(student.dateOfBirth)})</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Gender</div>
                    <div class="detail-value">${student.gender}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${student.email || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${student.phone || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Address</div>
                    <div class="detail-value">${student.address}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Academic Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Class</div>
                    <div class="detail-value">${student.class}${student.section ? '-' + student.section : ''}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Roll Number</div>
                    <div class="detail-value">${student.rollNumber || 'Not assigned'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Admission Date</div>
                    <div class="detail-value">${formatDisplayDate(student.admissionDate)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Academic Year</div>
                    <div class="detail-value">${getAcademicYear(new Date(student.admissionDate))}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Guardian Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Guardian Name</div>
                    <div class="detail-value">${student.guardianName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Relationship</div>
                    <div class="detail-value">${student.guardianRelation || 'Guardian'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${student.guardianPhone}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Fee Structure</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Tuition Fee</div>
                    <div class="detail-value">${formatCurrency(student.feesStructure?.tuitionFee || 0)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Library Fee</div>
                    <div class="detail-value">${formatCurrency(student.feesStructure?.libraryFee || 0)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sports Fee</div>
                    <div class="detail-value">${formatCurrency(student.feesStructure?.sportsFee || 0)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Exam Fee</div>
                    <div class="detail-value">${formatCurrency(student.feesStructure?.examFee || 0)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total Monthly Fee</div>
                    <div class="detail-value" style="font-weight: 600; color: var(--primary-blue);">
                        ${formatCurrency(student.feesStructure?.total || 0)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    handleFileUpload(event.target, ['image/jpeg', 'image/png', 'image/gif'], 2 * 1024 * 1024)
        .then(result => {
            document.getElementById('photoPreview').innerHTML = 
                `<img src="${result}" alt="Student Photo" style="width: 100%; height: 100%; object-fit: cover;">`;
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const studentData = {};
    
    // Extract form data
    for (let [key, value] of formData.entries()) {
        studentData[key] = value;
    }
    
    // Validate required fields
    const requiredFields = ['name', 'dateOfBirth', 'gender', 'address', 'class', 'section', 'admissionDate', 'guardianName', 'guardianPhone'];
    const errors = validateForm(event.target, requiredFields);
    
    if (errors.length > 0) {
        showNotification('Please fill all required fields: ' + errors.join(', '), 'error');
        return;
    }
    
    // Get photo
    const photoImg = document.querySelector('#photoPreview img');
    if (photoImg) {
        studentData.photo = photoImg.src;
    }
    
    // Create fee structure
    studentData.feesStructure = {
        tuitionFee: parseFloat(studentData.tuitionFee) || 0,
        libraryFee: parseFloat(studentData.libraryFee) || 0,
        sportsFee: parseFloat(studentData.sportsFee) || 0,
        examFee: parseFloat(studentData.examFee) || 0,
        total: parseFloat(studentData.totalFee) || 0
    };
    
    // Remove individual fee fields
    delete studentData.tuitionFee;
    delete studentData.libraryFee;
    delete studentData.sportsFee;
    delete studentData.examFee;
    delete studentData.totalFee;
    
    if (isEditMode && currentStudent) {
        updateStudent(studentData);
    } else {
        addNewStudent(studentData);
    }
}

function addNewStudent(studentData) {
    const schoolId = localStorage.getItem('currentSchool');
    
    // Generate unique student ID
    studentData.id = generateId('STU');
    
    // Add to students array
    allStudents.push(studentData);
    
    // Save to localStorage
    const allSchoolStudents = getDemoData('Students');
    allSchoolStudents[schoolId] = allStudents;
    saveDemoData('Students', allSchoolStudents);
    
    // Create initial fee record
    createInitialFeeRecord(studentData);
    
    showNotification('Student added successfully!', 'success');
    showStudentsList();
    loadStudents(); // Refresh data
}

function updateStudent(studentData) {
    const schoolId = localStorage.getItem('currentSchool');
    
    // Keep the original ID
    studentData.id = currentStudent.id;
    
    // Update in array
    const index = allStudents.findIndex(s => s.id === currentStudent.id);
    if (index !== -1) {
        allStudents[index] = studentData;
        
        // Save to localStorage
        const allSchoolStudents = getDemoData('Students');
        allSchoolStudents[schoolId] = allStudents;
        saveDemoData('Students', allSchoolStudents);
        
        showNotification('Student updated successfully!', 'success');
        showStudentsList();
        loadStudents(); // Refresh data
    }
}

function createInitialFeeRecord(student) {
    const schoolId = localStorage.getItem('currentSchool');
    const feesData = getDemoData('Fees');
    
    if (!feesData[schoolId]) {
        feesData[schoolId] = {};
    }
    
    feesData[schoolId][student.id] = {
        studentId: student.id,
        totalFees: student.feesStructure.total,
        paidAmount: 0,
        dueAmount: student.feesStructure.total,
        payments: [],
        dueDate: null
    };
    
    saveDemoData('Fees', feesData);
}

function deleteStudent(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;
    
    showConfirmDialog(
        `Are you sure you want to delete ${student.name}? This action cannot be undone.`,
        () => {
            const schoolId = localStorage.getItem('currentSchool');
            
            // Remove from array
            allStudents = allStudents.filter(s => s.id !== studentId);
            
            // Save to localStorage
            const allSchoolStudents = getDemoData('Students');
            allSchoolStudents[schoolId] = allStudents;
            saveDemoData('Students', allSchoolStudents);
            
            // Remove fee record
            const feesData = getDemoData('Fees');
            if (feesData[schoolId] && feesData[schoolId][studentId]) {
                delete feesData[schoolId][studentId];
                saveDemoData('Fees', feesData);
            }
            
            showNotification('Student deleted successfully!', 'success');
            loadStudents(); // Refresh data
        }
    );
}

function exportStudents() {
    if (filteredStudents.length === 0) {
        showNotification('No students to export', 'error');
        return;
    }
    
    const exportData = filteredStudents.map(student => ({
        'Student ID': student.id,
        'Name': student.name,
        'Class': student.class + (student.section ? '-' + student.section : ''),
        'Roll Number': student.rollNumber || '',
        'Date of Birth': student.dateOfBirth,
        'Gender': student.gender,
        'Email': student.email || '',
        'Phone': student.phone || '',
        'Address': student.address,
        'Guardian Name': student.guardianName,
        'Guardian Phone': student.guardianPhone,
        'Admission Date': student.admissionDate,
        'Total Fee': student.feesStructure?.total || 0
    }));
    
    exportToCSV(exportData, 'students_list');
}

function printStudents() {
    // Create a printable version of the students table
    const printContent = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <h1>Students List</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
                <tr style="background: #f5f5f5;">
                    <th style="border: 1px solid #ddd; padding: 8px;">ID</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Class</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Roll No.</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Guardian</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Phone</th>
                </tr>
            </thead>
            <tbody>
                ${filteredStudents.map(student => `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.id}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.name}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.class}${student.section ? '-' + student.section : ''}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.rollNumber || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.guardianName}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${student.guardianPhone}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
            <head>
                <title>Students List</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
window.showStudentsList = showStudentsList;
window.showAddStudentForm = showAddStudentForm;
window.viewStudent = viewStudent;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.exportStudents = exportStudents;
window.printStudents = printStudents;
window.toggleUserMenu = toggleUserMenu;