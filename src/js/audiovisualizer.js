class AudioVisualizer {
    constructor() {
        this.audioCtx = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.bufferLength = 0;
        this.lineColor = 'rgba(59, 130, 246, 0.6)';
        this.fillColor = 'rgba(59, 130, 246, 0.15)';
        this.enabled = true;
    }

    init(audioElement) {
        if (this.audioCtx) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
            this.analyser = this.audioCtx.createAnalyser();

            this.source = this.audioCtx.createMediaElementSource(audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);

            this.analyser.fftSize = 128;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
        } catch (e) {
            console.error("Erro ao inicializar AudioContext:", e);
        }
    }

    resume() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setColor(rgb, alpha = 1.0) {
        this.lineColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(0.8, alpha)})`;
        this.fillColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.2})`;
    }

    setGradientStyle(ctx, width, gradientColors, getDynamicGradientRGB) {
        const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
        const fillGrad = ctx.createLinearGradient(0, 0, width, 0);

        const steps = 10;
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const rgb = getDynamicGradientRGB(gradientColors, progress);
            const alpha = rgb.alpha !== undefined ? rgb.alpha : 1.0;

            lineGrad.addColorStop(progress, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(0.8, alpha)})`);
            fillGrad.addColorStop(progress, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.2})`);
        }

        this.lineColor = lineGrad;
        this.fillColor = fillGrad;
    }

    draw(ctx, width, height) {
        if (!this.enabled || !this.analyser) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.lineColor;
        ctx.fillStyle = this.fillColor;
        
        ctx.beginPath();
        ctx.moveTo(0, height);

        const sliceWidth = width / (this.bufferLength - 1);
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 255.0;
            const waveHeight = v * (height * 0.35);
            const y = height - waveHeight;

            if (i === 0) {
                ctx.lineTo(x, y);
            } else {
                const prevX = x - sliceWidth;
                const prevY = height - ((this.dataArray[i - 1] / 255.0) * (height * 0.35));
                const cpX = (prevX + x) / 2;
                ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
            }

            x += sliceWidth;
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

window.AudioVisualizer = new AudioVisualizer();