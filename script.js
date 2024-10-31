document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const durationInput = document.getElementById('duration');
    const cooldownInput = document.getElementById('cooldown');
    const timerDisplay = document.getElementById('timer');
    const arrowContainer = document.getElementById('arrowContainer');
    const muteBtn = document.getElementById('muteBtn');

    let sessionDuration = 60; // default seconds
    let cooldownDuration = 3; // default cooldown seconds
    let remainingTime = 0;
    let timerInterval;
    let arrowTimeout;
    let cooldown = false;
    let countdownInterval;
    let countdownNumber = 3;
    let isMuted = false;

    // Including diagonal directions
    const directions = ['↑', '↓', '←', '→', '↖', '↗', '↙', '↘']; // Up, Down, Left, Right, Diagonals

    // Web Audio API setup
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playBeep(frequency = 440, duration = 200) {
        if (isMuted) return;

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency; // frequency in Hz

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration / 1000);

        // Optional: Fade out to prevent clicks
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
    }

    // Start Training Button Event Listener
    startBtn.addEventListener('click', startTraining);

    // Mute Button Event Listener
    muteBtn.addEventListener('click', toggleMute);

    function startTraining() {
        // Reset any existing timers
        clearInterval(timerInterval);
        clearTimeout(arrowTimeout);
        clearInterval(countdownInterval);
        countdownNumber = 3;

        remainingTime = parseInt(durationInput.value, 10);
        cooldownDuration = parseInt(cooldownInput.value, 10);

        if (isNaN(remainingTime) || remainingTime < 10) {
            alert('Please enter a valid session duration (minimum 10 seconds).');
            return;
        }

        if (isNaN(cooldownDuration) || cooldownDuration < 1) {
            alert('Please enter a valid cooldown duration (minimum 1 second).');
            return;
        }

        timerDisplay.textContent = countdownNumber;
        startBtn.disabled = true;
        durationInput.disabled = true;
        cooldownInput.disabled = true;

        playBeep(1000, 500); // Beep for countdown start

        // Start Countdown
        countdownInterval = setInterval(() => {
            countdownNumber--;
            if (countdownNumber > 0) {
                timerDisplay.textContent = countdownNumber;
                playBeep(800, 300); // Beep during countdown
            } else if (countdownNumber === 0) {
                clearInterval(countdownInterval);
                timerDisplay.textContent = 'GO!';
                playBeep(1200, 500); // Beep when GO!
                // Start the main training after a short delay to show "GO!"
                setTimeout(() => {
                    timerDisplay.textContent = formatTime(remainingTime);
                    startMainTraining();
                }, 500);
            }
        }, 1000);
    }

    function startMainTraining() {
        // Start the countdown timer
        timerInterval = setInterval(() => {
            remainingTime--;
            timerDisplay.textContent = formatTime(remainingTime);
            if (remainingTime <= 0) {
                endTraining();
            }
        }, 1000);

        triggerArrow();
    }

    function endTraining() {
        clearInterval(timerInterval);
        clearTimeout(arrowTimeout);
        clearInterval(countdownInterval);
        timerDisplay.textContent = "00:00";
        arrowContainer.innerHTML = '';
        playBeep(600, 500); // Beep when training ends
        // Re-enable controls
        startBtn.disabled = false;
        durationInput.disabled = false;
        cooldownInput.disabled = false;
        alert('Training session completed!');
    }

    function triggerArrow() {
        if (remainingTime <= 0) return;

        // Random delay between 0 to 2 seconds (0 to 2000 milliseconds)
        const delay = getRandomInt(0, 2000);

        arrowTimeout = setTimeout(() => {
            if (cooldown) return;
            showArrow();
            cooldown = true;

            // Play beep when arrow appears
            playBeep(900, 300);

            // Arrow is shown for a longer duration (e.g., 2 seconds)
            const arrowDisplayDuration = 2000; // 2 seconds
            setTimeout(() => {
                hideArrow();
                // Start cooldown period
                setTimeout(() => {
                    cooldown = false;
                    triggerArrow(); // Schedule next arrow after cooldown
                }, cooldownDuration * 1000);
            }, arrowDisplayDuration);

        }, delay);
    }

    function showArrow() {
        const arrow = document.createElement('div');
        arrow.classList.add('arrow', 'show');
        arrow.textContent = getRandomDirection();
        arrowContainer.innerHTML = '';
        arrowContainer.appendChild(arrow);
    }

    function hideArrow() {
        const arrow = arrowContainer.querySelector('.arrow');
        if (arrow) {
            arrow.classList.remove('show');
            setTimeout(() => {
                arrowContainer.innerHTML = '';
            }, 500); // match CSS transition
        }
    }

    function getRandomDirection() {
        const index = getRandomInt(0, directions.length - 1);
        return directions[index];
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function formatTime(seconds) {
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    }

    function toggleMute() {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        muteBtn.setAttribute('aria-label', isMuted ? 'Unmute Beeps' : 'Mute Beeps');
    }
});
