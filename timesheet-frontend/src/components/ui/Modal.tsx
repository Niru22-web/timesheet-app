import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { APP_CONFIG } from '../../config/appConfig';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer, 
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true
}) => {
    const { theme } = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape') onClose();
        };
        
        const handleFocusTrap = (event: KeyboardEvent) => {
            if (event.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        event.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        event.preventDefault();
                    }
                }
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
            window.addEventListener('keydown', handleFocusTrap);
            
            // Focus management
            if (modalRef.current) {
                const firstFocusableElement = modalRef.current.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ) as HTMLElement;
                firstFocusableElement?.focus();
            }
        }
        
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
            window.removeEventListener('keydown', handleFocusTrap);
        };
    }, [isOpen, onClose, closeOnEscape]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleOverlayClick}>
            {/* Simple Backdrop */}
            <div
                className="fixed inset-0 bg-secondary-900/40 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/70"
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-elevated transition-all transform animate-in zoom-in duration-300 border border-secondary-100/50 flex flex-col max-h-[90vh] dark:bg-gray-800 dark:border-gray-700`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fixed Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-secondary-100 dark:border-gray-700">
                    <div className="space-y-0.5">
                        <h3 id="modal-title" className="text-lg md:text-xl font-bold text-secondary-900 leading-tight dark:text-white">{title}</h3>
                        <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest italic opacity-60 dark:text-gray-500">{APP_CONFIG.COMPANY_NAME} Portal</p>
                    </div>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-all dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                            aria-label="Close modal"
                        >
                            <XMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    )}
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
                    <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 md:px-8 py-4 md:py-5 border-t border-secondary-100 bg-secondary-50/50 dark:border-gray-700 dark:bg-gray-900/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default Modal;
