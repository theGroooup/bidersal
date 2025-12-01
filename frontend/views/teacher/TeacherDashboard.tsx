import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { fetchTeacherAppointments, updateAppointmentStatus } from '../../services/api';
import { CheckCircle, XCircle, Users, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

const TeacherDashboard: React.FC<{ teacherId: number }> = ({ teacherId }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const refresh = () => fetchTeacherAppointments(teacherId).then(setAppointments);
    useEffect(() => { refresh(); }, [teacherId]);

    const handleAction = async (id: number, status: string) => {
        await updateAppointmentStatus(id, status);
        refresh();
    };

    const pending = appointments.filter(a => a.status === AppointmentStatus.PENDING);
    const active = appointments.filter(a => a.status === AppointmentStatus.PLANNED).length;
    const completed = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow-sm border border-gray-100"><div className="text-sm text-gray-500">Aktif</div><div className="text-2xl font-bold">{active}</div></div>
                <div className="bg-white p-6 rounded shadow-sm border border-gray-100"><div className="text-sm text-gray-500">Tamamlanan</div><div className="text-2xl font-bold">{completed}</div></div>
                <div className="bg-white p-6 rounded shadow-sm border border-gray-100"><div className="text-sm text-gray-500">Bekleyen</div><div className="text-2xl font-bold">{pending.length}</div></div>
            </div>
            <div>
                <h3 className="text-xl font-bold mb-4">Talepler</h3>
                <div className="bg-white rounded shadow-sm border border-gray-100 divide-y">
                    {pending.map(req => (
                        <div key={req.id} className="p-6 flex justify-between items-center">
                            <div><h4 className="font-bold">{req.studentName}</h4><p className="text-sm text-gray-500">{req.subjectName} • {format(new Date(req.date), 'd MMMM HH:mm')}</p></div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleAction(req.id, AppointmentStatus.PLANNED)} className="text-green-600 hover:bg-green-50 p-2 rounded-full"><CheckCircle /></button>
                                <button onClick={() => handleAction(req.id, AppointmentStatus.CANCELLED_TEACHER)} className="text-red-600 hover:bg-red-50 p-2 rounded-full"><XCircle /></button>
                            </div>
                        </div>
                    ))}
                    {pending.length === 0 && <div className="p-6 text-center text-gray-500">Talep yok.</div>}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4">Yaklaşan Randevular</h3>
                <div className="bg-white rounded shadow-sm border border-gray-100 divide-y">
                    {appointments.filter(a => a.status === AppointmentStatus.PLANNED).map(app => (
                        <div key={app.id} className="p-6 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Clock size={20} /></div>
                                <div>
                                    <h4 className="font-bold">{app.studentName}</h4>
                                    <p className="text-sm text-gray-500">{app.subjectName} • {format(new Date(app.date), 'd MMMM HH:mm')}</p>
                                    {app.zoomLink && <a href={app.zoomLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Zoom Linki</a>}
                                </div>
                            </div>
                            <button onClick={() => handleAction(app.id, AppointmentStatus.COMPLETED)} className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">Tamamla</button>
                        </div>
                    ))}
                    {appointments.filter(a => a.status === AppointmentStatus.PLANNED).length === 0 && <div className="p-6 text-center text-gray-500">Yaklaşan randevu yok.</div>}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4">Geçmiş Randevular</h3>
                <div className="bg-white rounded shadow-sm border border-gray-100 divide-y">
                    {appointments.filter(a => ![AppointmentStatus.PENDING, AppointmentStatus.PLANNED].includes(a.status)).map(app => (
                        <div key={app.id} className="p-6 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold">{app.studentName}</h4>
                                <p className="text-sm text-gray-500">{app.subjectName} • {format(new Date(app.date), 'd MMMM HH:mm')}</p>
                                <span className={`text-xs px-2 py-1 rounded ${app.status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span>
                            </div>
                        </div>
                    ))}
                    {appointments.filter(a => ![AppointmentStatus.PENDING, AppointmentStatus.PLANNED].includes(a.status)).length === 0 && <div className="p-6 text-center text-gray-500">Geçmiş randevu yok.</div>}
                </div>
            </div>
        </div>
    );
};
export default TeacherDashboard;