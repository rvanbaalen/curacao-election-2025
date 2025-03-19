/**
 * Table of Contents module
 * Controls visibility and behavior of a floating ToC
 */

/**
 * Initialize the Table of Contents functionality
 * @param {object} options - Configuration options
 * @param {string} options.mainTocId - ID of the main ToC element
 * @param {string} options.fixedTocId - ID of the fixed/floating ToC element
 * @param {string} options.toggleBtnId - ID of the toggle button element
 * @return {object} - Public methods for controlling the ToC
 */
export function initTableOfContents({
  mainTocId = "main-toc",
  fixedTocId = "fixed-toc",
  toggleBtnId = "toc-toggle-btn",
} = {}) {
  // Get DOM elements
  const mainToc = document.getElementById(mainTocId);
  const fixedToc = document.getElementById(fixedTocId);
  const tocToggleBtn = document.getElementById(toggleBtnId);

  // Exit if elements don't exist
  if (!mainToc || !fixedToc || !tocToggleBtn) {
    console.warn("ToC elements not found. Module initialization aborted.");

    return null;
  }

  // State variables
  let tocIsOpen = false;
  let btnVisible = false;
  /**
   * Toggle the visibility of the floating ToC
   */
  const toggleToc = () => {
    if (tocIsOpen) {
      // Hide ToC
      fixedToc.classList.add("opacity-0", "scale-95");
      setTimeout(() => {
        fixedToc.classList.add("hidden");
      }, 150);
    } else {
      // Show ToC
      fixedToc.classList.remove("hidden");
      setTimeout(() => {
        fixedToc.classList.remove("opacity-0", "scale-95");
      }, 10);
    }

    tocIsOpen = !tocIsOpen;

    // Add subtle rotation to button icon
    tocToggleBtn.classList.toggle("rotate-180");
  };
  /**
   * Check if main ToC is out of view and show/hide button accordingly
   */
  const checkTocVisibility = () => {
    const mainTocRect = mainToc.getBoundingClientRect();

    // If main ToC is above the viewport, show button
    if (mainTocRect.bottom < 0) {
      if (!btnVisible) {
        tocToggleBtn.parentElement.classList.remove("hidden");
        setTimeout(() => {
          tocToggleBtn.classList.remove("scale-90", "opacity-0");
        }, 10);
        btnVisible = true;
      }
    } else {
      if (btnVisible) {
        tocToggleBtn.classList.add("scale-90", "opacity-0");
        // Hide the dropdown if it's open
        if (tocIsOpen) {
          fixedToc.classList.add("opacity-0", "scale-95");
          tocIsOpen = false;
        }

        setTimeout(() => {
          tocToggleBtn.parentElement.classList.add("hidden");
        }, 150);
        btnVisible = false;
      }
    }
  };
  /**
   * Set up event listeners
   */
  const setupEventListeners = () => {
    // Add click event to toggle button
    tocToggleBtn.addEventListener("click", (e) => {
      // Stop event propagation to prevent bubbling issues
      e.stopPropagation();
      toggleToc();
    });

    // Check visibility on scroll
    window.addEventListener("scroll", checkTocVisibility);

    // Close ToC when clicking outside
    document.addEventListener("click", (e) => {
      if (tocIsOpen && !fixedToc.contains(e.target) && e.target !== tocToggleBtn && !tocToggleBtn.contains(e.target)) {
        toggleToc();
      }
    });
  };
  /**
   * Initialize the ToC state
   */
  const init = () => {
    // Hide both initially
    tocToggleBtn.parentElement.classList.add("hidden");
    tocToggleBtn.classList.add("scale-90", "opacity-0");

    // Set up event handlers
    setupEventListeners();

    // Initial check
    checkTocVisibility();
  };

  // Initialize on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Return public API
  return {
    toggle: toggleToc,
    checkVisibility: checkTocVisibility,
    isOpen: () => tocIsOpen,
  };
}

// Default export
export default initTableOfContents;
