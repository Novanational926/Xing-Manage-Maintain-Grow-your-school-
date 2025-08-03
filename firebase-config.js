// Firebase Configuration
const firebaseConfig = {
    // Replace with your actual Firebase config
    apiKey: "demo-api-key",
    authDomain: "school-manager-demo.firebaseapp.com",
    databaseURL: "https://school-manager-demo-default-rtdb.firebaseio.com",
    projectId: "school-manager-demo",
    storageBucket: "school-manager-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Global variables
let currentUser = null;
let currentSchool = null;
let userRole = null;

// Demo Configuration
const DEMO_MODE = true;
const SUPER_ADMIN_EMAIL = "superadmin@schoolmanager.com";
const SUPER_ADMIN_PASSWORD = "admin123";

// Demo Schools Data
const DEMO_SCHOOLS = {
    'school_001': {
        id: 'school_001',
        name: 'Star Public School',
        principal: 'Dr. Rajesh Kumar',
        email: 'admin@starpublic.edu',
        phone: '+91-9876543210',
        address: '123 Education Street, Knowledge City, KC 560001',
        subscription: {
            plan: 'yearly',
            status: 'active',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            amount: 5000
        },
        classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        subjects: {
            '1': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
            '2': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
            '3': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
            '4': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
            '5': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
            '6': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer'],
            '7': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer'],
            '8': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer'],
            '9': ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer'],
            '10': ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer']
        }
    },
    'school_002': {
        id: 'school_002',
        name: 'Bright Future Academy',
        principal: 'Mrs. Priya Sharma',
        email: 'admin@brightfuture.edu',
        phone: '+91-9876543211',
        address: '456 Learning Avenue, Education Town, ET 560002',
        subscription: {
            plan: 'monthly',
            status: 'active',
            startDate: '2024-01-15',
            endDate: '2024-02-15',
            amount: 500
        },
        classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        subjects: {
            '1': ['English', 'Hindi', 'Mathematics', 'EVS'],
            '2': ['English', 'Hindi', 'Mathematics', 'EVS'],
            '3': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
            '4': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
            '5': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
            '6': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer'],
            '7': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer'],
            '8': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer'],
            '9': ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
            '10': ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
            '11': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
            '12': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science']
        }
    }
};

// Demo Students Data
const DEMO_STUDENTS = {
    'school_001': [
        {
            id: 'STU001',
            name: 'Aarav Patel',
            email: 'aarav.patel@student.com',
            phone: '+91-9876543212',
            class: '10',
            section: 'A',
            rollNumber: '101',
            dateOfBirth: '2008-05-15',
            gender: 'Male',
            address: '789 Student Street, Knowledge City',
            guardianName: 'Mr. Vikash Patel',
            guardianPhone: '+91-9876543213',
            admissionDate: '2023-04-01',
            photo: null,
            feesStructure: {
                tuitionFee: 8000,
                libraryFee: 500,
                sportsFee: 300,
                examFee: 200,
                total: 9000
            }
        },
        {
            id: 'STU002',
            name: 'Sneha Gupta',
            email: 'sneha.gupta@student.com',
            phone: '+91-9876543214',
            class: '10',
            section: 'A',
            rollNumber: '102',
            dateOfBirth: '2008-08-22',
            gender: 'Female',
            address: '321 Scholar Road, Knowledge City',
            guardianName: 'Mrs. Sunita Gupta',
            guardianPhone: '+91-9876543215',
            admissionDate: '2023-04-01',
            photo: null,
            feesStructure: {
                tuitionFee: 8000,
                libraryFee: 500,
                sportsFee: 300,
                examFee: 200,
                total: 9000
            }
        },
        {
            id: 'STU003',
            name: 'Rohan Sharma',
            email: 'rohan.sharma@student.com',
            phone: '+91-9876543216',
            class: '9',
            section: 'B',
            rollNumber: '201',
            dateOfBirth: '2009-03-10',
            gender: 'Male',
            address: '654 Learning Lane, Knowledge City',
            guardianName: 'Mr. Rajesh Sharma',
            guardianPhone: '+91-9876543217',
            admissionDate: '2023-04-01',
            photo: null,
            feesStructure: {
                tuitionFee: 7500,
                libraryFee: 500,
                sportsFee: 300,
                examFee: 200,
                total: 8500
            }
        }
    ],
    'school_002': [
        {
            id: 'STU004',
            name: 'Ananya Singh',
            email: 'ananya.singh@student.com',
            phone: '+91-9876543218',
            class: '11',
            section: 'A',
            rollNumber: '301',
            dateOfBirth: '2007-12-05',
            gender: 'Female',
            address: '987 Education Boulevard, Education Town',
            guardianName: 'Dr. Amit Singh',
            guardianPhone: '+91-9876543219',
            admissionDate: '2023-04-01',
            photo: null,
            feesStructure: {
                tuitionFee: 12000,
                libraryFee: 600,
                sportsFee: 400,
                examFee: 300,
                total: 13300
            }
        },
        {
            id: 'STU005',
            name: 'Karan Mehta',
            email: 'karan.mehta@student.com',
            phone: '+91-9876543220',
            class: '12',
            section: 'B',
            rollNumber: '401',
            dateOfBirth: '2006-09-18',
            gender: 'Male',
            address: '147 Future Street, Education Town',
            guardianName: 'Mrs. Kavita Mehta',
            guardianPhone: '+91-9876543221',
            admissionDate: '2022-04-01',
            photo: null,
            feesStructure: {
                tuitionFee: 15000,
                libraryFee: 700,
                sportsFee: 500,
                examFee: 400,
                total: 16600
            }
        }
    ]
};

// Demo Teachers Data
const DEMO_TEACHERS = {
    'school_001': [
        {
            id: 'TEA001',
            name: 'Prof. Sunita Agarwal',
            email: 'sunita.agarwal@starpublic.edu',
            phone: '+91-9876543222',
            subject: 'Mathematics',
            classes: ['9', '10'],
            experience: '15 years',
            qualification: 'M.Sc Mathematics, B.Ed',
            joinDate: '2020-06-01'
        },
        {
            id: 'TEA002',
            name: 'Dr. Ramesh Kumar',
            email: 'ramesh.kumar@starpublic.edu',
            phone: '+91-9876543223',
            subject: 'Science',
            classes: ['8', '9', '10'],
            experience: '20 years',
            qualification: 'Ph.D Physics, M.Sc Physics, B.Ed',
            joinDate: '2018-04-01'
        }
    ],
    'school_002': [
        {
            id: 'TEA003',
            name: 'Mrs. Meera Reddy',
            email: 'meera.reddy@brightfuture.edu',
            phone: '+91-9876543224',
            subject: 'English',
            classes: ['11', '12'],
            experience: '12 years',
            qualification: 'M.A English Literature, B.Ed',
            joinDate: '2021-07-01'
        }
    ]
};

// Demo Fees Data
const DEMO_FEES = {
    'school_001': {
        'STU001': {
            studentId: 'STU001',
            totalFees: 9000,
            paidAmount: 5000,
            dueAmount: 4000,
            payments: [
                {
                    id: 'PAY001',
                    amount: 5000,
                    date: '2024-01-15',
                    method: 'UPI',
                    transactionId: 'TXN123456',
                    receipt: 'REC001'
                }
            ],
            dueDate: '2024-02-15'
        },
        'STU002': {
            studentId: 'STU002',
            totalFees: 9000,
            paidAmount: 9000,
            dueAmount: 0,
            payments: [
                {
                    id: 'PAY002',
                    amount: 9000,
                    date: '2024-01-10',
                    method: 'Bank Transfer',
                    transactionId: 'TXN123457',
                    receipt: 'REC002'
                }
            ],
            dueDate: null
        },
        'STU003': {
            studentId: 'STU003',
            totalFees: 8500,
            paidAmount: 2000,
            dueAmount: 6500,
            payments: [
                {
                    id: 'PAY003',
                    amount: 2000,
                    date: '2024-01-20',
                    method: 'Cash',
                    transactionId: null,
                    receipt: 'REC003'
                }
            ],
            dueDate: '2024-02-20'
        }
    },
    'school_002': {
        'STU004': {
            studentId: 'STU004',
            totalFees: 13300,
            paidAmount: 13300,
            dueAmount: 0,
            payments: [
                {
                    id: 'PAY004',
                    amount: 13300,
                    date: '2024-01-05',
                    method: 'UPI',
                    transactionId: 'TXN123458',
                    receipt: 'REC004'
                }
            ],
            dueDate: null
        },
        'STU005': {
            studentId: 'STU005',
            totalFees: 16600,
            paidAmount: 8000,
            dueAmount: 8600,
            payments: [
                {
                    id: 'PAY005',
                    amount: 8000,
                    date: '2024-01-12',
                    method: 'Card',
                    transactionId: 'TXN123459',
                    receipt: 'REC005'
                }
            ],
            dueDate: '2024-02-12'
        }
    }
};

// Demo Attendance Data
const DEMO_ATTENDANCE = {
    'school_001': {
        '2024-01-15': {
            'STU001': { status: 'present', time: '09:30' },
            'STU002': { status: 'present', time: '09:25' },
            'STU003': { status: 'absent', reason: 'Sick' }
        },
        '2024-01-16': {
            'STU001': { status: 'present', time: '09:35' },
            'STU002': { status: 'present', time: '09:20' },
            'STU003': { status: 'present', time: '09:40' }
        },
        '2024-01-17': {
            'STU001': { status: 'present', time: '09:30' },
            'STU002': { status: 'absent', reason: 'Family function' },
            'STU003': { status: 'present', time: '09:45' }
        }
    },
    'school_002': {
        '2024-01-15': {
            'STU004': { status: 'present', time: '08:30' },
            'STU005': { status: 'present', time: '08:25' }
        },
        '2024-01-16': {
            'STU004': { status: 'present', time: '08:35' },
            'STU005': { status: 'absent', reason: 'Medical appointment' }
        }
    }
};

// Initialize demo data in localStorage if in demo mode
function initializeDemoData() {
    if (DEMO_MODE) {
        localStorage.setItem('demoSchools', JSON.stringify(DEMO_SCHOOLS));
        localStorage.setItem('demoStudents', JSON.stringify(DEMO_STUDENTS));
        localStorage.setItem('demoTeachers', JSON.stringify(DEMO_TEACHERS));
        localStorage.setItem('demoFees', JSON.stringify(DEMO_FEES));
        localStorage.setItem('demoAttendance', JSON.stringify(DEMO_ATTENDANCE));
        
        console.log('Demo data initialized');
    }
}

// Get demo data from localStorage
function getDemoData(type) {
    if (!DEMO_MODE) return null;
    
    const data = localStorage.getItem(`demo${type}`);
    return data ? JSON.parse(data) : null;
}

// Save demo data to localStorage
function saveDemoData(type, data) {
    if (!DEMO_MODE) return false;
    
    localStorage.setItem(`demo${type}`, JSON.stringify(data));
    return true;
}

// Generate unique ID
function generateId(prefix = '') {
    return prefix + Date.now() + Math.random().toString(36).substr(2, 9);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideInNotification 0.3s ease-out;
                max-width: 300px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            
            .notification.success {
                background: linear-gradient(135deg, #10b981, #059669);
            }
            
            .notification.error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
            }
            
            .notification.info {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            @keyframes slideInNotification {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInNotification 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize demo data on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDemoData();
});

// Export for global use
window.firebaseConfig = firebaseConfig;
window.DEMO_MODE = DEMO_MODE;
window.DEMO_SCHOOLS = DEMO_SCHOOLS;
window.generateId = generateId;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.showNotification = showNotification;
window.getDemoData = getDemoData;
window.saveDemoData = saveDemoData;