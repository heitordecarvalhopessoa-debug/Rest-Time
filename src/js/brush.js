const BrushManager = {
    type: 'normal',
    radius: 30,
    cursorElement: null,

    init() {
        this.cursorElement = document.createElement('div');
        this.cursorElement.id = 'brush-cursor';
        this.cursorElement.style.position = 'fixed';
        this.cursorElement.style.pointerEvents = 'none';
        this.cursorElement.style.border = '1px dashed rgba(255, 255, 255, 0.4)';
        this.cursorElement.style.borderRadius = '50%';
        this.cursorElement.style.transform = 'translate(-50%, -50%)';
        this.cursorElement.style.zIndex = '9998';
        this.cursorElement.style.display = 'none';
        document.body.appendChild(this.cursorElement);

        this.updateCursorSize();
        this.setupEvents();
    },

    updateCursorSize() {
        this.cursorElement.style.width = (this.radius * 2) + 'px';
        this.cursorElement.style.height = (this.radius * 2) + 'px';
    },

    setBrush(newType) {
        this.type = newType;
    },

    setRadius(newRadius) {
        this.radius = newRadius;
        this.updateCursorSize();
    },

    setupEvents() {
        window.addEventListener('mousemove', (e) => {
            if (window.isEraserActive) {
                this.cursorElement.style.display = 'none';
                return;
            }
            this.cursorElement.style.display = 'block';
            this.cursorElement.style.left = e.clientX + 'px';
            this.cursorElement.style.top = e.clientY + 'px';
        });

        window.addEventListener('mouseleave', () => {
            this.cursorElement.style.display = 'none';
        });
    },

    spawnParticle(x, y, speedXOverride, speedYOverride) {
        const sizeVariance = (Math.random() * 0.5 + 0.75);
        
        let sx = speedXOverride !== undefined ? speedXOverride : (Math.random() - 0.5) * 1.5 * particleSpeedFactor;
        let sy = speedYOverride !== undefined ? speedYOverride : (Math.random() - 0.5) * 1.5 * particleSpeedFactor;

        particles.push({
            x: x,
            y: y,
            size: baseParticleSize * sizeVariance,
            speedX: sx,
            speedY: sy,
            alpha: 1,
            initialAlpha: 1,
            shape: currentShape,
            fixedRGB: !isGradientActive ? { ...currentRGB } : null
        });
    },

    useBrush(x, y, isClick = false) {
        if (this.type === 'normal' && !isClick) {
            for (let i = 0; i < maxParticlesPerFrame; i++) {
                this.spawnParticle(x, y);
            }
        } 
        else if (this.type === 'random' && !isClick) {
            for (let i = 0; i < maxParticlesPerFrame; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random()) * this.radius;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                this.spawnParticle(px, py);
            }
        }
        else if (this.type === 'explode' && isClick) {
            const explosionCount = maxParticlesPerFrame * 15;
            for (let i = 0; i < explosionCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (Math.random() * 5 + 2) * particleSpeedFactor;
                const sx = Math.cos(angle) * speed;
                const sy = Math.sin(angle) * speed;
                this.spawnParticle(x, y, sx, sy);
            }
        }
        else if (this.type === 'meteor' && !isClick) {
            for (let i = 0; i < maxParticlesPerFrame; i++) {
                const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.4;
                const speed = (Math.random() * 6 + 4) * particleSpeedFactor;
                const sx = Math.cos(angle) * speed;
                const sy = Math.sin(angle) * speed;

                const offsetX = (Math.random() - 0.5) * (this.radius * 0.5);
                const offsetY = (Math.random() - 0.5) * (this.radius * 0.5);

                this.spawnParticle(x + offsetX, y + offsetY, sx, sy);
            }
        }
        else if (this.type === 'rain' && !isClick) {
            for (let i = 0; i < maxParticlesPerFrame; i++) {
                const angle = (Math.PI / 2) + (Math.random() - 0.5) * 0.5;
                const speed = (Math.random() * 7 + 3) * particleSpeedFactor;
                const sx = Math.cos(angle) * speed;
                const sy = Math.sin(angle) * speed;

                const offsetX = (Math.random() - 0.5) * (this.radius * 0.3);

                this.spawnParticle(x + offsetX, y, sx, sy);
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    BrushManager.init();
});