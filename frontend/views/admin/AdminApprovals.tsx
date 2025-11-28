
import React, { useState, useEffect } from 'react';
import { fetchPendingTeachers, verifyTeacher } from '../../services/api';
import { Check, X } from 'lucide-react';

const AdminApprovals: React.FC = () => {
    const [pending, setPending] = useState<any[]>([]);
    const load = () => fetchPendingTeachers().then(setPending);
    useEffect(() => { load(); }, []);

    const handle = async (id: number, ok: boolean) => {
        await verifyTeacher(id, ok);
        load();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Eğitmen Onayları</h2>
            <div className="grid gap-4">
                {pending.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded shadow flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{t.name} {t.surname}</h3>
                            <p>{t.university} - {t.department}</p>
                            <p className="text-sm text-gray-500">{t.profession}</p>
                            {t.documentUrl ? (
                                <a href={`http://localhost:3001${t.documentUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline mt-1 block">
                                    Belgeyi Görüntüle
                                </a>
                            ) : (
                                <span className="text-red-500 text-sm mt-1 block">Belge Yüklenmemiş</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handle(t.id, true)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center"><Check size={18} className="mr-1" /> Onayla</button>
                            <button onClick={() => handle(t.id, false)} className="border border-red-200 text-red-600 px-4 py-2 rounded flex items-center"><X size={18} className="mr-1" /> Reddet</button>
                        </div>
                    </div>
                ))}
                {pending.length === 0 && <div className="bg-green-50 p-6 rounded text-center text-green-800">Bekleyen onay yok.</div>}
            </div>
        </div>
    );
};
export default AdminApprovals;