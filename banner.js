/* banner.js — header-only version (no side banners)
   - header top = 75px
   - header ad replacement 10s after close
   - header ad & info banner reduced height (headerMinHeight/headerMaxHeight)
   - header/info have no margins between them
   - API: BannerManager.addHeaderAd/refreshHeaderAd
*/

(function () {
  // ---------------- CONFIG ----------------
  const headerAdReplaceDelay = 10000; // ms
  const headerMinHeight = 40;
  const headerMaxHeight = 110;

  // ---------------- AD POOL (edit these HTML snippets) ----------------
  // Replace with your actual ad HTML snippets (image, links, markup).
  const headerAds = [
    `<div style="display:none;width:100%;height:100%;position:relative;">
       <a href="https://example.com" target="_blank" rel="noopener" style="display:block;width:100%;height:100%;">
         <img src="/ads/header-ad1.jpg" alt="Header Ad" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">
       </a>
       <button class="ad-close" aria-label="Close ad" style="position:absolute;right:6px;top:6px;background:#ffffff88;border:none;padding:6px;border-radius:4px;cursor:pointer;">✕</button>
     </div>`
  ];

  // ---------------- util ----------------
  function randPick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function el(id){ return document.getElementById(id); }

  // ---------------- DOM refs ----------------
  const headerBanners = el('header-banners');
  const headerAdEl    = el('header-ad');
  const headerAdHr    = el('header-ad-hr');
  const infoBanner    = el('info-banner');

  if (!headerBanners) {
    console.warn('banner.js: #header-banners not found — header banners aborted.');
    return;
  }

  // ---------------- layout helpers ----------------
  function positionHeaderBanners(){
    headerBanners.style.position = 'fixed';
    headerBanners.style.top = '75px';
    headerBanners.style.left = '0';
    headerBanners.style.right = '0';
    headerBanners.style.zIndex = '9999';
    headerBanners.style.gap = '0';
  }

  // ---------------- header ad rendering ----------------
  let headerAdTimeout = null;
  function clearHeaderTimeout(){ if(headerAdTimeout){ clearTimeout(headerAdTimeout); headerAdTimeout = null; } }

  function renderHeaderAd(html){
    if(!headerAdEl) return;
    headerAdEl.innerHTML = html || '';
    headerAdEl.style.display = html ? 'flex' : 'none';
    headerAdEl.style.minHeight = headerMinHeight + 'px';
    headerAdEl.style.maxHeight = headerMaxHeight + 'px';
    headerAdEl.style.margin = '0';
    headerAdEl.style.padding = '0';
    headerAdEl.style.boxSizing = 'border-box';

    if(infoBanner){
      infoBanner.style.minHeight = headerMinHeight + 'px';
      infoBanner.style.maxHeight = headerMaxHeight + 'px';
      infoBanner.style.margin = '0';
      infoBanner.style.padding = '0 12px';
      infoBanner.style.display = infoBanner.style.display === 'none' ? 'none' : 'flex';
      infoBanner.style.alignItems = 'center';
      infoBanner.style.gap = '8px';
    }

    if(headerAdHr){
      headerAdHr.style.display = (html && infoBanner && infoBanner.style.display !== 'none') ? 'block' : 'none';
      headerAdHr.style.margin = '0';
      headerAdHr.style.borderTop = '1px solid rgba(0,0,0,0.06)';
    }
  }

  // ---------------- event delegation for close buttons ----------------
  document.addEventListener('click', function(e){
    // info close
    if (e.target.closest && e.target.closest('#info-banner .banner-close')){
      if(infoBanner) infoBanner.style.display = 'none';
      return;
    }

    // header ad close
    if (e.target.closest && e.target.closest('#header-ad .ad-close')){
      if(headerAdEl){
        headerAdEl.innerHTML = '';
        headerAdEl.style.display = 'none';
        if(headerAdHr) headerAdHr.style.display = (infoBanner && infoBanner.style.display !== 'none') ? 'block' : 'none';
        clearHeaderTimeout();
        headerAdTimeout = setTimeout(() => {
          renderHeaderAd(randPick(headerAds));
        }, headerAdReplaceDelay);
      }
      return;
    }
  });

  // ---------------- init ----------------
  function init(){
    try{
      positionHeaderBanners();
      if(headerAds && headerAds.length) renderHeaderAd(randPick(headerAds));
      else {
        if(headerAdEl) headerAdEl.style.display = 'none';
        if(headerAdHr) headerAdHr.style.display = 'none';
      }
    }catch(err){
      console.error('banner.js init error', err);
    }
  }

  window.addEventListener('load', () => setTimeout(init,60));
  document.addEventListener('DOMContentLoaded', () => setTimeout(init,60));

  // ---------------- API ----------------
  window.BannerManager = {
    addHeaderAd(html){ headerAds.push(html); },
    refreshHeaderAd(){ if(headerAds.length) renderHeaderAd(randPick(headerAds)); },
    clearHeaderTimeout
  };

})();