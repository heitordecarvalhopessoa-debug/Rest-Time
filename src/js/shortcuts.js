const KeyboardShortcuts = {
    init() {
        window.addEventListener('keydown', (e) => {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }

            if (e.key === 'Tab') {
                e.preventDefault();
                const paletteBtn = document.getElementById('palette-toggle-btn');
                if (paletteBtn) paletteBtn.click();
            }

            if (e.key === 'Shift') {
                e.preventDefault();
                const eraserBtn = document.getElementById('eraser-btn');
                if (eraserBtn) eraserBtn.click();
            }

            if (e.key === 'Control') {
                e.preventDefault();
                const pauseBtn = document.getElementById('pause-btn');
                if (pauseBtn) pauseBtn.click();
            }

            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                const blackHoleBtn = document.getElementById('blackhole-toggle-btn');
                if (blackHoleBtn) {
                    blackHoleBtn.click();
                } else if (window.BlackHoleManager) {
                    window.BlackHoleManager.toggle();
                }
            }

            if (e.key === 'h' || e.key === 'H' || e.key === 'Escape') {
                e.preventDefault();
                if (window.ZenScreenshot) window.ZenScreenshot.toggleZenMode();
            }

            if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                if (window.ZenScreenshot) window.ZenScreenshot.takeScreenshot();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    KeyboardShortcuts.init();
});