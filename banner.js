/* banner.js
   Manages:
     - header info banner (close until refresh)
     - header ad (random from headerAds[], X -> re-pick after 10s)
     - left/right side ads (generate stacked slots between header bottom and footer top)
   Edit headerAds[] and sideAds[] arrays to supply HTML strings for ads.
*/
(function () {
  // CONFIG
  const minSlotHeight = 405; // minimum gap (including bottom margin) required to create a new slot
  const slotHeight = 400;    // visual ad height (px) for each side ad box (you can change)
  const slotMargin = 10;     // vertical gap between slots (top+bottom total = 10 -> 5 top + 5 bottom)
  const sideWidth = 180;     // width of side ad boxes (match CSS)
  const headerAdReplaceDelay = 10000; // 10s in ms for header ad replacement after close

  // AD SOURCES (edit these HTML snippets as needed)
  const headerAds = [
    // Example ad snippet (link + image + close)
    `<div class="header-ad-inner" style="width:100%;height:100%;position:relative;">
       <a href="https://example.com" target="_blank" rel="noopener" style="display:block;width:100%;height:100%;">
         <img src="/ads/header-ad1.jpg" alt="Header Ad" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">
       </a>
       <button class="ad-close" aria-label="Close ad">✕</button>
     </div>`,
    `<div class="header-ad-inner" style="width:100%;height:100%;position:relative;">
       <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
         <div style="flex:1">
           <h3 style="margin:0;color:#111">Sponsor Name</h3>
           <p style="margin:6px 0 0;color:#333">Get 50% off — limited time</p>
         </div>
         <img src="/ads/header-ad2.jpg" alt="" style="height:80px;object-fit:cover;border-radius:6px;">
       </div>
       <button class="ad-close" aria-label="Close ad">✕</button>
     </div>`
  ];

  const sideAds = [
    // Example side ad HTML (you'll replace with your customers)
    `<div style="display:flex;flex-direction:column;gap:8px;">
       <a href="https://example.com" target="_blank" rel="noopener"><img src="/ads/side1.jpg" alt="Side Ad"></a>
       <div style="font-weight:600;color:#222">Game Sponsor</div>
       <button class="side-close" style="background:#eee;border:none;padding:6px;border-radius:4px;cursor:pointer;">Close</button>
     </div>`,
    `<div style="display:flex;flex-direction:column;gap:8px;">
       <a href="https://example.org" target="_blank" rel="noopener"><img src="/ads/side2.jpg" alt="Side Ad"></a>
       <div style="font-weight:600;color:#222">App Promo</div>
       <button class="side-close" style="background:#eee;border:none;padding:6px;border-radius:4px;cursor:pointer;">Close</button>
     </div>`
  ];

  // utility
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
    console.warn('banner.js: #header-banners is missing from DOM');
    return;
  }

  // set headerBanners top just under the header/nav
  function positionHeaderBanners() {
    const headerRect = headerEl ? headerEl.getBoundingClientRect() : { bottom: 0 };
    // headerRect.bottom is viewport coordinate — convert to pixels from top of viewport:
    // we will position headerBanners fixed with top = headerRect.bottom px
    const topPx = Math.max(0, headerRect.bottom);
    headerBanners.style.top = `${topPx}px`;
    headerBanners.style.left = '0';
    headerBanners.style.right = '0';
  }

  // INFO banner close: hide until refresh
  (function wireInfoClose() {
    if (!infoBanner) return;
    const closeBtn = infoBanner.querySelector('.banner-close');
    if (!closeBtn) return;
    closeBtn.addEventListener('click', () => {
      infoBanner.style.display = 'none';
    });
  })();

  // HEADER AD logic
  let headerAdTimeout = null;

  function clearHeaderTimeout() {
    if (headerAdTimeout) { clearTimeout(headerAdTimeout); headerAdTimeout = null; }
  }

  function renderHeaderAd(html) {
    if (!headerAdEl) return;
    headerAdEl.innerHTML = html || '';
    headerAdEl.style.display = html ? 'flex' : 'none';
    headerAdHr.style.display = (html && infoBanner && infoBanner.style.display !== 'none') ? 'block' : 'none';

    // wire close button inside header ad (class .ad-close)
    const closeBtn = headerAdEl.querySelector('.ad-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        // hide current ad
        headerAdEl.innerHTML = '';
        headerAdEl.style.display = 'none';
        headerAdHr.style.display = (infoBanner && infoBanner.style.display !== 'none') ? 'block' : 'none';
        // after delay, pick a new random header ad and render
        clearHeaderTimeout();
        headerAdTimeout = setTimeout(() => {
          renderHeaderAd(randPick(headerAds));
        }, headerAdReplaceDelay);
      });
    }
  }

  function initHeaderAd() {
    if (!headerAdEl) return;
    if (!headerAds || headerAds.length === 0) {
      headerAdEl.style.display = 'none';
      headerAdHr.style.display = 'none';
      return;
    }
    // show random ad on load
    renderHeaderAd(randPick(headerAds));
    positionHeaderBanners();
  }

  // SIDE ADS logic
  // each side slot is represented by an element with data-slot-index.
  // We'll compute headerBottom and footerTop in document coords and create slots from headerBottom downward.
  function docY(el) {
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY;
  }

  function computeHeaderBottom() {
    if (!headerEl) return 0;
    return docY(headerEl) + headerEl.offsetHeight;
  }

  function computeFooterTop() {
    if (!footerEl) {
      // if no footer, approximate with document height
      return document.documentElement.scrollHeight;
    }
    return docY(footerEl);
  }

  // generate side ad slots for a given sideWrapper (left/right)
  function populateSideSlots(sideWrapper, side) {
    if (!sideWrapper) return;

    // clear existing slots (we'll recreate everything)
    // Note: keep existing placeholders/closed slots? requirement: if closed leave empty cell.
    // We'll reconstruct but preserve closed placeholders when possible by checking dataset.closed
    const existing = Array.from(sideWrapper.querySelectorAll('.side-ad-slot'));
    const preservedClosed = {}; // map top->closedFlag
    existing.forEach(el => {
      const closed = el.dataset.closed === '1';
      if (closed) {
        preservedClosed[el.dataset.top] = true;
      }
      el.remove();
    });

    const headerBottom = computeHeaderBottom();
    const footerTop = computeFooterTop();
    const availableHeight = footerTop - headerBottom;

    if (availableHeight < minSlotHeight) {
      // nothing to add
      return;
    }

    // compute how many slots we can create
    // Each slot consumes slotHeight + slotMargin spacing. We'll place them starting at headerBottom + 5px top margin.
    let cursor = headerBottom + 5; // starting top position (document coordinate)
    let slotIndex = 0;
    while ((cursor + slotHeight + 5) <= footerTop) {
      // create slot element
      const slot = document.createElement('div');
      slot.className = 'side-ad-slot';
      slot.style.top = `${cursor}px`;
      slot.style.width = `${sideWidth}px`;
      slot.style.height = `${slotHeight}px`;
      slot.style.left = side === 'left' ? '8px' : 'unset';
      slot.style.right = side === 'right' ? '8px' : 'unset';
      slot.style.pointerEvents = 'auto';

      // preserve closed placeholder if existed (match by top position)
      if (preservedClosed[String(cursor)]) {
        slot.classList.add('side-ad-placeholder');
        slot.dataset.closed = '1';
        // leave inner empty intentionally
      } else {
        // populate with random ad HTML
        const adHtml = randPick(sideAds);
        slot.innerHTML = adHtml;

        // look for .side-close button inside ad; if present, wire it
        const closeBtn = slot.querySelector('.side-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            // replace contents with placeholder but keep the element and its height — do NOT auto-replace
            slot.innerHTML = '';
            slot.classList.add('side-ad-placeholder');
            slot.dataset.closed = '1';
          });
        }
      }

      // give the slot an identifier
      slot.dataset.slotIndex = slotIndex;
      slot.dataset.top = String(cursor);

      // append to document body (so it sits at absolute document coordinate)
      document.body.appendChild(slot);

      slotIndex++;
      cursor += slotHeight + slotMargin;
    }
  }

  function populateAllSideAds() {
    // remove any pre-existing side ad slots (we'll rebuild)
    Array.from(document.querySelectorAll('.side-ad-slot')).forEach(el => el.remove());
    if (!leftWrapper || !rightWrapper) return;

    // set wrappers absolute left/right and top (we will not put children inside wrappers, we put slots on body for absolute doc coords)
    const headerBottom = computeHeaderBottom();
    // position wrappers as guides; wrappers can also be used to set width or other styles
    leftWrapper.style.left = '8px';
    leftWrapper.style.top = `${headerBottom}px`;
    leftWrapper.style.width = `${sideWidth}px`;
    leftWrapper.style.position = 'absolute';
    rightWrapper.style.right = '8px';
    rightWrapper.style.top = `${headerBottom}px`;
    rightWrapper.style.width = `${sideWidth}px`;
    rightWrapper.style.position = 'absolute';

    // populate both sides
    populateSideSlots(leftWrapper, 'left');
    populateSideSlots(rightWrapper, 'right');
  }

  // initialize and wire up
  function init() {
    positionHeaderBanners();
    initHeaderAd();
    populateAllSideAds();
  }

  // event listeners: reposition header banners and regenerate side slots on resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    positionHeaderBanners();
    // throttle regen
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      populateAllSideAds();
    }, 300);
  });

  // also regenerate on DOMContentLoaded and on load (images might change layout)
  window.addEventListener('load', () => {
    setTimeout(init, 60);
  });
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 60));

  // expose API to add header ad / side ad items at runtime
  window.BannerManager = {
    addHeaderAd: function (html) { headerAds.push(html); },
    addSideAd: function (html) { sideAds.push(html); },
    refreshHeaderAd: function () { renderHeaderAd(randPick(headerAds)); },
    rebuildSideAds: function () { populateAllSideAds(); },
    clearHeaderAdTimeout: clearHeaderTimeout
  };

})();
