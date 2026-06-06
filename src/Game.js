import { Pipe } from './Pipe.js';
import { Bird } from './Bird.js';
import { UI } from './UI.js';
import { Audio } from './Audio.js';

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
        this.bird = new Bird(150, 270); // Posisi awal x=150, y=270 (tengah-tengah vertical)
        this.pipes = []; // Centralized pipe array
        this.ui = new UI();
        this.audio = new Audio(); // Instansiasi Web Audio API wrapper

        // Parallax background scrolling clouds
        this.clouds = [
            { x: 100, y: 50, scale: 0.8, speed: 0.2 },
            { x: 400, y: 80, scale: 1.2, speed: 0.3 },
            { x: 750, y: 40, scale: 0.9, speed: 0.15 },
            { x: 1050, y: 70, scale: 1.1, speed: 0.25 }
        ];

        // Input and state helpers
        this.isJumpPressed = false;
        this.isMuted = false;
        
        this.currentDistance = 0;
        this.highScore = 0;
    }

    /**
     * Entry point to prepare the game environment and start the loop
     */
    init() {
        console.log("Game initialized and starting game loop...");

        // Setup event listeners
        window.addEventListener('keydown', (e) => this.handleInput('keydown', e));
        window.addEventListener('keyup', (e) => this.handleInput('keyup', e));
        this.canvas.addEventListener('mousedown', (e) => this.handleInput('mousedown', e));
        this.canvas.addEventListener('mouseup', (e) => this.handleInput('mouseup', e));

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
     * Difficulty scaling check: returns environmental scroll speed based on player progress
     * @returns {number} Speed constant
     */
    getCurrentSpeed() {
        const distance = this.currentDistance;
        if (distance <= 100) {
            return 3.0; // Easy Mode (extended to 100m)
        } else if (distance <= 200) {
            return 3.6; // Medium Mode (reduced speed from 4.2)
        } else {
            return 4.4; // Hard Mode (reduced speed from 5.5)
        }
    }

    /**
     * Updates game logic based on elapsed time (delta time)
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Multiplier to scale speed relative to 60 FPS standard
        const timeScale = dt * 60;

        // Update background clouds (always active to keep background feeling alive)
        for (let i = 0; i < this.clouds.length; i++) {
            const cloud = this.clouds[i];
            cloud.x -= cloud.speed * timeScale;
            // Recycle cloud if it goes completely off the left edge
            if (cloud.x < -150 * cloud.scale) {
                cloud.x = this.canvas.width + 50;
                cloud.y = Math.random() * 80 + 30; // Random height
                cloud.scale = Math.random() * 0.6 + 0.7; // Scale between 0.7 and 1.3
                cloud.speed = Math.random() * 0.15 + 0.15; // Slow scroll speed
            }
        }

        // Only update gameplay entities when in PLAYING state
        if (this.currentState === 'PLAYING') {
            // 1. Increment distance based on survival time (5 meters per second)
            this.currentDistance += dt * 5;

            // Get current environmental speed based on progress thresholds
            const currentSpeed = this.getCurrentSpeed();

            // 2. Update bird physics, passing long press status
            if (this.bird) {
                this.bird.update(dt, this.isJumpPressed);
            }

            // 3. Update all pipes & check for pipe clearing score bonus
            for (let i = 0; i < this.pipes.length; i++) {
                const pipe = this.pipes[i];
                
                // Adjust speed dynamically to match current difficulty scaling
                pipe.speed = currentSpeed;
                pipe.update(dt);

                // Check if the entire bird body has passed the back edge of the pipe
                if (this.bird && !pipe.hasPassed) {
                    if (pipe.x + pipe.width < this.bird.x - this.bird.radius) {
                        this.currentDistance += 15; // Give significant bonus score (15m)
                        pipe.hasPassed = true;
                        
                        // Play score SFX
                        if (this.audio) {
                            this.audio.playSFX('score');
                        }
                        
                        console.log(`Cleared pipe! +15M Bonus. Current Score: ${Math.floor(this.currentDistance)} M`);
                    }
                }
            }

            // 4. Collision checking (only if bird exists and is not currently invincible)
            if (this.bird && !this.bird.isInvincible) {
                let collided = false;

                // A. Upper & Lower screen boundaries check with 5px forgiving tolerance
                if (this.bird.y - this.bird.radius < -5) {
                    collided = true;
                } else if (this.bird.y + this.bird.radius > 545) { // 540 (canvas height) + 5
                    collided = true;
                }

                // B. Obstacle pipes collision check
                if (!collided) {
                    for (let i = 0; i < this.pipes.length; i++) {
                        const pipe = this.pipes[i];

                        // Create bounding boxes for top and bottom pipes
                        const topPipeRect = {
                            x: pipe.x,
                            y: 0,
                            width: pipe.width,
                            height: pipe.topHeight
                        };
                        const bottomPipeRect = {
                            x: pipe.x,
                            y: pipe.bottomY,
                            width: pipe.width,
                            height: this.canvas.height - pipe.bottomY
                        };

                        if (this.checkCollision(this.bird, topPipeRect) || this.checkCollision(this.bird, bottomPipeRect)) {
                            collided = true;
                            break;
                        }
                    }
                }

                // C. Handle collision consequence
                if (collided) {
                    this.bird.triggerInvincibility();
                    
                    // Play hit SFX
                    if (this.audio) {
                        this.audio.playSFX('hit');
                    }

                    // If HP reaches 0, transition to Game Over and record High Score
                    if (this.bird.hp <= 0) {
                        this.changeState('GAMEOVER');
                        
                        // Stop music on game over
                        if (this.audio) {
                            this.audio.stopBGM();
                        }
                        
                        if (this.currentDistance > this.highScore) {
                            this.highScore = this.currentDistance;
                        }
                    }
                }
            }

            // Pipe spawning logic:
            // Spawn first pipe, or spawn next pipe when the last pipe's X moves past 200px from right edge
            if (this.pipes.length === 0) {
                // Initial pipe is static (isDynamic = false)
                this.pipes.push(new Pipe(this.canvas.width, currentSpeed, false));
            } else {
                const lastPipe = this.pipes[this.pipes.length - 1];
                if (lastPipe.x < this.canvas.width - 200) {
                    // Check if current rounded distance triggers a Dynamic Obstacle Phase (moving pipes):
                    // Active every 100m interval, with a remainder tolerance range of 0 to 15m.
                    const dTrigger = Math.floor(this.currentDistance);
                    const isDynamic = (dTrigger % 100 >= 0 && dTrigger % 100 <= 15) && (dTrigger >= 100);
                    
                    this.pipes.push(new Pipe(this.canvas.width, currentSpeed, isDynamic));
                    
                    if (isDynamic) {
                        console.log(`Spawned a dynamic vertically-moving pipe! (Current distance: ${dTrigger} M)`);
                    }
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
     * Circle-to-Rectangle collision detection algorithm (clamping method / Pythagoras)
     * @param {Bird} bird - The bird character (circle shape representation)
     * @param {Object} rect - Bounding box rectangle details (x, y, width, height)
     * @returns {boolean} True if they intersect
     */
    checkCollision(bird, rect) {
        // Find closest point on the rectangle to the center of the bird circle
        const closestX = Math.max(rect.x, Math.min(bird.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(bird.y, rect.y + rect.height));

        // Calculate horizontal and vertical distances
        const distanceX = bird.x - closestX;
        const distanceY = bird.y - closestY;

        // Use Pythagorean Theorem to determine if distance is less than bird radius
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (bird.radius * bird.radius);
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

        // Draw background clouds parallax effect
        if (this.ui) {
            this.ui.drawClouds(this.ctx, this.clouds);
        }

        // Render gameplay elements (visible in PLAYING, PAUSED, and GAMEOVER states)
        if (this.currentState === 'PLAYING' || this.currentState === 'PAUSED' || this.currentState === 'GAMEOVER') {
            // Draw all pipes
            for (let i = 0; i < this.pipes.length; i++) {
                this.pipes[i].draw(this.ctx);
            }

            // Draw bird character
            if (this.bird) {
                this.bird.draw(this.ctx);
            }
        }

        // Draw HUD / Overlays using the stateless UI helper
        if (this.ui) {
            switch (this.currentState) {
                case 'MENU':
                    this.ui.drawMenu(this.ctx, this.isMuted);
                    break;
                case 'PLAYING':
                    this.ui.drawHUD(this.ctx, this.currentDistance, this.bird ? this.bird.hp : 3, this.isMuted);
                    break;
                case 'PAUSED':
                    // Show standard gameplay HUD underneath the pause overlay
                    this.ui.drawHUD(this.ctx, this.currentDistance, this.bird ? this.bird.hp : 3, this.isMuted);
                    this.ui.drawPause(this.ctx);
                    break;
                case 'GAMEOVER':
                    this.ui.drawGameOver(this.ctx, this.currentDistance, this.highScore);
                    break;
            }
        }
    }

    /**
     * Changes the game state
     * @param {string} newState - The state to transition to
     */
    changeState(newState) {
        this.currentState = newState;
        console.log(`Game state changed to: ${newState}`);
    }

    /**
     * Handles keyboard and mouse inputs centralizing trigger routing
     * @param {string} eventType - Type of action ('keydown', 'keyup', 'mousedown', 'mouseup')
     * @param {Event} event - Original browser input event details
     */
    handleInput(eventType, event) {
        if (eventType === 'keydown') {
            const key = event.key;

            // 1. MENU state keys
            if (this.currentState === 'MENU') {
                if (key === ' ' || key === 'Enter') {
                    // Start BGM on user start request (complies with browser autoplay policy)
                    if (this.audio) {
                        this.audio.resumeContext();
                        this.audio.playBGM();
                    }
                    this.changeState('PLAYING');
                    event.preventDefault();
                }
            }

            // 2. PLAYING state keys
            else if (this.currentState === 'PLAYING') {
                if (key === ' ' || key === 'ArrowUp') {
                    // Instantly flap once, hold triggers continuous rise
                    if (!event.repeat) {
                        this.bird.flap();
                        
                        // Play jump sound
                        if (this.audio) {
                            this.audio.playSFX('flap');
                        }
                    }
                    this.isJumpPressed = true;
                    event.preventDefault();
                } else if (key === 'p' || key === 'P') {
                    this.changeState('PAUSED');
                    event.preventDefault();
                }
            }

            // 3. PAUSED state keys
            else if (this.currentState === 'PAUSED') {
                if (key === 'p' || key === 'P') {
                    this.changeState('PLAYING');
                    event.preventDefault();
                }
            }

            // 4. GAMEOVER state keys
            else if (this.currentState === 'GAMEOVER') {
                if (key === ' ') {
                    this.restartGame();
                    event.preventDefault();
                }
            }
        }

        else if (eventType === 'keyup') {
            const key = event.key;
            if (key === ' ' || key === 'ArrowUp') {
                this.isJumpPressed = false;
            }
        }

        else if (eventType === 'mousedown') {
            // Get click coordinates relative to internal 960x540 dimensions
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = ((event.clientX - rect.left) / rect.width) * this.canvas.width;
            const mouseY = ((event.clientY - rect.top) / rect.height) * this.canvas.height;

            // 1. MENU state clicks
            if (this.currentState === 'MENU') {
                // Check Start Game button: X: 360-600, Y: 252.5-307.5
                if (mouseX >= 360 && mouseX <= 600 && mouseY >= 252.5 && mouseY <= 307.5) {
                    if (this.audio) {
                        this.audio.resumeContext();
                        this.audio.playBGM();
                    }
                    this.changeState('PLAYING');
                }
                // Check Mute button: X: 880-940, Y: 20-60
                else if (mouseX >= 880 && mouseX <= 940 && mouseY >= 20 && mouseY <= 60) {
                    if (this.audio) {
                        this.audio.toggleMute();
                        this.isMuted = this.audio.isMuted;
                    }
                }
            }

            // 2. PLAYING state clicks
            else if (this.currentState === 'PLAYING') {
                // Check Mute button in top-right corner
                if (mouseX >= 880 && mouseX <= 940 && mouseY >= 20 && mouseY <= 60) {
                    if (this.audio) {
                        this.audio.toggleMute();
                        this.isMuted = this.audio.isMuted;
                    }
                } else {
                    // Regular click flaps the bird and sets hold state
                    this.bird.flap();
                    
                    // Play jump sound
                    if (this.audio) {
                        this.audio.playSFX('flap');
                    }
                    
                    this.isJumpPressed = true;
                }
            }

            // 3. GAMEOVER state clicks
            else if (this.currentState === 'GAMEOVER') {
                // Check Restart button: X: 360-600, Y: 332.5-387.5
                if (mouseX >= 360 && mouseX <= 600 && mouseY >= 332.5 && mouseY <= 387.5) {
                    this.restartGame();
                }
            }
        }

        else if (eventType === 'mouseup') {
            this.isJumpPressed = false;
        }
    }

    /**
     * Resets bird physics, clears obstacles, resets score, and launches into gameplay
     */
    restartGame() {
        if (this.bird) {
            this.bird.hp = 3;
            this.bird.y = 270;
            this.bird.velocityY = 0;
            this.bird.isInvincible = false;
            this.bird.invincibilityTimer = 0;
        }
        this.pipes = [];
        this.currentDistance = 0;
        
        // Resume background music on restart
        if (this.audio) {
            this.audio.playBGM();
        }
        
        this.changeState('PLAYING');
        console.log("Game restarted.");
    }
}
