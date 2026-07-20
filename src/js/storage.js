const STORAGE_KEY = 'rest_time_data';
const LAYOUTS_KEY = 'rest_time_layouts';
const DB_NAME = 'RestTimeDB';
const STORE_NAME = 'music_tracks';

let dbInstance = null;

function getDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
        try {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (e) => {
                dbInstance = e.target.result;
                resolve(dbInstance);
            };
            request.onerror = (e) => {
                console.error("Erro ao abrir IndexedDB:", e.target.error);
                reject(e.target.error);
            };
        } catch (err) {
            console.error("IndexedDB não suportado ou bloqueado:", err);
            reject(err);
        }
    });
}

const DataStorage = {
    loadUserData: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    saveUserData: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    loadLayoutsData: () => {
        const data = localStorage.getItem(LAYOUTS_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveLayoutsData: (layouts) => {
        localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
    },

    clearUserData: async () => {
        localStorage.removeItem(STORAGE_KEY);
        try {
            const db = await getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error(err);
        }
    },

    loadMusicData: async () => {
        try {
            const db = await getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    saveSingleTrack: async (trackData) => {
        try {
            if (!trackData || !trackData.file) return;
            const db = await getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                
                const dataToSave = {
                    name: trackData.name || "Unknown Track",
                    file: trackData.file
                };

                const request = store.add(dataToSave);
                request.onsuccess = () => resolve();
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (err) {
            console.error(err);
        }
    }
};

window.DataStorage = DataStorage;
