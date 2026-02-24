/* ================================================================
   MOBILE FIX PATCH — mobile-fix.js
   Add AFTER script.js:  <script src="mobile-fix.js"></script>
   ================================================================ */

(function () {
    'use strict';

    /* ── openCityPage: hide navbar, show city page fullscreen ────── */
    function patchOpenCityPage() {
        const orig = window.openCityPage;

        window.openCityPage = function (cityId) {
            // 1. Run the original function (fills cards/titles/etc)
            if (typeof orig === 'function') orig.call(this, cityId);

            // 2. Inject hero image
            if (window.CITY_HERO_IMAGES) {
                const imgData = window.CITY_HERO_IMAGES[cityId] || { src: '', alt: cityId };
                const el = document.getElementById('cityHeroImg');
                if (el) {
                    el.src = imgData.src;
                    el.alt = imgData.alt;
                    el.style.display = imgData.src ? 'block' : 'none';
                }
            }

            // 3. Show city page via .active (CSS handles display:block)
            const cityPage = document.getElementById('cityPage');
            if (cityPage) {
                cityPage.removeAttribute('style');   // remove inline display:none
                cityPage.classList.add('active');
                cityPage.scrollTop = 0;
            }

            // 4. Add body class → CSS hides #navbar, removes padding
            document.body.classList.add('city-page-open');

            // 5. Fix back button text & handler
            const backBtn = cityPage ? cityPage.querySelector('.city-back-btn') : null;
            if (backBtn) {
                backBtn.innerHTML = '← Home';
                backBtn.onclick = function (e) {
                    e.preventDefault();
                    closeCityPageMobile();
                };
            }

            // 6. Wire city tabs (in case original didn't)
            wireCityTabs();
        };
    }

    /* ── closeCityPage: restore navbar ──────────────────────────── */
    function closeCityPageMobile() {
        const cityPage = document.getElementById('cityPage');
        if (cityPage) {
            cityPage.classList.remove('active');
            cityPage.style.display = 'none';
        }
        document.body.classList.remove('city-page-open');
        document.body.style.overflow = '';

        // Also call original closeCityPage if it exists
        if (typeof window._origCloseCityPage === 'function') {
            window._origCloseCityPage();
        }
    }

    /* ── Wire city tabs in case original script doesn't ─────────── */
    function wireCityTabs() {
        const tabs = document.querySelectorAll('.city-tab');
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                const target = this.dataset.tab;
                if (!target) return;

                // Update tab active state
                tabs.forEach(function (t) { t.classList.remove('active'); });
                this.classList.add('active');

                // Show correct content panel
                document.querySelectorAll('.city-tab-content').forEach(function (panel) {
                    panel.classList.remove('active');
                });
                const panel = document.getElementById('tab-' + target);
                if (panel) panel.classList.add('active');
            });
        });
    }

    /* ── Patch closeCityPage too ─────────────────────────────────── */
    function patchCloseCityPage() {
        if (typeof window.closeCityPage === 'function') {
            window._origCloseCityPage = window.closeCityPage;
        }
        window.closeCityPage = function () {
            closeCityPageMobile();
        };
    }

    /* ── Place card: ensure entire card is tappable ─────────────── */
    function fixPlaceCards() {
        document.querySelectorAll('.place-card').forEach(function (card) {
            // Remove any existing click to prevent double-fire
            const cityId = card.getAttribute('onclick');
            if (!cityId) return;

            // Force pointer events on child elements
            card.querySelectorAll('*').forEach(function (child) {
                child.style.pointerEvents = 'none';
            });
            card.style.pointerEvents = 'auto';
        });
    }

    /* ── Init on DOMContentLoaded ────────────────────────────────── */
    function init() {
        patchOpenCityPage();
        patchCloseCityPage();
        fixPlaceCards();
        wireCityTabs();

        // Handle Android back gesture / browser back
        window.addEventListener('popstate', function () {
            if (document.body.classList.contains('city-page-open')) {
                closeCityPageMobile();
            }
        });

        // Push a state so back button works
        const origOpen = window.openCityPage;
        const _ref = origOpen; // keep reference
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();