/* ==========================================================================
   TABLE OF CONTENTS - CUSTOM.JS (MAIPORTER)
   ==========================================================================
   01. WIPER (VERGLEICHS-SLIDER)
   02. SLIDER MORPHER
   03. TELEFON-LABEL IM CHECKOUT ERGÄNZEN
   04. HEADER + NAVIGATION LOADER
   05. FOOTER NAVIGATION (DYNAMIC FETCH)
   06. BURGERMENÜ AUF SYSTEMSEITEN AUSBLENDEN
   07. NACHRICHTENFORMULAR (FORMSPREE)
   08. PADDING / ATTRIBUT FÜR J-SYSTEMSEITEN
   09. RE-DIRECTS FÜR SHOP-/RECHTSSEITEN
   10. TOOLTIPPS
   11. EASTEREGG- UND TEXT-AKKORDEON
   12. PRODUKTTITEL H4 ZU H2 FÜR SEO
   ========================================================================== */
   
   // ==========================================
// 1. WIPER
// ==========================================
(function () {
  function initWipers() {
    const wipers = document.querySelectorAll(".wiper-frame");
    wipers.forEach(function (wiper) {
      if (wiper.dataset.wiperReady) return;
      wiper.dataset.wiperReady = "true";

      const touchZone = wiper.querySelector(".wiper-touch-zone");
      if (!touchZone) return;

      let isDragging = false;

      function setPosition(pageX) {
        const rect = wiper.getBoundingClientRect();
        const radius = window.innerWidth <= 540 ? 20 : 30;

        let x = pageX - rect.left;

        const minX = radius + 3;
        const maxX = rect.width - radius + 3;

        if (x < minX) x = minX;
        if (x > maxX) x = maxX;

        wiper.style.setProperty("--pos", x + "px");
      }

      touchZone.addEventListener("pointerdown", function (e) {
        isDragging = true;
        touchZone.setPointerCapture(e.pointerId);
        setPosition(e.clientX);
      });

      touchZone.addEventListener("pointermove", function (e) {
        if (!isDragging) return;
        setPosition(e.clientX);
      });

      const stopDragging = function (e) {
        if (isDragging) {
          isDragging = false;
          try {
            touchZone.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }
      };

      touchZone.addEventListener("pointerup", stopDragging);
      touchZone.addEventListener("pointercancel", stopDragging);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWipers);
  } else {
    initWipers();
  }
})();

// ==========================================
// 2. SLIDER / SLIDER-MORPHER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".slider-frame.is-morpher").forEach((frame) => {
    const slides = frame.querySelectorAll(".slide");
    const thumbs = frame.querySelectorAll(".thumbs picture");
    const count = slides.length;
    if (count === 0) return;

    let idx = 0;
    let lastIdx = -1;
    let transitionTimeout = null;

    const updateMorph = (instant) => {
      if (transitionTimeout) clearTimeout(transitionTimeout);

      slides.forEach((s, i) => {
        s.style.transition = instant ? "none" : "opacity 1s linear";
        
        if (i === idx) {
          s.classList.add("active");
          s.classList.remove("last-active");
        } else if (i === lastIdx) {
          s.classList.add("last-active");
          s.classList.remove("active");
        } else {
          s.classList.remove("active", "last-active");
        }
      });

      thumbs.forEach((t, i) => t.classList.toggle("active", i === idx));

      if (!instant) {
        transitionTimeout = setTimeout(() => {
          slides.forEach((s, i) => {
            if (i !== idx) {
              s.classList.remove("last-active", "active");
            }
          });
        }, 1000);
      }
    };

    const nextSlide = () => {
      lastIdx = idx;
      idx = (idx + 1) % count;
      updateMorph(false);
    };

    const prevSlide = () => {
      lastIdx = idx;
      idx = (idx - 1 + count) % count;
      updateMorph(false);
    };

    const triggerArrowFeedback = (dir) => {
      const arrow = frame.querySelector(`.arrow-${dir}`);
      if (arrow) {
        arrow.classList.add("is-active");
        setTimeout(() => arrow.classList.remove("is-active"), 150);
      }
    };

    frame.querySelectorAll(".slider-arrow").forEach((arrow) => {
      arrow.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (arrow.classList.contains("arrow-prev")) {
          prevSlide();
          triggerArrowFeedback("prev");
        } else {
          nextSlide();
          triggerArrowFeedback("next");
        }
      };
    });

    const sliderBtn = frame.querySelector(".slider");
    if (sliderBtn) {
      sliderBtn.onclick = (e) => {
        if (e.target.closest(".thumbs")) return;
        if (e.target.closest(".slider-arrow")) return;
        if (document.activeElement) document.activeElement.blur();

        const rect = sliderBtn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        x < rect.width / 2 ? prevSlide() : nextSlide();
      };

      let touchStartX = 0, touchStartY = 0;
      sliderBtn.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      sliderBtn.addEventListener("touchend", (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);

        if (absX > absY * 0.8 && absX > 30) {
          diffX > 0 ? prevSlide() : nextSlide();
        }
      }, { passive: true });
    }

    thumbs.forEach((t, i) => {
      t.onclick = (e) => {
        e.stopPropagation();
        if (i === idx) return;
        lastIdx = idx;
        idx = i;
        updateMorph(false);
      };
    });

    updateMorph(true);
  });
});

// ==========================================
// 3. TELEFON-LABEL IM CHECKOUT ERGÄNZEN
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  function updatePhoneLabel() {
    const label = document.querySelector(
      "#billing_telephone label.j-checkout__input-label"
    );

    if (!label) return false;

    const addition = " (gerne angeben)";

    if (!label.textContent.includes(addition)) {
      label.textContent += addition;
    }

    return true;
  }
  if (updatePhoneLabel()) return;
  const observer = new MutationObserver(() => {
    if (updatePhoneLabel()) observer.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

// ==========================================
// 4. HEADER + NAVIGATION LOADER
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  fetch("/navigation/header")
    .then((res) => res.text())
    .then((data) => {
      const doc = new DOMParser().parseFromString(data, "text/html");
      const header = doc.querySelector(".site-header");
      const container = document.getElementById("global-header");

      if (header && container) {
        container.innerHTML = header.outerHTML;
        container.style.minHeight = "auto";

        const current = window.location.pathname;
        container.querySelectorAll(".main-navigation a").forEach((link) => {
          const href = new URL(link.href, window.location.origin).pathname;
          if (
            current === href ||
            (href !== "/" && current.startsWith(href + "/"))
          ) {
            link.classList.add("active");
          }
        });
      }
    })
    .catch((err) =>
      console.error("Header konnte nicht geladen werden:", err)
    );
});

// ==========================================
// 5. FOOTER NAVIGATION (DYNAMIC FETCH)
// ==========================================
(function () {
  const TARGET_PAGES = [
    "/j/checkout",
  ];

  const shouldAddFooter = TARGET_PAGES.some((path) =>
    window.location.pathname.startsWith(path)
  );

  if (!shouldAddFooter) return;

  function injectGlobalFooter() {
    const buttonContainer = document.querySelector(".j-checkout__button-container");
    if (!buttonContainer) return;

    if (document.getElementById("injected-global-footer")) return;

    const footerWrapper = document.createElement("div");
    footerWrapper.id = "injected-global-footer";

    buttonContainer.parentNode.insertBefore(footerWrapper, buttonContainer.nextSibling);

    fetch("/navigation/footer")
      .then((res) => res.text())
      .then((data) => {
        const doc = new DOMParser().parseFromString(data, "text/html");
        const footer = doc.querySelector(".site-footer");

        if (footer) {
          footerWrapper.appendChild(footer);

          const currentPath = window.location.pathname;
          footer.querySelectorAll(".main-navigation a").forEach((link) => {
            const linkPath = new URL(link.href, window.location.origin).pathname;
            if (
              currentPath === linkPath ||
              (linkPath !== "/" && currentPath.startsWith(linkPath + "/"))
            ) {
              link.classList.add("active");
            }
            link.style.color = "#000000";
          });
        }
      })
      .catch((err) => console.error("Fehler beim Laden des Footers:", err));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectGlobalFooter);
  } else {
    injectGlobalFooter();
  }
})();

// ==========================================
// 6. BURGERMENÜ AUF SYSTEMSEITEN AUSBLENDEN
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const hideOnPages = [
    "/orderconfirmation/",
    "/j/checkout?startCheckout",
    "/j/checkout/data",
    "/j/checkout/payment",
    "/j/checkout/overview",
    "//j/checkout/confirmation",
  ];

  const shouldHide = hideOnPages.some((page) =>
    window.location.href.includes(page)
  );

  if (shouldHide) {
    const el = document.querySelector(".jtpl-navigation__label");
    if (el) {
      el.style.display = "none";
    }
  }
});

// ==========================================
// 7. NACHRICHTENFORMULAR (FORMSPREE)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector('form[action*="formspree.io"]');
  if (!form) return;

  const nameInput = form.querySelector("[name='name']");
  const emailInput = form.querySelector("[name='email']");
  const messageInput = form.querySelector("[name='message']");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (
      !nameInput?.value.trim() ||
      !emailInput?.value.trim() ||
      !messageInput?.value.trim()
    ) {
      alert("❌ Bitte alle Felder ausfüllen.");
      return;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (response.ok) {
        window.location.href = "https://www.maiporter.de/erfolg";
      } else {
        const data = await response.json();
        const msg = data?.errors?.[0]?.message || "Unbekannter Fehler.";
        alert("❌ Fehler: " + msg);
      }
    } catch (err) {
      alert("❌ Es ist ein Fehler beim Senden aufgetreten.");
      console.error(err);
    }
  });
});

// ==========================================
// 8. PADDING / ATTRIBUT FÜR J-SYSTEMSEITEN
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const currentURL = window.location.href;
  if (currentURL.startsWith("https://www.maiporter.de/j/")) {
    document.body.setAttribute("data-url", currentURL);
  }
});

// ==========================================
// 9. RE-DIRECTS FÜR SHOP-/RECHTSSEITEN
// ==========================================
(function () {
  const redirects = {
    "/j/shop/info/m/": "https://www.maiporter.de/versand-zahlung",
    "/j/shop/deliveryinfo": "https://www.maiporter.de/versand-zahlung",
    "/j/shop/withdrawal": "https://www.maiporter.de/widerrufsbelehrung",
    "/j/privacy": "https://www.maiporter.de/datenschutz",
  };

  document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    const isProductPage =
      currentPath === "/j/shop/info/m/" && searchParams.has("productId");

    if (isProductPage && redirects["/j/shop/info/m/"]) {
      window.location.href = redirects["/j/shop/info/m/"];
    } else if (redirects[currentPath]) {
      window.location.href = redirects[currentPath];
    }

    document.body.addEventListener(
      "click",
      function (e) {
        const target = e.target.closest("a");
        if (!target) return;

        try {
          const url = new URL(target.href, window.location.origin);
          const isProductClick =
            url.pathname === "/j/shop/info/m/" &&
            url.searchParams.has("productId");

          if (
            (isProductClick && redirects["/j/shop/info/m/"]) ||
            redirects[url.pathname]
          ) {
            e.preventDefault();
            window.location.href = isProductClick
              ? redirects["/j/shop/info/m/"]
              : redirects[url.pathname];
          }
        } catch (err) {}
      },
      true
    );
  });
})();

// ==========================================
// 10. TOOLTIPPS
// ==========================================
function removeTooltip() {
  const old = document.querySelector(".tooltipbox");
  if (old) old.remove();
}

function showTooltip(el) {
  removeTooltip();
  const tooltipText = el.getAttribute("data-tooltip") || el.getAttribute("data-text");
  const tooltipPic = el.getAttribute("data-pic");
  const tooltip = document.createElement("div");
  tooltip.className = "tooltipbox visible";

  if (tooltipPic) {
    tooltip.innerHTML = `
    <img src="${tooltipPic}" alt="" style="max-width:280px; height:auto; display:block; margin-bottom:0.4em;">
    ${tooltipText ? `<div>${tooltipText}</div>` : ""}
  `;
  } else if (tooltipText) {
    tooltip.textContent = tooltipText;
  }

  document.body.appendChild(tooltip);

  const rect = el.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();

  let top = rect.top + window.scrollY - tipRect.height - 8;
  let left = rect.left + window.scrollX + rect.width / 2 - tipRect.width / 2;

  left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
  if (top < window.scrollY + 8) {
    top = rect.bottom + window.scrollY + 8;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("tooltipwort")) {
    showTooltip(e.target);
  } else {
    removeTooltip();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tooltipwort").forEach((el) => {
    el.addEventListener("mouseenter", () => showTooltip(el));
    el.addEventListener("mouseleave", removeTooltip);
  });
});

// ==========================================
// 11. EASTEREGG- UND TEXT-AKKORDEON
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const akkordeonContainer = document.querySelectorAll(
    ".akkordeon-text, .akkordeon-text-easteregg"
  );

  akkordeonContainer.forEach(function (container) {
    const links = container.querySelectorAll("dt a");
    const isEasteregg = container.classList.contains(
      "akkordeon-text-easteregg"
    );
    const bgColor = isEasteregg
      ? "rgba(223, 251, 227, 0.7)"
      : "rgba(241, 245, 250, 0.7)";
    const bgColorTransparent = "rgba(241, 245, 250, 0)";

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        const dt = link.closest("dt");
        const dd = dt.nextElementSibling;
        const viewportWidth = window.innerWidth;

        let slideDownDuration, slideUpDuration;
        if (viewportWidth > 1200) {
          slideDownDuration = 1200;
          slideUpDuration = 300;
        } else if (viewportWidth > 800) {
          slideDownDuration = 1000;
          slideUpDuration = 250;
        } else if (viewportWidth > 500) {
          slideDownDuration = 800;
          slideUpDuration = 200;
        } else {
          slideDownDuration = 600;
          slideUpDuration = 150;
        }

        if (dd.style.display === "none" || !dd.style.display) {
          dd.style.display = "block";
          const maxHeight = dd.scrollHeight + "px";
          const animation = dd.animate(
            [
              { height: "0px", backgroundColor: bgColorTransparent },
              { height: maxHeight, backgroundColor: bgColor },
            ],
            {
              duration: slideDownDuration,
              easing: "ease-out",
              fill: "forwards",
            }
          );
          animation.onfinish = () => {
            dd.style.backgroundColor = bgColor;
          };
          link.classList.remove("closed");
          link.classList.add("opened");
          link.setAttribute("aria-expanded", "true");
        } else {
          const maxHeight = dd.scrollHeight + "px";
          const animation = dd.animate(
            [
              { height: maxHeight, backgroundColor: bgColor },
              { height: "0px", backgroundColor: bgColorTransparent },
            ],
            {
              duration: slideUpDuration,
              easing: "ease-in",
              fill: "forwards",
            }
          );
          animation.onfinish = () => {
            dd.style.display = "none";
            dd.style.backgroundColor = bgColorTransparent;
          };
          link.classList.remove("opened");
          link.classList.add("closed");
          link.setAttribute("aria-expanded", "false");
        }
      });
    });
  });
});

// ==========================================
// 12. PRODUKTTITEL H4 ZU H2 FÜR SEO
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".cc-shop-product-desc h4.fn").forEach(function (el) {
    const h2 = document.createElement("h2");
    Array.from(el.attributes).forEach((attr) => h2.setAttribute(attr.name, attr.value));
    h2.innerHTML = el.innerHTML;
    el.parentNode.replaceChild(h2, el);
  });
});