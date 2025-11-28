import React from 'react';
import { Role, User, View } from '../types';
import {
    BookOpen,
    Calendar,
    CreditCard,
    User as UserIcon,
    LogOut,
    LayoutDashboard,
    CheckSquare,
    Users,
    FileText,
    DollarSign
} from 'lucide-react';

interface LayoutProps {
    currentUser: User;
    currentView: View;
    onChangeView: (view: View) => void;
    onLogout: () => void;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentUser, currentView, onChangeView, onLogout, children }) => {

    const renderNavItems = () => {
        switch (currentUser.role) {
            case Role.STUDENT:
                return (
                    <>
                        <NavItem
                            active={currentView === View.STUDENT_SEARCH}
                            onClick={() => onChangeView(View.STUDENT_SEARCH)}
                            icon={<BookOpen size={20} />}
                            label="Ders Al"
                        />
                        <NavItem
                            active={currentView === View.STUDENT_APPOINTMENTS}
                            onClick={() => onChangeView(View.STUDENT_APPOINTMENTS)}
                            icon={<Calendar size={20} />}
                            label="Randevularım"
                        />
                        <NavItem
                            active={currentView === View.STUDENT_PAYMENTS}
                            onClick={() => onChangeView(View.STUDENT_PAYMENTS)}
                            icon={<CreditCard size={20} />}
                            label="Ödemelerim"
                        />
                        <NavItem
                            active={currentView === View.STUDENT_PROFILE}
                            onClick={() => onChangeView(View.STUDENT_PROFILE)}
                            icon={<UserIcon size={20} />}
                            label="Profilim"
                        />
                    </>
                );
            case Role.TEACHER:
                return (
                    <>
                        <NavItem
                            active={currentView === View.TEACHER_DASHBOARD}
                            onClick={() => onChangeView(View.TEACHER_DASHBOARD)}
                            icon={<LayoutDashboard size={20} />}
                            label="Panelim"
                        />
                        <NavItem
                            active={currentView === View.TEACHER_CALENDAR}
                            onClick={() => onChangeView(View.TEACHER_CALENDAR)}
                            icon={<Calendar size={20} />}
                            label="Takvim"
                        />
                        <NavItem
                            active={currentView === View.TEACHER_COURSES}
                            onClick={() => onChangeView(View.TEACHER_COURSES)}
                            icon={<BookOpen size={20} />}
                            label="Derslerim"
                        />
                        <NavItem
                            active={currentView === View.TEACHER_EARNINGS}
                            onClick={() => onChangeView(View.TEACHER_EARNINGS)}
                            icon={<DollarSign size={20} />}
                            label="Kazançlarım"
                        />
                        <NavItem
                            active={currentView === View.TEACHER_PROFILE}
                            onClick={() => onChangeView(View.TEACHER_PROFILE)}
                            icon={<UserIcon size={20} />}
                            label="Profilim"
                        />
                    </>
                );
            case Role.ADMIN:
                return (
                    <>
                        <NavItem
                            active={currentView === View.ADMIN_DASHBOARD}
                            onClick={() => onChangeView(View.ADMIN_DASHBOARD)}
                            icon={<LayoutDashboard size={20} />}
                            label="Dashboard"
                        />
                        <NavItem
                            active={currentView === View.ADMIN_USERS}
                            onClick={() => onChangeView(View.ADMIN_USERS)}
                            icon={<Users size={20} />}
                            label="Kullanıcılar"
                        />
                        <NavItem
                            active={currentView === View.ADMIN_APPROVALS}
                            onClick={() => onChangeView(View.ADMIN_APPROVALS)}
                            icon={<CheckSquare size={20} />}
                            label="Onay Bekleyenler"
                        />
                        <NavItem
                            active={currentView === View.ADMIN_LESSONS}
                            onClick={() => onChangeView(View.ADMIN_LESSONS)}
                            icon={<BookOpen size={20} />}
                            label="Ders Yönetimi"
                        />
                        <NavItem
                            active={currentView === View.ADMIN_REPORTS}
                            onClick={() => onChangeView(View.ADMIN_REPORTS)}
                            icon={<LayoutDashboard size={20} />}
                            label="Raporlar"
                        />
                        <NavItem
                            active={currentView === View.ADMIN_DISPUTES}
                            onClick={() => onChangeView(View.ADMIN_DISPUTES)}
                            icon={<CreditCard size={20} />}
                            label="Anlaşmazlıklar"
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText className="text-white" size={18} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">BiDersAl</h1>
                </div>

                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6 bg-gray-50 p-3 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                            {currentUser.name[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name} {currentUser.surname}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role.toLowerCase()}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {renderNavItems()}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-gray-100">
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-3 text-gray-500 hover:text-red-600 transition-colors w-full px-3 py-2 rounded-md"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <main className="p-8 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-md transition-all ${active
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default Layout;