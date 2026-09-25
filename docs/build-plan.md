# Build-Plan – vom heutigen Stand bis zum Release

Stand: 25.09.2026. Dieser Plan ersetzt die bisherige `docs/build-plan.md`, die nur die Content-Arbeit geordnet hat. Ihre bewährten englischen Content-Prompts stehen unverändert bzw. aktualisiert in **Anhang E**.

**Eine Regel vorweg: Die Reihenfolge dieser Datei ist die Reihenfolge.**
- Stufen haben Namen (`CI`, `STABIL-APP`, …), keine Nummern, weil Nummern früher auseinandergelaufen sind.
- Wer wissen will, was als Nächstes dran ist, liest die Tabelle in Abschnitt 2 von oben nach unten. Die erste Stufe ohne ✅ ist die nächste.

Dieser Plan ist auf Deutsch, weil du (David) ihn benutzt. Code, Content, Commits und die übrigen Docs bleiben Englisch.

**Inhalt**
0. Ziel und Leitplanken
1. So arbeitest du mit diesem Plan
2. Alle Stufen auf einen Blick
3. Stand heute
4. Entscheidungen
5. Phase A – Fundament
6. Phase B – Stabil
7. Phase C – Look & Feel
8. Phase D – Lernschleife und Spaß
9. Phase E – Inhalt Scalping: richtig, ehrlich, vollständig
10. Phase F – Beta 1
11. Phase G – Übungsinhalte
12. Phase H – Swing-Pfad
13. Phase I – Plattform
14. Phase J – Release
15. Phase K – Nach dem Release
16. Anhang A–F: Vorlagen, Prompts, Zuordnung der Review-Punkte

---

## 0. Ziel und Leitplanken

### Das Ziel (David, 25.09.2026)

1. **Der Lernende hat Spaß.**
2. **Nach dem Kurs braucht er nur noch praktische Erfahrung.** Das Wissen ist vollständig.
3. **Qualität geht vor Tempo.**

Daraus folgt für jede Stufe:

- **Ehrlich bleiben.**
  - Die App verspricht keinen Gewinn (`docs/agent.md` §1, §7).
  - „Nur noch Praxis“ heißt: Der Absolvent weiß alles, was er vor dem ersten echten Trade wissen muss.
  - Er weiß auch, dass Simulator und kleinste echte Größe unverzichtbar sind, und dass die App ihn nicht profitabel machen kann.
- **Varianz erklären, bevor sie passiert** (Abschnitt „Varianz“ unten). Sonst lernt man „richtig = Gewinn“, und das ist die gefährlichste Fehlprägung, die eine Trading-App haben kann.
- **Testen, bevor es weitergeht.**
  - Jede Stufe endet mit automatischen Checks (Claude) und einem Abnahmetest von dir.
  - Die nächste Stufe beginnt erst nach deinem `OK`.

### Absolventen-Profil – was „genug Wissen“ heißt

Ein Absolvent kann oder weiß Folgendes. Diese Liste prüft die Stufe `KNOWLEDGE` gegen den ganzen Kurs; was fehlt, wird ergänzt.

**Markt und Mechanik**
1. Wie ein Kurs entsteht: Bid, Ask, Spread, Orderbuch, Liquidität, Volatilität, Handelszeiten.
2. Welche Order wann passt: Market, Limit, marketable Limit, Stop-Market, Stop-Limit, Bracket/OCO.
3. Was ein Trade wirklich kostet (Spread, Slippage, Gebühren), und ob er sich danach noch lohnt.

**Lesen und Auswählen**

4. Charts lesen: Kerzen, Volumen, Struktur, Level, VWAP, Zeitebenen.
5. Auswählen: welche Aktie heute, welcher Tagestyp, Scanner und Watchlist, Katalysator.
6. Das eigene Playbook: Setups mit Kontext, Einstieg, Stop, Ziel und Invalidierung erkennen.

**Risiko und Kopf**

7. Positionsgröße aus Risiko *und* Konto, dazu R, Trefferquote und Erwartungswert.
8. **Varianz:** Eine gute Entscheidung ist kein gutes Ergebnis. Dazu gehören Stichprobengröße und Drawdown.
9. Tageslimits, Reset-Routine, Tilt an sich selbst erkennen.
10. Journal und Review: sich an eigenen Zahlen messen, nicht an einzelnen Trades.

**Der Schritt in die Praxis**

11. Kontoarten:
    - Cash- und Margin-Konto.
    - Leerverkauf braucht ein Margin-fähiges Konto.
    - Settlement.
    - Die PDT-Regel in den USA.
    - Was in Europa angeboten wird (Hebelprodukte erkennen, nicht nutzen).
12. Was man braucht: Echtzeitdaten, eine Order-Plattform, einen Simulator. Generisch, ohne Produktnamen.
13. Wie man einen Broker prüft: Regulierung, Einlagensicherung, Kostenstruktur, Ordertypen, Leerverkauf. Ohne Empfehlung.
14. Gewinne sind steuerpflichtig, und die Regeln unterscheiden sich je Land. Die Frage gehört an einen Steuerberater; die App nennt weder Regeln noch Sätze.
15. Der Weg in die Praxis:
    - 30 (Scalping) bzw. 90 (Swing) Tage Simulator nach Plan.
    - Dann die kleinste echte Größe.
    - Größer werden nur mit Belegen aus dem Journal.
16. Warnsignale: Signalgruppen, „Gurus“, Pump-and-Dump, Garantie- und Gewinnversprechen.

### Varianz – wie die App erklärt, dass richtige Entscheidungen verlieren

Heute enden von 338 richtigen Long-/Short-/Kauf-Entscheidungen nur 12 im Verlust, in Kapitel 1–4 keine einzige. Das lehrt „richtig = Gewinn“.

Künftig verlieren **30–40 %** der richtigen Richtungsentscheidungen, wie im echten Trading. Das allein würde aber verwirren. Deshalb gibt es fünf Bausteine, die zusammengehören:

1. **Vorher erklären.**
   - Neue Lektion **1·2-4 „Good Call, Bad Luck“** mit einem Varianz-Simulator (Stufe `VARIANCE`).
   - Der Lernende „handelt“ 10 Trades eines guten Setups, sieht Gewinner und Verlierer durcheinander, spielt es mehrmals und sieht dann 100 Trades.
   - Botschaft: Ein Trade sagt fast nichts; die Entscheidung zählt, das Ergebnis schwankt.
2. **In jeder Auflösung trennen** (`docs/UI.md` §5.1).
   - Oben die Bewertung der *Entscheidung*: grün, amber oder rot.
   - Darunter, kleiner, das *Ergebnis dieses Mal*: +/− $.
   - Bei „richtig, aber verloren“ zusätzlich ein Satz wie: „Richtige Entscheidung – dieser Trade hat trotzdem verloren. Das passiert bei diesem Setup etwa 4 von 10 Mal.“ Dazu ein Link „Warum?“ zur Karte aus 1·2-4.
3. **Richtig bleibt richtig.**
   - Eine richtige Entscheidung mit Verlust zählt voll als richtig: volle XP, kein Fehler, perfekter Lauf möglich.
   - Das Ergebnis beeinflusst keine Wertung.
4. **Langsam steigern** (`docs/agent.md` §3.11).
   - Kapitel 1 vor 1·2-4: keine Verlierer.
   - Kapitel 1 danach: ca. 20–30 %, nie zwei hintereinander.
   - Ab Kapitel 2: 30–40 %.
   - Ab Kapitel 3 hat jede Richtungsentscheidung einen sichtbaren Stop und ein Ziel, damit „vom Stop getroffen“ sichtbar ist.
5. **Immer wieder aufgreifen.**
   - Die Lektionszusammenfassung zeigt „Entscheidungen 7/8 richtig · Ergebnis: 4 Gewinner, 3 Verlierer“.
   - Die Statistik misst Entscheidungsqualität, nie Gewinn.
   - Kapitel 6 (Erwartungswert, Wahrscheinlichkeiten) nutzt den Simulator mit echten Zahlen.

### Spaß – woran wir ihn messen

In den Stufen von Phase C, Phase D und in der Beta wird dagegen geprüft:

- **Tempo:**
  - Eine Lektion dauert 3–4 Minuten, und kein Screen verlangt mehr als ~20 s ohne Interaktion.
  - Feedback kommt sofort (< 100 ms), Übergänge sind knackig (Ziel ≤ 250 ms, Entscheidung H).
- **Keine Sackgassen:** Fehler führen zu Wiederholung, nicht zu Sperren. Herzen gibt es nur in Tests.
- **Jede Lektion endet mit einem kleinen Gewinn:** Rückblick, Checkliste, eigener Plan, Serie.
- **Abwechslung:** ≥ 3 Fragetypen pro Lektion, Bilder statt Textfolien.
- **Sichtbarer Fortschritt:** Tagesziel in Worten, Serie mit Zuständen, Stufen, Trader Card.
- **Beta-Messlatte:**
  - Die Tester geben „Spaß“ im Schnitt ≥ 4 von 5.
  - Sie schließen ≥ 85 % der begonnenen Lektionen ab.
  - Sie beantworten die Verständnisfragen (Varianz, Positionsgröße) zu ≥ 80 % richtig.

### Definition of Done für Release v1.0

Alles muss gleichzeitig stimmen:

- **Inhalt:**
  - Kapitel 1, Scalping und (Entscheidung E) Swing sind vollständig.
  - Der Validator ist mit `--strict` grün.
  - Die Reviews `KNOWLEDGE` und `REVIEW-A` sind abgearbeitet, das Fachlektorat (`EXPERT`) ist erledigt.
- **App:**
  - 0 Abstürze im Render-Test aller Screens.
  - Crash-frei ≥ 99,5 % in der Beta.
  - Alle Muss-Punkte der Verbesserungsliste (`docs/review-2026-09-25.md`) sind erledigt.
- **Lernschleife:**
  - Herzen nur in Tests.
  - Übungs-Tab mit Herz-Refill, Review cards und Glossar.
  - Tagesziel, Serie und Erinnerungen.
  - Statistik mit Entscheidungsqualität.
- **Recht:**
  - Risikohinweis an allen Stellen aus `docs/agent.md` §7.
  - Legal-Seite, Impressum, Datenschutzerklärung und Nutzungsbedingungen, anwaltlich geprüft.
- **Store:**
  - Name, Icon, Screenshots, Texte DE/EN, Datenschutzangaben, Altersfreigabe.
  - TestFlight und Google-Play-Closed-Test (≥ 12 Tester, ≥ 14 Tage) bestanden.
- **Du hast jede Stufe abgenommen.**

---

## 1. So arbeitest du mit diesem Plan

### Ablauf einer Stufe

**Eine Stufe = eine Claude-Code-Sitzung = ein Pull Request.**

1. **Sitzung öffnen:** Claude Code (App oder claude.ai/code) → Repository `DavidMeier754/Trading-App` → neue Sitzung.
2. **Modell und Effort einstellen, bevor du den Prompt schickst:**
   - `/model opus` (= Opus 5.5), `/model fable` (= Fable 5.1, falls dein Abo es hat), `/model sonnet` (= Sonnet 5).
   - `/effort high`, `/effort xhigh` oder `/effort max`.
   - **Wichtig:** Opus 5.5 steht ab Werk auf `medium`. Setz den Effort jedes Mal bewusst.
   - Wo „Planmodus“ steht: Claude zeigt erst einen Plan, du liest ihn und gibst ihn frei.
3. **Prompt einfügen:** den Prompt der Stufe aus dem Codeblock, unverändert. Platzhalter in `[…]` füllst du aus.
4. **Claude arbeitet:**
   - auf dem Branch, den die Sitzung anlegt;
   - öffnet einen PR gegen `main`;
   - bringt alle Checks auf grün;
   - schreibt einen Bericht mit **deiner Test-Checkliste** und echten Links zur Vorschau.
5. **Du testest** auf dem Handy und antwortest:
   - `OK <STUFE> – merge` → Claude merged den PR, die Stufe bekommt ✅ in Abschnitt 2. Du kannst den PR auch selbst auf GitHub mergen.
   - oder eine Problemliste (Vorlage „Fehlerbericht“, Anhang A) → Claude behebt, du testest erneut.
6. **Nächste Stufe = neue Sitzung.** Frischer Kontext ist genauer und billiger.

### Welches Modell wofür

| Modell | Befehl | Wofür | Verbrauch |
|---|---|---|---|
| **Opus 5.5** | `/model opus` | Standard für Code und Inhalt, alles mit Urteilskraft | mittel |
| **Fable 5.1** | `/model fable` | Die schwersten Aufgaben: Wissens-Audit, Gesamt-Reviews, Designrichtungen. Nur wo der Plan es sagt. | hoch (≈ 2,5× Opus) |
| **Sonnet 5** | `/model sonnet` | Mechanische Arbeit nach klarem Muster (Konfiguration, Store-Metadaten) | niedrig |
| Haiku 4.5 | `/model haiku` | **Nie für Inhalte mit Zahlen.** Höchstens Tippfehler-Suche. | sehr niedrig |

Ist Fable 5.1 in deinem Abo nicht verfügbar, nimm dort Opus 5.5 mit `/effort max`.

### Welcher Effort wann

| Effort | Wann |
|---|---|
| `medium` | Nur kleine mechanische Sitzungen, nie Inhalte |
| `high` | Standard |
| `xhigh` | Design, Didaktik, rechtlich heikle Texte, Architektur |
| `max` | Audits, bei denen Korrektheit wichtiger ist als Zeit |

Tipp: Schreib `ultrathink` in eine einzelne Nachricht, wenn Claude an einer Stelle gründlicher nachdenken soll. Der Effort der Sitzung bleibt dabei gleich.

### Regeln für jede Sitzung

Diese Regeln stehen in `CLAUDE.md`; der Prompt muss sie nicht wiederholen.

- **Nur die eigene Stufe.** Was auffällt, aber zu einer späteren Stufe gehört, kommt in den Bericht, nicht in den Code.
- **Vor dem Bericht laufen die Standard-Checks** (unten), und alle sind grün.
- **Bericht auf Deutsch**, in dieser Reihenfolge:
  1. Was gebaut wurde.
  2. Ergebnisse der Checks.
  3. Deine Test-Checkliste mit echten Vorschau-Links.
  4. Offene Fragen.

  Danach **stoppt die Sitzung** und wartet auf dich.
- **Commits und PR-Texte auf Englisch** (Repo-Sprache). Content bleibt Englisch.
- **Nie direkt auf `main` pushen.** Immer PR, außer du sagst ausdrücklich etwas anderes.

### Standard-Checks

Claude führt sie vor jedem Bericht aus; ab Stufe `CI` laufen sie zusätzlich automatisch in jedem PR.

```bash
python3 tools/validate_content.py          # 0 Fehler
python3 tools/test_validate.py             # jede Validator-Regel feuert noch
python3 tools/check_sizing.py --summary    # 0 Positionen über dem Deckel
npm run typecheck                          # TypeScript sauber
npm run lint && npm test                   # ab Stufe CI
npm run smoke                              # ab Stufe WIRE: jeder Screen rendert
```

**Nach jeder Content-Stufe zusätzlich drei Handprüfungen.** Der Validator sieht diese Dinge nicht, und genau dort wurden früher echte Fehler gefunden:
1. Eine Chart-Aufgabe komplett nachrechnen.
2. Einen Callback gegen die Lektion prüfen, auf die er sich beruft.
3. Eine Lektion lesen wie ein Anfänger. Langeweile erzeugt keine Warnung.

### Wie du testest

- **Vorschau:**
  - Ab Stufe `CI` bekommt jeder PR einen Link (Web-Vorschau, fürs Handy).
  - Ab `CI` Teil B kommt ein QR-Code für Expo Go dazu: echte Haptik, echte Töne.
- **Deep-Links öffnen jeden Screen direkt:**
  - `<Vorschau>/#level-09-2/3` = Kapitel 1, Level 9, Lektion 2, Screen 3.
  - `#scalping-ch3-level-15-2/5` = Scalping Kapitel 3.
  - `#all-screens/12` = Test-Bench.
  - Anhängen `?look=arcade` = anderer Look.
- **Test-Werkzeuge** (nur in Test-Builds) unter Settings → Testing:
  - „Skip ahead“ springt zu jedem Level.
  - „Refill hearts“ füllt die Herzen.
  - Ab `LOOP-DAILY` gibt es „Tag vorspulen“.
- **Teste auf dem Handy**, nicht am PC. Die Checklisten unten sind dafür geschrieben.
- **Das Gefühl reicht.** Wenn dich etwas stört, du aber nicht weißt warum, beschreib es in Worten („zäh“, „billig“, „verwirrend“) mit Screen-Link.

### Wenn etwas schiefgeht

- **CI rot und Claude kommt nicht weiter:** Bericht mit Ursache, dann Stopp. Nicht drumherum bauen.
- **Eine Stufe wird zu groß:** Claude teilt sie, trägt den Rest als neue Stufe in diesen Plan ein (im selben PR) und fragt dich.
- **Eine Entscheidung fehlt:** Claude fragt, statt zu raten. Offene Entscheidungen stehen in Abschnitt 4.

---

## 2. Alle Stufen auf einen Blick

Spalte „Test“ = deine Zeit für die Abnahme. Sitzungen sind Schätzungen.

| Phase | Stufe | Was | Modell · Effort | Sitzungen | Test |
|---|---|---|---|---|---|
| A Fundament | `MERGE` ✅ | PR #13 (App) in `main` übernommen | – | – | – |
| | `DOCS` ✅ | Dieser Plan, Review-Bericht, alle Docs auf die Entscheidungen gebracht | – | – | Lesen |
| | `CI` | Automatische Checks, Lint, Unit-Tests, Test-Werkzeuge nur in Test-Builds, Vorschau-Link pro PR | Opus 5.5 · high | 1 | 15 min |
| | `WIRE` | Content-Index statt Handimporten, alle geschriebenen Kapitel spielbar, Render-Test aller Screens | Opus 5.5 · high | 1 | 20 min |
| B Stabil | `STABIL-APP` | Plan-Übersicht, Recap, Auflösung (Entscheidung vs. Ergebnis), Screenreader-Leck, Fehlerseite | Opus 5.5 · high | 1 | 20 min |
| | `STABIL-DATA` | Kurstabelle, Preislinien, Validator und Test-Bench nach Schema; Render-Test wird Pflicht | Opus 5.5 · high | 1 | 15 min |
| C Look & Feel | `LOOK-BRIEF` | Deine Kritik + drei Designrichtungen als klickbare Prototypen | Fable 5.1 · high (sonst Opus 5.5 · xhigh) | 1–2 | 30 min + Wahl |
| | `BRAND` | Name, Logo, Farben, Icon-Entwurf, Markenvorprüfung | Opus 5.5 · xhigh | 1 | 20 min + Wahl |
| | `LOOK-SYSTEM` | Farben, Schrift, Hell/Dunkel, ≤ 3 Looks, Daumenzone, Mindestschrift, Tempo, Tap-Flächen | Opus 5.5 · high, Planmodus | 1–2 | 30 min |
| | `LOOK-COMPONENTS` | Charts, Match, Abschluss-Screen, Icons, Visuals, Badge | Opus 5.5 · high | 2 | 30 min |
| | `VISUALS` | Neue Lerngrafiken: Kerzen-Anatomie, Trade-Plan | Opus 5.5 · high | 1 | 15 min |
| D Lernschleife | `LOOP-HEARTS` | Herzen nur in Tests, Fehler-Runde, Review cards, Test-Auswertung, XP-Regeln | Opus 5.5 · high, Planmodus | 1–2 | 30 min |
| | `LOOP-DAILY` | Tagesziel wählbar, Serie mit Zuständen, Freeze, Wochen-Challenge, Erinnerungen | Opus 5.5 · high | 1–2 | 20 min + 3 Tage |
| | `ONBOARDING` | Einstieg, Risikohinweis, Legal-Gerüst, Marktprofil + Zahlenformat, Plan-Karte, i18n | Opus 5.5 · high | 1–2 | 20 min |
| | `PRACTICE` | Übungs-Tab mit Wiederholsystem, schwache Konzepte, Herz-Refill | Opus 5.5 · xhigh, Planmodus | 2 | 30 min + 1 Woche |
| | `GLOSSARY` | Glossar-Inhalt (alle Begriffe), Popover, Liste | Opus 5.5 · high | 1–2 | 15 min |
| | `STATS` | Profil, Statistik, Trader Card v1, Entscheidungsqualität | Opus 5.5 · high | 1 | 15 min |
| | `FUN-PASS` | Spaß-Audit mit Laientest, dann Feinschliff | Fable 5.1 · high (sonst Opus 5.5 · xhigh) | 1–2 | 45 min |
| E Inhalt Scalping | `RULES` | Neue Validator-Regeln + Befundliste je Kapitel | Opus 5.5 · high | 1–2 | 10 min |
| | `VARIANCE` | Varianz-Simulator, Lektion 1·2-4, Zusammenfassung „Entscheidung vs. Ergebnis“ | Opus 5.5 · xhigh | 1–2 | 30 min + Laientest |
| | `OFFER` | Kapitel 8 Level 15 (Kontoarten, Margin, PDT, Settlement, Steuer-Hinweis) + Umnummerierung + Marktprofile | Opus 5.5 · xhigh | 1–2 | 20 min |
| | `CONTENT-FIX-1` … `-8` | Pro Kapitel alle Inhaltskorrekturen | Opus 5.5 · high | 8–12 | je 20 min |
| | `KNOWLEDGE` | Wissens-Audit gegen das Absolventen-Profil (Review B) | Fable 5.1 · max (sonst Opus 5.5 · max) | 1 | Befunde entscheiden |
| | `KNOWLEDGE-FIX` | Fehlendes Wissen ergänzen | Opus 5.5 · high | 1–3 | 20 min |
| | `REVIEW-A` | Didaktik-Review des ganzen Pfads, danach Korrekturen | Fable 5.1 · high (sonst Opus 5.5 · max) | 1 + 1–3 | Befunde entscheiden |
| | `EXPERT` | Fachlektorat durch einen erfahrenen Trader (Mensch) | – | – | organisieren |
| F Beta 1 | `LEGAL-DRAFT` | Entwürfe: Impressum, Datenschutz, Nutzungsbedingungen, Disclaimer + Webseite | Opus 5.5 · high | 1 | Lesen + Daten |
| | `STORE-SETUP` | Entwicklerkonten, EAS-Builds, TestFlight, Play Internal | Sonnet 5 · high | 1 | 30 min Setup |
| | `ANALYTICS` | Absturzberichte, datensparsame Lernauswertung (Opt-in), „Fehler melden“ | Opus 5.5 · high | 1 | 10 min |
| | `BETA-1` | 10–30 Tester, 2–4 Wochen, wöchentliche Auswertung und Fixes | Opus 5.5 · high je Runde | 2–4 | Tester betreuen |
| G Übung | `REPLAY-PILOT` | Ein Replay von Hand + Validator-Regeln | Opus 5.5 · high | 1 | 10 min |
| | `SPOT-IT` | Replay-Tab in der App | Opus 5.5 · high | 1 | 20 min |
| | `DRILLS` | Die zwei Packs `selection`, `risk-calls` | Opus 5.5 · high | 1 | 10 min |
| | `REPLAY-BANK` | 22 Replays für Scalping | Opus 5.5 · high | ~8 | je 10 min |
| H Swing | `SWING-2` … `SWING-8` | Swing-Kapitel 2–8 | Opus 5.5 · high | 7–14 | je 20 min |
| | `SWING-REVIEW` | Review A + B für Swing, danach Korrekturen | Fable 5.1 · high/max | 2–4 | Befunde entscheiden |
| I Plattform | `BACKEND` | Konto + Sync (Entscheidung K) | Opus 5.5 · xhigh, Planmodus | 2–3 | 20 min |
| | `MONEY` | Bezahlmodell (Entscheidung I) | Opus 5.5 · high | 1–2 | 20 min |
| | `UPDATES` | Inhalte ohne Store-Update, Fortschritts-Migration, Nachladen | Opus 5.5 · high | 1 | 15 min |
| | `TECH` | Aufräumen mit Messwert: Bundle, Startzeit, Chart.tsx | Opus 5.5 · high | 1–2 | 10 min |
| J Release | `A11Y-PERF` | Barrierefreiheit und Tempo auf echten Geräten | Opus 5.5 · high | 1 | 30 min |
| | `LEGAL-FINAL` | Anwaltliche Prüfung, Texte final | – (Mensch) | – | organisieren |
| | `STORE-LISTING` | Screenshots, Texte DE/EN, Datenschutzangaben, Altersfreigabe | Sonnet 5 · high | 1 | 30 min |
| | `BETA-2` | Release-Kandidat, Closed Test ≥ 12 Tester × 14 Tage | Opus 5.5 · high je Runde | 1–3 | 2–4 Wochen |
| | `RELEASE` | Einreichen, Review, Launch, erste Woche beobachten | Opus 5.5 · high | 1–2 | Launch |
| K Danach | `DAY-TRADING`, `DEUTSCH`, `FREUNDE`, … | Siehe Phase K | – | – | – |

**Meilensteine**
- Nach Phase E: ein vollständiger, ehrlicher Scalping-Kurs.
- Nach `BETA-1`: echtes Feedback von Fremden.
- Nach `RELEASE`: v1.0 im Store.

Insgesamt sind es grob 70–100 Sitzungen. Die Summe hängt vor allem an Entscheidung E (Swing vor oder nach v1.0).

---

## 3. Stand heute (25.09.2026, gemessen)

| | |
|---|---|
| Content | Kapitel 1 (48 Lektionen, inkl. Pfadwahl) + Scalping-Kapitel 2–8 (340) = **388 Lektionen, 5.109 Screens**. Day Trading und Swing: nur gegliedert (`docs/curriculum.md`). |
| Lücken im Content | Kapitel 8 Level 15 fehlt (4 Lektionen, Stufe `OFFER`). Lektion 1·2-4 (Varianz) ist neu geplant (Stufe `VARIANCE`). |
| App | Seit dem Merge von PR #13 (25.09.2026) in `main`. Spielt Kapitel 1 + Scalping Kapitel 2 Level 1–3 (**58 Lektionen, 783 Screens**) ohne Absturz. Der Rest ist geschrieben, aber nicht eingebunden (Stufe `WIRE`). |
| Render-Test aller 5.109 Screens | **40 Abstürze** (alle `depth-ladder`, 38 Lektionen, darunter 3 Final Exams) und **15 Screens mit fehlender Preislinie** (`NaN`). Beides wird in `STABIL-DATA` behoben. |
| Tools | Validator: 0 Fehler, 3 Warnungen. Self-Test 110/110. Sizing: 0 von 572 Positionen über dem Deckel. |
| Fehlt komplett | CI, App-Tests, Onboarding, Risikohinweis, Rechtstexte, Glossar, Übungs-Tab, Statistik, Backend, Store-Setup, Branding |
| Review | `docs/review-2026-09-25.md`: 17 Muss-, 54 Sollte-, 14 Kann-Punkte, 25 Doku-Punkte (W). Jeder Punkt ist in Anhang F einer Stufe zugeordnet. |

---

## 4. Entscheidungen

### 4.1 Getroffen

| # | Entscheidung | Wo festgehalten |
|---|---|---|
| A | **Der Kurs endet bei einer Person, die starten kann, nicht nur bei einem Papier-Prozess.** Aus deinem Ziel „nach dem Kurs nur noch praktische Erfahrung“: Der Kurs vermittelt alles Wissen bis zum ersten echten Trade (Absolventen-Profil, Punkte 11–16). Weiterhin gilt: keine Produktnamen, keine Empfehlung, keine Gewinnversprechen, der Simulator kommt zuerst. | `docs/agent.md` §1.1 |
| B | **123 Shorts, Option (a):** Wir nennen das Konto und behalten die Inhalte. Leerverkauf braucht ein Margin-fähiges Konto; das steht in 1·12, 1·13 und 8·15. | `docs/agent.md` §3.6 |
| C | **Sechs Trades pro Sitzung, Option (b): Wir sagen es klar.** Mehrere Day-Trades pro Sitzung brauchen ein Margin-Konto, und in den USA greift unter 25.000 $ die PDT-Regel (vor Release prüfen, die Regel ist in Reform). Für EU-DE gilt keine PDT-Regel, aber Brokerregeln unterscheiden sich. Steht in 6·9 und 8·15. | `docs/agent.md` §3.6 |
| W1 | **Herzen nur noch in Checkpoints und Final Exams.** Lektionen sind zum Üben da: Falsche Antworten kommen in der Fehler-Runde am Ende wieder (W25). | agent.md, UI.md §5.2 |
| W2 | **Diese Reihenfolge:** App stabil und schön vor neuem Content, Swing vor Replays/Drills. | dieser Plan |
| W3 | **50 %-Planwert, Option (a):** Kapitel 1 bleibt bei 50. Der Scalping-Pfad revidiert den Wert in **2·1-4** mit Begründung auf 95 (bisher war die Revision für Kapitel 3 vorgesehen, existiert aber im Content nicht). | agent.md §3.6, curriculum.md |
| W4–W6 | **Layout und Looks:** Antworten in der Daumenzone. Mindestschrift, notfalls scrollen. Höchstens 3 Looks plus Hell/Dunkel/System. | UI.md §2, §10 |
| W7 | **Kein Leaderboard in v1.0.** Später höchstens als Freundesliga mit Opt-in. | UI.md §7.2, §11 |
| W8 | **„Karte nochmal ansehen“** als Overlay in Lektionen. | UI.md §2 |
| W9 | **Tagesziel wählbar** (1/2/3 Lektionen, Standard 2). Die Serie zählt, wenn das eigene Ziel erreicht ist. | agent.md, UI.md §5.3 |
| W10 | **Fließtext ≤ 150 Zeichen** pro Screen. | agent.md §3.9, UI.md §9 |
| W11 | **Wiederholungen geben ¼ XP**, „Skip ahead“ gibt keine XP. | UI.md §5.3 |
| W12–W14 | **Varianz-Regel, Vorzeichen-Regel, Recap-Verweis.** | agent.md §3.11/§3.12, schema.md |
| W15 | **Match:** Ein Fehltipp ergibt amber (zählt als richtig), ab zwei Fehltipps ist es falsch. | UI.md §4.1 |
| W16–W18 | **US-Englisch.** Label „Takeaway“ für Abschluss-Screens. Skills aufgeräumt, `docs/` gehen vor Skills. | agent.md, schema.md, CLAUDE.md |
| W19 | **Alle UI-Texte über i18n-Schlüssel** (ab `ONBOARDING`). Deutsch als zweite Sprache nach dem Release. | agent.md §1 |
| W20 | **Maskottchen bleibt gestrichen.** Nicht empfohlen, jederzeit neu entscheidbar. | agent.md §1 |
| W21–W25 | **Inhalt und Checks:** Erklärung pro falscher Option. Neue Validator-Regeln (Tells, Formate). Bildquote. App-Checks in CLAUDE.md. Fehler-Runde. | schema.md, agent.md, CLAUDE.md, UI.md §4.5 |

### 4.2 Offen – mit der Stufe, die darauf wartet

| # | Frage | Meine Empfehlung | Spätestens vor |
|---|---|---|---|
| E | Release-Umfang: v1.0 mit Scalping **und** Swing, oder nur Scalping? | **Mit Swing.** Kapitel 1 schickt Berufstätige selbst zu Swing, und für EU-Kleinanleger ist Kassa-Scalping kaum machbar (`docs/agent.md` §7). | Phase H (nach `BETA-1`) |
| H | Tempo der Animationen: Doku (≤ 250 ms) oder das heutige, langsamere Gefühl? | ≤ 250 ms | `LOOK-BRIEF` zeigt beides |
| I | Bezahlmodell: Abo, Freemium, Einmalkauf? Was ist gratis? | Kapitel 1 + 2 gratis, danach Abo. **Nie** Herzen oder Serien-Reparaturen verkaufen: In einer Trading-App wirkt das wie Glücksspiel-Mechanik. | `MONEY` |
| K | Konto/Login in v1.0? | **Nein.** Lokal speichern, Backup übers Handy (iCloud/Android-Backup). Login + Sync ab v1.1. Das spart viel DSGVO-Aufwand. | `BACKEND` |
| L | Name und Marke | Entscheidest du in `BRAND` | `BRAND` |
| M | Zielmärkte und Store-Sprachen (DE? EU? US?) | Start DE/AT/CH + EU, Store-Texte DE + EN | `STORE-LISTING` |
| N | Wer macht Fachlektorat und Rechtsprüfung? | Ein erfahrener Trader bzw. eine Kanzlei mit Schwerpunkt IT-/Finanzrecht | `EXPERT`, `LEGAL-FINAL` |
| O | Beta-Tester: wer und wie viele? | ≥ 12 (Google-Pflicht für neue private Entwicklerkonten), davon mindestens 3 ohne Trading-Vorwissen | `BETA-1` |
| P | Wer ist Anbieter im Impressum (Privatperson oder Gewerbe)? Steuern? | Mit Steuerberater klären. Das ist keine Frage für Claude. | `LEGAL-DRAFT` |


---

## So ist jede Stufe beschrieben

- **Ziel:** was danach anders ist.
- **Umfang:** was gebaut wird, mit Review-Nummern (`M…`, `S…`, `K…`, `W…` aus `docs/review-2026-09-25.md`).
- **Nicht in dieser Stufe:** wo nötig.
- **Du bereitest vor:** falls etwas von dir gebraucht wird.
- **Modell · Effort · Sitzungen.**
- **Prompt:** zum Kopieren.
- **Claude prüft automatisch.**
- **Du testest:** deine Checkliste. Die genauen Links schreibt Claude in den Bericht.
- **Fertig, wenn.**

Alle Prompts folgen demselben Rahmen (Anhang E.0). Deshalb sind sie kurz: Die Details stehen in dieser Datei, und Claude liest sie.

---

## 5. Phase A – Fundament

### `MERGE` ✅ – PR #13 in `main`

Am 25.09.2026 übernommen (Merge-Commit `52f0811`). Seitdem enthält `main` die App und den aktuellen Stand aller Docs.

### `DOCS` ✅ – Plan und Doku

Ebenfalls am 25.09.2026 erledigt:
- dieser Plan;
- der Review-Bericht als `docs/review-2026-09-25.md`;
- alle Entscheidungen aus Abschnitt 4.1 in `docs/agent.md`, `docs/UI.md`, `docs/schema.md`, `docs/curriculum.md`, `README.md`, `README-app.md` und `CLAUDE.md`;
- die Skills aufgeräumt (W18).

### `CI` – automatische Prüfungen und Vorschau

**Ziel.**
- Kein Fehler kommt mehr unbemerkt nach `main`.
- Du kannst jeden PR auf dem Handy testen.

**Umfang**
1. **GitHub Actions `ci.yml`** bei jedem PR und jedem Push auf `main`:
   - Python: `validate_content.py` (0 Fehler), `test_validate.py`, `check_sizing.py --summary` (0 Verstöße), `build_drill_batch.py --check`.
   - Node 22: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, Web-Build (`npx expo export --platform web`).
   - Laufzeit unter 10 Minuten, mit Caches. Hintergrund: Private Repos haben bei GitHub Free 2.000 Actions-Minuten pro Monat.
2. **ESLint** (Expo-Konfiguration) und **Prettier**. Prettier prüft nur; das einmalige Formatieren des Bestands ist ein eigener Commit.
3. **Jest** (`jest-expo`) mit ersten Unit-Tests für die heikelsten Stellen:
   - `src/lesson/answers.ts`: jeder Fragetyp richtig, falsch, amber.
   - `parseNumeric`: Punkt vor Strich, Minus, Dezimalstellen.
   - `src/progress.ts`: Herz genau nach 4 h, Serie über Tagesgrenzen und Zeitzonen, XP mit Perfekt-Bonus.
4. **Test-Werkzeuge nur in Test-Builds** (S41):
   - `EXPO_PUBLIC_TEST_TOOLS=1` schaltet Skip ahead, Refill hearts und die Test-Bench frei. Release-Builds zeigen sie nicht (`docs/UI.md` §11.5).
   - `skipTo` vergibt keine XP mehr (W11).
5. **Vorschau pro PR, Teil A (Pflicht):** Cloudflare Pages.
   - Kostenlos, funktioniert mit privaten Repos, baut jeden PR automatisch und schreibt den Link in den PR.
   - Build-Befehl: `npx expo export --platform web --output-dir dist`.
   - Ausgabeordner: `dist`.
   - Umgebungsvariablen: `NODE_VERSION=22`, `EXPO_PUBLIC_TEST_TOOLS=1`.
6. **Vorschau in Expo Go, Teil B** (empfohlen, spätestens vor `LOOK-SYSTEM`):
   - EAS Update pro PR mit einem QR-Code-Kommentar (`expo/expo-github-action`). Damit spürst du echte Haptik und hörst echte Töne.
   - Falls Expo Go die SDK-Version nicht lädt: ein Android-Preview-Build (`eas build --profile preview`). iOS kommt dann mit `STORE-SETUP` über TestFlight.
7. **Pflege:**
   - `.github/pull_request_template.md` mit den Feldern Stufe, Was, Checks, Test-Checkliste (S53).
   - In `package.json`: `"private": true` und `"license": "UNLICENSED"` statt ISC (S44).

**Du bereitest vor.** Claude schreibt dir im Bericht die genaue Klick-Anleitung.
- Cloudflare-Konto anlegen und das Pages-Projekt mit dem GitHub-Repo verbinden (ca. 10 Minuten).
- Optional für Teil B: Expo-Konto anlegen, einen Access Token erzeugen und ihn als GitHub-Secret `EXPO_TOKEN` speichern.
- Empfohlen: GitHub → Settings → Branches → Regel für `main` → „Require status checks to pass“.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe CI aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „CI“ vollständig.
Setze genau diesen Umfang um – nichts aus späteren Stufen.

Besonders wichtig:
- Die Actions bleiben unter 10 Minuten (Caches), das Repo ist privat.
- Formatiere Bestandscode mit Prettier nur in einem eigenen Commit.
- Die Unit-Tests testen Grenzfälle (Minus, Tageswechsel, Herz genau nach 4 h), nicht nur den Normalfall.
- Baue einmal absichtlich einen Validator-Fehler ein, zeige, dass die CI rot wird, und entferne ihn wieder.
- Schreib mir die Klick-Anleitung für Cloudflare Pages (und Expo, falls du Teil B schaffst) Schritt für Schritt.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · meine Test-Checkliste mit echten Links · was ich einrichten muss · offene Fragen. Dann stopp.
```

**Claude prüft automatisch.**
- Alle Standard-Checks.
- CI im PR grün.
- Mindestens 30 Unit-Tests.
- Der Web-Build läuft durch.

**Du testest (~15 Min.)**
1. Im PR auf GitHub unter „Checks“: alles grün (Python, TypeScript, Lint, Tests, Build).
2. Vorschau-Link auf dem Handy öffnen: Die App startet, Lektion 1-1 lässt sich spielen.
3. In der Vorschau: Account → Settings → „Testing“ ist da, „Skip ahead“ funktioniert.
4. (Teil B) QR-Code mit Expo Go scannen: Die App läuft, Haptik ist spürbar.
5. Im Bericht: Der absichtlich rote Lauf ist zu sehen.

**Fertig, wenn** jeder PR grüne Checks und einen Vorschau-Link hat und du den Link auf dem Handy geöffnet hast.

### `WIRE` – alles einbinden, jeden Screen testen

**Ziel.**
- Alles, was geschrieben ist, ist spielbar.
- Ein Test öffnet jeden einzelnen Screen.

**Umfang**
1. **Generierter Content-Index statt 58 Handimporten** (M13, S38):
   - `npm run gen:content` baut aus `content/**` den Index aller Lektionen, Kapitel und Einträge.
   - `src/content.ts` nutzt ihn.
   - CI prüft, dass der Index aktuell ist.
2. **Alle Scalping-Kapitel 2–8 auf der Karte.** Kapitel 8 Level 15 kommt mit `OFFER`.
3. **Pfadwahl ehrlich machen** (S27): Day und Swing zeigen weiter „Being written“, jetzt mit einem ehrlichen Satz.
   - Scalping braucht Zeit zur Börseneröffnung.
   - Wer die nicht hat, merkt sich Swing vor. Das ist ein lokaler Merker, die Erinnerung kommt ab `LOOP-DAILY`.
4. **Ende des Inhalts gestalten** (S26): kein „soon“ ohne Kontext, sondern ein ehrlicher Satz und später der Weg zum Üben.
5. **Render-Test `npm run smoke`** (Playwright, Chromium):
   - Baut den Web-Export mit Test-Werkzeugen und öffnet **jeden** Screen per Deep-Link.
   - Meldet Abstürze (Fehlerseite), Konsolenfehler (z. B. `NaN`) und leere Screens.
   - Schreibt `smoke-report.json` und einen Kontaktbogen je Kapitel als CI-Artefakt.
   - Mit `?test=1` sind die Animationen aus. Ziel: alle Screens in unter 10 Minuten.
6. **CI-Job „render“:**
   - Läuft bei Änderungen in `src/`, `content/` und `demo/`; bei reinen Content-PRs nur für die betroffenen Kapitel.
   - Bis `STABIL-DATA` ist er **nicht blockierend** (die 40 bekannten Abstürze), danach Pflicht.
7. **Untertitel der Test-Bench** („all 36 archetypes“) auf die echte Anzahl korrigieren (S51).

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe WIRE aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „WIRE“ vollständig, dazu docs/UI.md §7.1 und §11.4.
Setze genau diesen Umfang um – nichts aus späteren Stufen.

Besonders wichtig:
- Der Fortschritt bestehender Spieler darf nicht verloren gehen: Die Eintrags-IDs der schon eingebundenen Lektionen bleiben gleich.
- Der Render-Test muss jeden Screen jeder Lektion öffnen – zähle sie und vergleiche mit `python3 tools/validate_content.py --status`.
- Bis STABIL-DATA ist der Render-Job nicht blockierend; sein Bericht steht trotzdem im PR.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse (inkl. Render-Zahlen) · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Claude prüft automatisch.**
- Alle Standard-Checks.
- `npm run smoke` meldet genau die bekannten Probleme (40 Abstürze, 15 `NaN`) und keine neuen.

**Du testest (~20 Min.)**
1. Karte: Kapitel 1–8 sind da; spätere Kapitel sind wie gewohnt gesperrt.
2. Settings → Testing → Skip ahead → Kapitel 5 Level 3: eine Lektion spielen.
3. Kapitel 3 Level 15 öffnen: Die Fehlerseite ist hier **noch erwartet** und wird in `STABIL-DATA` behoben.
4. Im PR: Der Job „render“ zeigt die Zahlen, und die Kontaktbögen liegen als Artefakt bei.
5. App-Start auf dem Handy: gefühlt unter 3 Sekunden?

**Fertig, wenn** jede geschriebene Lektion über die Karte erreichbar ist und der Render-Test in CI berichtet.

---

## 6. Phase B – Stabil

### `STABIL-APP` – die sichtbaren Fehler

**Ziel.**
- Die Fehler aus dem Review sind weg.
- Die Auflösung trennt Entscheidung und Ergebnis. Das ist die Grundlage für den Varianz-Unterricht.

**Umfang**
1. **Plan-Übersicht** zeigt den gespeicherten Plan (M1).
2. **Recap öffnet die richtige Karte** (M4):
   - Der Renderer nutzt `points[].card` (neues Feld, `docs/schema.md`).
   - Fehlt es, nimmt er die Karte der Lektion, deren Text am besten passt.
   - Die `card:`-Angaben im Content ergänzt `CONTENT-FIX`.
3. **Auflösung nach `docs/UI.md` §5.1** (M5, M7):
   - Oben die Bewertung der Entscheidung (grün, amber, rot).
   - Der Einleitungssatz passt zur *gewählten* Option: nie „Standing aside costs nothing“ nach einem Kauf.
   - Der `outcome`-Satz aus der YAML wird angezeigt.
   - Das Ergebnis „dieses Mal“ steht klein darunter, mit Aktienzahl („+$45.00 on 250 shares“).
   - Hast du abgewartet, steht es grau und hypothetisch da („Had you bought: …“).
   - Neuer Zustand „richtig, aber verloren“ mit dem Varianz-Satz aus §5.1. Der Link „Warum?“ folgt in `VARIANCE`.
   - Einzige Content-Änderung dieser Stufe: Die Erklärung in 1·1-1 S6 passt künftig zu beiden Wahlen.
4. **Web-Barrierefreiheit** (M6):
   - Screenreader lesen die Lösung nicht mehr vorab (Mess-Kopie mit `aria-hidden` oder außerhalb des Baums).
   - Das Lösungswort von `fill-tiles` steht nicht mehr im DOM.
5. **Fehlerseite statt Sackgasse** (S23):
   - Freundlicher Text und „Zurück zur Karte“.
   - Technische Details nur in Test-Builds.
   - Anschluss für Fehlerberichte (verdrahtet in `ANALYTICS`).
   - Testroute `#debug-crash`, nur in Test-Builds.
6. **Unit-Tests** für die Auflösungslogik: jede Kombination aus Wahl, Bewertung und Ergebnis.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe STABIL-APP aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1, Abschnitt 0 „Varianz“ und den Abschnitt „STABIL-APP“ vollständig, dazu docs/UI.md §5.1 und in docs/review-2026-09-25.md die Punkte M1, M4–M7 und S23.
Setze genau diesen Umfang um – nichts aus späteren Stufen.

Besonders wichtig:
- Die Auflösung muss für jede Kombination stimmen: richtig/amber/falsch × Gewinn/Verlust × gehandelt/abgewartet. Lege dafür eine Tabelle in die Tests.
- Einzige Content-Änderung: level-01-1 Screen 6. Sonst kein Content.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Claude prüft automatisch.**
- Alle Standard-Checks.
- Die neuen Unit-Tests.
- Der Render-Test ohne neue Probleme.

**Du testest (~20 Min.)**
1. `#level-09-2/3` → **Buy**. Erwartet:
   - Bewertung amber („Reasonable“).
   - Der erste Satz spricht vom Kauf.
   - Der Satz über die drei Preisstufen beim Verkaufen ist zu lesen.
   - „+$45.00 on 250 shares“ steht klein darunter.
2. `#level-09-2/3` → **Wait**: grün; das Ergebnis steht grau als „hätte“.
3. `#level-01-1/6` → **Wait**: Kein „you just made your first trade“ mehr.
4. Skip ahead zu Level 16, Lektion 16-2 bis zum Ende spielen und den Plan ausfüllen: Die Übersicht zeigt deine Einträge.
5. Lektion 1-4 bis zum Recap spielen, den ersten Merksatz antippen: Die passende Karte öffnet sich.
6. `#debug-crash`: freundliche Fehlerseite; „Zurück zur Karte“ funktioniert.
7. (Optional, iPhone) VoiceOver an und eine Frage in der Web-Vorschau: Vor dem Antworten wird keine Erklärung vorgelesen.

**Fertig, wenn** alle sieben Punkte stimmen.

### `STABIL-DATA` – Schema, Renderer und Validator sagen dasselbe

**Ziel.** Jeder der 5.109 Screens rendert, und das bleibt so.

**Umfang**
1. **`depth-ladder`** (M2):
   - Der Renderer liest `data.bids` und `data.asks` wie in `docs/schema.md`.
   - Die Test-Bench (`demo/all-screens.yaml`) wird aufs Schema umgestellt; sie hatte den Fehler versteckt.
2. **`levels`** (M3):
   - Der Renderer erwartet `{price, label}`.
   - Die 29 nackten Zahlen in 13 Dateien werden umgeschrieben, rein mechanisch.
3. **Validator** (S39):
   - Prüft die Datenform jeder Komponente laut Tabelle in `docs/schema.md`, mindestens `levels`, `depth-ladder`, `order-book` und die Charts.
   - Prüft `demo/all-screens.yaml` mit.
   - Für jede neue Prüfung gibt es einen Fall in `tools/test_validate.py`.
4. **Der Render-Test wird Pflicht:** 0 Abstürze, 0 Konsolenfehler, 0 leere Screens.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe STABIL-DATA aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „STABIL-DATA“ vollständig, dazu docs/schema.md vollständig.
Setze genau diesen Umfang um – nichts aus späteren Stufen.

Besonders wichtig:
- Wenn Schema und Renderer sich widersprechen, gewinnt das Schema – außer das Schema ist nachweislich falsch; dann erst das Schema ändern und es im Bericht begründen.
- Die Content-Änderungen sind rein mechanisch (Form der Daten), keine Zahlen, keine Texte.
- Am Ende ist der Render-Job blockierend und grün.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse (Render-Zahlen vorher/nachher) · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Claude prüft automatisch.**
- Alle Standard-Checks.
- Der Render-Test mit 0 Problemen.
- Neue Validator-Fälle feuern.

**Du testest (~15 Min.)**
1. Skip ahead → Kapitel 3 Level 15 → Lektion 15-2: Die Kurstabelle lässt sich bedienen.
2. Das Final Exam von Kapitel 3 (Level 19) durchspielen: keine Fehlerseite.
3. `#scalping-ch5-level-07-2/9`: Die markierten Preislinien sind sichtbar.
4. Im PR: Der Job „render“ ist grün und meldet 0 Abstürze.

**Fertig, wenn** der Render-Test blockierend und grün ist.

---

## 7. Phase C – Look & Feel

Du bist mit dem Aussehen noch nicht zufrieden. Deshalb kommt Look & Feel **vor** den neuen Lernfunktionen, und es fängt mit dir an, nicht mit Code.

### `LOOK-BRIEF` – deine Kritik und drei Richtungen

**Ziel.** Festlegen, wie die App aussehen und sich anfühlen soll, bevor irgendetwas umgebaut wird.

**Du bereitest vor.** Das ist der wichtigste Teil. Schreib deine Kritik nach dieser Vorlage und füge sie unter den Prompt:
```
Was mich stört (Screen-Link + ein Satz):
- …
So soll es sich anfühlen (3 Wörter):
Apps, deren Look ich mag – und was genau daran:
Was auf keinen Fall:
```

**Umfang**
1. **Sammeln:** deine Kritik, die Review-Punkte S2–S13, S24 und W4–W6, die Prinzipien aus `docs/UI.md` §1.
2. **Drei Designrichtungen** als klickbare Prototypen in der Vorschau (Skill `prototype`), z. B. „Ruhig & klar“, „Warm & verspielt“, „Präzise & professionell“.
   - Jede Richtung auf sechs Schlüssel-Screens:
     - Theorie mit Bild;
     - Multiple Choice mit Auflösung;
     - Chart-Entscheidung mit Auflösung, inklusive „richtig, aber verloren“;
     - Match;
     - Lektion geschafft;
     - Karte mit HUD.
   - Jede Richtung in hell und dunkel.
   - Erreichbar unter `#prototype/<richtung>/<screen>`.
3. **Tempo-Vergleich** (Entscheidung H): derselbe Screen mit ≤ 250 ms und mit dem heutigen Tempo.
4. **Layout-Varianten:** Antworten in der Daumenzone gegen heute; ein Vorschlag für die Schriftgrößen-Skala.

**Nicht in dieser Stufe:** Umbau der echten Screens. Das ist `LOOK-SYSTEM`.

**Modell · Effort · Sitzungen:** Fable 5.1 · high (sonst Opus 5.5 · xhigh) · 1–2

**Prompt**
```
Stufe LOOK-BRIEF aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 0 („Spaß“), Abschnitt 1 und den Abschnitt „LOOK-BRIEF“ vollständig, dazu docs/UI.md vollständig und in docs/review-2026-09-25.md die Punkte S2–S13, S24, W4–W6.
Nutze den Skill „prototype“ für die klickbaren Varianten.

Meine Kritik:
[hier deine Vorlage einfügen]

Baue drei wirklich verschiedene Richtungen – nicht dreimal dasselbe in anderen Farben. Jede muss zu docs/UI.md §1 passen (eine Idee pro Screen, Daumen zuerst, Bewegung nur mit Zweck).
Ändere keine echten Screens.

Öffne einen PR gegen main.
Bericht auf Deutsch: die drei Richtungen in je drei Sätzen · Links zu allen Varianten · die Bewertungstabelle für mich · offene Fragen. Dann stopp.
```

**Claude prüft automatisch.** Alle Standard-Checks; die Prototyp-Routen rendern im Render-Test.

**Du testest (~30 Min.)**
1. Jede Richtung auf dem Handy durchklicken und bewerten, je 1–5:
   - Spaß;
   - Lesbarkeit;
   - Vertrauen;
   - „würde ich täglich öffnen“.
2. Wählen. Mischen ist erlaubt, z. B. „Farben von A, Schrift von B“.
3. Das Tempo entscheiden (Entscheidung H).

**Fertig, wenn** Claude deine Wahl in `docs/UI.md` §10 eingetragen hat. Das passiert im selben PR, nach deiner Antwort.

### `BRAND` – Name und Gesicht

**Ziel.** Ein Name und ein Gesicht, bevor Store-Konten, Icons und Texte entstehen.

**Umfang**
1. **10–15 Namensvorschläge:**
   - kurz;
   - auf Deutsch und Englisch aussprechbar;
   - **ohne Gewinnversprechen**: kein „Profit“, „Rich“, „Signal“ (`docs/agent.md` §1, §7 und die Store-Richtlinien).
2. **Je Vorschlag geprüft:**
   - App-Store-Suche;
   - Domain (.app, .de, .com);
   - erste Markensuche im Web (DPMA, EUIPO). Das ersetzt keine anwaltliche Prüfung.
3. **2–3 Logo- und Icon-Konzepte** als SVG, passend zur Richtung aus `LOOK-BRIEF`. Optional Bildkonzepte mit dem Skill `brandkit`.
4. **Tonalität in fünf Sätzen:** nüchtern, freundlich, ehrlich.
5. **Nach deiner Wahl eintragen:**
   - `app.json` (Name, Slug);
   - Web-Titel;
   - Platzhalter für Icon und Splash.

**Modell · Effort · Sitzungen:** Opus 5.5 · xhigh · 1

**Prompt**
```
Stufe BRAND aus docs/build-plan.md.

Lies CLAUDE.md, in docs/build-plan.md Abschnitt 1 und den Abschnitt „BRAND“, docs/agent.md §1 und §7 sowie die in LOOK-BRIEF gewählte Richtung in docs/UI.md §10.
Recherchiere im Web (App Stores, Domains, DPMA/EUIPO-Suche) und nenne für jeden Namen, was du geprüft hast und was nicht.
Kein Name darf Gewinn, Reichtum oder Signale versprechen.

Öffne einen PR gegen main mit den Entwürfen (SVG) unter assets/brand/.
Bericht auf Deutsch: Namensliste mit Prüfergebnissen · Logo-Konzepte (Links) · Tonalität · offene Fragen. Dann stopp und warte auf meine Wahl.
```

**Du entscheidest:** Name und Icon-Richtung. Die Marke lässt du vor dem Release anwaltlich prüfen (`LEGAL-FINAL`).

### `LOOK-SYSTEM` – die gewählte Richtung als System

**Ziel.** Jeder Screen profitiert, ohne dass jeder Screen einzeln angefasst wird.

**Umfang**
1. **Farben** (S17, S18, W6):
   - Hell, Dunkel und System.
   - **Kontrast ≥ 4,5 : 1** für jeden Text; ein Prüfskript läuft in CI.
   - Höchstens drei Looks.
   - Farbenblind-Palette Blau/Orange.
   - In `app.json`: `userInterfaceStyle: automatic`.
2. **Schriftskala** (S2): Fließtext 16–17, Labels ≥ 13. Nichts Entscheidungsrelevantes unter 13, auch nicht die State-Chips.
3. **Layout** (W4, W5):
   - Antworten in der Daumenzone.
   - `FitScreen` verkleinert höchstens auf 85 %; passt es dann nicht, scrollt der Screen.
   - Inhalt klebt nicht mehr oben.
4. **Tempo** nach Entscheidung H (S5).
5. **Bedienung** (S13, S12):
   - Tap-Flächen ≥ 48 pt.
   - Abbrechen-Dialog: „Weiterlernen“ ist der Hauptknopf, und im Text steht „Lektion“ statt „sub-level“.
6. **HUD und Begriffe** (S9, S36):
   - HUD mit Beschriftung: „3 Tage“, „Heute 1/2“.
   - Banner „Lektion 1 von 4“.
   - Saubere a11y-Labels.
7. **Web** (S46): Titel = App-Name, `theme-color`, `viewport-fit=cover`, Favicon.
8. **Bildvergleich:** Kontaktbögen aller Bench-Screens in drei Größen (390, 375, 320 pt), jeweils hell und dunkel, als CI-Artefakt.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · Planmodus · 1–2

**Prompt**
```
Stufe LOOK-SYSTEM aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „LOOK-SYSTEM“ vollständig, dazu docs/UI.md vollständig (die gewählte Richtung steht in §10).
Zeig mir zuerst deinen Plan (welche Dateien, welche Reihenfolge) und warte auf meine Freigabe.
Setze danach genau diesen Umfang um – keine neuen Funktionen.

Besonders wichtig:
- Kontrast und Mindestgrößen werden per Skript geprüft, nicht nach Gefühl.
- Die Kontaktbögen vorher/nachher gehören in den Bericht.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · Kontaktbögen vorher/nachher · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Claude prüft automatisch.** Alle Standard-Checks, das Kontrast-Skript, die Kontaktbögen.

**Du testest (~30 Min.)**
1. Lektion 1-1, Lektion 9-2 und einen Checkpoint spielen, einmal hell, einmal dunkel.
2. Einhändig spielen: Erreichst du jede Antwort mit dem Daumen?
3. Kleines Display simulieren: Chrome am PC → Entwicklertools → „iPhone SE“ und 320 px Breite. Erwartet: nichts unter ~13 px, nichts abgeschnitten.
4. In den Settings den Look wechseln und die Farbenblind-Palette einschalten.
5. Spaß-Frage (1–5): Fühlt es sich schneller und hochwertiger an?

**Fertig, wenn** die Kontaktbögen stimmen und du zufrieden bist.

### `LOOK-COMPONENTS` – die Bausteine jeder Lektion

**Ziel.** Die Bausteine, die in jeder Lektion vorkommen, sehen fertig aus.

**Sitzung 1 – Charts und Auflösung**
1. **Achse** (S6):
   - Runde Preise (0,05 / 0,10 / 0,25 / 0,50 / 1) und das Währungszeichen aus dem Marktprofil.
   - Die Achse springt nicht zwischen Entscheidung und Auflösung.
2. **Entscheidungsknöpfe** (S7):
   - Gleich gewichtet.
   - „What happened next“ statt „NEXT 5 BARS“.
   - Text-Alternative für Screenreader, z. B. „Price climbed in steps from 9.80 to 10.05“.
3. **Stop- und Ziel-Linien**, wenn ein Screen `stop` oder `target` hat (neu, `docs/schema.md`).
4. **State-Chips** gut lesbar.

**Sitzung 2 – der Rest**

5. **Match:** jedes Paar mit eigener Farbe oder Verbindung (S8).
6. **Lektion geschafft** (S11):
   - Konfetti nur bei perfektem Lauf und nie über Text.
   - Der Lektionsname (`subtitle`) steht da.
   - Die Fehler sind aufgelistet, mit „Nochmal üben“ (verlinkt ab `PRACTICE`).
   - Der Fortschritt beim Tagesziel ist sichtbar.
7. **Kapitel-Badge** wie in `docs/UI.md` §5.4: XP-Bonus zählt hoch, „Chapter N unlocked“ (S21).
8. **Visuals** (S24, W17):
   - Besitz-Grafik als 10×10-Raster ab 20 Teilen.
   - Echte Icons für alle 51 Karussell-Icon-Namen (z. B. Bibliothek `lucide-react-native`, MIT-Lizenz, plus Zuordnungstabelle).
   - Session-Leiste maßstäblich und mit „jetzt“-Markierung.
   - `spot-mistake` als ein Satz.
   - Wischgeste im `swipe-deck`.
   - Label „Takeaway“ für `story` mit `label: takeaway`.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 2

**Prompt** (für jede der beiden Sitzungen; `[1]` oder `[2]` einsetzen)
```
Stufe LOOK-COMPONENTS, Sitzung [1|2], aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „LOOK-COMPONENTS“ vollständig, dazu docs/UI.md §4–§6 und docs/schema.md (Komponenten).
Setze nur die Punkte der genannten Sitzung um.

Besonders wichtig:
- Nichts bewegt sich, das der Lernende nicht bewegt hat (docs/UI.md §2).
- Icons: eine Zuordnungstabelle Icon-Name → Symbol für alle Namen, die der Content verwendet; der Validator lehnt unbekannte Namen ab.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · Kontaktbögen · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~30 Min.)**
1. `#level-01-1/6`: Die Achse zeigt runde Preise mit $, und nach der Entscheidung springt nichts.
2. Ein Match in der Test-Bench: Die Paare sind farbig.
3. Eine Lektion perfekt und eine mit Fehlern abschließen: Konfetti gibt es nur bei perfekt, die Fehlerliste ist sichtbar.
4. Das Karussell in Lektion 1·6-1: echte Icons statt Buchstaben.
5. Die Session-Leiste in Lektion 1·10-1: Die Proportionen stimmen, „jetzt“ ist sichtbar.
6. Ein `swipe-deck` mit dem Finger wischen.
7. Das Kapitel-1-Badge (Skip ahead bis zum Final Exam 17-1).

### `VISUALS` – neue Lerngrafiken

**Ziel.** Die wichtigsten Konzepte werden gezeigt, nicht nur beschrieben (S1, `docs/UI.md` §1 Prinzip 5).

**Umfang**
1. **Zwei neue Komponenten** nach `docs/UI.md` §6.8:
   - `candle-anatomy`: eine Kerze mit Open, High, Low, Close, Körper und Docht beschriftet; die Beschriftungen erscheinen nacheinander.
   - `trade-plan`: Einstieg, Stop und Ziel als Linien mit Abständen, dazu R und ein Chance/Risiko-Balken.
2. **Beide** in der Test-Bench, in `docs/schema.md` (Komponententabelle) und im Validator.
3. **Noch kein Einbau in Lektionen.** Das machen `VARIANCE` und `CONTENT-FIX`; dort gilt die Bildquote aus `RULES`.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe VISUALS aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „VISUALS“ vollständig, dazu docs/UI.md §6 und docs/schema.md (Komponenten).
Setze genau diesen Umfang um; kein Content außer den Einträgen in demo/all-screens.yaml.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~15 Min.)** Beide Komponenten in der Test-Bench auf dem Handy:
- Sind sie ohne Erklärung verständlich?
- Stimmen hell und dunkel?

---

## 8. Phase D – Lernschleife und Spaß

### `LOOP-HEARTS` – Fehler kosten nichts, Tests zählen

**Ziel.** Lernen ohne Angst: Fehler in Lektionen kommen wieder, statt zu sperren. Herzen gibt es nur in Tests.

**Umfang**
1. **Herzen nur in Checkpoints und Final Exams** (W1, `docs/UI.md` §5.2).
2. **Fehler-Runde** (W25, `docs/UI.md` §4.5):
   - Falsch beantwortete Fragen kommen am Ende der Lektion einmal wieder, neu gemischt.
   - Die Lektion ist fertig, wenn sie richtig beantwortet sind.
   - Eine Lektion mit Fehler-Runde zählt nicht als perfekt.
3. **Review cards** (S15, W8):
   - Über die Level-Karte → „Karten ansehen“ lassen sich die Theorie-Karten eines Levels ohne Fragen durchblättern.
   - In jeder Frage öffnet „Karte nochmal ansehen“ die letzte Theorie-Karte als Overlay.
4. **Level-Karte:** Jede Lektion ist einzeln wählbar, perfekte Lektionen sind markiert.
5. **Test-Auswertung** (S14):
   - Pro falscher Frage stehen die richtige Antwort und „Zur Lektion“ (öffnet die Review-Karte der Quelle).
   - „Review these“ öffnet eine Übungsrunde genau dieser Fragen. Vollständig ab `PRACTICE`.
6. **Out of hearts ohne Sackgasse:** statt nur „zurück“ die Aktionen „Karten wiederholen“ und, ab `PRACTICE`, „Üben → +1 Herz“.
7. **XP** (W11):
   - Wiederholungen geben ¼ XP.
   - Den Perfekt-Bonus gibt es nur beim ersten perfekten Lauf.
8. **Match** (W15):
   - Ein Fehltipp ergibt amber: zählt als richtig, kostet kein Herz.
   - Ab zwei Fehltipps ist die Aufgabe falsch.
9. **Erklärung je falscher Option** (`why`, W21) anzeigen, wo der Content sie hat.
10. **Unit-Tests** für alle Regeln.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · Planmodus · 1–2

**Prompt**
```
Stufe LOOP-HEARTS aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „LOOP-HEARTS“ vollständig, dazu docs/UI.md §2, §3, §4.1, §4.5, §5 und §7.1 und docs/agent.md §1 (Hearts) und §3.7.
Zeig mir zuerst deinen Plan und warte auf meine Freigabe.

Besonders wichtig:
- Bestehender Fortschritt bleibt erhalten (Migration von progress.v1, falls nötig).
- Jede Regel hat einen Unit-Test, der ohne die Regel rot wäre.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~30 Min.)**
1. Eine Lektion mit drei absichtlichen Fehlern spielen:
   - Du verlierst kein Herz.
   - Die drei Fragen kommen am Ende wieder.
2. Einen Checkpoint mit zwei Fehlern spielen:
   - Jetzt gehen Herzen verloren.
   - Die Auswertung zeigt die richtigen Antworten.
   - „Zur Lektion“ öffnet die passende Karte.
3. Bei einem fertigen Level Lektion 3 einzeln wiederholen: Es gibt nur wenige XP.
4. Im Checkpoint die Herzen leer spielen: „Karten wiederholen“ funktioniert.
5. Ein Match mit einem Fehltipp: amber, zählt als richtig.
6. Spaß-Frage (1–5): Fühlen sich Fehler jetzt fair an?

### `LOOP-DAILY` – jeden Tag wiederkommen, ohne Druck

**Ziel.** Ein Grund, jeden Tag wiederzukommen, ohne Druck und ohne Schuldgefühl.

**Umfang**
1. **Tagesziel** (W9):
   - Wählbar: 1, 2 oder 3 Lektionen, Standard 2. In den Settings; ab `ONBOARDING` auch im Einstieg.
   - Das HUD zeigt „Heute 1/2“.
2. **Serie** (S10):
   - Sie zählt die Tage, an denen das eigene Ziel erreicht wurde.
   - Zustände:
     - **offen:** das Ziel ist heute noch nicht erreicht.
     - **geschafft:** die Flamme zündet.
     - **in Gefahr:** abends, wenn das Ziel noch offen ist.
     - **verloren:** freundlicher Screen „Neue Serie ab heute“.
3. **Streak-Freeze:**
   - Höchstens zwei auf Vorrat.
   - Wird automatisch eingesetzt, Meldung „Freeze benutzt“.
   - Verdient wird er mit der **Wochen-Challenge** (`docs/UI.md` §7.6): 8–12 Fragen aus allem Freigeschalteten, Bonus-XP plus ein Freeze.
4. **Erinnerungen** (`expo-notifications`, nur lokal):
   - Tägliche Uhrzeit wählbar.
   - Abends höchstens eine Erinnerung „Serie in Gefahr“, und nur wenn das Ziel noch offen ist.
   - Nie Schuldgefühl-Texte; alles abschaltbar.
5. **Test-Werkzeug** „Tag vorspulen“ (+1 Tag, +2 Tage).

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–2

**Prompt**
```
Stufe LOOP-DAILY aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „LOOP-DAILY“ vollständig, dazu docs/UI.md §5.3, §7.2, §7.6 und docs/agent.md §1 (Daily target).
Setze genau diesen Umfang um.

Besonders wichtig:
- Tagesgrenzen nach Ortszeit des Geräts; teste Sommerzeit-Wechsel und Mitternacht.
- Erinnerungstexte: freundlich, nie drohend, nie Schuld. Zeig mir alle Texte im Bericht.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · alle Erinnerungstexte · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~20 Min. + 3 Tage)**
1. Das Ziel auf 1 stellen und eine Lektion spielen: Die Flamme zündet, das HUD zeigt „1/1“.
2. Testing → „+1 Tag“: Die Serie steht auf „offen“.
3. „+2 Tage“ ohne Freeze: der Screen „Neue Serie“. Mit Freeze: „Freeze benutzt“.
4. Die Wochen-Challenge spielen: Du erhältst einen Freeze.
5. Eine Erinnerung auf in 2 Minuten stellen: Sie kommt auf dem echten Gerät an.
6. Drei Tage normal nutzen: Nervt irgendetwas?

### `ONBOARDING` – erster Eindruck, Recht und Marktprofil

**Ziel.** Ein guter erster Eindruck, und alles, was rechtlich und fachlich vor dem ersten Screen stehen muss.

**Umfang**
1. **Einstieg** (`docs/UI.md` §11.1), in dieser Reihenfolge:
   1. Was die App ist.
   2. Risikohinweis in einem Satz, mit „Mehr“.
   3. Tagesziel.
   4. Erinnerung ja/nein.
   5. Marktprofil („Wo willst du später handeln?“ US / Deutschland).

   Danach geht es direkt in Lektion 1-1.
2. **Risikohinweis an allen Stellen** aus `docs/agent.md` §7 (M8):
   - beim ersten Start;
   - bei jedem Szenario-Ergebnis als kleine Zeile;
   - auf dem Statistik-Screen.
3. **Settings → Legal:** Gerüst für Impressum, Datenschutz, Nutzungsbedingungen und Disclaimer. Die Texte kommen aus `LEGAL-DRAFT`, bis dahin Platzhalter.
4. **Marktprofil in den Settings** (S25):
   - EU-Zahlenformat („10,00 €“).
   - Uhrzeiten in Ortszeit, z. B. „US-Markt: 15:30–22:00 deutscher Zeit“.
   - „Markt, den ich handle“ und „meine Zeitzone“ sind getrennte Einstellungen.
5. **Plan-Karte** (S22):
   - Auswahlfelder (`kind: choice`) und Zahlenbereiche (`min`/`max`).
   - Plan-Historie mit Datum (`docs/schema.md`, „The plan“).
   - Export als Bild oder Text zum Teilen.
6. **i18n-Grundlage** (W19): Alle UI-Texte laufen über Schlüssel (`t('…')`) mit einer Datei `en.json`. Content bleibt Englisch.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–2

**Prompt**
```
Stufe ONBOARDING aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „ONBOARDING“ vollständig, dazu docs/UI.md §3 (plan-card), §9, §11, docs/agent.md §7, docs/schema.md („The plan“) und content/market_profiles.yaml.
Setze genau diesen Umfang um; die Rechtstexte bleiben Platzhalter.

Besonders wichtig:
- Der Risikohinweis ist sichtbar, aber nicht aufdringlich; er darf die Chart-Auflösung nicht verdecken.
- Nach der i18n-Umstellung darf kein UI-Text mehr hart im Code stehen (Prüfskript).

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~20 Min.)**
1. Frische Installation (Settings → Reset oder ein privates Browserfenster): den Einstieg durchspielen.
2. Marktprofil „Deutschland“ wählen: Preise mit € und Komma, Uhrzeiten in deutscher Zeit (Lektion 1·10-1).
3. Nach einer Chart-Entscheidung: Die Risikohinweis-Zeile ist sichtbar, aber unaufdringlich.
4. Die Plan-Karte mit Unsinn füllen: wird abgelehnt oder nachgefragt. Dann den Plan teilen.
5. Settings → Legal öffnet sich.

### `PRACTICE` – der Übungs-Tab

**Ziel.** Ein Ort, an dem Wissen hängen bleibt: täglich drei Minuten, nie bestrafend.

**Umfang** (`docs/UI.md` §7.3)
1. **Übungs-Tab** mit drei Bereichen:
   - **Tagesmix:** ~3 Minuten, 8–10 Fragen.
   - **Schwache Konzepte:** aus falschen Antworten, über `tags` und `terms_introduced`.
   - **Wiederholen nach Plan:** Leitner-System mit 1 → 3 → 7 → 16 → 35 Tagen.
2. **Quelle der Fragen:**
   - Fragen aus abgeschlossenen Lektionen, in anderer Reihenfolge und nie mit derselben Frage zweimal pro Runde.
   - Dazu Drill-Packs, sobald es sie gibt.
3. **Regeln:**
   - Nie Herzen, nie Zeitdruck.
   - Eine abgeschlossene Übungsrunde gibt **1 Herz** zurück (`docs/UI.md` §5.2).
4. **Verknüpfungen:**
   - „Review these“ aus der Test-Auswertung;
   - „Nochmal üben“ aus dem Lektionsabschluss;
   - Out of hearts.
5. **Unit-Tests** für die Planung: Fälligkeit über Tage; eine falsche Antwort setzt zurück in Box 1.

**Modell · Effort · Sitzungen:** Opus 5.5 · xhigh · Planmodus · 2

**Prompt**
```
Stufe PRACTICE aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „PRACTICE“ vollständig, dazu docs/UI.md §5.2, §7.3 und docs/agent.md §3.3.
Zeig mir zuerst deinen Plan (Datenmodell, Auswahl-Logik, Screens) und warte auf meine Freigabe.

Besonders wichtig:
- Die Auswahl muss erklärbar sein: Warum kommt diese Frage heute? (für die Tests und für mich)
- Keine Frage in derselben Runde zweimal; keine Frage, deren Lektion noch nicht gespielt wurde.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~30 Min. + 1 Woche)**
1. Fünf Lektionen mit ein paar Fehlern spielen: Der Tab zeigt genau diese Konzepte.
2. Den Tagesmix spielen.
3. Im Checkpoint ein Herz verlieren, dann eine Übungsrunde spielen: Das Herz ist zurück.
4. Testing → „+1 Tag“ und „+3 Tage“: Die fälligen Fragen erscheinen.
5. Eine Woche lang täglich 10 Minuten nutzen: Fühlt sich Üben sinnvoll an oder wie Wiederkäuen?

### `GLOSSARY` – jeder Begriff einen Tipp entfernt

**Ziel.** Jeder Fachbegriff ist einen Tipp entfernt erklärt (`docs/UI.md` §8, S16).

**Umfang**
1. **`content/glossary.yaml`** (Format in `docs/schema.md`):
   - Jeder Begriff aus allen `terms_introduced` (~300).
   - Je Begriff **ein** Satz Definition: höchstens 160 Zeichen, einfache Worte, im Einklang mit der Lektion, die ihn einführt.
   - Dazu `taught_in` und `aliases`.
2. **Validator:** Jeder eingeführte Begriff hat einen Eintrag, und keine Definition ist zu lang.
3. **UI:**
   - Begriffe im Fließtext gepunktet unterstrichen (erstes Vorkommen pro Screen).
   - Ein Tipp öffnet ein Blatt mit Definition und „Gelernt in Level X-Y“; das öffnet die Review-Karte.
   - Glossar-Liste mit Suche im Account.
   - Bereich „zuletzt verpasst“, gefüttert aus `PRACTICE`.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–2. Die Definitionen müssen fachlich exakt sein, also nicht mit Sonnet oder Haiku.

**Prompt**
```
Stufe GLOSSARY aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „GLOSSARY“ vollständig, dazu docs/UI.md §8, docs/schema.md (Glossar) und docs/agent.md §3.9 und §4.
Schreibe jede Definition passend zu der Lektion, die den Begriff einführt – lies dafür den Screen, auf dem er definiert wird. Keine Definition darf der Lektion widersprechen.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Anzahl Begriffe · 15 zufällige Definitionen zum Gegenlesen · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~15 Min.)**
1. In drei Lektionen unterstrichene Begriffe antippen.
2. Im Glossar nach „VWAP“, „Spread“ und „R“ suchen.
3. Die 15 Definitionen aus dem Bericht lesen: korrekt und verständlich?

### `STATS` – Fortschritt, gemessen an Entscheidungen

**Ziel.** Fortschritt, auf den man stolz sein kann. Gemessen an Entscheidungen, nie an Gewinn.

**Umfang** (`docs/UI.md` §7.4)
1. **Account und Statistik:**
   - XP, Kapitel, Genauigkeit je Thema.
   - Entscheidungsbilanz: Long, Short, No trade, Anteil „gute Entscheidungen“.
   - **Varianz-Ansicht**, z. B. „Deine richtigen Entscheidungen: 64 % Gewinner, 36 % Verlierer – so sieht ein guter Prozess aus.“
   - Die aktuelle Stufe (Tier).
2. **Trader Card v1:** bestes Setup, Kurzfassung des gespeicherten Plans, Stufe. Als Bild teilbar.
3. **Risikohinweis-Zeile** auf dem Statistik-Screen (`docs/agent.md` §7).

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe STATS aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 0 („Varianz“), Abschnitt 1 und den Abschnitt „STATS“ vollständig, dazu docs/UI.md §7.4–§7.5 und docs/agent.md §7.
Nie Gewinn oder Geld als Leistungsmaß zeigen – nur Entscheidungen.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~15 Min.)**
1. Die Zahlen stichprobenartig mit dem vergleichen, was du gespielt hast.
2. Die Trader Card teilen und das Bild ansehen.

### `FUN-PASS` – macht es Spaß?

**Ziel.** Bevor der Content überarbeitet wird, klären: Macht die App Spaß, und wo ist sie zäh?

**Umfang**
1. **Audit durch Claude:**
   - Claude spielt Kapitel 1 und Scalping Kapitel 2 automatisiert durch (Playwright, Screenshots, Zeit pro Screen).
   - Misst Lektionsdauer und Interaktionsdichte.
   - Findet Langeweile, Wiederholung und schwache Belohnungen.
   - Prüft die Animationen mit den Skills `review-animations` und `improve-animations` gegen `docs/UI.md`: „Nothing moves unless the learner moved it“.
2. **Laientest durch dich:** 2–3 Personen ohne Trading-Vorwissen spielen Level 1–4 (Leitfaden in Anhang C).
3. **Umsetzung:**
   - Aus Audit und Laientest wird eine priorisierte Liste. Du wählst daraus aus.
   - Umgesetzt werden z. B. Töne, Haptik, Mikro-Animationen, Erfolge für Disziplin (K6), und alles, was der Laientest gezeigt hat.

**Modell · Effort · Sitzungen:**
- Audit: Fable 5.1 · high (sonst Opus 5.5 · xhigh).
- Umsetzung: Opus 5.5 · high · 1–2.

**Prompt (Audit)**
```
Stufe FUN-PASS (Audit) aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 0 („Spaß“), Abschnitt 1 und den Abschnitt „FUN-PASS“ vollständig, dazu docs/UI.md vollständig.
Spiele Kapitel 1 und Scalping Kapitel 2 in der Web-Vorschau automatisiert durch (Playwright), miss Zeit pro Screen und Lektion, und bewerte gegen die Spaß-Kriterien in Abschnitt 0.
Ändere nichts.

Bericht auf Deutsch: Messwerte · die 15 wichtigsten Befunde (Screen-Link, was, warum, Vorschlag), sortiert nach Wirkung · offene Fragen. Dann stopp.
```

**Prompt (Umsetzung)**
```
Stufe FUN-PASS (Umsetzung) aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 und den Abschnitt „FUN-PASS“. Setze diese freigegebenen Befunde um: [Liste].
Öffne einen PR gegen main und bring alle Checks auf grün. Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Du testest (~45 Min.)** Den Laientest nach Anhang C, danach selbst Level 1–4 nach der Umsetzung.

---

## 9. Phase E – Inhalt Scalping: richtig, ehrlich, vollständig

Die Reihenfolge ist Absicht:
1. Zuerst prüft der Validator die neuen Regeln (`RULES`).
2. Dann entstehen die neuen Bausteine (`VARIANCE`, `OFFER`).
3. Dann wird jedes Kapitel **einmal** angefasst (`CONTENT-FIX`).
4. Erst danach kommen die großen Reviews.

So wird keine Datei zweimal umgeschrieben.

### `RULES` – neue Regeln und Arbeitslisten

**Ziel.**
- Die neuen Inhaltsregeln werden automatisch geprüft.
- Jede Content-Sitzung bekommt eine fertige Arbeitsliste.

**Umfang** (die Regeln stehen in `docs/agent.md` und `docs/schema.md`, dort mit [v4] markiert)
1. **Validator-Regeln:** zuerst Warnungen, unter `--strict` Fehler.
   - **Varianz** (§3.11):
     - Quote je Kapitel.
     - In Kapitel 1 keine zwei „richtig, aber verloren“ hintereinander.
     - `stop` und `target` ab Kapitel 3 bei Richtungsentscheidungen.
     - Der `outcome`-Satz passt zum Chartverlauf (Gewinn oder Verlust).
   - **Vorzeichen** (§3.12): Betragsfragen haben `sign: any` oder ein Richtungswort im Prompt.
   - **Verweise und Labels:** Recap-Punkte mit `card:`; ein `story`-Screen am Lektionsende mit `label: takeaway`.
   - **Sprache:**
     - Fließtext ≤ 150 Zeichen.
     - US-Schreibweise (Liste britischer Formen).
     - Keine Bedienwörter im Prompt („Drag“, „Tap“, „Swipe“) und keine Mechanik-Hinweise wie „Hearts are on.“
   - **Tells** (§3.5): Längen-Tell auch nach unten (< ~15 %); Satzzeichen-Tell auch in Kapiteln, nicht nur in Packs.
   - **Bildquote:** ≥ 40 % der `theory`- und `example`-Screens eines Kapitels haben ein Visual (W23).
   - **Plan-bewusster Deckel:** Nach einer `plan-card`, die `setup_max_account_pct` schreibt, bleiben Positionen bis zur nächsten Revision unter dem vorgeschlagenen Wert.
   - **Risiko pro Trade und Gesamt-Exposure** (`docs/agent.md` §3.6):
     - Risiko pro Trade zwischen 0,5 und 2 %.
     - Bei mehreren gleichzeitigen Positionen: Summe der Positionswerte und Summe der Risiken gegen das Konto.
     - Das ist Pflicht vor Swing.
2. **`tools/test_validate.py`:** ein Fall pro neuer Regel.
3. **`tools/content_report.py --chapter N`:** eine Arbeitsliste je Kapitel (Markdown) mit allen Befunden, jeweils mit Datei und Screen.
4. **`tools/export_readable.py --chapter N`:** ein Kapitel als lesbarer Text, für dich, `EXPERT` und die Reviews.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–2

**Prompt**
```
Stufe RULES aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „RULES“ vollständig, dazu docs/agent.md und docs/schema.md vollständig (alle mit [v4] markierten Regeln).
Neue Regeln starten als Warnung; plain `validate_content.py` bleibt bei 0 Fehlern. Keine Content-Änderung in dieser Stufe.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: neue Regeln · Warnungen je Kapitel (Tabelle) · Link zu den Arbeitslisten · meine Test-Checkliste · offene Fragen. Dann stopp.
```

**Du testest (~10 Min.)**
1. Die Arbeitslisten für Kapitel 1 und 7 lesen: Sind die Zahlen plausibel? Die Varianz-Quote liegt heute z. B. bei 0 %.
2. Einen Kapitel-Export öffnen: Ist er gut lesbar?

### `VARIANCE` – richtig entschieden, trotzdem verloren

**Ziel.** Der Lernende versteht, dass richtige Entscheidungen verlieren können, bevor es ihm passiert (Abschnitt 0, „Varianz“).

**Umfang**
1. **Neuer Screen-Typ `variance-sim`** (`docs/UI.md` §4.2, `docs/schema.md`):
   - Der Lernende tippt auf „10 Trades“ und sieht Gewinner und Verlierer als Reihe, dazu eine Kurve in R.
   - Mehrmals spielbar, jedes Mal eine andere Reihe.
   - „100 Trades“ zeigt, wie sich das Ergebnis dem Erwartungswert nähert.
   - Kein Zeitdruck, Reduce-Motion wird respektiert, per Seed deterministisch testbar.
2. **Neue Lektion 1·2-4 „Good Call, Bad Luck“:**
   - Auf Englisch, 12–16 Screens, nach `docs/curriculum.md`.
   - Ablauf: Geschichte → Theorie → Simulator → die erste richtige Entscheidung, die verliert (mit der neuen Auflösung) → `tf` „A trade that lost was a bad decision“ (falsch) → Mini-Rechnung → Takeaway.
   - Die Prerequisite-Kette: 3-1 folgt jetzt auf 2-4.
3. **„Warum?“-Link** in der Auflösung „richtig, aber verloren“: öffnet die Karte aus 1·2-4 als Review-Karte.
4. **Lektionszusammenfassung** (`docs/UI.md` §5.3), z. B. „Entscheidungen 7/8 richtig · Ergebnis: 4 Gewinner, 3 Verlierer“.
5. **Erste Verlierer in Kapitel 1:** ab Level 3 die ersten richtigen Kaufentscheidungen, die verlieren, nach der Quote aus §3.11. Den Rest erledigt `CONTENT-FIX-1`.

**Modell · Effort · Sitzungen:** Opus 5.5 · xhigh · 1–2

**Prompt**
```
Stufe VARIANCE aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 0 („Varianz“), Abschnitt 1 und den Abschnitt „VARIANCE“ vollständig, dazu docs/agent.md §3.11, docs/UI.md §4.2, §5.1, §5.3, docs/schema.md (variance-sim) und die Referenzdateien aus docs/agent.md §3.8.
Lies content/shared/chapter-01-market-basics/level-02-1.yaml bis level-02-3.yaml, bevor du 2-4 schreibst – Ton und Rhythmus müssen passen.

Besonders wichtig:
- Die Lektion muss für jemanden ohne jedes Vorwissen verständlich sein und darf Varianz nie als Ausrede für schlechte Entscheidungen erscheinen lassen.
- Keine Gewinnversprechen, keine Trefferquoten als Tatsache für echte Märkte – die Zahlen im Simulator sind ausdrücklich ein Beispiel.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · der Text der Lektion 2-4 komplett zum Gegenlesen · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~30 Min. + Laientest)**
1. Die Lektionen 1·2-3 und 2-4 spielen. Den Simulator fünfmal laufen lassen: Kommt jedes Mal eine andere Reihe?
2. Eine Kapitel-1-Entscheidung spielen, die richtig war und verliert (Link im Bericht): Ist sofort klar, dass du *richtig* lagst?
3. **Laientest:**
   - Eine Person ohne Trading-Vorwissen spielt 2-3 und 2-4.
   - Frag sie danach: „Du hast richtig entschieden und trotzdem verloren – was heißt das?“
   - Sinngemäß erwartet: „Ein einzelner Trade sagt wenig; es zählt, ob die Entscheidung gut war.“
   - Kann sie das nicht sagen, überarbeitet Claude die Lektion.

### `OFFER` – Kapitel 8 Level 15, Kontoarten und Regeln

**Ziel.** Kapitel 8 Level 15 „What You'll Actually Be Offered“ vermittelt das Wissen für den Schritt ins echte Konto (Entscheidungen A, B, C).

**Umfang**
1. **Teil 1 – Umnummerierung** als eigener Commit:
   - Kapitel 8 Level 15–17 wird zu 16–18.
   - Die Prerequisite-Kette und alle Verweise werden mitgezogen.
2. **Teil 2 – Level 15 mit vier Lektionen** nach `docs/curriculum.md`. Die Entscheidungen A–C sind jetzt getroffen, es bleibt nichts offen.
   - Kontoarten und was jede erlaubt. Leerverkauf braucht ein Margin-fähiges Konto.
   - Was Hebel mit bekannten Zahlen macht: die Ruin-Rechnung.
   - Die Regeln gegen den eigenen Plan:
     - PDT-Regel gegen sechs Trades pro Sitzung;
     - Settlement;
     - Steuern als Frage an den Berater.
   - Übung: das passende Konto zum eigenen Plan.
3. **`content/market_profiles.yaml`** (M17):
   - EU-DE `fee_note` ohne Preise.
   - EU-DE `regulation_note` präzise: Der Negativsaldo-Schutz betrifft CFDs.
   - US-PDT-Regel mit aktuellem Stand. Recherche mit Quelle, denn die FINRA-Reform läuft.
   - Neues Feld `checked: <Datum>`.
   - `timezone` „German time“ statt „CET“.
   - `first_minutes` im selben Format wie `premarket`.
4. **Nicht hier:** Die Ein-Satz-Ergänzungen in Kapitel 1 (1·12, 1·13) und in 6·9 macht `CONTENT-FIX-1` bzw. `CONTENT-FIX-6`.

Detail-Prompt: **Anhang E.1** (englisch).

**Modell · Effort · Sitzungen:** Opus 5.5 · xhigh · 1–2

**Prompt**
```
Stufe OFFER aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1, Abschnitt 4.1 (Entscheidungen A, B, C) und den Abschnitt „OFFER“ vollständig. Dann befolge den Detail-Prompt in Anhang E.1 genau.
Für die Regeltexte in content/market_profiles.yaml: recherchiere den aktuellen Stand im Web, nenne jede Quelle mit Datum im Bericht und markiere alles, was ein Anwalt prüfen muss.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · Quellen · Sätze, bei denen du unsicher bist (für EXPERT/Anwalt) · meine Test-Checkliste mit echten Links. Dann stopp.
```

**Du testest (~20 Min.)**
1. Skip ahead zu Kapitel 8 Level 15 und alle vier Lektionen spielen, einmal mit Profil US, einmal mit Deutschland.
2. Prüfen: informativ, keine Empfehlung, kein Produktname, verständlich.
3. Jede Stelle, bei der Claude unsicher war, sammelst du für `EXPERT` bzw. den Anwalt.

### `CONTENT-FIX-1` … `CONTENT-FIX-8` – ein Durchgang pro Kapitel

**Ziel.** Jedes Kapitel erfüllt alle Regeln. Ein Durchgang pro Kapitel, damit jede Datei nur einmal angefasst wird.

**Reihenfolge:** 1 → 2 → 3 → … → 8. Kapitel 8 kommt nach `OFFER`.

**Umfang je Kapitel**
1. **Die Arbeitsliste abarbeiten** (`python3 tools/content_report.py --chapter N`):
   - Varianz-Quote, mit neuen Chartverläufen und `stop`/`target`.
   - Vorzeichen.
   - Recap-`card:`.
   - Takeaway-Labels.
   - Textlänge, Schreibweise, Bedienwörter.
   - Tells.
   - Bildquote, mit `candle-anatomy`, `trade-plan` und den vorhandenen Komponenten.
   - `subtitle` für jede Lektion.
   - `why` für die wichtigsten falschen Optionen (typische Fehlvorstellungen).
2. **Die kapitelspezifischen Punkte** aus der Liste unten.
3. **Arbeitsweise:**
   - Blöcke von 4–6 Levels, nach jedem Block Validator und Sizing.
   - Am Ende der Render-Test für das Kapitel und ein Kontaktbogen der geänderten Screens.
4. **Nicht ändern:**
   - Lernziele, Level-Struktur und IDs.
   - Share-Counts nur mit Nachrechnen (`docs/agent.md` §3.6).

**Kapitelspezifische Punkte** (aus `docs/review-2026-09-25.md`)

- **Kapitel 1:**
  - Szenarien, die schon schlussfolgern: 13-2, 16-1.
  - Widerspruch bei Gerüchten: 13-2 S9 ↔ 16-1 S11.
  - „Hearts are on.“ in 5-1 und 11-1.
  - „Drag …“ in 3-3, 8-3, 10-1.
  - Einzelfragen: 14-2 S7, 14-2 S13, 2-3 S4, 1-4 S9, 3-1 S13, 16-1 S2, 1-1 S11, 17-1 S5.
  - Vorzeichen: 1-1 S10, 1-3 S10, 5-1 S8, 13-1 S6, 13-3 S4, 15-2 S10.
  - In 1·12 ein Satz zu Cash- vs. Margin-Konto; in 1·13 ein Satz, dass Leerverkauf ein Margin-fähiges Konto braucht (Entscheidung B).
  - In 16-2 ein Satz, warum dein Planwert (50 %) unter den bisherigen Beispielen liegt.
  - Die Besitz-Grafik in 3-1 als Raster.
- **Kapitel 2:**
  - In 2·1-4 nach dem Brücken-Screen eine `plan-card`-Revision von `setup_max_account_pct`, 50 → 95, mit Begründung (W3).
  - `candle-anatomy` in 2·1-1.
- **Kapitel 3:**
  - State-Chips nach Anhang E.3 (heute 37 %).
  - `stop`/`target` gelten ab hier.
  - 3·10 bestätigt die Plan-Revision.
  - 3·14-1 passend zu Entscheidung B.
  - „Hearts are on.“ in 12-1.
- **Kapitel 4 und 5:** nur die Arbeitsliste.
- **Kapitel 6:**
  - State-Chips (38 %).
  - `variance-sim` in 6·6 und 6·13.
  - In 6·9 klar sagen: Sechs Trades pro Sitzung brauchen ein Margin-Konto, dazu PDT und Settlement (Entscheidung C).
- **Kapitel 7:**
  - State-Chips zuerst, heute nur 16 %.
  - Realistische Varianz je Setup.
- **Kapitel 8:**
  - „Hearts are on.“ in 5-1 und 10-1.
  - Ein ehrlicher Abschluss: „bereit zu üben, nicht bereit für Gewinn“.
  - Verweise auf Level 15.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–2 je Kapitel

**Prompt** (`[N]` = Kapitelnummer)
```
Stufe CONTENT-FIX-[N] aus docs/build-plan.md.

Lies CLAUDE.md, docs/agent.md, docs/schema.md und docs/UI.md vollständig, in docs/curriculum.md den Abschnitt zu Kapitel [N], in docs/build-plan.md Abschnitt 0 („Varianz“), Abschnitt 1 und den Abschnitt „CONTENT-FIX“, und die Referenzdateien aus docs/agent.md §3.8.
Erzeuge dann `python3 tools/content_report.py --chapter [N]` – das ist deine Arbeitsliste, zusammen mit den kapitelspezifischen Punkten im Plan.

Arbeite in Blöcken von 4–6 Levels. Nach jedem Block: validate_content.py, check_sizing.py; 0 Fehler, keine Warnung zu einer Datei, die du angefasst hast.
Jede geänderte Chart-Aufgabe rechnest du komplett nach (Einstieg, Stop, Größe, Ergebnis in $ und R, Outcome-Satz).
Ändere keine Lernziele, keine Level-Struktur, keine IDs.

Am Ende: Render-Test für das Kapitel, Kontaktbogen der geänderten Screens, die drei Handprüfungen aus Abschnitt 1.
Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: Vorher/Nachher-Zahlen der Arbeitsliste · Abweichungen mit Grund · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~20 Min. je Kapitel)**
1. Zwei Lektionen und den Checkpoint spielen (Links im Bericht).
2. Die Vorher/Nachher-Zahlen lesen.
3. Drei geänderte Entscheidungen ansehen, davon eine „richtig, aber verloren“.
4. Eine Lektion lesen wie ein Anfänger.

### `KNOWLEDGE` – reicht das Wissen für die Praxis?

**Ziel.** Zwei Fragen beantworten:
- Fehlt nach dem Kurs wirklich nur noch Praxis? Geprüft gegen das Absolventen-Profil in Abschnitt 0.
- Geht alles, was gelehrt wird, in der Realität so? Das ist Review B.

**Umfang:** eine Befundliste, keine Änderungen. Detail-Prompt: **Anhang E.6**. Das Absolventen-Profil kommt als fünfte Frage dazu.

**Modell · Effort · Sitzungen:** Fable 5.1 · max (sonst Opus 5.5 · max) · 1

**Prompt**
```
Stufe KNOWLEDGE aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 0 (Absolventen-Profil) und den Abschnitt „KNOWLEDGE“, dann befolge den Detail-Prompt in Anhang E.6 für den Pfad scalping.
Fünfte Frage zusätzlich: Gehe das Absolventen-Profil Punkt für Punkt durch und nenne für jeden Punkt, wo er gelehrt wird (Datei, Screen) – oder dass er fehlt, und wo er hingehören würde.
Ändere nichts.

Bericht auf Deutsch: nummerierte Befundliste, wichtigste zuerst, mit Datei und Screen · Punkte, die Außenwissen brauchen (für EXPERT) · offene Fragen. Dann stopp.
```

**Du:** die Befunde lesen und je Befund entscheiden: ja, nein oder später. Die Ja-Befunde gehen an `KNOWLEDGE-FIX`. Punkte, die Wissen von außen brauchen (Recht, Brokerpraxis), gehen an `EXPERT`.

### `KNOWLEDGE-FIX`

Setzt die freigegebenen Befunde um: neue Screens oder Lektionen, nach allen Regeln.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–3

**Prompt**
```
Stufe KNOWLEDGE-FIX aus docs/build-plan.md.

Lies CLAUDE.md, docs/agent.md, docs/schema.md, docs/UI.md, und in docs/build-plan.md Abschnitt 1. Setze diese freigegebenen Befunde aus KNOWLEDGE um: [Liste]. Neue Lektionen folgen docs/curriculum.md (trag sie dort ein) und allen Regeln.
Öffne einen PR gegen main und bring alle Checks auf grün. Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Du testest:** die neuen Lektionen spielen.

### `REVIEW-A` – lehrt der Kurs gut?

**Umfang:** Detail-Prompt **Anhang E.5** (Pass A). Erst entsteht eine Befundliste; du gibst frei; dann folgen die Korrekturen.

**Modell · Effort · Sitzungen:**
- Review: Fable 5.1 · high (sonst Opus 5.5 · max) · 1.
- Korrekturen: Opus 5.5 · high · 1–3.

**Prompt (Review)**
```
Stufe REVIEW-A aus docs/build-plan.md. Lies CLAUDE.md und befolge den Detail-Prompt in Anhang E.5 für den Pfad scalping. Bericht auf Deutsch. Ändere nichts. Dann stopp.
```

**Prompt (Korrekturen)**
```
Stufe REVIEW-A (Korrekturen) aus docs/build-plan.md. Lies CLAUDE.md, docs/agent.md, docs/schema.md, docs/UI.md und in docs/build-plan.md Abschnitt 1. Setze diese freigegebenen Befunde um: [Liste]. PR, alle Checks grün, Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

### `EXPERT` – Fachlektorat durch einen Menschen

**Ziel.** Ein Mensch, der wirklich handelt, prüft die fachlich heikelsten Teile.

**Umfang:**
- Kapitel 3 (Orders, Kosten, Größe).
- Kapitel 6 (Risiko).
- Kapitel 7 (Playbook).
- Kapitel 8 (Handelstag und Level 15).
- Die Marktprofile.

Claude liefert die Exporte (`tools/export_readable.py`) und eine Liste der Stellen, bei denen Claude unsicher war.

**Du:**
1. Die Person finden: einen erfahrenen Trader, idealerweise mit Ausbildungs- oder Lehrerfahrung.
2. Umfang und Honorar klären.
3. Das Ergebnis als Liste zurückbringen.

Die Korrekturen macht eine eigene Sitzung (Opus 5.5 · high, Prompt wie bei `REVIEW-A` Korrekturen).

---

## 10. Phase F – Beta 1 (geschlossen, Scalping)

Ziel der Phase: Echte Menschen testen den fertigen Scalping-Kurs, bevor Swing geschrieben wird.

### `LEGAL-DRAFT` – Rechtstexte als Entwurf

**Ziel.** Rechtstexte als Entwurf, damit Beta und Store-Einträge möglich werden.

**Umfang** (Deutsch und Englisch)
1. **Impressum** nach DDG.
2. **Datenschutzerklärung.** Sie deckt ab:
   - lokale Speicherung;
   - Benachrichtigungen;
   - Absturzberichte und Analyse, nur mit Einwilligung;
   - die Store-Anbieter.
3. **Nutzungsbedingungen.**
4. **Risikohinweis und Disclaimer:**
   - keine Anlageberatung;
   - synthetische Daten;
   - keine Garantie.
5. **Entwurf der Datenschutzangaben** für App Store und Google Play.
6. **Eine einfache Webseite** mit diesen Texten, z. B. als zweites Cloudflare-Pages-Projekt. Die Stores verlangen eine Datenschutz-URL.
7. **Settings → Legal** zeigt die Texte.

**Wichtig.** Das sind Entwürfe, keine Rechtsberatung. Vor dem Release prüft sie ein Anwalt (`LEGAL-FINAL`).

**Du bereitest vor.** Die Anbieterdaten: Name, Anschrift, Kontakt (Entscheidung P).

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe LEGAL-DRAFT aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „LEGAL-DRAFT“ vollständig, dazu docs/agent.md §7.
Anbieterdaten: [Name, Anschrift, E-Mail].
Schreibe Entwürfe auf Deutsch und Englisch; markiere jede Stelle, die ein Anwalt entscheiden muss. Kein Text darf Gewinne versprechen oder als Anlageberatung lesbar sein.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: Texte (Links) · markierte Stellen für den Anwalt · meine Test-Checkliste · offene Fragen. Dann stopp.
```

**Du testest.**
1. Die Texte lesen.
2. Die Webseite auf dem Handy öffnen.
3. Settings → Legal zeigt die Texte.

### `STORE-SETUP` – Konten und Test-Builds

**Ziel.** Die App läuft als echte App auf echten Geräten: TestFlight (iPhone) und Play „Interner Test“ (Android).

**Umfang**
1. **Konten** (legst du an, Claude gibt dir die Schrittfolge):
   - **Apple Developer Program:** 99 €/Jahr. Als Privatperson oder als Firma; eine Firma braucht eine D-U-N-S-Nummer.
   - **Google Play Console:** 25 $ einmalig. **Neue private Konten** müssen vor der ersten Veröffentlichung einen geschlossenen Test mit **mindestens 12 Testern über 14 Tage am Stück** machen. Stand 2025; prüfe den aktuellen Stand, bevor du planst.
   - **Expo/EAS-Konto.**
2. **Projekt-Konfiguration:**
   - `eas.json` mit den Profilen development, preview und production.
   - Bundle-ID und Package-Name.
   - Ein Versionsschema.
   - Icon und Splash aus `BRAND`.
3. **Erste Builds:** TestFlight intern und Play „Interner Test“.

**Du bereitest vor.**
- Die Konten anlegen und bezahlen.
- Die Tokens als GitHub-Secrets hinterlegen.
- Die Testgeräte registrieren.

**Modell · Effort · Sitzungen:** Sonnet 5 · high · 1

**Prompt**
```
Stufe STORE-SETUP aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „STORE-SETUP“ vollständig.
Richte eas.json, app.json (Bundle-IDs, Versionen, Icon, Splash) und den Build-Workflow ein. Schreib mir für jeden Schritt, den nur ich machen kann (Konten, Zahlungen, Tokens), eine nummerierte Anleitung.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: eingerichtet · meine Schritte · meine Test-Checkliste · offene Fragen. Dann stopp.
```

**Du testest.**
1. Die App über TestFlight (iPhone) installieren und eine Lektion spielen.
2. Dasselbe über Play „Interner Test“ (Android).
3. Haptik und Töne prüfen.

### `ANALYTICS` – Absturzberichte, Lernauswertung, „Fehler melden“

**Ziel.** In der Beta sehen, wo die App abstürzt und wo Lernende hängen bleiben, ohne mehr Daten als nötig.

**Umfang**
1. **Absturzberichte**, z. B. mit Sentry (EU-Region), nur mit Einwilligung.
2. **Datensparsame Lernauswertung:**
   - Pro Frage: richtig, falsch, abgebrochen.
   - Pro Lektion: Dauer und Abschluss.
   - Keine personenbezogenen Daten; begrenzte Aufbewahrung.
3. **Einwilligung** im Einstieg und in den Settings, jederzeit widerrufbar.
4. **„Fehler melden“-Knopf pro Screen** (K8): schickt Screen-ID und Text per E-Mail oder Formular.
5. **Wöchentlicher Bericht** als Skript: die schwersten Fragen und die häufigsten Abbrüche.
6. **Die Datenschutzerklärung** wird entsprechend angepasst.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe ANALYTICS aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „ANALYTICS“ vollständig, dazu die Datenschutzerklärung aus LEGAL-DRAFT.
Ohne Einwilligung wird nichts gesendet – beweise das mit einem Test.

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · welche Daten wohin gehen (Tabelle) · meine Test-Checkliste · offene Fragen. Dann stopp.
```

**Du testest.**
1. Die Einwilligung ablehnen: Es wird nichts gesendet.
2. Zustimmen und `#debug-crash` auslösen: Der Absturz erscheint im Dashboard.
3. „Fehler melden“ einmal ausprobieren.

### `BETA-1` – echte Tester

**Ziel.** Echte Menschen, echtes Feedback, bevor Swing geschrieben wird.

**Umfang**
1. **Tester:**
   - 10–30 Personen.
   - Mindestens 12, wenn der Test gleich als Google-Pflichttest zählen soll.
   - Mindestens 3 davon ohne Trading-Vorwissen.
2. **Dauer und Kanäle:** 2–4 Wochen über TestFlight und den Play Closed Test.
3. **Fragebogen:** Anhang D.
4. **Jede Woche eine Runde:**
   1. Claude wertet Analytics und Feedback aus und schreibt eine priorisierte Liste.
   2. Du wählst aus.
   3. Eine Fix-Sitzung setzt es um.
   4. Update an die Tester: per EAS Update bei JS- oder Content-Änderungen, ein neuer Build nur bei nativen Änderungen.

**Erfolg**
- Crash-frei ≥ 99,5 %.
- Abgeschlossene Lektionen ≥ 85 %.
- Spaß ≥ 4/5.
- Verständnisfragen ≥ 80 % richtig.
- Nach 7 Tagen noch aktiv ≥ 25 %.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 2–4 (eine Sitzung pro Wochenrunde)

**Prompt** (pro Woche)
```
Stufe BETA-1, Woche [n], aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md den Abschnitt „BETA-1“. Werte aus: [Analytics-Export / Feedback einfügen].
Erst die priorisierte Liste (Wirkung × Aufwand), dann warte auf meine Auswahl, dann setze sie um.
PR, alle Checks grün, Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Danach:** Entscheidung E (Swing vor v1.0?) mit den Beta-Zahlen treffen.

---

## 11. Phase G – Übungsinhalte

Die Detail-Prompts stehen in Anhang E; sie wurden aus der alten Planung übernommen und aktualisiert.

### `REPLAY-PILOT` – ein Replay, von Hand

**Ziel.** Erst ein Replay, dann entscheiden.
- Zeigt es, dass das Format trägt, bleiben die zwölf zurückgestellten Drill-Packs gestrichen.
- Wenn nicht, werden stattdessen diese Packs geschrieben.

**Umfang:** ein Replay von Hand plus die Validator-Regeln dafür.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe REPLAY-PILOT aus docs/build-plan.md. Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1, dann befolge Anhang E.2 (Pilot). PR statt Push auf main. Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Du testest.** Das Replay in der Test-Bench spielen:
- Ist das „Ist es jetzt?“-Gefühl da?
- Sind die Auflösungen (Textbook, Early, Late, Phantom) fair?

### `SPOT-IT` – der Replay-Tab

**Ziel.** Der Replay-Tab aus `docs/UI.md` §7.7 ist in der App.

**Umfang**
- Auswahl nach schwachen Konzepten.
- Stufen-Freigabe nach Lese-Level.
- Die Leiste am Ende einer Session.
- Kostet nie Herzen, hat nie einen Timer.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe SPOT-IT aus docs/build-plan.md. Lies CLAUDE.md, docs/UI.md §4.4 und §7.7, docs/schema.md § Replays und in docs/build-plan.md Abschnitt 1. Baue den Tab nach §7.7. PR, alle Checks grün, Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Du testest.** Den Tab öffnen und zwei Replays spielen. Stimmt die Leiste am Ende?

### `DRILLS` – zwei Packs

**Ziel.** Die zwei Packs `selection` und `risk-calls`, die kein Replay ersetzt.

**Umfang:** Beide Packs werden in der Sitzung geschrieben; die Batch-API braucht es dafür nicht.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe DRILLS aus docs/build-plan.md. Lies CLAUDE.md, docs/schema.md § Drill packs und in docs/build-plan.md Abschnitt 1. Schreibe scalping-selection (25) und scalping-risk-calls (25) nach Anhang E.4, validiert unter --strict. PR, Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Du testest.** Im Übungs-Tab je fünf Fragen aus beiden Packs spielen.

### `REPLAY-BANK` – 22 Replays

**Ziel.** 22 Replays für Scalping, nur wenn `REPLAY-PILOT` gezeigt hat, dass das Format trägt.

**Umfang:** drei Replays pro Sitzung, nach Setup-Karte gruppiert.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · ~8

**Prompt** (pro Sitzung)
```
Stufe REPLAY-BANK aus docs/build-plan.md. Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1, dann befolge Anhang E.2 (Bank) für die Karte [card] auf Lese-Level [1/2/3]. PR, Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Du testest.** Pro Sitzung ein Replay im Tab spielen.

---

## 12. Phase H – Swing-Pfad (Entscheidung E)

**Voraussetzungen**
- `RULES` hat die Regeln „Risiko pro Trade“ und „Gesamt-Exposure“ (Pflicht, `docs/agent.md` §3.6).
- Alle Regeln aus Phase E gelten von Anfang an:
  - Varianz ab Kapitel 2;
  - `stop`/`target` ab Kapitel 3;
  - Vorzeichen, Textlänge, Bildquote.

**Swing ist anders als Scalping**
- Mehrere Positionen gleichzeitig.
- Das Risiko-Budget bindet, nicht der Kontodeckel.
- Übernacht- und Wochenendrisiko.
- 90 Tage Simulator statt 30.

In Swing Kapitel 3 revidiert die Plan-Karte `setup_max_account_pct` mit der Swing-Begründung.

**Bei EU-DE** betont der Pfad: Swing mit Kassa-Aktien ist ohne PDT-Regel und ohne Hebel machbar. Das ist genau die Zielgruppe, die Kapitel 1 zu Swing schickt.

### `SWING-2` … `SWING-8`

**Ziel.** Swing-Kapitel 2–8 nach `docs/curriculum.md`.

**Umfang:** ein Kapitel pro Stufe, in Blöcken von 4–6 Levels, nach allen Regeln aus Phase E.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–2 je Kapitel

**Prompt** (`[N]` = Kapitel)
```
Stufe SWING-[N] aus docs/build-plan.md.

Lies CLAUDE.md, docs/agent.md, docs/schema.md und docs/UI.md vollständig, in docs/curriculum.md den Swing-Abschnitt Kapitel [N] (mit grep finden), in docs/build-plan.md Abschnitt 0 („Varianz“), Abschnitt 1 und Abschnitt 12, und die Referenzdateien aus docs/agent.md §3.8.
Befolge zusätzlich die Klausel in Anhang E.7.
Schreibe in Blöcken von 4–6 Levels; nach jedem Block validate_content.py (0 Fehler, keine Warnung zu deinen Dateien) und check_sizing.py. Am Ende --strict für das Kapitel, Render-Test, die drei Handprüfungen.
Öffne einen PR gegen main. Bericht auf Deutsch: --status-Tabelle · Abweichungen von der Gliederung mit Grund · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

**Du testest (~20 Min. je Kapitel)**
1. Zwei Lektionen und den Checkpoint spielen.
2. Eine Lektion lesen wie ein Anfänger.

**Nach `SWING-8`:** Die Pfadwahl gibt Swing frei; das „Being written“ fällt weg.

### `SWING-REVIEW`

**Ziel.** Beide Reviews für Swing: Anhang E.5 (Pass A) und E.6 (Pass B, mit dem Absolventen-Profil).

**Umfang:** erst Befunde, dann entscheidest du, dann folgen die Korrekturen.

**Modell · Effort · Sitzungen:**
- Reviews: Fable 5.1 · high (Pass A) und max (Pass B).
- Korrekturen: Opus 5.5 · high.
- Insgesamt 2–4 Sitzungen.

---

## 13. Phase I – Plattform

### `BACKEND` – Konto und Sicherung (Entscheidung K)

**Ziel.** Der Fortschritt der Lernenden geht nicht verloren.

**Umfang, je nach Entscheidung K**
- **K = nein (Empfehlung für v1.0): Sicherung ohne Konto.**
  - Prüfen, dass die System-Backups (iCloud, Android Auto Backup) den Fortschritt enthalten.
  - Dazu „Fortschritt exportieren/importieren“ als Datei.
- **K = ja: Supabase.**
  - Anmeldung mit Apple, Google und E-Mail. Bietet die App Social Logins an, verlangt Apple eine gleichwertige datenschutzfreundliche Option; in der Praxis ist das „Sign in with Apple“.
  - Sync von Fortschritt und Plan (mit Historie).
  - Konto-Löschung in der App (Store-Pflicht).
  - Datenexport (DSGVO Art. 20).
  - EU-Hosting und Zugriffsregeln (RLS).

**Modell · Effort · Sitzungen:** Opus 5.5 · xhigh · Planmodus · 2–3

**Prompt**
```
Stufe BACKEND aus docs/build-plan.md. Entscheidung K: [ja/nein].
Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „BACKEND“ vollständig. Zeig mir zuerst deinen Plan (Datenmodell, Konflikte bei zwei Geräten, Datenschutz) und warte auf meine Freigabe.
PR, alle Checks grün, Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Du testest.**
- Den Fortschritt exportieren und in einem neuen Browser bzw. auf einem neuen Gerät importieren.
- Bei K = ja: zwei Geräte, ein Konto; beide zeigen denselben Stand.

### `MONEY` – Bezahlmodell (Entscheidung I)

**Ziel.** Das Bezahlmodell aus Entscheidung I ist eingebaut, ehrlich und nach Store-Regeln.

**Umfang**
- RevenueCat (`docs/agent.md` §1).
- Paywall ohne Dark Patterns; der kostenlose Teil wie entschieden.
- „Käufe wiederherstellen“.
- Store-Produkte angelegt.
- AGB und Widerrufsbelehrung für digitale Inhalte ergänzt.
- **Nie** Herzen, Serien-Reparaturen oder „Gewinn“-Versprechen verkaufen.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–2

**Prompt**
```
Stufe MONEY aus docs/build-plan.md. Entscheidung I: [Modell, Preise, was gratis ist].
Lies CLAUDE.md, docs/agent.md §1 und §7 und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „MONEY“. PR, alle Checks grün, Bericht auf Deutsch mit Test-Checkliste (Sandbox-Käufe). Dann stopp.
```

**Du testest.**
- Ein Sandbox-Kauf auf iPhone und Android.
- Wiederherstellen.
- Die kostenlosen Teile sind ohne Kauf spielbar.

### `UPDATES` – Inhalte ohne Store-Update

**Ziel.** Inhalte lassen sich nach dem Release ändern, ohne neuen Store-Build und ohne dass Fortschritt verloren geht.

**Umfang**
- `expo-updates` mit Kanälen (preview, production).
- Content-Versionen.
- **Fortschritts-Migration:** Ändert sich nach dem Release eine Lektions-ID, sorgt eine Migrationstabelle dafür, dass kein Fortschritt verloren geht. Die Regel dazu steht in `docs/agent.md` §6.
- Kapitel werden nachgeladen statt alles im ersten Bundle.
- Offline-Verhalten.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe UPDATES aus docs/build-plan.md. Lies CLAUDE.md, docs/agent.md §6 und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „UPDATES“. PR, alle Checks grün, Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Du testest.**
- Ein Content-Update in die Preview schicken: Es kommt ohne Neuinstallation an.
- Eine umbenannte Test-Lektion behält ihren Fortschritt.

### `TECH` – Aufräumen, nur mit Messwert

**Ziel.** Aufräumen dort, wo eine Messung zeigt, dass es hilft.

**Umfang**
1. **Zuerst messen:** Bundle-Größe, Kaltstart, Speicher und Bildrate auf einem günstigen Android-Gerät.
2. **Dann nur, was die Messung rechtfertigt:**
   - `Chart.tsx` (1.818 Zeilen) aufteilen.
   - Optional `expo-router`.
   - Optional ein JSON-Schema als einzige Quelle für TS-Typen und Validator (S39).

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–2

**Prompt**
```
Stufe TECH aus docs/build-plan.md. Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „TECH“. Miss zuerst und berichte; ändere nur, was eine Messung rechtfertigt, und miss danach erneut. PR, alle Checks grün, Bericht auf Deutsch (Messwerte vorher/nachher) mit Test-Checkliste. Dann stopp.
```

**Du testest.** Die App fühlt sich gleich oder schneller an; die Messwerte vorher und nachher stehen im Bericht.

---

## 14. Phase J – Release

### `A11Y-PERF` – Barrierefreiheit und Tempo auf echten Geräten

**Ziel.** Die App funktioniert für alle und läuft auch auf günstigen Geräten flüssig.

**Umfang**
- **Screenreader:** eine ganze Lektion und einen Checkpoint mit VoiceOver (iPhone) und TalkBack (Android).
- **Große Schrift:** Dynamic Type bis 130 %.
- **Reduce Motion, Farbenblind-Palette, Kontrast.**
- **Günstige Geräte:** ein kleines iPhone (SE) und ein günstiges Android-Gerät.
- **Offline:** Flugmodus.
- **Akku.**

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1

**Prompt**
```
Stufe A11Y-PERF aus docs/build-plan.md. Lies CLAUDE.md, docs/UI.md §10 und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „A11Y-PERF“. Prüfe, was automatisch prüfbar ist, behebe Befunde und schreibe mir die Geräte-Checkliste. PR, Bericht auf Deutsch. Dann stopp.
```

**Du testest (~30 Min.)** Die Geräte-Checkliste aus dem Bericht, mit VoiceOver bzw. TalkBack an.

### `LEGAL-FINAL` – Prüfung durch einen Anwalt

**Du:** Ein Anwalt bzw. eine Kanzlei (IT- und Finanzrecht) prüft:
- alle Rechtstexte;
- den Risikohinweis und die Formulierungen in Kapitel 8 Level 15 und in den Marktprofilen, besonders die Abgrenzung zur Anlageberatung;
- die Marke (Name);
- AGB und Widerruf beim Bezahlmodell;
- Datenschutz und Analytics.

Danach übernimmt eine Sitzung die Änderungen: Opus 5.5 · high.

### `STORE-LISTING` – der Store-Eintrag

**Ziel.** Der Store-Eintrag ist vollständig und verspricht nichts, was die App nicht hält.

**Umfang**
- **Screenshots** in den aktuell geforderten Größen.
- **Texte** auf Deutsch und Englisch: Titel, Untertitel, Beschreibung, Keywords.
- **Kategorie:** Bildung.
- **Pflichtangaben:** Altersfreigabe-Fragebogen, Datenschutzangaben (Apple) und „Data safety“ (Google), Support- und Datenschutz-URL.
- **Review-Notiz:** synthetische Daten, kein echter Handel, kein Konto nötig.
- **Keine Wörter wie „Gewinn“, „profit“ oder „earn money“** (`docs/agent.md` §1, §7 und die Store-Regeln).

**Modell · Effort · Sitzungen:** Sonnet 5 · high · 1

**Prompt**
```
Stufe STORE-LISTING aus docs/build-plan.md. Lies CLAUDE.md, docs/agent.md §1 und §7 und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „STORE-LISTING“. Zielmärkte/Sprachen: [Entscheidung M]. Lege alles unter store/ ab und schreibe mir, was ich wo eintragen muss. PR, Bericht auf Deutsch. Dann stopp.
```

**Du testest.** Die Texte lesen und die Screenshots auf dem Handy ansehen: Würdest du die App laden?

### `BETA-2` – der Release-Kandidat

**Ziel.** Der Release-Kandidat übersteht einen letzten Test mit echten Nutzern.

**Umfang**
- TestFlight extern (mit Beta-Review) und der Play Closed Test.
- Der Google-Pflichttest (≥ 12 Tester × 14 Tage), falls er in `BETA-1` noch nicht erfüllt wurde.
- Letzte Fixes, wöchentlich wie in `BETA-1`.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–3 (eine Sitzung pro Runde)

**Prompt** (pro Runde)
```
Stufe BETA-2, Runde [n], aus docs/build-plan.md. Lies CLAUDE.md und in docs/build-plan.md die Abschnitte „BETA-1“ und „BETA-2“. Werte aus: [Analytics-Export / Feedback]. Erst die priorisierte Liste, dann meine Auswahl, dann umsetzen. PR, alle Checks grün, Bericht auf Deutsch mit Test-Checkliste. Dann stopp.
```

**Fertig, wenn** die Definition of Done aus Abschnitt 0 vollständig erfüllt ist.

### `RELEASE` – Einreichen und Launch

**Ziel.** v1.0 ist im Store, und die erste Woche danach ist begleitet.

**Umfang**
1. **Einreichen** bei Apple und Google.
2. **Reviews beantworten:** Claude schreibt Antwortentwürfe, falls ein Review etwas beanstandet.
3. **Stufenweiser Rollout** bei Google Play: 10 % → 50 % → 100 %.
4. **Eine Woche täglich** Abstürze und Bewertungen ansehen.
5. **Hotfixes:** per EAS Update bei JS- und Content-Fehlern, sonst ein neuer Build.
6. **Rückblick** nach einer Woche.

**Modell · Effort · Sitzungen:** Opus 5.5 · high · 1–2

**Prompt**
```
Stufe RELEASE aus docs/build-plan.md. Lies CLAUDE.md und in docs/build-plan.md Abschnitt 0 (Definition of Done) und den Abschnitt „RELEASE“. Prüfe die Definition of Done Punkt für Punkt mit Belegen, erstelle die Release-Checkliste und begleite das Einreichen. Bericht auf Deutsch. Dann stopp.
```

---

## 15. Phase K – Nach dem Release (Ausblick)

Nicht Teil von v1.0. Jede Idee hier bekommt vor dem Start eine eigene Stufe in diesem Plan.

- **`DAY-TRADING`:** Kapitel 2–8 nach `docs/curriculum.md`, wie Phase H.
- **`DEUTSCH`:** deutsche Oberfläche (die i18n-Schlüssel gibt es ab `ONBOARDING`) und danach der Content. Die Übersetzung braucht eine Fachkorrektur durch einen Menschen.
- **`FREUNDE`:** eine Freundesliga mit Opt-in statt globalem Leaderboard (W7). Gewertet werden Entscheidungen, nicht XP-Menge.
- **`KI-ERKLÄRER`:** „Erklär's mir anders“ nach einer falschen Antwort, über die Claude API (K9). Nur mit harten Leitplanken: keine Signale, keine Anlageberatung, nur der Stoff der Lektion.
- **Replays und Drills für Swing.**
- **Widgets:** Serie, Tagesziel.
- **Trader Card:** teilen, Erfolge.
- **Tablet- und Querformat-Charts.**

---

## 16. Anhang

### A. Vorlage: Fehlerbericht

```
Stufe:
Link: <Vorschau>/#level-09-2/3
Gerät: (z. B. iPhone 13, hell) 
Was ich gemacht habe:
Was passiert ist:
Was ich erwartet habe:
Wie schlimm: blockiert / nervt / Kleinigkeit
(Screenshot anhängen, wenn möglich)
```

Mehrere Punkte schreibst du einfach untereinander. Claude sortiert sie selbst.

### B. Vorlage: Abnahme einer Stufe

```
OK <STUFE> – merge
Checkliste: 1 ✓ 2 ✓ 3 ✗ (siehe unten) 4 ✓
Spaß (1–5):
Was mir aufgefallen ist (auch Kleinigkeiten, auch für spätere Stufen):
```

Steht ein ✗ in der Liste, antwortest du nicht mit „OK“, sondern mit dem Fehlerbericht.

### C. Laientest (für `FUN-PASS` und `VARIANCE`)

1. **Die Person:** kein Trading-Vorwissen, wenn möglich nicht aus deinem engsten Umfeld.
2. **Einführung:** Sag nur „Das ist eine Lern-App für Trading, probier sie aus“. Keine weitere Erklärung.
3. **Beobachten:** Lass sie laut denken, schau zu und hilf nicht.
4. **Notieren:** jedes Zögern, jedes „Hä?“, jedes Lächeln. Dazu den Screen-Link.
5. **Danach fragen:**
   - Was hat Spaß gemacht? Was hat genervt?
   - Erklär mir in einem Satz, was ein Spread ist. (Oder den Begriff der Lektion.)
   - Du hast richtig entschieden und trotzdem verloren – was heißt das? (nach 1·2-4)
   - Würdest du morgen weitermachen? Warum (nicht)?
6. **Ergebnis:** Die Notizen gibst du Claude unverändert.

### D. Beta-Fragebogen (Wochenende 1 und 2)

1. Wie viel Spaß macht die App? (1–5)
2. Wie gut verstehst du, was erklärt wird? (1–5)
3. Zu schwer, genau richtig oder zu leicht?
4. Was nervt am meisten?
5. Was gefällt dir am besten?
6. Du hast richtig entschieden und trotzdem Geld verloren. Was bedeutet das? (Freitext)
7. Dein Konto hat 10.000 $. Du riskierst 1 % pro Trade, und dein Stop ist 0,20 $ entfernt. Wie viele Aktien kaufst du? (Richtig: 500)
8. Würdest du die App weiterempfehlen? (0–10)

### E. Prompt-Rahmen und Content-Prompts

**E.0 – Der Rahmen jedes Prompts** (deutsch; die Stufen oben füllen ihn aus)
```
Stufe <NAME> aus docs/build-plan.md.

Lies CLAUDE.md und in docs/build-plan.md Abschnitt 1 sowie den Abschnitt „<NAME>“ vollständig; lies die dort genannten Stellen aus docs/.
Setze genau diesen Umfang um – nichts aus späteren Stufen.

<Besonders wichtig: …>

Öffne einen PR gegen main und bring alle Checks auf grün.
Bericht auf Deutsch: gebaut · Check-Ergebnisse · meine Test-Checkliste mit echten Links · offene Fragen. Dann stopp.
```

Die folgenden Detail-Prompts sind englisch. Sie stammen aus der vorherigen Planung und haben sich bewährt. Aktualisiert wurden:
- Die Entscheidungen A–C sind jetzt getroffen.
- PR statt Push auf `main`.
- Die neuen [v4]-Regeln gelten.

**E.1 – OFFER (Chapter 8 Level 15 and its renumber)**
```
Read CLAUDE.md, then docs/agent.md §1, §3.6, §3.11, §3.12 and §7, docs/schema.md and
docs/UI.md in full, then the Chapter 8 section of docs/curriculum.md - find it with
`grep -n 'Chapter 8 —' docs/curriculum.md` and read that range; the first match is the
scalping one.

Part 1 - the renumber, committed on its own.
In content/paths/scalping/chapter-08-the-trading-day/, Levels 15-17 become 16-18:
git mv each level-15-*.yaml to level-16-*.yaml, 16 to 17, 17 to 18. Highest first so
nothing collides. Update each file's `id`, and repair the `prerequisite` chain so it
reads straight through with Level 15 absent for now (14's last sub -> 16-1). Grep the
repo for anything naming those ids or the old titles and fix it (docs, the content
index, tests). Run `python3 tools/validate_content.py`; 0 errors. Commit as
"content: renumber chapter 8 levels 15-17 to 16-18".

Part 2 - write Level 15, "What You'll Actually Be Offered", 4 sub-levels, per the
curriculum table. Read first, and do not contradict: Chapter 3 Level 10 (the two
ceilings), Chapter 6 Levels 1-2 (the stop, R) and Level 9 (session limits), Chapter 3
Level 14-1 (borrow availability, and its {{market.scalping_note}} screen - build on it,
never repeat it), and Chapter 1 Levels 12-13 (what they say about accounts and shorting).

The product decisions are made (docs/build-plan.md §4.1, docs/agent.md §1.1 and §3.6):
(A) the path ends at a person who can start - this level gives the knowledge for the
first real account, and it is still orientation, not instruction; (B) a short needs a
margin-enabled account - say so plainly; (C) several same-day round trips need a margin
account, and in the US the pattern-day-trader rule applies below the equity threshold in
{{market.regulation_note}} - say so plainly, against the six-trade session this path
teaches.

  15-1  The two account types and what each allows. A cash account cannot borrow, so it
        cannot short at all - and 38% of this path's decisions are shorts. In Europe, the
        leveraged wrappers this path did not teach: recognise them, never use them here.
  15-2  What leverage does to numbers they already own. R is unchanged - the stop is
        still the stop. The ruin arithmetic is not: a deposit that survives six
        stop-outs on cash does not survive six at 5:1. Use Chapter 3's account sizes.
  15-3  What the rules do to the plan they wrote. {{market.regulation_note}} in place;
        the pattern-day-trader threshold against the six-trade session Chapters 6 and 8
        teach; settled funds against the same. Tax gets exactly one screen: profits are
        taxed, treatment differs by country and holding period, ask an adviser - no
        rate, no jurisdiction rule, no worked example (§7).
  15-4  Practice: choosing the account that fits their own plan sheet, and the checklist
        for judging a broker (regulation, deposit protection, cost structure, order
        types, borrow) - criteria only, never a name.

Also in this stage, content/market_profiles.yaml: EU-DE fee_note names no prices (§7);
EU-DE regulation_note says precisely what ESMA's negative-balance protection covers
(leveraged CFDs), not "losses are capped at the account"; the US pattern-day-trader
wording is checked against the current FINRA rule (the rule is under reform - search,
cite the source and date in the report); add a `checked:` date to every regulation
note; timezone "German time" instead of "CET"; first_minutes in the same format as
premarket.

Non-negotiable:
- No product, platform or provider named. No mechanics for opening or using a
  leveraged account. Nothing phrased as a recommendation. §7 governs every screen.
- Every number obeys docs/agent.md §3.6, including both ceilings and the account cap;
  the [v4] rules in §3.11 and §3.12 apply to every decision and numeric screen.
- {{market.*}} tokens for every session time, index and regulation note - never a
  literal clock time, never a jurisdiction claim written in prose.
- Set `reinforces: [3, 6]` per the curriculum table.

Run `python3 tools/validate_content.py --strict`, `tools/test_validate.py` and
`tools/check_sizing.py`; 0 errors, no warning naming a file you wrote. Commit as
"content: chapter 8 level 15" and open the stage PR.

Report: the four subs with their screen mix, every place you used a {{market.*}} token
instead of a jurisdiction claim, your sources for the regulation notes with dates, and
any sentence you were unsure sits on the right side of the §7 line - flag those rather
than deciding them.
```

**E.2 – REPLAY-PILOT und REPLAY-BANK**

Pilot:
```
Read CLAUDE.md, then docs/agent.md §3.10, docs/schema.md § Replays and docs/UI.md §4.4
and §7.7 in full. Then read content/paths/scalping/chapter-07-scalping-playbook/
level-02-1.yaml and level-02-2.yaml - the VWAP bounce card and its five fields are the
thing this replay is an instance of.

Write one replay to content/replays/scalping/vwap-bounce-01.yaml: reading level 2
(setup named, card hidden), ~60 bars, one clean VWAP bounce and two decoys that each
fail exactly one named field of the same card.

Then extend tools/validate_content.py with the replay rules from docs/schema.md
§ Replays - every error and warning listed there - and add cases to
tools/test_validate.py proving each one fires, in the style already there.

Non-negotiable, and check each by hand before you report:
- trigger_bar equals the highest filled_at of that setup's own fields. If it does not,
  the replay is ungradeable.
- Each decoy's `fails` names a field of its card, and that field either never fills or
  fills after the decoy's bar.
- Every stated shares × price is inside the 95% account ceiling, and
  tools/check_sizing.py sees the file.
- Candle high >= max(open, close) and low <= min(open, close) on all ~60 bars.
- Prices in the scalping band ($10-$30), median bar volume in 4,000-500,000.
- At most two fields marked `marginal`.

Run `python3 tools/validate_content.py`, `--strict`, `tools/test_validate.py` and
`tools/check_sizing.py`. Commit as "replays: pilot VWAP bounce plus validator rules"
and open the stage PR.

Report: the bar series with each marked moment and what fills at it, the three grades a
learner would get for acting at bars trigger-1, trigger and trigger+2, and your honest
read on whether 60 hand-authored bars is sustainable 22 times per path.
```

Bank (pro Sitzung, drei Replays):
```
Read CLAUDE.md, then docs/agent.md §3.10, docs/schema.md § Replays and docs/UI.md §4.4.
Read content/replays/scalping/vwap-bounce-01.yaml - the pilot - and the last replays you
wrote, so bar rhythm and decoy style continue rather than restart. Read the Chapter 7
level that teaches [card], for the five fields.

Write [3] replays for [card] to content/replays/scalping/, at reading level [1/2/3] per
the table in docs/curriculum.md § Replays.

Every rule in docs/agent.md §3.10 binds. The two that go wrong silently:
- A decoy you cannot explain is noise, not difficulty. Each fails exactly one named
  field, and the note says which. If you cannot name it, cut the decoy.
- The arithmetic spreads across 60 bars and no single screen shows it all. Recompute
  every stop distance, share count, R-multiple and filled_at from the bars as written.

Verify each file alone before writing the next. Run `validate_content.py --strict`,
`test_validate.py` and `check_sizing.py`; 0 errors, no warning naming a file you wrote.
Commit as "replays: [card] levels [n]" and open the stage PR.

Report: per replay, the marked moments and their labels, which field each decoy fails,
and anything in the placement table you could not honour and why.
```

**E.3 – State-Chips (Teil von `CONTENT-FIX-3`, `-6`, `-7`)**

Stand: Kapitel 1 0 % · 2 100 % · 3 37 % · 4 100 % · 5 100 % · 6 38 % · 7 **16 %** · 8 74 %. Die 0 % in Kapitel 1 sind wahrscheinlich richtig; das ist vorher zu prüfen.
```
In content/paths/scalping/chapter-NN-*/, move session state out of chart-decision
scenario prose and into the screen's `state` chips: day in R, the limit, trades taken,
size, account. Chapters 2, 4 and 5 are already at 100% - read one of their files first
and match how they phrase what is left behind.

What stays in the scenario: what the chart shows and what the learner is looking at.
What moves to chips: the numbers describing the learner's own session.

Two rules from §3.4 that this work exists to serve, and that it is easy to break:
- A scenario describes, it does not conclude. Do not let the shortened sentence become
  three verdict words that answer the question before the chart is read.
- No two consecutive sub-levels may end up with the same sentence shape. Moving state
  out makes scenarios shorter and more alike; vary what remains.

Report the percentage before and after, and any scenario where the state genuinely
belonged in the sentence - those are legitimate and should be listed, not forced.
```

**E.4 – DRILLS (pro Pack)**
```
Write [25] drill screens for the pack "[pack id]", covering these concepts:
[concept list]. Format per the drill-pack spec in docs/schema.md.

These are drills, not a lesson: no intro, no theory, no summary - question screens only,
each standing alone. The learner has already been taught this in [chapter/level];
assume it and test it.

Vary the interaction across the pack and vary the difficulty: about a third should be
near-misses where the right answer is "pass" or "no trade". Answer-key hygiene per
docs/agent.md §3.5 applies to the pack as a whole - check the distribution across all 25
before you finish. The outcome rule in §3.11 and the sign rule in §3.12 apply too.
Price and volume bands per §3.6. Every number arithmetically sound.
```

**E.5 – Review Pass A (lehrt es?)**
```
Read CLAUDE.md and the docs it names. Then read the complete [path] path in path order:
content/shared/chapter-01-market-basics/, then content/paths/[path]/ chapters 2-8, every
sub-level, as a learner with zero prior knowledge. `python3 tools/export_readable.py`
gives you each chapter as readable text.

Check: terms used before definition across chapters; callbacks to things not yet taught;
the difficulty curve, and whether any level jumps or stalls; question types and prompts
repeated across chapters; distractors that give the answer away; chart-decision "best"
answers that do not follow from the lesson just given; whether variance is taught before
a correct decision first loses, and whether every such reveal reads as "right call,
losing trade" rather than as a mistake; worked numbers; the Chapter 7 playbook setups
against the sources named in docs/agent.md §4; {{market.*}} tokens used where required;
anything a beginner would find boring, patronising or confusing; whether anything is
repeated enough to stick; and whether the questions are answerable by someone who
genuinely understood the lesson and nothing more.

Run `python3 tools/validate_content.py`, `--strict`, `tools/check_sizing.py` and
`tools/test_validate.py` first, so you do not re-report what a tool already catches.

Then give a numbered findings list, most important first, naming the file and screen for
each. Change nothing. Wait for approval before any fix. Report in German.
```

**E.6 – Review Pass B (hält es der Realität stand?) + Absolventen-Profil**
```
Read CLAUDE.md, then docs/agent.md §1, §3.6 and §7 in full, content/market_profiles.yaml,
and the graduate profile in docs/build-plan.md §0.

This pass does not check whether the course teaches well - Pass A does that. It checks
whether the course survives contact with reality. Work these five questions across the
whole [path] path:

1. Every fixed product decision in §1 and every rule in §7: is it *delivered* - in the
   right place, at the right weight - not merely stated in the docs? Name the file and
   screen where each is delivered, or report it as unmet.
2. Every trade the content teaches, against the account the content describes. Can a
   learner actually place it? With which account type, how much capital, which
   permissions? Name any trade the described account cannot execute.
3. Every rule the content teaches, against the rules that actually bind in each market
   profile: position limits, trade limits, settlement, borrow, and whatever
   {{market.regulation_note}} promises.
4. The handover. At the last screen of the path, what does the graduate still not know
   that stands between them and the first thing the path tells them to do?
5. The graduate profile, point by point: where is each point taught (file, screen), or
   is it missing - and where would it belong?

Two method rules, and ignoring them is how this pass fails:
- Match counts lie. Read the hits. A previous scan reported `margin` and `settle` as
  covered; every match was the word "marginal" and the verb "settles". A grep result is
  a place to look, never an answer.
- Grep the concept, not the word. The same scan reported the instruments lesson absent;
  it exists inside {{market.scalping_note}}, which contains neither "leverage" nor
  "CFD". Before concluding something is missing, ask what it would be called here.

You are worst at this pass, because it needs knowledge from outside this repository.
Where you cannot decide, say so and name the decision rather than guessing.

Numbered findings list, most important first, file and screen for each. Change nothing.
Report in German.
```

**E.7 – Klausel für neue Pfade (Swing, später Day Trading)**
```
The Scalping path's Chapter [N] covers the same ground for a different holding period.
Read it for structure, pacing and screen mix - then write for this path's timeframe from
scratch. Do not port examples across. Where the honest answer is that this path does the
same thing scalping does, say so in one screen and move on rather than padding the level.

One rule changes for this path (docs/agent.md §3.6): the concentration teaching is
scalping's. On swing the risk budget binds, not the account ceiling; positions run
10-50% of the account and several are open at once, so total exposure and total open
risk are what matter - the validator checks both. Chapter 3 revises the learner's
`setup_max_account_pct` with this path's reason. Overnight and weekend gaps are this
path's own risk; say what a gap does to a stop.

Every [v4] rule applies from the first file: variance (§3.11) from Chapter 2, stop and
target on directional decisions from Chapter 3, signs (§3.12), text length, spelling,
visuals.
```

**E.8 – SIZING** (für jedes Kapitel, in dem `check_sizing.py` Verstöße meldet)
```
Read CLAUDE.md and docs/agent.md §3.6 in full - the two ceilings, the account cap, the
per-path table and the price bands.

Run `python3 tools/check_sizing.py --chapter N` and re-size every position it lists so
that shares × decision price <= 0.95 × the account named in that file (and, after the
learner's plan card, the plan's ceiling - docs/agent.md §3.6).

How to re-size, in this order of preference:
1. Lower the share count. Check what the new count does to every other line in the same
   file - check_sizing.py prints them.
2. Shift the whole screen's prices by a constant. This preserves every cent-level
   distance, so stop distances, R-multiples and dollar totals stay exactly correct.
   Keep the result inside the path's price band (§3.6).
3. Raise the account named in the file, but only within $5,000-30,000 and only if the
   file's own narrative allows it.

Never change a stop distance to make the arithmetic work - that changes what the lesson
teaches. After each file, recompute by hand: stop distance, share count, risk in
dollars, R-multiple, and every total the screens quote. Then run validate_content.py,
check_sizing.py --chapter N and test_validate.py: 0 errors, 0 breaches in your chapter.
Open the stage PR. Report the breach count before and after and which method you used
where.
```

### F. Wo landet welcher Punkt aus dem Review

IDs aus `docs/review-2026-09-25.md`.

| Punkt | Stufe |
|---|---|
| M1 Plan-Übersicht | `STABIL-APP` |
| M2 depth-ladder | `STABIL-DATA` |
| M3 `levels` NaN | `STABIL-DATA` |
| M4 Recap | `STABIL-APP` (Renderer), `CONTENT-FIX` (`card:`) |
| M5 amber-Satz | `STABIL-APP` |
| M6 Screenreader-Leck | `STABIL-APP` |
| M7 Auflösung | `STABIL-APP` |
| M8 Risikohinweis, Legal, Onboarding | `ONBOARDING`, `LEGAL-DRAFT`, `LEGAL-FINAL` |
| M9 Outcome-Bias | `RULES`, `VARIANCE`, `CONTENT-FIX-1…8` |
| M10 Vorzeichen | `RULES`, `CONTENT-FIX` |
| M11 Herzen-Sackgasse | `LOOP-HEARTS`, `PRACTICE` |
| M12 PR #13 | `MERGE` ✅ |
| M13 Content einbinden | `WIRE` |
| M14 CI | `CI`, `WIRE`, `STABIL-DATA` |
| M15 50 % vs. Übungen | `RULES` (plan-bewusster Deckel), `CONTENT-FIX-2` |
| M16 Entscheidungen A–C | `DOCS` ✅, `OFFER` |
| M17 Marktprofile | `OFFER` |
| S1 Visuals | `VISUALS`, `CONTENT-FIX` |
| S2–S5 Schrift, kleine Displays, Daumenzone, Tempo | `LOOK-BRIEF`, `LOOK-SYSTEM` |
| S6–S8 Charts, Knöpfe, Match | `LOOK-COMPONENTS` |
| S9 HUD | `LOOK-SYSTEM` |
| S10 Serie | `LOOP-DAILY` |
| S11 Lektionsabschluss | `LOOK-COMPONENTS`, `LOOP-HEARTS`, `VARIANCE` |
| S12–S13 Abbrechen-Dialog, Tap-Flächen | `LOOK-SYSTEM` |
| S14–S15 Test-Auswertung, Wiederholen | `LOOP-HEARTS` |
| S16 Glossar | `GLOSSARY` |
| S17–S18 Hell, Farbenblind | `LOOK-SYSTEM` |
| S19 Übungs-Tab | `PRACTICE` |
| S20 Statistik | `STATS` |
| S21 Badge | `LOOK-COMPONENTS` |
| S22 Plan-Karte | `ONBOARDING` |
| S23 Fehlerseite | `STABIL-APP` |
| S24 Visual-Details | `LOOK-COMPONENTS` |
| S25 Marktprofil | `ONBOARDING` |
| S26–S27 Ende des Inhalts, Pfadwahl | `WIRE` |
| S28–S37 Content | `RULES`, `CONTENT-FIX` |
| S38 Content-Index | `WIRE`, `UPDATES` |
| S39 eine Quelle für das Format | `STABIL-DATA`, optional `TECH` |
| S40–S41 Tests, Dev-Flag | `CI` |
| S42 Backend | `BACKEND` |
| S43 Store | `STORE-SETUP` |
| S44 Lizenz | `CI` |
| S45 XP | `LOOP-HEARTS` |
| S46 Web-Build | `LOOK-SYSTEM` |
| S47 Auswertung | `ANALYTICS` |
| S48–S52 Doku, Skills | `DOCS` ✅ (Bench-Untertitel: `WIRE`; `first_minutes`: `OFFER`) |
| S53 GitHub-Nutzung | `CI` (PR-Vorlage) |
| S54 Handy-Tests | `CI` |
| K1 Deutsch | `ONBOARDING` (i18n), Phase K |
| K2–K3 Fehler-Runde, „Karte nochmal ansehen“ | `LOOP-HEARTS` |
| K4 Leaderboard | Phase K |
| K5 Trader Card | `STATS`, Phase K |
| K6 Erfolge | `FUN-PASS` |
| K7 Simulator | Phase K |
| K8 „Fehler melden“ | `ANALYTICS` |
| K9 KI-Erklärer | Phase K |
| K10 Wochenrückblick, Widget | `LOOP-DAILY`, Phase K |
| K11 Schriftgröße, Tablet | `LOOK-SYSTEM`, `A11Y-PERF`, Phase K |
| K12 Match | `LOOP-HEARTS` |
| K13 Maskottchen | nicht umgesetzt (W20) |
| K14 Technik-Pflege | `TECH` |
| W1–W25 | siehe Abschnitt 4.1; die Umsetzung steht bei den jeweiligen Stufen |
