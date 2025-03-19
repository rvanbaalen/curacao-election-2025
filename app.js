document.addEventListener('DOMContentLoaded', function() {
    const mainToc = document.getElementById('main-toc');
    const fixedToc = document.getElementById('fixed-toc');
    const tocToggleBtn = document.getElementById('toc-toggle-btn');

    if (!mainToc || !fixedToc || !tocToggleBtn) return;

    let tocIsOpen = false;
    let btnVisible = false;

    // Function to toggle ToC visibility
    const toggleToc = () => {
        if (tocIsOpen) {
            // Hide ToC
            fixedToc.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                fixedToc.classList.add('hidden');
            }, 150);
        } else {
            // Show ToC
            fixedToc.classList.remove('hidden');
            setTimeout(() => {
                fixedToc.classList.remove('opacity-0', 'scale-95');
            }, 10);
        }
        tocIsOpen = !tocIsOpen;

        // Add subtle rotation to button icon
        tocToggleBtn.classList.toggle('rotate-180');
    };

    // Function to check if main ToC is out of view
    const checkTocVisibility = () => {
        const mainTocRect = mainToc.getBoundingClientRect();

        // If main ToC is above the viewport, show button
        if (mainTocRect.bottom < 0) {
            if (!btnVisible) {
                tocToggleBtn.parentElement.classList.remove('hidden');
                setTimeout(() => {
                    tocToggleBtn.classList.remove('scale-90', 'opacity-0');
                }, 10);
                btnVisible = true;
            }
        } else {
            if (btnVisible) {
                tocToggleBtn.classList.add('scale-90', 'opacity-0');
                // Hide the dropdown if it's open
                if (tocIsOpen) {
                    fixedToc.classList.add('opacity-0', 'scale-95');
                    tocIsOpen = false;
                }
                setTimeout(() => {
                    tocToggleBtn.parentElement.classList.add('hidden');
                }, 150);
                btnVisible = false;
            }
        }
    };

    // Add click event to toggle button
    tocToggleBtn.addEventListener('click', function(e) {
        // Stop event propagation to prevent bubbling issues
        e.stopPropagation();
        toggleToc();
    });

    // Check visibility on scroll
    window.addEventListener('scroll', checkTocVisibility);

    // Close ToC when clicking outside
    document.addEventListener('click', (e) => {
        if (tocIsOpen && !fixedToc.contains(e.target) && e.target !== tocToggleBtn && !tocToggleBtn.contains(e.target)) {
            toggleToc();
        }
    });

    // Hide both initially
    tocToggleBtn.parentElement.classList.add('hidden');
    tocToggleBtn.classList.add('scale-90', 'opacity-0');

    // Initial check
    checkTocVisibility();
});