
import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { fetchStudentAppointments, updateAppointmentStatus, addReview } from '../../services/api';
import { Calendar, Video, XCircle, CheckCircle, Clock, Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const StudentAppointments: React.FC<{ studentId: number }> = ({ studentId }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [reviewModal, setReviewModal] = useState<{open: boolean, aptId: number | null, teacherId: number | null}>({open: false, aptId: null, teacherId: null});
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const load = () => fetchStudentAppointments(studentId).then(setAppointments);
    useEffect(() => { load(); }, [studentId]);

    const handleCancel = async (id: number) => {
        if(confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) {
            await updateAppointmentStatus(id, AppointmentStatus.CANCELLED_STUDENT);
            load();
        }
    };

    const openReview = (apt: any) => {
        setReviewModal({open: true, aptId: apt.id, teacherId: apt.teacherId});
        setRating(5);
        setComment('');
    }

    const submitReview = async () => {
        if(!reviewModal.teacherId) return;
        await addReview({
            teacherId: reviewModal.teacherId,
            studentId,
            rating,
            comment
        });
        setReviewModal({open: false, aptId: null, teacherId: null});
        alert('Değerlendirme gönderildi!');
    }

    const upcoming = appointments.filter(a => ['Planlandı', 'Onay Bekliyor'].includes(a.status));
    const past = appointments.filter(a => !['Planlandı', 'Onay Bekliyor'].includes(a.status));
    const displayList = tab === 'upcoming' ? upcoming : past;

    return (
        <div className="space-y-6 relative">
            <h2 className="text-2xl font-bold text-gray-800">Randevularım</h2>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button onClick={() => setTab('upcoming')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'upcoming' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Gelecek</button>
                <button onClick={() => setTab('past')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'past' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>Geçmiş</button>
            </div>
            <div className="space-y-4">
                {displayList.map(apt => (
                    <div key={apt.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <h4 className="text-lg font-bold">{apt.subjectName} - {apt.teacherName}</h4>
                            <div className="text-sm text-gray-500 mt-1">{format(new Date(apt.date), 'd MMMM yyyy, HH:mm')} • {apt.durationMinutes} dk • {apt.price} ₺</div>
                            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${apt.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{apt.status}</span>
                        </div>
                        <div className="flex space-x-2">
                            {(apt.status === 'Planlandı' || apt.status === 'Onay Bekliyor') && (
                                <button onClick={() => handleCancel(apt.id)} className="px-3 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm">İptal</button>
                            )}
                            {apt.status === 'Tamamlandı' && (
                                <button onClick={() => openReview(apt)} className="px-3 py-1 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded hover:bg-yellow-100 text-sm flex items-center">
                                    <Star size={14} className="mr-1"/> Değerlendir
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {displayList.length === 0 && <div className="text-center py-8 text-gray-500">Randevu bulunamadı.</div>}
            </div>

            {/* Review Modal */}
            {reviewModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Dersi Değerlendir</h3>
                        <div className="flex justify-center space-x-2 mb-4">
                            {[1,2,3,4,5].map(star => (
                                <button key={star} onClick={() => setRating(star)} className={`${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                    <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                        <textarea 
                            className="w-full border p-3 rounded-lg mb-4" 
                            rows={4} 
                            placeholder="Yorumunuz..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setReviewModal({open: false, aptId: null, teacherId: null})} className="px-4 py-2 text-gray-500">İptal</button>
                            <button onClick={submitReview} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Gönder</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default StudentAppointments;
