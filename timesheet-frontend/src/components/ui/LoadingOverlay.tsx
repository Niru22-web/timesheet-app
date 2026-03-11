import React from 'react';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = "Processing securely..." }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-secondary-900/40 backdrop-blur-md transition-all duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-xs w-full animate-scale-in">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-100 rounded-full" />
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-black text-secondary-900 tracking-tight">{message}</p>
                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest leading-relaxed">
                        Please wait while we interact with the secure data layer.
                    </p>
                </div>
                <div className="w-full h-1 bg-secondary-50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 w-1/2 animate-shimmer" />
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
