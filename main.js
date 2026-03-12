import { GameEngine } from './engine.js';
import { UIManager } from './ui.js';
import { Levels } from './levels.js';
import { QAAgent } from './QAAgent.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Target resolution (16:9)
        this.targetWidth = 1200;
        this.targetHeight = 675;

        this.levels = new Levels();
        this.ui = new UIManager(this);
        this.engine = new GameEngine(this);
        this.qa = new QAAgent(this);

        this.currentLevelIndex = 0;
        this.isPaused = true;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.lastTime = 0;
        this.init();
    }

    init() {
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    resize() {
        const scale = Math.min(window.innerWidth / this.targetWidth, window.innerHeight / this.targetHeight);
        this.canvas.width = this.targetWidth;
        this.canvas.height = this.targetHeight;
        this.canvas.style.width = `${this.targetWidth * scale}px`;
        this.canvas.style.height = `${this.targetHeight * scale}px`;
        this.renderScale = scale;
    }

    startMission(levelIndex = 0) {
        this.currentLevelIndex = levelIndex;
        localStorage.setItem('graviton_saved_level', levelIndex);
        this.loadLevel(levelIndex);
        this.isPaused = false;
        this.ui.showGameUI();
    }

    resumeMission() {
        const savedLevel = parseInt(localStorage.getItem('graviton_saved_level')) || 0;
        this.currentLevelIndex = savedLevel;
        this.loadLevel(savedLevel);
        this.isPaused = false;
        this.ui.showGameUI();
    }

    loadLevel(index) {
        if (index >= this.levels.count) {
            this.victory();
            return;
        }
        this.currentLevelIndex = index;
        localStorage.setItem('graviton_saved_level', index);

        // Update max unlocked level
        const maxLevel = parseInt(localStorage.getItem('graviton_max_level')) || 1;
        if (index + 1 > maxLevel) {
            localStorage.setItem('graviton_max_level', index + 1);
        }

        const levelData = this.levels.get(index);
        this.engine.loadLevel(levelData);
        this.ui.updateLevel(index + 1);
    }

    nextLevel() {
        this.ui.addScore(500 + this.ui.coresCollected * 100);
        this.loadLevel(this.currentLevelIndex + 1);
        this.ui.hideScreens();
        this.isPaused = false;
        this.ui.showGameUI();
    }

    restartLevel() {
        this.loadLevel(this.currentLevelIndex);
        this.ui.hideScreens();
        this.isPaused = false;
        this.ui.showGameUI();
    }

    onDeath() {
        this.isPaused = true;
        this.ui.showScreen('death-screen');
    }

    onLevelComplete() {
        this.isPaused = true;
        const cores = this.engine.energyCores.filter(c => c.collected).length;
        this.ui.showLevelComplete(cores);
        this.ui.submitScore(this.ui.score, this.currentLevelIndex + 1);
    }

    victory() {
        this.isPaused = true;
        this.ui.showScreen('victory-screen');
        this.ui.submitScore(this.ui.score + 2000, this.levels.count);
    }

    gameLoop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        if (!this.isPaused) {
            this.engine.update(dt);

            // ── UI Updates ──
            const p = this.engine.player;
            this.ui.updateEnergy((p.neuralEnergy / p.maxEnergy) * 100);
            this.ui.updateGravityIndicator(p.gravityMode);
            this.ui.updateAbilityBadges(p, this.engine.isNeuralBurst);
            this.ui.updateStats(dt);
            const coresGot = this.engine.energyCores.filter(c => c.collected).length;
            this.ui.updateCores(coresGot);

            // ── QA Update ──
            this.qa.update(dt);
        }

        this.engine.draw(this.ctx);
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
