import React, { useEffect, useState } from 'react';
import { fetchStudentPayments, payPayment } from '../../services/api';
import { Payment, PaymentStatus } from '../../types';
import { format } from 'date-fns';
import { CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

const StudentPayments: React.FC<{ studentId: number }> = ({ studentId }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadPayments = () => {
        fetchStudentPayments(studentId).then(setPayments);
    };

    useEffect(() => {
        loadPayments();
    }, [studentId]);

    const handlePayClick = (paymentId: number) => {
        setSelectedPaymentId(paymentId);
        setIsPayModalOpen(true);
    };

    const handleConfirmPay = async () => {
        if (!selectedPaymentId) return;
        setIsLoading(true);
        try {
            await payPayment(selectedPaymentId);
            // alert('Ödeme başarıyla tamamlandı!'); // Removed alert for better UX, maybe show toast later or just refresh
            loadPayments();
            setIsPayModalOpen(false);
        } catch (error) {
            console.error('Ödeme hatası:', error);
            alert('Ödeme sırasında bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

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
                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div>{format(new Date(p.date), 'd MMM yyyy')}</div>
                                    {p.paymentDate && <div className="text-xs text-green-600 mt-1">Ödendi: {format(new Date(p.paymentDate), 'd MMM HH:mm')}</div>}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">{p.subjectName}</td>
                                <td className="px-6 py-4 text-sm font-bold">{p.amount} ₺</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${p.status === PaymentStatus.PAID ? 'bg-green-100 text-green-800' :
                                            p.status === PaymentStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                                                'bg-orange-100 text-orange-800'}`}>
                                        {p.status === PaymentStatus.PAID ? <CheckCircle size={12} className="mr-1" /> :
                                            p.status === PaymentStatus.CANCELLED ? <XCircle size={12} className="mr-1" /> :
                                                <Clock size={12} className="mr-1" />}
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {p.status !== PaymentStatus.PAID && p.status !== PaymentStatus.CANCELLED && (
                                        <button
                                            onClick={() => handlePayClick(p.id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <CreditCard size={14} className="mr-1.5" />
                                            Öde
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Kayıt yok.</td></tr>}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                onConfirm={handleConfirmPay}
                title="Ödeme Onayı"
                message="Bu ders için ödeme yapmak istediğinize emin misiniz? Tutar hesabınızdan tahsil edilecektir."
                confirmText="Ödemeyi Tamamla"
                type="payment"
                isLoading={isLoading}
            />
        </div>
    );
};
export default StudentPayments;