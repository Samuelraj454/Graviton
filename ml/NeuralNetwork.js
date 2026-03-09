/**
 * NeuralNetwork.js
 * Definitions of the TensorFlow.js models.
 */
import * as tf from '@tensorflow/tfjs';

export class SentinelModel {
    constructor(inputSize = 9, outputSize = 4) {
        this.inputSize = inputSize; // [sX, sY, pX, pY, sVX, sVY, pVX, pVY, pGD]
        this.outputSize = outputSize; // [MoveLeft, MoveRight, MoveUp, MoveDown]
        this.model = this.createModel();
    }

    /**
     * Creates a simple feed-forward model.
     */
    createModel() {
        const model = tf.sequential();

        // Input Layer
        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu',
            inputShape: [this.inputSize]
        }));

        // Hidden Layer 1
        model.add(tf.layers.dense({
            units: 32,
            activation: 'relu'
        }));

        // Hidden Layer 2 (Dropout for stability)
        model.add(tf.layers.dropout({
            rate: 0.1
        }));
        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu'
        }));

        // Output Layer (Softmax to convert to probabilities)
        model.add(tf.layers.dense({
            units: this.outputSize,
            activation: 'softmax'
        }));

        // Compile model with Adam optimizer
        model.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'meanSquaredError' // MSE is good for Q-learning or regression
        });

        return model;
    }

    /**
     * Prediction using the model.
     * @param {number[]} features - Feature array.
     */
    predict(features) {
        return tf.tidy(() => {
            const inputTensor = tf.tensor2d([features]);
            const prediction = this.model.predict(inputTensor);
            return prediction.dataSync();
        });
    }

    /**
     * Training logic (simplified).
     * @param {number[][]} inputs - Array of feature sets.
     * @param {number[][]} targets - Array of target probabilities.
     */
    async train(inputs, targets) {
        const inputTensor = tf.tensor2d(inputs);
        const targetTensor = tf.tensor2d(targets);

        await this.model.fit(inputTensor, targetTensor, {
            epochs: 1,
            shuffle: true
        });

        tf.dispose([inputTensor, targetTensor]);
    }
}
