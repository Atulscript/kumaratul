/**
 * Universal CTA & Navigation Tracking Logic
 * Captures clicks on all elements with the 'cta-track' class.
 */
document.addEventListener('click', function(e) {
    const cta = e.target.closest('.cta-track');
    
    if (cta) {
        const ctaData = {
            event: 'track_cta',
            cta_text: cta.innerText.trim() || cta.getAttribute('aria-label') || 'unlabeled',
            cta_service: cta.getAttribute('data-cta-service') || 'general',
            cta_location: cta.getAttribute('data-cta-location') || 'body',
            cta_type: cta.getAttribute('data-cta-type') || 'click',
            page_path: window.location.pathname,
            url: cta.href || 'no-link'
        };

        // Push to GTM DataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(ctaData);

        // Optional debugging
        console.log('📊 CTA Tracked:', ctaData);
    }
});

/**
 * Handle Form Submissions Tracking
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