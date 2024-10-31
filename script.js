document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const durationInput = document.getElementById('duration');
    const cooldownInput = document.getElementById('cooldown');
    const timerDisplay = document.getElementById('timer');
    const arrowContainer = document.getElementById('arrowContainer');

    let sessionDuration = 60; // default seconds
    let cooldownDuration = 3; // default cooldown seconds
    let remainingTime = 0;
    let timerInterval;
    let arrowTimeout;
    let cooldown = false;
    let countdownInterval;
    let countdownNumber = 3;

    // Including diagonal directions
    const directions = ['↑', '↓', '←', '→', '↖', '↗', '↙', '↘']; // Up, Down, Left, Right, Diagonals

    startBtn.addEventListener('click', startTraining);

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

        // Start Countdown
        countdownInterval = setInterval(() => {
            countdownNumber--;
            if (countdownNumber > 0) {
                timerDisplay.textContent = countdownNumber;
            } else if (countdownNumber === 0) {
                clearInterval(countdownInterval);
                timerDisplay.textContent = 'GO!';
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
});
