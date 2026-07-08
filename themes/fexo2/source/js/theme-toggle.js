(function () {
  'use strict';

  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');

  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  if (window.matchMedia) {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      var saved = null;
      try { saved = localStorage.getItem('theme'); } catch (err) {}
      if (saved !== 'light' && saved !== 'dark') {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }
}());
