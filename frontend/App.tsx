
import React, { useState } from 'react';
import { Role, User, View } from './types';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

// View Imports
import StudentDashboard from './views/student/StudentDashboard';
import StudentAppointments from './views/student/StudentAppointments';
import StudentPayments from './views/student/StudentPayments';
import StudentProfile from './views/student/StudentProfile';

import TeacherDashboard from './views/teacher/TeacherDashboard';
import TeacherCalendar from './views/teacher/TeacherCalendar';
import TeacherCourses from './views/teacher/TeacherCourses';
import TeacherEarnings from './views/teacher/TeacherEarnings';
import TeacherProfile from './views/teacher/TeacherProfile';

import AdminDashboard from './views/admin/AdminDashboard';
import AdminUsers from './views/admin/AdminUsers';
import AdminApprovals from './views/admin/AdminApprovals';
import AdminLessons from './views/admin/AdminLessons';
import AdminReports from './views/admin/AdminReports';
import AdminFinancialManagement from './views/admin/AdminFinancialManagement';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<View>(View.LOGIN);

    // AUTH HANDLERS
    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);

        // Redirect to appropriate dashboard based on role
        if (user.role === Role.STUDENT) setCurrentView(View.STUDENT_SEARCH);
        else if (user.role === Role.TEACHER) setCurrentView(View.TEACHER_DASHBOARD);
        else if (user.role === Role.ADMIN) setCurrentView(View.ADMIN_DASHBOARD);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView(View.LOGIN);
    };

    // ROUTING
    const renderView = () => {
        // 1. Public Views (Auth)
        if (!currentUser) {
            if (currentView === View.REGISTER) {
                return <RegisterForm
                    onRegisterSuccess={() => setCurrentView(View.LOGIN)}
                    onSwitchToLogin={() => setCurrentView(View.LOGIN)}
                />;
            }
            // Default to login
            return <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setCurrentView(View.REGISTER)}
            />;
        }

        // 2. Protected Views
        switch (currentView) {
            // Student Views
            case View.STUDENT_SEARCH:
                return <StudentDashboard studentId={currentUser.id} onAppointmentCreated={() => setCurrentView(View.STUDENT_APPOINTMENTS)} />;
            case View.STUDENT_APPOINTMENTS:
                return <StudentAppointments studentId={currentUser.id} />;
            case View.STUDENT_PAYMENTS:
                return <StudentPayments studentId={currentUser.id} />;
            case View.STUDENT_PROFILE:
                return <StudentProfile student={currentUser as any} />;

            // Teacher Views
            case View.TEACHER_DASHBOARD:
                return <TeacherDashboard teacherId={currentUser.id} />;
            case View.TEACHER_CALENDAR:
                return <TeacherCalendar teacherId={currentUser.id} />;
            case View.TEACHER_COURSES:
                return <TeacherCourses teacherId={currentUser.id} />;
            case View.TEACHER_EARNINGS:
                return <TeacherEarnings teacherId={currentUser.id} />;
            case View.TEACHER_PROFILE:
                return <TeacherProfile teacher={currentUser as any} />;

            // Admin Views
            case View.ADMIN_DASHBOARD:
                return <AdminDashboard />;
            case View.ADMIN_USERS:
                return <AdminUsers />;
            case View.ADMIN_APPROVALS:
                return <AdminApprovals />;
            case View.ADMIN_LESSONS:
                return <AdminLessons />;
            case View.ADMIN_REPORTS:
                return <AdminReports />;
            case View.ADMIN_FINANCIAL_MANAGEMENT:
                return <AdminFinancialManagement />;

            default:
                return <div>Sayfa bulunamadı</div>;
        }
    };

    // Wrap protected views in Layout, but Auth views take full screen
    if (!currentUser) {
        return renderView();
    }

    return (
        <Layout
            currentUser={currentUser}
            currentView={currentView}
            onChangeView={setCurrentView}
            onLogout={handleLogout}
        >
            {renderView()}
        </Layout>
    );
};

export default App;
