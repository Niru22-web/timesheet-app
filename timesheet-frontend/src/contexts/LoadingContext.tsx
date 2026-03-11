import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { loadingManager } from '../utils/loadingManager';

interface LoadingContextType {
    setIsLoading: (loading: boolean, message?: string) => void;
    isLoading: boolean;
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
    const [message, setMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        return loadingManager.subscribe((loading, msg) => {
            setIsLoadingState(loading);
            setMessage(msg);
        });
    }, []);

    const setIsLoading = (loading: boolean, msg?: string) => {
        if (loading) loadingManager.startLoading(msg);
        else loadingManager.stopLoading();
    };

    return (
        <LoadingContext.Provider value={{ setIsLoading, isLoading }}>
            {children}
            <LoadingOverlay isVisible={isLoading} message={message} />
        </LoadingContext.Provider>
    );
};
