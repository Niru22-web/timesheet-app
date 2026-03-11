type LoadingListener = (loading: boolean, message?: string) => void;

class LoadingManager {
    private static instance: LoadingManager;
    private listeners: LoadingListener[] = [];
    private activeRequests = 0;

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

    public startLoading(message?: string) {
        this.activeRequests++;
        if (this.activeRequests === 1) {
            this.notify(true, message);
        }
    }

    public stopLoading() {
        this.activeRequests--;
        if (this.activeRequests <= 0) {
            this.activeRequests = 0;
            this.notify(false);
        }
    }

    private notify(loading: boolean, message?: string) {
        this.listeners.forEach(l => l(loading, message));
    }
}

export const loadingManager = LoadingManager.getInstance();
