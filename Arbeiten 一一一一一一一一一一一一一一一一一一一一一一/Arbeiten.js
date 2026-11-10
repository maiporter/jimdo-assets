<script>
/* <![CDATA[ */
document.addEventListener("DOMContentLoaded", function() {
    // ⚙️ Einstellungen
    const lowStockThreshold = 5;       // ⚙️ Grenze für "begrenzt verfügbar"
    const lowStockMode = 1;           // ⚙️ 0 = "begrenzt", 1 = genaue Stückzahl
    const jimdoOffset = 1000;        
    const initialPreorderAmount = 5;  // ⚙️ Startmenge Vorbestellungen
    
    // Nutzer-Merker
    let userHasInteracted = false;

    const tryReplace = function() {
        const stockMeta = document.querySelector('meta[itemprop="value"]');
        const addToCartButton = document.querySelector('button.cc-shop-addtocard');
        const stockRaw = stockMeta ? parseInt(stockMeta.getAttribute("content"), 10) : null;

        if (stockRaw === null) return setTimeout(tryReplace, 300);

        // Berechne echten Lagerbestand
        const stock = stockRaw - jimdoOffset;
        
        // Reduziere angezeigte Menge bei Nutzerinteraktion
        let displayStock = stock;
        let displayPreorderAmount = initialPreorderAmount - (jimdoOffset - stockRaw);
        if (userHasInteracted) {
            if (stock > 0) displayStock -= 1;         // Für "Noch X verfügbar"
            else if (displayPreorderAmount > 0) displayPreorderAmount -= 1; // Für Vorbestellungen
        }

        // Status-Anzeige
        let statusHTML, buttonText, buttonDisabled = false;

        // Fall 1: Normal verfügbar
        if (displayStock > lowStockThreshold) {
            statusHTML = `
                <div class="status-output" style="margin: 2rem 0;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <img src="https://img-mp.maiporter.de/check-mark.png" alt="✔" style="width: 1.9rem;">
                        <span style="font-size: 1.9rem;">Lieferbar<\/span>
                    <\/div>
                <\/div>`;
            buttonText = "In den Warenkorb";
        } 
         // Fall 2: Begrenzt verfügbar  ⚙️  Datum  Nachschub
else if (displayStock > 0) {
    const knappText = (lowStockMode === 1) 
        ? `Nur noch ${displayStock} Stück verfügbar!<br>
           <img src="https://img-mp.maiporter.de/calendar.png" alt="📅" style="width: 1.9rem; vertical-align: middle; margin-right: 3px;"> Mitte Juli wieder <strong>${displayPreorderAmount} Stück<\/strong> am Lager. Zum Reservieren bitte kurze Mail an <a href="mailto:info@maiporter.de?subject=Produktreservierung">info@maiporter.de<\/a>` 
        : "Nur noch begrenzt verfügbar!";

    statusHTML = `
        <div class="status-output" style="margin: 2rem 0;">
            <div style="display: flex; align-items: flex-start; gap: 0.6rem;">
                <img src="https://img-mp.maiporter.de/flame.png" alt="⚠" style="width: 1.9rem; margin-top: 0.2rem;">
                <span style="font-size: 1.9rem; line-height: 1.3;">${knappText}<\/span>
            <\/div>
        <\/div>`;
    
    buttonText = "In den Warenkorb";
}

          // Fall 3: Kurzfristig Ausverkauft ⚙️  Datum erneuter Verfügbarkeit
        else if (displayPreorderAmount > 0) {
            statusHTML = `
                <div class="status-output" style="margin: 2rem 0; display: flex; flex-direction: column; gap: 0.6rem;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <img src="https://img-mp.maiporter.de/stop.png" alt="✖" style="width: 1.9rem;">
                        <span style="font-size: 1.9rem;">Aktuell ausverkauft<\/span>
                    <\/div>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <img src="https://img-mp.maiporter.de/calendar.png" alt="📅" style="width: 1.9rem;">
                        <span style="font-size: 1.9rem;">
                            Ab <strong>25.Juli<\/strong> wieder <strong>${displayPreorderAmount} Stück<\/strong> verfügbar, jetzt schon vorbestellbar.
                        <\/span>
                    <\/div>
                <\/div>`;
            buttonText = "Vorbestellen";
        }
        // Fall 4: Langfristig ausverkauft
        else {
            statusHTML = `
                <div class="status-output" style="margin: 2rem 0; display: flex; flex-direction: column; gap: 0.6rem;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <img src="https://img-mp.maiporter.de/stop.png" alt="✖" style="width: 1.9rem;">
                        <span style="font-size: 1.9rem;">Leider ausverkauft<\/span>
                    <\/div>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <img src="https://img-mp.maiporter.de/calendar.png" alt="📅" style="width: 1.9rem;">
                        <span style="font-size: 1.9rem;">
                            Bald wieder verfügbar, Termin gerne 
                            <a href="mailto:info@maiporter.de" style="text-decoration: underline;">anfragen<\/a>
                        <\/span>
                    <\/div>
                <\/div>`;
            buttonText = "Ausverkauft";
            buttonDisabled = true;
        }

        // Anzeige einfügen
        const insertAfter = document.querySelector(".cc-product-tax-and-shipping-info");
        let statusElement = document.querySelector(".status-output");
        if (!statusElement) {
            statusElement = document.createElement("div");
            insertAfter.insertAdjacentElement("afterend", statusElement);
        }
        statusElement.innerHTML = statusHTML;

        // Button anpassen
        if (addToCartButton) {
            const btnText = addToCartButton.querySelector('.cc-shop-addtocard-text');
            if (btnText) btnText.textContent = buttonText;
            addToCartButton.disabled = buttonDisabled;
            if (buttonDisabled) {
                addToCartButton.style.opacity = "0.7";
                addToCartButton.style.cursor = "not-allowed";
            }

            // Klick-Event: Reduziere Menge für Nutzer
            addToCartButton.addEventListener("click", function() {
                if (!userHasInteracted && (displayStock > 0 || displayPreorderAmount > 0)) {
                    userHasInteracted = true;
                    tryReplace(); // Aktualisiere Anzeige
                }
            });
        }
    };

    tryReplace();
});
/*]]>*/
</script>