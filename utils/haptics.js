/**
 * LAYER 2: HAPTIC FEEDBACK UTILITY
 * (Design Mode - Safe Touch Feature)
 * 
 * Triggers the phone's vibration motor for a premium native app feel.
 * SAFETY: If desktop (no vibration motor), the function checks for navigator.vibrate,
 * sees it's missing, and does nothing. No errors, no crashes.
 */

export const triggerHaptic = (pattern = 'light') => {
    // Only works on mobile browsers that support it
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        switch (pattern) {
            case 'light':
                navigator.vibrate(10); // 10ms tick
                break;
            case 'medium':
                navigator.vibrate(40); // Stronger bump
                break;
            case 'heavy':
                navigator.vibrate([50, 100, 50]); // Buzz-pause-buzz
                break;
        }
    }
    // If navigator.vibrate doesn't exist, this fails silently (safe)
};

// For use in plain HTML/JS without modules:
// Just copy the function body and use it directly in your <script> tags
