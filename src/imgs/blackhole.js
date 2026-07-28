const BlackHoleManager = {
    active: false,
    x: 0,
    y: 0,
    radius: 20,
    gravity: 0.8,

    toggle() {
        this.active = !this.active;
    },

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    },

    updateParticles(particles) {
        if (!this.active) return;

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            const dx = this.x - p.x;
            const dy = this.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) {
                const force = this.gravity / (dist * 0.05);
                p.speedX += (dx / dist) * force;
                p.speedY += (dy / dist) * force;
            } else {
                p.alpha = 0;
            }
        }
    },

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#a855f7';
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
};

window.BlackHoleManager = BlackHoleManager;