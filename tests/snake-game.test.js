/**
 * Snake Game GUI Tests
 * Tests the core functionality of the Snake Game
 */

const SnakeGame = require('../snake-game.js');

// Mock canvas and context
class MockCanvas {
    constructor(width = 400, height = 400) {
        this.width = width;
        this.height = height;
        this.context = new MockCanvasContext();
    }

    getContext(type) {
        return this.context;
    }
}

class MockCanvasContext {
    constructor() {
        this.fillStyle = '';
        this.operations = [];
    }

    fillRect(x, y, width, height) {
        this.operations.push({ type: 'fillRect', x, y, width, height, fillStyle: this.fillStyle });
    }

    beginPath() {
        this.operations.push({ type: 'beginPath' });
    }

    arc(x, y, radius, startAngle, endAngle) {
        this.operations.push({ type: 'arc', x, y, radius, startAngle, endAngle });
    }

    fill() {
        this.operations.push({ type: 'fill', fillStyle: this.fillStyle });
    }

    clearOperations() {
        this.operations = [];
    }
}

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();

global.localStorage = localStorageMock;

describe('SnakeGame - GUI Tests', () => {
    let canvas;
    let game;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        
        // Create a fresh canvas and game instance
        canvas = new MockCanvas();
        game = new SnakeGame(canvas);
        
        // Clear any intervals
        jest.clearAllTimers();
    });

    afterEach(() => {
        // Clean up any running intervals
        if (game.gameLoopId) {
            clearInterval(game.gameLoopId);
        }
    });

    describe('Initial State', () => {
        test('should initialize with correct default values', () => {
            expect(game.score).toBe(0);
            expect(game.highScore).toBe(0);
            expect(game.gameRunning).toBe(false);
            expect(game.gamePaused).toBe(false);
            expect(game.bypassWalls).toBe(false);
            expect(game.snake.length).toBe(1);
        });

        test('should have snake starting in the center', () => {
            const centerPosition = Math.floor(game.tileCount / 2);
            expect(game.snake[0].x).toBe(centerPosition);
            expect(game.snake[0].y).toBe(centerPosition);
        });

        test('should have food generated at valid position', () => {
            expect(game.food.x).toBeGreaterThanOrEqual(0);
            expect(game.food.x).toBeLessThan(game.tileCount);
            expect(game.food.y).toBeGreaterThanOrEqual(0);
            expect(game.food.y).toBeLessThan(game.tileCount);
        });

        test('should render initial game state', () => {
            game.draw();
            expect(canvas.context.operations.length).toBeGreaterThan(0);
            
            // Should have black background
            const backgroundOp = canvas.context.operations.find(
                op => op.type === 'fillRect' && op.fillStyle === '#000'
            );
            expect(backgroundOp).toBeDefined();
            
            // Should have green snake
            const snakeOp = canvas.context.operations.find(
                op => op.type === 'fillRect' && op.fillStyle === '#00ff00'
            );
            expect(snakeOp).toBeDefined();
            
            // Should have red food
            const foodOp = canvas.context.operations.find(
                op => op.type === 'fill' && op.fillStyle === '#ff0000'
            );
            expect(foodOp).toBeDefined();
        });
    });

    describe('Game Start Functionality', () => {
        test('should start the game when startGame is called', () => {
            game.startGame();
            expect(game.gameRunning).toBe(true);
            expect(game.gamePaused).toBe(false);
        });

        test('should not start multiple game loops', () => {
            game.startGame();
            const firstLoopId = game.gameLoopId;
            game.startGame();
            expect(game.gameLoopId).toBe(firstLoopId);
        });

        test('should resume game from paused state', () => {
            game.startGame();
            game.togglePause();
            expect(game.gamePaused).toBe(true);
            
            game.startGame();
            expect(game.gamePaused).toBe(false);
        });
    });

    describe('Snake Movement and Keyboard Controls', () => {
        test('should change direction on arrow up key', () => {
            game.startGame();
            const result = game.handleKeyPress('arrowup');
            expect(result).toBe(true);
            expect(game.nextDirection).toEqual({ x: 0, y: -1 });
        });

        test('should change direction on arrow down key', () => {
            game.startGame();
            const result = game.handleKeyPress('arrowdown');
            expect(result).toBe(true);
            expect(game.nextDirection).toEqual({ x: 0, y: 1 });
        });

        test('should change direction on arrow left key', () => {
            game.startGame();
            game.direction = { x: 0, y: 1 }; // Moving down first
            const result = game.handleKeyPress('arrowleft');
            expect(result).toBe(true);
            expect(game.nextDirection).toEqual({ x: -1, y: 0 });
        });

        test('should change direction on arrow right key', () => {
            game.startGame();
            game.direction = { x: 0, y: 1 }; // Moving down
            const result = game.handleKeyPress('arrowright');
            expect(result).toBe(true);
            expect(game.nextDirection).toEqual({ x: 1, y: 0 });
        });

        test('should support WASD keys for movement', () => {
            game.startGame();
            
            game.handleKeyPress('w');
            expect(game.nextDirection).toEqual({ x: 0, y: -1 });
            
            game.direction = { x: 0, y: 1 };
            game.handleKeyPress('a');
            expect(game.nextDirection).toEqual({ x: -1, y: 0 });
            
            game.direction = { x: 1, y: 0 };
            game.handleKeyPress('s');
            expect(game.nextDirection).toEqual({ x: 0, y: 1 });
            
            game.direction = { x: 0, y: 1 };
            game.handleKeyPress('d');
            expect(game.nextDirection).toEqual({ x: 1, y: 0 });
        });

        test('should not allow reversing direction', () => {
            game.startGame();
            game.direction = { x: 1, y: 0 }; // Moving right
            game.handleKeyPress('arrowleft'); // Try to move left
            expect(game.nextDirection).not.toEqual({ x: -1, y: 0 });
        });

        test('should not respond to keys when game is not running', () => {
            const result = game.handleKeyPress('arrowup');
            expect(result).toBe(false);
        });
    });

    describe('Food Consumption and Score', () => {
        test('should increase score when eating food', () => {
            game.startGame();
            const initialScore = game.score;
            
            // Position snake to eat food
            game.snake[0] = { x: game.food.x - 1, y: game.food.y };
            game.direction = { x: 1, y: 0 };
            game.nextDirection = { x: 1, y: 0 };
            
            game.update();
            
            expect(game.score).toBe(initialScore + 10);
        });

        test('should grow snake when eating food', () => {
            game.startGame();
            const initialLength = game.snake.length;
            
            // Position snake to eat food
            game.snake[0] = { x: game.food.x - 1, y: game.food.y };
            game.direction = { x: 1, y: 0 };
            game.nextDirection = { x: 1, y: 0 };
            
            game.update();
            
            expect(game.snake.length).toBe(initialLength + 1);
        });

        test('should generate new food after consumption', () => {
            game.startGame();
            const oldFood = { ...game.food };
            
            // Position snake to eat food
            game.snake[0] = { x: game.food.x - 1, y: game.food.y };
            game.direction = { x: 1, y: 0 };
            game.nextDirection = { x: 1, y: 0 };
            
            game.update();
            
            expect(game.food).not.toEqual(oldFood);
        });
    });

    describe('Pause Functionality', () => {
        test('should pause the game', () => {
            game.startGame();
            const paused = game.togglePause();
            expect(paused).toBe(true);
            expect(game.gamePaused).toBe(true);
        });

        test('should resume from pause', () => {
            game.startGame();
            game.togglePause();
            const paused = game.togglePause();
            expect(paused).toBe(false);
            expect(game.gamePaused).toBe(false);
        });

        test('should not pause when game is not running', () => {
            const result = game.togglePause();
            expect(result).toBeUndefined();
        });
    });

    describe('Reset Functionality', () => {
        test('should reset game to initial state', () => {
            game.startGame();
            game.score = 50;
            game.snake.push({ x: 5, y: 5 });
            
            game.resetGame();
            
            expect(game.score).toBe(0);
            expect(game.snake.length).toBe(1);
            expect(game.gameRunning).toBe(false);
            expect(game.gamePaused).toBe(false);
        });

        test('should reset snake to center position', () => {
            game.startGame();
            game.snake[0] = { x: 5, y: 5 };
            
            game.resetGame();
            
            const centerPosition = Math.floor(game.tileCount / 2);
            expect(game.snake[0].x).toBe(centerPosition);
            expect(game.snake[0].y).toBe(centerPosition);
        });
    });

    describe('Game Over Modal', () => {
        test('should end game when hitting wall', () => {
            game.startGame();
            game.snake[0] = { x: 0, y: 10 };
            game.direction = { x: -1, y: 0 };
            game.nextDirection = { x: -1, y: 0 };
            
            const result = game.update();
            
            expect(game.gameRunning).toBe(false);
        });

        test('should end game when hitting self', () => {
            game.startGame();
            game.snake = [
                { x: 5, y: 5 },
                { x: 4, y: 5 },
                { x: 4, y: 6 },
                { x: 5, y: 6 }
            ];
            game.direction = { x: 0, y: 1 };
            game.nextDirection = { x: 0, y: 1 };
            
            game.update();
            
            expect(game.gameRunning).toBe(false);
        });

        test('should return final score on game over', () => {
            game.startGame();
            game.score = 30;
            game.snake[0] = { x: 0, y: 10 };
            game.direction = { x: -1, y: 0 };
            game.nextDirection = { x: -1, y: 0 };
            
            game.update();
            const result = game.endGame();
            
            expect(result.score).toBe(30);
        });

        test('should detect new high score', () => {
            game.startGame();
            game.score = 50;
            
            const result = game.endGame();
            
            expect(result.isNewRecord).toBe(true);
            expect(game.highScore).toBe(50);
        });
    });

    describe('Bypass Walls (Easy Mode) Option', () => {
        test('should enable bypass walls mode', () => {
            game.setBypassWalls(true);
            expect(game.bypassWalls).toBe(true);
        });

        test('should wrap snake to opposite side when bypassing left wall', () => {
            game.setBypassWalls(true);
            game.startGame();
            game.snake[0] = { x: 0, y: 10 };
            game.direction = { x: -1, y: 0 };
            game.nextDirection = { x: -1, y: 0 };
            
            game.update();
            
            expect(game.gameRunning).toBe(true);
            expect(game.snake[0].x).toBe(game.tileCount - 1);
        });

        test('should wrap snake to opposite side when bypassing right wall', () => {
            game.setBypassWalls(true);
            game.startGame();
            game.snake[0] = { x: game.tileCount - 1, y: 10 };
            game.direction = { x: 1, y: 0 };
            game.nextDirection = { x: 1, y: 0 };
            
            game.update();
            
            expect(game.gameRunning).toBe(true);
            expect(game.snake[0].x).toBe(0);
        });

        test('should wrap snake to opposite side when bypassing top wall', () => {
            game.setBypassWalls(true);
            game.startGame();
            game.snake[0] = { x: 10, y: 0 };
            game.direction = { x: 0, y: -1 };
            game.nextDirection = { x: 0, y: -1 };
            
            game.update();
            
            expect(game.gameRunning).toBe(true);
            expect(game.snake[0].y).toBe(game.tileCount - 1);
        });

        test('should wrap snake to opposite side when bypassing bottom wall', () => {
            game.setBypassWalls(true);
            game.startGame();
            game.snake[0] = { x: 10, y: game.tileCount - 1 };
            game.direction = { x: 0, y: 1 };
            game.nextDirection = { x: 0, y: 1 };
            
            game.update();
            
            expect(game.gameRunning).toBe(true);
            expect(game.snake[0].y).toBe(0);
        });
    });

    describe('High Score Persistence', () => {
        test('should save high score to localStorage', () => {
            game.score = 100;
            game.endGame();
            
            expect(localStorage.getItem('snakeHighScore')).toBe('100');
        });

        test('should load high score from localStorage', () => {
            localStorage.setItem('snakeHighScore', '150');
            
            const newGame = new SnakeGame(canvas);
            
            expect(newGame.highScore).toBe('150');
        });

        test('should not update high score if current score is lower', () => {
            localStorage.setItem('snakeHighScore', '100');
            const newGame = new SnakeGame(canvas);
            newGame.score = 50;
            
            const result = newGame.endGame();
            
            expect(result.isNewRecord).toBe(false);
            expect(localStorage.getItem('snakeHighScore')).toBe('100');
        });
    });

    describe('Game State', () => {
        test('should return correct game state', () => {
            game.startGame();
            game.score = 20;
            
            const state = game.getGameState();
            
            expect(state.score).toBe(20);
            expect(state.gameRunning).toBe(true);
            expect(state.gamePaused).toBe(false);
            expect(state.snakeLength).toBe(1);
            expect(state.bypassWalls).toBe(false);
        });

        test('should reflect state changes', () => {
            game.setBypassWalls(true);
            game.startGame();
            game.togglePause();
            
            const state = game.getGameState();
            
            expect(state.gameRunning).toBe(true);
            expect(state.gamePaused).toBe(true);
            expect(state.bypassWalls).toBe(true);
        });
    });
});
