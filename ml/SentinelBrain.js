/**
 * SentinelBrain.js
 * High-level manager for a sentinel's ML-driven behavior.
 */

import { SentinelModel } from './NeuralNetwork.js';
import { DataProcessor } from './DataProcessor.js';

export class SentinelBrain {
    constructor(game) {
        this.game = game;
        this.model = new SentinelModel();

        // Constants for training
        this.epsilon = 0.2; // Exploration rate (if used in RL)
        this.memoryLimit = 1000;
        this.memory = []; // Replay memory for RL or IL
        this.isTraining = false;
    }

    /**
     * Decides action for a sentinel based on the model prediction.
     * @param {Object} sentinel - The sentinel object.
     */
    update(sentinel) {
        const features = DataProcessor.getSentinelFeatures(sentinel, this.game.engine.player, this.game.targetWidth, this.game.targetHeight);
        const prediction = this.model.predict(features);

        // Map prediction probabilities to actions
        // Action Indices: 0: MoveLeft, 1: MoveRight, 2: MoveUp, 3: MoveDown
        const actionIdx = prediction.indexOf(Math.max(...prediction));

        const dt = 0.016; // Approx deltaTime for updates (assuming 60fps)
        const speed = 150;

        switch (actionIdx) {
            case 0: // Move Left
                sentinel.vx -= speed * dt;
                break;
            case 1: // Move Right
                sentinel.vx += speed * dt;
                break;
            case 2: // Move Up
                sentinel.vy -= speed * dt;
                break;
            case 3: // Move Down
                sentinel.vy += speed * dt;
                break;
        }

        // Apply Damping
        sentinel.vx *= 0.98;
        sentinel.vy *= 0.98;

        // --- Online Imitation Learning ---
        const targetOutput = this.getHeuristicTarget(sentinel);
        this.remember(features, targetOutput);

        // Train every 100 frames to avoid lag
        if (this.memory.length > 100 && !this.isTraining) {
            this.isTraining = true;
            this.trainFromMemory().then(() => {
                this.isTraining = false;
            });
        }
    }

    /**
     * Heuristic target (The "Expert" to imitate).
     * @param {Object} sentinel 
     */
    getHeuristicTarget(sentinel) {
        const dx = (this.game.engine.player.x + this.game.engine.player.width / 2) - sentinel.currentX;
        const dy = (this.game.engine.player.y + this.game.engine.player.height / 2) - sentinel.currentY;

        // Target Action Probabilities [Left, Right, Up, Down]
        const target = [0, 0, 0, 0];
        if (dx < -10) target[0] = 1.0;
        else if (dx > 10) target[1] = 1.0;

        if (dy < -10) target[2] = 1.0;
        else if (dy > 10) target[3] = 1.0;

        // Normalize if multiple directions
        const sum = target.reduce((a, b) => a + b, 0);
        return sum > 0 ? target.map(v => v / sum) : [0.25, 0.25, 0.25, 0.25];
    }

    remember(input, target) {
        this.memory.push({ input, target });
        if (this.memory.length > this.memoryLimit) {
            this.memory.shift();
        }
    }

    async trainFromMemory() {
        const batchSize = Math.min(this.memory.length, 32);
        const batch = [];
        for (let i = 0; i < batchSize; i++) {
            batch.push(this.memory[Math.floor(Math.random() * this.memory.length)]);
        }

        const inputs = batch.map(b => b.input);
        const targets = batch.map(b => b.target);

        await this.model.train(inputs, targets);
    }
}
