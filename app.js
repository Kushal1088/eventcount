function startCountdown() {
    // Get the event name and event date
    const eventName = document.getElementById('event-name').value;
    const eventDate = document.getElementById('event-date').value;

    // Check if inputs are empty
    if (!eventName || !eventDate) {
        alert('Please fill in both fields!');
        return;
    }

    // Display event name on countdown section
    document.getElementById('event-name-display').innerText = eventName;

    // Convert event date to a Date object
    const countDownDate = new Date(eventDate).getTime();

    // Show the countdown section and hide the form
    document.getElementById('countdown-display').style.display = 'block';
    document.querySelector('.form').style.display = 'none';

    // Update the countdown every 1 second
    const interval = setInterval(function () {
        // Get the current time
        const now = new Date().getTime();
        
        // Calculate the remaining time
        const distance = countDownDate - now;
        
        // Time calculations for days, hours, minutes, and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;

        // If the countdown is finished
        if (distance < 0) {
            clearInterval(interval);
            document.getElementById('countdown-display').innerHTML = `<h2>The event has started!</h2>`;
        }
    }, 1000);
}
