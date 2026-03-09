import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data (replace with MongoDB/Mongoose for production)
let leaderboard = [
    { name: 'N_ASTRONAUT', score: 1560, sector: 5 },
    { name: 'GRAVITY_ZERO', score: 1200, sector: 3 }
];

// Routes

// Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
    res.json(leaderboard.sort((a, b) => b.score - a.score));
});

// Save Score
app.post('/api/score', (req, res) => {
    const { name, score, sector } = req.body;
    if (name && score) {
        leaderboard.push({ name, score, sector });
        res.status(201).json({ message: 'Score synchronized.' });
    } else {
        res.status(400).json({ error: 'Incomplete data.' });
    }
});

// ML Weight Sync (Mocked for now)
app.post('/api/ml/sync', (req, res) => {
    // This could save model weights to a database or file
    console.log('[GRAVITON_CORP] Synchronizing Neural Weights...');
    res.json({ status: 'Weights Cached', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`[GRAVITON_BACKEND] Server active on port ${PORT}`);
});
