/**
 * PERFORMANCE-OPTIMIZED ANALYTICS TRACKING
 * Kumaratul.com - GTM Server-Side Integration Helper
 * Logic moved out of index.html to keep the main thread clean.
 */

(function analyticsSuite() {
    "use strict";

    // ════ DATA TRACKER HELPER ════
    // Uses requestIdleCallback for non-critical event tracking
    const trackEvent = (eventName, params = {}) => {
        const payload = {
            event: eventName,
            ...params,
            timestamp: new Date().getTime(),
            client_location: window.location.pathname
        };

        const pushToDataLayer = () => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(payload);
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(pushToDataLayer);
        } else {
            setTimeout(pushToDataLayer, 100); // Fallback for Safari
        }
    };

    // ════ GLOBAL CLICK TRACKING ════
    // Centralized event listener for all CTA and nav tracks
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.nav-track, .cta-track');
        if (!target) return;

        const metadata = {
            service_clicked: target.getAttribute('data-cta-service') || 'General',
            location: target.getAttribute('data-cta-location') || 'Global',
            type: target.getAttribute('data-cta-type') || 'Interaction',
            text: target.innerText.trim()
        };

        trackEvent('conversion_interaction', metadata);
    });

    // ════ SCROLL DEPTH TRACKING ════
    let scrolled25 = false, scrolled50 = false, scrolled75 = false;
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        
        if (scrollPercent >= 25 && !scrolled25) {
            scrolled25 = true;
            trackEvent('scroll_depth_25');
        }
        if (scrollPercent >= 50 && !scrolled50) {
            scrolled50 = true;
            trackEvent('scroll_depth_50');
        }
        if (scrollPercent >= 75 && !scrolled75) {
            scrolled75 = true;
            trackEvent('scroll_depth_75');
        }
    }, { passive: true });

    // ════ BOUNCE PREVENTION ════
    setTimeout(() => {
        trackEvent('engage_time_reached', { seconds: 15 });
    }, 15000);

})();
