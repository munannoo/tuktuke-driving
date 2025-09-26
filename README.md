# Self-Driving Car AI with Neural Networks 🚗🧠

This is my complete self-driving car simulation built from scratch using TypeScript. I developed neural networks that learn to navigate traffic, avoid obstacles, and become expert drivers through evolutionary algorithms!

## 🎯 What I Did In The Project

- **Neural Networks from Scratch**: I implemented a complete feedforward neural network without any ML libraries
- **Self-Driving AI**: I built cars that learn to drive using only sensor data and trial-and-error
- **Real-Time Visualization**: I visualized the neural network "thinking" as it made driving decisions
- **Genetic Evolution**: I created a population of cars that evolve and improve over generations
- **Interactive Training**: I added features to save/load the best performing AI brains

## 🧠 How It Works

### The Neural Network

```
Sensors (5 inputs) → Hidden Layer (6 neurons) → Controls (4 outputs)
    ↓                      ↓                        ↓
[Distance readings]   [Pattern recognition]   [Forward/Back/Left/Right]
```

1. **Sensing**: Each car has 5 ray-casting sensors detecting obstacles
2. **Processing**: The neural network processes sensor data through hidden layers
3. **Decision Making**: The network outputs driving commands
4. **Learning**: A genetic algorithm evolves better driving behaviors
5. **Evolution**: The best performers create the next generation

### Training Process

- 🏁 **Start**: I initialize 1000 cars with random neural networks
- 📊 **Evaluate**: Cars drive and get fitness scores based on distance traveled
- 🏆 **Select**: I keep the best performing cars
- 🧬 **Evolve**: I create a new generation with mutations
- 🔄 **Repeat**: I continue until the cars drive perfectly

## 🛠️ Technologies Used

- **TypeScript** - For type-safe development and better code organization
- **HTML5 Canvas** - For real-time 2D graphics and physics simulation
- **CSS3** - For clean, responsive UI design

## 🎮 Getting Started

### Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/tuktuke-driving.git
cd tuktuke-driving
```

2. Open in browser:

```bash
npm i
npm run dev
# or simply open index.html
```

3. Watch the AI learn to drive!
   > **Note:** The AI must be trained from scratch for each user.  
   > To use pre-trained data, check the file `pre-trainedData.json`.

### Controls

- **💾 Save**: Save the best performing neural network
- **🗑️ Discard**: Clear saved data and start fresh
- **👁️ Watch**: Observe the neural network visualization in real-time

## 📁 Project Structure

```
src/
├── car.ts              # Car physics, sensors, and AI integration
├── sensor.ts           # Ray-casting collision detection
├── controls.ts         # Keyboard input handling
├── road.ts            # Road boundaries and rendering
├── utils.ts           # Collision detection utilities
├── neural-network/
│   ├── network.ts     # Complete neural network implementation
│   ├── level.ts       # Individual network layer logic
│   └── visualizer.ts  # Real-time network visualization
├── main.ts            # Game loop and training orchestration
└── style.css          # UI styling
```

## 🏆 Achievements Unlocked

Through building this project, I mastered:

- ✅ Neural network implementation from mathematical foundations
- ✅ TypeScript in a real-world application
- ✅ Genetic algorithms and evolutionary computation
- ✅ Game physics and collision detection
- ✅ Real-time data visualization
- ✅ Browser API integration
- ✅ Complex state management

**🎯 I built this project to learn TypeScript and AI fundamentals through hands-on implementation**

_Watch artificial intelligence learn to drive, one generation at a time!_ 🚗💨
