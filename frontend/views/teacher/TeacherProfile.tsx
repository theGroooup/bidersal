import React, { useState, useEffect } from 'react';
import { Teacher } from '../../types';
import { updateTeacherProfile, fetchTeacherProfile } from '../../services/api';
import { Save } from 'lucide-react';

const TeacherProfile: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        university: '',
        department: '',
        profession: '',
        bio: '',
        birthDate: '',
        gender: '',
        documentUrl: ''
    });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchTeacherProfile(teacher.id).then((data) => {
            setFormData({
                name: data.name || '',
                surname: data.surname || '',
                phone: data.phone || '',
                university: data.university || '',
                department: data.department || '',
                profession: data.profession || '',
                bio: data.bio || '',
                birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
                gender: data.gender || '',
                documentUrl: data.documentUrl || ''
            });
        }).catch(err => {
            console.error(err);
            setMsg('Profil bilgileri yüklenemedi. Lütfen sayfayı yenileyin veya sunucuyu kontrol edin.');
        });
    }, [teacher.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateTeacherProfile(teacher.id, formData);
        setMsg('Güncellendi');
        setTimeout(() => setMsg(''), 3000);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        const data = new FormData();
        data.append('document', file);

        const API_BASE_URL = 'http://localhost:3001'; // Should be in a config file in real app
        const res = await fetch(`${API_BASE_URL}/api/teacher/${teacher.id}/upload-document`, {
            method: 'POST',
            body: data
        });
        const json = await res.json();
        if (json.success) {
            setFormData({ ...formData, documentUrl: json.fileUrl });
            setMsg('Belge yüklendi');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Profil</h2>{msg && <span className="text-green-600">{msg}</span>}</div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm mb-1">Ad</label><input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm mb-1">Soyad</label><input value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm mb-1">Üniversite</label><input value={formData.university} onChange={e => setFormData({ ...formData, university: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Bölüm</label><input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Meslek</label><input value={formData.profession} onChange={e => setFormData({ ...formData, profession: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label><input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full border p-2 rounded" /></div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cinsiyet</label>
                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full border p-2 rounded">
                        <option value="">Seçiniz</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                    </select>
                </div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Biyografi</label><textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full border p-2 rounded h-24" /></div>

                <div className="md:col-span-2 border-t pt-4 mt-4">
                    <label className="block text-sm font-bold mb-2">Doğrulama Belgesi</label>
                    <div className="flex items-center gap-4">
                        <input type="file" onChange={handleUpload} className="border p-2 rounded" />
                        {formData.documentUrl && (
                            <a href={`http://localhost:3001${formData.documentUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                Yüklü Belgeyi Görüntüle
                            </a>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Diploma veya sertifikanızı yükleyin (PDF/Resim).</p>
                </div>

                <div className="md:col-span-2 mt-4"><button className="bg-indigo-600 text-white px-6 py-2 rounded flex items-center"><Save size={18} className="mr-2" /> Kaydet</button></div>
            </form>
        </div>
    );
};
export default TeacherProfile;
