/**
 * Section Navigation Analytics Tracker
 * Tracks virtual pageviews for section navigation on a single-page website
 */

/**
 * Initializes all analytics tracking for section navigation and site interactions
 * @param {object} options - Configuration options
 * @param {string} options.gaTrackingId - Google Analytics tracking ID
 * @param {string} options.basePagePath - Base path for virtual pageviews
 * @param {string} options.baseTitleSuffix - Suffix to append to section titles
 * @param {string} options.mainTocSelector - Selector for main table of contents
 * @param {string} options.fixedTocSelector - Selector for fixed/floating table of contents
 * @param {string} options.sectionSelector - Selector for content sections
 * @param {string} options.homeTitle - Title to use for the home/top section
 * @param {string} options.firstSectionId - ID of the first section (e.g., "movementu-kousa-prome")
 * @param {string} options.tocToggleSelector - Selector for TOC toggle button
 * @param {string} options.languageSwitcherSelector - Selector for language switcher links
 * @param {number} options.dwellTime - Time in ms a user must stay on section before tracking (default: 1000ms)
 * @param {number} options.scrollDebounce - Debounce time for scroll events in ms (default: 300ms)
 */
export function initSectionAnalytics({
  gaTrackingId = "G-TXC5S2YQBZ",
  basePagePath = "/curacao-election-2025/",
  baseTitleSuffix = " – Verkiezingen Curaçao 2025",
  mainTocSelector = "#main-toc a",
  fixedTocSelector = "#fixed-toc a",
  sectionSelector = "section[id]",
  homeTitle = "Home",
  firstSectionId = "movementu-kousa-prome", // Specify the ID of the first section
  tocToggleSelector = "#toc-toggle-btn",
  languageSwitcherSelector = ".sticky.top-0 a",
  dwellTime = 1000, // User must stay on a section for 1 second before tracking
  scrollDebounce = 300, // Wait 300ms after scrolling stops before checking sections
} = {}) {
  // Track the last section viewed to prevent duplicates
  let lastViewedSection = null;
  // For tracking dwell time on sections
  let currentlyVisibleSection = null;
  let dwellTimeout = null;
  let isScrolling = false;

  // Wait for DOM to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setupTracking());
  } else {
    setupTracking();
  }

  function setupTracking() {
    addSectionMetadata();
    setupVirtualPageviewTracking();
    setupSectionVisibilityTracking();
    setupTocToggleTracking();
    setupLanguageSwitcherTracking();

    // Track initial home pageview immediately
    trackHomePageview();
  }

  /**
   * Sends a virtual pageview for the home/top section
   */
  function trackHomePageview() {
    const gtag = getGtag();
    if (gtag) {
      // Always track home on initial page load
      gtag("event", "page_view", {
        page_title: homeTitle + baseTitleSuffix,
        page_path: `${basePagePath}home`,
        send_to: gaTrackingId,
      });
      console.log(`Analytics: Home pageview sent for "${homeTitle}"`);

      // Set as last viewed
      lastViewedSection = "home";
    }
  }

  /**
   * Gets the gtag function if available
   * @returns {Function|null} The gtag function or null if not available
   */
  function getGtag() {
    // Check if gtag is defined in global scope
    return typeof window !== "undefined" && typeof window.gtag === "function"
      ? window.gtag
      : null;
  }

  /**
   * Sends a virtual pageview to Google Analytics
   * @param {string} sectionId - ID of the section
   * @param {string} sectionTitle - Title of the section
   * @param {boolean} force - Whether to force sending even if it's a duplicate
   * @returns {boolean} Whether the pageview was sent
   */
  function sendVirtualPageview(sectionId, sectionTitle, force = false) {
    // Don't send duplicate pageviews for the same section unless forced
    if (!force && sectionId === lastViewedSection) {
      console.log(`Analytics: Skipping duplicate pageview for "${sectionId}"`);

      return false;
    }

    const gtag = getGtag();

    if (gtag) {
      gtag("event", "page_view", {
        page_title: sectionTitle,
        page_path: basePagePath + sectionId,
        send_to: gaTrackingId,
      });
      console.log(`Analytics: Virtual pageview sent for "${sectionTitle}"`);

      // Update last viewed section
      lastViewedSection = sectionId;

      return true;
    } else {
      console.warn("Analytics: gtag not available");

      return false;
    }
  }

  /**
   * Sets up tracking for TOC link clicks
   */
  function setupVirtualPageviewTracking() {
    // Get all section links in both tables of contents
    const tocLinks = document.querySelectorAll(`${mainTocSelector}, ${fixedTocSelector}`);

    // Add click events to all TOC links
    tocLinks.forEach((link) => {
      link.addEventListener("click", function () {
        const sectionId = this.getAttribute("href").substring(1); // Remove the # from href
        const sectionTitle = this.textContent + baseTitleSuffix;

        /*
         * For direct clicks, we can track immediately without dwell time
         * Small timeout to ensure the navigation happens before tracking
         */
        setTimeout(() => {
          sendVirtualPageview(sectionId, sectionTitle);
        }, 100);
      });
    });
  }

  /**
   * Sets up tracking for section visibility using Intersection Observer and scroll events
   */
  function setupSectionVisibilityTracking() {
    // Get all sections
    const sections = document.querySelectorAll(sectionSelector);
    console.log(`Found ${sections.length} sections to observe for visibility`);

    // Create the observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Only process if we're not currently scrolling
        if (!isScrolling) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const section = entry.target;
            const sectionId = section.id;

            // Skip first section - it has special handling
            if (sectionId === firstSectionId) {
              return;
            }

            if (currentlyVisibleSection !== section) {
              currentlyVisibleSection = section;

              // Clear any existing timeout
              if (dwellTimeout) {
                clearTimeout(dwellTimeout);
              }

              // Set a timeout to track after dwell time
              dwellTimeout = setTimeout(() => {
                if (currentlyVisibleSection === section) {
                  const sectionTitle = section.getAttribute("data-section-name")
                    || section.querySelector("h2")?.textContent
                    || "Unknown Section";

                  sendVirtualPageview(sectionId, sectionTitle + baseTitleSuffix);
                }
              }, dwellTime);
            }
          }
        }
      });
    }, {
      threshold: [0.6], // Higher threshold for more reliable detection
      rootMargin: "-10% 0px -10% 0px",
    });

    // Observe all sections
    sections.forEach(section => observer.observe(section));

    // For scrolling detection
    let scrollTimeout;

    // Track when user scrolls
    window.addEventListener("scroll", () => {
      isScrolling = true;

      // Cancel any pending dwell timeout while scrolling
      if (dwellTimeout) {
        clearTimeout(dwellTimeout);
        dwellTimeout = null;
      }

      // Clear previous scroll timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Set a timeout to detect when scrolling stops
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        detectVisibleSectionsAfterScroll();
      }, scrollDebounce);
    });

    /**
     * Explicitly check for which section is most visible after scrolling stops
     */
    function detectVisibleSectionsAfterScroll() {
      const viewportHeight = window.innerHeight;
      let bestSection = null;
      let bestVisibility = 0;

      // First check if we're at the top of the page
      if (window.scrollY < 200) {
        // We're at the top, track home if needed
        if (lastViewedSection !== "home") {
          trackHomePageview();
        }

        return;
      }

      // Check each section's visibility
      sections.forEach((section) => {
        const sectionId = section.id;

        // Skip first section - it has special handling
        if (sectionId === firstSectionId) {
          return;
        }

        const rect = section.getBoundingClientRect();
        // Calculate visible area
        const sectionTop = Math.max(0, rect.top);
        const sectionBottom = Math.min(viewportHeight, rect.bottom);
        const visibleHeight = Math.max(0, sectionBottom - sectionTop);
        const visibleRatio = visibleHeight / viewportHeight;

        // Find the most visible section
        if (visibleRatio > bestVisibility) {
          bestVisibility = visibleRatio;
          bestSection = section;
        }
      });

      // If we found a good section and it's visible enough
      if (bestSection && bestVisibility > 0.4) {
        const sectionId = bestSection.id;

        if (currentlyVisibleSection !== bestSection) {
          currentlyVisibleSection = bestSection;

          // Set a timeout to track after dwell time
          dwellTimeout = setTimeout(() => {
            const sectionTitle = bestSection.getAttribute("data-section-name")
              || bestSection.querySelector("h2")?.textContent
              || "Unknown Section";

            sendVirtualPageview(sectionId, sectionTitle + baseTitleSuffix);
          }, dwellTime);
        }
      }
    }
  }

  /**
   * Sets up tracking for TOC toggle button clicks
   */
  function setupTocToggleTracking() {
    const tocToggleBtn = document.querySelector(tocToggleSelector);

    if (tocToggleBtn) {
      // Use a closure to maintain state
      let isOpen = false;

      tocToggleBtn.addEventListener("click", () => {
        isOpen = !isOpen;

        const gtag = getGtag();
        if (gtag) {
          gtag("event", "toc_toggle", {
            event_category: "UI Interaction",
            event_label: isOpen ? "Open" : "Close",
          });
          console.log(`Analytics: TOC toggle ${isOpen ? "opened" : "closed"}`);
        }
      });
    }
  }

  /**
   * Sets up tracking for language switcher clicks
   */
  function setupLanguageSwitcherTracking() {
    const languageSwitchers = document.querySelectorAll(languageSwitcherSelector);

    languageSwitchers.forEach((link) => {
      link.addEventListener("click", function () {
        // Extract language from the link content (adapt as needed)
        const language = this.textContent.trim()
          || this.querySelector("span:not([aria-label])").textContent.trim();
        const gtag = getGtag();
        if (gtag) {
          gtag("event", "language_change", {
            event_category: "Site Preferences",
            event_label: language,
          });
          console.log(`Analytics: Language changed to ${language}`);
        }
      });
    });
  }

  /**
   * Adds data attributes to sections for better tracking
   */
  function addSectionMetadata() {
    document.querySelectorAll(sectionSelector).forEach((section) => {
      if (!section.hasAttribute("data-section-name")) {
        const title = section.querySelector("h2")?.textContent || "Unknown Section";
        section.setAttribute("data-section-name", title);
      }
    });
  }
}

// Export default init function for easier imports
export default initSectionAnalytics;
