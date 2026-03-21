import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({ 
    showSpinner: false, 
    speed: 400, 
    minimum: 0.1 
});

type LoadingListener = (loading: boolean, message?: string, isBlocking?: boolean) => void;

class LoadingManager {
    private static instance: LoadingManager;
    private listeners: LoadingListener[] = [];
    private activeRequests = 0;
    private blockingRequests = 0;

    private constructor() { }

    public static getInstance(): LoadingManager {
        if (!LoadingManager.instance) {
            LoadingManager.instance = new LoadingManager();
        }
        return LoadingManager.instance;
    }

    public subscribe(listener: LoadingListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    public startLoading(message?: string, isBlocking: boolean = false) {
        this.activeRequests++;
        if (isBlocking) {
            this.blockingRequests++;
        }

        if (this.activeRequests === 1) {
            NProgress.start();
        }

        // Notify with current global loading and blocking state
        this.notify(this.activeRequests > 0, message, this.blockingRequests > 0);
    }

    public stopLoading(isBlocking: boolean = false) {
        this.activeRequests--;
        if (isBlocking) {
            this.blockingRequests--;
        }

        if (this.activeRequests <= 0) {
            this.activeRequests = 0;
            this.blockingRequests = 0;
            NProgress.done();
            this.notify(false);
        } else {
            // Still some requests active, notify current state
            this.notify(true, undefined, this.blockingRequests > 0);
        }
    }

    private notify(loading: boolean, message?: string, isBlocking?: boolean) {
        this.listeners.forEach(l => l(loading, message, isBlocking));
    }
}

export const loadingManager = LoadingManager.getInstance();


