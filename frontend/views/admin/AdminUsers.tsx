
import React, { useState, useEffect } from 'react';
import { fetchAllUsers, updateUserStatus } from '../../services/api';
import { User, AccountStatus, Role } from '../../types';
import { Shield, ShieldOff } from 'lucide-react';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const load = () => fetchAllUsers().then(setUsers);
    useEffect(() => { load(); }, []);

    const handleStatus = async (id: number, role: Role, status: AccountStatus) => {
        await updateUserStatus(id, role, status);
        load();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Kullanıcılar</h2>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4">Ad Soyad</th><th className="p-4">Rol</th><th className="p-4">Durum</th><th className="p-4">İşlem</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={`${u.role}-${u.id}`} className="border-b hover:bg-gray-50">
                                <td className="p-4">{u.name} {u.surname}<br/><span className="text-xs text-gray-500">{u.email}</span></td>
                                <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-gray-100">{u.role}</span></td>
                                <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${u.accountStatus === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.accountStatus}</span></td>
                                <td className="p-4">
                                    {u.accountStatus === 'aktif' ? (
                                        <button onClick={()=>handleStatus(u.id, u.role, AccountStatus.SUSPENDED)} className="text-red-500 hover:bg-red-50 p-2 rounded"><ShieldOff size={18}/></button>
                                    ) : (
                                        <button onClick={()=>handleStatus(u.id, u.role, AccountStatus.ACTIVE)} className="text-green-500 hover:bg-green-50 p-2 rounded"><Shield size={18}/></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminUsers;