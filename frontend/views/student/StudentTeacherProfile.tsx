import React, { useEffect, useState } from 'react';
import { Teacher } from '../../types';
import { fetchTeacherProfile } from '../../services/api';
import { ArrowLeft, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react';

interface StudentTeacherProfileProps {
    teacherId: number;
    onBack: () => void;
}

const StudentTeacherProfile: React.FC<StudentTeacherProfileProps> = ({ teacherId, onBack }) => {
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeacherProfile(teacherId)
            .then(data => {
                setTeacher(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [teacherId]);

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
    if (!teacher) return <div className="p-8 text-center">Öğretmen bulunamadı.</div>;

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Geri Dön
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end">
                            <div className="w-24 h-24 bg-white rounded-xl shadow-md p-1">
                                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400">
                                    {teacher.name.charAt(0)}{teacher.surname.charAt(0)}
                                </div>
                            </div>
                            <div className="ml-4 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{teacher.name} {teacher.surname}</h1>
                                <p className="text-gray-500">{teacher.profession}</p>
                            </div>
                        </div>
                        <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-lg text-yellow-700">
                            <Star size={18} className="fill-current mr-1" />
                            <span className="font-bold">{teacher.rating || 0}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hakkında</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {teacher.bio || "Henüz bir biyografi eklenmemiş."}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                <div className="flex items-center text-gray-600">
                                    <GraduationCap size={18} className="mr-3 text-indigo-600" />
                                    <div>
                                        <p className="text-xs text-gray-400">Üniversite</p>
                                        <p className="font-medium">{teacher.university}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Briefcase size={18} className="mr-3 text-indigo-600" />
                                    <div>
                                        <p className="text-xs text-gray-400">Bölüm</p>
                                        <p className="font-medium">{teacher.department}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <MapPin size={18} className="mr-3 text-indigo-600" />
                                    <div>
                                        <p className="text-xs text-gray-400">Konum</p>
                                        <p className="font-medium">Online</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentTeacherProfile;
