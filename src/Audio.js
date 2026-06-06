export class Audio {
    constructor() {
        // Map audio files using standard HTML5 Audio constructor via window.Audio
        // to prevent naming conflicts with our custom Audio class name.
        this.sounds = {
            flap: new window.Audio('https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/wing.wav'),
            hit: new window.Audio('https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/hit.wav'),
            score: new window.Audio('https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/point.wav'),
            bgm: new window.Audio('https://raw.githubusercontent.com/s1m0n21/flappy-bird/master/assets/audio/music.mp3')
        };

        // BGM settings: loop and slightly quieter background volume
        this.sounds.bgm.loop = true;
        this.sounds.bgm.volume = 0.35;

        // Global mute status
        this.isMuted = false;
        
        // Browser AudioContext mapping for autoplay compliance
        this.audioContext = null;
    }

    /**
     * Resumes or initializes the browser AudioContext to legally grant sound access
     * on first user input gesture.
     */
    resumeContext() {
        if (!this.audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
        }

        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        console.log("Audio Context initialized/resumed.");
    }

    /**
     * Plays the background music if not muted
     */
    playBGM() {
        if (this.isMuted) return;

        this.sounds.bgm.play().catch(err => {
            console.warn("BGM autoplay delayed until user interacts with the page.", err);
        });
    }

    /**
     * Pauses the BGM and resets timeline
     */
    stopBGM() {
        this.sounds.bgm.pause();
        this.sounds.bgm.currentTime = 0;
    }

    /**
     * Plays a short sound effect
     * @param {string} soundName - Name of key in sounds collection ('flap', 'hit', 'score')
     */
    playSFX(soundName) {
        if (this.isMuted) return;

        const sound = this.sounds[soundName];
        if (sound) {
            // Reset timeline to support quick rapid playbacks
            sound.currentTime = 0;
            sound.play().catch(err => {
                console.warn(`SFX ${soundName} play prevented:`, err);
            });
        }
    }

    /**
     * Toggles global mute state and pauses/plays current BGM
     */
    toggleMute() {
        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            // Pause any running background music
            this.sounds.bgm.pause();
        } else {
            // Play/resume music if unmuted
            this.playBGM();
        }
        
        console.log(`Global mute state changed. Muted: ${this.isMuted}`);
    }
}
