/* banner.js — full file (defensive footerTop + side-slot fixes)
   - header top = 75px
   - header ad replacement 10s after close
   - header ad & info banner half size (controlled by headerMinHeight/headerMaxHeight)
   - header/info have no margins between them
   - side ads: width 60px, absolute (scroll with page), generate immediately (no scroll delay)
   - side ad closed -> placeholder, auto-replace after 15s
   - side slots generated top->down between header bottom and footer top
   - defensive computeFooterTop() to handle fixed/sticky footers or weird layouts
   - API: BannerManager.addHeaderAd/addSideAd/rebuildSideAds/refreshHeaderAd
*/

(function () {
  // ---------------- CONFIG ----------------
  const minSlotHeight = 405;         // minimum gap (including margins) to create slots
  const slotHeight = 400;            // height of each side ad slot (px)
  const slotMargin = 10;             // vertical spacing per slot (top+bottom combined -> treated as one value)
  const sideWidth = 60;              // side ad width (px)
  const headerAdReplaceDelay = 10000; // header ad replace delay after close (ms)
  const sideAdReplaceDelay = 15000;  // side ad auto-replace delay after close (ms)
  const headerMinHeight = 40;        // header/info min height (px, 'half' smaller size)
  const headerMaxHeight = 110;       // header/info max height (px)

  // ---------------- AD SOURCES (edit these HTML snippets) ----------------
  const headerAds = [
    `<div style="width:100%;height:100%;position:relative;">
       <a href="https://example.com" target="_blank" rel="noopener" style="display:block;width:100%;height:100%;">
         <img src="/ads/header-ad1.jpg" alt="Header Ad" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">
       </a>
       <button class="ad-close" aria-label="Close ad" style="position:absolute;right:6px;top:6px;background:#ffffff88;border:none;padding:6px;border-radius:4px;cursor:pointer;">✕</button>
     </div>`,
    `<div style="width:100%;height:100%;position:relative;padding:8px;box-sizing:border-box;">
       <div style="display:flex;align-items:center;gap:8px;">
         <img src="/ads/header-ad2.jpg" alt="" style="height:64px;object-fit:cover;border-radius:6px;">
         <div style="flex:1;">
           <div style="font-weight:700;color:#111">Sponsor</div>
           <div style="font-size:13px;color:#333">Special offer — limited time</div>
         </div>
       </div>
       <button class="ad-close" aria-label="Close ad" style="position:absolute;right:6px;top:6px;background:#ffffff88;border:none;padding:6px;border-radius:4px;cursor:pointer;">✕</button>
     </div>`
  ];

  const sideAds = [
    `<div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
       <a href="https://example.com" target="_blank" rel="noopener"><img src="/ads/side1.jpg" alt="Side Ad" style="width:100%;height:auto;border-radius:4px;"></a>
       <div style="font-size:12px;text-align:center;">Sponsor</div>
       <button class="side-close" aria-label="Close side ad" style="border:none;background:#eee;padding:4px;border-radius:4px;cursor:pointer;">✕</button>
     </div>`,
    `<div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
       <a href="https://example.org" target="_blank" rel="noopener"><img src="/ads/side2.jpg" alt="Side Ad" style="width:100%;height:auto;border-radius:4px;"></a>
       <div style="font-size:12px;text-align:center;">App Promo</div>
       <button class="side-close" aria-label="Close side ad" style="border:none;background:#eee;padding:4px;border-radius:4px;cursor:pointer;">✕</button>
     </div>`
  ];

  // ---------------- utilities ----------------
  function randPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function safeEl(id) { return document.getElementById(id); }

  // ---------------- DOM refs ----------------
  const headerBanners = safeEl('header-banners');
  const headerAdEl = safeEl('header-ad');
  const headerAdHr = safeEl('header-ad-hr');
  const infoBanner = safeEl('info-banner');
  const leftWrapper = safeEl('left-ads-wrapper');
  const rightWrapper = safeEl('right-ads-wrapper');
  const headerEl = document.querySelector('header');
  const footerEl = document.querySelector('footer');

  if (!headerBanners) {
    console.warn('banner.js: missing #header-banners element — aborting banner init.');
    return;
  }

  // ---------------- position header banners ----------------
  function positionHeaderBanners() {
    // fixed top as requested (75px)
    headerBanners.style.position = 'fixed';
    headerBanners.style.top = '75px';
    headerBanners.style.left = '0';
    headerBanners.style.right = '0';
    headerBanners.style.zIndex = '9999';
    headerBanners.style.gap = '0'; // ensure no gap between header ad and info banner
  }

  // ---------------- header ad logic ----------------
  let headerAdTimeout = null;
  function clearHeaderTimeout() { if (headerAdTimeout) { clearTimeout(headerAdTimeout); headerAdTimeout = null; } }

  function renderHeaderAd(html) {
    if (!headerAdEl) return;
    headerAdEl.innerHTML = html || '';
    headerAdEl.style.display = html ? 'flex' : 'none';
    headerAdEl.style.minHeight = headerMinHeight + 'px';
    headerAdEl.style.maxHeight = headerMaxHeight + 'px';
    headerAdEl.style.margin = '0';
    headerAdEl.style.padding = '0';
    headerAdEl.style.boxSizing = 'border-box';

    // info banner match sizing and no margins
    if (infoBanner) {
      infoBanner.style.minHeight = headerMinHeight + 'px';
      infoBanner.style.maxHeight = headerMaxHeight + 'px';
      infoBanner.style.margin = '0';
      // keep a little horizontal padding for content readability
      infoBanner.style.padding = '0 12px';
      infoBanner.style.display = infoBanner.style.display === 'none' ? 'none' : 'flex';
      infoBanner.style.alignItems = 'center';
      infoBanner.style.gap = '8px';
    }

    // hr divider visibility (no margins)
    if (headerAdHr) {
      headerAdHr.style.display = (html && infoBanner && infoBanner.style.display !== 'none') ? 'block' : 'none';
      headerAdHr.style.margin = '0';
      headerAdHr.style.borderTop = '1px solid rgba(0,0,0,0.06)';
    }
  }

  // ---------------- side ad helpers ----------------
  function docY(el) {
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY;
  }

  function computeHeaderBottom() {
    if (!headerEl) return 0;
    const rect = headerEl.getBoundingClientRect();
    return rect.bottom + window.scrollY;
  }

  // DEFENSIVE computeFooterTop: handles fixed/sticky footer and weird layouts
  function computeFooterTop() {
    try {
      if (!footerEl) {
        return document.documentElement.scrollHeight;
      }
      const style = getComputedStyle(footerEl);
      if (style.position === 'fixed' || style.position === 'sticky') {
        // fixed/sticky footer — fallback to doc height
        return document.documentElement.scrollHeight;
      }
      // prefer offsetTop for static footers
      if (typeof footerEl.offsetTop === 'number' && footerEl.offsetTop > 0) {
        return footerEl.offsetTop;
      }
      // fallback to bounding rect + scrollY
      const rect = footerEl.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      if (!isFinite(top) || top <= 0) {
        return document.documentElement.scrollHeight;
      }
      return top;
    } catch (err) {
      console.warn('computeFooterTop() error, falling back to doc height:', err);
      return document.documentElement.scrollHeight;
    }
  }

  // ---------------- populate side slots for a wrapper ----------------
  function populateSideForWrapper(wrapper, side) {
    if (!wrapper) return;
    wrapper.innerHTML = ''; // rebuild

    const headerBottom = computeHeaderBottom();
    let footerTop = computeFooterTop();

    // Defensive: if footerTop is not below headerBottom (weird layout), fallback to document height
    if (footerTop <= headerBottom) {
      console.warn('banner.js: footerTop <= headerBottom (footerTop:', footerTop, 'headerBottom:', headerBottom,
                   ') — falling back to document height. This often means your footer is fixed/sticky or layout changed.');
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight || (headerBottom + minSlotHeight + 1000);
      if (docHeight > headerBottom + 50) {
        footerTop = docHeight;
      } else {
        footerTop = headerBottom + minSlotHeight + 20;
      }
    }

    const available = footerTop - headerBottom;
    if (available < minSlotHeight) {
      // still not enough space — bail out
      return;
    }

    // number of slots that fit
    const per = slotHeight + slotMargin;
    const maxSlots = Math.floor((available + (slotMargin / 2)) / per);
    if (maxSlots <= 0) return;

    // position wrapper absolutely in document flow so it scrolls with content
    wrapper.style.position = 'absolute';
    wrapper.style.top = headerBottom + 'px';
    wrapper.style.width = sideWidth + 'px';
    wrapper.style.height = Math.max(0, footerTop - headerBottom) + 'px';
    wrapper.style.pointerEvents = 'auto';
    wrapper.style.overflow = 'visible';

    for (let i = 0; i < maxSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'side-ad-slot';
      slot.style.height = slotHeight + 'px';
      slot.style.width = sideWidth + 'px';
      slot.dataset.index = String(i);
      slot.dataset.closed = '0';

      // fill with random ad
      const html = randPick(sideAds);
      slot.innerHTML = html;

      wrapper.appendChild(slot);
    }
  }

  // ---------------- populate both sides ----------------
  function populateAllSideAds() {
    if (!leftWrapper || !rightWrapper) return;
    // clear existing
    leftWrapper.innerHTML = '';
    rightWrapper.innerHTML = '';

    populateSideForWrapper(leftWrapper, 'left');
    populateSideForWrapper(rightWrapper, 'right');
  }

  // ---------------- delegated click handling (close buttons + header ad close) ----------------
  document.addEventListener('click', (e) => {
    // info banner close
    if (e.target.closest && e.target.closest('#info-banner .banner-close')) {
      if (infoBanner) infoBanner.style.display = 'none';
      return;
    }

    // header ad close
    if (e.target.closest && e.target.closest('#header-ad .ad-close')) {
      if (headerAdEl) {
        headerAdEl.innerHTML = '';
        headerAdEl.style.display = 'none';
        if (headerAdHr) headerAdHr.style.display = (infoBanner && infoBanner.style.display !== 'none') ? 'block' : 'none';
        clearHeaderTimeout();
        headerAdTimeout = setTimeout(() => {
          renderHeaderAd(randPick(headerAds));
        }, headerAdReplaceDelay);
      }
      return;
    }

    // side ad close (delegated)
    const sc = e.target.closest && e.target.closest('.side-close');
    if (sc) {
      const slot = sc.closest && sc.closest('.side-ad-slot');
      if (!slot) return;
      // mark closed and replace inner with placeholder
      slot.dataset.closed = '1';
      slot.innerHTML = '';
      slot.classList.add('side-ad-placeholder');

      // schedule auto-replace after delay
      setTimeout(() => {
        if (slot.dataset.closed === '1') {
          slot.dataset.closed = '0';
          slot.classList.remove('side-ad-placeholder');
          slot.innerHTML = randPick(sideAds);
        }
      }, sideAdReplaceDelay);

      return;
    }
  });

  // ---------------- init header ad + position ----------------
  function initHeaderArea() {
    positionHeaderBanners();
    if (headerAds && headerAds.length > 0) {
      renderHeaderAd(randPick(headerAds));
    } else {
      if (headerAdEl) headerAdEl.style.display = 'none';
      if (headerAdHr) headerAdHr.style.display = 'none';
    }
  }

  // ---------------- init everything ----------------
  function init() {
    try {
      initHeaderArea();
      populateAllSideAds();
    } catch (err) {
      console.error('banner.js init error:', err);
    }
  }

  // ---------------- resize / load wiring ----------------
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    positionHeaderBanners();
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      populateAllSideAds();
    }, 250);
  });

  window.addEventListener('load', () => setTimeout(init, 60));
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 60));

  // ---------------- public API ----------------
  window.BannerManager = {
    addHeaderAd(html) { headerAds.push(html); if (headerAdEl && headerAdEl.innerHTML === '') renderHeaderAd(randPick(headerAds)); },
    addSideAd(html) { sideAds.push(html); populateAllSideAds(); },
    refreshHeaderAd() { if (headerAds.length) renderHeaderAd(randPick(headerAds)); },
    rebuildSideAds() { populateAllSideAds(); },
    clearHeaderTimeout
  };

})();