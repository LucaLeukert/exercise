# Local-First Exercise Database Migration

## Übersicht
Die Exercise-Datenbank wurde von einer server-basierten zu einer local-first Architektur migriert.

## Architektur

### Alt (Server-First)
- Direct tRPC queries mit `useInfiniteQuery`
- Pagination auf Server-Seite
- Suche und Filter auf Server-Seite
- Jede Interaktion = API-Call

### Neu (Local-First)
- AsyncStorage als lokaler Cache
- Versionierung für intelligente Synchronisierung
- Alle Filter/Suchen laufen lokal
- Background-Sync alle 5 Minuten
- Offline-Support

## Komponenten

### Backend (Cloudflare Worker)

#### `apps/worker/src/router/exercise.ts`
Neue Endpoints:
- **`version()`**: Gibt aktuelle DB-Version zurück (`v1.0.${totalKeys}`)
- **`sync()`**: Gibt alle Exercises mit Version und Timestamp zurück

### Frontend (React Native)

#### `apps/app/utils/exerciseCache.ts`
AsyncStorage-Wrapper mit folgenden Funktionen:
- `getLocalVersion()`: Holt aktuelle Version aus Cache
- `getLocalExercises()`: Lädt alle Exercises aus Cache
- `saveExercisesToLocal(exercises, version)`: Speichert Exercises + Version
- `clearLocalExercises()`: Löscht lokalen Cache
- `getLocalDatabaseInfo()`: Debug-Informationen

#### `apps/app/utils/useExerciseDatabase.ts`
React Hook für Sync-Management:
- Lädt beim Start Exercises aus Cache
- Vergleicht lokale mit Server-Version
- Synchronisiert automatisch bei Version-Mismatch
- Re-Check alle 5 Minuten
- Stellt `forceSync()` Funktion bereit

#### `apps/app/utils/exerciseSearch.ts`
Lokale Such- und Filterfunktionen:
- `applyLocalFilters()`: Strukturelle Filter (Muskelgruppen, Level, etc.)
- `searchLocalExercises()`: TF-IDF Suche
- `paginateExercises()`: Client-seitige Pagination

#### `apps/app/app/(home)/exercises.tsx`
Vollständig refactored:
- Verwendet `useExerciseDatabase()` Hook
- Lokale Filter/Suche mit `exerciseSearch.ts`
- Lokale Pagination (20 Items pro Seite)
- Loading-States für initiale Synchronisierung
- Error-Handling mit Offline-Support

## Vorteile

1. **Performance**: Sofortige Anzeige aus lokalem Cache
2. **Offline**: Funktioniert ohne Internet-Verbindung
3. **Weniger API-Calls**: Nur Sync bei Version-Änderungen
4. **Bessere UX**: Keine Loading-Delays bei Filter/Suche
5. **Kostenersparnis**: Weniger Cloudflare Worker Requests

## Flow

### Erster App-Start
1. Cache ist leer → `isInitialized = false`
2. Fetch von `/exercise/sync` Endpoint
3. Speichere alle Exercises in AsyncStorage
4. Setze Version
5. Anzeige der Daten

### Nachfolgende Starts
1. Lade Exercises aus AsyncStorage (sofort verfügbar)
2. Fetche Version von Server im Hintergrund
3. Wenn Version ≠ lokal → Sync
4. Sonst: Nutze Cache

### Bei Version-Änderung
1. `useExerciseDatabase` Hook erkennt Mismatch
2. Fetched neue Daten von `/exercise/sync`
3. Überschreibt lokalen Cache
4. Updated Version

## Testing

Vor dem Produktiv-Einsatz testen:
- [ ] Erster App-Start (leerer Cache)
- [ ] Zweiter App-Start (mit Cache)
- [ ] Suche funktioniert lokal
- [ ] Filter funktionieren lokal
- [ ] Pagination funktioniert
- [ ] Version-Check triggert Re-Sync
- [ ] Offline-Modus (Flugzeugmodus)
- [ ] Fehlerbehandlung bei Netzwerkfehlern

## Bekannte Limitierungen

- AsyncStorage Limit: ~6MB (sollte für ~800 Exercises ausreichen)
- Keine automatische Konfliktauflösung (Server gewinnt immer)
- Kein inkrementelles Update (immer vollständiger Sync)

## Zukünftige Verbesserungen

1. **Inkrementeller Sync**: Nur geänderte Exercises übertragen
2. **Compression**: Exercises vor dem Speichern komprimieren
3. **Selective Sync**: Nur Favoriten oder häufig genutzte Exercises
4. **Background Updates**: Native Background-Tasks für iOS/Android
