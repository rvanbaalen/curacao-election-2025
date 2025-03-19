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
 * @param {string} options.tocToggleSelector - Selector for TOC toggle button
 * @param {string} options.languageSwitcherSelector - Selector for language switcher links
 */
export function initSectionAnalytics({
  gaTrackingId = "G-TXC5S2YQBZ",
  basePagePath = "/curacao-election-2025/",
  baseTitleSuffix = " – Verkiezingen Curaçao 2025",
  mainTocSelector = "#main-toc a",
  fixedTocSelector = "#fixed-toc a",
  sectionSelector = "section[id]",
  tocToggleSelector = "#toc-toggle-btn",
  languageSwitcherSelector = ".sticky.top-0 a",
} = {}) {
  // Wait for DOM to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setupTracking());
  } else {
    setupTracking();
  }

  function setupTracking() {
    setupVirtualPageviewTracking();
    setupSectionVisibilityTracking();
    setupTocToggleTracking();
    setupLanguageSwitcherTracking();
    addSectionMetadata();
  }

  /**
   * Sends a virtual pageview to Google Analytics
   * @param {string} sectionId - ID of the section
   * @param {string} sectionTitle - Title of the section
   */
  function sendVirtualPageview(sectionId, sectionTitle) {
    if (typeof gtag === "function") {
      gtag("event", "page_view", {
        page_title: sectionTitle,
        page_path: basePagePath + sectionId,
        send_to: gaTrackingId,
      });
      console.log(`Analytics: Virtual pageview sent for "${sectionTitle}"`);
    } else {
      console.warn("Analytics: gtag not available");
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

        // Small timeout to ensure the navigation happens before tracking
        setTimeout(() => {
          sendVirtualPageview(sectionId, sectionTitle);
        }, 100);
      });
    });
  }

  /**
   * Sets up tracking for section visibility using Intersection Observer
   */
  function setupSectionVisibilityTracking() {
    // Use a Map to prevent duplicate tracking of sections in quick succession
    const trackedSections = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.id;

        // Only track if section is intersecting and hasn't been tracked recently
        if (entry.isIntersecting && (!trackedSections.has(sectionId)
          || Date.now() - trackedSections.get(sectionId) > 5000)) {
          const sectionTitle = entry.target.getAttribute("data-section-name") + baseTitleSuffix;
          sendVirtualPageview(sectionId, sectionTitle);

          // Mark this section as recently tracked
          trackedSections.set(sectionId, Date.now());
        }
      });
    }, {
      threshold: 0.5, // Fire when at least 50% of the section is visible
      rootMargin: "-10% 0px -10% 0px", // Adds a margin to the top and bottom of the viewport
    });

    // Observe all sections
    document.querySelectorAll(sectionSelector).forEach((section) => {
      observer.observe(section);
    });
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

        if (typeof gtag === "function") {
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

        if (typeof gtag === "function") {
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

/**
 * Utility function to manually trigger a pageview
 * @param {string} path - The path to send as pageview
 * @param {string} title - The title to send with the pageview
 */
export function trackPageview(path, title) {
  if (typeof gtag === "function") {
    gtag("event", "page_view", {
      page_title: title,
      page_path: path,
    });
    console.log(`Analytics: Manual pageview sent for "${title}"`);
  }
}

/**
 * Utility function to track custom events
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Parameters to send with the event
 */
export function trackEvent(eventName, eventParams = {}) {
  if (typeof gtag === "function") {
    gtag("event", eventName, eventParams);
    console.log(`Analytics: Custom event "${eventName}" sent`, eventParams);
  }
}

// Export default init function for easier imports
export default initSectionAnalytics;
