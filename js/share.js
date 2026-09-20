(function () {
  var buttons = document.querySelectorAll('.share-copy');
  if (!buttons.length) return;
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-url') || window.location.href;
      navigator.clipboard.writeText(url).then(function () {
        btn.classList.add('is-copied');
        setTimeout(function () {
          btn.classList.remove('is-copied');
        }, 1500);
      });
    });
  });
})();
