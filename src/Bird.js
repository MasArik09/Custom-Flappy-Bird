export class Bird {
    /**
     * Represents the player's character (Bird)
     * @param {number} x - Initial horizontal position of the bird's center
     * @param {number} y - Initial vertical position of the bird's center
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 16;
        this.velocityY = 0;
        this.gravity = 0.25;
        this.jumpForce = 5.5;
        this.flyAcceleration = 0.4;
        this.hp = 3;
        this.isInvincible = false;

        // Terminal velocity to prevent the bird from falling too fast
        this.terminalVelocity = 8;

        // Timer properties for invincibility frames (i-frames) and flashing visual effects
        this.invincibilityTimer = 0;
        this.blinkTimer = 0;
    }

    /**
     * Updates the physics and status of the bird
     * @param {number} dt - Delta time in seconds
     * @param {boolean} isLongPress - True if the player is holding down the fly input
     */
    update(dt, isLongPress) {
        // Multiplier to scale physics constants relative to 60 FPS standard
        const timeScale = dt * 60;

        if (isLongPress) {
            // Apply upward lift acceleration
            this.velocityY -= this.flyAcceleration * timeScale;
        } else {
            // Apply downward gravity acceleration
            this.velocityY += this.gravity * timeScale;
        }

        // Clamp falling speed to terminal velocity
        if (this.velocityY > this.terminalVelocity) {
            this.velocityY = this.terminalVelocity;
        }

        // Update vertical position based on velocity
        this.y += this.velocityY * timeScale;

        // Manage invincibility frames countdown if active
        if (this.isInvincible) {
            this.invincibilityTimer -= dt;
            this.blinkTimer += dt;
            if (this.invincibilityTimer <= 0) {
                this.isInvincible = false;
                this.blinkTimer = 0;
            }
        }
    }

    /**
     * Renders the bird as a yellow circle on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
     */
    draw(ctx) {
        ctx.save();
        
        // Blink effect if invincible: alternate opacity periodically
        if (this.isInvincible) {
            // Alternate opacity every ~100ms based on blinkTimer
            if (Math.floor(this.blinkTimer * 10) % 2 === 0) {
                ctx.globalAlpha = 0.2;
            } else {
                ctx.globalAlpha = 0.7;
            }
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }

    /**
     * Triggers an instant vertical jump upward (flap)
     */
    flap() {
        this.velocityY = -this.jumpForce;
    }

    /**
     * Reduces HP by 1 and activates invincibility frames for 1.5 seconds
     */
    triggerInvincibility() {
        this.isInvincible = true;
        this.invincibilityTimer = 1.5;
        this.blinkTimer = 0;
        this.hp -= 1;
        if (this.hp < 0) {
            this.hp = 0;
        }
        console.log(`Bird hit! HP remaining: ${this.hp}. Invincibility activated.`);
    }
}
