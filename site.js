// The landing page's day ring: the day as a sun path, midnight at the foot and noon at the top,
// with a hand for the visitor's own now. Like Today's ring in the app, it sweeps once from
// midnight to now on arrival (not under Reduce Motion) and an entry fills as the arc passes it.
// Without this script the markup still draws the ring at 9:41.
(function () {
  "use strict";
  var ring = document.querySelector(".day-ring");
  if (!ring) return;

  var CENTRE = 200, RADIUS = 150, LENGTH = 2 * Math.PI * RADIUS;
  var arc = ring.querySelector(".arc");
  var hand = ring.querySelector(".hand");
  var label = ring.querySelector(".now");
  var entries = Array.prototype.slice.call(ring.querySelectorAll(".entry"));
  var format = new Intl.DateTimeFormat(document.documentElement.lang || undefined, { hour: "numeric", minute: "2-digit" });

  function hoursOf(date) { return date.getHours() + date.getMinutes() / 60; }

  function draw(hours) {
    var angle = (hours / 24) * 2 * Math.PI + Math.PI;
    arc.style.strokeDashoffset = (LENGTH * (1 - hours / 24)).toFixed(1);
    hand.setAttribute("cx", (CENTRE + RADIUS * Math.sin(angle)).toFixed(1));
    hand.setAttribute("cy", (CENTRE - RADIUS * Math.cos(angle)).toFixed(1));
    entries.forEach(function (entry) {
      entry.classList.toggle("past", Number(entry.getAttribute("data-hour")) <= hours);
    });
  }

  function now() {
    var date = new Date();
    label.textContent = format.format(date);
    draw(hoursOf(date));
  }

  arc.style.strokeDasharray = LENGTH.toFixed(1);
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) {
    now();
  } else {
    var target = hoursOf(new Date()), start = null, duration = 1600, done = false;
    var finish = function () { if (!done) { done = true; now(); } };
    label.textContent = format.format(new Date());
    draw(0);
    window.requestAnimationFrame(function step(time) {
      if (done) return;
      if (start === null) start = time;
      var t = Math.min(1, (time - start) / duration);
      draw(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) window.requestAnimationFrame(step); else finish();
    });
    // A frame that never comes (a hidden tab) must not leave the hand at midnight.
    window.setTimeout(finish, duration + 400);
  }
  window.setInterval(now, 30000);
})();
