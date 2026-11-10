document.addEventListener('DOMContentLoaded', function(){
  // 延迟执行，避免阻塞页面渲染
  setTimeout(function(){
    try{
    // Category tree toggle — collapsed by default, click title to expand
    var catStick = document.querySelector('.category-stick');
    if (catStick) {
      var catTitle = catStick.querySelector('.widget-title');
      if (catTitle) {
        catTitle.addEventListener('click', function() {
          catStick.classList.toggle('expanded');
        });
      }
    }

    var toc = document.querySelector('.toc-article');
    if(!toc) return;
    var tocBox = toc.closest('.toc');

    /* ---------- 全量显示多级标题，构建可折叠树 ---------- */
    // 有子级的条目插入折叠箭头；一级（h2）默认展开，更深层级默认收起
    var items = Array.prototype.slice.call(toc.querySelectorAll('li.toc-article-item'));
    items.forEach(function(li){
      var childOl = li.querySelector(':scope > ol.toc-article-child');
      var link = li.querySelector(':scope > a.toc-article-link');
      if(!childOl || !link) return;

      var m = /toc-article-level-(\d+)/.exec(li.className);
      var level = m ? parseInt(m[1], 10) : 1;
      if (level >= 2) li.classList.add('toc-collapsed');

      var btn = document.createElement('span');
      btn.className = 'toc-toggle';
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', '展开/收起');
      btn.textContent = '▸';
      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        li.classList.toggle('toc-collapsed');
      });
      link.appendChild(btn);
    });

    /* ---------- 全部展开/收起按钮 ---------- */
    if (tocBox) {
      var titleEl = tocBox.querySelector('.toc-title');
      if (titleEl) {
        var allBtn = document.createElement('span');
        allBtn.className = 'toc-toggle-all';
        allBtn.textContent = '展开全部';
        allBtn.addEventListener('click', function(){
          var anyCollapsed = toc.querySelectorAll('li.toc-article-item.toc-collapsed').length > 0;
          if (anyCollapsed) {
            toc.querySelectorAll('li.toc-article-item.toc-collapsed').forEach(function(li){
              li.classList.remove('toc-collapsed');
            });
            allBtn.textContent = '收起全部';
          } else {
            items.forEach(function(li){
              if (li.querySelector(':scope > ol.toc-article-child')) li.classList.add('toc-collapsed');
            });
            allBtn.textContent = '展开全部';
          }
        });
        titleEl.appendChild(allBtn);
      }
    }

    // Smooth scroll for TOC links with header offset to avoid navigation overlay
    var anchors = toc.querySelectorAll('a');
    // determine header offset: prefer header/.navbar if present
    var headerOffset = 80; // default fallback
    var headerCandidates = ['header', '.navbar', 'nav', '#top_meta'];
    for(var i=0;i<headerCandidates.length;i++){
      var el = document.querySelector(headerCandidates[i]);
      if(el && el.offsetHeight){ headerOffset = el.offsetHeight; break; }
    }

    anchors.forEach(function(a){
      a.addEventListener('click', function(e){
        var href = this.getAttribute('href');
        if(!href || href.indexOf('#') === -1) return;
        var id = href.split('#').pop();
        if(!id) return;
        var target = document.getElementById(decodeURIComponent(id));
        if(target){
          e.preventDefault();
          var rect = target.getBoundingClientRect();
          var absoluteTop = rect.top + window.pageYOffset;
          var scrollTo = Math.max(absoluteTop - headerOffset - 10, 0);
          window.scrollTo({ top: scrollTo, behavior: 'smooth' });
          try{ history.replaceState(null, null, '#'+id); }catch(e){}
        }
      });
    });

    // Active section highlight using IntersectionObserver（含 h4/h5，滚动时自动展开所在分支）
    var headingSelector = '.mypage h2[id], .mypage h3[id], .mypage h4[id], .mypage h5[id]';
    var headings = Array.prototype.slice.call(document.querySelectorAll(headingSelector));
    if(headings.length){
      var idToLink = {};
      anchors.forEach(function(a){
        var href = a.getAttribute('href');
        if(href && href.indexOf('#')!==-1){
          var id = decodeURIComponent(href.split('#').pop());
          idToLink[id] = a;
        }
      });

      // account for header offset when detecting active section
      var options = { root: null, rootMargin: '0px 0px -' + (headerOffset + 100) + 'px 0px', threshold: 0 };
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var id = entry.target.id;
          var link = idToLink[id];
          if(!link) return;
          if(entry.isIntersecting){
            // remove other active
            Object.keys(idToLink).forEach(function(k){
              var l = idToLink[k]; if(l) l.classList.remove('toc-active');
            });
            link.classList.add('toc-active');
            // 自动展开当前小节所在的各级分支
            var p = link.parentElement;
            while(p && p !== toc){
              if(p.classList && p.classList.contains('toc-article-item')) p.classList.remove('toc-collapsed');
              p = p.parentElement;
            }
            // ensure active link is visible inside TOC scroll container
            try{
              // find nearest scrollable ancestor (the .toc element)
              var scrollParent = link.closest('.toc');
              if(scrollParent && scrollParent !== document.body && scrollParent !== document.documentElement){
                // compute offset to center the link in the scroll container
                var parentRect = scrollParent.getBoundingClientRect();
                var linkRect = link.getBoundingClientRect();
                var offset = (linkRect.top - parentRect.top) - (parentRect.height/2) + (linkRect.height/2);
                scrollParent.scrollBy({ top: offset, behavior: 'smooth' });
              } else {
                // Do not scroll the main document to avoid jumping behavior
              }
            }catch(e){}
          }
        });
      }, options);

      headings.forEach(function(h){ observer.observe(h); });
    }
  }catch(e){ console && console.error && console.error('toc.js error', e); }
  });
});
