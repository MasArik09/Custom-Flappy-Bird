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
        this.gravity = 0.35; // Increased to 0.35 for a snappy, weighted, and realistic fall
        this.jumpForce = 5.2; // Set to 5.2 to allow hopping over obstacles easily without overshooting
        this.flyAcceleration = 0.20; // Reduced to 0.20 for gentle continuous flight controls
        this.hp = 3;
        this.isInvincible = false;

        // Terminal velocity to prevent the bird from falling too fast
        this.terminalVelocity = 8.0; // Restored to 8.0 to support fast responsive dives

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
     * Renders the bird as a detailed vector character on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
     */
    draw(ctx) {
        ctx.save();

        // Translate context to bird center for coordinate simplicity
        ctx.translate(this.x, this.y);

        // Rotate bird slightly based on vertical speed (tilt up when jumping, tilt down when falling)
        // Clamped between -30deg (-0.5 rad) and 60deg (1.0 rad)
        let tilt = this.velocityY * 0.08;
        if (tilt < -0.5) tilt = -0.5;
        if (tilt > 1.0) tilt = 1.0;
        ctx.rotate(tilt);

        // Handle invincibility blinking transparency
        if (this.isInvincible) {
            if (Math.floor(this.blinkTimer * 10) % 2 === 0) {
                ctx.globalAlpha = 0.2;
            } else {
                ctx.globalAlpha = 0.7;
            }
        }

        // Set global line width and stroke style for clean cartoon outlines
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;

        // 1. Draw Tail / Feathers (Back)
        ctx.fillStyle = '#f39c12'; // Lighter orange-yellow
        ctx.beginPath();
        ctx.moveTo(-this.radius, -this.radius * 0.3);
        ctx.lineTo(-this.radius - 8, -this.radius * 0.6);
        ctx.lineTo(-this.radius - 5, 0);
        ctx.lineTo(-this.radius - 8, this.radius * 0.6);
        ctx.lineTo(-this.radius, this.radius * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Draw Body (Yellow Main Circle)
        ctx.fillStyle = '#f1c40f'; // Bright Flappy Yellow
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3. Draw Belly (White highlight at bottom)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, Math.PI * 0.2, Math.PI * 0.8);
        ctx.quadraticCurveTo(0, this.radius * 0.4, -this.radius * 0.8, this.radius * 0.3);
        ctx.fill();
        ctx.stroke();

        // 4. Draw Eye (Big cute cartoon eye)
        const eyeX = this.radius * 0.35;
        const eyeY = -this.radius * 0.3;
        const eyeRadius = this.radius * 0.35;
        
        // Eyeball (white)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Pupil (black)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eyeX + 2, eyeY, eyeRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 5. Draw Beak (Orange beak)
        ctx.fillStyle = '#e67e22'; // Orange
        ctx.beginPath();
        // Upper beak
        ctx.moveTo(this.radius * 0.8, -this.radius * 0.15);
        ctx.lineTo(this.radius * 1.4, 0);
        ctx.lineTo(this.radius * 0.8, this.radius * 0.15);
        // Lower beak
        ctx.lineTo(this.radius * 1.2, this.radius * 0.22);
        ctx.lineTo(this.radius * 0.7, this.radius * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 6. Draw Wing (Flapping based on performance.now() animation tick)
        ctx.save();
        // Translate to wing pivot point
        ctx.translate(-this.radius * 0.3, 0);
        
        // Flapping oscillation
        const flap = Math.sin(performance.now() / 80) * 0.5;
        ctx.rotate(flap);
        
        ctx.fillStyle = '#f39c12'; // Lighter orange-yellow for wing contrast
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 0.5, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

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
