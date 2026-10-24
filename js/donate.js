// Builds the "Support this project" section from js/config.js.
(function () {
  var c = window.DONATE || {}, el = document.getElementById('donate');
  if (!el || (!c.githubUser && !c.pixKey)) { if (el) el.hidden = true; return; }

  var h = '<p class="dtxt"><b>Enjoying Fretboard Companion?</b> <span class="hint">It is free and has no ads. If it helps your practice, you can support it.</span></p><div class="row">';
  if (c.githubUser) h += '<a class="btn go" target="_blank" rel="noopener" href="https://github.com/sponsors/' +
    encodeURIComponent(c.githubUser) + '">♥ Sponsor on GitHub</a>';
  if (c.pixKey) h += '<button id="pixBtn" aria-expanded="false" aria-controls="pixBox">Donate with Pix</button>';
  h += '</div>';
  if (c.pixKey) h += '<div class="pixbox" id="pixBox" hidden><img id="pixQr" src="img/qr-pix.png" alt="Pix QR code" width="180" height="180">' +
    '<div><p id="pixWho"></p><code id="pixKey"></code><button id="pixCopy">Copy Pix key</button> <span id="pixMsg" role="status"></span></div></div>';
  el.innerHTML = h;

  if (!c.pixKey) return;
  document.getElementById('pixKey').textContent = c.pixKey;
  document.getElementById('pixWho').textContent = c.pixName ? 'Pix key for ' + c.pixName + ':' : 'Pix key:';
  document.getElementById('pixQr').addEventListener('error', function () { this.hidden = true; }); // QR is optional

  document.getElementById('pixBtn').addEventListener('click', function () {
    var box = document.getElementById('pixBox'), open = box.hidden;
    box.hidden = !open;
    this.setAttribute('aria-expanded', open);
  });

  function copy(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    return new Promise(function (ok, fail) {          // fallback for older browsers / file://
      var a = document.createElement('textarea');
      a.value = t; a.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(a); a.select();
      try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); }
      a.remove();
    });
  }
  document.getElementById('pixCopy').addEventListener('click', function () {
    var msg = document.getElementById('pixMsg');
    copy(c.pixKey).then(function () { msg.textContent = 'Copied! Paste it in your bank app.'; },
                        function () { msg.textContent = 'Could not copy. Select the key and copy it manually.'; });
  });
})();
