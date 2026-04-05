/**
 * Universal Unified Tracking Logic
 * Captures clicks on elements with 'cta-track' (buttons/CTAs) 
 * or 'nav-track' (navigation menu items).
 */
document.addEventListener('click', function(e) {
    // Check for both CTA buttons and Nav items
    const tracker = e.target.closest('.cta-track, .nav-track');
    
    if (tracker) {
        const isNav = tracker.classList.contains('nav-track');
        
        const trackingData = {
            event: isNav ? 'track_navigation' : 'track_cta',
            cta_text: tracker.innerText.trim() || tracker.getAttribute('aria-label') || 'unlabeled',
            cta_service: tracker.getAttribute('data-cta-service') || 'general',
            cta_location: tracker.getAttribute('data-cta-location') || 'body',
            cta_type: tracker.getAttribute('data-cta-type') || (isNav ? 'navigation' : 'click'),
            page_path: window.location.pathname,
            url: tracker.href || 'no-link'
        };

        // Push to GTM DataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(trackingData);

        // Optional debugging
        console.log(`📊 ${isNav ? 'Nav' : 'CTA'} Tracked:`, trackingData);
    }
});

/**
 * Global Form Submission Tracking
 */
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form) {
        const formData = {
            event: 'form_submit',
            form_id: form.id || 'contact_form',
            page_path: window.location.pathname
        };
        
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(formData);
        
        console.log('📩 Form Submission Tracked:', formData);
    }
});
