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
            'settings-screen': document.getElementById('settings-screen'),
            'how-to-play-screen': document.getElementById('how-to-play-screen'),
            'level-select-screen': document.getElementById('level-select-screen'),
            'pause-screen': document.getElementById('pause-screen'),
            'credits-screen': document.getElementById('credits-screen')
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
        this.livesDisplay = document.getElementById('lives-count');
        this.coinsDisplayHUD = document.getElementById('coins-count');
        this.timerDisplay = document.getElementById('level-timer');
        this.sectorStats = document.getElementById('sector-stats');
        this.totalLevelsNum = document.getElementById('total-levels');
        this.startBtn = document.getElementById('start-btn');
        this.resumeBtn = document.getElementById('resume-btn');
        this.authBtn = document.getElementById('auth-btn');
        this.userDisplay = document.getElementById('user-display');
        this.displayName = document.getElementById('display-name');
        this.authMessage = document.getElementById('auth-message');

        this.currentUser = JSON.parse(localStorage.getItem('graviton_user')) || null;
        this.updateUserDisplay();
        this.playerNameInput = document.getElementById('player-name');
        this.mobileControls = document.getElementById('mobile-controls');

        if (this.playerNameInput) {
            this.playerNameInput.value = localStorage.getItem('graviton_player_name') || '';
        }

        this.checkSaveGame();

        if (this.totalLevelsNum) {
            this.totalLevelsNum.textContent = this.game.levels.count;
        }

        this.initEventListeners();
        this.initMobileControls();
    }

    initMobileControls() {
        if (!this.mobileControls) return;

        const bindBtn = (id, key, action = null) => {
            const btn = document.getElementById(id);
            if (!btn) return;

            const startHandler = (e) => {
                e.preventDefault();
                this.game.engine.keys[key] = true;
                if (action) action();
            };
            const endHandler = (e) => {
                e.preventDefault();
                this.game.engine.keys[key] = false;
            };

            btn.addEventListener('touchstart', startHandler);
            btn.addEventListener('touchend', endHandler);
            btn.addEventListener('mousedown', startHandler);
            btn.addEventListener('mouseup', endHandler);
            btn.addEventListener('mouseleave', endHandler);
        };

        // Movement keys
        bindBtn('v-a', 'a');
        bindBtn('v-d', 'd');
        bindBtn('v-w', 'w');
        bindBtn('v-s', 's');

        // Gravity flips
        bindBtn('v-up', 'arrowup', () => this.game.engine.setGravity('up'));
        bindBtn('v-down', 'arrowdown', () => this.game.engine.setGravity('down'));
        bindBtn('v-left', 'arrowleft', () => this.game.engine.setGravity('left'));
        bindBtn('v-right', 'arrowright', () => this.game.engine.setGravity('right'));

        // Action buttons
        bindBtn('v-jump', ' ', () => this.game.engine.jump());
        bindBtn('v-dash', 'z', () => this.game.engine.dash());
        bindBtn('v-boots', 'm', () => this.game.engine.toggleMagnetic());

        const slowBtn = document.getElementById('v-slow');
        if (slowBtn) {
            slowBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.engine.toggleNeuralBurst(true);
            });
            slowBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.game.engine.toggleNeuralBurst(false);
            });
            slowBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.game.engine.toggleNeuralBurst(true);
            });
            slowBtn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.game.engine.toggleNeuralBurst(false);
            });
        }
    }

    initEventListeners() {
        if (this.startBtn) {
            this.startBtn.onclick = () => {
                this.game.engine.sounds.resume();
                this.game.startMission();
            };
        }
        if (this.resumeBtn) {
            this.resumeBtn.onclick = () => {
                this.game.engine.sounds.resume();
                this.game.resumeMission();
            };
        }
        document.getElementById('next-btn').onclick = () => {
            this.game.engine.sounds.resume();
            this.game.nextLevel();
        };
        document.getElementById('retry-btn').onclick = () => {
            this.game.engine.sounds.resume();
            this.score = 0;
            this.coresCollected = 0;
            this.game.restartLevel();
        };
        document.getElementById('restart-btn').onclick = () => this.game.restartLevel();
        document.getElementById('play-again-btn').onclick = () => {
            this.game.engine.sounds.resume();
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

        // New screens back buttons
        const htpBtn = document.getElementById('how-to-play-btn');
        if (htpBtn) htpBtn.onclick = () => this.showScreen('how-to-play-screen');
        if (document.getElementById('how-to-back-btn')) {
            document.getElementById('how-to-back-btn').onclick = () => this.showScreen('start-screen');
        }

        const lsBtn = document.getElementById('level-select-btn');
        if (lsBtn) lsBtn.onclick = () => this.showLevelSelect();
        if (document.getElementById('level-back-btn')) {
            document.getElementById('level-back-btn').onclick = () => this.showScreen('start-screen');
        }

        const creditsBtn = document.getElementById('credits-btn');
        if (creditsBtn) creditsBtn.onclick = () => this.showScreen('credits-screen');
        const creditsBackBtn = document.getElementById('credits-back-btn');
        if (creditsBackBtn) creditsBackBtn.onclick = () => this.showScreen('start-screen');

        // Pause Menu Listeners
        const prBtn = document.getElementById('pause-resume-btn');
        if (prBtn) prBtn.onclick = () => {
            this.game.isPaused = false;
            this.showGameUI();
        };
        const restartPauseBtn = document.getElementById('pause-restart-btn');
        if (restartPauseBtn) restartPauseBtn.onclick = () => {
            this.game.isPaused = false;
            this.game.restartLevel();
        };
        const homePauseBtn = document.getElementById('pause-home-btn');
        if (homePauseBtn) homePauseBtn.onclick = () => {
            this.game.isPaused = true;
            this.showScreen('start-screen');
        };

        const homeDeathBtn = document.getElementById('death-home-btn');
        if (homeDeathBtn) homeDeathBtn.onclick = () => {
            this.game.isPaused = true;
            this.showScreen('start-screen');
        };

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

        if (this.authBtn) this.authBtn.addEventListener('click', () => {
            this.game.engine.sounds.resume();
            if (this.currentUser) {
                // Logout
                this.currentUser = null;
                localStorage.removeItem('graviton_user');
                this.updateUserDisplay();
                this.showScreen('start-screen');
            } else {
                // Show login/register screen
                this.showScreen('auth-screen');
            }
        });

        if (document.getElementById('auth-back-btn')) {
            document.getElementById('auth-back-btn').addEventListener('click', () => this.showScreen('start-screen'));
        }

        if (document.getElementById('login-btn')) {
            document.getElementById('login-btn').addEventListener('click', () => this.handleAuth('login'));
        }

        if (document.getElementById('register-btn')) {
            document.getElementById('register-btn').addEventListener('click', () => this.handleAuth('register'));
        }

        const fsBtn = document.getElementById('fullscreen-btn');
        if (fsBtn) {
            fsBtn.onclick = () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                    });
                    fsBtn.textContent = 'EXIT FULLSCREEN';
                } else {
                    document.exitFullscreen();
                    fsBtn.textContent = 'ENTER FULLSCREEN';
                }
            };
        }

        window.addEventListener('keydown', (e) => {
            const k = e.key.toLowerCase();
            if (k === 'r' && !this.game.isPaused) this.game.restartLevel();
            if (k === 'l' && this.game.isPaused) this.showLeaderboard();
            if (k === 'escape') {
                if (!this.game.isPaused && this.gameUI && !this.gameUI.classList.contains('hidden')) {
                    this.game.isPaused = true;
                    this.showScreen('pause-screen');
                } else if (this.game.isPaused && this.screens['pause-screen'] && !this.screens['pause-screen'].classList.contains('hidden')) {
                    this.game.isPaused = false;
                    this.showGameUI();
                }
            }
            if (k === 'q') {
                if (this.game.qa.active) this.game.qa.stop();
                else this.game.qa.start('expert');
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
        if (this.mobileControls) this.mobileControls.classList.add('hidden');
    }

    showGameUI() {
        this.hideScreens();
        this.gameUI.classList.remove('hidden');
        if (this.mobileControls && (('ontouchstart' in window) || navigator.maxTouchPoints > 0)) {
            this.mobileControls.classList.remove('hidden');
        }
    }

    updateLevel(num) {
        if (this.levelNum) this.levelNum.textContent = num.toString().padStart(2, '0');
        this.coresCollected = 0;
        this.updateCores(0);
        if (this.livesDisplay) this.livesDisplay.textContent = this.game.engine.player.lives;
    }

    updateStats(dt) {
        const p = this.game.engine.player;
        if (this.livesDisplay) this.livesDisplay.textContent = p.lives;
        if (this.coinsDisplayHUD) this.coinsDisplayHUD.textContent = p.coins;

        const mins = Math.floor(p.levelTimer / 60);
        const secs = Math.floor(p.levelTimer % 60);
        if (this.timerDisplay) this.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

    showLevelSelect() {
        this.filterLevels('w1');
    }

    filterLevels(worldId) {
        this.showScreen('level-select-screen');

        // Update tab styles
        const tabs = document.querySelectorAll('.world-tabs .badge');
        tabs.forEach(t => {
            t.classList.remove('active');
            if (t.textContent.toLowerCase().includes(worldId)) t.classList.add('active');
        });

        const grid = document.getElementById('level-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const maxUnlocked = parseInt(localStorage.getItem('graviton_max_level')) || 1;

        const worldRanges = {
            'w1': { start: 1, end: 20 },
            'w2': { start: 21, end: 100 },
            'w3': { start: 101, end: 200 },
            'w4': { start: 201, end: 350 },
            'w5': { start: 351, end: 500 }
        };

        const range = worldRanges[worldId] || worldRanges['w1'];

        for (let i = range.start; i <= range.end; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            if (i > maxUnlocked) btn.classList.add('locked');

            btn.innerHTML = `SECTOR ${i.toString().padStart(2, '0')}`;
            if (i <= maxUnlocked) {
                btn.onclick = () => {
                    this.game.startMission(i - 1);
                };
            }
            grid.appendChild(btn);
        }
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

    async submitScore(score, sector) {
        let name = 'OPERATIVE';
        if (this.currentUser) {
            name = this.currentUser.username;
        } else {
            name = this.playerNameInput?.value || 'OPERATIVE';
        }
        localStorage.setItem('graviton_player_name', name);
        try {
            await fetch(`${this.apiBase}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score, sector })
            });
        } catch { /* offline */ }
    }

    showLevelComplete(coresCount) {
        const p = this.game.engine.player;
        const time = p.levelTimer;

        // Star Logic (Time based)
        let stars = 1;
        if (time < 30) stars = 3;
        else if (time < 60) stars = 2;

        if (this.sectorStats) {
            this.sectorStats.innerHTML = `
                <div style="font-size:1.5rem; color:#ffcc00; margin-bottom:1rem;">
                    ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}
                </div>
                DATA CORES: ${coresCount}<br>
                COINS: ${p.coins}<br>
                TIME: ${Math.floor(time)}s
            `;
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

    updateUserDisplay() {
        if (this.currentUser) {
            if (this.userDisplay) this.userDisplay.classList.remove('hidden');
            if (this.displayName) this.displayName.textContent = this.currentUser.username;
            if (this.authBtn) this.authBtn.textContent = 'LOGOUT';
        } else {
            if (this.userDisplay) this.userDisplay.classList.add('hidden');
            if (this.authBtn) this.authBtn.textContent = 'LOGIN / REGISTER';
        }
    }

    async handleAuth(type) {
        const username = document.getElementById('auth-username').value;
        const password = document.getElementById('auth-password').value;
        const url = type === 'login' ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/register';

        if (!username || !password) {
            this.authMessage.textContent = 'MISSING CREDENTIALS';
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                if (type === 'login') {
                    this.currentUser = data;
                    localStorage.setItem('graviton_user', JSON.stringify(data));
                    this.updateUserDisplay();
                    this.showScreen('start-screen');
                } else {
                    this.authMessage.textContent = 'REGISTRATION COMPLETE. PLEASE LOGIN.';
                    this.authMessage.style.color = '#00f2ff';
                }
            } else {
                this.authMessage.textContent = data.error || 'UPLINK FAILED';
                this.authMessage.style.color = '#ff0055';
            }
        } catch (err) {
            this.authMessage.textContent = 'SERVER OFFLINE';
        }
    }
}
