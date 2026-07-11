interface UserData {
    name: string;
    totalTimeSpent: number;
}

interface DataStorageInterface {
    loadUserData: () => UserData | null;
    saveUserData: (data: UserData) => void;
    clearUserData: () => void;
}

const STORAGE_KEY: string = 'rest_time_data';

const DataStorage: DataStorageInterface = {
    loadUserData: (): UserData | null => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    saveUserData: (data: UserData): void => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    clearUserData: (): void => {
        localStorage.removeItem(STORAGE_KEY);
    }
};

declare global {
    interface Window {
        DataStorage: DataStorageInterface;
        GameVersion?: {
            current: string;
            init: () => void;
        };
        StarTimeManager?: {
            decayRate: number;
            init: () => void;
            updateDecay: (value: string) => void;
        };
    }
}

window.DataStorage = DataStorage;

export {};
