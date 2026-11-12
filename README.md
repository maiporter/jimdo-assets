# Jimdo V2-Layout-System & Komponenten-Bibliothek

Dieses System erweitert die Jimdo Creator Webpräsenz um ein optimiertes 12-Spalten-CSS-Grid und einen strikten 8px-vertikalen Rhythmus. Es isoliert neue Layouts von bestehendem Legacy-Content und bereitet den Content-Baum strukturell auf eine spätere WordPress-Migration (Gutenberg-Standard) vor.

---

## 1. Architektur & Kernkonzepte

- **Typografie & Rhythmus:** 8px-Rhythmus-System über CSS-Variablen (`--space-xs` bis `--space-xl`).
- **Jimdo-Override Strategy:** Einsatz von `!important` an kritischen Stellen, um Jimdos Inline-Styles und systemseitige Überschriften-Paddings gezielt zu überschreiben.

Mediencontainer <figure>

## Anmerkungen

content_area ist ein Jimdo Wrapper
