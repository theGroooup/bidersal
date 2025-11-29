
import React, { useEffect, useState } from 'react';
import { fetchStudentPayments } from '../../services/api';
import { Payment, PaymentStatus } from '../../types';
import { format } from 'date-fns';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const StudentPayments: React.FC<{ studentId: number }> = ({ studentId }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    useEffect(() => { fetchStudentPayments(studentId).then(setPayments); }, [studentId]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Ödemelerim</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Tarih</th>
                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Ders</th>
                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Tutar</th>
                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600">{format(new Date(p.date), 'd MMM yyyy')}</td>
                                <td className="px-6 py-4 text-sm font-medium">{p.subjectName}</td>
                                <td className="px-6 py-4 text-sm font-bold">{p.amount} ₺</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${p.status === PaymentStatus.PAID ? 'bg-green-100 text-green-800' : 
                                          p.status === PaymentStatus.CANCELLED ? 'bg-red-100 text-red-800' : 
                                          'bg-orange-100 text-orange-800'}`}>
                                        {p.status === PaymentStatus.PAID ? <CheckCircle size={12} className="mr-1"/> : 
                                         p.status === PaymentStatus.CANCELLED ? <XCircle size={12} className="mr-1"/> :
                                         <Clock size={12} className="mr-1"/>} 
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Kayıt yok.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default StudentPayments;