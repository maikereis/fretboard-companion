// Light / Night switch. Loaded in <head> so the saved theme applies before the page paints.
// First visit follows the device setting; after a click, the choice is remembered.
(function () {
  var root = document.documentElement, KEY = 'fretboard-theme';
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function current() {
    var s = saved();
    return s === 'light' || s === 'night' ? s : (mq.matches ? 'night' : 'light');
  }
  function apply() {
    var t = current();
    root.setAttribute('data-theme', t === 'night' ? 'dark' : 'light');
    document.querySelectorAll('#theme button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.t === t);
    });
  }

  apply();
  document.addEventListener('DOMContentLoaded', function () {
    apply();
    document.getElementById('theme').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      try { localStorage.setItem(KEY, b.dataset.t); } catch (err) {}
      apply();
    });
  });
  if (mq.addEventListener) mq.addEventListener('change', apply);
})();
