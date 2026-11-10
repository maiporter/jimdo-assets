Gutschein-Code im Warenkorb automatisch ausfüllen
<script type="text/javascript">
  //<![CDATA[
  // Nur auf der Checkout-Seite ausführen
  if (window.location.href.includes("https://www.maiporter.de/j/checkout")) {
    document.addEventListener("DOMContentLoaded", function () {
      // Prüfe alle 500ms, ob das Feld existiert
      const checkCouponField = setInterval(function () {
        const couponField = document.querySelector(".j-checkout__input-field--coupon");
        if (couponField) {
          couponField.value = "Fahrrad-Alltagsfreude-Vervielfacher";
          clearInterval(checkCouponField); // Stoppe die Überprüfung
        }
      }, 500);
    });
  }
  //]]>
</script>