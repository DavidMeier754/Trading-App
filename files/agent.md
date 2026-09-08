# agent.md — Trading Learning App

**Diese Datei muss von jedem KI-Agenten (Claude, Copilot, etc.) zu jedem Zeitpunkt der Arbeit an diesem Projekt gelesen und befolgt werden, bevor irgendein Content oder Code erstellt wird.**

---

## 1. Projektübersicht (Kurzfassung)

Eine "Duolingo für Trader"-App: Nutzer lernen Trading über kurze tägliche Lektionen (~15 Min), interaktive Marktszenarien (Long/Short/Kein Trade-Entscheidungen auf historischen Charts), Gamification (XP, Streak, Level) und gezielte Wiederholung. Kein Video-Kurs, kein PDF-Wälzer — Theorie und Praxis sind eng verzahnt.

Vollständiges Konzept: siehe `Trading_Learning_App_Konzept.pdf` (Ursprungsdokument, Quelle der Wahrheit für Vision, Gamification-Mechanik und Monetarisierung).

Tech-Stack: React Native + Expo + TypeScript, Supabase (Auth + DB), RevenueCat (Abos).

---

## 2. Die drei Pfade

Pfade sind nach **Trading-Stil** organisiert, nicht nach Assetklasse. Jeder Pfad ist unabhängig durchlaufbar.

| Pfad | Ordner | Haltedauer |
|---|---|---|
| Day Trading | `/pfade/day-trading/` | Minuten bis Stunden, intraday |
| Swing Trading | `/pfade/swing-trading/` | Tage bis Wochen |
| Scalping | `/pfade/scalping/` | Sekunden bis wenige Minuten |

Jeder Pfad-Ordner enthält eine `info.txt` mit: Investitionsfokus, typische Timeframes, Kern-Strategien, wichtige Lernpunkte.

---

## 3. Literaturquellen pro Pfad (VERBINDLICH)

**Diese Quellen sind die einzige zulässige Wissensbasis für Lektionsinhalte.** Kein einzelnes Buch wird als alleinige Wahrheit behandelt — bei Widersprüchen zwischen Quellen wird der Konsens bevorzugt und ggf. beide Sichtweisen kurz erwähnt. Inhalte werden immer in eigenen Worten neu geschrieben, nie direkt übernommen (Urheberrecht).

### Day Trading
- *How to Day Trade for a Living* — Andrew Aziz (Workflow, Orderarten, Risikomanagement)
- *Technical Analysis of the Financial Markets* — John J. Murphy (Chartlesen, Indikatoren — geteilt mit Swing Trading)
- *Trading for a Living* — Alexander Elder (Psychologie, Risiko, Trading-Journal)

### Swing Trading
- *Trade Like a Stock Market Wizard* — Mark Minervini (Aktienauswahl, Setups, Positionsgrößen)
- *How to Swing Trade* — Andrew Aziz & Brian Pezim (Mechanik, Money Management, Routinen)
- *Technical Analysis of the Financial Markets* — John J. Murphy (geteilt mit Day Trading)

### Scalping
- *How to Day Trade for a Living* — Andrew Aziz (enthält dediziertes Scalping-Kapitel, geteilt mit Day Trading)
- *Mastering the Trade* — John F. Carter (Volatilitäts-Setups, Intraday-Präzision)
- *Technical Analysis of the Financial Markets* — John J. Murphy (technische Basis, geteilt)

**Hinweis:** Seriöse, ausschließlich scalping-spezifische Fachliteratur ist rar. Der Scalping-Pfad stützt sich stärker auf die Day-Trading-Quellen und wendet sie auf kürzere Timeframes an. Das muss beim Content-Schreiben explizit berücksichtigt werden (keine unbelegten Scalping-spezifischen Behauptungen erfinden).

---

## 4. Projektstatus (laufend aktualisiert)

**Diese Sektion wird nach jedem relevanten Prompt aktualisiert.** Sie ist die Übersicht, wo das Projekt inhaltlich gerade steht.

- [x] Schritt 1: Ordnerstruktur, Quellenzuordnung, agent.md angelegt
- [x] Schritt 2: Level-Blueprint (Format, noch ohne Dateien) — inkl. Pfad-Struktur-Klärung (linear mit seltenen Auffächerungen)
- [x] Schritt 3: Kapitel-Ordner + info.txt pro Pfad (6 Kapitel je Pfad, alle 3 Pfade) — inkl. finaler Auffächerungs-Entscheidung (Abschnitt 4c)
- [ ] Schritt 4: Level-Dateien (Level1-1.txt etc.) mit Inhalt aus den Büchern befüllen

**Letzter Stand:** Vollständiger v5-Rebuild abgeschlossen (Fixes: merged feedback screens, Purpose-Feld, korrekte Progress-Counter, vollständige Test/Final-Exam-Coverage, keine self-explanatory Fragen, MC nur bei echter Plausibilität, entschärfte Absolutheits-Aussagen, Jargon-Fixes, fehlende Theorie-Karte für "cost-to-target ratio" ergänzt). Chapter 1 (10 Level, 21 Dateien pro Pfad, Ø 2.1 Subs/Level) für Day Trading und Scalping fertig. Chapter 2 Scalping (17 Level, 31 Dateien, Ø 1.82 Subs/Level) fertig, inkl. neuer Level 3-3 (Quote-Reading-Vertiefung) und Level 15-2 (zweites durchgerechnetes Checklist-Beispiel) als echte Content-Ergänzungen, keine Füll-Level. Chapter 1 in Swing Trading noch ausstehend. Chapter 2 für Day Trading und Swing Trading noch ausstehend.

**Bekannte Abweichung von der Ø-Sub-Vorgabe:** Ziel war Ø 2.4 (Kapitel 1) / Ø 3.0 (Kapitel 2-3) Subs pro Level. Tatsächlich: 2.1 bzw. 1.82. Grund: v5 verbietet ausdrücklich, Subs künstlich nur zur Zahlenerreichung hinzuzufügen ("don't force a third sub just to hit the pattern"). Jede Content-Lücke, die beim Audit gefunden wurde, wurde durch echte neue Level/Subs geschlossen (z.B. Level 6 Quote-Reading in Kapitel 1, Level 3-3 und 15-2 in Kapitel 2) — es wurden aber keine Subs ohne echten Lehrwert ergänzt, um näher an die Zielzahl zu kommen. Bei Bedarf kann die Zielzahl in Abschnitt 7 angepasst werden, oder es kann gezielt nach weiteren echten Content-Lücken gesucht werden.

**Subcategories Day Trading (final):** Test, Final Exam, Repetition, Market Structure, Order Mechanics, Chart Reading, Trading Strategy, Risk & Psychology.
**Subcategories Scalping (final):** Test, Final Exam, Repetition, Market Structure, Order & Spread Mechanics, Chart Reading, Scalping Strategy, Risk & Psychology.

---

## 4b. Pfad-Struktur: "Linear mit seltenen Auffächerungen" (VERBINDLICH)

**Kein Skill Tree. Kein rein linearer Pfad wie klassisches Duolingo.** Ein Mittelweg:

- Der Pfad ist **standardmäßig linear**: Level 1 → 2 → 3 → ... in fester Reihenfolge.
- An **selten und bewusst gewählten Stellen** (nur wenn inhaltlich sinnvoll, NICHT als Standardmuster pro Kapitel) darf sich der Pfad kurzzeitig in **bis zu 3 parallele Stränge** auffächern.
- Die Stränge sind **gleichwertig** — keiner ist wichtiger, keiner ist optional. **Alle müssen durchlaufen werden**, um weiterzukommen.
- Die Reihenfolge **innerhalb** der Auffächerung ist frei wählbar (Nutzer kann Strang A, B oder C zuerst machen), aber am Ende müssen alle drei abgeschlossen sein.
- Die Stränge sind **inhaltlich nicht zwingend miteinander verbunden** — es sind einfach 3 sinnvolle, aufbauende Themen, die nebeneinander bestehen können, ohne dass eines auf einem anderen aufbaut.
- Jeder Strang ist **kurz**: 1-2 Level, nicht mehr.
- Nach der Auffächerung **führt der Pfad immer wieder zu einem gemeinsamen Level zusammen** — nie offen verzweigt lassen.
- **Sehr selten einsetzen.** Faustregel: höchstens 1-2 Auffächerungen pro Pfad insgesamt, nicht pro Kapitel. Zu häufiger Einsatz wirkt überfordernd und widerspricht dem Kernprinzip "kurze, erreichbare Abschnitte" aus dem Konzept.

**Neues Feld im Level-Blueprint:** `PFAD-POSITION` — gibt an, ob ein Level Teil der linearen Hauptspur ist oder Teil einer Auffächerung (inkl. Strang-Kennung und Zusammenführungspunkt). Siehe Abschnitt 7.

---

## 4c. Finale Auffächerungs-Entscheidung (nach Schritt 3)

Beim Schreiben der Kapitel-info.txt-Dateien wurden mehrere plausible Auffächerungs-Kandidaten markiert. Gemäß Prinzip "max. 1-2 Auffächerungen pro Pfad, sehr selten einsetzen" hier die finale Festlegung für Schritt 4:

- **Day Trading:** EINE Auffächerung in Kapitel 3 (Chartlesen) — Candlestick-Muster / Unterstützung-Widerstand / Volumen-Analyse als 3 Stränge, Zusammenführung bei "VWAP". Der Kapitel-4-Kandidat (Einstiegsstrategien) wird NICHT zusätzlich genutzt, um die Regel "selten" einzuhalten.
- **Swing Trading:** EINE Auffächerung in Kapitel 3 (Chartmuster) — VCP / Cup-and-Handle / flache Basis als 3 Stränge, Zusammenführung bei "Gleitende Durchschnitte".
- **Scalping:** KEINE Auffächerung im gesamten Pfad — die schmalere Quellenbasis erlaubt keine 3 gleichwertigen, eigenständigen Stränge, ohne unbelegten Content zu erzeugen (siehe Kapitel 4, Quellenlage-Hinweis). Das ist eine bewusste, inhaltlich begründete Ausnahme, kein Fehler.

Diese Entscheidung ist für Schritt 4 verbindlich, sofern beim tatsächlichen Ausformulieren der Level keine inhaltlichen Probleme auftauchen, die eine Anpassung erfordern (in dem Fall: Rücksprache statt eigenmächtiger Änderung).

---

## 4d. Variable Sublevel-Anzahl (VERBINDLICH, ersetzt feste Zahlen aus Schritt 3)

**Keine feste Sublevel-Anzahl pro Level oder Kapitel.** Stattdessen variabel, je nach tatsächlicher Stoffmenge:

- Manche Level bestehen bewusst aus **nur 1 Sublevel** — kurze, schnell abschließbare Häppchen, die dem Nutzer ein schnelles Erfolgserlebnis geben (z. B. ein einzelnes, klar abgegrenztes Konzept, das keine Vertiefung braucht).
- Andere Level bestehen aus **3-4 Sublevels** — wenn das Thema tatsächlich mehr Tiefe/Übung braucht.
- Die Entscheidung richtet sich NICHT nach einer Formel, sondern nach dem tatsächlichen Stoffumfang: "Wie viel gibt es hier wirklich zu lernen/üben?" Lieber ein Level mit 1 Sublevel zu wenig aufblähen als künstlich strecken.
- Diese Variabilität soll **bewusst über den Pfad verteilt** vorkommen — nicht nur am Anfang (kurze Level) und dann immer länger, sondern auch mal ein kurzes Erfolgserlebnis zwischen längeren Leveln, damit der Rhythmus nicht monoton wird.
- Gilt für alle Kapitel, nicht nur die ersten (das bisherige Prinzip "weniger Sublevels am Anfang" bleibt als Tendenz gültig, aber als Rhythmus-Element, nicht als starre Regel).

Ersetzt alle bisherigen festen Sublevel-Angaben ("2-3 Level, je 2 Sublevels" etc.) aus den Kapitel-info.txt-Dateien — diese werden in der Überarbeitung nach Schritt 3 entsprechend variabel neu formuliert.

---

## 5. Arbeitsprinzipien (IMMER befolgen)

1. **Qualität vor Geschwindigkeit.** Bei Content-Erstellung immer lange über die beste Lernkurve nachdenken — nicht die erstbeste Formulierung nehmen.
2. **Mehrere Quellen kombinieren**, nie ein einzelnes Buch oder einen Influencer als alleinige Wahrheit behandeln.
3. **Keine Copyright-Verletzung.** Inhalte werden aus den Büchern sinngemäß neu erstellt, nie zitiert oder kopiert.
4. **Wenig Sublevels am Anfang jedes Pfades**, damit der Einstieg kurz und motivierend wirkt (siehe Konzept: Nutzer soll nicht von einem "mehrjährigen Kurs" eingeschüchtert werden).
5. **Maximal 4 Sublevels pro Level.**
6. **Keine Profitabilitäts- oder Erfolgsgarantien** in jeglichem Content — die App vermittelt Wissen, nicht garantierten Erfolg (siehe Konzept, Punkt 8).
7. **Nach jedem Schritt anhalten** und explizite Freigabe abwarten, bevor der nächste Schritt beginnt (siehe Abschnitt 6).
8. **Pfad-Struktur beachten** (siehe Abschnitt 4b): überwiegend linear, Auffächerungen nur selten und bewusst platziert, nie als Standardmuster.

---

## 6. Schritt-Ablauf (vom Nutzer vorgegeben, verbindlich)

1. **Schritt 1** — Ordnerstruktur + Quellen + agent.md ✅
2. **Schritt 2** — Blueprint für Level-Aufbau (Art, Dauer, Screens) definieren, NUR als Text in der Antwort zeigen, KEINE Dateien erstellen. Danach anhalten, auf Freigabe warten.
3. **Schritt 3** — Pfad für Pfad: alle Bücher analysieren, 6 Kapitel-Ordner pro Pfad anlegen, je eine `info.txt` mit Kapitelinhalt-Beschreibung. Für alle 3 Pfade. Danach anhalten.
4. **Schritt 4** — Für jedes Level in jedem Kapitel in jedem Pfad: `Level1-1.txt`-Dateien (Level-Sublevel-Schema) mit Blueprint + tatsächlichem Inhalt aus den Büchern befüllen.

---

## 7. Level-Blueprint (v5 — ersetzts v4, verbindlich ab jetzt)

```
Level: X-X
Chapter: X
Path: X
Category: [New Theory / Repetition / Test / Final Exam]
Subcategory: [one of 8 total subcategories for the whole path]
Learning Goal: X
Purpose: [one sentence — why the user is learning this, what it's useful for in real trading]
Screens: [12-16 screens, no separate feedback/ending-analysis screens — see rules below]
[All other relevant info at the end — sources, prerequisites, notes]
```

**Purpose field (NEW in v5):** Every level must state, in one sentence, why the content matters / what it's useful for — not just what the content IS. This goes beyond the Learning Goal (which states the skill gained) to explain the real-world relevance.

**No separate feedback or ending-analysis screens (NEW in v5, corrects v4):** Each question screen must include its own answer reveal/explanation INLINE on the same screen — there is no separate "feedback screen" afterward, and no separate summary/recap screen at the end just to restate what was covered. A level is: intro/theory card(s), then questions (each self-contained with prompt + answer options + immediate inline reveal), done. This roughly halves the old screen count per unit of content, which is why the count changes from a strict 12 to a flexible 12-16 range (see below).

**Screen count (REVISED in v5):** 12-16 screens per sub-level (not a strict 12). Use the low end for lighter content, the high end when there's genuinely more to teach — err toward MORE lessons/subs rather than compressing content to fit a number. Never sacrifice teaching completeness for a screen-count target.

**No self-explanatory questions (unchanged from v4, restated for clarity):** Never ask a question whose answer is trivially derivable from the grammar/logic of the prompt itself (e.g. "which trader closes all trades before session end" only has one style that does this by definition — this must be reframed, e.g. as a multiple-choice with genuinely plausible distractors, or replaced with content the user must actually recall). More generally: only ask about content already taught, or content so simple it needs no separate teaching first (e.g. "is red darker than white" — but this is rare in a trading context, use sparingly).

**Multiple choice requires genuine plausibility (NEW in v5):** Never use MC with 3 throwaway/silly distractors when the real test is "does the user recognize the one correct definition." If there is only one fact being tested with no genuinely tempting alternative, use True/False or fill-in-the-blank instead — MC is reserved for cases where 2+ options are realistically plausible to someone who hasn't fully mastered the distinction yet.

**Sub-level structure within a Level (unchanged from v4):** A "Level" (e.g. Level 1) is internally divided into 2-3 subs:
- The first 1-2 subs (e.g. 1-1, 1-2) are **New Theory**.
- IF a Level has at least 3 subs, the LAST sub (e.g. 1-3) is a **Repetition** of that same Level's own content.
- Levels with genuinely little content may stay at 2 subs — don't force a third just to hit the pattern.

**Average subs per level, INCLUDING Test/Final Exam/standalone Repetition levels (NEW in v5, replaces v4's max-subs-only rule):**
- Chapter 1: average ~2.4 subs per level.
- Chapters 2-3: average ~3 subs per level.
- Chapters 4-6 (and beyond): average ~3.3 subs per level.
Note Test and Final Exam levels have 0 subs each and pull the average down — New Theory/Repetition levels will typically run slightly above the stated average to compensate. This is an average target, not a per-level cap — some levels may reasonably have 4-5 subs if content requires it.

**Progress counters must match actual question count (NEW in v5, critical bug fix):** Any screen displaying "0/N answered" or a summary "X/N correct" MUST have N equal the actual number of scored question screens in that level — no exceptions, no placeholder round numbers. Count actual scored screens when writing the intro/summary screens, every time.

**Test/Final Exam coverage must match their stated Learning Goal (NEW in v5, critical bug fix):** If a Learning Goal or intro claims to cover a list of topics/levels, the actual question set must genuinely test each item on that list — at least one question per named concept. Do not write an aspirational Learning Goal and then a narrower question set. If full coverage would need more than ~10-12 questions, either trim the Learning Goal's claim to match what's actually tested, or add more questions — never leave a gap between claim and content.

**Subcategories (8 total, fixed for the entire path, reused across all chapters):**
1. Test (Category="Test" levels)
2. Final Exam (Category="Final Exam" levels)
3. Repetition (Category="Repetition" sub-levels AND standalone Repetition Levels)
4-8. Five path-specific content subcategories, defined per path

**Level/Sub counting rule:** "Level" refers to the number before the dash (1-1, 1-2, 2-1... — "1" and "2" each count as ONE level). Test and Final Exam levels have no subs and count as exactly one level.

**Chapter length rules:**
- Chapter 1 (Market Basics, identical across all 3 paths): ~12 levels.
- All other chapters: min. 17-20 levels (subs excluded). Make chapters longer if there's more to teach — never compress at the cost of clarity. Teaching completeness is the #1 priority; the numeric targets in this document are guidelines in service of that goal, not hard ceilings that override it. When in doubt, add more content rather than less.
- Category distribution (chapters 2+): ~65% New Theory, ~25% Repetition, ~5% Test (middle of chapter), ~5% Final Exam (end of chapter).
- New Theory sub-levels: simple/easy at first exposure — depth via Repetition subs/levels, not hard first-exposure questions.

**Content progression (per path, after Chapter 1):**
- Chapters 2-4: chart basics through advanced chart reading (breakouts, candlestick patterns, etc.)
- Chapters 5-6+: actual trading strategies.
- Chapter 1 stays generic/path-agnostic — market structure, what a stock/index is, differences between trading styles. No path-specific depth.

**Mandatory post-step self-audit (NEW in v5):** After writing or revising any chapter, re-read the ENTIRE chapter from the perspective of a zero-knowledge user encountering it for the first time, checking specifically for: (1) progress-counter/question-count mismatches, (2) Learning Goal claims not matched by actual question coverage, (3) typos or broken/merged words, (4) awkward jargon a beginner wouldn't know, (5) terms used in an exercise before being defined in a theory card, (6) claims that are too absolute/generalized for what's actually true, (7) any genuine knowledge gaps where a concept needed for a later question was never actually taught earlier. Fix everything found. This audit is mandatory after every content-generation step, not just when explicitly requested.

**Process order:** 1) Fill Chapter 1 for Day Trading. 2) Pause, list chosen subcategories, ask permission. 3) Copy Chapter 1 verbatim into Swing Trading and Scalping. 4) Proceed chapter by chapter, path by path.

**Nach jedem Schritt:** Kurzes "Schritt X fertig" + Zusammenfassung, dann auf "weiter"/"continue"/"fortfahren" warten, bevor der nächste Schritt beginnt.
