
// Enum Definitions
export enum Role {
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER',
    ADMIN = 'ADMIN'
}

export enum AppointmentStatus {
    PLANNED = 'Planlandı',
    COMPLETED = 'Tamamlandı',
    CANCELLED_STUDENT = 'Öğrenci İptal',
    CANCELLED_TEACHER = 'Öğretmen İptal',
    PENDING = 'Onay Bekliyor'
}

export enum PaymentStatus {
    PAID = 'Ödendi',
    PENDING = 'Bekleniyor',
    CANCELLED = 'İptal Edildi'
}

export enum AccountStatus {
    ACTIVE = 'aktif',
    SUSPENDED = 'askida'
}

// Database Models
export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: Role;
    avatarUrl?: string;
    accountStatus: AccountStatus;
    joinDate: string;
}

export interface Student extends User {
    grade?: string;
    phone: string;
}

export interface Teacher extends User {
    university: string;
    department: string;
    profession: string;
    isVerified: boolean;
    bio: string;
    hourlyRate?: number;
    rating: number;
    phone: string;
}

export interface Subject {
    id: number;
    name: string;
    category: string;
}

export interface TeacherOffering {
    id: number;
    teacherId: number;
    subjectId: number;
    hourlyRate: number;
    subjectName: string;
    category: string;
    teacherName: string;
    teacherSurname: string;
    university: string;
    rating?: number;
    bio?: string;
}

export interface Appointment {
    id: number;
    studentId: number;
    teacherId: number;
    offeringId: number;
    date: string;
    durationMinutes: number;
    status: AppointmentStatus;
    zoomLink?: string;
    studentName: string;
    teacherName: string;
    subjectName: string;
    price: number;
}

export interface Review {
    id: number;
    teacherId: number;
    studentId: number;
    rating: number;
    comment: string;
    date: string;
}

export interface Payment {
    id: number;
    appointmentId: number;
    studentId: number;
    teacherId: number;
    amount: number;
    status: PaymentStatus;
    date: string;
    subjectName: string;
}

// Navigation Types
export enum View {
    LOGIN = 'LOGIN',
    REGISTER = 'REGISTER',

    // Student
    STUDENT_SEARCH = 'STUDENT_SEARCH',
    STUDENT_APPOINTMENTS = 'STUDENT_APPOINTMENTS',
    STUDENT_PAYMENTS = 'STUDENT_PAYMENTS',
    STUDENT_PROFILE = 'STUDENT_PROFILE',

    // Teacher
    TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
    TEACHER_CALENDAR = 'TEACHER_CALENDAR',
    TEACHER_COURSES = 'TEACHER_COURSES',
    TEACHER_EARNINGS = 'TEACHER_EARNINGS',
    TEACHER_PROFILE = 'TEACHER_PROFILE',

    // Admin
    ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
    ADMIN_USERS = 'ADMIN_USERS',
    ADMIN_APPROVALS = 'ADMIN_APPROVALS',
    ADMIN_LESSONS = 'ADMIN_LESSONS',
    ADMIN_REPORTS = 'ADMIN_REPORTS',
    ADMIN_DISPUTES = 'ADMIN_DISPUTES'
}

export interface Teacher extends User {
    university: string;
    department: string;
    profession: string;
    isVerified: boolean;
    bio: string;
    hourlyRate?: number;
    rating: number;
    phone: string;
    documentUrl?: string;
    birthDate?: string;
    gender?: string;
}