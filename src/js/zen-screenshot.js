const ZenScreenshot = {
    init() {
        const screenshotBtn = document.getElementById('screenshot-btn');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.takeScreenshot();
            });
        }

        const hideUiBtn = document.getElementById('hide-ui-btn');
        if (hideUiBtn) {
            hideUiBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleZenMode(true);
            });
        }
    },

    toggleZenMode(forceState) {
        const isHidden = forceState !== undefined ? !forceState : document.body.classList.contains('ui-hidden');

        if (!isHidden) {
            document.body.classList.add('ui-hidden');
            this.showZenHint();
        } else {
            document.body.classList.remove('ui-hidden');
            this.removeZenHint();
        }
    },

    showZenHint() {
        this.removeZenHint();
        const hint = document.createElement('div');
        hint.id = 'exit-zen-hint';
        hint.textContent = 'Press H or ESC to show UI';
        document.body.appendChild(hint);
        setTimeout(() => {
            if (hint) hint.style.opacity = '0';
        }, 3000);
    },

    removeZenHint() {
        const existing = document.getElementById('exit-zen-hint');
        if (existing) existing.remove();
    },

    takeScreenshot() {
        const canvas = document.getElementById('sandCanvas') || document.querySelector('canvas');
        if (!canvas) return;

        const link = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        link.download = `rest-time-${date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
};

window.ZenScreenshot = ZenScreenshot;

document.addEventListener('DOMContentLoaded', () => {
    ZenScreenshot.init();
});
