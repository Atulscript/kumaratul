window.onclick = function(e) {
    let el = e.target;
    // Optimized: using closest() to catch the button even if an icon inside is clicked
    let cta = el.closest('.cta-btn');

    if (cta) {
        console.log("CTA Clicked:", cta.innerText.trim() || cta.getAttribute('aria-label') || "Generic CTA");
    }
};