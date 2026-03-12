import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/graviton';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('[GRAVITON_CORP] Database link established.'))
    .catch(err => console.warn('[GRAVITON_CORP] Database link failed. Falling back to in-memory mode.', err.message));

// Models
const ScoreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, required: true },
    sector: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', ScoreSchema);

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    highScore: { type: Number, default: 0 },
    maxSector: { type: Number, default: 0 }
});

const User = mongoose.model('User', UserSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'graviton_secret_link_2026';

// In-memory fallback
let localLeaderboard = [
    { name: 'N_ASTRONAUT', score: 1560, sector: 5 },
    { name: 'GRAVITY_ZERO', score: 1200, sector: 3 }
];

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered.' });
    } catch (err) {
        res.status(400).json({ error: 'Username already exists or invalid data.' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);
        res.json({ token, username: user.username, highScore: user.highScore, maxSector: user.maxSector });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Get Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1 }).limit(10);
        if (scores.length > 0) return res.json(scores);
        // Fallback to local if DB is empty/disconnected
        res.json(localLeaderboard.sort((a, b) => b.score - a.score));
    } catch (err) {
        res.json(localLeaderboard.sort((a, b) => b.score - a.score));
    }
});

// Save Score
app.post('/api/score', async (req, res) => {
    const { name, score, sector } = req.body;
    if (!name || isNaN(score)) return res.status(400).json({ error: 'Data corruption detected.' });

    try {
        const newScore = new Score({ name, score, sector });
        await newScore.save();
        res.status(201).json({ message: 'Neural data synchronized.' });
    } catch (err) {
        // Fallback to in-memory
        localLeaderboard.push({ name, score, sector });
        res.status(201).json({ message: 'Neural data cached locally (Uplink unstable).' });
    }
});

// ML Weight Sync (Mocked for now)
app.post('/api/ml/sync', (req, res) => {
    console.log('[GRAVITON_CORP] Synchronizing Neural Weights...');
    res.json({ status: 'Weights Cached', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`[GRAVITON_BACKEND] Server active on port ${PORT}`);
});
