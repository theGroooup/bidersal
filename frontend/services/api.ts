
import axios from 'axios';
import { Role, AccountStatus } from '../types';

const API_URL = 'http://localhost:3001/api';
const api = axios.create({ baseURL: API_URL });

export const login = async (e: string, p: string, r: Role) => (await api.post('/login', { email: e, password: p, role: r })).data;
export const register = async (d: any) => (await api.post('/register', d)).data;

// Student
export const fetchOfferings = async () => (await api.get('/offerings')).data;
export const fetchSubjects = async () => (await api.get('/subjects')).data;
export const createAppointment = async (d: any) => (await api.post('/appointments', d)).data;
export const fetchStudentAppointments = async (id: number) => (await api.get(`/appointments/student/${id}`)).data;
export const fetchStudentPayments = async (id: number) => {
    const res = await fetch(`${API_URL}/payments/student/${id}`);
    return res.json();
};

export const payPayment = async (paymentId: number) => {
    const res = await fetch(`${API_URL}/payments/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
    });
    return res.json();
};
export const updateStudentProfile = async (id: number, d: any) => (await api.put(`/student/${id}`, d)).data;
export const fetchStudentProfile = async (id: number) => (await api.get(`/student/${id}`)).data;
export const addReview = async (data: { teacherId: number, studentId: number, rating: number, comment: string, appointmentId: number }) => {
    const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json();
        throw { response: { data: err } };
    }
    return res.json();
};

// Teacher
export const fetchTeacherAppointments = async (id: number) => (await api.get(`/appointments/teacher/${id}`)).data;
export const updateAppointmentStatus = async (id: number, status: string) => (await api.put(`/appointments/${id}/status`, { status })).data;
export const fetchTeacherCourses = async (id: number) => (await api.get(`/teacher/${id}/courses`)).data;
export const addTeacherCourse = async (d: any) => (await api.post('/teacher/courses', d)).data;
export const deleteTeacherCourse = async (id: number) => (await api.delete(`/teacher/courses/${id}`)).data;
export const fetchTeacherPayments = async (id: number) => (await api.get(`/payments/teacher/${id}`)).data;
export const updateTeacherProfile = async (id: number, d: any) => (await api.put(`/teacher/${id}`, d)).data;
export const fetchTeacherProfile = async (id: number) => (await api.get(`/teacher/${id}`)).data;
export const fetchTeacherAvailability = async (id: number) => (await api.get(`/teacher/${id}/availability`)).data;
export const fetchTeacherBusySlots = async (id: number) => (await api.get(`/teacher/${id}/busy-slots`)).data;
export const updateTeacherAvailability = async (d: any) => (await api.post('/teacher/availability', d)).data;

// Admin
export const fetchAllUsers = async () => (await api.get('/admin/users')).data;
export const updateUserStatus = async (id: number, role: Role, status: AccountStatus) => (await api.put(`/users/${id}/status`, { role, status })).data;
export const fetchPendingTeachers = async () => (await api.get('/teachers/pending')).data;
export const verifyTeacher = async (id: number, verified: boolean) => (await api.put(`/teachers/${id}/verify`, { verified })).data;
