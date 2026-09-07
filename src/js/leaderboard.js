const LeaderboardManager = {
    modalElement: null,
    listElement: null,
    closeBtn: null,
    toggleBtn: null,

    init() {
        this.modalElement = document.getElementById('leaderboard-modal');
        this.listElement = document.getElementById('leaderboard-list');
        this.closeBtn = document.getElementById('close-leaderboard-btn');
        this.toggleBtn = document.getElementById('leaderboard-btn');

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.open();
            });
        }

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        if (this.modalElement) {
            this.modalElement.addEventListener('click', (e) => {
                if (e.target === this.modalElement) {
                    this.close();
                }
            });
        }
    },

    open() {
        this.render();
        if (this.modalElement) {
            this.modalElement.classList.remove('hidden');
        }
    },

    close() {
        if (this.modalElement) {
            this.modalElement.classList.add('hidden');
        }
    },

    formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}h ${mins}m ${secs}s`;
        }
        return `${mins}m ${secs}s`;
    },

    render() {
        if (!this.listElement) return;

        if (window.currentUser && window.DataStorage) {
            window.DataStorage.saveUserData(window.currentUser);
        }

        const users = window.DataStorage ? window.DataStorage.getAllLeaderboardUsers() : [];

        this.listElement.innerHTML = '';

        if (users.length === 0) {
            this.listElement.innerHTML = '<p class="no-data">Nenhum registo encontrado.</p>';
            return;
        }

        users.forEach((user, index) => {
            const row = document.createElement('div');
            row.className = 'leaderboard-row';
            
            if (window.currentUser && user.name.toLowerCase() === window.currentUser.name.toLowerCase()) {
                row.classList.add('active-user');
            }

            let rankClass = 'rank-number';
            if (index === 0) rankClass += ' rank-1';
            else if (index === 1) rankClass += ' rank-2';
            else if (index === 2) rankClass += ' rank-3';

            row.innerHTML = `
                <div class="leaderboard-left">
                    <span class="${rankClass}">#${index + 1}</span>
                    <span class="leaderboard-username">${this.escapeHTML(user.name)}</span>
                </div>
                <span class="leaderboard-time">${this.formatTime(user.totalTimeSpent || 0)}</span>
            `;

            this.listElement.appendChild(row);
        });
    },

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
};

window.LeaderboardManager = LeaderboardManager;

document.addEventListener('DOMContentLoaded', () => {
    LeaderboardManager.init();
});