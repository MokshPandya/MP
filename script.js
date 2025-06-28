// Fade-in observer
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    obs.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Countdown logic
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

// SVG Path Walker Animation
window.addEventListener("DOMContentLoaded", () => {
  const path = document.getElementById("timelinePath");
  const walker = document.getElementById("walker");
  const svg = document.getElementById("timelineSVG");
  const timelineSection = svg.closest(".walker-section");
  const milestonePoints = document.querySelectorAll(".milestone-point");

  if (!path || !walker || !svg || !timelineSection) return;

  const pathLength = path.getTotalLength();

  // Position milestones
  milestonePoints.forEach(milestone => {
    const progress = parseFloat(milestone.dataset.progress);
    const point = path.getPointAtLength(progress * pathLength);
    const ctm = path.getCTM();
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    const screenPoint = svgPoint.matrixTransform(ctm);
    milestone.style.left = `${screenPoint.x}px`;
    milestone.style.top = `${screenPoint.y}px`;
  });

  // Walker movement
  let currentMilestoneIndex = 0;
  let animating = false;
  let animationStart = null;
  const animationSpeed = 0.3;

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

  function activateMilestone(index) {
    milestonePoints.forEach((m, i) => {
      m.classList.toggle("active", i <= index);
    });
  }

  function animateToNextMilestone(timestamp) {
    if (!animationStart) animationStart = timestamp;
    animating = true;

    const currentProgress = parseFloat(milestonePoints[currentMilestoneIndex].dataset.progress);
    const nextIndex = currentMilestoneIndex + 1;
    const nextProgress = nextIndex < milestonePoints.length
      ? parseFloat(milestonePoints[nextIndex].dataset.progress)
      : 1;

    const segmentLength = Math.abs(nextProgress - currentProgress) * pathLength;
    const animationDurationSegment = segmentLength / animationSpeed;
    const elapsed = timestamp - animationStart;
    let progress = elapsed / animationDurationSegment;
    if (progress > 1) progress = 1;

    const position = currentProgress + (nextProgress - currentProgress) * progress;
    updateWalkerPosition(position);

    if (progress < 1) {
      requestAnimationFrame(animateToNextMilestone);
    } else {
      currentMilestoneIndex++;
      activateMilestone(currentMilestoneIndex);
      animationStart = null;
      animating = false;

      if (currentMilestoneIndex < milestonePoints.length - 1) {
        setTimeout(() => {
          requestAnimationFrame(animateToNextMilestone);
        }, 1000);
      }
    }
  }

  // Init
  currentMilestoneIndex = 0;
  activateMilestone(currentMilestoneIndex);
  updateWalkerPosition(parseFloat(milestonePoints[0].dataset.progress));

  function onScroll() {
    const rect = timelineSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (rect.top < viewportHeight && !animating && currentMilestoneIndex < milestonePoints.length - 1) {
      requestAnimationFrame(animateToNextMilestone);
      window.removeEventListener("scroll", onScroll);
    }
  }

  window.addEventListener("scroll", onScroll);
  onScroll();
});