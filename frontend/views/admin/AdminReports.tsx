import React, { useState, useEffect } from 'react';

const AdminReports: React.FC = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/admin/stats')
            .then(res => res.json())
            .then(data => setStats(data));
    }, []);

    if (!stats) return <div className="p-6">Yükleniyor...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Sistem Raporları</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-medium">Toplam Randevu</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalAppointments}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-medium">Toplam Gelir</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalRevenue} TL</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm font-medium">Toplam Kullanıcı</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm font-medium">Bekleyen Öğretmen</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.pendingTeachers}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
                    <h3 className="text-gray-500 text-sm font-medium">Aktif Öğretmen</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.activeTeachers}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
