<script>
  (function() {
    function killJimdoStyles() {
      // Das sind die echten Dateinamen aus deinen Entwicklertools:
      const jimdoFiles = ["web.css"];

      // 1. Aus dem DOM löschen und deaktivieren
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (jimdoFiles.some(file => link.href.includes(file))) {
          link.disabled = true;
          link.remove();
        }
      });

      // 2. CSS-Regeln im Browser-Speicher deaktivieren
      for (let sheet of document.styleSheets) {
        try {
          if (sheet.href && jimdoFiles.some(file => sheet.href.includes(file))) {
            sheet.disabled = true;
          }
        } catch(e) {
          // Ignoriere CORS-Einschränkungen bei externen Sheets
        }
      }
    }

    // Sofort ausführen
    killJimdoStyles();

    // Sobald das DOM bereit ist, nochmals ausführen
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', killJimdoStyles);
    } else {
      setTimeout(killJimdoStyles, 100);
    }
  })();
</script>