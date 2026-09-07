const STORAGE_KEY = 'rest_time_data';
const LEADERBOARD_KEY = 'rest_time_leaderboard';
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

    saveUserData: (userData) => {
        if (!userData || !userData.name) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

        DataStorage.updateLeaderboard(userData);
    },

    clearUserData: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    getAllLeaderboardUsers: () => {
        const data = localStorage.getItem(LEADERBOARD_KEY);
        const users = data ? JSON.parse(data) : [];
        return users.sort((a, b) => (b.totalTimeSpent || 0) - (a.totalTimeSpent || 0));
    },

    updateLeaderboard: (userData) => {
        let users = DataStorage.getAllLeaderboardUsers();
        const index = users.findIndex(u => u.name.toLowerCase() === userData.name.toLowerCase());

        if (index !== -1) {
            if ((userData.totalTimeSpent || 0) >= (users[index].totalTimeSpent || 0)) {
                users[index].totalTimeSpent = userData.totalTimeSpent || 0;
            }
        } else {
            users.push({
                name: userData.name,
                totalTimeSpent: userData.totalTimeSpent || 0
            });
        }

        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(users));
    },

    loadLayouts: () => {
        const data = localStorage.getItem(LAYOUTS_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveLayouts: (layouts) => {
        localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
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