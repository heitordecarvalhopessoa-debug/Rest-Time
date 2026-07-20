const FPSCounter = {
    fpsDisplay: null,
    frameCount: 0,
    lastTime: performance.now(),
    fps: 0,

    init() {
        this.fpsDisplay = document.getElementById('fps-display');
        if (!this.fpsDisplay) {
            const container = document.querySelector('.left-controls-column');
            if (container) {
                this.fpsDisplay = document.createElement('div');
                this.fpsDisplay.id = 'fps-display';
                this.fpsDisplay.className = 'fps-counter-tag';
                container.appendChild(this.fpsDisplay)
            }
        }
        this.update();
    },

    update() {
        const now = performance.now();
        this.frameCount++;

        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
            if (this.fpsDisplay) {
                this.fpsDisplay.textContent = `FPS: ${this.fps}`;
            }
        }

        requestAnimationFrame(() => this.update());
    }
};

window.FPSCounter = FPSCounter;

document.addEventListener('DOMContentLoaded', () => {
    FPSCounter.init();
});
