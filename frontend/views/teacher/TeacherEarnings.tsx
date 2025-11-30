
import React, { useState, useEffect } from 'react';
import { fetchTeacherPayments } from '../../services/api';
import { Payment, PaymentStatus } from '../../types';
import { format } from 'date-fns';
import { XCircle, CheckCircle } from 'lucide-react';

interface ExtendedPayment extends Payment {
    is_withdrawed: boolean;
}

const TeacherEarnings: React.FC<{ teacherId: number }> = ({ teacherId }) => {
    const [payments, setPayments] = useState<ExtendedPayment[]>([]);

    const [withdrawId, setWithdrawId] = useState<number | null>(null);

    useEffect(() => { fetchTeacherPayments(teacherId).then(data => setPayments(data as ExtendedPayment[])); }, [teacherId]);

    const handleWithdrawClick = (paymentId: number) => {
        setWithdrawId(paymentId);
    };

    const confirmWithdraw = async () => {
        if (!withdrawId) return;
        try {
            const res = await fetch('http://localhost:3001/api/payments/teacher/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: withdrawId })
            });
            if (res.ok) {
                setPayments(prev => prev.map(p => p.id === withdrawId ? { ...p, is_withdrawed: true } : p));
                // alert('Ödeme çekildi.'); // Optional: remove alert or use a toast
            } else {
                alert('Bir hata oluştu.');
            }
        } catch (err) {
            console.error(err);
            alert('Bir hata oluştu.');
        } finally {
            setWithdrawId(null);
        }
    };

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
                            <th className="p-4">İşlem</th>
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
                                        {p.status === PaymentStatus.CANCELLED && <XCircle size={12} />}
                                        {p.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {p.status === PaymentStatus.PAID && (
                                        p.is_withdrawed ? (
                                            <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                                                <CheckCircle size={16} /> Çekildi
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleWithdrawClick(p.id)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                            >
                                                Para Çek
                                            </button>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Kayıt bulunamadı.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Modal */}
            {withdrawId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
                        <h3 className="text-lg font-bold mb-2">Ödeme Çekme Onayı</h3>
                        <p className="text-gray-600 mb-6">Bu ödemeyi çekmek istediğinize emin misiniz?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => setWithdrawId(null)}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                İptal
                            </button>
                            <button
                                onClick={confirmWithdraw}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TeacherEarnings;