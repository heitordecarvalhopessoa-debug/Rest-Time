let currentUser = null;
let timerInterval = null;

let loginScreen;
let mainScreen;
let usernameInput;
let startBtn;
let logoutBtn;
let userDisplay;
let timerDisplay;
let paletteToggleBtn;
let sidePalette;

let musicMenuToggleBtn;
let musicBoxPanel;
let musicUpload;
let audioPlayer;
let musicPlayBtn;
let musicPlaylist;
let musicVolumeSlider;

let canvas;
let ctx;
let particles = [];
let isDrawing = false;
let currentRGB = { r: 59, g: 130, b: 246 };
let maxParticlesPerFrame = 3;
let baseParticleSize = 4;
let particleSpeedFactor = 1;
let currentShape = 'circle';

let uploadedTracks = [];
let activeTrackIndex = -1;

function init() {
    loginScreen = document.getElementById('login-screen');
    mainScreen = document.getElementById('main-screen');
    usernameInput = document.getElementById('username-input');
    startBtn = document.getElementById('start-btn');
    logoutBtn = document.getElementById('logout-btn');
    userDisplay = document.getElementById('user-display');
    timerDisplay = document.getElementById('timer-display');
    paletteToggleBtn = document.getElementById('palette-toggle-btn');
    sidePalette = document.getElementById('side-palette');

    musicMenuToggleBtn = document.getElementById('music-menu-toggle-btn');
    musicBoxPanel = document.getElementById('music-box-panel');
    musicUpload = document.getElementById('music-upload');
    audioPlayer = document.getElementById('bg-audio');
    musicPlayBtn = document.getElementById('music-play-btn');
    musicPlaylist = document.getElementById('music-playlist');
    musicVolumeSlider = document.getElementById('music-volume-slider');

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

    paletteToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidePalette.classList.toggle('closed');
        paletteToggleBtn.classList.toggle('active');
        musicBoxPanel.classList.add('closed');
    });

    musicMenuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        musicBoxPanel.classList.toggle('closed');
        sidePalette.classList.add('closed');
        paletteToggleBtn.classList.remove('active');
    });

    document.addEventListener('click', () => {
        if (sidePalette && !sidePalette.classList.contains('closed')) {
            sidePalette.classList.add('closed');
            paletteToggleBtn.classList.remove('active');
        }
        if (musicBoxPanel && !musicBoxPanel.classList.contains('closed')) {
            musicBoxPanel.classList.add('closed');
        }
    });

    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentShape = e.currentTarget.getAttribute('data-shape');
        });
    });

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

    const countSlider = document.getElementById('particle-count-slider');
    if (countSlider) {
        maxParticlesPerFrame = parseInt(countSlider.value);
        countSlider.addEventListener('input', (e) => {
            maxParticlesPerFrame = parseInt(e.target.value);
        });
    }

    const sizeSlider = document.getElementById('particle-size-slider');
    if (sizeSlider) {
        baseParticleSize = parseInt(sizeSlider.value);
        sizeSlider.addEventListener('input', (e) => {
            baseParticleSize = parseInt(e.target.value);
        });
    }

    const speedSlider = document.getElementById('particle-speed-slider');
    if (speedSlider) {
        particleSpeedFactor = parseInt(speedSlider.value) / 5;
        speedSlider.addEventListener('input', (e) => {
            particleSpeedFactor = parseInt(e.target.value) / 5;
        });
    }

    if (audioPlayer && musicVolumeSlider) {
        audioPlayer.volume = musicVolumeSlider.value / 100;
        musicVolumeSlider.addEventListener('input', (e) => {
            audioPlayer.volume = e.target.value / 100;
        });
    }

    if (musicUpload) {
        musicUpload.addEventListener('change', handleMusicUpload);
    }

    if (musicPlayBtn) {
        musicPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAudioPlayback();
        });
    }

    window.addEventListener('resize', resizeCanvas);
    setupCanvasInteractions();
}

async function handleMusicUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const trackData = {
            name: file.name,
            file: file
        };
        await window.DataStorage.saveSingleTrack(trackData);
    }
    
    e.target.value = '';
    
    try {
        const savedTracks = await window.DataStorage.loadMusicData();
        
        uploadedTracks.forEach(track => {
            if (track.url) URL.revokeObjectURL(track.url);
        });

        uploadedTracks = savedTracks.filter(t => t && t.file).map(track => ({
            id: track.id,
            name: track.name,
            file: track.file,
            url: URL.createObjectURL(track.file)
        }));
        
        renderPlaylist();

        if (activeTrackIndex === -1 && uploadedTracks.length > 0) {
            selectTrack(0);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderPlaylist() {
    if (!musicPlaylist) return;
    musicPlaylist.innerHTML = '';

    if (uploadedTracks.length === 0) {
        musicPlaylist.innerHTML = '<div class="no-tracks-hint">No tracks added yet.</div>';
        return;
    }

    uploadedTracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'track-item' + (index === activeTrackIndex ? ' active' : '');
        item.textContent = track.name;
        item.title = track.name;
        
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectTrack(index);
        });
        
        musicPlaylist.appendChild(item);
    });
}

function selectTrack(index) {
    if (!audioPlayer || !uploadedTracks[index]) return;

    activeTrackIndex = index;
    
    if (!uploadedTracks[index].url && uploadedTracks[index].file) {
        uploadedTracks[index].url = URL.createObjectURL(uploadedTracks[index].file);
    }

    audioPlayer.src = uploadedTracks[index].url;
    musicPlayBtn.disabled = false;
    
    renderPlaylist();
    
    audioPlayer.play().then(() => {
        musicPlayBtn.textContent = '⏸';
    }).catch(err => console.log("Playback interrupted: ", err));
}

function toggleAudioPlayback() {
    if (!audioPlayer || activeTrackIndex === -1) return;

    if (audioPlayer.paused) {
        audioPlayer.play().then(() => {
            musicPlayBtn.textContent = '⏸';
        });
    } else {
        audioPlayer.pause();
        musicPlayBtn.textContent = '▶';
    }
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

async function handleLogout() {
    if (timerInterval) clearInterval(timerInterval);
    
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
    }
    
    uploadedTracks.forEach(track => {
        if (track.url) URL.revokeObjectURL(track.url);
    });

    uploadedTracks = [];
    activeTrackIndex = -1;
    if (musicPlayBtn) {
        musicPlayBtn.disabled = true;
        musicPlayBtn.textContent = '▶';
    }
    renderPlaylist();

    await window.DataStorage.clearUserData();
    currentUser = null;
    showLoginScreen();
}

async function showMainScreen() {
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

    try {
        const savedTracks = await window.DataStorage.loadMusicData();
        
        uploadedTracks = savedTracks.filter(t => t && t.file).map(track => {
            return {
                id: track.id,
                name: track.name,
                file: track.file,
                url: URL.createObjectURL(track.file)
            };
        });

        renderPlaylist();
        
        if (uploadedTracks.length > 0) {
            activeTrackIndex = 0;
            if (audioPlayer) {
                audioPlayer.src = uploadedTracks[0].url;
                musicPlayBtn.disabled = false;
            }
        }
    } catch (err) {
        console.error(err);
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
        if (e.target.closest('.hotbar') || e.target.closest('.color-palette') || e.target.closest('.palette-toggle') || e.target.closest('.music-box') || e.target.closest('.music-toggle-btn')) return;
        isDrawing = true;
    });
    window.addEventListener('mouseup', () => isDrawing = false);
    
    window.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        if (e.target.closest('.hotbar') || e.target.closest('.color-palette') || e.target.closest('.palette-toggle') || e.target.closest('.music-box') || e.target.closest('.music-toggle-btn')) return;
        
        for (let i = 0; i < maxParticlesPerFrame; i++) {
            const variance = Math.floor(Math.random() * 40 - 20);
            const r = Math.max(0, Math.min(255, currentRGB.r + variance));
            const g = Math.max(0, Math.min(255, currentRGB.g + variance));
            const b = Math.max(0, Math.min(255, currentRGB.b + variance));
            
            const sizeVariance = (Math.random() * 0.5 + 0.75);
            
            particles.push({
                x: e.clientX,
                y: e.clientY,
                size: baseParticleSize * sizeVariance,
                speedX: (Math.random() - 0.5) * 1.5 * particleSpeedFactor,
                speedY: (Math.random() - 0.5) * 1.5 * particleSpeedFactor,
                alpha: 1,
                shape: currentShape,
                color: `rgba(${r}, ${g}, ${b}, `
            });
        }
    });

    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('.hotbar') || e.target.closest('.color-palette') || e.target.closest('.palette-toggle') || e.target.closest('.music-box') || e.target.closest('.music-toggle-btn')) return;
        isDrawing = true;
    });
    window.addEventListener('touchend', () => isDrawing = false);
    window.addEventListener('touchmove', (e) => {
        if (!isDrawing || e.touches.length === 0) return;
        if (e.target.closest('.hotbar') || e.target.closest('.color-palette') || e.target.closest('.palette-toggle') || e.target.closest('.music-box') || e.target.closest('.music-toggle-btn')) return;
        
        let touch = e.touches[0];
        for (let i = 0; i < maxParticlesPerFrame; i++) {
            const variance = Math.floor(Math.random() * 40 - 20);
            const r = Math.max(0, Math.min(255, currentRGB.r + variance));
            const g = Math.max(0, Math.min(255, currentRGB.g + variance));
            const b = Math.max(0, Math.min(255, currentRGB.b + variance));

            const sizeVariance = (Math.random() * 0.5 + 0.75);

            particles.push({
                x: touch.clientX,
                y: touch.clientY,
                size: baseParticleSize * sizeVariance,
                speedX: (Math.random() - 0.5) * 1.5 * particleSpeedFactor,
                speedY: (Math.random() - 0.5) * 1.5 * particleSpeedFactor,
                alpha: 1,
                shape: currentShape,
                color: `rgba(${r}, ${g}, ${b}, `
            });
        }
    });
}

function drawStar(x, y, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let cx = x;
    let cy = y;
    let step = Math.PI / spikes;

    ctx.moveTo(x, y - outerRadius);
    for (let i = 0; i < spikes; i++) {
        cx = x + Math.cos(rot) * outerRadius;
        cy = y + Math.sin(rot) * outerRadius;
        ctx.lineTo(cx, cy);
        rot += step;

        cx = x + Math.cos(rot) * innerRadius;
        cy = y + Math.sin(rot) * innerRadius;
        ctx.lineTo(cx, cy);
        rot += step;
    }
    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
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
        ctx.strokeStyle = p.color + p.alpha + ')';
        ctx.beginPath();

        if (p.shape === 'square') {
            ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        } else if (p.shape === 'triangle') {
            ctx.moveTo(p.x, p.y - p.size);
            ctx.lineTo(p.x + p.size, p.y + p.size);
            ctx.lineTo(p.x - p.size, p.y + p.size);
            ctx.closePath();
            ctx.fill();
        } else if (p.shape === 'star') {
            drawStar(p.x, p.y, 5, p.size * 1.8, p.size * 0.8);
            ctx.fill();
        } else if (p.shape === 'cross') {
            ctx.lineWidth = p.size * 0.5;
            ctx.moveTo(p.x - p.size, p.y);
            ctx.lineTo(p.x + p.size, p.y);
            ctx.moveTo(p.x, p.y - p.size);
            ctx.lineTo(p.x, p.y + p.size);
            ctx.stroke();
        } else {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }

    requestAnimationFrame(animateCanvas);
}

document.addEventListener('DOMContentLoaded', init);
