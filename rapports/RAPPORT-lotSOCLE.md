# RAPPORT — lot SOCLE

Premier lot de **Température Critique**, branche `claude/socle-fondations`.
Exécuté le 27/09/2026 par Claude Code (Opus 5.5), sur le PC d'Ethan.

**En bref.** Le socle est posé : build vers un seul fichier, `Decimal`
partout, boucle à pas fixe, sauvegarde avec export et import, rattrapage hors
ligne sans plafond, coquille 8 bits, mode test, licences et publication.
`npm run check` est vert (2 tests). Les six falsifications font toutes tomber
leur test. `npm run voir` passe ses 14 étapes dans Chromium, avec zéro erreur
console.

⚠ **Un geste reste à faire avant la fusion : Pages n'est pas réglé sur
« GitHub Actions »** (voir §8).

---

## 1. Le geste zéro

- **Commits trouvés** : `git log --oneline --all` rend un seul commit,
  `0ed8fce Initial commit`. La racine ne contient que `README.md` : 23 octets,
  `# Temperature-Critique-`, le README d'Ethan. C'est conforme à l'attendu.
- **Node** : `v22.23.2`, le Node 22 portable du PC, en tête du PATH ; npm
  10.9.8. La CI tourne aussi en Node 22.
- **Branche** : `claude/socle-fondations`, créée depuis `main` (`0ed8fce`).
- **Premier fichier écrit** : `.gitattributes` (`* text=auto eol=lf`),
  vérifié en LF à l'octet. Juste après, le brief a été recopié tel quel dans
  `rapports/BRIEF-lotSOCLE.md` (`cmp` identique, aucun CR).
- **Pages**, vérifié par l'API GitHub : activé, mais en mode `legacy`
  (source « Deploy from a branch », `main`, `/`), et non « GitHub Actions ».
  Voir §8.

## 2. Les dépendances

```
$ npm ls --depth=0
temperature-critique@0.1.0
+-- @antimatter-dimensions/notations@3.2.0
+-- @fontsource/pixelify-sans@5.3.0
+-- @fontsource/vt323@5.3.0
+-- break_infinity.js@2.2.0
+-- esbuild@0.28.2
`-- playwright@1.63.0

$ npm ls break_infinity.js
temperature-critique@0.1.0
+-- @antimatter-dimensions/notations@3.2.0
| `-- break_infinity.js@2.2.0 deduped
`-- break_infinity.js@2.2.0
```

- **Une seule copie de `break_infinity.js`**, dédoublonnée : notations la
  demande en `^2.0.0`, à la fois en dépendance et en dépendance paire.
- **Le build le vérifie aussi**, dans le bundle lui-même : il lit le
  `metafile` d'esbuild et échoue s'il y trouve autre chose qu'**un** module
  `break_infinity.js`.
- **Versions épinglées sans `^`**, identiques au brief. Ce sont aussi les
  dernières publiées au 27/09 : aucun écart.
- **Livrés dans le jeu**, d'après le `metafile` d'esbuild (octets dans le
  bundle) :

  | Module | Octets |
  |---|---|
  | notations | 51 478 |
  | break_infinity.js | 22 658 |
  | pad-end | 984 |
  | tslib | 676 (seulement `__extends`) |

  Le brief avait raison de compter pad-end et tslib comme livrés.
- **Licences** : `LICENCES-TIERCES.md` contient le texte **complet** des six
  licences, recopié par script depuis les paquets, fins de ligne ramenées en
  LF :

  | Paquet | Licence | Copyright |
  |---|---|---|
  | break_infinity.js | MIT | © 2019 Timothy Stiles |
  | pad-end | MIT | © 2016 W.Y. |
  | notations | MIT | © 2019 Antimatter Dimensions |
  | tslib | 0BSD | © Microsoft Corporation |
  | VT323 | OFL-1.1 | © 2011 The VT323 Project Authors |
  | Pixelify Sans | OFL-1.1 | © 2021 The Pixelify Sans Project Authors |

  Une section « Antimatter Dimensions — MIT » est réservée pour le lot
  MACHINES. Le fichier est intégré au build et s'affiche dans Options, puis
  Licences.
- **Polices** : les tailles sont celles du brief, à l'octet. VT323 400 fait
  17 936 octets, Pixelify Sans 400 fait 7 692 octets et Pixelify Sans 700
  fait 7 904 octets.

## 3. `npm run check`

- **garde-sim** : `src/sim/ est pur (5 fichiers lus)`.
- **Tests** : **2**, 2 verts (`SOCLE T1`, `SOCLE T2`).
- **Build** : `dist/index.html` fait **172 907 octets**. Le détail, poste
  par poste :

  | Poste | Octets |
  |---|---|
  | JavaScript (bundle esbuild, IIFE, es2020, non minifié) | 100 774 |
  | CSS (`src/ui/theme.css`) | 7 606 |
  | Polices (3 `@font-face`, dont 44 712 de base64) | 45 129 |
  | Licences (`LICENCES-TIERCES.md`, en JSON) | 14 513 |
  | Balisage (le gabarit `src/index.html`) | 4 885 |
  | **Total** | **172 907** |

  Les postes font le total par construction : le balisage est le reste,
  mesuré par le build.
- **Dans le JavaScript** : notre code (`src/`) pèse 23 015 octets. Le reste vient de notations, break_infinity.js, pad-end et tslib
  (§2), plus l'enveloppe IIFE. Notations pèse 51 Ko alors qu'une seule
  notation sert : ses classes sont déclarées dans des IIFE qui appellent
  `__extends`, et esbuild ne peut pas prouver qu'elles sont sans effet de
  bord, donc il ne les retire pas.
- **Le build se garde lui-même.** Il échoue si le fichier contient
  `src=`/`href=` vers `http(s)://` ou `//`, `url(http…)`, ou `@import`.
  Il échoue aussi sur :
  - une deuxième copie de break_infinity.js ;
  - une couleur hors des 16 de la palette ;
  - un `</script` ou un `<!--` dans le JavaScript.

## 4. T1 et T2

### SOCLE T1 — la sauvegarde rend les grands nombres tels quels

**Assertions** (`test/sauvegarde.test.js`, un seul `test()`) :

1. `deserialiser(serialiser({ a: 1e400, b: { c: [1.5e-3, 0] }, t: 123456789 }))` :
   - chaque `Decimal` relu est `instanceof Decimal`, celui de
     `src/sim/nombre.js` ;
   - chacun `.eq()` l'original ;
   - `t` reste le `Number` 123456789, en égalité stricte.
2. Un état à `energie = 1e400` passe par `importer(exporter(enveloppe))` :
   - le code commence par `TC1.` ;
   - l'import réussit ;
   - l'énergie revient `instanceof Decimal`, égale à 10⁴⁰⁰.
3. Une enveloppe de `saveVersion = SAVE_VERSION + 1`, passée à `importer` :
   `ok: false`, sans exception, avec l'erreur « c'est une sauvegarde de
   version 2, venue d'une version plus récente du jeu ; celle-ci lit jusqu'à
   la version 1 ».

**Falsifications exécutées**, puis défaites. Les fichiers ont été restaurés à
l'octet près (sha1 vérifié) et les tests sont revenus au vert.

| Falsification | Résultat |
|---|---|
| Retirer l'étiquetage `$d` (laisser faire `toJSON`) | **TOMBE** au premier `instanceof` : « relu comme "1e+400", pas comme un Decimal ». |
| Convertir par `Number()` | **TOMBE**, mais plus tôt que prévu : `serialiser` lève « nombre invalide, non sauvegardé (Infinity) », car la garde de format refuse d'écrire un nombre qu'elle ne saurait relire. |
| … la même, gardes de format retirées | **TOMBE** sur la comparaison : « Infinity ≠ 1e+400 », comme le brief le prévoit. |
| Retirer la vérification de version | **TOMBE** sur la 3ᵉ assertion : `ok` attendu `false`, obtenu `true`. |

### SOCLE T2 — le rattrapage rend tout le temps, au pas près

**Assertions** (`test/rattrapage.test.js`, un seul `test()`) :

1. `rattraper(e1, 604_800_013)` : `totalMs` vaut exactement 604 800 013, et
   `pas ≤ 1000`. En fait 1000 pas : 13 pas de 604 801 ms, puis 987 pas de
   604 800 ms.
2. `rattraper(e2, 120)` : `totalMs` vaut 120, et `pas === 3`.
3. `rattraper(e3, -5000)` : `totalMs` vaut 0, et `pas === 0`.

**Falsifications exécutées**, puis défaites, dans les mêmes conditions.

| Falsification | Résultat |
|---|---|
| Plafonner à 24 h (`Math.min(ms, 24 h)`) | **TOMBE** sur la 1ʳᵉ : attendu 604 800 013, obtenu 86 400 000. |
| Découper par `floor` sans répartir le reste | **TOMBE** sur la 1ʳᵉ : attendu 604 800 013, obtenu 604 800 000. Les 13 ms sont perdues. |
| Laisser passer un temps négatif (garde retirée) | **TOMBE** sur la 3ᵉ, mais sur `pas` (−100 au lieu de 0) : avec n négatif, la boucle ne tourne pas, et `totalMs` reste à 0. |
| … la même, avec « au moins un pas » | **TOMBE** sur la 3ᵉ, sur le temps cette fois : `totalMs` = −5000, le jeu recule. |

**Falsification de la garde de pureté** (en plus du brief) :
- un `Date.now()` ajouté dans `src/sim/avancer.js` fait échouer
  `garde-sim`, avec le fichier et la ligne ;
- les mêmes noms placés en commentaire, et un `// document` après une chaîne
  `"http://x"`, ne la déclenchent pas.

## 5. `npm run voir`

**Exécuté**, le 27/09, dans Chromium 153.0.8010.12 (Chrome for Testing,
Playwright 1.63.0). Le navigateur a été installé une fois sur ce PC par
`npx playwright install chromium`. La page est servie en HTTP local, dans
une fenêtre de 360 × 780 à DPR 3, avec de vrais clics à la souris.

| # | Étape | Résultat |
|---|---|---|
| 1 | chargement sans erreur | ok |
| 2 | « 10 J » est visible | ok |
| 3 | ≡ ouvre les Options, version « 0.1.0 · build 1 » | ok |
| 4 | 7 clics sur la version ouvrent le mode test, « Partie de test » apparaît | ok |
| 5 | énergie `1e400` → « 1,00e400 J » sur l'écran principal, sans débordement à 360 px | ok |
| 6 | « Sauvegarder », rechargement : toujours « 1,00e400 J » | ok |
| 7 | « Exporter » : le code commence par `TC1.` | ok |
| 8 | « Nouvelle partie » (deux touchers) : « 10 J », puis « Importer » : « 1,00e400 J » | ok |
| + | « +1 h » : dernier rattrapage « 3 600 000 ms en 1000 pas » | ok |
| + | absence de 2 h (sauvegarde reculée) : rattrapée au chargement, bandeau « Tu étais absent 2 h 0 min. » | ok |
| + | page cachée 3 s puis revenue, horloge avancée de 2 min : rattrapée **une seule fois** au retour, bandeau « Tu étais absent 2 min 3 s. » | ok |
| + | sauvegarde illisible : copiée telle quelle sous `…-illisible:<horodatage>`, nouvelle partie, message | ok |
| + | sauvegarde de version future : refusée, message, **intacte** après « Sauvegarder » et rechargement | ok |
| + | zéro erreur console, aucune requête hors de l'origine locale | ok |

- **Erreurs console : 0.** Avertissements : 0.
- **Les étapes « + »** vont au-delà du scénario du brief. Elles couvrent les
  chemins de chargement du §8 et le point 4 du §7.
- **La vérification « page cachée » a des dents.** Si l'on retire la ligne
  qui ignore les images d'une page cachée, elle tombe : +126 052 ms au lieu
  de 123 002, les 3 s cachées comptées deux fois. Ligne remise ensuite, sha1
  vérifié.
- **Captures**, dans `captures/` (ignoré par git), toutes regardées :
  - `principal.png` : fond noir-bleu, « 10 J » orange en VT323, ≡ en haut à
    droite ;
  - `options.png` : version, Sauvegarder, Exporter, Importer, Licences ;
  - `mode-test.png` : vitesse ×1 sélectionnée en cyan, sauts, énergie,
    mesures, phrase témoin, Nouvelle partie ;
  - `phrase-temoin.png` : voir §7.1 ;
  - `absence.png` (en plus) : le bandeau cyan au-dessus de
    « 1,00e400 J », qui occupe environ 220 px sur 360.

## 6. Les versions des actions GitHub

Vérifiées le 27/09/2026 par l'API GitHub : la dernière release de chaque
dépôt, et les étiquettes majeures qui existent.

| Action | Retenue | Dernière release | Où |
|---|---|---|---|
| `actions/checkout` | `@v7` | v7.0.1 (20/07/2026) | https://github.com/actions/checkout/releases/tag/v7.0.1 |
| `actions/setup-node` | `@v7` | v7.0.0 (14/07/2026) | https://github.com/actions/setup-node/releases/tag/v7.0.0 |
| `actions/upload-pages-artifact` | `@v5` | v5.0.0 (10/04/2026) | https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0 |
| `actions/deploy-pages` | `@v5` | v5.0.1 (01/09/2026) | https://github.com/actions/deploy-pages/releases/tag/v5.0.1 |

- **Les entrées utilisées** ont été relues dans l'`action.yml` de chaque
  étiquette majeure : `node-version` et `cache`, `path`, et la sortie
  `page_url`.
- **`npm ci` ne télécharge aucun navigateur** en CI : Playwright n'a pas de
  script d'installation, seul esbuild en a un (son binaire).
- **`package-lock.json`** contient l'entrée `@esbuild/linux-x64`, donc
  `npm ci` marchera sous Ubuntu.

## 7. Les écarts déclarés

### 7.1 Les symboles qui tombent sur la police de secours

Mesuré en lisant la table `cmap` des fichiers `.woff`, pour les
sous-ensembles `latin` et `latin-ext` :

- **Présents dans VT323, Pixelify 400 et Pixelify 700** :
  - tous les accents du français ;
  - œ Œ ² ³ × − · … « » ’ ;
  - l'espace insécable U+00A0.
- **Absents des deux polices** (latin comme latin-ext) :
  - **Ω τ γ λ α Δ √ ≥ ≤ → ← ☉ ₂ ₃ ⁶ ⁻**, comme le brief l'annonçait ;
  - plus **≡ ✕ ∞ ⋯** ;
  - l'espace fine U+202F et l'espace fine U+2009.

Sur la capture `phrase-temoin.png`, ces symboles sortent dans une police
lisse, au milieu des pixels : c'est visible. Deux autres détails s'y voient.
Le « × » de VT323 ressemble à un « X ». Les « « » » de Pixelify sont très
grands.

**Rien n'est corrigé : Ethan tranche sur pièce.** Seul le bouton ≡ est
dessiné en CSS (trois barres), pour ne pas montrer un glyphe de secours à
l'écran principal.

### 7.2 Le rattrapage est approché

`rattraper` applique les mêmes formules, mais en 1000 pas au plus : une
semaine d'absence donne des pas de 10 min, là où la boucle en fait de 50 ms.
Tant que `avancer` ne fait qu'ajouter du temps, c'est exact. Dès qu'une
production en cascade arrive (lot MACHINES), un grand pas n'intègre plus
comme mille petits. L'écart se mesurera avec le joueur automatique, lot par
lot. Le code et `CLAUDE.md` le disent.

### 7.3 Les versions de paquets

Aucun écart : les six versions du brief sont aussi les dernières publiées au
27/09. `pad-end` 1.0.2 et `tslib` 2.8.1 viennent en dépendances.

### 7.4 Les autres choix de ce lot, à connaître

**Sauvegarde et chargement**

1. **Le format de l'étiquette `$d`** est `"<mantisse>e<exposant>"`
   (`{"$d":"1e400"}`), et non `toString()`. Mesuré : l'aller-retour par
   `toString()` perd l'exactitude dans 24 cas sur 240, car il passe par un
   `Number` sous 1e21. Le format mantisse-exposant n'en perd aucun.
2. **Le sérialiseur refuse d'écrire ce qu'il ne saurait relire** : un `NaN`,
   ou un objet d'état dont la seule clé serait `$d`, que l'on relirait comme
   un nombre. La sauvegarde précédente reste alors intacte.
3. **Une sauvegarde de version future bloque toute écriture pour la
   session**, import et nouvelle partie compris. Ceux-ci remplacent l'état en
   mémoire, sans l'écrire. La sauvegarde plus récente n'est jamais écrasée ;
   le message dit de recharger la page.
4. **Une sauvegarde illisible qu'on n'arrive pas à mettre de côté** (stockage
   plein) bloque aussi l'écriture.
5. **Un stockage inaccessible** (navigation privée) est signalé : la partie
   n'est alors pas sauvegardée.
6. **L'import ne rattrape pas le temps** écoulé depuis l'export. L'état
   reprend là où le code l'a figé. Le brief ne disait rien là-dessus.
7. **`sauveLe`** est l'heure jusqu'à laquelle l'état a été simulé. Le reste
   de l'accumulateur (moins d'un pas) en est retranché, pour qu'un
   rechargement ne perde rien.
8. **Le minuteur d'autosauvegarde** suit l'horloge monotone
   (`performance.now()`) : une horloge système reculée ne le bloque pas.

**Affichage**

9. **`formater` tronque sous 10⁶** : 9,9996 s'affiche `9,999`, jamais plus
   que ce qu'on a. Au-delà, la notation de notations arrondit :
   9,996e6 s'affiche `1,00e7`.
10. **Les exposants à partir de 100 000** : notations les groupe par des
    virgules (`1.00e100,000`). Ils deviennent `1,00e100 000`, avec U+00A0.
11. **Le nombre de pas** du dernier rattrapage s'affiche sans groupement
    (« 1000 pas »), comme dans le brief. Les ms sont groupées.

**Mode test**

12. **Il reste visible tant que la partie est marquée.** Après un
    rechargement, pas besoin de retoucher 7 fois la version.
13. **Une « Nouvelle partie » lancée depuis le mode test est marquée elle
    aussi.** Pour une partie propre, il faut importer un code non marqué.
14. **La confirmation de « Nouvelle partie » expire au bout de 5 s.**

**Outils**

15. **`garde-sim`** refuse les six noms du brief. `Date` y est refusé sous
    toutes ses formes, `new Date` compris. S'y ajoutent `sessionStorage`,
    `crypto`, `navigator`, `globalThis`, `requestAnimationFrame`,
    `setTimeout` et `setInterval`.
16. **Les licences** : à l'affichage dans le jeu, les lignes de clôture
    ```` ``` ```` du Markdown sont retirées.
17. **Favicon `data:,`** : il évite une requête `/favicon.ico`, qui ferait
    une 404 sur Pages.
18. **`package-lock.json`** est versionné, bien qu'absent de l'arborescence
    du brief : `npm ci` l'exige.
19. **`engines.node`** vaut `>=22` (voir §8).

### 7.5 Corrigé à la relecture hostile, avant la PR

- **Qui d'autre écrit ce champ ?** Un champ d'état nommé `$d` aurait été
  relu comme un nombre. Le sérialiseur le refuse désormais.
- **Qui d'autre lit cet état ?** `sauveLe` sert au rattrapage du
  rechargement. Il ignorait le reste de l'accumulateur, donc jusqu'à 50 ms
  étaient perdues à chaque rechargement. C'est corrigé (§7.4, point 7).
- **Cet état est-il atteignable ?** Oui : plusieurs retours d'absence sans
  fermer le bandeau empilaient les bandeaux. Le dernier remplace désormais le
  précédent.
- **Le minuteur d'autosauvegarde** était sur `Date.now()`. Il suit
  maintenant l'horloge monotone (§7.4, point 8).
- **Le retour au premier plan** (point 4 du §7 du brief) n'était pas
  vérifié par `voir`. Il l'est maintenant, par une étape dont la
  falsification a été vérifiée (§5).

## 8. Ce qui contredit ce brief

1. ⚠ **`node --test test/` ne marche pas sous Node 22.** Node prend `test/`
   pour un module et échoue avec « Cannot find module
   '…\Temperature-Critique-\test' ». Le script `npm test` est donc
   `node --test "test/*.test.js"`, qui trouve bien les 2 tests. Ce motif
   demande Node ≥ 21, d'où `engines.node` à `>=22`. Node 20 est en fin de vie
   depuis le 30/04/2026, et la CI tourne en 22.
2. ⚠ **Le geste 2 n'est pas fait comme le brief le demande.** Pages est
   activé, mais sa source est **« Deploy from a branch »** (`main`, `/`,
   `build_type: legacy`), et non **« GitHub Actions »**. Aujourd'hui, c'est le
   README qui est servi à l'adresse du jeu.
   - **Il faut basculer avant la fusion** : Settings → Pages → Build and
     deployment → Source : **GitHub Actions**.
   - Sinon, le déploiement du workflow échouera, ou se battra avec la
     publication automatique de la branche.
   - Si la fusion a déjà eu lieu : basculer, puis relancer le workflow
     « Pages » à la main (onglet Actions → Pages → Run workflow).
3. **Les permissions de la CI.** Le brief demandait `pages: write` et
   `id-token: write`. Dès qu'un workflow déclare ses permissions, les autres
   tombent à zéro ; or `checkout` a besoin de `contents: read`. Il est
   ajouté, comme dans le modèle Pages officiel de GitHub.
4. **Deux falsifications tombent autrement que prévu.** Le test tombe bien à
   chaque fois (§4) :
   - T1 « Number() » est attrapée plus tôt, par la garde de format ;
   - T2 « temps négatif » est attrapée sur le nombre de pas, pas sur le
     temps.
5. **Le brief a raison sur tout le reste**, vérifié :
   - les tailles des polices, à l'octet ;
   - la couverture de glyphes ;
   - `JSON.stringify(Decimal)` qui donne `"1e+400"` ;
   - `Number(1e400)` qui donne `Infinity` ;
   - `7.774e11` qui s'affiche `7,77e11`, et `1e400` qui s'affiche
     `1,00e400` ;
   - pad-end et tslib, bien livrés ;
   - les ~45 Ko de base64 (44 712 octets).

---

## 9. À tester sur ton téléphone, en 10 minutes

**Avant de fusionner** : sur GitHub, Settings → Pages → Source : **GitHub
Actions** (§8, point 2). Puis fusionne la PR. Attends que l'action « Pages »
soit verte, dans l'onglet Actions (environ une minute).

1. Ouvre https://freredoc.github.io/Temperature-Critique-/ : tu vois
   « 10 J ».
2. ≡ → Options : tu lis `0.1.0 · build 1`.
3. Touche 7 fois la version : le mode test s'ouvre, et « Partie de test »
   apparaît.
4. Énergie : écris `1e400`, puis Appliquer. Ferme les Options : l'écran
   montre `1,00e400 J`.
5. Ferme l'onglet, puis rouvre-le : toujours `1,00e400 J`.
6. Mode test (il est déjà là, dans Options), « +1 h » : « Dernier
   rattrapage » montre `3 600 000 ms en 1000 pas`.
7. Exporter, puis Copier. Nouvelle partie (deux touchers) : `10 J`. Colle le
   code dans Importer, puis Importer : `1,00e400 J` revient.
8. Regarde la phrase témoin, en bas du mode test. Les symboles grecs et
   mathématiques sont-ils lisibles, ou choquants ? Note-le dans
   `RETOURS.md`.
9. Passe sur une autre appli pendant 2 minutes, puis reviens : le bandeau
   « Tu étais absent 2 min … » s'affiche.
