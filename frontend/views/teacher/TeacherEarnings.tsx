
import React, { useState, useEffect } from 'react';
import { fetchTeacherPayments } from '../../services/api';
import { Payment, PaymentStatus } from '../../types';
import { format } from 'date-fns';
import { XCircle } from 'lucide-react';

const TeacherEarnings: React.FC<{ teacherId: number }> = ({ teacherId }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    useEffect(() => { fetchTeacherPayments(teacherId).then(setPayments); }, [teacherId]);
    
    // PostgreSQL decimal değerleri string olarak döndürür, bu yüzden Number() ile çeviriyoruz.
    const total = payments
        .filter(p => p.status === PaymentStatus.PAID)
        .reduce((acc, c) => acc + Number(c.amount), 0);

    // İptal edilenleri "Bekleyen" bakiyeye dahil etme
    const pending = payments
        .filter(p => p.status !== PaymentStatus.PAID && p.status !== PaymentStatus.CANCELLED)
        .reduce((acc, c) => acc + Number(c.amount), 0);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow border">
                    <div className="text-sm text-gray-500">Toplam Kazanç</div>
                    <div className="text-3xl font-bold text-green-600">{total.toFixed(2)} ₺</div>
                </div>
                <div className="bg-white p-6 rounded shadow border">
                    <div className="text-sm text-gray-500">Bekleyen</div>
                    <div className="text-3xl font-bold text-orange-600">{pending.toFixed(2)} ₺</div>
                </div>
            </div>
            <div className="bg-white rounded shadow border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Ders</th>
                            <th className="p-4">Tutar</th>
                            <th className="p-4">Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id} className="border-b">
                                <td className="p-4">{format(new Date(p.date), 'd MMM')}</td>
                                <td className="p-4">{p.subjectName}</td>
                                <td className="p-4 font-bold">{p.amount} ₺</td>
                                <td className="p-4 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1
                                        ${p.status === PaymentStatus.PAID ? 'bg-green-100 text-green-800' : 
                                          p.status === PaymentStatus.CANCELLED ? 'bg-red-100 text-red-800' : 
                                          'bg-orange-100 text-orange-800'}`}>
                                        {p.status === PaymentStatus.CANCELLED && <XCircle size={12}/>}
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Kayıt bulunamadı.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default TeacherEarnings;