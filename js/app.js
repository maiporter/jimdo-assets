(function () {
  const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

  // 1. EDITOR-SCHUTZ: Im Jimdo-Backend sofort stoppen
  const isJimdoEditor =
    !isLocal &&
    (window.location.hostname.includes("jimdo.com") ||
      window.location.hostname.includes("jimdosite.com") ||
      window.location.href.includes("/cms/"));

  if (isJimdoEditor) {
    return;
  }

  const BASE_URL = isLocal ? "/" : "https://cdn.jsdelivr.net/gh/maiporter/maiporter-assets@main/";

  const initApp = function () {
    const contentContainer = document.querySelector('[data-maiporter-test="geheim123"]');
    if (!contentContainer) return;

    // 2. JIMDO STYLESHEETS BLOCKIEREN (nur auf der Live-Domain)
    if (!isLocal) {
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        const href = (link.getAttribute("href") || "").toLowerCase();
        if (
          !href.includes("maiporter") &&
          (href.includes("web.css") || href.includes("layout.css") || href.includes("jimstatic") || href.includes("jimcdn"))
        ) {
          link.disabled = true;
        }
      });
    }

    // 3. EIGENES STYLESHEET EINBINDEN
    if (!document.querySelector('link[href*="maiporter-assets"][href*="styles.css"]')) {
      const customCss = document.createElement("link");
      customCss.rel = "stylesheet";
      customCss.href = BASE_URL + "css/styles.css";
      document.head.appendChild(customCss);
    }

    // 4. ALLE BEREICHE PARALLEL LADEN & EINSETZEN
    const pageAttr = contentContainer.dataset.page || window.MAIPORTER_PAGE;
    const headerUrl = BASE_URL + "templates/navigation/page-header.html";
    const navUrl = BASE_URL + "templates/navigation/main-navigation.html";
    const footerUrl = BASE_URL + "templates/navigation/page-footer.html";
    const pageUrl = pageAttr ? BASE_URL + pageAttr.replace(/^\//, "") : null;

    const headerPromise = fetch(headerUrl)
      .then((res) => res.text())
      .then((html) => {
        const el = document.getElementById("page-header-container");
        if (el) el.innerHTML = html;
      })
      .catch((err) => console.warn("Header-Fehler:", err));

    const contentPromise = pageUrl
      ? fetch(pageUrl)
          .then((res) => res.text())
          .then((html) => {
            contentContainer.innerHTML = html;
          })
          .catch((err) => console.warn("Seiten-Ladefehler:", err))
      : Promise.resolve();

    const footerPromise = fetch(footerUrl)
      .then((res) => res.text())
      .then((html) => {
        const el = document.getElementById("page-footer-container");
        if (el) el.innerHTML = html;
      })
      .catch((err) => console.warn("Footer-Fehler:", err));

    // 5. NAVIGATION EINSETZEN & AKTIVEN LINK MARKIEREN
    Promise.all([fetch(navUrl).then((res) => res.text()), headerPromise, footerPromise, contentPromise])
      .then(([navHtml]) => {
        const navDoc = new DOMParser().parseFromString(navHtml, "text/html");
        const navInner = navDoc.body.innerHTML;

        const headerNav = document.getElementById("page-nav-header");
        const footerNav = document.getElementById("page-nav-footer");

        if (headerNav) headerNav.innerHTML = navInner;
        if (footerNav) footerNav.innerHTML = navInner;

        const current = window.location.pathname;
        document.querySelectorAll(".main-navigation a").forEach((link) => {
          const linkPath = link.pathname;
          if (current === linkPath || (linkPath !== "/" && current.startsWith(linkPath + "/"))) {
            link.classList.add("active");
          }
        });
      })
      .catch((err) => console.warn("Nav-Ladefehler:", err));
  };

  // 2. SEITEN-TÜRSTEHER: Startet nur auf Seiten mit data-maiporter-test="geheim123"
  const startWhenReady = () => {
    if (document.querySelector('[data-maiporter-test="geheim123"]')) {
      initApp();
    } else if (document.body) {
      const observer = new MutationObserver(() => {
        if (document.querySelector('[data-maiporter-test="geheim123"]')) {
          observer.disconnect();
          initApp();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWhenReady);
  } else {
    startWhenReady();
  }
})();
