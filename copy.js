// Wires any .copy-btn[data-target] to copy the innerText of #<data-target>.
(function () {
  function fallback(text, cb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (e) {}
    document.body.removeChild(ta);
  }
  function wire(btn) {
    var target = document.getElementById(btn.getAttribute("data-target"));
    if (!target) return;
    btn.addEventListener("click", function () {
      var text = target.innerText;
      var original = btn.textContent;
      var done = function () {
        btn.textContent = "コピーしました ✓";
        btn.classList.add("done");
        setTimeout(function () { btn.textContent = original; btn.classList.remove("done"); }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
  }
  document.querySelectorAll(".copy-btn[data-target]").forEach(wire);
})();
