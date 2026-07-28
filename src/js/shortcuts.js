const KeyboardShortcuts = {
    init() {
        const closeBtn = document.getElementById('close-shortcuts');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const shortcutsModal = document.getElementById('shortcuts-modal');
                if (shortcutsModal) shortcutsModal.classList.add('hidden');
            });
        }

        const modal = document.getElementById('shortcuts-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        }

        window.addEventListener('keydown', (e) => {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }

            const shortcutsModal = document.getElementById('shortcuts-modal');

            if (e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                if (shortcutsModal) {
                    shortcutsModal.classList.toggle('hidden');
                }
                return;
            }

            if (e.key === 'Escape') {
                if (shortcutsModal && !shortcutsModal.classList.contains('hidden')) {
                    e.preventDefault();
                    shortcutsModal.classList.add('hidden');
                    return;
                }
            }

            const brushMap = {
                'Digit1': 'normal', 'Numpad1': 'normal', '1': 'normal',
                'Digit2': 'random', 'Numpad2': 'random', '2': 'random',
                'Digit3': 'explode', 'Numpad3': 'explode', '3': 'explode',
                'Digit4': 'meteor',  'Numpad4': 'meteor',  '4': 'meteor',
                'Digit5': 'rain',    'Numpad5': 'rain',    '5': 'rain',
                'Digit6': 'web',     'Numpad6': 'web',     '6': 'web'
            };

            const selectedBrush = brushMap[e.code] || brushMap[e.key];

            if (selectedBrush) {
                e.preventDefault();
                const targetButton = document.querySelector(`.brush-selector-popover .brush-btn[data-brush="${selectedBrush}"]`);
                
                if (targetButton) {
                    targetButton.click();
                } else if (window.BrushManager) {
                    window.BrushManager.setBrush(selectedBrush);
                }
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

            if (e.key === 'c' || e.key === 'C') {
                e.preventDefault();
                if (window.clearParticles) {
                    window.clearParticles();
                }
            }

            if (e.key === 'h' || e.key === 'H') {
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
