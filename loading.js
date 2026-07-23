const LoadingScreen = {
    element: null,
    textElement: null,

    init() {
        this.element = document.getElementById('loading-screen');
        this.textElement = document.getElementById('loading-text');
    },

    setText(message) {
        if (this.textElement) {
            this.textElement.textContent = message;
        }
    },

    show(message = 'Loading space...') {
        if (!this.element) this.init();
        if (this.element) {
            this.setText(message);
            this.element.style.display = 'flex';
            this.element.classList.remove('fade-out');
        }
    },

    hide(delay = 500) {
        if (!this.element) this.init();
        if (this.element) {
            this.element.classList.add('fade-out');
            setTimeout(() => {
                this.element.style.display = 'none';
            }, delay);
        }
    }
};

window.LoadingScreen = LoadingScreen;

document.addEventListener('DOMContentLoaded', () => {
    LoadingScreen.init();
});
