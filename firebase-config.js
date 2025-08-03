// Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Demo mode - using localStorage for demo purposes
// In production, replace with actual Firebase config
const DEMO_MODE = true;

if (DEMO_MODE) {
    console.log("Running in demo mode - using localStorage");
    
    // Initialize demo data
    if (!localStorage.getItem('demoData')) {
        const demoData = {
            schools: {
                'school_001': {
                    name: 'Star Public School',
                    adminEmail: 'admin@starpublic.edu',
                    phone: '+91-9876543210',
                    address: '123 Education Street, Delhi, India',
                    subscription: {
                        plan: 'yearly',
                        status: 'active',
                        expiryDate: '2025-12-31',
                        amount: 5000
                    },
                    students: {
                        'std_001': {
                            id: 'STD001',
                            name: 'Rahul Sharma',
                            class: '10',
                            section: 'A',
                            rollNo: '001',
                            dob: '2008-05-15',
                            gender: 'Male',
                            phone: '+91-9876543211',
                            email: 'rahul@example.com',
                            guardianName: 'Mr. Suresh Sharma',
                            guardianPhone: '+91-9876543212',
                            address: '456 Student Lane, Delhi',
                            admissionDate: '2023-04-01',
                            fees: {
                                monthly: 2000,
                                paid: 16000,
                                due: 4000,
                                lastPayment: '2024-11-01'
                            }
                        },
                        'std_002': {
                            id: 'STD002',
                            name: 'Priya Patel',
                            class: '10',
                            section: 'A',
                            rollNo: '002',
                            dob: '2008-08-22',
                            gender: 'Female',
                            phone: '+91-9876543213',
                            email: 'priya@example.com',
                            guardianName: 'Mr. Rajesh Patel',
                            guardianPhone: '+91-9876543214',
                            address: '789 Student Road, Delhi',
                            admissionDate: '2023-04-01',
                            fees: {
                                monthly: 2000,
                                paid: 20000,
                                due: 0,
                                lastPayment: '2024-12-01'
                            }
                        },
                        'std_003': {
                            id: 'STD003',
                            name: 'Amit Kumar',
                            class: '9',
                            section: 'B',
                            rollNo: '015',
                            dob: '2009-03-10',
                            gender: 'Male',
                            phone: '+91-9876543215',
                            email: 'amit@example.com',
                            guardianName: 'Mrs. Sunita Kumar',
                            guardianPhone: '+91-9876543216',
                            address: '321 Scholar Street, Delhi',
                            admissionDate: '2023-04-01',
                            fees: {
                                monthly: 1800,
                                paid: 14400,
                                due: 3600,
                                lastPayment: '2024-10-01'
                            }
                        }
                    },
                    teachers: {
                        'tcr_001': {
                            id: 'TCR001',
                            name: 'Dr. Meera Singh',
                            email: 'meera@starpublic.edu',
                            subject: 'Mathematics',
                            classes: ['9', '10'],
                            phone: '+91-9876543220'
                        },
                        'tcr_002': {
                            id: 'TCR002',
                            name: 'Mr. Arun Verma',
                            email: 'arun@starpublic.edu',
                            subject: 'Science',
                            classes: ['9', '10'],
                            phone: '+91-9876543221'
                        }
                    },
                    attendance: {
                        '2024-12-20': {
                            '10A': {
                                'std_001': { status: 'present', time: '09:00' },
                                'std_002': { status: 'present', time: '09:00' }
                            },
                            '9B': {
                                'std_003': { status: 'absent', time: '09:00' }
                            }
                        }
                    },
                    exams: {
                        'exam_001': {
                            name: 'Mid Term Exam',
                            class: '10',
                            subject: 'Mathematics',
                            date: '2024-12-25',
                            totalMarks: 100,
                            results: {
                                'std_001': { marks: 85, grade: 'A' },
                                'std_002': { marks: 92, grade: 'A+' }
                            }
                        }
                    }
                },
                'school_002': {
                    name: 'Bright Future Academy',
                    adminEmail: 'admin@brightfuture.edu',
                    phone: '+91-9876543230',
                    address: '456 Knowledge Park, Mumbai, India',
                    subscription: {
                        plan: 'monthly',
                        status: 'active',
                        expiryDate: '2025-01-20',
                        amount: 500
                    },
                    students: {
                        'std_004': {
                            id: 'STD004',
                            name: 'Sneha Reddy',
                            class: '8',
                            section: 'A',
                            rollNo: '010',
                            dob: '2010-12-05',
                            gender: 'Female',
                            phone: '+91-9876543231',
                            email: 'sneha@example.com',
                            guardianName: 'Mr. Venkat Reddy',
                            guardianPhone: '+91-9876543232',
                            address: '555 Academy Lane, Mumbai',
                            admissionDate: '2023-06-01',
                            fees: {
                                monthly: 1500,
                                paid: 10500,
                                due: 1500,
                                lastPayment: '2024-11-01'
                            }
                        }
                    },
                    teachers: {
                        'tcr_003': {
                            id: 'TCR003',
                            name: 'Ms. Kavita Nair',
                            email: 'kavita@brightfuture.edu',
                            subject: 'English',
                            classes: ['8', '9'],
                            phone: '+91-9876543235'
                        }
                    }
                }
            },
            users: {
                'super_admin': {
                    email: 'admin@nationalschool.com',
                    password: 'admin123',
                    role: 'super_admin',
                    name: 'Super Administrator'
                },
                'admin@starpublic.edu': {
                    email: 'admin@starpublic.edu',
                    password: 'school123',
                    role: 'school_admin',
                    schoolId: 'school_001',
                    name: 'Star Public Admin'
                },
                'admin@brightfuture.edu': {
                    email: 'admin@brightfuture.edu',
                    password: 'school123',
                    role: 'school_admin',
                    schoolId: 'school_002',
                    name: 'Bright Future Admin'
                },
                'meera@starpublic.edu': {
                    email: 'meera@starpublic.edu',
                    password: 'teacher123',
                    role: 'teacher',
                    schoolId: 'school_001',
                    teacherId: 'tcr_001',
                    name: 'Dr. Meera Singh'
                },
                'rahul@example.com': {
                    email: 'rahul@example.com',
                    password: 'student123',
                    role: 'student',
                    schoolId: 'school_001',
                    studentId: 'std_001',
                    name: 'Rahul Sharma'
                }
            }
        };
        
        localStorage.setItem('demoData', JSON.stringify(demoData));
    }
}

// Helper functions for demo mode
function getDemoData() {
    return JSON.parse(localStorage.getItem('demoData') || '{}');
}

function setDemoData(data) {
    localStorage.setItem('demoData', JSON.stringify(data));
}

function updateDemoData(path, value) {
    const data = getDemoData();
    const pathArray = path.split('/');
    let current = data;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) {
            current[pathArray[i]] = {};
        }
        current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    setDemoData(data);
}

// Export for use in other files
window.firebaseConfig = firebaseConfig;
window.auth = auth;
window.database = database;
window.storage = storage;
window.DEMO_MODE = DEMO_MODE;
window.getDemoData = getDemoData;
window.setDemoData = setDemoData;
window.updateDemoData = updateDemoData;