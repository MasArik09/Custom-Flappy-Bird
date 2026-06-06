export class Pipe {
    /**
     * Represents a pair of obstacles (top and bottom pipes)
     * @param {number} canvasWidth - Initial horizontal position at the right edge of the canvas
     * @param {number} speed - Scroll speed of the pipe moving to the left
     * @param {boolean} isDynamic - True if the pipe moves vertically up and down
     */
    constructor(canvasWidth, speed = 3.0, isDynamic = false) {
        this.x = canvasWidth;
        this.width = 40;
        this.speed = speed;
        this.gap = 170; // Increased from 150 to 170 for wider vertical traversal space

        // Random height for top pipe (canvas height is 540)
        // Leave at least 50px space from top, and 50px space from the bottom (after the gap)
        const minHeight = 50;
        const maxHeight = 320; // 540 (canvasHeight) - 170 (gap) - 50 (minHeight) = 320
        this.topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        // Bottom pipe start coordinate Y
        this.bottomY = this.topHeight + this.gap;

        this.isDynamic = isDynamic;
        this.hasPassed = false;

        // Vertical movement properties for dynamic pipes (Fase Pipa Bergerak)
        this.verticalSpeed = 0.8; // Reduced from 1.5 to 0.8 for gentler vertical oscillations
        this.direction = 1; // 1: down, -1: up
    }

    /**
     * Updates the horizontal and vertical position of the pipe
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Multiplier to scale speed relative to 60 FPS standard
        const timeScale = dt * 60;

        // Move horizontal position to the left
        this.x -= this.speed * timeScale;

        // Linear vertical movement (Fase Pipa Bergerak)
        if (this.isDynamic) {
            // Adjust topHeight based on vertical speed and current direction
            this.topHeight += this.verticalSpeed * this.direction * timeScale;

            // Clamping check with 50px boundary tolerances (canvas height is 540, gap is 170)
            // Minimum topHeight = 50px. Maximum topHeight = 320px (keeps bottomY at 490px, leaving 50px padding from bottom)
            if (this.topHeight < 50) {
                this.topHeight = 50;
                this.direction = 1; // Reverse direction to move down
            } else if (this.topHeight > 320) {
                this.topHeight = 320;
                this.direction = -1; // Reverse direction to move up
            }

            // Sync the bottom pipe coordinate Y
            this.bottomY = this.topHeight + this.gap;
        }
    }

    /**
     * Draws the pair of pipes on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
     */
    draw(ctx) {
        ctx.save();

        // Style settings for premium look: sleek green filling and darker green border
        ctx.fillStyle = '#2ecc71';
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 3;

        // 1. Draw Top Pipe
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        ctx.strokeRect(this.x, 0, this.width, this.topHeight);

        // 2. Draw Bottom Pipe
        const canvasHeight = 540;
        const bottomHeight = canvasHeight - this.bottomY;
        ctx.fillRect(this.x, this.bottomY, this.width, bottomHeight);
        ctx.strokeRect(this.x, this.bottomY, this.width, bottomHeight);

        ctx.restore();
    }
}
