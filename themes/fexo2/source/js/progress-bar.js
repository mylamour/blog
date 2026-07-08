(function () {
  'use strict';

  if (!document.documentElement.classList.contains('page-post')) return;

  var bar = document.createElement('div');
  bar.id = 'readingProgress';
  document.body.appendChild(bar);

  var ticking = false;

  function update() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var ratio = max > 0 ? (window.pageYOffset || doc.scrollTop || 0) / max : 0;
    bar.style.width = (Math.min(ratio, 1) * 100).toFixed(2) + '%';
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}());
