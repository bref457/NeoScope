# NeoScope

NeoScope ist ein schlankes, komplett clientseitiges Playground-Tool für HTML, CSS und JavaScript. Mit Live-Vorschau, Auto-Run und praktischen Komfortfunktionen kannst du schnell UI-Ideen testen oder Lerninhalte demonstrieren – direkt im Browser, ganz ohne Build-Setup.

- **Tabbed Editor**: Separate Bereiche für HTML, CSS und JS mit schneller Umschaltung.
- **Syntax-Highlighting**: CodeMirror (Material-Darker) sorgt für ein VS-Code-ähnliches Farbschema direkt im Browser (bei fehlender CDN-Verbindung fällt NeoScope automatisch auf die klassischen Textareas zurück).
- **Live-Preview**: Auto-Run (abschaltbar) rendert deine Änderungen sofort im iFrame.
- **Auto CSS-Stubs**: Neue Klassen aus dem HTML erhalten auf Wunsch automatisch CSS-Platzhalter.
- **CSS-Stubs-Button**: Mit einem Klick („CSS-Stubs“) alle neuen Klassen gezielt übernehmen – ideal, wenn Auto-Stubs deaktiviert sind.
- **Snippet-Verwaltung**: Lokale Speicherfunktion zum Anlegen, Laden und Löschen eigener Code-Schnipsel.
- **Export & Inspect**: HTML-Export auf Knopfdruck – die erzeugte Datei enthält dein CSS & JS inline – plus ein leichter Inspektionsmodus für DOM-Elemente.

## Schnellstart

```bash
git clone https://github.com/bref457/NeoScope.git
cd NeoScope
```

Anschließend einfach `index.html` in einem modernen Browser (Chrome, Edge, Firefox o. ä.) öffnen. Es ist kein Build- oder Server-Setup erforderlich.

## Tastenkürzel

- `Ctrl/Cmd + Enter`: Aktuellen Stand ausführen.
- `Ctrl/Cmd + S`: Snippet speichern.
- `Ctrl/Cmd + I`: Inspect-Modus aktivieren.

## Tech-Stack

- Reines HTML, CSS und JavaScript, ergänzt um CodeMirror 5 (CDN) für Syntax-Highlighting (optional, mit Fallback auf native Textareas).
- Speicherung der Snippets erfolgt ausschließlich lokal (LocalStorage).

## Mitwirken

Pull Requests sind willkommen! Melde Bugreports oder Ideen gerne über die GitHub-Issues.
