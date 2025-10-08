function startCountdown() {
    // Get event details
    const eventName = document.getElementById('event-name').value;
    const eventDate = document.getElementById('event-date').value;

    // Input validation
    if (!eventName || !eventDate) {
        alert('Please fill in both fields!');
        return;
    }

    // Hide form and show countdown
    document.querySelector('.form-container').style.display = 'none';
    document.getElementById('countdown-display').style.display = 'block';

    // Set event name display
    document.getElementById('event-name-display').innerText = `Countdown to ${eventName}`;

    const countDownDate = new Date(eventDate).getTime();

    // Update countdown every second
    const interval = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        if (distance < 0) {
            clearInterval(interval);
            document.getElementById('time-left').innerHTML = `<span class="label">Event Started!</span>`;
            document.querySelector('.reset-btn').style.display = 'block';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }, 1000);
}

function resetCountdown() {
    document.querySelector('.form-container').style.display = 'block';
    document.getElementById('countdown-display').style.display = 'none';
    document.querySelector('.reset-btn').style.display = 'none';
    document.getElementById('event-name').value = '';
    document.getElementById('event-date').value = '';
}
