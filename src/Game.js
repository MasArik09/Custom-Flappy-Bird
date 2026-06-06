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

        // Core Game properties (to be initialized in future phases)
        this.bird = null;
        this.pipes = [];
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
     * Stub for updating game logic based on elapsed time (delta time)
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Logika game update akan diimplementasikan pada fase berikutnya
    }

    /**
     * Stub for rendering visuals on the canvas
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Standard black screen background drawing
        this.ctx.fillStyle = '#0b0b0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw temporary indicator to verify game loop is running
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Outfit, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`State: ${this.currentState} | Loop Active`, this.canvas.width / 2, this.canvas.height / 2);
    }

    /**
     * Stub for changing the game state
     * @param {string} newState - The state to transition to
     */
    changeState(newState) {
        this.currentState = newState;
    }

    /**
     * Stub for handling input actions from entry points
     * @param {string} eventType - Keyboard or mouse event type
     * @param {any} eventData - Details about the event
     */
    handleInput(eventType, eventData) {
        // Input handling akan diintegrasikan di fase berikutnya
    }
}
