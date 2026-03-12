import { SentinelBrain } from './ml/SentinelBrain.js';
import { SoundManager } from './SoundManager.js';

export class GameEngine {
    constructor(game) {
        this.game = game;
        this.sounds = new SoundManager();
        this.sentinelBrain = new SentinelBrain(game);

        this.player = {
            x: 0,
            y: 0,
            width: 30,
            height: 40,
            vx: 0,
            vy: 0,
            gravityMode: 'down', // down, up, left, right
            gravityAngle: 0,
            targetGravityAngle: 0,
            speed: 500,
            friction: 0.95,
            jumpForce: 700,
            onGround: false,
            color: '#00f2ff',
            trail: [],
            neuralEnergy: 100,
            maxEnergy: 100,
            dashCooldown: 0,
            boostEnergy: 100,
            isDashing: false,
            isMagnetic: false,
            lives: 3,
            coins: 0,
            levelTimer: 0
        };

        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            angle: 0,
            targetAngle: 0,
            zoom: 1,
            targetZoom: 1,
            shake: 0
        };

        this.timeScale = 1.0;
        this.isNeuralBurst = false;

        this.platforms = [];
        this.spikes = [];
        this.lasers = [];
        this.rotatingLasers = [];
        this.energyCores = [];
        this.particles = [];
        this.debris = [];
        this.portal = { x: 0, y: 0, width: 50, height: 70 };
        this.movingPlatforms = [];
        this.sentinels = [];
        this.ambientSparks = [];
        this.blackHoles = [];
        this.gravityZones = [];
        this.teleporters = [];
        this.coins = [];

        // Particle Object Pool
        this.particlePool = Array.from({ length: 1000 }, () => ({ active: false }));

        this.gravityConstant = 1800;
        this.keys = {};
        this.flashEffect = 0;

        // Player visual properties
        this.player.squash = 1.0;
        this.player.stretch = 1.0;
        this.player.frameTimer = 0;
        this.player.currentFrame = 0;

        this.initInput();
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            if (this.game.isPaused) return;
            const key = e.key.toLowerCase();
            this.keys[key] = true;

            // Gravity Flips
            if (key === 'arrowup') this.setGravity('up');
            if (key === 'arrowdown') this.setGravity('down');
            if (key === 'arrowleft') this.setGravity('left');
            if (key === 'arrowright') this.setGravity('right');

            if (key === ' ') this.jump();
            if (key === 'z') this.dash();
            if (key === 'm') this.toggleMagnetic();
            if (key === 'shift') this.toggleNeuralBurst(true);
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            if (key === 'shift') this.toggleNeuralBurst(false);
        });
    }

    toggleNeuralBurst(active) {
        if (active && this.player.neuralEnergy > 20) {
            this.isNeuralBurst = true;
            this.timeScale = 0.3;
        } else {
            this.isNeuralBurst = false;
            this.timeScale = 1.0;
        }
    }

    setGravity(mode) {
        if (this.player.gravityMode === mode) return;
        this.player.gravityMode = mode;
        this.player.onGround = false;
        this.flashEffect = 0.4;
        this.camera.shake = 12; // Increased screen shake
        this.sounds.playGravityFlip();

        // Visual rotation target for astronaut sprite only (NOT the camera/world)
        const gravAngles = { down: 0, up: Math.PI, left: -Math.PI / 2, right: Math.PI / 2 };
        this.player.targetGravityAngle = gravAngles[mode];

        // --- PROACTIVE COLLISION RESOLVE (Hitbox Snap) ---
        // If the new gravity mode causes an immediate overlap with a wall (common with rotation)
        // we proactively push the player out by a few pixels in the opposite direction.
        this.platforms.forEach(p => {
            if (this.rectIntersect(this.player, p)) {
                const overlap = this.getOverlap(this.player, p);
                const pushDir = {
                    down: { x: 0, y: -overlap },
                    up: { x: 0, y: overlap },
                    left: { x: overlap, y: 0 },
                    right: { x: -overlap, y: 0 }
                };
                this.player.x += pushDir[mode].x;
                this.player.y += pushDir[mode].y;
            }
        });

        // Glow burst and particles
        this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#00f2ff', 30, 'burst');
    }

    jump() {
        if (this.player.onGround || this.player.isMagnetic) {
            this.sounds.playJump();
            const f = this.player.jumpForce;
            switch (this.player.gravityMode) {
                case 'down': this.player.vy = -f; break;
                case 'up': this.player.vy = f; break;
                case 'left': this.player.vx = f; break;
                case 'right': this.player.vx = -f; break;
            }
            this.player.onGround = false;
            this.player.isMagnetic = false;
            this.player.squash = 0.6;
            this.player.stretch = 1.4;
            this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#fff', 15, 'smoke');
        }
    }

    dash() {
        if (this.player.dashCooldown <= 0 && this.player.neuralEnergy >= 20) {
            this.player.isDashing = true;
            this.player.dashCooldown = 0.5;
            this.player.neuralEnergy -= 20;
            this.sounds.playBoost();

            this.camera.shake = 10;
            this.player.squash = 0.5;
            this.player.stretch = 1.8;

            const dashForce = 1200;
            if (this.keys['arrowleft']) this.player.vx = -dashForce;
            else if (this.keys['arrowright']) this.player.vx = dashForce;
            else if (this.keys['arrowup']) this.player.vy = -dashForce;
            else if (this.keys['arrowdown']) this.player.vy = dashForce;
            else {
                // Dash in current gravity direction if no keys pressed
                switch (this.player.gravityMode) {
                    case 'down': this.player.vy = -dashForce; break;
                    case 'up': this.player.vy = dashForce; break;
                    case 'left': this.player.vx = dashForce; break;
                    case 'right': this.player.vx = -dashForce; break;
                }
            }

            setTimeout(() => { this.player.isDashing = false; }, 150);
            this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff00ff', 40, 'dash');
        }
    }

    toggleMagnetic() {
        if (this.player.onGround) {
            this.player.isMagnetic = !this.player.isMagnetic;
            this.sounds.playCollect();
        } else {
            this.player.isMagnetic = false;
        }
    }

    loadLevel(levelData) {
        this.player.x = levelData.spawn.x;
        this.player.y = levelData.spawn.y;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.gravityMode = 'down';
        this.player.gravityAngle = 0;
        this.player.targetGravityAngle = 0;
        this.player.neuralEnergy = 100;

        this.platforms = levelData.platforms || [];
        this.spikes = levelData.spikes || [];
        this.lasers = levelData.lasers || [];
        this.energyCores = (levelData.energyCores || []).map(c => ({ ...c, collected: false }));
        this.rotatingLasers = (levelData.rotatingLasers || []).map(r => ({ ...r, angle: 0 }));
        this.portal = levelData.portal;
        this.movingPlatforms = (levelData.movingPlatforms || []).map(p => ({
            ...p,
            currentX: p.x,
            currentY: p.y,
            timer: 0
        }));

        this.sentinels = (levelData.sentinels || []).map(s => ({
            ...s,
            currentX: s.x,
            currentY: s.y,
            vx: 0,
            vy: 0,
            state: 'patrol'
        }));

        this.blackHoles = levelData.blackHoles || [];
        this.gravityZones = levelData.gravityZones || [];
        this.teleporters = levelData.teleporters || [];
        this.coins = (levelData.coins || []).map(c => ({ ...c, collected: false }));

        this.player.levelTimer = 0;
        this.player.coins = 0;

        this.debris = [];
        for (let i = 0; i < 5; i++) {
            this.debris.push({
                x: Math.random() * this.game.targetWidth,
                y: Math.random() * this.game.targetHeight,
                size: 20 + Math.random() * 30,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                angle: Math.random() * Math.PI * 2,
                rotation: (Math.random() - 0.5) * 0.05
            });
        }

        this.ambientSparks = [];
        for (let i = 0; i < 40; i++) {
            this.ambientSparks.push({
                x: Math.random() * this.game.targetWidth,
                y: Math.random() * this.game.targetHeight,
                size: Math.random() * 2,
                speed: Math.random() * 40 + 20
            });
        }
    }

    update(dt) {
        dt *= this.timeScale;

        // --- 1. Physics & Movement ---
        const acc = this.player.speed;
        if (!this.player.isDashing && !this.player.isMagnetic) {
            if (this.player.gravityMode === 'down' || this.player.gravityMode === 'up') {
                if (this.keys['a']) this.player.vx -= acc * dt;
                else if (this.keys['d']) this.player.vx += acc * dt;
                else this.player.vx *= this.player.friction;
            } else {
                if (this.keys['w']) this.player.vy -= acc * dt;
                else if (this.keys['s']) this.player.vy += acc * dt;
                else this.player.vy *= this.player.friction;
            }
        }

        const g = this.gravityConstant;
        switch (this.player.gravityMode) {
            case 'down': this.player.vy += g * dt; break;
            case 'up': this.player.vy -= g * dt; break;
            case 'left': this.player.vx -= g * dt; break;
            case 'right': this.player.vx += g * dt; break;
        }

        const maxV = 800;
        this.player.vx = Math.max(-maxV, Math.min(maxV, this.player.vx));
        this.player.vy = Math.max(-maxV, Math.min(maxV, this.player.vy));
        if (this.player.isMagnetic && this.player.onGround) {
            this.player.vx *= 0.5; this.player.vy *= 0.5;
        }

        this.player.x += this.player.vx * dt;
        this.checkCollisions(dt, 'horizontal');
        this.player.y += this.player.vy * dt;
        this.player.onGround = false;
        this.checkCollisions(dt, 'vertical');

        // --- 2. Visuals & Environment ---
        this.player.gravityAngle += (this.player.targetGravityAngle - this.player.gravityAngle) * 0.15;
        if (this.player.isDashing || this.isNeuralBurst) {
            this.player.trail.unshift({ x: this.player.x, y: this.player.y });
            if (this.player.trail.length > 15) this.player.trail.pop();
        } else if (this.player.trail.length > 0) this.player.trail.pop();

        this.particlePool.forEach(p => {
            if (!p.active) return;
            p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.hasGravity) p.vy += this.gravityConstant * 0.5 * dt;
            p.rotation += p.rotSpeed * dt; p.size += p.sizeScaling * dt;
            p.size = Math.max(0.1, p.size); p.vx *= p.friction; p.vy *= p.friction;
            p.life -= dt; if (p.life <= 0) p.active = false;
        });

        this.player.squash += (1 - this.player.squash) * 15 * dt;
        this.player.stretch += (1 - this.player.stretch) * 15 * dt;

        this.camera.targetX = this.player.x + this.player.width / 2 - this.game.targetWidth / 2;
        this.camera.targetY = this.player.y + this.player.height / 2 - this.game.targetHeight / 2;
        this.camera.x += (this.camera.targetX - this.camera.x) * 4 * dt;
        this.camera.y += (this.camera.targetY - this.camera.y) * 4 * dt;

        this.debris.forEach(d => {
            d.x += d.vx * dt; d.y += d.vy * dt; d.angle += d.rotation;
            if (d.x < -100) d.x = this.game.targetWidth + 100;
            if (d.x > this.game.targetWidth + 100) d.x = -100;
            if (d.y < -100) d.y = this.game.targetHeight + 100;
            if (d.y > this.game.targetHeight + 100) d.y = -100;
        });

        this.movingPlatforms.forEach(p => {
            p.timer += dt * p.speed;
            const prevX = p.currentX; const prevY = p.currentY;
            p.currentX = p.x + Math.cos(p.timer) * p.rangeX;
            p.currentY = p.y + Math.sin(p.timer) * p.rangeY;
            if (this.isPlayerOnPlatform(p)) {
                this.player.x += (p.currentX - prevX);
                this.player.y += (p.currentY - prevY);
                this.player.onGround = true;
            }
        });

        // --- 3. Hazards & Gameplay ---
        let died = this.checkSpikeCollisions() || this.isOutOfBounds();
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;

        this.energyCores.forEach(c => {
            if (!c.collected && this.rectIntersect(this.player, c)) {
                c.collected = true;
                this.player.neuralEnergy = Math.min(this.player.maxEnergy, this.player.neuralEnergy + 30);
                this.sounds.playCollect();
            }
        });

        this.coins.forEach(c => {
            if (!c.collected && this.rectIntersect(this.player, c)) {
                c.collected = true; this.player.coins++; this.sounds.playCollect();
                this.createParticles(c.x + c.width / 2, c.y + c.height / 2, '#ffcc00', 10);
            }
        });

        this.lasers.forEach(l => {
            if (l.toggleRate) l.isVisible = (Math.floor(Date.now() / (1000 * l.toggleRate)) % 2 === 0);
            else l.isVisible = true;
            if (l.isVisible && this.rectIntersect(this.player, l)) died = true;
        });

        this.rotatingLasers.forEach(r => {
            r.angle += r.speed * dt;
            const dx = Math.cos(r.angle); const dy = Math.sin(r.angle);
            const tox = px - r.x; const toy = py - r.y;
            const perp = Math.abs(tox * dy - toy * dx); const proj = tox * dx + toy * dy;
            if (perp < 14 && proj > 0 && proj < r.length) died = true;
        });

        this.blackHoles.forEach(bh => {
            const dx = bh.x - px; const dy = bh.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < bh.range) {
                const force = (1 - dist / bh.range) * 2000;
                this.player.vx += (dx / dist) * force * dt;
                this.player.vy += (dy / dist) * force * dt;
                if (dist < 20) died = true;
            }
        });

        this.gravityZones.forEach(gz => {
            if (this.rectIntersect(this.player, gz)) this.setGravity(gz.mode);
        });

        this.teleporters.forEach(t => {
            if (this.rectIntersect(this.player, t)) {
                if (!t.cooldown) {
                    const target = this.teleporters.find(other => other.id === t.targetId);
                    if (target) {
                        this.player.x = target.x; this.player.y = target.y;
                        target.cooldown = 1.0; this.sounds.playBoost();
                        this.createParticles(t.x, t.y, '#00f2ff', 20, 'burst');
                        this.createParticles(target.x, target.y, '#00f2ff', 20, 'burst');
                    }
                }
            }
            if (t.cooldown > 0) t.cooldown -= dt;
        });

        this.sentinels.forEach(s => {
            const dist = Math.sqrt((this.player.x - s.currentX) ** 2 + (this.player.y - s.currentY) ** 2);
            if (dist < 400) { s.state = 'track'; this.sentinelBrain.update(s); }
            else { s.state = 'patrol'; s.vx = Math.sin(Date.now() / 1000) * 50; s.vy = Math.cos(Date.now() / 1000) * 20; }
            s.currentX += s.vx * dt; s.currentY += s.vy * dt;
            if (this.rectIntersect(this.player, { x: s.currentX - 15, y: s.currentY - 15, width: 30, height: 30 })) died = true;
        });

        if (died) {
            this.sounds.playDeath();
            this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff0055', 40);
            this.player.lives--;
            if (this.player.lives <= 0) {
                this.game.onDeath();
            } else {
                const currentLevel = this.game.levels.get(this.game.currentLevelIndex);
                this.player.x = currentLevel.spawn.x; this.player.y = currentLevel.spawn.y;
                this.player.vx = 0; this.player.vy = 0; this.flashEffect = 0.5;
            }
        }

        if (this.checkPortalCollision()) {
            const allCoresCollected = this.energyCores.every(c => c.collected);
            if (allCoresCollected || this.energyCores.length === 0) this.game.onLevelComplete();
        }

        // --- 4. Timers & Cooldowns ---
        this.player.levelTimer += dt;
        if (this.player.dashCooldown > 0) this.player.dashCooldown -= dt;
        if (this.camera.shake > 0) this.camera.shake -= dt * 30;
        if (this.flashEffect > 0) this.flashEffect -= dt * 2;

        if (this.isNeuralBurst) {
            this.player.neuralEnergy -= dt * 50;
            if (this.player.neuralEnergy <= 0) { this.player.neuralEnergy = 0; this.toggleNeuralBurst(false); }
        } else {
            this.player.neuralEnergy = Math.min(this.player.maxEnergy, this.player.neuralEnergy + (dt / this.timeScale) * 10);
        }
    }

    isPlayerOnPlatform(p) {
        const plat = { x: p.currentX || p.x, y: p.currentY || p.y, width: p.width, height: p.height };
        const b = 10; // detection buffer
        const ply = this.player;

        switch (ply.gravityMode) {
            case 'down':
                return ply.y + ply.height >= plat.y && ply.y + ply.height <= plat.y + b &&
                    ply.x + ply.width > plat.x && ply.x < plat.x + plat.width;
            case 'up':
                return ply.y <= plat.y + plat.height && ply.y >= plat.y + plat.height - b &&
                    ply.x + ply.width > plat.x && ply.x < plat.x + plat.width;
            case 'left':
                return ply.x <= plat.x + plat.width && ply.x >= plat.x + plat.width - b &&
                    ply.y + ply.height > plat.y && ply.y < plat.y + plat.height;
            case 'right':
                return ply.x + ply.width >= plat.x && ply.x + ply.width <= plat.x + b &&
                    ply.y + ply.height > plat.y && ply.y < plat.y + plat.height;
        }
    }

    checkCollisions(dt, axis) {
        const allPlatforms = [...this.platforms, ...this.movingPlatforms.map(p => ({
            x: p.currentX, y: p.currentY, width: p.width, height: p.height
        }))];

        const buffer = 0.5;
        for (const plat of allPlatforms) {
            if (this.rectIntersect(this.player, plat)) {
                if (axis === 'horizontal') {
                    if (this.player.vx > 0) {
                        this.player.x = plat.x - this.player.width - buffer;
                        if (this.player.gravityMode === 'right' && !this.player.onGround) {
                            this.player.onGround = true;
                            this.player.squash = 1.4; this.player.stretch = 0.6;
                        }
                    } else if (this.player.vx < 0) {
                        this.player.x = plat.x + plat.width + buffer;
                        if (this.player.gravityMode === 'left' && !this.player.onGround) {
                            this.player.onGround = true;
                            this.player.squash = 1.4; this.player.stretch = 0.6;
                        }
                    }
                    this.player.vx = 0;
                } else {
                    if (this.player.vy > 0) {
                        this.player.y = plat.y - this.player.height - buffer;
                        if (this.player.gravityMode === 'down' && !this.player.onGround) {
                            this.player.onGround = true;
                            this.player.squash = 1.4; this.player.stretch = 0.6;
                        }
                    } else if (this.player.vy < 0) {
                        this.player.y = plat.y + plat.height + buffer;
                        if (this.player.gravityMode === 'up' && !this.player.onGround) {
                            this.player.onGround = true;
                            this.player.squash = 1.4; this.player.stretch = 0.6;
                        }
                    }
                    this.player.vy = 0;
                }
            }
        }
    }

    rectIntersect(r1, r2) {
        return r1.x < r2.x + r2.width &&
            r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height &&
            r1.y + r1.height > r2.y;
    }

    getOverlap(r1, r2) {
        const overlapX = Math.max(0, Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x));
        const overlapY = Math.max(0, Math.min(r1.y + r1.height, r2.y + r2.height) - Math.max(r1.y, r2.y));
        return Math.min(overlapX, overlapY);
    }

    checkSpikeCollisions() {
        return this.spikes.some(s => this.rectIntersect(this.player, s));
    }

    checkPortalCollision() {
        return this.rectIntersect(this.player, this.portal);
    }

    isOutOfBounds() {
        return this.player.y < -100 || this.player.y > this.game.targetHeight + 100 ||
            this.player.x < -100 || this.player.x > this.game.targetWidth + 100;
    }

    draw(ctx) {
        ctx.save();

        // Base background (no camera pan)
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, this.game.targetWidth, this.game.targetHeight);

        // Energy Glitch
        if (this.player.neuralEnergy < 30 && Math.random() < 0.1) {
            ctx.fillStyle = `rgba(255, 0, 85, ${0.1 * Math.random()})`;
            ctx.fillRect(0, 0, this.game.targetWidth, this.game.targetHeight);
        }

        // Parallax Stars Layer 1
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        this.ambientSparks.forEach((s, idx) => {
            if (idx % 2 === 0) return;
            const px = (s.x - this.camera.x * 0.2) % this.game.targetWidth;
            const py = (s.y - this.camera.y * 0.2) % this.game.targetHeight;
            const flX = px < 0 ? px + this.game.targetWidth : px;
            const flY = py < 0 ? py + this.game.targetHeight : py;
            ctx.beginPath(); ctx.arc(flX, flY, s.size * 0.4 + 0.1, 0, Math.PI * 2); ctx.fill();
        });

        // Parallax Stars Layer 2
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        this.ambientSparks.forEach((s, idx) => {
            if (idx % 2 !== 0) return;
            const px = (s.x - this.camera.x * 0.5) % this.game.targetWidth;
            const py = (s.y - this.camera.y * 0.5) % this.game.targetHeight;
            const flX = px < 0 ? px + this.game.targetWidth : px;
            const flY = py < 0 ? py + this.game.targetHeight : py;
            ctx.beginPath(); ctx.arc(flX, flY, s.size * 0.6 + 0.2, 0, Math.PI * 2); ctx.fill();
        });

        // Camera Transform
        ctx.translate(-this.camera.x, -this.camera.y);

        // Screen Shake
        if (this.camera.shake > 0) {
            ctx.translate((Math.random() - 0.5) * this.camera.shake, (Math.random() - 0.5) * this.camera.shake);
        }

        // Neural Burst VFX
        if (this.isNeuralBurst) {
            ctx.strokeStyle = 'rgba(255, 0, 255, 0.15)';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 4; i++) {
                const ox = (Math.random() - 0.5) * 4;
                const oy = (Math.random() - 0.5) * 4;
                ctx.strokeRect(ox, oy, this.game.targetWidth - ox * 2, this.game.targetHeight - oy * 2);
            }
        }

        // Grid
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = -500; x < this.game.targetWidth + 500; x += 100) {
            ctx.beginPath(); ctx.moveTo(x, -500); ctx.lineTo(x, this.game.targetHeight + 500); ctx.stroke();
        }
        for (let y = -500; y < this.game.targetHeight + 500; y += 100) {
            ctx.beginPath(); ctx.moveTo(-500, y); ctx.lineTo(this.game.targetWidth + 500, y); ctx.stroke();
        }

        // 3. Debris & Environment
        ctx.fillStyle = '#1a1a2e';
        this.debris.forEach(d => {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.angle);
            ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
            ctx.strokeStyle = '#2a2a4e';
            ctx.strokeRect(-d.size / 2, -d.size / 2, d.size, d.size);
            ctx.restore();
        });

        // 4. Platforms & Hazards
        this.platforms.forEach(p => {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.strokeStyle = '#00f2ff';
            ctx.strokeRect(p.x, p.y, p.width, p.height);
            // Internal detail
            ctx.fillStyle = 'rgba(0, 242, 255, 0.05)';
            ctx.fillRect(p.x + 5, p.y + 5, p.width - 10, p.height - 10);
        });

        this.movingPlatforms.forEach(p => {
            ctx.fillStyle = '#2a2a4e';
            ctx.fillRect(p.currentX, p.currentY, p.width, p.height);
            ctx.strokeStyle = '#ff00ff';
            ctx.strokeRect(p.currentX, p.currentY, p.width, p.height);
        });

        this.spikes.forEach(s => this.drawSpike(ctx, s));

        // Static & Toggled Lasers
        this.lasers.forEach(l => {
            if (l.isVisible === false) return; // Skip if in "off" state

            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff0055';
            ctx.fillStyle = 'rgba(255, 0, 85, 0.85)';
            ctx.fillRect(l.x, l.y, l.width, l.height);
            // glow inner line
            ctx.fillStyle = 'rgba(255,150,150,0.5)';
            const iw = l.width > l.height ? l.width : 2;
            const ih = l.height > l.width ? l.height : 2;
            ctx.fillRect(l.x + l.width / 2 - 1, l.y, 2, l.height);
            ctx.shadowBlur = 0;
        });

        // Rotating Lasers
        this.rotatingLasers.forEach(r => {
            ctx.save();
            ctx.translate(r.x, r.y);
            // Pivot glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff0055';
            ctx.fillStyle = '#ff0055';
            ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
            // Beam
            ctx.rotate(r.angle);
            const grad = ctx.createLinearGradient(0, 0, r.length, 0);
            grad.addColorStop(0, 'rgba(255,0,85,0.9)');
            grad.addColorStop(1, 'rgba(255,0,85,0.05)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, -4, r.length, 8);
            ctx.restore();
            ctx.shadowBlur = 0;
        });

        // Global Glow for Neon Elements
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 242, 255, 0.4)';

        // Energy Cores
        this.energyCores.forEach(c => {
            if (c.collected) return;
            ctx.save();
            const bounce = Math.sin(Date.now() / 500) * 5;
            ctx.translate(c.x + c.width / 2, c.y + c.height / 2 + bounce);
            ctx.rotate(Date.now() / 1000);
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00f2ff';
            ctx.fillStyle = '#00f2ff';
            ctx.fillRect(-10, -10, 20, 20);
            ctx.strokeRect(-12, -12, 24, 24);
            ctx.restore();
        });

        // Coins
        this.coins.forEach(c => {
            if (c.collected) return;
            ctx.save(); ctx.translate(c.x + c.width / 2, c.y + c.height / 2);
            ctx.rotate(Date.now() / 400); ctx.fillStyle = '#ffcc00'; ctx.shadowBlur = 10; ctx.shadowColor = '#ffcc00';
            ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height); ctx.restore();
        });

        // Black Holes
        this.blackHoles.forEach(bh => {
            ctx.save(); ctx.translate(bh.x, bh.y);
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, bh.range);
            grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(0.2, 'rgba(50,0,100,0.5)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, bh.range, 0, Math.PI * 2); ctx.fill();
            ctx.rotate(Date.now() / 1000); ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 20 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        });

        // Gravity Zones
        this.gravityZones.forEach(gz => {
            ctx.fillStyle = 'rgba(0, 242, 255, 0.05)'; ctx.fillRect(gz.x, gz.y, gz.width, gz.height);
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)'; ctx.setLineDash([5, 5]); ctx.strokeRect(gz.x, gz.y, gz.width, gz.height);
            ctx.setLineDash([]); ctx.fillStyle = 'rgba(0, 242, 255, 0.3)'; ctx.font = '10px Arial';
            ctx.fillText(gz.mode.toUpperCase() + ' G', gz.x + 5, gz.y + 15);
        });

        // Teleporters
        this.teleporters.forEach(t => {
            ctx.save(); ctx.translate(t.x + t.width / 2, t.y + t.height / 2);
            ctx.rotate(Date.now() / 500); ctx.strokeStyle = '#00f2ff'; ctx.lineWidth = 2;
            ctx.strokeRect(-t.width / 2, -t.height / 2, t.width, t.height);
            ctx.fillStyle = 'rgba(0, 242, 255, 0.2)'; ctx.fillRect(-t.width / 4, -t.height / 4, t.width / 2, t.height / 2); ctx.restore();
        });

        // 5. Portals & Sentinels
        this.sentinels.forEach(s => this.drawSentinel(ctx, s));

        // Portal
        ctx.save();
        ctx.translate(this.portal.x + this.portal.width / 2, this.portal.y + this.portal.height / 2);
        ctx.rotate(Date.now() / 500);

        const allCoresCollected = this.energyCores.length === 0 || this.energyCores.every(c => c.collected);
        const portalColor = allCoresCollected ? '#ff00ff' : '#555555';

        ctx.shadowBlur = 30;
        ctx.shadowColor = portalColor;
        ctx.strokeStyle = portalColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(-this.portal.width / 2, -this.portal.height / 2, this.portal.width, this.portal.height);
        ctx.restore();

        // 6. Particles & Trail
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'source-over';
        this.particlePool.forEach(p => {
            if (!p.active) return;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / p.maxLife;
            // Depending on type, draw different shapes
            if (p.type === 'burst' || p.type === 'dash') {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else if (p.type === 'smoke') {
                ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillRect(0, 0, p.size, p.size);
            }
            ctx.restore();
        });
        ctx.globalAlpha = 1.0;

        // Player
        this.player.trail.forEach((pos, i) => {
            ctx.globalAlpha = (1 - i / 15) * 0.2;
            this.drawAstronaut(ctx, pos.x, pos.y, this.player.width, this.player.height);
        });
        ctx.globalAlpha = 1.0;

        ctx.shadowBlur = 15;
        ctx.shadowColor = this.player.isMagnetic ? '#ff00ff' : this.player.color;
        this.drawAstronaut(ctx, this.player.x, this.player.y, this.player.width, this.player.height);

        ctx.restore();

        // Flash Effect
        if (this.flashEffect > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashEffect})`;
            ctx.fillRect(0, 0, this.game.targetWidth, this.game.targetHeight);
        }
    }

    drawSpike(ctx, s) {
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + s.height);
        ctx.lineTo(s.x + s.width / 2, s.y);
        ctx.lineTo(s.x + s.width, s.y + s.height);
        ctx.closePath();
        ctx.fill();
    }

    drawAstronaut(ctx, x, y, w, h) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        ctx.rotate(this.player.gravityAngle);

        // Apply Squash and Stretch locally
        ctx.scale(this.player.squash, this.player.stretch);

        // Body
        ctx.fillStyle = '#fff';
        ctx.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);

        // Helmet
        ctx.fillStyle = '#222';
        ctx.fillRect(-w / 2 + 7, -h / 2 - 5, w - 14, 15);

        // Visor
        ctx.fillStyle = this.player.isMagnetic ? '#ff00ff' : '#00f2ff';
        ctx.fillRect(-w / 2 + 10, -h / 2, w - 20, 5);

        // Magnetic Boots effect
        if (this.player.isMagnetic) {
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-w / 2, -h / 2 - 5, w, h + 5);
        }

        ctx.restore();
    }

    drawSentinel(ctx, s) {
        ctx.save();
        ctx.translate(s.currentX, s.currentY);
        const isTracking = s.state === 'track';
        const col = isTracking ? '#ff00ff' : '#00f2ff';

        // Outer ring (rotating)
        ctx.rotate(Date.now() / 400);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.rotate(-Date.now() / 400);

        // Body
        ctx.shadowBlur = 15;
        ctx.shadowColor = col;
        ctx.fillStyle = '#0d0d1e';
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eye
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();

        // Scanning beam when tracking
        if (isTracking) {
            ctx.rotate(Date.now() / 800);
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-60, 120);
            ctx.lineTo(60, 120);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    }

    createParticles(x, y, color, count, type = 'normal') {
        let spawned = 0;
        for (let i = 0; i < this.particlePool.length; i++) {
            if (spawned >= count) break;
            const p = this.particlePool[i];
            if (!p.active) {
                p.active = true;
                p.x = x; p.y = y;
                p.color = color;
                p.type = type;

                const speed = type === 'burst' ? 600 : type === 'dash' ? 400 : 200;
                const angle = Math.random() * Math.PI * 2;
                p.vx = Math.cos(angle) * Math.random() * speed;
                p.vy = Math.sin(angle) * Math.random() * speed;

                p.hasGravity = type === 'smoke';
                p.friction = type === 'smoke' ? 0.98 : 0.92;
                p.rotation = Math.random() * Math.PI * 2;
                p.rotSpeed = (Math.random() - 0.5) * 10;

                p.maxLife = type === 'burst' ? 0.5 : type === 'dash' ? 0.4 : 1.0;
                p.life = p.maxLife * (0.8 + Math.random() * 0.4);

                p.sizeScaling = type === 'smoke' ? 5 : type === 'burst' ? -10 : -2;
                p.size = type === 'smoke' ? Math.random() * 5 + 5 : Math.random() * 4 + 2;

                spawned++;
            }
        }
    }
}
