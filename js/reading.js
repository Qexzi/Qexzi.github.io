/**
 * 阅读体验增强（仅文章页生效）：
 * 1. 顶部阅读进度条：随滚动显示当前文章阅读进度
 * 2. 标题悬停锚点：hover 显示 #，点击复制带锚点的文章链接
 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var content = document.querySelector('.mypage');
    if (!content) return;

    /* ---------- 顶部阅读进度条 ---------- */
    var bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.appendChild(bar);

    function updateBar() {
      var rect = content.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      bar.style.width = (total > 0 ? (passed / total) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    updateBar();

    /* ---------- 标题悬停锚点：点击复制本节链接 ---------- */
    var headings = content.querySelectorAll('h2[id], h3[id], h4[id], h5[id]');
    Array.prototype.forEach.call(headings, function (h) {
      if (h.querySelector('.heading-anchor')) return;
      var a = document.createElement('a');
      a.className = 'heading-anchor';
      a.href = '#' + h.id;
      a.setAttribute('aria-label', '复制本节链接');
      a.textContent = '#';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var url = location.origin + location.pathname + '#' + h.id;
        try { history.replaceState(null, null, '#' + h.id); } catch (err) {}
        var done = function () {
          a.textContent = '✓';
          setTimeout(function () { a.textContent = '#'; }, 1200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () {});
        }
      });
      h.appendChild(a);
    });
  });
})();
