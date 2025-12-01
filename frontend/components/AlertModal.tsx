import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
}

const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'error': return <AlertCircle className="text-red-500" size={32} />;
            case 'success': return <CheckCircle className="text-green-500" size={32} />;
            case 'warning': return <AlertTriangle className="text-yellow-500" size={32} />;
            default: return <Info className="text-blue-500" size={32} />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'error': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
            default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm transform transition-all scale-100 opacity-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        {getIcon()}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>

                    <div className="flex justify-center">
                        <button
                            onClick={onClose}
                            className={`px-6 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg shadow-indigo-100 transition-all ${getButtonColor()}`}
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
