const StarTimeManager = {
    decayRate: 0.008,
    
    init: function() {
        const slider = document.getElementById('particle-lifetime-slider');
        if (slider) {
            this.updateDecay(slider.value);
            slider.addEventListener('input', (e) => {
                this.updateDecay(e.target.value);
            });
        }
    },
    
    updateDecay: function(value) {
        const val = parseInt(value);
        this.decayRate = 0.022 - (val * 0.002);
    }
};

window.StarTimeManager = StarTimeManager;
