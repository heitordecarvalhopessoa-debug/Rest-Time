interface UserData {
    name: string;
    totalTimeSpent: number;
}

interface TrackData {
    id?: number;
    name: string;
    file: File | Blob;
}

declare global {
    interface Window {
        DataStorage: typeof DataStorage;
    }
}

const STORAGE_KEY = 'rest_time_data';
const DB_NAME = 'RestTimeDB';
const STORE_NAME = 'music_tracks';

let dbInstance: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase | null> {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (e: Event) => {
            dbInstance = (e.target as IDBOpenDBRequest).result;
            resolve(dbInstance);
        };

        request.onerror = () => {
            resolve(null);
        };
    });
}

const DataStorage = {
    loadUserData: (): UserData | null => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    saveUserData: (data: UserData): void => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    clearUserData: (): Promise<void> => {
        localStorage.removeItem(STORAGE_KEY);
        return new Promise(async (resolve) => {
            if (!dbInstance) {
                const req = indexedDB.deleteDatabase(DB_NAME);
                req.onsuccess = () => resolve();
                req.onerror = () => resolve();
                return;
            }
            dbInstance.close();
            const req = indexedDB.deleteDatabase(DB_NAME);
            req.onsuccess = () => {
                dbInstance = null;
                resolve();
            };
            req.onerror = () => resolve();
        });
    },

    loadMusicData: (): Promise<TrackData[]> => {
        return new Promise(async (resolve) => {
            const db = await getDB();
            if (!db) return resolve([]);

            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const getAllReq = store.getAll();

            getAllReq.onsuccess = () => resolve((getAllReq.result as TrackData[]) || []);
            getAllReq.onerror = () => resolve([]);
        });
    },

    saveSingleTrack: (trackData: TrackData): Promise<void> => {
        return new Promise(async (resolve) => {
            if (!trackData || !trackData.file) return resolve();
            
            const db = await getDB();
            if (!db) return resolve();

            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const addReq = store.add({
                name: trackData.name || "Unknown Track",
                file: trackData.file
            });

            addReq.onsuccess = () => resolve();
            addReq.onerror = () => resolve();
        });
    }
};

window.DataStorage = DataStorage;

export {};
