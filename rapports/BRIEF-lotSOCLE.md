# BRIEF — lot SOCLE

Premier lot de **Température Critique**, dans le dépôt vide
`freredoc/Temperature-Critique-`. Il pose tout ce que les 13 lots suivants
supposent :

- le build vers **un seul fichier HTML** ;
- le type des nombres ;
- la boucle de simulation ;
- la sauvegarde et le rattrapage hors ligne ;
- la coquille d'écran en 8 bits ;
- le **mode test** ;
- la publication sur le téléphone.

Le jeu n'a encore **aucune mécanique**. À la fin du lot, l'écran affiche
« 10 J » et on peut sauvegarder, revenir et tester.

Ce brief applique le plan `claude/DESIGN-TEMPERATURE-CRITIQUE.md` v5 du
projet Claude « Jeu Mobile » (§13 et §16). Le plan ne vit pas dans le dépôt :
tout ce dont ce lot a besoin est recopié ici.

---

## MODÈLE ET EFFORT

**Opus 5, effort extra.** C'est le plancher de Foyer Zéro, et ce lot ne demande
pas moins : une erreur ici se paie dans **chaque** lot qui suit. Les points
sensibles sont un format de sauvegarde qu'il faudra migrer, un type de nombre
qu'il faudra changer, et une boucle qui compte mal le temps.

Fable 5 : **peu pertinent**. Il n'y a aucun système de jeu à inventer. C'est
de l'infrastructure classique, dont chaque choix est déjà tranché ici.

---

## AVANT DE LANCER — deux gestes d'Ethan sur GitHub

Le dépôt est **vide**, vérifié le 24/09 : aucun commit, aucune branche.
Claude Code ne pousse jamais sur `main`. Il faut donc :

1. **Créer `main`** : sur la page du dépôt, bouton **« Add a README »**, puis
   valider. Une ligne suffit.
2. **Activer Pages** : Settings → Pages → Build and deployment → Source :
   **GitHub Actions**.

Sans le geste 1, la PR n'a pas de base. Sans le geste 2, le jeu ne s'ouvre pas
sur le téléphone après la fusion.

---

## 0. Geste zéro, avant toute ligne de code

1. Lire ce brief **en entier**.
2. `git log --oneline --all` et lister la racine. **Attendu** : un seul commit
   (le README d'Ethan) et rien d'autre. S'il y a autre chose, **s'arrêter** et
   l'écrire au rapport avant de toucher quoi que ce soit.
3. `node --version`. Il faut **Node ≥ 20** (pour `node:test`). Consigner la
   version exacte.
4. Créer la branche **`claude/socle-fondations`**.
5. **Le PC d'Ethan est sous Windows.** Le tout premier fichier écrit est
   `.gitattributes`, avec `* text=auto eol=lf`. Sans lui, les fins de ligne
   CRLF cassent les comparaisons de texte dans les tests et dans le build.
6. Juste après, copier ce brief tel quel dans `rapports/BRIEF-lotSOCLE.md`.

---

## 1. Ce que tu verras à l'écran (pour Ethan)

- **Un fond noir-bleu**, avec **« 10 J »** en gros chiffres orange, style pixel.
  **Rien d'autre**, et c'est voulu : le jeu se dévoile plus tard.
- **En haut à droite, un petit bouton ≡.** Il ouvre les **Options** :
  - le numéro de version et de build ;
  - « Sauvegarder maintenant » ;
  - « Exporter » (un code à copier) ;
  - « Importer » (coller un code) ;
  - « Licences ».
- **Toucher 7 fois la ligne de version** ouvre le **mode test**. On peut y :
  - accélérer le temps (×10, ×100, ×1000) ;
  - sauter 1 min, 1 h ou 1 jour ;
  - écrire n'importe quelle valeur d'énergie (par exemple `1e400`) ;
  - lire une phrase témoin des caractères spéciaux ;
  - repartir d'une nouvelle partie.
- **Après avoir fermé puis rouvert le jeu**, la valeur est toujours là.
- **Après plus d'une minute d'absence**, un bandeau dit combien de temps tu
  étais parti.

---

## 2. L'arborescence visée

```
.gitattributes            .gitignore            package.json
CLAUDE.md                 README.md             RETOURS.md
LICENCES-TIERCES.md
.github/workflows/pages.yml
src/
  index.html              gabarit que le build remplit
  main.js                 point d'entrée : charge, rattrape, lance la boucle, monte l'écran
  data/
    constantes.js         PAS_MS, MAX_PAS_RATTRAPAGE, …
    palette.js            les 16 couleurs (§9)
    devoilement.js        ce qui s'affiche, et à quelle condition
  sim/                    LOGIQUE PURE (§6)
    nombre.js             le seul import de break_infinity.js
    etat.js               etatInitial()
    avancer.js            avancer(etat, dtMs)
    rattrapage.js         rattraper(etat, ms)
    sauvegarde.js         serialiser, deserialiser, exporter, importer, migrations, SAVE_VERSION
  ui/
    theme.css
    format.js             formater(decimal)
    stockage.js           localStorage : la seule porte vers le navigateur pour la sauvegarde
    ecran.js              montage, dévoilement, bandeau d'absence
    options.js
    mode-test.js
tools/
  build.js                → dist/index.html
  garde-sim.js            refuse le navigateur dans src/sim/
  voir.js                 vérification sans écran (Playwright)
test/
  sauvegarde.test.js      SOCLE T1
  rattrapage.test.js      SOCLE T2
rapports/
  BRIEF-lotSOCLE.md
  RAPPORT-lotSOCLE.md
```

`dist/`, `node_modules/` et `captures/` vont dans `.gitignore`. **`dist/` n'est
pas versionné** : c'est la CI qui le construit pour Pages (§11).

---

## 3. Les dépendances — versions exactes, mesurées le 24/09

| Paquet | Version | Licence | Rôle | Livré dans le jeu |
|---|---|---|---|---|
| `break_infinity.js` | **2.2.0** | MIT (dép. `pad-end`, MIT) | les grands nombres (la bibliothèque d'AD) | oui |
| `@antimatter-dimensions/notations` | **3.2.0** | MIT (dép. `tslib`, 0BSD) | l'affichage scientifique | oui |
| `@fontsource/vt323` | **5.3.0** | OFL-1.1 | police du texte et des chiffres | oui |
| `@fontsource/pixelify-sans` | **5.3.0** | OFL-1.1 | police des titres et des boutons | oui |
| `esbuild` | **0.28.2** | MIT | build | non (dev) |
| `playwright` | **1.63.0** | Apache-2.0 | vérification sans écran | non (dev) |

- **Versions épinglées, sans `^`.** Si une version plus récente existe au moment
  de l'exécution, on garde celle-ci : c'est elle qui a été vérifiée. Un
  écart se déclare au rapport.
- ⚠ **UN SEUL `break_infinity.js` DANS LE BUNDLE.** `notations` l'a à la fois
  en dépendance et en dépendance paire. `npm ls break_infinity.js` doit montrer
  **une seule version, dédoublonnée**. Deux copies rendraient `instanceof
  Decimal` faux entre `notations` et notre code, **sans aucune erreur** : un
  nombre venu de l'une ne serait pas reconnu par l'autre. Consigner la sortie
  de `npm ls` au rapport.
- **`LICENCES-TIERCES.md`** contient le texte **complet** de chaque licence des
  paquets livrés : break_infinity.js, notations, pad-end, tslib, VT323 et
  Pixelify Sans. Il est **intégré au build**, et affiché dans Options →
  Licences.
  - Il réserve une ligne vide pour « Antimatter Dimensions (MIT) », qui
    entrera au lot MACHINES avec ses tables de coûts.
  - Ce lot-ci ne reprend aucun code d'AD, seulement ses deux bibliothèques.

---

## 4. Le build — `tools/build.js` → `dist/index.html`

`npm run build` produit **un seul fichier**, `dist/index.html`, qui marche
**hors ligne** et sans aucune requête réseau :

- le JavaScript est bundlé par esbuild (format IIFE, cible es2020, **non
  minifié** pour rester lisible dans les outils du navigateur), puis inliné ;
- le CSS est inliné ;
- **les polices sont inlinées en base64**, sous-ensemble `latin` seulement :
  - VT323 400 : `vt323-latin-400-normal.woff2`, 17 936 octets ;
  - Pixelify Sans 400 : `pixelify-sans-latin-400-normal.woff2`, 7 692 octets ;
  - Pixelify Sans 700 : `pixelify-sans-latin-700-normal.woff2`, 7 904 octets.

  Soit **~45 Ko** en base64 au total ;
- `LICENCES-TIERCES.md` est inliné en texte ;
- **la version et le build** de `package.json` sont injectés (`define`
  d'esbuild) ;
- `<meta name="viewport" content="width=device-width, initial-scale=1,
  viewport-fit=cover">` et `<meta name="theme-color" content="#0b0f1a">`.

⚠ **LE BUILD SE GARDE LUI-MÊME.** Il **échoue** si `dist/index.html` contient
`src="http`, `href="http`, `url(http`, ou `@import`. Les URL qui apparaissent
dans le **texte** des licences restent permises : elles ne chargent rien. Un
fichier qui charge une police depuis Google ne se verrait pas en développement,
avec du réseau, et casserait dans le métro.

⚠ **POURQUOI LE SOUS-ENSEMBLE `latin` SEUL, MESURÉ.** Il contient tous les
accents du français, ainsi que œ, ², ³, ×, −, ·, …, «, » et ’. Le sous-ensemble
`latin-ext` n'ajoute **aucun** de ces caractères, ni aucun des suivants :
**Ω τ γ λ α Δ √ ≥ ≤ → ← ☉ ₂ ₃ ⁶ ⁻**. Ils manquent dans **les deux**
polices (lecture des tables de caractères des fichiers `.woff`). Ils
tomberont sur la police de secours du téléphone. **Ce lot ne le corrige pas** :
il le rend visible (phrase témoin, §10), et Ethan tranchera sur pièce.

---

## 5. Les nombres : un `Decimal` pour toute ressource

- **Toute quantité de jeu qui peut grandir est un `Decimal`**
  (break_infinity.js), **dès maintenant**, même quand elle vaut 10. Changer de
  type plus tard obligerait à migrer toutes les sauvegardes.
- **Les durées restent des `Number`, en millisecondes entières.** La limite des
  entiers sûrs représente ~285 000 ans : on ne l'atteindra pas.
- **`src/sim/nombre.js` est le SEUL fichier qui importe `break_infinity.js`.**
  Tout le reste importe `Decimal` depuis lui. C'est la garde contre les deux
  copies du §3.
- **Jamais `Number(decimal)`**, sauf dans `formater` et seulement sous 10⁶.
  Mesuré : `Number(new Decimal("1e400"))` donne `Infinity`.

---

## 6. La simulation : pure, à pas fixe

**`src/sim/` ne touche jamais** à `window`, `document`, `localStorage`,
`Date.now`, `performance` ni `Math.random`. Le temps lui arrive en argument.
C'est ce qui la fait tourner sous Node, et ce que le joueur automatique (lot 3)
exploitera.

`tools/garde-sim.js` parcourt `src/sim/` et **fait échouer `npm run check`** au
premier de ces noms trouvé hors commentaire. C'est une garde, pas un test.

- **`etat.js`** — `etatInitial()` rend :
  ```js
  {
    meta: { creeLe: <ms, passé en argument>, modeTestUtilise: false },
    temps: { totalMs: 0 },
    energie: new Decimal(10),
  }
  ```
- **`avancer.js`** — `avancer(etat, dtMs)` : dans ce lot, **seulement**
  `etat.temps.totalMs += dtMs`. C'est **la seule fonction qui fait avancer le
  temps du jeu**. Chaque lot futur y branchera sa mécanique, et nulle part
  ailleurs.
- **`rattrapage.js`** — `rattraper(etat, ms)` :
  - si `ms ≤ 0` : ne rien faire, et rendre `{ pas: 0, ms: 0 }` (une horloge
    reculée ne fait pas reculer le jeu) ;
  - sinon : `n = min(MAX_PAS_RATTRAPAGE, ceil(ms / PAS_MS))`, puis `n` appels
    à `avancer` avec des pas **entiers** dont la somme vaut **exactement**
    `ms`. Le pas de base est `floor(ms / n)`, et les `ms − base × n` premiers
    pas reçoivent 1 ms de plus ;
  - rendre `{ pas: n, ms }`.
- **`src/data/constantes.js`** : `PAS_MS = 50`, `MAX_PAS_RATTRAPAGE = 1000`,
  `MAX_PAS_PAR_IMAGE = 100`, `AUTOSAUVEGARDE_MS = 10000`,
  `SEUIL_ABSENCE_MS = 60000`.

⚠ **AUCUN PLAFOND AU RATTRAPAGE.** Une semaine d'absence se rattrape en entier,
en 1000 pas. C'est la règle P6 du plan : le hors ligne ne pénalise pas. Un
`Math.min(ms, 24 * 3600 * 1000)` « par prudence », classique dans les idle,
est **exactement** ce que le test T2 attrape.

⚠ **LE RATTRAPAGE N'EST PAS EXACT, ET ON LE DIT.** Mêmes formules, mais des pas
plus grands, comme AD, qui plafonne ses pas à 1000. Pour une production en
cascade, un grand pas n'intègre pas comme mille petits. Le plan v5 disait
« exact » : c'est faux, et c'est corrigé dans le plan. L'écart se mesurera
avec le joueur automatique, lot par lot.

---

## 7. La boucle — `src/main.js`

1. **Au chargement** : lire la sauvegarde (§8) ou créer `etatInitial(Date.now())`.
   Puis `rattraper(etat, Date.now() − sauveLe)`. Au-delà de
   `SEUIL_ABSENCE_MS`, afficher le bandeau d'absence (§9).
2. **À chaque image** (`requestAnimationFrame`) : on calcule
   `ms = (maintenant − précédent) × vitesseTest`.
   - Si `ms` dépasse `PAS_MS × MAX_PAS_PAR_IMAGE`, on appelle
     `rattraper(etat, ms)`. C'est le cas d'un onglet revenu au premier plan ou
     d'une vitesse ×1000.
   - Sinon, on ajoute `ms` à un accumulateur, et on fait des `avancer(etat,
     PAS_MS)` tant qu'il reste au moins `PAS_MS`. **Le reste est gardé**, il
     n'est pas jeté.
3. **Sauvegarde automatique** toutes les `AUTOSAUVEGARDE_MS`, **et** sur
   `visibilitychange` (quand la page passe `hidden`) **et** sur `pagehide`.
4. **Retour au premier plan** (`visibilitychange` → `visible`) : on appelle
   `rattraper(etat, Date.now() − cacheLe)`, où `cacheLe` est l'heure notée au
   passage en `hidden`. Puis on **remet l'horloge de la boucle à maintenant**,
   pour que la première image ne recompte pas l'absence. Au-delà de
   `SEUIL_ABSENCE_MS`, le bandeau d'absence s'affiche, comme au chargement.

⚠ **SUR TÉLÉPHONE, `beforeunload` NE SUFFIT PAS.** Quand on passe à une autre
appli, le navigateur peut tuer la page sans le déclencher. C'est
`visibilitychange` qui sauve la partie. Et c'est ce qui rend juste le calcul
d'absence au retour : la dernière sauvegarde date bien du moment où tu es
parti.

⚠ **PAS DE DOUBLE COMPTE.** Une page cachée puis revenue est rattrapée par le
point 4, et seulement par lui : l'horloge de la boucle est remise à
maintenant. Une page tuée puis rechargée l'est par le point 1, puisqu'elle n'a
jamais vu le point 4. Les deux chemins sont exclusifs. Ne pas compter sur les
horodatages de `requestAnimationFrame` pendant qu'une page est cachée : sur
Android, une page en arrière-plan peut être gelée.

---

## 8. La sauvegarde — `src/sim/sauvegarde.js` (pure) et `src/ui/stockage.js`

- **`SAVE_VERSION = 1`**, déclaré à un seul endroit, dans `sauvegarde.js`.
- **L'enveloppe** : `{ saveVersion, build, sauveLe, etat }`.
- **Les `Decimal` sont étiquetés, génériquement.** À la sérialisation, tout
  `Decimal`, **où qu'il soit** dans l'arbre (objet, tableau, profondeur
  quelconque), devient `{"$d":"<chaîne>"}`. À la désérialisation, tout objet
  qui a exactement la clé `$d` redevient un `Decimal`. **Il n'y a pas de liste
  de champs à tenir à jour** : un champ ajouté par un lot futur est couvert
  sans rien écrire.
  - ⚠ **Mesuré** : `JSON.stringify` d'un `Decimal` donne déjà `"1e+400"`, parce
    que `Decimal` a un `toJSON`. Le `replacer` reçoit donc la **chaîne**, pas
    l'objet. Il faut tester `this[clé] instanceof Decimal` dans le `replacer`.
    Sinon, la sauvegarde **paraît** marcher, et relit des chaînes. C'est la
    faute que T1 attrape.
- **`migrations`** : un tableau indexé par version, **vide** dans ce lot.
  `migrations[v]` transforme une sauvegarde de la version v en version v+1.
  Le mécanisme existe dès maintenant, pour que le premier lot qui change le
  schéma n'ait qu'à y ajouter une entrée.
- **Au chargement :**
  - pas de sauvegarde → nouvelle partie ;
  - `saveVersion > SAVE_VERSION` (une sauvegarde venue d'une version plus
    récente) → **refusée**, **laissée intacte**, et un message à l'écran ;
  - JSON illisible → copiée **telle quelle** sous
    `temperature-critique:sauvegarde-illisible:<horodatage>`, puis nouvelle
    partie **avec un message**. Rien ne s'efface en silence.
- **La clé de stockage** : `temperature-critique:sauvegarde`. `stockage.js` est
  la **seule** porte vers `localStorage`.
- **L'export** : `"TC1." + base64url(UTF-8(JSON de l'enveloppe))`.
- **L'import** : le préfixe `TC1.`, le décodage, la version et une forme
  minimale (`meta`, `temps`, `energie`) doivent passer. Sinon, le code est
  **refusé avec un message qui dit pourquoi**, et **rien ne change**. S'il
  passe, l'état est remplacé puis sauvegardé immédiatement.

---

## 9. L'écran : la coquille 8 bits

**Les 16 couleurs** sont définies dans `src/data/palette.js` et reprises en
variables CSS dans `theme.css`. **Aucune autre couleur dans le code.**

| Nom | Hex | Usage |
|---|---|---|
| fond | `#0b0f1a` | fond de page |
| surface | `#141a2b` | cartes |
| surface-2 | `#1f2740` | jauges vides, cases passées |
| trait | `#2a3350` | bordures |
| trait-fort | `#4a5572` | bordures d'éléments **inactifs** seulement |
| texte-2 | `#9aa3b8` | texte secondaire |
| texte-doux | `#c9ccd6` | texte atténué |
| texte | `#e8e6d9` | texte |
| cyan | `#5fd3f3` | froid, supra, sélection |
| cyan-graphe | `#1d93b8` | graphiques |
| cyan-fond | `#0f2230` | fond d'encart cyan |
| orange | `#ff9d3b` | énergie, action principale |
| orange-graphe | `#d9701a` | graphiques |
| orange-fond | `#22170c` | fond d'encart orange |
| orange-ombre | `#7a3f0a` | ombre pixel des boutons orange |
| texte-sur-orange | `#d8c9b4` | texte dans un encart orange |

**Contrastes mesurés** sur le fond :
- texte : 15,3:1 ;
- texte-2 : 7,6:1 (6,9:1 sur surface) ;
- orange : 9,2:1 ;
- cyan : 11,0:1 ;
- le fond sur un bouton orange : 9,2:1, et sur un bouton cyan : 11,0:1.

`trait-fort` n'atteint que 2,6:1. Il est donc **réservé aux contours
d'éléments inactifs**, que la norme exempte. Les deux teintes « graphe » ont
été validées pour les graphiques sur ce fond.

**Le style** : aucun arrondi, bordures de 2 px, ombres pixel (`4px 4px 0`),
VT323 pour le texte et les chiffres, Pixelify Sans pour les titres et les
boutons. Pile de secours : `ui-monospace, monospace`.

**La mise en page** : une colonne, largeur maximale de 480 px centrée, marge
basse `env(safe-area-inset-bottom)`. **L'écran de référence est le S25 FE
d'Ethan : 1080 × 2340 px à DPR 3, soit 360 × 780 px CSS.** Les maquettes du
projet sont en 390 × 844 : c'est la largeur 360 qui fait foi.

**L'écran principal** montre l'énergie **seule**, formatée, en VT323 et en
orange, avec une taille qui tient `1,00e400 J` sur 360 px (environ 56 px).

Il y a aussi le **bouton ≡** : 44 × 44 px, en haut à droite, avec
`aria-label="Options"`. Rien d'autre à l'écran.

**Le dévoilement** — `src/data/devoilement.js` : une liste
`{ id, condition(etat) }`. `ecran.js` n'affiche un élément que si sa
condition est vraie. Dans ce lot, une seule entrée : `energie`, toujours
vraie. **Le mécanisme doit exister maintenant** : c'est lui que chaque lot
futur complètera. Aucun `if (lot >= 3)` éparpillé dans l'écran.

**`formater(decimal)`** — `src/ui/format.js`, la seule fonction d'affichage des
nombres :
- **sous 1000** : un entier, ou jusqu'à 3 décimales sans zéros inutiles, avec
  une virgule (`10`, `0,052`) ;
- **de 1000 à 10⁶** : un entier groupé par milliers avec **U+00A0** (espace
  insécable), par exemple `1 917` ;
- **à partir de 10⁶** : `ScientificNotation` de notations, 2 décimales, point
  remplacé par une virgule. Mesuré : `7.774e11` → `7.77e11` → **`7,77e11`**, et
  `1e400` → **`1,00e400`**.

⚠ **L'ESPACE FINE INSÉCABLE (U+202F) N'EST DANS AUCUNE DES DEUX POLICES**
(mesuré). Elle s'afficherait dans une autre police, au milieu du nombre.
D'où U+00A0.

**Le bandeau d'absence** : au chargement **ou** au retour au premier plan
(§7, points 1 et 4), si l'absence dépasse `SEUIL_ABSENCE_MS`, afficher par
exemple « Tu étais absent 3 h 12 min. », refermable. Il n'y a encore aucune production : le bandeau dit seulement la
durée.

**Accessibilité** : de vrais `<button>`, des cibles de 44 px minimum, et des
`<label>` sur les champs.

---

## 10. Le mode test — `src/ui/mode-test.js`

- **Pour l'ouvrir** : 7 touchers en moins de 3 s sur la ligne de version des
  Options. Le premier passage pose `etat.meta.modeTestUtilise = true`, **pour
  toujours** dans cette sauvegarde. Les Options affichent alors « Partie de
  test ». C'est ce qui empêchera plus tard les succès de compter.
- **Ce qu'il contient dans ce lot :**
  - **Vitesse** : ×1, ×10, ×100, ×1000. **Non sauvegardée** : on repart à ×1 au
    rechargement. Un rechargement à ×1000 ferait défiler des heures sans qu'on
    le voie.
  - **Sauter** : +1 min, +1 h, +1 jour, qui appellent **`rattraper`**. C'est le
    chemin du hors ligne, testé à la demande sans attendre.
  - **Énergie** : un champ qui accepte `1e400`, `12,5`, `3.2e15`. Une saisie
    invalide est refusée avec un message.
  - **Affichages** : temps de partie, dernier rattrapage (ms et nombre de pas),
    `SAVE_VERSION`, taille de la sauvegarde en octets.
  - **La phrase témoin** : `éèêàçôœ ²³ × − · … « » Ω τ γ λ α Δ √ ≥ → ☉ ₂`,
    affichée une fois en VT323 et une fois en Pixelify.
  - **Nouvelle partie**, avec une confirmation en deux temps : un premier
    toucher change le texte du bouton, un second confirme.

⚠ **LE MODE TEST NE CONTIENT AUCUNE LOGIQUE À LUI.** Tout passe par `avancer`,
`rattraper`, `serialiser`, `importer` : les mêmes fonctions que le jeu. Un
raccourci réservé au mode test (écrire `totalMs` directement, par exemple)
testerait autre chose que ce que le joueur vivra.

---

## 11. La publication sur le téléphone — `.github/workflows/pages.yml`

Déclenché sur `push` vers `main` et à la main (`workflow_dispatch`) :

1. checkout ;
2. setup-node (Node 22) ;
3. `npm ci` ;
4. `npm run check`, qui construit aussi `dist/` ;
5. dépôt de `dist/` comme artefact Pages ;
6. déploiement.

Permissions : `pages: write` et `id-token: write`.

- **Les versions majeures des actions officielles** (`checkout`, `setup-node`,
  `upload-pages-artifact`, `deploy-pages`) **se vérifient sur leur page
  GitHub au moment de l'exécution**, et se consignent au rapport. Ce brief
  ne les devine pas.
- **Playwright ne tourne pas en CI** : trop lourd, et `npm run check` n'en
  dépend pas (§12).
- **Après la fusion**, le jeu est à l'adresse
  **`https://freredoc.github.io/Temperature-Critique-/`**.

---

## 12. Les scripts npm

| Script | Fait | En CI |
|---|---|---|
| `npm run build` | `node tools/build.js` | oui |
| `npm test` | `node --test test/` | oui |
| `npm run check` | `node tools/garde-sim.js`, puis `npm test`, puis `npm run build` | oui |
| `npm run voir` | build, serveur HTTP local, scénario Playwright (§14) | non |

`npm run mesure` **n'existe pas encore** : c'est le lot JOUEUR-AUTO.

---

## 13. Les deux tests

Deux, sur les deux verrous réels du lot : **le format de sauvegarde** et **le
rattrapage**. **Un seul `test()` par fichier**, pour que `node --test` compte
bien 2. Aucun test de rendu, aucun test d'équilibrage.

### `SOCLE T1` — la sauvegarde rend les grands nombres tels quels

**Montage.**
1. Un objet de test qui n'est **pas** l'état du jeu :
   ```js
   { a: new Decimal("1e400"),
     b: { c: [new Decimal("1.5e-3"), new Decimal(0)] },
     t: 123456789 }
   ```
2. `deserialiser(serialiser(objet))`.
3. Puis l'état du jeu avec `energie = new Decimal("1e400")`, passé par
   `importer(exporter(enveloppe))`.
4. Puis une enveloppe avec `saveVersion = SAVE_VERSION + 1`, passée à
   `importer`.

**Assertions.**
- Chaque `Decimal` relu est `instanceof Decimal` (celui de `src/sim/nombre.js`)
  et `.eq()` l'original. `t` reste le `Number` 123456789.
- `energie` revient égale à 10⁴⁰⁰ à travers le code `TC1.`.
- L'enveloppe de version future est **refusée** : l'import rend une erreur
  explicite, sans lever d'exception non attrapée.

**Falsification, à exécuter une fois puis à défaire.**
- Retirer l'étiquetage `$d` (laisser le `toJSON` de `Decimal` faire) : le
  premier `instanceof` tombe, parce qu'on relit la chaîne `"1e+400"`.
- Convertir par `Number()` : 10⁴⁰⁰ devient `Infinity`, et la comparaison tombe.
- Retirer la vérification de version : l'enveloppe future est acceptée, et la
  troisième assertion tombe.

Le rapport donne le résultat des trois.

### `SOCLE T2` — le rattrapage rend tout le temps, au pas près

**Montage.** Trois états neufs.

1. `rattraper(e1, 604_800_013)`, soit 7 jours et 13 ms.
2. `rattraper(e2, 120)`.
3. `rattraper(e3, -5000)`.

**Assertions.**
1. `e1.temps.totalMs` vaut **exactement** 604 800 013, et `pas ≤ 1000`.
2. `e2.temps.totalMs` vaut 120, et `pas === 3`.
3. `e3.temps.totalMs` vaut 0, et `pas === 0`.

**Falsification, à exécuter une fois puis à défaire.**
- Plafonner à 24 h : la première assertion tombe.
- Découper par `floor` sans répartir le reste : 13 ms se perdent, et la première
  tombe.
- Laisser passer un temps négatif : la troisième tombe.

Le rapport donne le résultat des trois.

---

## 14. La vérification sans écran — `tools/voir.js` (`npm run voir`)

Le script construit le jeu, le sert en HTTP local (pas `file://`), puis ouvre
Chromium via Playwright en **360 × 780, DPR 3**. Scénario, avec de vrais clics
à la souris :

1. **zéro erreur** dans la console ;
2. « 10 J » est visible ;
3. un clic sur ≡ ouvre les Options, et la version affichée est `0.1.0 · build 1` ;
4. 7 clics sur la version ouvrent le mode test ;
5. énergie `1e400` → l'écran principal affiche `1,00e400 J` ;
6. « Sauvegarder », puis rechargement de la page : toujours `1,00e400 J` ;
7. « Exporter » : le code commence par `TC1.` ;
8. « Nouvelle partie » (deux touchers) : `10 J`. Puis « Importer » le code :
   `1,00e400 J`.

**Captures** : `principal.png`, `options.png`, `mode-test.png` et
`phrase-temoin.png`, dans `captures/` (ignoré par git).

Au premier lancement, `npx playwright install chromium` est nécessaire. Le
dire dans `README.md`.

⚠ **LE RENDU SE VOIT, OU SE DÉCLARE NON VU.** Si `npm run voir` n'a pas pu
tourner, le rapport l'écrit en toutes lettres. Il ne passe pas la ligne sous
silence.

---

## 15. `CLAUDE.md`, `RETOURS.md`, `README.md`

**`CLAUDE.md`** est le mémo que toute session lit en premier. Il contient :

- **Les règles.**
  - Le brief est au format habituel ; on fait le geste zéro ; deux tests au
    maximum par lot, sur le vrai verrou ; aucun test d'équilibrage.
  - `SAVE_VERSION` ne bouge que si le schéma de l'état change, et une entrée
    de `migrations` l'accompagne alors.
  - La version et le build bougent **ensemble**, avec le numéro disponible au
    moment de l'exécution.
  - Branches `claude/…` ; Claude Code ouvre la PR, **Ethan fusionne**.
  - Chaque rapport finit par « À tester sur ton téléphone, en 10 minutes ».
- **L'architecture** :
  - `src/sim` est pur (§6) ;
  - un `Decimal` pour toute ressource, importé par `nombre.js` ;
  - `avancer` est le seul moteur du temps ;
  - le dévoilement passe par `devoilement.js` ;
  - l'affichage des nombres par `formater` ;
  - le stockage par `stockage.js`.
- **Les commandes**, et **l'état** : version, build, `SAVE_VERSION`, nombre de
  tests, taille de `dist/index.html`.
- **Où vit le plan** : dans le projet Claude « Jeu Mobile »
  (`claude/DESIGN-TEMPERATURE-CRITIQUE.md`). Chaque brief en recopie ce qu'il
  lui faut.

**`RETOURS.md`** est vide pour l'instant, mais structuré. Il a cinq rubriques :
« Bloquant », « Ergonomie », « Textes », « Équilibrage » et « Idées ». Chaque
entrée suit le même format :

```
- [date] écran : … · ce qui se passe : … · ce que j'attendais : …
```

Un en-tête rappelle la règle : les retours s'accumulent ici, **un lot RETOURS
les traite ensemble**, et seul un bloquant passe devant.

**`README.md`** remplace la ligne d'Ethan. Il contient :
- une phrase sur le jeu ;
- le lien pour jouer ;
- les commandes ;
- l'installation de Chromium pour `npm run voir` ;
- un renvoi vers `LICENCES-TIERCES.md`.

---

## 16. Ce qui n'est PAS dans ce lot

- **Les machines, la production, les paliers** : lots MACHINES et FROID.
  L'énergie reste à 10 J, sauf en mode test.
- **Le joueur automatique** : lot JOUEUR-AUTO. Mais `avancer` et `rattraper`
  sont déjà faits pour lui.
- **Les onglets, le carnet, les succès** : la barre d'onglets apparaît avec le
  Labo (lot SUPRA).
- **Le choix de la notation** par le joueur : seule la notation scientifique
  est branchée.
- **Le hasard semé** : aucune mécanique n'en a besoin avant la couche 4.
- **Le wrapper Android** : après le point de décision.
- **Le son, les animations.**
- **Corriger les symboles** absents des polices (§4) : le lot les montre,
  Ethan décidera.

---

## 17. Versionnage et rendu

⚠ **C'EST LE SEUL LOT OÙ LE BRIEF FIXE LES NUMÉROS**, parce que le dépôt n'en a
aucun. `package.json` : `"version": "0.1.0"` et `"config": { "build": 1 }`,
avec `SAVE_VERSION = 1`. **À partir du lot 2**, la règle habituelle
s'applique : la version et le build bougent ensemble, et le brief ne propose
aucun numéro. Le build est affiché dans Options. C'est lui qui dira à Ethan,
sur son téléphone, s'il joue bien la dernière version.

---

## 18. Le rapport — `rapports/RAPPORT-lotSOCLE.md`

Il doit contenir, dans l'ordre :

1. **Le geste zéro** : les commits trouvés, la version de Node.
2. **Les dépendances** : `npm ls --depth=0`, `npm ls break_infinity.js` (une
   seule copie), et les licences.
3. **`npm run check`** : le nombre de tests (2), puis la taille de
   `dist/index.html` en octets, **poste par poste** : JavaScript, CSS, polices
   en base64, licences, balisage. Les postes doivent faire le total.
4. **T1 et T2** : les assertions, **et le résultat des six falsifications
   exécutées**.
5. **`npm run voir`** : les étapes du scénario, le nombre d'erreurs console, les
   captures produites. Ou « non exécuté », avec la raison.
6. **Les versions des actions GitHub** retenues, et où elles ont été vérifiées.
7. **Les écarts déclarés**, nommément :
   - les symboles qui tombent sur la police de secours ;
   - le rattrapage approché ;
   - tout écart de version de paquet.
8. **Ce qui contredit ce brief.** Le dépôt a raison contre le brief, toujours,
   et il faut le dire, pas le contourner.
9. **« À tester sur ton téléphone, en 10 minutes »**, après la fusion et le
   déploiement Pages :
   1. Ouvrir `https://freredoc.github.io/Temperature-Critique-/` : « 10 J ».
   2. ≡ → Options : `0.1.0 · build 1`.
   3. Toucher 7 fois la version : le mode test s'ouvre, et « Partie de test »
      apparaît.
   4. Énergie `1e400` : l'écran montre `1,00e400 J`.
   5. Fermer l'onglet, puis le rouvrir : toujours `1,00e400 J`.
   6. Mode test, « +1 h » : le dernier rattrapage montre 3 600 000 ms en 1000
      pas.
   7. Exporter et copier ; Nouvelle partie (`10 J`) ; Importer :
      `1,00e400 J` revient.
   8. Regarder la phrase témoin : les symboles grecs et mathématiques sont-ils
      lisibles, ou choquants ? Le noter dans `RETOURS.md`.
   9. Passer sur une autre appli 2 minutes, puis revenir : le bandeau
      d'absence s'affiche.

⚠ **RELECTURE HOSTILE AVANT LA PR.** Relire tout le patch en lecteur adverse,
et corriger avant de livrer, jamais après. Les trois questions qui attrapent
le plus :
- qui d'autre écrit ce champ ?
- qui d'autre lit cet état ?
- cet état est-il seulement atteignable ?

⚠ **LA BRANCHE EST `claude/socle-fondations`. Claude Code ouvre la PR, Ethan
fusionne.** Jamais l'inverse. C'est la fusion qui déclenche le déploiement
Pages.
