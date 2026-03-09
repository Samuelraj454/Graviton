export class UIManager {
    constructor(game) {
        this.game = game;
        this.apiBase = 'http://localhost:5000/api';
        this.score = 0;
        this.coresCollected = 0;

        this.screens = {
            'start-screen': document.getElementById('start-screen'),
            'complete-screen': document.getElementById('complete-screen'),
            'death-screen': document.getElementById('death-screen'),
            'victory-screen': document.getElementById('victory-screen'),
            'leaderboard-screen': document.getElementById('leaderboard-screen'),
            'settings-screen': document.getElementById('settings-screen')
        };

        this.gameUI = document.getElementById('game-ui');
        this.levelNum = document.getElementById('level-num');
        this.neuralFill = document.getElementById('neural-fill');
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.coresDisplay = document.getElementById('cores-count');
        this.gravArrow = document.getElementById('grav-arrow');
        this.badgeMagnetic = document.getElementById('badge-magnetic');
        this.badgeDash = document.getElementById('badge-dash');
        this.badgeBurst = document.getElementById('badge-burst');
        this.sectorStats = document.getElementById('sector-stats');
        this.totalLevelsNum = document.getElementById('total-levels');
        this.resumeBtn = document.getElementById('resume-btn');

        this.checkSaveGame();

        if (this.totalLevelsNum) {
            this.totalLevelsNum.textContent = this.game.levels.count;
        }

        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('start-btn').onclick = () => this.game.startMission();
        if (this.resumeBtn) {
            this.resumeBtn.onclick = () => this.game.resumeMission();
        }
        document.getElementById('next-btn').onclick = () => this.game.nextLevel();
        document.getElementById('retry-btn').onclick = () => {
            this.score = 0;
            this.coresCollected = 0;
            this.game.restartLevel();
        };
        document.getElementById('restart-btn').onclick = () => this.game.restartLevel();
        document.getElementById('play-again-btn').onclick = () => {
            this.score = 0;
            this.coresCollected = 0;
            this.game.startMission();
        };

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.onclick = () => {
                this.game.isPaused = true;
                this.showScreen('start-screen');
                this.checkSaveGame();
            };
        }

        document.getElementById('leaderboard-btn').onclick = () => this.showLeaderboard();
        document.getElementById('close-leaderboard-btn').onclick = () => this.showScreen('start-screen');

        // Settings
        document.getElementById('settings-btn').onclick = () => this.showScreen('settings-screen');
        document.getElementById('close-settings-btn').onclick = () => this.showScreen('start-screen');

        const volumeSlider = document.getElementById('volume-slider');
        const muteBtn = document.getElementById('mute-btn');

        if (volumeSlider) {
            volumeSlider.oninput = (e) => {
                this.game.engine.sounds.setVolume(parseFloat(e.target.value));
            };
        }

        if (muteBtn) {
            muteBtn.onclick = () => {
                const muted = this.game.engine.sounds.toggleMute();
                muteBtn.textContent = muted ? 'UNMUTE AUDIO' : 'MUTE AUDIO';
                muteBtn.style.borderColor = muted ? 'var(--danger)' : 'var(--accent)';
                muteBtn.style.color = muted ? 'var(--danger)' : 'var(--accent)';
            };
        }

        window.addEventListener('keydown', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'r' && !this.game.isPaused) this.game.restartLevel();
            if (k === 'l' && this.game.isPaused) this.showLeaderboard();
            if (k === 'escape' && !this.game.isPaused) {
                this.game.isPaused = true;
                this.showScreen('death-screen');
            }
        });
    }

    showScreen(screenId) {
        this.hideScreens();
        if (this.screens[screenId]) {
            this.screens[screenId].classList.remove('hidden');
        }
    }

    hideScreens() {
        Object.values(this.screens).forEach(s => { if (s) s.classList.add('hidden'); });
        if (this.gameUI) this.gameUI.classList.add('hidden');
    }

    showGameUI() {
        this.hideScreens();
        this.gameUI.classList.remove('hidden');
    }

    updateLevel(num) {
        if (this.levelNum) this.levelNum.textContent = num.toString().padStart(2, '0');
        this.coresCollected = 0;
        this.updateCores(0);
    }

    updateEnergy(percent) {
        if (this.neuralFill) this.neuralFill.style.width = `${Math.max(0, percent)}%`;
    }

    updateCores(count) {
        this.coresCollected = count;
        if (this.coresDisplay) this.coresDisplay.textContent = count;
    }

    updateAbilityBadges(player, isNeuralBurst) {
        if (!this.badgeMagnetic) return;
        this.badgeMagnetic.classList.toggle('active', player.isMagnetic);
        this.badgeMagnetic.classList.toggle('magnetic', player.isMagnetic);
        this.badgeDash.classList.toggle('active', player.dashCooldown <= 0);
        this.badgeBurst.classList.toggle('active', isNeuralBurst);
    }

    updateGravityIndicator(mode) {
        if (!this.gravArrow) return;
        const arrows = { down: '↓', up: '↑', left: '←', right: '→' };
        const angles = { down: '0deg', up: '180deg', left: '90deg', right: '270deg' };
        this.gravArrow.textContent = arrows[mode] || '↓';
    }

    addScore(points) {
        this.score += points;
    }

    async showLeaderboard() {
        this.showScreen('leaderboard-screen');
        this.leaderboardList.innerHTML = '<div class="leaderboard-item header"><span>OPERATIVE</span><span>SCORE</span><span>SECTOR</span></div>';

        try {
            const response = await fetch(`${this.apiBase}/leaderboard`);
            const data = await response.json();
            data.forEach((item, i) => {
                const row = document.createElement('div');
                row.className = 'leaderboard-item';
                row.innerHTML = `<span>${i === 0 ? '🏆 ' : ''}${item.name}</span><span>${item.score.toLocaleString()}</span><span>${item.sector}</span>`;
                this.leaderboardList.appendChild(row);
            });
        } catch {
            this.leaderboardList.innerHTML += '<div class="leaderboard-item"><span>[ UPLINK OFFLINE ]</span><span>—</span><span>—</span></div>';
        }
    }

    async submitScore(name, score, sector) {
        try {
            await fetch(`${this.apiBase}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score, sector })
            });
        } catch { /* offline */ }
    }

    showLevelComplete(coresCount) {
        if (this.sectorStats) {
            this.sectorStats.textContent = `ENERGY CORES RECOVERED: ${coresCount}`;
        }
        this.showScreen('complete-screen');
    }

    checkSaveGame() {
        const savedLevel = localStorage.getItem('graviton_saved_level');
        if (savedLevel && parseInt(savedLevel) > 0) {
            if (this.resumeBtn) this.resumeBtn.classList.remove('hidden');
        } else {
            if (this.resumeBtn) this.resumeBtn.classList.add('hidden');
        }
    }
}
