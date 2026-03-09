# GRAVITON: Anti-Gravity Explorer

A physics-based sci-fi puzzle platformer built with Vanilla JavaScript, HTML Canvas, and an Express.js backend. Overcome deadly laser corridors, rotating sectors, and ML-powered Sentinels by manipulating gravity in four directions.

---

## 🚀 Features

### **Dynamic Physics & Mechanics**
* **4-Way Gravity Manipulation**: Press `Arrow Keys` (↑ ↓ ← →) to dynamically shift gravity instantly. The astronaut reorients smoothly to match the new gravity plane without moving the entire camera.
* **Momentum & Inertia**: Slippery, space-like movement that preserves speed when gravity is shifted.
* **Dash**: Press `Z` to thrust rapidly in your current orientation. Consumes Neural Energy.
* **Magnetic Boots**: Press `M` to toggle boots. When active, you instantly brake on contact with surfaces.
* **Neural Burst (Slow Motion)**: Press `Shift` to trigger a time-dilation effect that slows the world to 30% speed, applying intense visual distortion and burning Neural Energy.

### **The Environment & AI**
* **Hazards**: Static lasers, deadly spikes, and dynamic **Rotating Laser Arrays**.
* **Collectibles**: Gather floating Energy Cores to recharge Neural Energy and build your Sector Score.
* **ML-Powered Sentinels**: Enemy drones powered by an adaptive mock-Neural Network model (`SentinelBrain.js`) that patrols intelligently and tracks the player dynamically based on gravity state inputs.

### **The Full-Stack Integration**
* **Vite Frontend**: Lightning-fast local development server with ES-Modules structure.
* **Express.js Backend**: An independent Node.js server (`/server`) that powers the Neural Uplink Leaderboard API.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5 Canvas, Vanilla JS (ES6 Classes), CSS3 (Glassmorphism & animations), Vite.
* **Backend**: Node.js, Express.js, CORS.
* **AI Engine**: Custom multi-layer perceptron mock `NeuralNetwork.js`.

---

## 🎮 How to Play

### **Controls**
| Key / Input | Action |
| --- | --- |
| **W A S D** | Move Character (relative to current gravity) |
| **Up**, **Down**, **Left**, **Right** | **Flip Gravity** instantly in that direction |
| **Space** | Jump |
| **Z** | Dash Burst |
| **M** | Toggle Magnetic Boots (High friction) |
| **Shift** | Neural Burst (Slow-mo) |

### **Objective**
Find the purple spinning escape portal at the end of each sector. Avoid lasers, collect blue energy cores, and stay out of range of the scanning Sentinels!

---

## 💻 Installation & Setup

You are currently running the full stack! 

The architecture is split into two parts:

### 1. **The Backend API** (`/server`)
Handles the leaderboard REST API.
```bash
cd server
npm install
node index.js
```
*(Runs on `http://localhost:5000`)*

### 2. **The Frontend Client** (Root Directory)
Serves the Canvas game engine.
```bash
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 📁 Project Structure

```text
game/
├── index.html             # The main layout and UI overlay
├── style.css              # Glassmorphism UI styling, animations, CRTs
├── main.js                # Game Loop, Resolution scaling, Core State
├── engine.js              # Physics, Collision, Rendering, Input handling
├── ui.js                  # HUD linking, Backend Fetches
├── levels.js              # Archetype generators for Sectors 1-10
├── SoundManager.js        # Web Audio API Synthesizer (No external MP3s!)
│
├── ml/                    # Machine Learning Architecture
│   ├── SentinelBrain.js   # Decision mapping
│   ├── NeuralNetwork.js   # MLP logic
│   └── DataProcessor.js   # Feature normalization
│
└── server/                # Backend Infrastructure
    ├── package.json       
    └── index.js           # Express API endpoints
```

---

## 🧠 Behind the ML System (`ml/`)
The sentinels use "Imitation Learning". The `DataProcessor` extracts features from the game state (distance to player, velocity, current gravity orientation) and feeds them to `NeuralNetwork.js`. Currently, they switch between a sine-wave patrol state and an aggressive tracking state when the player is near.

---

*System initialized. Proceed to Sector 01.*
