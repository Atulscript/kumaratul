document.addEventListener('DOMContentLoaded', () => {
    // Header Blur Effect on Scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.style.background = 'rgba(10, 10, 11, 0.9)';
            header.style.padding = '1rem 0';
        } else {
            header.style.background = 'rgba(10, 10, 11, 0.8)';
            header.style.padding = '1.5rem 0';
        }
    });

    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply styles for animation
    const revealElements = document.querySelectorAll('section, .service-card, .contrast-box');

    // Inject animation styles
    const style = document.createElement('style');
    style.textContent = `
        .reveal-hidden {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .reveal-active {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    revealElements.forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });
});
