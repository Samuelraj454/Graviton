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
        for (let i = 0; i < 8; i++) {
            level.spikes.push({ x: 320 + i * 70, y: 530, width: 30, height: 20 });
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
        // FIXED: Level 9 Precision Maze - Adjusted laser positions/gaps
        const level = this.createBaseLevel(8, 100, 100);
        level.platforms[0].y = 150;

        level.platforms.push({ x: 250, y: 0, width: 40, height: 450 });
        level.platforms.push({ x: 450, y: 200, width: 40, height: 500 });
        level.platforms.push({ x: 650, y: 0, width: 40, height: 450 });
        level.platforms.push({ x: 850, y: 200, width: 40, height: 500 });

        // Reduced laser widths to creating passing gaps
        level.lasers.push({ x: 290, y: 400, width: 120, height: 5 }); // Gap on right
        level.lasers.push({ x: 530, y: 250, width: 120, height: 5 }); // Gap on left
        level.lasers.push({ x: 690, y: 400, width: 120, height: 5 }); // Gap on right

        level.sentinels.push({ x: 370, y: 250 });
        level.sentinels.push({ x: 770, y: 250 });

        level.energyCores.push({ x: 350, y: 150, width: 20, height: 20 });
        level.energyCores.push({ x: 550, y: 550, width: 20, height: 20 });
        level.energyCores.push({ x: 750, y: 150, width: 20, height: 20 });

        level.portal.x = 1050;
        level.portal.y = 500;
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
        const difficulty = Math.min(1.0, (index - 10) / 490); // Scale from 0 to 1 over 490 levels

        // Randomize spawn and portal
        const spawnX = rng.range(50, 200);
        const spawnY = rng.range(100, 500);
        const level = this.createBaseLevel(index, spawnX, spawnY);

        const portalX = rng.range(800, 1100);
        const portalY = rng.range(100, 500);
        level.portal = { x: portalX, y: portalY, width: 60, height: 80 };

        // Generate Platforms
        const numPlatforms = 6 + Math.floor(difficulty * 10);
        for (let i = 0; i < numPlatforms; i++) {
            const px = rng.range(200, 1000);
            const py = rng.range(100, 600);
            const pw = rng.range(100, 300 - difficulty * 150);
            const ph = 20;
            level.platforms.push({ x: px, y: py, width: pw, height: ph });

            // Chance for spikes on platforms
            if (rng.chance(0.3 + difficulty * 0.4)) {
                const sx = px + rng.range(0, pw - 30);
                level.spikes.push({ x: sx, y: py - 20, width: 30, height: 20 });
            }
        }

        // Moving Platforms
        const numMoving = Math.floor(difficulty * 5);
        for (let i = 0; i < numMoving; i++) {
            level.movingPlatforms.push({
                x: rng.range(200, 900),
                y: rng.range(200, 500),
                width: 100,
                height: 20,
                rangeX: rng.chance(0.5) ? rng.range(100, 300) : 0,
                rangeY: rng.chance(0.5) ? rng.range(100, 300) : 0,
                speed: 1 + difficulty * 3
            });
        }

        // Lasers (Static)
        const numLasers = Math.floor(difficulty * 4);
        for (let i = 0; i < numLasers; i++) {
            const isVert = rng.chance(0.5);
            level.lasers.push({
                x: rng.range(200, 1000),
                y: rng.range(100, 500),
                width: isVert ? 8 : rng.range(100, 400),
                height: isVert ? rng.range(100, 400) : 8
            });
        }

        // Rotating Lasers
        const numRotating = Math.floor(difficulty * 3);
        for (let i = 0; i < numRotating; i++) {
            const rx = rng.range(300, 900);
            const ry = rng.range(200, 500);
            level.platforms.push({ x: rx - 10, y: ry - 10, width: 20, height: 20 }); // Small base
            level.rotatingLasers.push({
                x: rx,
                y: ry,
                speed: (rng.chance(0.5) ? 1 : -1) * (1 + difficulty * 3),
                length: 100 + difficulty * 150
            });
        }

        // Sentinels (ML AI)
        const numSentinels = Math.floor(difficulty * 4);
        for (let i = 0; i < numSentinels; i++) {
            level.sentinels.push({
                x: rng.range(200, 1000),
                y: rng.range(100, 600)
            });
        }

        // Energy Cores (Collectibles)
        const numCores = 2 + Math.floor(difficulty * 3);
        for (let i = 0; i < numCores; i++) {
            level.energyCores.push({
                x: rng.range(100, 1100),
                y: rng.range(100, 600),
                width: 20,
                height: 20
            });
        }

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

