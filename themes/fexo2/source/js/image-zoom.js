(function () {
  'use strict';

  var overlay = null;

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  function close() {
    if (!overlay) return;
    var el = overlay;
    overlay = null;
    el.classList.remove('show');
    document.removeEventListener('keydown', onKey);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 250);
  }

  function open(img) {
    overlay = document.createElement('div');
    overlay.className = 'image-zoom-overlay';

    var big = document.createElement('img');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || '';
    overlay.appendChild(big);

    overlay.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, { passive: true, once: true });

    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      if (overlay) overlay.classList.add('show');
    });
  }

  document.addEventListener('click', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    if (!img.closest('.article-content')) return;
    if (img.closest('a')) return;
    if (overlay) return;
    open(img);
  });
}());
