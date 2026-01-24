/**
 * LAYER 3: SOUND EFFECTS UTILITY
 * (Design Mode - Safe Audio Feature)
 * 
 * Plays subtle UI sound effects for interactions.
 * SAFETY: Browsers sometimes block audio if the user hasn't clicked anything yet.
 * The .catch() prevents that error from stopping the rest of your app.
 */

// Play a sound effect
function playSound(soundFile = 'pop.mp3', volume = 0.2) {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = volume; // Keep it subtle!
    audio.play().catch(e => {
        // Browser blocked audio - fail silently
        console.log("Audio blocked by browser (safe to ignore)", e);
    });
}

// Pre-made shortcuts for common sounds
const Sound = {
    click: () => playSound('click.mp3', 0.2),
    pop: () => playSound('pop.mp3', 0.2),
    success: () => playSound('success.mp3', 0.3),
    error: () => playSound('error.mp3', 0.3),
};

// For use in plain HTML/JS without modules:
// Just copy the playSound function and use it directly in your <script> tags
