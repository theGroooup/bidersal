import React from 'react';
import { Role } from '../types';
import { User, GraduationCap, ShieldCheck } from 'lucide-react';

interface RoleSwitcherProps {
    onSelectRole: (role: Role) => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">BiDersAl'a Hoşgeldiniz</h1>
                <p className="text-gray-500 mb-12">Lütfen devam etmek için giriş türünü seçiniz</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <RoleCard 
                        role={Role.STUDENT} 
                        title="Öğrenci Girişi" 
                        description="Ders ara, randevu al ve öğrenmeye başla."
                        icon={<User size={40} />}
                        color="bg-blue-50 text-blue-600 hover:border-blue-500"
                        onClick={() => onSelectRole(Role.STUDENT)}
                    />
                    <RoleCard 
                        role={Role.TEACHER} 
                        title="Öğretmen Girişi" 
                        description="Derslerini yönet, kazançlarını takip et."
                        icon={<GraduationCap size={40} />}
                        color="bg-green-50 text-green-600 hover:border-green-500"
                        onClick={() => onSelectRole(Role.TEACHER)}
                    />
                    <RoleCard 
                        role={Role.ADMIN} 
                        title="Admin Paneli" 
                        description="Sistem yönetimi ve raporlama."
                        icon={<ShieldCheck size={40} />}
                        color="bg-purple-50 text-purple-600 hover:border-purple-500"
                        onClick={() => onSelectRole(Role.ADMIN)}
                    />
                </div>
            </div>
        </div>
    );
};

const RoleCard = ({ role, title, description, icon, color, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center p-8 rounded-xl border-2 border-transparent transition-all duration-300 transform hover:-translate-y-1 ${color}`}
    >
        <div className="mb-4 p-4 bg-white rounded-full shadow-sm">
            {icon}
        </div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-80">{description}</p>
    </button>
);

export default RoleSwitcher;