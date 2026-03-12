export class Levels {
    constructor() {
        // Original 10 levels (with fix for level 9)
        this.staticLevels = [
            this.level1(), this.level2(), this.level3(), this.level4(), this.level5(),
            this.level6(), this.level7(), this.level8(), this.level9(), this.level10()
        ];
        this.count = 500;
    }

    get(index) {
        if (index < this.staticLevels.length) {
            return this.staticLevels[index];
        }
        if (index === 499) {
            return this.level500();
        }
        return this.generateLevel(index);
    }

    createBaseLevel(index, spawnX = 100, spawnY = 500) {
        const level = {
            id: index + 1,
            spawn: { x: spawnX, y: spawnY },
            platforms: [
                { x: spawnX - 50, y: spawnY + 50, width: 200, height: 40 }, // Start pod
                { x: 0, y: 0, width: 20, height: 675 }, // Left wall
                { x: 1180, y: 0, width: 20, height: 675 }, // Right wall
                { x: 0, y: 0, width: 1200, height: 20 }, // Top wall
                { x: 0, y: 655, width: 1200, height: 20 } // Bottom wall
            ],
            spikes: [],
            lasers: [],
            rotatingLasers: [],
            energyCores: [],
            movingPlatforms: [],
            sentinels: [],
            portal: { x: 1050, y: 100, width: 60, height: 80 }
        };
        return level;
    }

    // --- Static Levels ---

    level1() {
        const level = this.createBaseLevel(0);
        level.platforms.push({ x: 350, y: 450, width: 150, height: 20 });
        level.platforms.push({ x: 600, y: 350, width: 150, height: 20 });
        level.platforms.push({ x: 850, y: 250, width: 150, height: 20 });
        level.energyCores.push({ x: 400, y: 400, width: 20, height: 20 });
        level.energyCores.push({ x: 650, y: 300, width: 20, height: 20 });
        level.portal.x = 1000;
        level.portal.y = 150;
        return level;
    }

    level2() {
        const level = this.createBaseLevel(1);
        level.platforms.push({ x: 300, y: 550, width: 600, height: 20 });
        for (let i = 0; i < 4; i++) {
            level.spikes.push({ x: 400 + i * 100, y: 530, width: 30, height: 20 });
        }
        level.platforms.push({ x: 500, y: 400, width: 100, height: 20 });
        level.platforms.push({ x: 800, y: 250, width: 150, height: 20 });
        level.energyCores.push({ x: 540, y: 360, width: 20, height: 20 });
        level.portal.x = 1000;
        level.portal.y = 150;
        return level;
    }

    level3() {
        const level = this.createBaseLevel(2, 100, 300);
        level.platforms[0].y = 350;
        level.movingPlatforms.push({ x: 350, y: 350, width: 150, height: 20, rangeX: 0, rangeY: 200, speed: 2 });
        level.movingPlatforms.push({ x: 650, y: 550, width: 150, height: 20, rangeX: 0, rangeY: -250, speed: 2.5 });
        level.platforms.push({ x: 950, y: 250, width: 150, height: 20 });
        level.energyCores.push({ x: 400, y: 200, width: 20, height: 20 });
        level.energyCores.push({ x: 700, y: 400, width: 20, height: 20 });
        level.portal.x = 1000;
        level.portal.y = 150;
        return level;
    }

    level4() {
        const level = this.createBaseLevel(3, 100, 150);
        level.platforms[0].y = 200;
        level.lasers.push({ x: 300, y: 100, width: 10, height: 400 });
        level.lasers.push({ x: 600, y: 200, width: 10, height: 400 });
        level.lasers.push({ x: 900, y: 100, width: 10, height: 400 });
        level.platforms.push({ x: 400, y: 450, width: 100, height: 20 });
        level.platforms.push({ x: 700, y: 300, width: 100, height: 20 });
        level.energyCores.push({ x: 440, y: 400, width: 20, height: 20 });
        level.energyCores.push({ x: 740, y: 250, width: 20, height: 20 });
        level.portal.x = 1050;
        level.portal.y = 450;
        level.platforms.push({ x: 1000, y: 550, width: 150, height: 20 });
        return level;
    }

    level5() {
        const level = this.createBaseLevel(4, 100, 500);
        level.platforms.push({ x: 450, y: 350, width: 50, height: 50 });
        level.rotatingLasers.push({ x: 475, y: 375, speed: 1.5, length: 250 });
        level.platforms.push({ x: 850, y: 350, width: 50, height: 50 });
        level.rotatingLasers.push({ x: 875, y: 375, speed: -2, length: 200 });
        level.movingPlatforms.push({ x: 200, y: 300, width: 100, height: 20, rangeX: 200, rangeY: 0, speed: 2 });
        level.movingPlatforms.push({ x: 550, y: 200, width: 100, height: 20, rangeX: 200, rangeY: 0, speed: 2.5 });
        level.energyCores.push({ x: 300, y: 150, width: 20, height: 20 });
        level.energyCores.push({ x: 700, y: 150, width: 20, height: 20 });
        level.portal.x = 1050;
        level.portal.y = 250;
        level.platforms.push({ x: 1000, y: 350, width: 150, height: 20 });
        return level;
    }

    level6() {
        const level = this.createBaseLevel(5, 100, 500);
        level.platforms.push({ x: 300, y: 400, width: 600, height: 20 });
        level.platforms.push({ x: 400, y: 250, width: 400, height: 20 });
        level.sentinels.push({ x: 400, y: 420 });
        level.sentinels.push({ x: 700, y: 420 });
        level.sentinels.push({ x: 600, y: 270 });
        level.energyCores.push({ x: 350, y: 350, width: 20, height: 20 });
        level.energyCores.push({ x: 750, y: 200, width: 20, height: 20 });
        level.platforms.push({ x: 750, y: 250, width: 100, height: 20 }); // Landing platform
        level.portal.x = 800;
        level.portal.y = 150;
        return level;
    }

    level7() {
        const level = this.createBaseLevel(6, 100, 150);
        level.platforms[0].y = 250;
        level.movingPlatforms.push({ x: 300, y: 250, width: 150, height: 20, rangeX: 200, rangeY: 0, speed: 1.5 });
        level.sentinels.push({ x: 400, y: 400 });
        level.sentinels.push({ x: 800, y: 300 });
        level.platforms.push({ x: 700, y: 450, width: 200, height: 20 });
        level.platforms.push({ x: 100, y: 550, width: 200, height: 20 });
        level.energyCores.push({ x: 450, y: 150, width: 20, height: 20 });
        level.energyCores.push({ x: 800, y: 400, width: 20, height: 20 });
        level.portal.x = 1050;
        level.portal.y = 500;
        return level;
    }

    level8() {
        const level = this.createBaseLevel(7, 100, 500);
        level.platforms.push({ x: 300, y: 550, width: 600, height: 20 });
        for (let i = 0; i < 7; i++) {
            level.spikes.push({ x: 340 + i * 85, y: 530, width: 30, height: 20 });
        }
        level.movingPlatforms.push({ x: 250, y: 400, width: 100, height: 20, rangeX: 0, rangeY: -200, speed: 2 });
        level.platforms.push({ x: 550, y: 250, width: 50, height: 50 });
        level.rotatingLasers.push({ x: 575, y: 275, speed: 3, length: 150 });
        level.movingPlatforms.push({ x: 750, y: 200, width: 100, height: 20, rangeX: 0, rangeY: 200, speed: 2.5 });
        level.energyCores.push({ x: 565, y: 180, width: 20, height: 20 });
        level.portal.x = 1050;
        level.portal.y = 350;
        level.platforms.push({ x: 950, y: 450, width: 200, height: 20 });
        return level;
    }

    level9() {
        // REDESIGNED: Level 9 - G-FORCE MANIFOLD
        const level = this.createBaseLevel(8, 200, 300);
        level.platforms[0].x = 50;
        level.platforms[0].y = 450;
        level.platforms[0].width = 150;

        // Challenge 1: The Dash-Shift Corridor
        // Must dash horizontally across a gap then shift gravity to catch the next platform
        level.platforms.push({ x: 300, y: 350, width: 200, height: 20 });
        level.platforms.push({ x: 600, y: 150, width: 200, height: 20 }); // The "Catch" platform

        // Challenge 2: The Heartbeat Laser (Risk vs Reward)
        // High-frequency toggle laser guarding the extra core on the far left
        level.energyCores.push({ x: 100, y: 150, width: 20, height: 20 }); // The Prize
        level.lasers.push({ x: 50, y: 100, width: 10, height: 300, toggleRate: 1.5 }); // The Heartbeat Laser

        // Central Pillar - redesigned to avoid "stuck" states (wider gaps)
        level.platforms.push({ x: 1100, y: 200, width: 20, height: 400 }); // Right Wall Stop

        // Challenge 3: Rotating Hazard Sync
        level.platforms.push({ x: 585, y: 322, width: 30, height: 30 }); // Center Hub
        level.rotatingLasers.push({ x: 600, y: 337, speed: 1.5, length: 300 });

        // Cores for progression
        level.energyCores.push({ x: 700, y: 100, width: 20, height: 20 });
        level.energyCores.push({ x: 1050, y: 400, width: 20, height: 20 });
        level.energyCores.push({ x: 400, y: 550, width: 20, height: 20 });

        level.portal.x = 1100;
        level.portal.y = 50;
        return level;
    }

    level10() {
        const level = this.createBaseLevel(9, 100, 500);
        level.platforms.push({ x: 300, y: 550, width: 800, height: 20 });
        for (let i = 0; i < 10; i++) {
            level.spikes.push({ x: 350 + i * 60, y: 530, width: 30, height: 20 });
        }
        level.movingPlatforms.push({ x: 350, y: 400, width: 80, height: 20, rangeX: 0, rangeY: -150, speed: 2 });
        level.movingPlatforms.push({ x: 600, y: 250, width: 80, height: 20, rangeX: 0, rangeY: 150, speed: 2.5 });
        level.rotatingLasers.push({ x: 500, y: 350, speed: 2.5, length: 120 });
        level.rotatingLasers.push({ x: 800, y: 350, speed: -2.5, length: 120 });
        level.lasers.push({ x: 300, y: 150, width: 500, height: 5 });
        level.sentinels.push({ x: 500, y: 100 });
        level.sentinels.push({ x: 800, y: 100 });
        level.energyCores.push({ x: 400, y: 450, width: 20, height: 20 });
        level.energyCores.push({ x: 650, y: 350, width: 20, height: 20 });
        level.energyCores.push({ x: 900, y: 200, width: 20, height: 20 });
        level.portal.x = 1050;
        level.portal.y = 100;
        level.platforms.push({ x: 1000, y: 200, width: 150, height: 20 });
        return level;
    }

    // --- Procedural Generation Engine ---

    generateLevel(index) {
        const rng = new SeededRandom(index * 9999);
        const difficulty = (index - 10) / 490; // 0 to 1

        const spawnX = rng.range(50, 200);
        const spawnY = rng.range(100, 500);
        const level = this.createBaseLevel(index, spawnX, spawnY);

        const portalX = rng.range(800, 1100);
        const portalY = rng.range(100, 500);
        level.portal = { x: portalX, y: portalY, width: 60, height: 80 };

        const isW2 = index >= 20 && index < 100;
        const isW3 = index >= 100 && index < 200;
        const isW4 = index >= 200 && index < 350;
        const isW5 = index >= 350;

        // Platforms & Spikes
        const numPlats = 8 + Math.floor(difficulty * 12);
        for (let i = 0; i < numPlats; i++) {
            const pw = rng.range(100, 300);
            const px = rng.range(50, 1150 - pw);
            const py = rng.range(100, 600);
            level.platforms.push({ x: px, y: py, width: pw, height: 20 });
            if (rng.chance(0.2 + (isW3 ? 0.3 : 0))) {
                level.spikes.push({ x: px + rng.range(0, pw - 30), y: py - 20, width: 30, height: 20 });
            }
        }

        // World 2: Moving Platforms
        const numMoving = Math.floor(difficulty * (isW2 ? 10 : 4));
        for (let j = 0; j < numMoving; j++) {
            level.movingPlatforms.push({
                x: rng.range(200, 900), y: rng.range(200, 500), width: 100, height: 20,
                rangeX: (isW2 || rng.chance(0.4)) ? rng.range(100, 400) : 0,
                rangeY: (isW2 || rng.chance(0.4)) ? rng.range(100, 400) : 0,
                speed: 1 + difficulty * 2
            });
        }

        // World 3: Hazards
        const numLasers = Math.floor(difficulty * (isW3 ? 8 : 2));
        for (let k = 0; k < numLasers; k++) {
            const isV = rng.chance(0.5);
            level.lasers.push({
                x: rng.range(200, 1000), y: rng.range(100, 500),
                width: isV ? 10 : rng.range(100, 400),
                height: isV ? rng.range(100, 400) : 10,
                toggleRate: isW3 ? rng.range(1, 4) : 0
            });
        }

        const numRotating = Math.floor(difficulty * (isW3 ? 4 : 1));
        for (let l = 0; l < numRotating; l++) {
            const rx = rng.range(300, 900); const ry = rng.range(200, 500);
            level.platforms.push({ x: rx - 10, y: ry - 10, width: 20, height: 20 });
            level.rotatingLasers.push({
                x: rx, y: ry, speed: (rng.chance(0.5) ? 1 : -1) * (1 + difficulty * 1.5),
                length: 100 + difficulty * 200
            });
        }

        // World 4: Gravity
        level.blackHoles = [];
        if (isW4 || isW5 || difficulty > 0.6) {
            const nBH = isW4 ? 2 : 1;
            for (let m = 0; m < nBH; m++) {
                level.blackHoles.push({ x: rng.range(200, 1000), y: rng.range(100, 500), range: rng.range(200, 350) });
            }
        }

        level.gravityZones = [];
        if (isW4 || isW5) {
            for (let n = 0; n < 2; n++) {
                level.gravityZones.push({
                    x: rng.range(200, 1000), y: rng.range(100, 500), width: 160, height: 160,
                    mode: ['up', 'down', 'left', 'right'][Math.floor(rng.next() * 4)]
                });
            }
        }

        // Teleporters
        level.teleporters = [];
        if (isW5 && rng.chance(0.5)) {
            level.teleporters.push({ id: 't1', targetId: 't2', x: 200, y: rng.range(100, 500), width: 40, height: 40 });
            level.teleporters.push({ id: 't2', targetId: 't1', x: 900, y: rng.range(100, 500), width: 40, height: 40 });
        }

        // Collectibles
        level.coins = [];
        for (let p = 0; p < 15; p++) level.coins.push({ x: rng.range(100, 1100), y: rng.range(100, 600), width: 15, height: 15 });

        level.energyCores = [];
        for (let q = 0; q < 3; q++) level.energyCores.push({ x: rng.range(100, 1100), y: rng.range(100, 600), width: 20, height: 20 });

        level.sentinels = [];
        if (difficulty > 0.3) {
            for (let r = 0; r < Math.floor(difficulty * 5); r++) level.sentinels.push({ x: rng.range(200, 1000), y: rng.range(100, 600) });
        }

        level.platforms.push({ x: portalX - 20, y: portalY + 90, width: 100, height: 20 });
        return level;
    }
}

class SeededRandom {
    constructor(seed) {
        this.state = seed;
    }
    next() {
        this.state = (this.state * 1664525 + 1013904223) % 4294967296;
        return this.state / 4294967296;
    }
    range(min, max) {
        return min + this.next() * (max - min);
    }
    chance(p) {
        return this.next() < p;
    }
}

// Add Level 500
Levels.prototype.level500 = function () {
    const level = this.createBaseLevel(499, 550, 600);
    level.spawn = { x: 550, y: 600 };
    level.platforms = [
        { x: 500, y: 650, width: 200, height: 20 }, // Start
        { x: 0, y: 0, width: 20, height: 675 },
        { x: 1180, y: 0, width: 20, height: 675 },
        { x: 0, y: 0, width: 1200, height: 20 },
        { x: 0, y: 655, width: 1200, height: 20 }
    ];

    // The Reactor Core
    level.platforms.push({ x: 550, y: 300, width: 100, height: 100 });
    level.rotatingLasers.push({ x: 600, y: 350, speed: 4, length: 500 });
    level.rotatingLasers.push({ x: 600, y: 350, speed: -3, length: 400 });
    level.rotatingLasers.push({ x: 600, y: 350, speed: 1.5, length: 600 });

    // Final Cores
    level.energyCores.push({ x: 100, y: 100, width: 30, height: 30 });
    level.energyCores.push({ x: 1100, y: 100, width: 30, height: 30 });
    level.energyCores.push({ x: 100, y: 550, width: 30, height: 30 });
    level.energyCores.push({ x: 1100, y: 550, width: 30, height: 30 });

    // Boss Sentinels
    for (let i = 0; i < 8; i++) {
        level.sentinels.push({ x: 100 + i * 150, y: 100 });
    }

    level.portal.x = 570;
    level.portal.y = 50;
    level.platforms.push({ x: 550, y: 150, width: 100, height: 20 }); // Portal Landing
    return level;
};

