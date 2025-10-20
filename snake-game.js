// Snake Game Logic
class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = canvas.width / this.gridSize;
        
        this.snake = [
            { x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2) }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.foodCount = 3;
        this.food = this.generateFood();
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoopId = null;
        this.bypassWalls = false;
    }

    generateFood() {
        const foodItems = [];
        
        for (let i = 0; i < this.foodCount; i++) {
            let newFood;
            let validPosition = false;

            while (!validPosition) {
                newFood = {
                    x: Math.floor(Math.random() * this.tileCount),
                    y: Math.floor(Math.random() * this.tileCount)
                };

                // Check if position overlaps with snake or other food items
                validPosition = !this.snake.some(
                    segment => segment.x === newFood.x && segment.y === newFood.y
                ) && !foodItems.some(
                    food => food.x === newFood.x && food.y === newFood.y
                );
            }

            foodItems.push(newFood);
        }

        return foodItems;
    }

    generateSingleFood() {
        let newFood;
        let validPosition = false;

        while (!validPosition) {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };

            // Check if position overlaps with snake or other food items
            validPosition = !this.snake.some(
                segment => segment.x === newFood.x && segment.y === newFood.y
            ) && !this.food.some(
                food => food.x === newFood.x && food.y === newFood.y
            );
        }

        return [newFood];
    }

    startGame() {
        if (this.gameRunning && !this.gamePaused) return;

        this.gameRunning = true;
        this.gamePaused = false;

        if (this.gameLoopId) clearInterval(this.gameLoopId);
        this.gameLoopId = setInterval(() => this.update(), 100);
    }

    togglePause() {
        if (!this.gameRunning) return;

        this.gamePaused = !this.gamePaused;

        if (this.gamePaused) {
            clearInterval(this.gameLoopId);
        } else {
            this.gameLoopId = setInterval(() => this.update(), 100);
        }
        return this.gamePaused;
    }

    resetGame() {
        clearInterval(this.gameLoopId);
        this.snake = [{ x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2) }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.draw();
    }

    handleKeyPress(key) {
        if (!this.gameRunning) return false;

        switch (key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                    return true;
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                    return true;
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                    return true;
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                    return true;
                }
                break;
        }
        return false;
    }

    update() {
        this.direction = this.nextDirection;
        let head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            if (this.bypassWalls) {
                // Wrap around to the other side
                if (head.x < 0) head.x = this.tileCount - 1;
                if (head.x >= this.tileCount) head.x = 0;
                if (head.y < 0) head.y = this.tileCount - 1;
                if (head.y >= this.tileCount) head.y = 0;
            } else {
                this.endGame();
                return;
            }
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        // Check food collision
        const foodIndex = this.food.findIndex(food => food.x === head.x && food.y === head.y);
        if (foodIndex !== -1) {
            this.score += 10;
            // Remove eaten food and generate a new one
            this.food.splice(foodIndex, 1);
            this.food.push(...this.generateSingleFood());
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#00ff00';
            } else {
                this.ctx.fillStyle = '#00cc00';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.food.forEach(foodItem => {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(
                foodItem.x * this.gridSize + this.gridSize / 2,
                foodItem.y * this.gridSize + this.gridSize / 2,
                this.gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    endGame() {
        clearInterval(this.gameLoopId);
        this.gameRunning = false;

        let isNewRecord = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            isNewRecord = true;
        }

        return { score: this.score, isNewRecord: isNewRecord };
    }

    setBypassWalls(bypass) {
        this.bypassWalls = bypass;
    }

    getGameState() {
        return {
            score: this.score,
            highScore: this.highScore,
            gameRunning: this.gameRunning,
            gamePaused: this.gamePaused,
            snakeLength: this.snake.length,
            bypassWalls: this.bypassWalls
        };
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnakeGame;
}
