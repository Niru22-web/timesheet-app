import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
        full: 'max-w-[95vw]',
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Simple Backdrop */}
            <div
                className="fixed inset-0 bg-secondary-900/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-elevated transition-all transform animate-in zoom-in duration-300 border border-secondary-100/50 flex flex-col max-h-[90vh]`}
            >
                {/* Fixed Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-secondary-100">
                    <div className="space-y-0.5">
                        <h3 className="text-lg md:text-xl font-bold text-secondary-900 leading-tight">{title}</h3>
                        <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest italic opacity-60">ashish shah & associate portal</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-all"
                    >
                        <XMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Scrollable Content - Takes remaining space */}
                <div 
                    ref={contentRef}
                    className="flex-1 px-6 md:px-8 py-4 md:py-6 overflow-y-auto custom-scrollbar"
                >
                    {children}
                </div>

                {/* Fixed Footer */}
                {footer && (
                    <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 md:px-8 py-4 md:py-5 border-t border-secondary-100 bg-secondary-50/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default Modal;
