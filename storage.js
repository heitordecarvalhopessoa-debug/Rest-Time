const STORAGE_KEY = 'rest_time_data';

const DataStorage = {
    loadUserData: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    saveUserData: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    clearUserData: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};

window.DataStorage = DataStorage;