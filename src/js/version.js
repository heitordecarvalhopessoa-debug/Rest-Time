const GameVersion = {
    current: "v1.0.0",
    init: function() {
        const display = document.getElementById('version-display');
        if (display) {
            display.textContent = this.current;
        }
    }
};

window.GameVersion = GameVersion;