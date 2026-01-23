// Minimal JavaScript for scroll effects or interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        section.style.transform = 'translateY(20px)';
        observer.observe(section);
    });

    // Custom CSS for reveal
    const style = document.createElement('style');
    style.textContent = `
        section.reveal {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
});
