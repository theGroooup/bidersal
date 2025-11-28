import React, { useState, useEffect } from 'react';

const AdminDisputes: React.FC = () => {
    const [disputes, setDisputes] = useState<any[]>([]);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        const res = await fetch('http://localhost:3001/api/admin/disputes');
        const data = await res.json();
        setDisputes(data);
    };

    const handleResolve = async (id: number, action: 'refund' | 'pay_teacher') => {
        if (!confirm('Bu işlemi onaylıyor musunuz?')) return;
        await fetch(`http://localhost:3001/api/admin/disputes/${id}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        fetchDisputes();
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Anlaşmazlık Yönetimi</h2>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">Randevu ID</th>
                            <th className="p-4">Öğrenci</th>
                            <th className="p-4">Öğretmen</th>
                            <th className="p-4">Tutar</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4">Ödeme Durumu</th>
                            <th className="p-4">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disputes.length === 0 ? (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">Sorunlu kayıt bulunamadı.</td></tr>
                        ) : disputes.map(d => (
                            <tr key={d.id} className="border-t">
                                <td className="p-4">#{d.id}</td>
                                <td className="p-4">{d.studentName}</td>
                                <td className="p-4">{d.teacherName}</td>
                                <td className="p-4">{d.amount} TL</td>
                                <td className="p-4"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">{d.status}</span></td>
                                <td className="p-4">{d.paymentStatus}</td>
                                <td className="p-4 space-x-2">
                                    <button
                                        onClick={() => handleResolve(d.id, 'refund')}
                                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                    >
                                        İade Et
                                    </button>
                                    <button
                                        onClick={() => handleResolve(d.id, 'pay_teacher')}
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                    >
                                        Öğretmene Öde
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDisputes;
