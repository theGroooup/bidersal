import React, { useState, useEffect } from 'react';
import { TeacherOffering } from '../../types';
import { fetchOfferings, fetchSubjects } from '../../services/api';

import { Search, Filter, Star, Clock, CheckCircle } from 'lucide-react';
import AppointmentModal from './AppointmentModal';

const StudentDashboard: React.FC<{ studentId: number, onAppointmentCreated: () => void, onViewProfile: (id: number) => void }> = ({ studentId, onAppointmentCreated, onViewProfile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
    const [offerings, setOfferings] = useState<TeacherOffering[]>([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [selectedOffering, setSelectedOffering] = useState<TeacherOffering | null>(null);
    const [categories, setCategories] = useState<string[]>(['Tümü']);

    useEffect(() => {
        fetchSubjects().then((subjects: any[]) => {
            const uniqueCategories = Array.from(new Set(subjects.map((s: any) => s.category)));
            setCategories(['Tümü', ...uniqueCategories]);
        });
    }, []);

    useEffect(() => {
        fetchOfferings().then(setOfferings);
    }, []);

    // Client-side filtering
    const filteredOfferings = offerings.filter(o => {
        const matchesSearch = o.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) || o.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tümü' || o.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSuccess = () => {
        setSelectedOffering(null);
        setBookingSuccess(true);
        setTimeout(() => { setBookingSuccess(false); onAppointmentCreated(); }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Ders Ara</h2>
                <p className="text-gray-500">İstediğin alanda en iyi öğretmenleri bul.</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Ders veya öğretmen ara..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
                    <Filter className="text-gray-400" size={20} />
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOfferings.map(offering => (
                    <div key={offering.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md flex flex-col">
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <span className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded mb-2 inline-block">{offering.subjectName}</span>
                                    <h3 className="text-lg font-bold cursor-pointer hover:text-indigo-600" onClick={() => onViewProfile(offering.teacherId)}>{offering.teacherName} {offering.teacherSurname}</h3>
                                    <p className="text-sm text-gray-500">{offering.university}</p>
                                </div>
                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 h-fit"><Star size={14} className="fill-current mr-1" />{offering.rating || 0}</div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                <div className="text-indigo-600 font-bold text-lg">{offering.hourlyRate} ₺</div>
                                <div className="flex gap-2">
                                    <button onClick={() => onViewProfile(offering.teacherId)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Profili Gör</button>
                                    <button onClick={() => setSelectedOffering(offering)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center"><Clock size={16} className="mr-2" /> Randevu Al</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {bookingSuccess && <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-bounce"><CheckCircle className="mr-3" /><div><h4 className="font-bold">Başarılı!</h4><p className="text-sm">Randevu talebiniz iletildi.</p></div></div>}

            {selectedOffering && (
                <AppointmentModal
                    offering={selectedOffering}
                    studentId={studentId}
                    onClose={() => setSelectedOffering(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};
export default StudentDashboard;
