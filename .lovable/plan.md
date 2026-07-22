
# Refonte Reset LifeOS — Plan v1

Reconstruction complète depuis la référence `reset-lifeos_7.jsx` (3 545 lignes, monolithe React monofichier) vers une app TanStack Start propre, modulaire, mobile-first, avec compte utilisateur et sync via Lovable Cloud.

Livraison en 2 phases : **v1 (ce tour) = fondations + MVP navigable**, puis itérations pour compléter les modules.

---

## 1. Fondations (v1)

### Backend — Lovable Cloud
Activer Lovable Cloud + Lovable AI Gateway. Auth email/password + Google.

Schéma initial (RLS activée, GRANTs, `user_id = auth.uid()` partout) :

- `profiles` (id, display_name, theme, archetype, style_scores, onboarding_done)
- `goals` (id, user_id, title, domain, created_at, archived)
- `habits` (id, user_id, title, goal_id, mini_version, created_at, archived)
- `habit_logs` (id, user_id, habit_id, date, done) — unique (habit_id, date)
- `tasks` (id, user_id, title, project_id, goal_id, done, due_date, priority, created_at)
- `projects` (id, user_id, title, goal_id, created_at)
- `journal_entries` (id, user_id, date, content, mood, created_at)
- `priorities` (id, user_id, date, position, text, done) — top 2/jour
- `timeline_events` (id, user_id, kind, text, date, meta jsonb) — pour LCI
- `settings` (user_id PK, theme, sounds_enabled, lofi_enabled, decorations_enabled, custom_mission jsonb)

### Design system
`src/styles.css` : tokens OKLCH pour les 4 thèmes (rose, chrome, pop, nuit) mappés en `@theme inline`, radius/espacements/typographie premium. Skin Y2K conservé mais épuré : glass subtil, ornements décoratifs optionnels (papillons/volutes SVG en arrière-plan très discret), pas de skeuomorphisme lourd.

Typo : Inter (corps) + Instrument Serif (titres) via `<link>` dans `__root.tsx` ; VT323 réservé au timer focus / éléments LCD.

Composants réutilisables dans `src/components/ui/` (shadcn) + `src/components/reset/` :
- `Screen` (wrapper page avec header épuré)
- `Card`, `EmptyState`, `Sheet` (progressive disclosure)
- `HabitRing`, `Gauge`, `Sparkline`, `Streak`
- `BottomNav` (mobile) / `SideNav` (desktop)
- `FocusOverlay`, `SoundToggle`, `ThemeSwitcher`

### Architecture (feature-based)
```
src/
  features/
    dashboard/    (page, widgets, hooks, api)
    goals/
    habits/
    tasks/
    journal/
    progress/    (LCI + stats)
    settings/
    focus/       (mode focus + lofi)
    onboarding/  (diagnostic + profil)
  components/    (ui partagée)
  lib/
    ai-gateway.server.ts
    lci.ts       (calcul Life Control Index — porté depuis la réf)
    sounds.ts    (Web Audio, lazy)
    supabase clients (générés par intégration)
  hooks/         (useHabits, useTasks, useToday, useSettings...)
  routes/        (fichiers TanStack)
```

Règle : UI ↔ logique métier séparées ; chaque feature expose ses hooks (`useX`) qui encapsulent React Query + Supabase. Source unique de vérité côté Query cache.

### Navigation
- Desktop : sidebar élégante rétractable (shadcn Sidebar)
- Mobile : bottom nav 5 slots (Dashboard, Habitudes, Tâches, Journal, Plus)
- Routes : `/` (dashboard, sous `_authenticated`), `/auth`, `/onboarding`, `/goals`, `/habits`, `/tasks`, `/journal`, `/progress`, `/settings`, `/focus`

Chaque route : `head()` distinct, `errorComponent` + `notFoundComponent`.

---

## 2. MVP v1 — 3 écrans complets

### Dashboard (`/`)
Objectif unique : « que faire maintenant ? ». Vue au-dessus de la ligne de flottaison :
1. Salutation + mission du jour (1 ligne, éditable inline)
2. **2 priorités** du jour (cases larges, tap = terminé)
3. Bouton **Focus** (démarre timer + lofi)
4. Anneau de progression du jour (habitudes cochées / total)
5. Card « Prochaine habitude » + « Prochaine tâche »

Tout le reste (liste complète habitudes, LCI détaillé, historique) : accessible via CTA discrets → pages dédiées ou Sheet.

### Habitudes (`/habits`)
Liste épurée : titre + streak + tap pour cocher aujourd'hui. Détail habitude dans un Sheet (mini-version 2 min, historique 30j en heatmap, lien objectif). Ajout via FAB + formulaire 1 champ (titre) → étape secondaire optionnelle (objectif, mini-version) en accordéon.

### Tâches (`/tasks`)
Vue Aujourd'hui / À venir / Toutes (onglets). Ligne = case + titre + micro-meta. Ajout inline (Todoist-style). Action IA « Décomposer » (via AI Gateway) dans un Sheet quand la tâche est complexe. Débloquage (« je suis bloqué ») → Sheet avec 3 sous-étapes générées.

### Écrans stub navigables (v1)
`/goals`, `/journal`, `/progress`, `/settings`, `/onboarding` : squelette + EmptyState soigné + head() propre. Fonctionnalités complètes livrées dans les tours suivants.

---

## 3. Ambiance conservée

- Thèmes rose / chrome / pop / nuit : sélecteur dans Settings, persisté en DB (`settings.theme`), appliqué via classe sur `<html>`. Rendu premium (moins de dégradés criards, plus d'espace).
- Sons rétro + lofi : lazy-load `sounds.ts` (Web Audio), toggle global dans Settings, activé automatiquement en mode Focus si activé.
- Ornements Y2K (papillons, volutes SVG) : composant `<Decorations />` optionnel en background, opacité faible, respect de `prefers-reduced-motion`.

---

## 4. IA (Lovable AI Gateway)

Server functions dans `src/features/*/api/*.functions.ts` :
- `decomposeTask(title)` → 3–5 sous-étapes
- `unblockTask(title, blocker, minutes, energy)` → micro-action réalisable
- `analyzeDreams(dreams, values)` → tags/insights (livré phase 2)

Modèle par défaut `openai/gpt-5.5`, output structuré via `Output.object` + fallback local (repris de la référence : `localDecompose`, `localUnblock`).

---

## 5. États soignés, a11y, mobile

- Loading : skeletons Suspense sur chaque route (via `useSuspenseQuery` + loader).
- Erreurs : `errorComponent` par route avec retry qui appelle `router.invalidate()` + `reset()`.
- Vides : `EmptyState` illustré (papillon SVG) + CTA unique.
- Toasts discrets (sonner) pour confirmations.
- Contrastes AA sur toutes les palettes (vérifiés sur chaque thème).
- Tap targets ≥ 44px, focus visible, navigation clavier.
- `h-dvh` partout, safe-area iOS pour bottom nav.

---

## 6. Ce qui n'est PAS dans v1 (livré ensuite)

- Onboarding / Diagnostic complet (10 questions, calcul archétype, analyse rêves IA)
- Programme RESET 30 jours (`Program`)
- Journal complet (édition riche, moods, historique)
- Progression détaillée (LCI complet, sparkline 7/30j, timeline)
- Settings avancés (export/import, langue, dev mode)

Ces modules ont leurs stubs navigables en v1 pour que l'app soit cohérente de bout en bout, puis seront remplis dans les tours suivants sur validation.

---

## Détails techniques

- Stack : TanStack Start + React 19 + Tailwind v4 + shadcn/ui + TanStack Query + Supabase (Lovable Cloud).
- Auth : `_authenticated/` layout (managé). Route `/auth` publique (email/password + Google via broker Lovable).
- Data : `createServerFn` + `requireSupabaseAuth` pour les écritures ; lectures user-scoped via browser client + RLS.
- Pattern loader : `context.queryClient.ensureQueryData(queryOptions)` + `useSuspenseQuery` dans les composants.
- Realtime : pas dans v1 (single-user actif majoritairement).
- Aucune fonction Edge Supabase ; tout passe par server functions TanStack.

---

## Critères d'acceptation v1

- [ ] Signup/login fonctionnel, données isolées par utilisateur (RLS).
- [ ] Dashboard lisible en < 5 s : mission, 2 priorités, progression du jour, focus.
- [ ] Cocher une habitude / tâche = sync DB, feedback immédiat.
- [ ] Navigation mobile (bottom nav) + desktop (sidebar) cohérente.
- [ ] Sélection de thème persistée, 4 thèmes rendus proprement.
- [ ] Mode Focus opérationnel avec timer + lofi optionnel.
- [ ] Toutes les routes ont head() unique + error/notFound components.
- [ ] Zéro classe couleur hardcodée (`text-white`, `bg-black`) — que des tokens.
