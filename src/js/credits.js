document.addEventListener('DOMContentLoaded', () => {
    const creditsBtn = document.getElementById('credits-btn');
    const creditsModal = document.getElementById('credits-modal');
    const closeCreditsBtn = document.getElementById('close-credits-btn');

    if (creditsBtn) {
        creditsBtn.addEventListener('click', () => {
            if (creditsModal) creditsModal.classList.remove('hidden');
        });
    }

    if (closeCreditsBtn) {
        closeCreditsBtn.addEventListener('click', () => {
            if (creditsModal) creditsModal.classList.add('hidden');
        });
    }

    if (creditsModal) {
        creditsModal.addEventListener('click', (e) => {
            if (e.target === creditsModal) {
                creditsModal.classList.add('hidden');
            }
        });
    }
});