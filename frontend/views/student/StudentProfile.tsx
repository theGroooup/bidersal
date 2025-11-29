import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { fetchStudentProfile, updateStudentProfile } from '../../services/api';
import { User as UserIcon, Save } from 'lucide-react';

const StudentProfile: React.FC<{ student: Student }> = ({ student }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        grade: '',
        email: '',
        birthDate: '',
        gender: ''
    });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchStudentProfile(student.id).then((data) => {
            setFormData({
                name: data.name || '',
                surname: data.surname || '',
                phone: data.phone || '',
                grade: data.grade || '',
                email: data.email || '',
                birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
                gender: data.gender || ''
            });
        });
    }, [student.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateStudentProfile(student.id, formData);
        setMsg('Kaydedildi!');
        setTimeout(() => setMsg(''), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Profil</h2>{msg && <span className="text-green-600">{msg}</span>}</div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700">Ad</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Soyad</label><input value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Telefon</label><input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Sınıf</label><input value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label><input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cinsiyet</label>
                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full border p-2 rounded">
                        <option value="">Seçiniz</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                    </select>
                </div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">E-posta (Değiştirilemez)</label><input value={formData.email} disabled className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed" /></div>
                <div className="md:col-span-2"><button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 flex items-center"><Save size={18} className="mr-2" /> Kaydet</button></div>
            </form>
        </div>
    );
};
export default StudentProfile;