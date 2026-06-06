import { Pipe } from './Pipe.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas internal dimensions statically to landscape 16:9 ratio
        this.canvas.width = 960;
        this.canvas.height = 540;

        // Game State Machine
        this.currentState = 'MENU'; // States: 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'

        // Timing variables
        this.lastTime = 0;

        // Core Game properties
        this.bird = null;
        this.pipes = []; // Centralized pipe array
        this.ui = null;
        this.audio = null;
        
        this.currentDistance = 0;
        this.highScore = 0;
    }

    /**
     * Entry point to prepare the game environment and start the loop
     */
    init() {
        console.log("Game initialized and starting game loop...");
        
        // For testing purposes during early phases, let's allow starting directly in PLAYING
        // when init is called, or we can keep it as MENU. Let's keep it MENU as default.
        this.start();
    }

    /**
     * Initializes the timestamp and starts the loop
     */
    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    /**
     * Main game loop running at 60 FPS using requestAnimationFrame
     * @param {number} timestamp - The current time in milliseconds
     */
    loop(timestamp) {
        // Calculate delta time in seconds
        let dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Cap dt to prevent massive jumps (e.g. if browser tab loses focus)
        if (dt > 0.1) {
            dt = 0.1;
        }

        // Process game update and render
        this.update(dt);
        this.draw();

        // Loop next frame
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    /**
     * Updates game logic based on elapsed time (delta time)
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Only update gameplay entities when in PLAYING state
        if (this.currentState === 'PLAYING') {
            // Update all pipes
            for (let i = 0; i < this.pipes.length; i++) {
                this.pipes[i].update(dt);
            }

            // Pipe spawning logic:
            // Spawn first pipe, or spawn next pipe when the last pipe's X moves past 200px from right edge
            if (this.pipes.length === 0) {
                this.pipes.push(new Pipe(this.canvas.width));
            } else {
                const lastPipe = this.pipes[this.pipes.length - 1];
                if (lastPipe.x < this.canvas.width - 200) {
                    this.pipes.push(new Pipe(this.canvas.width));
                }
            }

            // Memory management check:
            // If the first pipe is completely off the left screen edge, remove it
            if (this.pipes.length > 0) {
                const firstPipe = this.pipes[0];
                if (firstPipe.x + firstPipe.width < 0) {
                    this.pipes.shift();
                }
            }
        }
    }

    /**
     * Renders visuals on the canvas
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Standard black screen background drawing
        this.ctx.fillStyle = '#0b0b0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render pipes if game is playing
        if (this.currentState === 'PLAYING') {
            for (let i = 0; i < this.pipes.length; i++) {
                this.pipes[i].draw(this.ctx);
            }
        }

        // Draw temporary indicator to verify game loop is running
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Outfit, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            `State: ${this.currentState} | Loop Active | Pipes: ${this.pipes.length}`, 
            this.canvas.width / 2, 
            this.canvas.height / 2
        );
    }

    /**
     * Changes the game state
     * @param {string} newState - The state to transition to
     */
    changeState(newState) {
        this.currentState = newState;
    }

    /**
     * Handles input actions from entry points
     * @param {string} eventType - Keyboard or mouse event type
     * @param {any} eventData - Details about the event
     */
    handleInput(eventType, eventData) {
        // Input handling akan diintegrasikan di fase berikutnya
    }
}
