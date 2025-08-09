// Fade-in observer
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    obs.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Countdown
function updateCountdown() {
  const now = Date.now();
  const target = new Date("2026-07-02T00:00:00").getTime();
  const diff = target - now;

  if (diff <= 0) {
    // If you want a message or action when time hits zero, change here.
    document.getElementById('days').innerText = 0;
    document.getElementById('hours').innerText = 0;
    document.getElementById('minutes').innerText = 0;
    document.getElementById('seconds').innerText = 0;
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  document.getElementById('days').innerText = days;
  document.getElementById('hours').innerText = hours;
  document.getElementById('minutes').innerText = minutes;
  document.getElementById('seconds').innerText = seconds;
}

updateCountdown();
setInterval(updateCountdown, 1000);
