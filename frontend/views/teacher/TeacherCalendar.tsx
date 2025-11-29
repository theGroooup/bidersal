
import React, { useState, useEffect } from 'react';
import { fetchTeacherAppointments, fetchTeacherAvailability, updateTeacherAvailability } from '../../services/api';
import { Appointment } from '../../types';
import { format, startOfISOWeek, addDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Clock, Save } from 'lucide-react';

const TeacherCalendar: React.FC<{ teacherId: number }> = ({ teacherId }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [availability, setAvailability] = useState<any[]>([]);
    const [currentDate] = useState(new Date());
    
    // Edit Availability State
    const [editDay, setEditDay] = useState(1);
    const [editStart, setEditStart] = useState('09:00');
    const [editEnd, setEditEnd] = useState('17:00');

    useEffect(() => { 
        fetchTeacherAppointments(teacherId).then(setAppointments);
        loadAvailability();
    }, [teacherId]);

    const loadAvailability = () => fetchTeacherAvailability(teacherId).then(setAvailability);

    const handleSaveAvailability = async () => {
        await updateTeacherAvailability({ teacherId, day: editDay, start: editStart, end: editEnd });
        loadAvailability();
        alert('Saatler güncellendi');
    };

    const weekStart = startOfISOWeek(currentDate);
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 13 }).map((_, i) => i + 9); // 09:00 - 21:00

    const getDayName = (i: number) => ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'][i-1];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Takvim & Müsaitlik</h2>
            </div>

            {/* Availability Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Gün</label>
                    <select value={editDay} onChange={e => setEditDay(Number(e.target.value))} className="border rounded p-2 text-sm">
                        {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{getDayName(d)}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Başlangıç</label>
                    <input type="time" value={editStart} onChange={e => setEditStart(e.target.value)} className="border rounded p-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Bitiş</label>
                    <input type="time" value={editEnd} onChange={e => setEditEnd(e.target.value)} className="border rounded p-2 text-sm" />
                </div>
                <button onClick={handleSaveAvailability} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm flex items-center hover:bg-indigo-700">
                    <Save size={16} className="mr-2"/> Kaydet
                </button>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
                {availability.map(a => (
                    <div key={a.calisma_saati_id} className="bg-green-50 text-green-800 text-xs px-3 py-1 rounded-full border border-green-200">
                        {getDayName(a.gun_no)}: {a.baslangic_saati.slice(0,5)} - {a.bitis_saati.slice(0,5)}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="min-w-[600px]">
                    <div className="grid grid-cols-8 bg-gray-50 border-b">
                        <div className="p-4 text-center font-bold text-gray-500">Saat</div>
                        {days.map((d, i) => <div key={i} className="p-4 text-center font-bold text-gray-700">{format(d, 'EEE')} <br/> {format(d, 'd')}</div>)}
                    </div>
                    {hours.map(h => (
                        <div key={h} className="grid grid-cols-8 border-b h-16">
                            <div className="p-2 text-center text-gray-400 text-sm border-r pt-4">{h}:00</div>
                            {days.map((d, i) => {
                                const apt = appointments.find(a => isSameDay(new Date(a.date), d) && new Date(a.date).getHours() === h && a.status === 'Planlandı');
                                // Check availability
                                const dayAvail = availability.find(av => av.gun_no === (i+1));
                                const isAvailable = dayAvail && h >= parseInt(dayAvail.baslangic_saati) && h < parseInt(dayAvail.bitis_saati);

                                return (
                                    <div key={i} className={`border-r p-1 ${!isAvailable ? 'bg-gray-50' : ''}`}>
                                        {apt && <div className="bg-indigo-100 text-indigo-800 text-xs p-1 rounded h-full overflow-hidden">{apt.studentName}</div>}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default TeacherCalendar;
