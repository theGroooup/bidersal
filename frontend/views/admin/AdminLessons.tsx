import React, { useState, useEffect } from 'react';
import { Subject } from '../../types';

const AdminLessons: React.FC = () => {
    const [lessons, setLessons] = useState<Subject[]>([]);
    const [formData, setFormData] = useState({ name: '', category: '', level: '' });

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        const res = await fetch('http://localhost:3001/api/subjects');
        const data = await res.json();
        setLessons(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('http://localhost:3001/api/admin/lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setFormData({ name: '', category: '', level: '' });
        fetchLessons();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu dersi silmek istediğinize emin misiniz?')) return;
        await fetch(`http://localhost:3001/api/admin/lessons/${id}`, { method: 'DELETE' });
        fetchLessons();
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Ders Yönetimi</h2>

            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-4 gap-4">
                <input
                    type="text" placeholder="Ders Adı" required
                    className="border p-2 rounded"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    type="text" placeholder="Kategori" required
                    className="border p-2 rounded"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                />
                <input
                    type="text" placeholder="Seviye"
                    className="border p-2 rounded"
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Ekle</button>
            </form>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Ders Adı</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.map(lesson => (
                            <tr key={lesson.id} className="border-t">
                                <td className="p-4">{lesson.id}</td>
                                <td className="p-4">{lesson.name}</td>
                                <td className="p-4">{lesson.category}</td>
                                <td className="p-4">
                                    <button onClick={() => handleDelete(lesson.id)} className="text-red-600 hover:text-red-800">Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLessons;
