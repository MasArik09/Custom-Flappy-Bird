export class Pipe {
    /**
     * Represents a pair of obstacles (top and bottom pipes)
     * @param {number} canvasWidth - Initial horizontal position at the right edge of the canvas
     * @param {number} speed - Scroll speed of the pipe moving to the left
     * @param {boolean} isDynamic - True if the pipe moves vertically up and down
     */
    constructor(canvasWidth, speed = 3.0, isDynamic = false) {
        this.x = canvasWidth;
        this.width = 60;
        this.speed = speed;
        this.gap = 150;

        // Random height for top pipe (canvas height is 540)
        // Leave at least 50px space from top, and 50px space from the bottom (after the gap)
        const minHeight = 50;
        const maxHeight = 340; // 540 (canvasHeight) - 150 (gap) - 50 (minHeight)
        this.topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        // Bottom pipe start coordinate Y
        this.bottomY = this.topHeight + this.gap;

        this.isDynamic = isDynamic;
        this.hasPassed = false;

        // Vertical movement properties for dynamic pipes (Fase Pipa Bergerak)
        this.verticalSpeed = 1.5;
        this.direction = 1; // 1: down, -1: up
    }

    /**
     * Updates the horizontal position of the pipe
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Multiplier to scale speed relative to 60 FPS standard
        const timeScale = dt * 60;

        // Move horizontal position to the left
        this.x -= this.speed * timeScale;
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
