# National School Manager

A complete multi-school academic management system built with HTML, CSS, JavaScript, and Firebase. This system allows multiple schools to manage their academic and administrative operations digitally while providing you (the platform owner) with subscription-based revenue.

## 🚀 Features

### For Platform Owner (Super Admin)
- **School Management**: View, approve, and manage all registered schools
- **Subscription Management**: Monitor monthly/yearly subscriptions (₹500/month, ₹5000/year)
- **Revenue Analytics**: Track income, subscription trends, and growth metrics
- **User Management**: Oversee all platform users across schools
- **Platform Settings**: Configure pricing, features, and notifications

### For School Admins
- **Student Management**: Complete admission system with digital records
- **Attendance Tracking**: Daily attendance marking and history
- **Fee Management**: Khatabook-style fee collection and tracking
- **Teacher Management**: Staff records and subject assignments
- **Exam & Results**: Test creation, mark entry, and result generation
- **Academic Calendar**: Events, holidays, and important dates
- **Study Materials**: Upload and manage educational content

### For Teachers
- **Class Management**: View assigned classes and subjects
- **Attendance**: Mark and track student attendance
- **Gradebook**: Enter test scores and assignments
- **Student Progress**: Monitor individual student performance

### For Students
- **Academic Records**: View attendance, grades, and assignments
- **Fee Status**: Check payment history and pending amounts
- **Study Materials**: Access uploaded course content
- **Announcements**: Receive school notifications

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (Authentication, Realtime Database, Storage)
- **UI Framework**: Custom CSS with modern design principles
- **Charts**: Chart.js for analytics
- **Icons**: Font Awesome
- **Responsive**: Mobile-first design

## 📋 Demo Credentials

### Super Admin (Platform Owner)
- **Email**: `admin@nationalschool.com`
- **Password**: `admin123`
- **Role**: Super Admin

### School Admin - Star Public School
- **Email**: `admin@starpublic.edu`
- **Password**: `school123`
- **Role**: School Admin

### School Admin - Bright Future Academy
- **Email**: `admin@brightfuture.edu`
- **Password**: `school123`
- **Role**: School Admin

### Teacher
- **Email**: `meera@starpublic.edu`
- **Password**: `teacher123`
- **Role**: Teacher

### Student
- **Email**: `rahul@example.com`
- **Password**: `student123`
- **Role**: Student

## 🚀 Quick Start

1. **Clone/Download** this project to your local machine

2. **Open in Browser**: Simply open `index.html` in any modern web browser

3. **Demo Mode**: The app runs in demo mode using localStorage, so no Firebase setup is required for testing

4. **Login**: Use any of the demo credentials above to explore different user roles

## 💰 Business Model

### Revenue Streams
- **Monthly Subscriptions**: ₹200 first month, then ₹1000/month per school
- **Yearly Subscriptions**: ₹11,500/year per school (4% discount)
- **Potential Add-ons**: Custom branding, advanced analytics, premium support

### Target Market
- Private schools and coaching institutes
- Educational institutions looking to digitize operations
- Schools wanting to replace paper-based systems

## 🔧 Production Setup

### Firebase Configuration

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Authentication, Realtime Database, and Storage

2. **Update Config**:
   - Replace the config in `firebase-config.js` with your actual Firebase config
   - Set `DEMO_MODE = false` in `firebase-config.js`

3. **Database Rules**:
   ```javascript
   {
     "rules": {
       "schools": {
         "$schoolId": {
           ".read": "auth != null && (auth.uid == $schoolId || root.child('users').child(auth.uid).child('role').val() == 'super_admin')",
           ".write": "auth != null && (auth.uid == $schoolId || root.child('users').child(auth.uid).child('role').val() == 'super_admin')"
         }
       },
       "users": {
         ".read": "auth != null",
         ".write": "auth != null"
       }
     }
   }
   ```

4. **Deploy**:
   - Use Firebase Hosting: `firebase deploy`
   - Or any web hosting service

### Payment Integration

To enable real payments, integrate with:
- **Razorpay** (recommended for India)
- **Stripe** (international)
- **PayPal**
- **UPI/QR payments**

## 📱 Features Breakdown

### Student Management
- Complete admission form with photo upload
- Class and section organization
- Guardian contact information
- Academic history tracking
- Fee structure assignment

### Attendance System
- Daily class-wise attendance
- Present/Absent marking
- Attendance history and reports
- Parent notifications for absences

### Fee Management
- Monthly/quarterly/yearly fee structures
- Payment tracking and receipts
- Due date management
- Overdue alerts
- Payment method flexibility

### Academic Management
- Subject and syllabus tracking
- Test and exam creation
- Mark entry and grade calculation
- Progress reports
- Academic calendar

### Communication
- Announcements and notifications
- Parent-teacher messaging
- Event management
- Holiday calendar

## 🎯 Monetization Strategy

1. **Freemium Model**: Offer 30-day free trial
2. **Tiered Pricing**: Basic, Standard, Premium plans
3. **Volume Discounts**: Discounts for multiple schools
4. **Add-on Services**: Custom development, training, support
5. **White Labeling**: Branded solutions for larger clients

## 📊 Potential Revenue

**Conservative Estimates**:
- 50 schools × ₹1000/month = ₹50,000/month
- 100 schools × ₹1000/month = ₹1,00,000/month
- 500 schools × ₹1000/month = ₹5,00,000/month

**Optimistic Scenario** (mix of monthly/yearly):
- 200 monthly (₹1000) + 100 yearly (₹11,500) = ₹2,95,833/month average

## 🚀 Future Enhancements

- **Mobile App**: React Native or Flutter app
- **AI Features**: Auto-attendance via facial recognition
- **Advanced Analytics**: Predictive analytics for student performance
- **Parent App**: Dedicated app for parents
- **Online Exams**: Integrated exam system
- **Video Classes**: Virtual classroom integration
- **Transport Management**: Bus tracking and routes

## 📞 Support

For questions or support:
- Email: support@nationalschool.com
- Phone: +91-XXXXXXXXXX

## 📄 License

This project is proprietary software. All rights reserved.

---

**Ready to launch your EdTech business? Start with our demo and scale to thousands of schools!** 🎓💼