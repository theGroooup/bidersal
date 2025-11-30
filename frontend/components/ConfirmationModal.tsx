import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, CreditCard } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'success' | 'info' | 'payment';
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    type = 'info',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle className="text-red-500" size={32} />;
            case 'success': return <CheckCircle className="text-green-500" size={32} />;
            case 'payment': return <CreditCard className="text-indigo-500" size={32} />;
            default: return <Info className="text-blue-500" size={32} />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            case 'payment': return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
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

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none transition-all ${getButtonColor()}`}
                        >
                            {isLoading ? 'İşleniyor...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
