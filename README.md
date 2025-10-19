# Snake Game - Testing Documentation

## Overview
This repository contains a Snake Game with comprehensive GUI tests to ensure functionality and reliability.

## Test Coverage

The test suite includes 36 tests covering all major features:

### Initial State (4 tests)
- Game initialization with correct default values
- Snake starting position in the center
- Food generation at valid positions
- Initial rendering of game elements

### Game Start Functionality (3 tests)
- Starting the game
- Preventing multiple game loop instances
- Resuming from paused state

### Snake Movement and Keyboard Controls (6 tests)
- Arrow key controls (up, down, left, right)
- WASD key support
- Prevention of reversing direction
- No response when game is not running

### Food Consumption and Score (3 tests)
- Score increase when eating food
- Snake growth when eating food
- New food generation after consumption

### Pause Functionality (3 tests)
- Pausing the game
- Resuming from pause
- No pause when game is not running

### Reset Functionality (2 tests)
- Resetting game to initial state
- Snake position reset to center

### Game Over Modal (4 tests)
- Game ending when hitting walls
- Game ending when hitting self
- Final score display
- New high score detection

### Bypass Walls (Easy Mode) Option (5 tests)
- Enabling bypass walls mode
- Wrapping around left wall
- Wrapping around right wall
- Wrapping around top wall
- Wrapping around bottom wall

### High Score Persistence (3 tests)
- Saving high score to localStorage
- Loading high score from localStorage
- Not updating when current score is lower

### Game State (2 tests)
- Returning correct game state
- Reflecting state changes

## Running Tests

### Prerequisites
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Test Framework
- **Jest**: Test framework with JSDOM environment for DOM manipulation testing
- **Mock Canvas**: Custom canvas mock for testing rendering logic

## Project Structure
```
├── snake_game.html        # Main game HTML file
├── snake-game.js          # Game logic (extracted for testability)
├── tests/
│   └── snake-game.test.js # Comprehensive test suite
├── package.json           # Dependencies and scripts
├── jest.config.js         # Jest configuration
└── README.md              # This file
```

## Testing Approach

The tests use a **unit testing** approach with:
- **Mock Canvas**: Custom implementation to test rendering without a real browser
- **Mock LocalStorage**: Simulated localStorage for testing persistence
- **Isolated Tests**: Each test is independent with fresh instances

## Key Features Tested

✅ Game initialization and initial state  
✅ Start, pause, and reset functionality  
✅ Keyboard controls (Arrow keys and WASD)  
✅ Food consumption and scoring  
✅ Snake growth mechanics  
✅ Collision detection (walls and self)  
✅ Easy mode (bypass walls)  
✅ High score persistence  
✅ Game state management  
✅ UI rendering

## Contributing

When adding new features, please:
1. Write tests for the new functionality
2. Ensure all existing tests pass
3. Update this documentation
