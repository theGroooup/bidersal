
import React from 'react';
import { Users, CreditCard } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Panel</h2>
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow border flex items-center justify-between"><div><p className="text-gray-500">Kullanıcılar</p><h3 className="text-2xl font-bold">Yönetim</h3></div><Users className="text-blue-500" size={32}/></div>
                <div className="bg-white p-6 rounded shadow border flex items-center justify-between"><div><p className="text-gray-500">Sistem</p><h3 className="text-2xl font-bold">Aktif</h3></div><CreditCard className="text-green-500" size={32}/></div>
            </div>
            <div className="bg-white p-6 rounded shadow border text-center text-gray-500">
                Detaylı analizler için Kullanıcılar sekmesini ziyaret edin.
            </div>
        </div>
    );
};
export default AdminDashboard;
