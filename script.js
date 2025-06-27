// Fade‑in observer
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    obs.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Countdown
function updateCountdown() {
  const now = Date.now();
  const target = new Date("2026-07-02T00:00:00").getTime();
  const diff = target - now;

  if (diff <= 0) return;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  document.getElementById('days').innerText = days;
  document.getElementById('hours').innerText = hours;
  document.getElementById('minutes').innerText = minutes;
  document.getElementById('seconds').innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Walker on SVG Path
window.addEventListener("DOMContentLoaded", () => {
  const path = document.getElementById("timelinePath");
  const walker = document.getElementById("walker");
  const svg = document.getElementById("timelineSVG");
  const timelineSection = svg.closest(".walker-section");
  const milestonePoints = document.querySelectorAll(".milestone-point");

  if (!path || !walker || !svg || !timelineSection) {
    console.error("Missing elements for timeline animation");
    return;
  }

  const pathLength = path.getTotalLength();

  // Position each milestone point on the path exactly at its progress
  milestonePoints.forEach(milestone => {
    const progress = parseFloat(milestone.dataset.progress);
    const point = path.getPointAtLength(progress * pathLength);

    // Position relative to SVG container
    const svgRect = svg.getBoundingClientRect();
    const ctm = path.getCTM();
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    const screenPoint = svgPoint.matrixTransform(ctm);

    // Offset so circle center matches path point
    milestone.style.left = `${screenPoint.x}px`;
    milestone.style.top = `${screenPoint.y}px`;
  });

  // Animation variables
  let currentMilestoneIndex = 0;
  let animating = false;
  let animationStart = null;
  const animationDuration = 1500; // ms per segment

  // Move walker to a point on the path by progress (0-1)
  function updateWalkerPosition(progress) {
    const point = path.getPointAtLength(progress * pathLength);
    const ctm = path.getCTM();
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    const screenPoint = svgPoint.matrixTransform(ctm);

    const walkerRect = walker.getBoundingClientRect();
    const offsetX = walkerRect.width / 2;
    const offsetY = walkerRect.height / 2;

    walker.style.left = `${screenPoint.x - offsetX}px`;
    walker.style.top = `${screenPoint.y - offsetY}px`;
  }

  // Activate milestone (highlight circle and show text)
  function activateMilestone(index) {
    milestonePoints.forEach((m, i) => {
      if (i < index) {
        // Passed milestones - show text, no glow
        m.classList.add("active");
        m.classList.remove("active-current");
      } else if (i === index) {
        // Current milestone - glow + show text
        m.classList.add("active", "active-current");
      } else {
        // Future milestones - no glow, no text
        m.classList.remove("active", "active-current");
      }
    });
  }
  
// Define animation speed in pixels per millisecond (adjust as needed)
const animationSpeed = 0.3; // 0.3 px/ms = 300px in 1 second

// Animate walker from current to next milestone with dynamic duration
function animateToNextMilestone(timestamp) {
  if (!animationStart) animationStart = timestamp;
  animating = true;

  const currentProgress = parseFloat(milestonePoints[currentMilestoneIndex].dataset.progress);
  const nextIndex = currentMilestoneIndex + 1;
  const nextProgress = nextIndex < milestonePoints.length
    ? parseFloat(milestonePoints[nextIndex].dataset.progress)
    : 1;

  // Calculate segment length on the path
  const segmentLength = Math.abs(nextProgress - currentProgress) * pathLength;

  // Calculate dynamic duration based on segment length and speed
  const animationDurationSegment = segmentLength / animationSpeed;

  const elapsed = timestamp - animationStart;
  let progress = elapsed / animationDurationSegment;
  if (progress > 1) progress = 1;

  // Calculate current position on path between current and next milestone
  const position = currentProgress + (nextProgress - currentProgress) * progress;

  // Update walker position on the SVG path
  updateWalkerPosition(position);

  if (progress < 1) {
    requestAnimationFrame(animateToNextMilestone);
  } else {
    // Reached next milestone
    currentMilestoneIndex++;
    activateMilestone(currentMilestoneIndex);
    animationStart = null;
    animating = false;

    if (currentMilestoneIndex < milestonePoints.length - 1) {
      // Pause 1 second at milestone before continuing
      setTimeout(() => {
        requestAnimationFrame(animateToNextMilestone);
      }, 1000);
    }
  }

}


  // Initialize walker and milestone states
  currentMilestoneIndex = 0;
  activateMilestone(currentMilestoneIndex);
  updateWalkerPosition(parseFloat(milestonePoints[0].dataset.progress));

  // Start animation when timeline section enters viewport
  function onScroll() {
    const rect = timelineSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.top < viewportHeight && !animating && currentMilestoneIndex < milestonePoints.length - 1) {
      requestAnimationFrame(animateToNextMilestone);
      window.removeEventListener("scroll", onScroll);
    }
  }

  window.addEventListener("scroll", onScroll);
  // In case already in view
  onScroll();
});


// Add click handler on milestone texts to show popup
milestonePoints.forEach((milestone, index) => {
  milestone.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent clicks bubbling up
    createPopup(milestone, milestoneDetails[index]);
  });
});

// Close popup when clicking anywhere else on the page
document.addEventListener('click', () => {
  const popup = document.querySelector('.popup');
  if (popup) popup.remove();
});
