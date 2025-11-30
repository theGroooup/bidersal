import React, { useState, useEffect } from 'react';

const AdminFinancialManagement: React.FC = () => {
    const [disputes, setDisputes] = useState<any[]>([]);

    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/admin/financial-management');
            const data = await res.json();
            setDisputes(data);
        } catch (error) {
            console.error("Error fetching disputes:", error);
        }
    };

    const handleResolve = async (id: number, action: 'refund' | 'pay_teacher') => {
        if (!confirm('Bu işlemi onaylıyor musunuz?')) return;
        try {
            console.log(`Resolving dispute ${id} with action ${action}`);
            const res = await fetch(`http://localhost:3001/api/admin/financial-management/${id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (!res.ok) {
                const err = await res.json();
                alert('İşlem başarısız: ' + err.error);
                return;
            }
            fetchDisputes();
            alert('İşlem başarılı');
        } catch (error) {
            console.error("Error resolving dispute:", error);
            alert('Bir hata oluştu');
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('tr-TR'),
            time: date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Finansal Yönetim</h2>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Randevu ID</th>
                            <th className="p-4">Öğrenci</th>
                            <th className="p-4">Öğretmen</th>
                            <th className="p-4">Tutar</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4">Öğrenci Ödemesi</th>
                            <th className="p-4">Öğretmen Ödemesi</th>
                            <th className="p-4">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disputes.length === 0 ? (
                            <tr><td colSpan={8} className="p-4 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
                        ) : disputes.map(d => (
                            <tr key={d.id} className="border-t">
                                <td className="p-4">#{d.id}</td>
                                <td className="p-4">{d.studentName}</td>
                                <td className="p-4">{d.teacherName}</td>
                                <td className="p-4">{d.amount} TL</td>
                                <td className="p-4"><span className={`px-2 py-1 rounded text-sm ${d.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{d.status}</span></td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${d.studentPaymentStatus === 'Ödendi' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {d.studentPaymentStatus}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${d.teacherPaymentStatus === 'Ödendi' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {d.teacherPaymentStatus || '-'}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2 flex items-center">
                                    <button
                                        onClick={() => setSelectedRecord(d)}
                                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                    >
                                        Detay
                                    </button>
                                    {d.studentPaymentStatus === 'Ödendi' && d.teacherPaymentStatus !== 'Ödendi' && (
                                        <button
                                            onClick={() => handleResolve(d.id, 'refund')}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                            title="Öğrenciye iade et"
                                        >
                                            İade Et
                                        </button>
                                    )}
                                    {d.studentPaymentStatus === 'Ödendi' && d.teacherPaymentStatus !== 'Ödendi' && (
                                        <button
                                            onClick={() => handleResolve(d.id, 'pay_teacher')}
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                            title="Öğretmene ödeme yap"
                                        >
                                            Öğretmene Öde
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4">Ödeme Detayı</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="font-semibold text-gray-600">Randevu Tarihi:</span>
                                <p className="text-lg">{formatDateTime(selectedRecord.date).date}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Randevu Saati:</span>
                                <p className="text-lg">{formatDateTime(selectedRecord.date).time}</p>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <span className="font-semibold text-gray-600">Öğrenci:</span>
                                <p>{selectedRecord.studentName}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Öğretmen:</span>
                                <p>{selectedRecord.teacherName}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Tutar:</span>
                                <p>{selectedRecord.amount} TL</p>
                            </div>
                            {selectedRecord.studentPaymentDate && (
                                <div>
                                    <span className="font-semibold text-gray-600">Öğrenci Ödeme Tarihi:</span>
                                    <p>{formatDateTime(selectedRecord.studentPaymentDate).date} {formatDateTime(selectedRecord.studentPaymentDate).time}</p>
                                </div>
                            )}
                            {selectedRecord.teacherPaymentDate && (
                                <div>
                                    <span className="font-semibold text-gray-600">Öğretmen Ödeme Tarihi:</span>
                                    <p>{formatDateTime(selectedRecord.teacherPaymentDate).date} {formatDateTime(selectedRecord.teacherPaymentDate).time}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFinancialManagement;
