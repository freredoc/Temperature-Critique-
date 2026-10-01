# CLAUDE.md — Température Critique

Le mémo que toute session lit en premier.

Jeu incrémental de physique, du labo de cryogénie jusqu'au cosmos : un seul
fichier HTML, hors ligne, en 8 bits, joué sur le téléphone d'Ethan.

**Où vit le plan** : dans le projet Claude « Jeu Mobile »,
`claude/DESIGN-TEMPERATURE-CRITIQUE.md`. Une copie est à la racine du dépôt
depuis le 27/09, avec `PASSATION-2026-09-27.md` ; en cas d'écart, l'original
du projet fait foi, et chaque brief recopie ce qu'il lui faut. Les briefs et
les rapports sont dans `rapports/`.

## Les règles

- Le brief est au format habituel : MODÈLE ET EFFORT, geste zéro, tests
  falsifiables, « ce qui n'est PAS dans ce lot », rapport. On commence
  toujours par le **geste zéro**.
- **Deux tests au maximum par lot**, sur le vrai verrou, et falsifiés au
  rapport. Aucun test d'équilibrage, aucun test de rendu.
- `SAVE_VERSION` ne bouge que si le schéma de l'état change, et une entrée de
  `migrations` l'accompagne (les deux dans `src/sim/sauvegarde.js`).
- La **version** (`version` de `package.json`) et le **build**
  (`config.build`) bougent **ensemble**, avec le numéro disponible au moment
  de l'exécution. Le build s'affiche dans Options : c'est lui qui dit à Ethan
  s'il joue la dernière version.
- Branches `claude/…`. Claude Code ouvre la PR, **Ethan fusionne** ; jamais de
  push sur `main`. La fusion déclenche la publication sur Pages.
- Chaque rapport finit par **« À tester sur ton téléphone, en 10 minutes »**.
- Les retours d'Ethan s'accumulent dans `RETOURS.md` ; un lot RETOURS les
  traite ensemble, seul un bloquant passe devant.
- Dépendances **épinglées sans `^`** : `npm install --save-exact`.
- Relecture hostile avant la PR : qui d'autre écrit ce champ ? qui d'autre lit
  cet état ? cet état est-il seulement atteignable ?
- Tout lot qui touche `src/sim/` ou `src/data/` **relance `npm run mesure`**,
  versionne `mesures/MESURE.md`, et cite l'écart dans son rapport.
- Tout lot qui ajoute une mécanique **ajoute sa stratégie** au joueur
  automatique (`tools/joueur-auto/strategies.js`), et fait passer ses cibles
  de « pas encore mesurable » à mesurées (`tools/joueur-auto/cibles.js`).

## L'architecture

- **`src/sim/` est pur** : jamais `window`, `document`, `localStorage`,
  `Date`, `performance`, `Math.random`, ni minuterie. Le temps lui arrive en
  argument. `tools/garde-sim.js` fait échouer `npm run check` sinon. C'est ce
  qui la fait tourner sous Node (tests, joueur automatique).
- **Le joueur automatique** (`tools/joueur-auto/`, `npm run mesure`) joue la
  simulation pure sous Node et écrit `mesures/MESURE.md`, les temps face aux
  cibles du plan. Trois règles :
  - **il ne réimplémente aucune règle du jeu** : il appelle `etatInitial`,
    `avancer`, `toutAcheter`, `rattraper`, `serialiser`/`deserialiser`, jamais
    un prix ou une production à lui ;
  - **il est déterministe** : ni horloge, ni hasard, aucun état gardé au
    niveau du module, ni date ni durée dans le rapport. Mêmes options, même
    texte au caractère près ;
  - **il avance au pas du jeu** : `PAS_MS`, jamais un autre pas ; le hors
    ligne passe par `rattraper`, comme dans le jeu.

  **`lancer.js` est le seul fichier impur** (il lit `package.json`, écrit le
  fichier, affiche la durée d'exécution dans la console seulement). Les six
  autres sont purs, et `tools/garde-sim.js` les garde comme `src/sim/` : mêmes
  interdits plus `process`, imports limités à `./…` (sauf `./lancer.js`),
  `src/sim/`, `src/data/` et `src/ui/format.js`.
- **Un `Decimal` pour toute ressource**, même quand elle vaut 10, importé
  depuis `src/sim/nombre.js`, le seul fichier qui importe `break_infinity.js`
  (deux copies casseraient `instanceof` sans erreur ; le build refuse une
  deuxième copie). Les durées sont des `Number` en ms entières. Jamais
  `Number(decimal)` hors de `formater`, et seulement sous 10⁶.
- **`avancer(etat, dtMs)`** (`src/sim/avancer.js`) est le seul moteur du
  temps : chaque mécanique s'y branche, nulle part ailleurs.
  **`rattraper(etat, ms)`** rejoue une absence en 1000 pas au plus, **sans
  plafond de durée**, pas entiers de somme exacte. C'est une approximation
  (des pas plus grands), pas une intégration exacte.
- **La boucle** (`src/main.js`) : pas fixe `PAS_MS` et accumulateur ; au-delà
  de `PAS_MS × MAX_PAS_PAR_IMAGE` en une image, `rattraper`. Le hors ligne a
  deux chemins exclusifs : page cachée puis revenue (rattrapée au retour, puis
  horloge remise à maintenant), page tuée puis rechargée (rattrapée au
  chargement depuis `sauveLe`). Sauvegarde sur `visibilitychange` (hidden),
  `pagehide` et toutes les 10 s.
- **La sauvegarde** : `src/sim/sauvegarde.js` est pur (enveloppe
  `{ saveVersion, build, sauveLe, etat }`, étiquetage `{"$d": …}` de tout
  `Decimal` où qu'il soit, `migrations`, export `TC1.` + base64url) ;
  `src/ui/stockage.js` est la **seule porte** vers `localStorage`. Rien ne
  s'efface en silence : une sauvegarde illisible est mise de côté, une
  sauvegarde plus récente n'est jamais écrasée, et une sauvegarde d'une
  version antérieure est copiée telle quelle (`copierAvantMigration`, clé
  `temperature-critique:sauvegarde-v<N>:<heure>`) avant la première écriture ;
  si la copie échoue, rien n'est écrit. Une migration décrit la forme de SON
  époque en toutes lettres et ne lit jamais une table de `src/data/`.
- **Le dévoilement** passe par `src/data/devoilement.js`
  (`{ id, condition(etat) }` ↔ `[data-devoile="id"]`) : jamais de
  `if (lot >= n)` dans l'écran.
- **Les machines** : les huit sont des données (`src/data/machines.js` :
  coût, facteur, noms), la cascade est pure (`src/sim/machines.js` :
  `prix`, `production`, `produire`, `acheter`, `acheterLot`, `toutAcheter`,
  utilisables sous Node sans DOM). La machine n produit la machine n − 1 **au
  plein, sans la division par 10 d'AD** — écart voulu, ne pas « corriger ».
  `produire` est un **Euler explicite sur les quantités du DÉBUT du pas** :
  toutes les productions se calculent d'abord, puis s'ajoutent.
  Une machine porte `quantite` (Decimal, achats plus cascade) et `achetees`
  (entier, les seuls achats) : **c'est `achetees` qui fixe le prix et le
  multiplicateur**, jamais `quantite`. `decouvertes.machines` (la plus haute
  machine jamais achetée) **ne descend jamais** et dévoile les cartes.
  `machinesDebloquees` vaut 4 ; le lot FROID l'ouvrira.
- **Les cartes de machines** sont générées depuis `MACHINES` par
  `src/ui/machines.js` (aucune n'est écrite dans `index.html`), avant
  `monterEcran`, qui exige un élément par entrée de `DEVOILEMENT`. Elles ne
  réécrivent que les textes qui changent et sautent les cartes cachées.
- **L'affichage des nombres** passe par `src/ui/format.js` : `formater` pour
  les quantités de jeu (virgule, U+00A0, scientifique dès 10⁶).
- **Les 16 couleurs** : `src/data/palette.js`, reprises en variables dans
  `src/ui/theme.css`. Aucune autre couleur : le build le vérifie.
- **Le mode test** (`src/ui/mode-test.js`, 7 touchers sur la version) n'a
  aucune logique à lui : il passe par `rattraper`, `serialiser`,
  `etatInitial` et l'import. Il marque la partie pour toujours
  (`meta.modeTestUtilise`).
- **Les polices** (VT323, Pixelify Sans) : sous-ensemble `latin` seulement.
  Ω τ γ λ α Δ √ ≥ ≤ → ← ☉ ₂ ₃ ⁶ ⁻ ≡ ✕ ∞ et l'espace fine U+202F n'y sont pas :
  ils tombent sur la police de secours. Espace insécable : U+00A0.

## Les commandes

| Commande | Fait |
|---|---|
| `npm run build` | `dist/index.html`, un seul fichier hors ligne ; échoue sur une ressource réseau, une 2ᵉ copie de break_infinity.js, une couleur hors palette |
| `npm test` | les tests (`node --test "test/*.test.js"`) |
| `npm run check` | garde-sim, puis les tests, puis le build : ce que lance la CI |
| `npm run voir` | build, serveur local, scénario Playwright dans Chromium (360 × 780, DPR 3) : 22 étapes, captures dans `captures/` |
| `npm run mesure` | joueur automatique : joue la partie de référence et écrit `mesures/MESURE.md` (versionné) ; **hors de `check`**, seuls ses deux tests y entrent |

- Node ≥ 22 (la CI tourne en 22). Sur le PC d'Ethan, un Node 22 portable est
  en tête du PATH (`claudax/outils/node22`) ; le Node 24 de Program Files
  existe aussi.
- Premier `npm run voir` sur une machine : `npx playwright install chromium`.
  Sur une machine où Chromium est déjà installé ailleurs : `TC_CHROMIUM=<chemin>`.
- `dist/` et `captures/` ne sont pas versionnés.

## L'état

À mettre à jour à chaque lot.

| | |
|---|---|
| Dernier lot | JOUEUR-AUTO (le jeu n'a pas changé d'un octet) |
| Version · build | 0.2.0 · build 2 (inchangés) |
| `SAVE_VERSION` | 2 (inchangé) |
| Tests | 6 (SOCLE T1 sauvegarde, SOCLE T2 rattrapage, MACHINES T1 sauvegarde v1 → v2, MACHINES T2 cascade, JOUEUR-AUTO T1 déterminisme, JOUEUR-AUTO T2 instrument du hors ligne) |
| `dist/index.html` | 189 877 octets (inchangé, SHA-256 `9ff6d56a…4791`) |
| Mesure | `mesures/MESURE.md` : 10⁹ J en 3 min 42 s (cible 3 min 43 s) ; écart hors ligne −0,1 à −0,6 % |
| Rendu | vu dans Chromium (`npm run voir`, 22 étapes) ; pas encore sur le téléphone |
| Jouer | https://freredoc.github.io/Temperature-Critique-/ |
