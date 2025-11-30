import React, { useState, useEffect } from 'react';
import { TeacherOffering } from '../../types';
import { fetchTeacherAvailability, fetchTeacherBusySlots, createAppointment } from '../../services/api';
import { X, ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay, parseISO, addHours, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AppointmentModalProps {
    offering: TeacherOffering;
    studentId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ offering, studentId, onClose, onSuccess }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [availability, setAvailability] = useState<any[]>([]);
    const [busySlots, setBusySlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTeacherAvailability(offering.teacherId).then(setAvailability);
        fetchTeacherBusySlots(offering.teacherId).then(setBusySlots);
    }, [offering.teacherId]);

    const generateSlots = () => {
        const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay(); // 1=Mon, 7=Sun
        const dayAvail = availability.find(a => a.gun_no === dayOfWeek);

        if (!dayAvail) return [];

        const startHour = parseInt(dayAvail.baslangic_saati);
        const endHour = parseInt(dayAvail.bitis_saati);
        const slots = [];

        for (let h = startHour; h < endHour; h++) {
            const slotStart = new Date(selectedDate);
            slotStart.setHours(h, 0, 0, 0);

            // Check if slot is busy
            const isBusy = busySlots.some(busy => {
                const busyStart = new Date(busy.date);
                const busyEnd = addHours(busyStart, busy.duration / 60);
                const slotEnd = addHours(slotStart, 1);

                // Simple overlap check
                return (slotStart < busyEnd && slotEnd > busyStart);
            });

            // Check if slot is in the past
            const isPast = slotStart < new Date();

            if (!isBusy && !isPast) {
                slots.push(`${h.toString().padStart(2, '0')}:00`);
            }
        }
        return slots;
    };

    const handleConfirm = async () => {
        if (!selectedSlot) return;
        setLoading(true);
        try {
            const [hours, minutes] = selectedSlot.split(':').map(Number);
            const date = new Date(selectedDate);
            date.setHours(hours, minutes, 0, 0);
            // Adjust for timezone offset to ensure ISO string is correct for backend
            // Or simply send local ISO and handle in backend. Here we use simple ISO.
            // Actually, let's keep it simple: create a date object and send ISO.
            // Note: Date.toISOString() converts to UTC. If backend expects UTC, good.
            // If backend expects local time, we might need adjustment. 
            // Assuming backend stores timestamp or handles UTC.
            // Let's manually construct a local ISO string to avoid confusion if needed, 
            // but standard ISO is usually best.
            // However, to match "2024-11-28T10:00:00" format often used in simple apps:
            const offset = date.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);

            await createAppointment({
                studentId,
                offeringId: offering.id,
                date: localISOTime
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Randevu oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const slots = generateSlots();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">Randevu Oluştur</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <h4 className="font-bold text-gray-800 mb-2">{offering.subjectName}</h4>
                        <p className="text-sm text-gray-500">{offering.teacherName} {offering.teacherSurname}</p>
                        <p className="text-indigo-600 font-bold mt-1">{offering.hourlyRate} ₺ / Saat</p>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tarih Seçin</label>
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                            <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} disabled={isSameDay(selectedDate, startOfToday())} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronLeft size={20} /></button>
                            <div className="flex items-center font-medium text-gray-700">
                                <Calendar size={16} className="mr-2 text-indigo-500" />
                                {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
                            </div>
                            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1 hover:bg-gray-200 rounded"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    {/* Slot Selection */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Saat Seçin</label>
                        {slots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {slots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-2 px-1 rounded text-sm font-medium transition-colors border ${selectedSlot === slot ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'}`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-500 text-sm">
                                <Clock className="mx-auto mb-2 opacity-50" size={24} />
                                Bu tarihte uygun saat bulunmuyor.
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!selectedSlot || loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        {loading ? 'İşleniyor...' : 'Randevuyu Onayla'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;
