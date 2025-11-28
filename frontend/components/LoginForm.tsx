
import React, { useState } from 'react';
import { Role } from '../types';
import { login } from '../services/api';
import { User, Lock, Mail, AlertCircle, GraduationCap, ShieldCheck } from 'lucide-react';

interface LoginFormProps {
    onLoginSuccess: (user: any) => void;
    onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>(Role.STUDENT);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = await login(email, password, role);
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8 bg-indigo-50 border-b border-indigo-100 text-center">
                    <h1 className="text-2xl font-bold text-indigo-900">BiDersAl</h1>
                    <p className="text-indigo-600 mt-1">Özel Ders Platformuna Hoşgeldiniz</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start text-sm">
                            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setRole(Role.STUDENT)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center ${
                                role === Role.STUDENT ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <User size={16} className="mr-2" /> Öğrenci
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole(Role.TEACHER)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center ${
                                role === Role.TEACHER ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <GraduationCap size={16} className="mr-2" /> Öğretmen
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole(Role.ADMIN)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center ${
                                role === Role.ADMIN ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <ShieldCheck size={16} className="mr-2" /> Admin
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-white font-bold shadow-lg transition-all transform hover:scale-[1.02] ${
                                role === Role.STUDENT ? 'bg-indigo-600 hover:bg-indigo-700' :
                                role === Role.TEACHER ? 'bg-green-600 hover:bg-green-700' :
                                'bg-purple-600 hover:bg-purple-700'
                            }`}
                        >
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>

                    {role !== Role.ADMIN && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Hesabınız yok mu?{' '}
                                <button 
                                    onClick={onSwitchToRegister}
                                    className="text-indigo-600 font-bold hover:underline"
                                >
                                    Hemen Kayıt Ol
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
