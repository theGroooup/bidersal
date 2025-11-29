
import React, { useState, useEffect } from 'react';
import { fetchTeacherCourses, addTeacherCourse, deleteTeacherCourse, fetchSubjects } from '../../services/api';
import { TeacherOffering, Subject } from '../../types';
import { Trash2, Plus } from 'lucide-react';

const TeacherCourses: React.FC<{ teacherId: number }> = ({ teacherId }) => {
    const [offerings, setOfferings] = useState<TeacherOffering[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newC, setNewC] = useState({ subjectId: 1, hourlyRate: 0 });

    const load = () => {
        fetchTeacherCourses(teacherId).then(setOfferings);
        fetchSubjects().then(setSubjects);
    };
    useEffect(load, [teacherId]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await addTeacherCourse({ teacherId, ...newC });
        setIsAdding(false);
        load();
    };

    const handleDelete = async (id: number) => {
        await deleteTeacherCourse(id);
        load();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between"><h2 className="text-2xl font-bold">Derslerim</h2><button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 text-white px-4 py-2 rounded"><Plus size={18}/></button></div>
            {isAdding && (
                <form onSubmit={handleAdd} className="bg-indigo-50 p-4 rounded flex gap-4 items-end">
                    <div className="flex-1"><label className="text-xs block font-bold">Ders</label><select value={newC.subjectId} onChange={e=>setNewC({...newC, subjectId: Number(e.target.value)})} className="w-full p-2 rounded">{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="w-32"><label className="text-xs block font-bold">Ücret</label><input type="number" value={newC.hourlyRate} onChange={e=>setNewC({...newC, hourlyRate: Number(e.target.value)})} className="w-full p-2 rounded"/></div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Ekle</button>
                </form>
            )}
            <div className="grid grid-cols-3 gap-4">
                {offerings.map(o => (
                    <div key={o.id} className="bg-white p-4 rounded shadow-sm border flex justify-between items-center">
                        <div><h3 className="font-bold">{o.subjectName}</h3><p className="text-gray-500">{o.category}</p><p className="text-green-600 font-bold">{o.hourlyRate} ₺</p></div>
                        <button onClick={() => handleDelete(o.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default TeacherCourses;
