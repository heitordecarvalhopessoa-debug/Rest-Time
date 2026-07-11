let currentUser = null;
let timerInterval = null;

let loginScreen;
let mainScreen;
let usernameInput;
let startBtn;
let logoutBtn;
let userDisplay;
let timerDisplay;

let canvas;
let ctx;
let particles = [];
let isDrawing = false;
let currentRGB = { r: 59, g: 130, b: 246 };

function init() {
    loginScreen = document.getElementById('login-screen');
    mainScreen = document.getElementById('main-screen');
    usernameInput = document.getElementById('username-input');
    startBtn = document.getElementById('start-btn');
    logoutBtn = document.getElementById('logout-btn');
    userDisplay = document.getElementById('user-display');
    timerDisplay = document.getElementById('timer-display');

    canvas = document.getElementById('relax-canvas');
    ctx = canvas.getContext('2d');

    currentUser = window.DataStorage.loadUserData();

    if (currentUser) {
        showMainScreen();
    } else {
        showLoginScreen();
    }

    startBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const hex = e.currentTarget.getAttribute('data-color');
            currentRGB = hexToRgb(hex);
        });
    });

    const picker = document.getElementById('custom-color-picker');
    if (picker) {
        picker.addEventListener('input', (e) => {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            currentRGB = hexToRgb(e.target.value);
        });
    }

    window.addEventListener('resize', resizeCanvas);
    setupCanvasInteractions();
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function handleLogin() {
    const name = usernameInput.value.trim();
    if (!name) return;

    currentUser = {
        name: name,
        totalTimeSpent: 0
    };

    window.DataStorage.saveUserData(currentUser);
    showMainScreen();
}

function handleLogout() {
    if (timerInterval) clearInterval(timerInterval);
    window.DataStorage.clearUserData();
    currentUser = null;
    showLoginScreen();
}

function showMainScreen() {
    if (!currentUser) return;

    loginScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    userDisplay.textContent = currentUser.name;

    if (window.GameVersion) {
        window.GameVersion.init();
    }

    if (window.StarTimeManager) {
        window.StarTimeManager.init();
    }

    resizeCanvas();
    updateTimerDisplay(currentUser.totalTimeSpent);
    startTimer();
    animateCanvas();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = window.setInterval(() => {
        if (!currentUser) return;

        currentUser.totalTimeSpent += 1;
        window.DataStorage.saveUserData(currentUser);

        updateTimerDisplay(currentUser.totalTimeSpent);
    }, 1000);
}

function updateTimerDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

function setupCanvasInteractions() {
    window.addEventListener('mousedown', (e) => {
        if (e.target.closest('.hotbar') || e.target.closest('.color-palette')) return;
        isDrawing = true;
    });
    window.addEventListener('mouseup', () => isDrawing = false);
    
    window.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        if (e.target.closest('.hotbar') || e.target.closest('.color-palette')) return;
        
        for (let i = 0; i < 3; i++) {
            const variance = Math.floor(Math.random() * 40 - 20);
            const r = Math.max(0, Math.min(255, currentRGB.r + variance));
            const g = Math.max(0, Math.min(255, currentRGB.g + variance));
            const b = Math.max(0, Math.min(255, currentRGB.b + variance));
            
            particles.push({
                x: e.clientX,
                y: e.clientY,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: (Math.random() - 0.5) * 1.5,
                alpha: 1,
                color: `rgba(${r}, ${g}, ${b}, `
            });
        }
    });

    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('.hotbar') || e.target.closest('.color-palette')) return;
        isDrawing = true;
    });
    window.addEventListener('touchend', () => isDrawing = false);
    window.addEventListener('touchmove', (e) => {
        if (!isDrawing || e.touches.length === 0) return;
        if (e.target.closest('.hotbar') || e.target.closest('.color-palette')) return;
        
        let touch = e.touches[0];
        for (let i = 0; i < 3; i++) {
            const variance = Math.floor(Math.random() * 40 - 20);
            const r = Math.max(0, Math.min(255, currentRGB.r + variance));
            const g = Math.max(0, Math.min(255, currentRGB.g + variance));
            const b = Math.max(0, Math.min(255, currentRGB.b + variance));

            particles.push({
                x: touch.clientX,
                y: touch.clientY,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: (Math.random() - 0.5) * 1.5,
                alpha: 1,
                color: `rgba(${r}, ${g}, ${b}, `
            });
        }
    });
}

function animateCanvas() {
    if (mainScreen.classList.contains('hidden')) return;

    ctx.fillStyle = 'rgba(11, 15, 25, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= (window.StarTimeManager ? window.StarTimeManager.decayRate : 0.008);

        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }

    requestAnimationFrame(animateCanvas);
}

document.addEventListener('DOMContentLoaded', init);
