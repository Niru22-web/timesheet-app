import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { loadingManager } from '../utils/loadingManager';

interface LoadingContextType {
    setIsLoading: (loading: boolean, message?: string, isBlocking?: boolean) => void;
    isLoading: boolean;
    isBlocking: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoadingState] = useState(false);
    const [isBlocking, setIsBlockingState] = useState(false);
    const [message, setMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        return loadingManager.subscribe((loading, msg, blocking) => {
            setIsLoadingState(loading);
            setMessage(msg);
            setIsBlockingState(blocking || false);
        });
    }, []);

    const setIsLoading = (loading: boolean, msg?: string, blocking: boolean = false) => {
        if (loading) loadingManager.startLoading(msg, blocking);
        else loadingManager.stopLoading(blocking);
    };

    return (
        <LoadingContext.Provider value={{ setIsLoading, isLoading, isBlocking }}>
            {children}
            <LoadingOverlay isVisible={isBlocking} message={message} />
        </LoadingContext.Provider>
    );
};

