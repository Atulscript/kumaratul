window.addEventListener("click", function(e) {
    if (e.target.closest('.open-calendar')) {
        console.log("Event Fired");

        gtag('event', 'clicked_book_meeting');
    }
});
