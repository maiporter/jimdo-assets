(function () {
  const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

  // Erkennt den Jimdo-Editor auch innerhalb des Jimdo-Vorschau-iFrames
  const isInIframe = window.self !== window.top;
  const referrerIsJimdo = (document.referrer || "").includes("jimdo.com");
  const hasEditorDom =
    document.body.classList.contains("cc-pagemode-default") ||
    !!document.getElementById("cc-tp-padding-container") ||
    !!document.querySelector(".j-admin");

  const isJimdoEditor =
    !isLocal &&
    (window.location.hostname.includes("jimdo.com") ||
      window.location.hostname.includes("jimdosite.com") ||
      window.location.href.includes("/cms/") ||
      isInIframe ||
      referrerIsJimdo ||
      hasEditorDom);

  // IM JIMDO-EDITOR SOFORT STOPPEN
  if (isJimdoEditor) {
    console.info("MaiPorter App: Jimdo-Editor erkannt – Skript pausiert.");
    return;
  }

  // Basis-URL: Lokal relativ zum Root, live über jsDelivr
  const BASE_URL = isLocal ? "/" : "https://cdn.jsdelivr.net/gh/maiporter/maiporter-assets@main/";

  // 1. JIMDO STYLESHEETS BLOCKIEREN (nur auf der echten Live-Domain)
  if (!isLocal) {
    const disableJimdoStyles = () => {
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        const href = (link.getAttribute("href") || "").toLowerCase();
        if (
          !href.includes("maiporter") &&
          (href.includes("web.css") || href.includes("layout.css") || href.includes("jimstatic") || href.includes("jimcdn"))
        ) {
          link.disabled = true;
        }
      });
    };
    disableJimdoStyles();
    document.addEventListener("DOMContentLoaded", disableJimdoStyles);
  }

  // 2. EIGENES STYLESHEET EINBINDEN
  const customCss = document.createElement("link");
  customCss.rel = "stylesheet";
  customCss.href = BASE_URL + "css/styles.css";
  document.head.appendChild(customCss);

  // 3. ALLE BEREICHE PARALLEL LADEN & EINSETZEN
  const initApp = function () {
    const headerUrl = BASE_URL + "templates/navigation/page-header.html";
    const navUrl = BASE_URL + "templates/navigation/main-navigation.html";
    const footerUrl = BASE_URL + "templates/navigation/page-footer.html";
    const pageUrl = window.MAIPORTER_PAGE ? BASE_URL + window.MAIPORTER_PAGE.replace(/^\//, "") : null;

    // Header laden
    const headerPromise = fetch(headerUrl)
      .then((res) => res.text())
      .then((html) => {
        const el = document.getElementById("page-header-container");
        if (el) el.innerHTML = html;
      })
      .catch((err) => console.warn("Header-Fehler:", err));

    // Seiteninhalt laden (nur wenn MAIPORTER_PAGE gesetzt ist)
    const contentPromise = pageUrl
      ? fetch(pageUrl)
          .then((res) => res.text())
          .then((html) => {
            const el = document.getElementById("page-content-container");
            if (el) el.innerHTML = html;
          })
          .catch((err) => console.warn("Seiten-Ladefehler:", err))
      : Promise.resolve();

    // Footer laden
    const footerPromise = fetch(footerUrl)
      .then((res) => res.text())
      .then((html) => {
        const el = document.getElementById("page-footer-container");
        if (el) el.innerHTML = html;
      })
      .catch((err) => console.warn("Footer-Fehler:", err));

    // Navigation laden und in Header + Footer einhängen
    Promise.all([fetch(navUrl).then((res) => res.text()), headerPromise, footerPromise, contentPromise])
      .then(([navHtml]) => {
        const navDoc = new DOMParser().parseFromString(navHtml, "text/html");
        const navInner = navDoc.body.innerHTML;

        const headerNav = document.getElementById("page-nav-header");
        const footerNav = document.getElementById("page-nav-footer");

        if (headerNav) headerNav.innerHTML = navInner;
        if (footerNav) footerNav.innerHTML = navInner;

        // Aktiven Menüpunkt markieren
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
