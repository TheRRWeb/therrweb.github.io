/* banner.js (updated)
   - header top = 75px
   - side wrappers fixed overlay, width 60px
   - robust event delegation for close buttons
   - side slots stacked inside wrappers (not document absolute)
*/

(function () {
  // CONFIG
  const minSlotHeight = 405; // minimum gap for a new slot (includes margins)
  const slotHeight = 400;    // visual ad height (px) for each side ad box
  const slotMargin = 10;     // vertical space between slots (5 top + 5 bottom)
  const sideWidth = 60;      // requested width for side ads
  const headerAdReplaceDelay = 10000; // 10s

  // AD SOURCES (edit these HTML snippets as needed)
  const headerAds = [
    `<div style="width:100%;height:100%;position:relative;">
       <a href="https://example.com" target="_blank" rel="noopener" style="display:block;width:100%;height:100%;">
         <img src="/ads/header-ad1.jpg" alt="Header Ad" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">
       </a>
       <button class="ad-close" aria-label="Close ad">✕</button>
     </div>`,
    `<div style="width:100%;height:100%;position:relative;padding:8px;">
       <div style="display:flex;align-items:center;gap:8px;">
         <img src="/ads/header-ad2.jpg" alt="" style="height:64px;object-fit:cover;border-radius:6px;">
         <div style="flex:1;">
           <div style="font-weight:700;color:#111">Sponsor</div>
           <div style="font-size:13px;color:#333">Special offer — limited time</div>
         </div>
       </div>
       <button class="ad-close" aria-label="Close ad">✕</button>
     </div>`
  ];

  const sideAds = [
    `<div style="display:flex;flex-direction:column;gap:6px;align-items:center">
       <a href="https://example.com" target="_blank" rel="noopener"><img src="/ads/side1.jpg" alt="Side Ad"></a>
       <div style="font-size:12px;text-align:center;">Sponsor</div>
       <button class="side-close" aria-label="Close side ad" style="border:none;background:#eee;padding:4px;border-radius:4px;cursor:pointer">✕</button>
     </div>`,
    `<div style="display:flex;flex-direction:column;gap:6px;align-items:center">
       <a href="https://example.org" target="_blank" rel="noopener"><img src="/ads/side2.jpg" alt="Side Ad"></a>
       <div style="font-size:12px;text-align:center;">App Promo</div>
       <button class="side-close" aria-label="Close side ad" style="border:none;background:#eee;padding:4px;border-radius:4px;cursor:pointer">✕</button>
     </div>`
  ];

  // helpers
  function randPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // DOM refs
  const headerBanners = document.getElementById('header-banners');
  const headerAdEl = document.getElementById('header-ad');
  const headerAdHr = document.getElementById('header-ad-hr');
  const infoBanner = document.getElementById('info-banner');
  const leftWrapper = document.getElementById('left-ads-wrapper');
  const rightWrapper = document.getElementById('right-ads-wrapper');
  const headerEl = document.querySelector('header');
  const footerEl = document.querySelector('footer');

  if (!headerBanners) {
    console.warn('banner.js: #header-banners missing');
    return;
  }

  // ensure wrappers exist
  if (!leftWrapper || !rightWrapper) {
    console.warn('banner.js: side wrappers missing (#left-ads-wrapper / #right-ads-wrapper)');
  }

  // position header banners (fixed under header). Use 75px as requested.
  function positionHeaderBanners() {
    const topPx = 75;
    headerBanners.style.top = `${topPx}px`;
    headerBanners.style.left = '0';
    headerBanners.style.right = '0';
  }

  // INFO banner close: use delegation (reliable)
  (function wireInfoClose() {
    if (!infoBanner) return;
    document.addEventListener('click', (e) => {
      if (e.target && e.target.closest && e.target.closest('#info-banner .banner-close')) {
        infoBanner.style.display = 'none';
      }
    });
  })();

  // HEADER AD logic
  let headerAdTimeout = null;
  function clearHeaderTimeout() { if (headerAdTimeout) { clearTimeout(headerAdTimeout); headerAdTimeout = null; } }

  function renderHeaderAd(html) {
    if (!headerAdEl) return;
    headerAdEl.innerHTML = html || '';
    headerAdEl.style.display = html ? 'flex' : 'none';
    headerAdHr.style.display = (html && infoBanner && infoBanner.style.display !== 'none') ? 'block' : 'none';

    // delegate close clicks inside headerAdEl
    headerAdEl.addEventListener('click', function onHeaderAdClick(e) {
      const closeBtn = e.target.closest && e.target.closest('.ad-close');
      if (closeBtn) {
        // hide current ad
        headerAdEl.innerHTML = '';
        headerAdEl.style.display = 'none';
        headerAdHr.style.display = (infoBanner && infoBanner.style.display !== 'none') ? 'block' : 'none';
        // schedule replace
        clearHeaderTimeout();
        headerAdTimeout = setTimeout(() => {
          renderHeaderAd(randPick(headerAds));
        }, headerAdReplaceDelay);
      }
    }, { once:true });
  }

  function initHeaderAd() {
    if (!headerAdEl) return;
    if (!headerAds || headerAds.length === 0) {
      headerAdEl.style.display = 'none';
      headerAdHr.style.display = 'none';
      return;
    }
    renderHeaderAd(randPick(headerAds));
    positionHeaderBanners();
  }

  // SIDE ADS: fixed wrappers; create stacked slots inside wrapper (flow layout)
  function clearSideSlots() {
    if (leftWrapper) leftWrapper.innerHTML = '';
    if (rightWrapper) rightWrapper.innerHTML = '';
  }

  function computeAvailableHeight(wrapper) {
    // wrapper clientHeight is the available vertical space for stacking (top..bottom)
    return wrapper ? wrapper.clientHeight : 0;
  }

  function populateSideForWrapper(wrapper, side) {
    if (!wrapper) return;

    // remove existing but keep placeholders where previously closed: we store closed indices in dataset
    // For simplicity preserve closed by reading a data attribute list if present; otherwise rebuild
    // We'll not persist closed across page reloads (but they wanted placeholder to remain until user clears; that can be implemented with storage)
    wrapper.innerHTML = ''; // fresh

    const available = computeAvailableHeight(wrapper);
    if (available < minSlotHeight) return;

    // compute number of slots fitting: each uses slotHeight + slotMargin (top+bottom 5)
    const per = slotHeight + (slotMargin);
    const maxSlots = Math.floor((available + 5) / per); // +5 fudge
    if (maxSlots <= 0) return;

    for (let i=0;i<maxSlots;i++) {
      const slot = document.createElement('div');
      slot.className = 'side-ad-slot';
      slot.style.height = slotHeight + 'px';
      slot.style.width = sideWidth + 'px';
      slot.dataset.index = String(i);

      // populate ad content from pool
      const adHtml = randPick(sideAds);
      slot.innerHTML = adHtml;

      // wire close button with delegation on wrapper level
      wrapper.appendChild(slot);
    }
  }

  // wire side close using event delegation
  function wireSideClose() {
    document.addEventListener('click', (e) => {
      const sc = e.target.closest && e.target.closest('.side-close');
      if (sc) {
        const slot = sc.closest && sc.closest('.side-ad-slot');
        if (!slot) return;
        // turn into placeholder (keep size)
        slot.innerHTML = '';
        slot.classList.add('side-ad-placeholder');
        slot.dataset.closed = '1';
        return;
      }
      // also allow clicks on header ad close via '.ad-close' (safety)
      const ac = e.target.closest && e.target.closest('.ad-close');
      if (ac) {
        // find header ad slot parent and simulate close by clearing header ad
        if (headerAdEl) {
          headerAdEl.innerHTML = '';
          headerAdEl.style.display = 'none';
          headerAdHr.style.display = (infoBanner && infoBanner.style.display !== 'none') ? 'block' : 'none';
          clearHeaderTimeout();
          headerAdTimeout = setTimeout(() => renderHeaderAd(randPick(headerAds)), headerAdReplaceDelay);
        }
      }
    });
  }

  function populateAllSideAds() {
    if (!leftWrapper || !rightWrapper) return;

    // ensure wrappers are sized and positioned
    const topPx = 75; // as requested
    leftWrapper.style.top = topPx + 'px';
    leftWrapper.style.bottom = '10px';
    leftWrapper.style.position = 'fixed';
    leftWrapper.style.left = '8px';
    leftWrapper.style.width = sideWidth + 'px';
    leftWrapper.style.overflow = 'auto';
    leftWrapper.style.pointerEvents = 'auto';

    rightWrapper.style.top = topPx + 'px';
    rightWrapper.style.bottom = '10px';
    rightWrapper.style.position = 'fixed';
    rightWrapper.style.right = '8px';
    rightWrapper.style.width = sideWidth + 'px';
    rightWrapper.style.overflow = 'auto';
    rightWrapper.style.pointerEvents = 'auto';

    // clear & populate
    clearSideSlots();
    populateSideForWrapper(leftWrapper, 'left');
    populateSideForWrapper(rightWrapper, 'right');
  }

  // initialize all
  function init() {
    positionHeaderBanners();
    initHeaderAd();
    populateAllSideAds();
    wireSideClose();
  }

  // events
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    positionHeaderBanners();
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(populateAllSideAds, 250);
  });

  window.addEventListener('load', () => setTimeout(init, 80));
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 80));

  // expose manager
  window.BannerManager = {
    addHeaderAd: html => { headerAds.push(html); renderHeaderAd(randPick(headerAds)); },
    addSideAd: html => { sideAds.push(html); populateAllSideAds(); },
    rebuildSideAds: populateAllSideAds
  };

})();