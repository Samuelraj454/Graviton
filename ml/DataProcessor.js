/**
 * DataProcessor.js
 * Handles normalization and feature extraction from game state for ML models.
 */

export class DataProcessor {
    static normalize(val, min, max) {
        return (val - min) / (max - min);
    }

    static getSentinelFeatures(sentinel, player, width, height) {
        // Map gravityMode to numeric
        const gravMap = { 'down': 0, 'up': 0.33, 'left': 0.66, 'right': 1.0 };
        const gravityVal = gravMap[player.gravityMode] || 0;

        return [
            this.normalize(sentinel.currentX, 0, width),
            this.normalize(sentinel.currentY, 0, height),
            this.normalize(player.x, 0, width),
            this.normalize(player.y, 0, height),
            this.normalize(sentinel.vx, -500, 500),
            this.normalize(sentinel.vy, -500, 500),
            player.vx > 0 ? 1 : 0,
            player.vy > 0 ? 1 : 0,
            gravityVal
        ];
    }
}
