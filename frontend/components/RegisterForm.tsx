
import React, { useState } from 'react';
import { Role } from '../types';
import { register } from '../services/api';
import { User, Lock, Mail, Phone, AlertCircle, ArrowLeft, GraduationCap } from 'lucide-react';

interface RegisterFormProps {
    onRegisterSuccess: () => void;
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [role, setRole] = useState<Role>(Role.STUDENT);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        phone: '',
        birthDate: '',
        gender: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await register({ ...formData, role });
            // Show success message briefly or redirect immediately
            alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
            onRegisterSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Kayıt işlemi başarısız.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <button
                        onClick={onSwitchToLogin}
                        className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-1" /> Giriş'e Dön
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Yeni Hesap Oluştur</h2>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start text-sm">
                            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-center space-x-4 mb-8">
                        <button
                            type="button"
                            onClick={() => setRole(Role.STUDENT)}
                            className={`px-6 py-3 rounded-xl border-2 flex items-center transition-all ${role === Role.STUDENT
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                }`}
                        >
                            <div className={`p-2 rounded-full mr-3 ${role === Role.STUDENT ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                                <User size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm">Öğrenci</div>
                                <div className="text-xs opacity-70">Ders almak istiyorum</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole(Role.TEACHER)}
                            className={`px-6 py-3 rounded-xl border-2 flex items-center transition-all ${role === Role.TEACHER
                                ? 'border-green-600 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-500'
                                }`}
                        >
                            <div className={`p-2 rounded-full mr-3 ${role === Role.TEACHER ? 'bg-green-200' : 'bg-gray-100'}`}>
                                <GraduationCap size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm">Öğretmen</div>
                                <div className="text-xs opacity-70">Ders vermek istiyorum</div>
                            </div>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                            <input
                                type="text"
                                name="surname"
                                required
                                value={formData.surname}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {(role === Role.STUDENT || role === Role.TEACHER) && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        required
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                                    <select
                                        name="gender"
                                        required
                                        value={formData.gender}
                                        onChange={handleChange as any}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="Erkek">Erkek</option>
                                        <option value="Kadın">Kadın</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır.</p>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition-all transform hover:scale-[1.01] ${role === Role.STUDENT ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {loading ? 'Hesap Oluşturuluyor...' : 'Kaydı Tamamla'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
