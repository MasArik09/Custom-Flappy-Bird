export class UI {
    /**
     * Helper to draw a rounded rectangle on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {number} x - Top left X coordinate
     * @param {number} y - Top left Y coordinate
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {number} radius - Corner radius
     * @param {string|CanvasGradient} fillColor - Fill color (CSS color string or gradient)
     * @param {string} strokeColor - Border color
     * @param {number} strokeWidth - Border line width
     */
    drawRoundedRect(ctx, x, y, width, height, radius, fillColor, strokeColor, strokeWidth = 2) {
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, width, height, radius);
        } else {
            // Fallback for older environments
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
        }
        ctx.closePath();

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Helper to draw a red vector love heart representing character health (HP)
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {number} x - Top left X bounding coordinate
     * @param {number} y - Top left Y bounding coordinate
     * @param {number} size - Scale size of the heart
     * @param {string} color - Color of the heart shape
     */
    drawHeart(ctx, x, y, size, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        
        // Top center of the heart
        const topCenterX = x + size / 2;
        const topCenterY = y + size * 0.25;
        
        ctx.moveTo(topCenterX, topCenterY);
        
        // Left lobe and curve down to bottom center
        ctx.bezierCurveTo(x + size * 0.15, y, x, y + size * 0.15, x, y + size * 0.45);
        ctx.bezierCurveTo(x, y + size * 0.7, x + size * 0.25, y + size * 0.85, topCenterX, y + size);
        
        // Right lobe and curve back up to top center
        ctx.bezierCurveTo(x + size * 0.75, y + size * 0.85, x + size, y + size * 0.7, x + size, y + size * 0.45);
        ctx.bezierCurveTo(x + size, y + size * 0.15, x + size * 0.85, y, topCenterX, topCenterY);
        
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /**
     * Helper to draw a speaker indicator (speaker with volume waves or crossed lines)
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {number} x - Left coordinate of the icon area
     * @param {number} y - Top coordinate of the icon area
     * @param {boolean} isMuted - Audio state
     */
    drawSpeakerIcon(ctx, x, y, isMuted) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 2.5;

        // Draw speaker cone base
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + 8, y + 10);
        ctx.lineTo(x + 15, y + 3);
        ctx.lineTo(x + 15, y + 27);
        ctx.lineTo(x + 8, y + 20);
        ctx.lineTo(x, y + 20);
        ctx.closePath();
        ctx.fill();

        if (isMuted) {
            // Draw crossed red line (muted indicator)
            ctx.strokeStyle = '#ff4757';
            ctx.beginPath();
            ctx.moveTo(x + 20, y + 8);
            ctx.lineTo(x + 28, y + 22);
            ctx.moveTo(x + 28, y + 8);
            ctx.lineTo(x + 20, y + 22);
            ctx.stroke();
        } else {
            // Draw acoustic waves (unmuted indicator)
            ctx.beginPath();
            ctx.arc(x + 12, y + 15, 8, -Math.PI / 3, Math.PI / 3, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + 12, y + 15, 14, -Math.PI / 3, Math.PI / 3, false);
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Draws puffy background clouds on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {Array} clouds - Collection of background cloud parameters
     */
    drawClouds(ctx, clouds) {
        ctx.save();
        // Subtle semi-transparent cloud white for premium background blending
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';

        for (let i = 0; i < clouds.length; i++) {
            const cloud = clouds[i];
            ctx.save();
            ctx.translate(cloud.x, cloud.y);
            ctx.scale(cloud.scale, cloud.scale);

            // Draw vector puffy cloud path
            ctx.beginPath();
            ctx.arc(30, 20, 20, Math.PI * 0.5, Math.PI * 1.5);
            ctx.arc(55, 10, 25, Math.PI * 1.0, Math.PI * 1.85);
            ctx.arc(85, 15, 22, Math.PI * 1.3, Math.PI * 2.0);
            ctx.arc(105, 25, 18, Math.PI * 1.7, Math.PI * 0.5);
            ctx.lineTo(30, 40);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
        ctx.restore();
    }

    /**
     * Renders the Main Menu screen (STATE: MENU)
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {boolean} isMuted - Audio state
     */
    drawMenu(ctx, isMuted = false) {
        ctx.save();

        // 1. Draw Title
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '800 64px Outfit, sans-serif';
        // Add smooth text drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fillText('CUSTOM FLAPPY BIRD', 480, 160);
        ctx.shadowColor = 'transparent'; // Reset shadow

        // 2. Draw Start Game Button
        // Bounding box: X: 360 to 600 (width 240), Y: 252.5 to 307.5 (height 55)
        this.drawRoundedRect(ctx, 360, 252.5, 240, 55, 10, 'rgba(46, 204, 113, 0.95)', '#27ae60', 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 20px Outfit, sans-serif';
        ctx.fillText('START GAME', 480, 280);

        // 3. Draw Mute Button (Top Right)
        // Bounding box: X: 880 to 940 (width 60), Y: 20 to 60 (height 40)
        this.drawRoundedRect(ctx, 880, 20, 60, 40, 8, 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.2)', 1.5);
        this.drawSpeakerIcon(ctx, 895, 25, isMuted);

        // 4. Draw Controls Guidance / Instructions
        ctx.fillStyle = '#a0a2ad';
        ctx.font = '400 16px Outfit, sans-serif';
        ctx.fillText('Kontrol: Spacebar / Mouse untuk Terbang', 480, 390);
        ctx.font = '400 14px Outfit, sans-serif';
        ctx.fillStyle = '#717585';
        ctx.fillText('[Tahan klik/spacebar untuk melayang ke atas secara kontinu]', 480, 420);
        ctx.fillText('Tekan tombol [ P ] saat bermain untuk Pause', 480, 448);

        ctx.restore();
    }

    /**
     * Renders the Heads-Up Display screen (STATE: PLAYING HUD)
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {number} score - Current distance score in meters
     * @param {number} hp - Remaining player lives (HP)
     * @param {boolean} isMuted - Audio state
     */
    drawHUD(ctx, score, hp, isMuted = false) {
        ctx.save();

        // 1. Draw Score (Distance) in the middle top
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '800 36px Outfit, sans-serif';
        ctx.fillText(`${Math.floor(score)} M`, 480, 30);

        // 2. Draw HP (Hearts) in top left
        // Draw 3 heart slots. Red for active lives, transparent gray for lost ones.
        const maxHp = 3;
        for (let i = 0; i < maxHp; i++) {
            const x = 30 + i * 35;
            const y = 30;
            const size = 22;
            if (i < hp) {
                // Active life
                this.drawHeart(ctx, x, y, size, '#ff4757');
            } else {
                // Lost life slot silhouette
                this.drawHeart(ctx, x, y, size, 'rgba(255, 255, 255, 0.15)');
            }
        }

        // 3. Draw Mute Indicator in top right
        // Bounding box: X: 880 to 940 (width 60), Y: 20 to 60 (height 40)
        this.drawRoundedRect(ctx, 880, 20, 60, 40, 8, 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.2)', 1.5);
        this.drawSpeakerIcon(ctx, 895, 25, isMuted);

        ctx.restore();
    }

    /**
     * Renders the Pause screen overlay (STATE: PAUSED)
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     */
    drawPause(ctx) {
        ctx.save();

        // 1. Semi-transparent black overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, 960, 540);

        // 2. Pause Content
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '800 56px Outfit, sans-serif';
        ctx.fillText('PAUSED', 480, 240);

        ctx.fillStyle = '#a0a2ad';
        ctx.font = '400 20px Outfit, sans-serif';
        ctx.fillText('Tekan tombol [ P ] untuk Melanjutkan', 480, 300);

        ctx.restore();
    }

    /**
     * Renders the Game Over screen (STATE: GAMEOVER)
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {number} finalScore - Final session score
     * @param {number} highScore - Highest session score
     */
    drawGameOver(ctx, finalScore, highScore) {
        ctx.save();

        // 1. Dark background overlay
        ctx.fillStyle = 'rgba(11, 11, 15, 0.88)';
        ctx.fillRect(0, 0, 960, 540);

        // 2. Render Title in vibrant red
        ctx.fillStyle = '#ff4757';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '800 64px Outfit, sans-serif';
        ctx.fillText('GAME OVER', 480, 150);

        // 3. Score summary details
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 24px Outfit, sans-serif';
        ctx.fillText(`Skor Akhir: ${Math.floor(finalScore)} M`, 480, 222);

        ctx.fillStyle = '#a0a2ad';
        ctx.font = '600 20px Outfit, sans-serif';
        ctx.fillText(`Skor Tertinggi: ${Math.floor(highScore)} M`, 480, 260);

        // 4. Draw Restart Game Button
        // Bounding box: X: 360 to 600 (width 240), Y: 332.5 to 387.5 (height 55)
        this.drawRoundedRect(ctx, 360, 332.5, 240, 55, 10, 'rgba(255, 71, 87, 0.95)', '#ff6b81', 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 20px Outfit, sans-serif';
        ctx.fillText('RESTART GAME', 480, 360);

        // 5. Quick action keyboard tips
        ctx.fillStyle = '#57606f';
        ctx.font = '400 14px Outfit, sans-serif';
        ctx.fillText('Atau tekan [ Spacebar ] untuk Restart', 480, 440);

        ctx.restore();
    }
}
