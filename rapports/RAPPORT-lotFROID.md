# RAPPORT — lot FROID

Quatrième lot de **Température Critique**, branche `claude/froid-paliers`.
Exécuté le 02/10/2026 par Claude Code, dans un conteneur cloud.

**En bref.** Le jeu a son verbe : **refroidir**. Six paliers, de 300 K à
1,5 K. Chacun coûte un seuil d'énergie et remet la partie à 10 J sans
machines ; en échange, toutes les machines ×2 (cumulatif) et une machine de
plus. Les machines 5 à 8 arrivent ainsi : Réseau, Cyclotron, Synchrotron,
Collisionneur. `SAVE_VERSION` passe de 2 à 3 ; ta partie du 28/09 s'ouvre
migrée, sa copie d'avant migration gardée à côté. Version **0.3.0 · build 3**.

Le joueur automatique refroidit dès que le seuil est atteint. **Les paliers 1
à 5 sont mesurés, tous dans la cible** (−0,3 à −0,5 %), et le plus long écart
entre deux achats d'un même palier vaut **30,75 s, sous le plafond de 31 s**.
**Toutes les valeurs de contrôle du brief (§6.5) sont retrouvées
exactement** ; seul un arrondi du brief diffère (palier 5 : −0,5 %, pas
−0,6 %).

`npm run check` est vert avec **8 tests** ; la garde lit **13 fichiers**. Les
**sept falsifications** tombent toutes, au point annoncé. `npm run voir` passe
ses **28 étapes**, zéro erreur console.

---

## 1. Le geste zéro

- **Base** : `main` à `e6138e5` (« Merge pull request #3 from
  freredoc/claude/joueur-auto »). La branche `claude/froid-paliers` en part.
- **Lu avant de toucher quoi que ce soit** : `CLAUDE.md` en entier, puis
  `rapports/RAPPORT-lotJOUEUR-AUTO.md`. Lus aussi : `RAPPORT-lotMACHINES.md`
  (pour la forme), le code entier, et les §6, §11, §16 et §18 de la copie du
  plan. La racine, `src/` et ses sous-dossiers, `tools/`, `test/` et
  `mesures/` ont été listés.
- **Brief** : recopié dans `rapports/BRIEF-lotFROID.md`. `cmp` le donne
  identique à l'envoi, sans aucun CR.
- **Outils** : Node `v22.22.0`, npm `10.9.4`, Chromium `141.0.7390.37` piloté
  par Playwright `1.63.0`, avec `TC_CHROMIUM=/opt/pw-browsers/chromium`.
- **État de départ, mesuré** : `npm ci && npm run check` vert.

  | Mesure | Référence (`CLAUDE.md` du 02/10) | Mesuré |
  |---|---|---|
  | Version · build | 0.2.0 · build 2 | **0.2.0 · build 2** |
  | `SAVE_VERSION` | 2 | **2** |
  | Tests | 6 | **6** |
  | Garde | 12 fichiers | « garde-sim : src/sim/ et tools/joueur-auto/ sont purs (**12** fichiers lus). » |
  | `dist/index.html` | 189 877 octets | **189 877 octets**, SHA-256 `9ff6d56a…4791` |

- **`npm run voir` avant travail** : **22 étapes** réussies, zéro erreur et
  zéro avertissement console, « Tout acheter » à 10⁴⁰⁰ J en 1,4 ms.
- **`npm run mesure` avant travail** : 4,4 s ; `git status` reste vide après
  l'écriture, donc `mesures/MESURE.md` ressort **identique** à celui du dépôt.

---

## 2. `npm run check`

Vert, en fin de lot :

```
garde-sim : src/sim/ et tools/joueur-auto/ sont purs (13 fichiers lus).
# tests 8
# pass 8
# fail 0
build : dist/index.html, version 0.3.0 · build 3
  javascript     121481 octets
  css             10147 octets
  polices         45129 octets
  licences        16391 octets
  balisage         6234 octets
  = total        199382 octets
```

- **8 tests** : les 6 d'avant (dont `MACHINES T1`, réancré, voir §3.4), et
  `FROID T1`, `FROID T2`.
- **La garde passe de 12 à 13 fichiers** : `src/sim/froid.js` entre. Il ne
  touche ni au navigateur, ni à l'horloge, ni au hasard. Les fichiers du
  joueur automatique importent `src/sim/froid.js` et `src/data/froid.js`,
  que la garde permet.
- **`dist/index.html`** : **199 382 octets**, SHA-256
  `3bba9ff01026a69f20c07df941f9cb69f230b808eaa1ed2b1a9cda6aacb067d2`.

| Poste | JOUEUR-AUTO | FROID | Écart |
|---|---|---|---|
| JavaScript | 113 823 | 121 481 | **+7 658** |
| CSS | 9 010 | 10 147 | +1 137 |
| Polices (base64) | 45 129 | 45 129 | 0 |
| Licences | 16 391 | 16 391 | 0 |
| Balisage | 5 524 | 6 234 | +710 |
| **Total** | **189 877** | **199 382** | **+9 505** |

- **Dans le JavaScript**, notre code (`src/`) passe de 35 982 à 43 571
  octets, soit **+7 589** (octets par module relevés dans le metafile
  d'esbuild, sur `main` et sur la branche) :
  - trois fichiers neufs : `src/ui/froid.js` 3 645, `src/sim/froid.js`
    1 323, `src/data/froid.js` 621 ;
  - et des ajouts : `src/sim/sauvegarde.js` +922 (migration, contrôles de
    forme), `src/data/devoilement.js` +594, `src/sim/machines.js` +356,
    `src/main.js` +88, `src/sim/etat.js` +40.

  Les dépendances passent de 75 846 à 75 796 octets (−50) : du bruit
  d'esbuild, qui renomme des identifiants, comme au lot MACHINES ; aucune
  dépendance n'a changé. Le reste, +119 octets, est l'emballage des modules.
- **Le CSS** gagne le bloc froid, la jauge, et une règle pour le bouton
  principal grisé (§6.2).
- **Le balisage** gagne la section du bloc froid.
- **Les polices ne bougent pas.** Aucun glyphe neuf : « × », « · », « é »,
  « è » sont dans le sous-ensemble latin. « CO₂ » n'est que dans un
  commentaire.
- **Le build se garde toujours** : aucune ressource réseau, une seule copie
  de break_infinity.js, aucune couleur hors des 16.

---

## 3. T1 et T2

### 3.1 `FROID T1` — la partie v2 s'ouvre en v3, et le palier voyage

1. **Une enveloppe v2 exactement comme MACHINES l'écrit** : `saveVersion: 2`,
   `build: 2`, `sauveLe: 2 000`, mode test non utilisé, 90 000 ms jouées,
   12 345,678 J, la Dynamo à 1 500 (12 achetées), l'Alternateur à 3 (3
   achetés), les autres à zéro, `decouvertes.machines: 2`, `modeAchat:
   "lot"`. `relire(serialiser(v2))` rend :
   - `ok: true`, `saveVersion === SAVE_VERSION` (3), `migreeDepuis: 2` ;
   - `froid.palier: 0` et `decouvertes.paliers: 0` ;
   - **tout le reste intact** : l'énergie, les deux machines (quantités et
     achats), `decouvertes.machines` à 2, `modeAchat` à « lot », `totalMs` à
     90 000.
2. **Un état neuf à `froid.palier: 4` et `decouvertes.paliers: 5`** traverse
   `importer(exporter(…))` : les deux reviennent tels quels.
3. **Deux refus, chacun nommant son champ** :
   - `froid.palier: 7` (et `decouvertes.paliers` resté à 0) : refusé, le
     message nomme `froid.palier` **et pas** `decouvertes.paliers`. C'est ce
     qui prouve que le palier est vérifié **avant** le plus haut palier : dans
     l'autre ordre, c'est « 0 sous le palier courant 7 » qui sortirait.
   - `froid.palier: 4` avec `decouvertes.paliers: 3` : refusé, le message
     nomme `decouvertes.paliers` (« l'état est incohérent :
     « decouvertes.paliers » vaut 3, sous le palier courant (4) »).

### 3.2 `FROID T2` — le palier suit la règle

Montage du brief : partie neuve, la Dynamo à 123 (37 achetées),
`decouvertes.machines: 4`, 999 999 999 J. Chaque message d'assertion commence
par le numéro de son point : une falsification dit d'elle-même où elle tombe.

| Point | Geste | Attendu, et obtenu |
|---|---|---|
| 1 | `refroidir` à 999 999 999 J | `false` ; palier 0, l'énergie et la Dynamo (123, 37) n'ont pas bougé |
| 2 | 1e9 J pile, `refroidir` | `true` ; palier 1, 10 J ; **les 8 machines à 0 et 0 achat** ; `decouvertes.paliers` 1, `decouvertes.machines` **toujours 4** ; 5 machines débloquées ; prix Dynamo 10, prix Réseau 1e9 ; Dynamo ×2 |
| 3 | `refroidir` à 10 J | `false` |
| 4 | une Dynamo, puis `avancer(e, 1000)` | **2 J** : une Dynamo au ×2 |
| 5 | la Dynamo à 10 achats | **×4** : le lot et le palier se composent |
| 6 | 1e15, 1e22, 1e30, 1e39, 1e44 J, `refroidir` chaque fois | `true` ×5 ; palier 6, `decouvertes.paliers` 6, 8 machines ; Dynamo **×64** (achats repartis de zéro : 2⁶ seul) ; `seuilSuivant` et `apercuRefroidir` nuls |
| 7 | 1e400 J, `refroidir` | `false`, palier 6 |

### 3.3 Les sept falsifications, exécutées puis défaites

Chaque falsification est appliquée par un script jetable (remplacement exact,
une seule occurrence), `test/froid.test.js` est lancé, puis le fichier est
restauré à l'octet (sha1 vérifié) ; les 8 tests sont revenus au vert.

| Falsification | Résultat |
|---|---|
| **T1a** — `migrations[2]` retirée | T1 **TOMBE** au point 1 : « 1. la migration 2 → 3 manque » |
| **T1b** — la migration écrit `palier: "0"` | T1 **TOMBE** au point 1, par le refus de forme : « 1. l'état est incomplet : « froid.palier » manque ou n'est pas un entier entre 0 et 6 » |
| **T1c** — le contrôle `decouvertes.paliers ≥ froid.palier` retiré | T1 **TOMBE** au point 3 : « 3. un plus haut palier (3) sous le palier courant (4) est accepté » |
| **T2a** — `achetees` non remis à zéro | T2 **TOMBE** au point 2 : « 2. machine 1 : achats, 37 !== 0 » (voir §7, point 3) |
| **T2b** — le ×2 non cumulatif (×2 dès le palier 1, sans puissance) | T2 **TOMBE** au point 6 : « 6. multiplicateur de la dynamo : 2 » (×2 au lieu de ×64) |
| **T2c** — le seuil d'un cran trop loin (`palier + 2`) | T2 **TOMBE** au point 2 : « 2. refroidir à 1e9 J, false !== true » |
| **T2d** — `machinesDebloquees` inchangé | T2 **TOMBE** au point 2 : « 2. machines débloquées, 4 !== 5 » |

### 3.4 Le réancrage de `MACHINES T1`

`MACHINES T1` attendait `saveVersion === 2` après la migration d'une v1 : il
est tombé dès que `SAVE_VERSION` est passé à 3 (« expected 2, actual 3 »),
comme le brief l'annonçait. Il lit désormais `SAVE_VERSION`. Le reste du
test ne change pas, et il ne s'assouplit pas : une v1 doit toujours traverser
**toutes** les migrations jusqu'à la version courante. `SOCLE T1` lisait déjà
`SAVE_VERSION + 1` et ne bouge pas.

---

## 4. `npm run voir`

**Exécuté** en fin de lot dans Chromium 141.0.7390.37, en 360 × 780 à DPR 3 :
**28 étapes réussies**, zéro erreur et zéro avertissement console, aucune
requête hors de l'origine locale. « Tout acheter » à 10⁴⁰⁰ J (M6) : 1,4 ms.

| # | Étape | Résultat |
|---|---|---|
| 1–8 | Le scénario du SOCLE, version lue dans `package.json` : « 0.3.0 · build 3 » | PASSE |
| 9–13 | Les cinq vérifications du SOCLE (rattrapage, absence, page cachée, illisible, future) | PASSE |
| 14–20 | M1 à M7, inchangées | PASSE |
| 21 | **M8**, réancrée : la sauvegarde SOCLE (v1) chargée, copiée telle quelle, **réécrite dans la version courante** (`saveVersion` lu dans `SAVE_VERSION`) | PASSE |
| 22 | **F1** — stockage vidé, partie neuve, mode test (7 touchers), 1e7 J : bloc froid caché ; après Dynamo et Alternateur, toujours caché ; **à la Turbine, il paraît** : « 300 K · ambiante », « Prochain palier : 194,65 K, glace carbonique. Il faut 1,00e9 J. », bouton « Refroidir à 194,65 K » `disabled`, pas d'explication ; puis la Centrale | PASSE |
| 23 | **F2** — 1e9 J : le bouton s'allume, « Tu peux refroidir à 194,65 K. », l'aperçu complet nomme le Réseau, jauge à 100, aucun débordement, `froid.png` | PASSE |
| 24 | **F3** — « Refroidir » : « 10 J », « 194,65 K · glace carbonique », « +0 J/s », cartes 1 à 5, Dynamo « 0 · ×2 · lot 0/10 » et « 10 J », Réseau « Nouveau » et « 1,00e9 J », explication « … Ici : ×2. », objectif « … 77,36 K, azote liquide. Il faut 1,00e15 J. » ; la production, les commandes d'achat et le bloc toujours là | PASSE |
| 25 | **F4** — 1e15, 1e22, 1e30, 1e39, 1e44 J puis « Refroidir » : à chaque cran, l'aperçu d'avant (Cyclotron, Synchrotron, Collisionneur, puis sans machine) et la température d'après ; à la fin « 1,5 K · hélium pompé », l'objectif du palier 6, bouton et jauge cachés, « Ici : ×64. », cinq cartes, aucun débordement, `palier6.png` ; puis **10⁴⁰⁰ J, « Tout acheter », un jour de cascade, 10⁴⁰⁰ J** : huit cartes, aucun débordement, `palier6-huit.png` | PASSE |
| 26 | **F5** — « Sauvegarder maintenant », rechargement : « 1,5 K · hélium pompé », bloc visible, pas de bouton | PASSE |
| 27 | **F6** — la partie d'Ethan (v2) écrite en toutes lettres côté Node et passée par `serialiser` (on y vérifie `"energie":{"$d":"5e2"}`), posée depuis `/atelier` : aucun bandeau orange, 500 à 600 J, Dynamo « n · ×1 · lot 3/10 » (n ≥ 3), Alternateur « 1 · ×1 · lot 1/10 », cartes 1 à 3, **pas de bloc froid** ; la copie `temperature-critique:sauvegarde-v2:…` vaut le texte **au caractère près** ; après « Sauvegarder maintenant », `saveVersion` vaut `SAVE_VERSION`, et la partie porte `froid.palier: 0`, `decouvertes.paliers: 0` | PASSE |
| 28 | Zéro erreur console, aucune requête hors de l'origine | PASSE |

**Les captures, regardées** (dans `captures/`, non versionné) :

- **`froid.png`** (F2, 1e9 J) : sous « 1,00e9 J » et « +1,325 J/s », le bloc
  froid sur fond cyan sombre. « 300 K · ambiante » en cyan, en grand ;
  « Tu peux refroidir à 194,65 K. » ; la jauge pleine ; le bouton orange
  « Refroidir à 194,65 K » ; dessous, l'aperçu sur trois lignes. Les
  commandes d'achat et les cartes suivent, sans débordement.
- **`palier6.png`** (F4) : « 10 J », « +0 J/s ». Le bloc dit « 1,5 K ·
  hélium pompé », l'explication « Plus il fait froid, moins le cuivre
  résiste : toutes les machines ×2 par palier. Ici : ×64. » en gris, et
  l'objectif « 1,5 K : le plus froid pour l'instant. La suite viendra avec la
  supraconductivité. » Ni jauge, ni bouton. Les cartes portent « 0 · ×64 ·
  lot 0/10 ».
- **`froid-debut.png`** (F1, en plus du brief) : le bouton grisé, lisible
  (fond sombre, texte gris, bord gris), et la jauge aux trois quarts pour
  9,99e6 J : log(9,99e5) / log(1e8) ≈ 0,75, affiché 74,5 %.
- **`palier6-huit.png`** (F4, en plus du brief) : « 1,00e400 J »,
  « +3,43e55 J/s », le bloc du palier 6 et des cartes à « 5,36e53 · ×64 · lot
  0/10 » : le pire cas tient en 360 px.

Ce qu'on y voit aussi, déjà rangé dans `RETOURS.md` : le « × » de VT323
ressemble à un X, et Pixelify Sans dessine « 194,65 » avec un 5 qui ressemble
à un S (comme son J ressemble à un C à l'envers). Rien de neuf : c'est le lot
RETOURS-C1.

---

## 5. `npm run mesure`

**Durée** : la console affiche « (mesure écrite dans mesures/MESURE.md en
19.6 s) », pour 19,8 s au mur ; une deuxième exécution, 20,6 s (20,9 s au
mur). Le brief annonçait 25 s environ, toujours sous la minute. **Les deux
exécutions rendent `mesures/MESURE.md` identique au caractère.**

### 5.1 Le texte complet de `mesures/MESURE.md`

```markdown
# Mesure — Température Critique 0.3.0 · build 3

Le joueur automatique joue une partie neuve. Stratégie : à chaque décision, le joueur refroidit dès que le seuil est atteint, puis achète tout ce que son énergie paie, de la machine la plus chère à la moins chère.

Il décide une fois toutes les 0,25 s de jeu, et s'arrête au palier 6 (1,5 K) ou après 2 h 0 min de jeu.

## 1. Repères face au plan

Une durée est « dans la cible » si elle tient à ±20,0 % de la cible, sinon « hors cible ».

| Repère | Mesuré | Cible | Écart | Verdict |
|---|---|---|---|---|
| Palier 1 atteint | 3 min 42 s (222,75 s) | 223,5 s | −0,3 % | dans la cible |
| Palier 2 atteint | 8 min 56 s (536,25 s) | 8 min 58 s | −0,3 % | dans la cible |
| Palier 3 atteint | 14 min 38 s (878,5 s) | 14 min 42 s | −0,4 % | dans la cible |
| Palier 4 atteint | 21 min 35 s (1 295,25 s) | 21 min 41 s | −0,4 % | dans la cible |
| Palier 5 atteint | 29 min 1 s (1 741,5 s) | 29 min 11 s | −0,5 % | dans la cible |
| Plus long écart entre deux achats d'un même palier | 30 s (30,75 s), de 1 147,25 s à 1 178 s, au palier 3 | plafond 31 s | −0,8 % | sous le plafond |

## 2. Les paliers

Une ligne par palier joué. « Écart max » : le plus long écart entre deux achats dans le palier. « Attente du seuil » : du dernier achat du palier au refroidissement suivant ; le joueur ne peut plus rien acheter, il regarde la jauge monter.

| Palier | Température | Atteint à | Durée du palier | Machines | Écart max entre deux achats | Attente du seuil |
|---|---|---|---|---|---|---|
| 0 | 300 K, ambiante | 0 s | 3 min 42 s (222,75 s) | 4 | 19,25 s, de 49,75 s à 69 s | 25 s |
| 1 | 194,65 K, glace carbonique | 3 min 42 s (222,75 s) | 5 min 13 s (313,5 s) | 5 | 12,75 s, de 322 s à 334,75 s | 10 s |
| 2 | 77,36 K, azote liquide | 8 min 56 s (536,25 s) | 5 min 42 s (342,25 s) | 6 | 10,5 s, de 684,5 s à 695 s | 66 s |
| 3 | 27,1 K, néon liquide | 14 min 38 s (878,5 s) | 6 min 56 s (416,75 s) | 7 | 30,75 s, de 1 147,25 s à 1 178 s | 20,75 s |
| 4 | 20,28 K, hydrogène liquide | 21 min 35 s (1 295,25 s) | 7 min 26 s (446,25 s) | 8 | 14,25 s, de 1 494 s à 1 508,25 s | 15,75 s |
| 5 | 4,22 K, hélium liquide | 29 min 1 s (1 741,5 s) | 8 min 32 s (512,75 s) | 8 | 16,25 s, de 2 071 s à 2 087,25 s | 7 s |
| 6 | 1,5 K, hélium pompé | 37 min 34 s (2 254,25 s) | — | 8 | — | — |

La partie s'arrête au palier 6, à 37 min 34 s (2 254,25 s) : ce palier n'a encore ni durée, ni attente.

## 3. La montée du premier palier

Le temps de jeu pour atteindre chaque puissance de dix, jusqu'au seuil du palier 1 (1,00e9 J). Plus haut, l'énergie repart de 10 J à chaque palier : une décade n'y voudrait plus rien dire.

| Énergie | Atteinte à |
|---|---|
| 10¹ J | 10 s |
| 10² J | 33 s (33,5 s) |
| 10³ J | 54 s (54,2 s) |
| 10⁴ J | 1 min 9 s (69 s) |
| 10⁵ J | 1 min 54 s (114,35 s) |
| 10⁶ J | 2 min 8 s (128,3 s) |
| 10⁷ J | 3 min 0 s (180,7 s) |
| 10⁸ J | 3 min 22 s (202,35 s) |
| 10⁹ J | 3 min 42 s (222,75 s) |

## 4. Les premiers achats

Quand chaque machine est achetée pour la première fois.

| Machine | Premier achat |
|---|---|
| Dynamo | 0 s |
| Alternateur | 33 s (33,5 s) |
| Turbine | 1 min 9 s (69 s) |
| Centrale | 2 min 8 s (128,5 s) |
| Réseau | 5 min 34 s (334,75 s) |
| Cyclotron | 10 min 43 s (643,5 s) |
| Synchrotron | 16 min 19 s (979,75 s) |
| Collisionneur | 23 min 12 s (1 392 s) |

## 5. Le hors ligne

Quand tu reviens, le jeu calcule en une fois ce que tes machines ont produit pendant ton absence. On compare à ce qu'elles auraient produit si l'appli était restée ouverte sans toi. Aucun achat pendant l'absence, des deux côtés.

| Moment de la partie | Absence | Gain rendu au retour | Gain appli ouverte | Écart |
|---|---|---|---|---|
| 1,00e9 J, à 222,75 s, palier 0, 4 machines en marche | 1 h 0 min | 9,58e15 J | 9,64e15 J | −0,6 % |
| 1,00e9 J, à 222,75 s, palier 0, 4 machines en marche | 8 h 0 min | 3,68e19 J | 3,70e19 J | −0,6 % |
| 1,00e9 J, à 222,75 s, palier 0, 4 machines en marche | 1 j 0 h | 2,96e21 J | 2,98e21 J | −0,6 % |
| 1,00e15 J, à 536,15 s, palier 1, 5 machines en marche | 1 h 0 min | 6,69e22 J | 6,75e22 J | −0,9 % |
| 1,00e15 J, à 536,15 s, palier 1, 5 machines en marche | 8 h 0 min | 1,77e27 J | 1,79e27 J | −1,0 % |
| 1,00e15 J, à 536,15 s, palier 1, 5 machines en marche | 1 j 0 h | 4,21e29 J | 4,25e29 J | −1,0 % |
| 1,00e30 J, à 1 295,1 s, palier 3, 7 machines en marche | 1 h 0 min | 4,84e38 J | 4,93e38 J | −1,8 % |
| 1,00e30 J, à 1 295,1 s, palier 3, 7 machines en marche | 8 h 0 min | 6,19e44 J | 6,32e44 J | −2,0 % |
| 1,00e30 J, à 1 295,1 s, palier 3, 7 machines en marche | 1 j 0 h | 1,29e48 J | 1,32e48 J | −2,1 % |
| 1,00e44 J, à 2 254,15 s, palier 5, 8 machines en marche | 1 h 0 min | 1,03e54 J | 1,05e54 J | −2,3 % |
| 1,00e44 J, à 2 254,15 s, palier 5, 8 machines en marche | 8 h 0 min | 9,87e60 J | 1,01e61 J | −2,7 % |
| 1,00e44 J, à 2 254,15 s, palier 5, 8 machines en marche | 1 j 0 h | 6,11e64 J | 6,28e64 J | −2,7 % |

Quand tu reviens, le jeu te rend 0,6 à 2,7 % de moins que s'il était resté ouvert.
L'écart change un peu avec la durée de l'absence : 0,4 point au plus d'une absence à l'autre.
Il grandit avec le nombre de machines en marche (4, 5, 7 puis 8).
Pas de verdict : la cible n'est pas encore chiffrée.

## 6. Pas encore mesurable

Ces repères du plan demandent une mécanique que le jeu n'a pas encore.

| Repère | Cible | Source | Mesurable avec |
|---|---|---|---|
| Palier 6 atteint | ~35 min 36 s | simulation du 23/09 | SUPRA (lot 5) |
| Premier matériau (NbTi) | 35,6 min | plan v1 §6.2 | SUPRA |
| Un nouveau matériau toutes les… | 34 à 52 min | plan §6.5 | SUPRA |
| Le Graal | ~5 h (301,4 min) | plan §6.5 | SUPRA |
| Couche 1 entière | ~5 h | plan §4.1 | SUPRA |

Palier 6 atteint : 37 min 34 s (2 254,25 s) (§ 2), sans verdict : sa cible supposait le ×10 de la supraconductivité, qui n'existe pas encore.
```

### 5.2 Attendu / obtenu (§6.5 du brief)

Les valeurs obtenues ont été relevées par un script jetable qui appelle
`jouer` et `mesurerHorsLigne`, comme `mesurer`, puis comparées une à une.

Dans le tableau du brief, une ligne N porte le palier N − 1 (« la ligne 4
porte le palier 3 »). `MESURE.md` range autrement : une ligne par palier
**joué** (§6.2). Ci-dessous, la correspondance est faite ligne à ligne.

| Ligne du brief | Atteint à (ms), attendu → obtenu | Durée du palier joué | Écart max | Attente du seuil |
|---|---|---|---|---|
| 1 (palier 0 joué) | 222 750 → **222 750** | 222,75 s → **222,75 s** | 19,25 s (49,75–69) → **19,25 s (49,75–69)** | 25 s → **25 s** |
| 2 (palier 1) | 536 250 → **536 250** | 313,5 s → **313,5 s** | 12,75 s → **12,75 s** (322–334,75) | 10 s → **10 s** |
| 3 (palier 2) | 878 500 → **878 500** | 342,25 s → **342,25 s** | 10,5 s → **10,5 s** (684,5–695) | 66 s (812,5–878,5) → **66 s (812,5–878,5)** |
| 4 (palier 3) | 1 295 250 → **1 295 250** | 416,75 s → **416,75 s** | 30,75 s (1 147,25–1 178) → **30,75 s (1 147,25–1 178)** | 20,75 s → **20,75 s** |
| 5 (palier 4) | 1 741 500 → **1 741 500** | 446,25 s → **446,25 s** | 14,25 s → **14,25 s** (1 494–1 508,25) | 15,75 s → **15,75 s** |
| 6 (palier 5) | 2 254 250 → **2 254 250** | 512,75 s → **512,75 s** | 16,25 s → **16,25 s** (2 071–2 087,25) | 7 s → **7 s** |

| Mesure | Attendu | Obtenu |
|---|---|---|
| Écarts au plan, paliers 1 à 5 | −0,3 · −0,3 · −0,4 · −0,4 · −0,6 % | −0,3 · −0,3 · −0,4 · −0,4 · **−0,5 %** (voir §7, point 1) |
| Plus long écart entre deux achats | 30,75 s, sous le plafond de 31 s | **30,75 s**, de 1 147,25 à 1 178 s, au palier 3 |
| Premiers achats (s) | Dynamo 0 · Alternateur 33,5 · Turbine 69 · Centrale 128,5 · Réseau 334,75 · Cyclotron 643,5 · Synchrotron 979,75 · Collisionneur 1 392 | identiques, les huit |
| Décades 10¹ … 10⁹ J (s) | 10 · 33,5 · 54,2 · 69 · 114,35 · 128,3 · 180,7 · 202,35 · 222,75 | identiques, les neuf |

| Hors ligne, rattrapé / pas-à-pas | Attendu 1 h · 8 h · 24 h | Obtenu 1 h · 8 h · 24 h |
|---|---|---|
| 1e9 J (222,75 s, palier 0, 4 machines) | 0,99431 · 0,99405 · 0,99402 | 0,99431 · 0,99405 · 0,99402 |
| 1e15 J (536,15 s, palier 1, 5 machines) | 0,99108 · 0,99018 · 0,99008 | 0,99108 · 0,99018 · 0,99008 |
| 1e30 J (1 295,1 s, palier 3, 7 machines) | 0,98249 · 0,97964 · 0,97933 | 0,98249 · 0,97964 · 0,97933 |
| 1e44 J (2 254,15 s, palier 5, 8 machines) | 0,97657 · 0,97295 · 0,97253 | 0,97657 · 0,97295 · 0,97253 |

**Tout tombe juste**, aux instants et aux machines près. Soit −0,6 %, −1,0 %,
−2,1 % et −2,7 % à 24 h : la loi k(k − 1)/(2N) des lots précédents, qui donne
2,8 % pour 8 machines.

### 5.3 Ce que dit désormais la phrase sur la durée de l'absence

Elle disait « L'écart ne change pas avec la durée de l'absence ». Elle dit
maintenant :

> L'écart change un peu avec la durée de l'absence : 0,4 point au plus d'une
> absence à l'autre.

**Son seuil, vérifié** : la phrase se calcule sur les pour-milles **arrondis**
du tableau, moment par moment. Avant ce lot, « ne change pas » voulait dire
« les trois pour-milles sont égaux », et tout autre cas donnait « change »,
sans nuance. D'une absence à l'autre, l'écart bouge de 0 pour-mille avec 4
machines, 1 avec 5, 3 avec 7 et 4 avec 8 : l'ancienne règle aurait dit
« change », sans dire de combien. Désormais :

- **0** pour-mille partout : « ne change pas » ;
- **10 pour-mille au plus** (un point de pourcentage) : « change un peu », avec
  la variation ;
- au-delà : « change », avec la variation.

Le seuil d'un point est un choix d'écriture, pas une cible. Et la phrase qui
suit, « Il grandit avec le nombre de machines en marche (4, 5, 7 puis 8) »,
est maintenant **vérifiée sur les chiffres** (plus de machines ET une perte
plus grande, à chaque durée d'absence) ; avant ce lot, elle s'écrivait dès
que l'écart était stable, sans le vérifier.

---

## 6. Les écarts déclarés

### 6.1 Les trois que le brief annonce

1. **Le bloc froid arrive avec la première Turbine** (1 min 9 s pour le
   joueur automatique), et non à 1 % du seuil comme l'esquissait la v1 du
   plan. Une condition sur l'énergie ferait clignoter le bloc : l'énergie
   redescend à chaque achat, et retombe à 10 J à chaque palier. La condition
   lit `decouvertes`, qui ne redescend jamais. Le plan (§11.4) veut la ligne
   « Objectif » **toujours** visible : elle l'est dès la Turbine, pas avant.
2. **Le palier 1 se lit au refroidissement**, et non plus à la décade 10⁹ J.
   Pour le joueur automatique, les deux tombent au même instant (222,75 s) :
   il refroidit à la décision qui suit le pas où il atteint le seuil.
3. **« 27,1 K »**, et non « 27,10 K » : les températures passent par
   `formater`, qui ne garde que les décimales utiles.

### 6.2 Les autres choix de ce lot, à connaître

- **Le « ×2 » de l'aperçu est le gain du palier** (`MULTIPLICATEUR_PALIER`,
  lu dans `src/data/froid.js`), comme l'explication « ×2 par palier ».
  `apercuRefroidir` rend aussi, comme le brief le demande, le multiplicateur
  **après** (×4 pour le palier 2) ; aucun texte ne l'affiche aujourd'hui. Les
  textes du brief disent « ×2 » pour le Cyclotron, c'est-à-dire le gain, pas
  le total.
- **`src/ui/froid.js` lit aussi `src/data/machines.js`**, pour le nom de la
  machine neuve : les noms ne vivent que là.
- **L'aperçu se voit dès que le bloc paraît**, pas seulement quand le bouton
  s'allume : il est dans `#froid-suivant`, sans dévoilement à lui (P5 : un
  aperçu avant chaque choix).
- **La jauge tombe au demi-pourcent inférieur**, au lieu d'être arrondie au
  plus proche : comme `formater`, elle n'affiche jamais plus que ce que le
  joueur a, et elle n'est pleine **qu'au seuil**, quand le bouton s'allume.
  Arrondie au plus proche, elle aurait montré 100 % un peu avant le seuil,
  bouton encore grisé.
- **Un bouton principal grisé** a maintenant sa règle CSS
  (`.bouton-principal:disabled`) : sans elle, le texte gris restait sur le
  fond orange. « Sauvegarder maintenant », l'autre bouton principal, n'est
  jamais grisé : rien ne change pour lui.
- **Une espace insécable** (U+00A0) entre un nombre et son unité, et devant
  « : » dans les textes du bloc : jamais de « K » ni de « : » seul en début
  de ligne.
- **La condition de `froid-suivant`** s'écrit `seuilSuivant(etat) !== null`,
  qui est exactement `froid.palier < 6` sans écrire le 6.
- **`MESURE.md` change de forme** :
  - **les paliers** : une ligne par palier **joué**, de 0 à 6, chaque ligne
    parlant du même palier (sa température, son arrivée, sa durée, ses
    machines, ses écarts, son attente). Le tableau de contrôle du brief range
    autrement (la ligne N porte le palier N − 1) ; le §5.2 fait la
    correspondance ;
  - **les premiers achats** perdent « Achetées » et « Possédées à la fin » :
    après six remises à zéro, « à la fin » ne veut plus rien dire ;
  - **le hors ligne** dit le palier de chaque moment ;
  - **la ligne du plus long écart** dit son palier ;
  - **l'en-tête** dit toutes les conditions d'arrêt (« au palier 6 (1,5 K) ou
    après 2 h 0 min de jeu »), et `jusqua` devient facultatif ;
  - un repère non atteint est « hors cible » seulement si la partie a joué
    toute sa durée bien au-delà de la cible, sinon « non mesuré ».
- **`npm run voir`** va un peu plus loin que le brief : F1 vérifie aussi le
  texte du bouton et l'absence d'explication, F3 l'objectif suivant et que
  rien n'a disparu, F4 l'aperçu à chaque cran et **le pire cas de la mise en
  page** (10⁴⁰⁰ J, palier 6, huit cartes, §5.3 du brief), F6 le palier migré.
  Deux captures de plus : `froid-debut.png` et `palier6-huit.png`.

### 6.3 La relecture hostile, avant la PR

- **Qui d'autre écrit `froid.palier` et `decouvertes.paliers` ?** Trois
  écrivains, et pas un de plus (vérifié par recherche) : `etatInitial` (0 et
  0), `migrations[2]` (0 et 0) et `refroidir` (+1, et le plus grand des
  deux). L'import et la nouvelle partie remplacent l'état entier, validé par
  `defautDeForme`. Le mode test ne touche à aucun des deux : il n'écrit que
  l'énergie et sa marque, et ses sauts passent par `rattraper`.
- **`refroidir` remet-elle tout ce qui doit l'être, et rien d'autre ?** Elle
  remet l'énergie à 10 J et chaque machine à zéro, quantité **et** achats
  (`FROID T2`, point 2 ; la falsification T2a le prouve). Elle laisse
  `decouvertes.machines` (point 2 aussi), et ne touche ni au temps, ni à
  `meta`, ni au mode d'achat : son code ne les nomme pas.
- **Un palier peut-il être franchi sans que le joueur appuie ?** Non.
  `refroidir` n'est appelée que par le bouton (`src/ui/froid.js`) et par la
  stratégie `froid` du joueur automatique ; ni `avancer`, ni `produire`, ni
  `rattraper`. Vérifié aussi sous Node : une partie au palier 1, une semaine
  rattrapée en 1000 pas, finit à 4,4e32 J, **toujours au palier 1**, avec
  `peutRefroidir` vrai : le bouton s'allumera au retour.
- **Une carte, une ligne ou un bouton déjà vu peut-il disparaître après un
  palier ?** Non : toutes les conditions lisent `decouvertes`, qui ne descend
  jamais, et `machinesDebloquees` ne fait que monter dans ce lot (le palier ne
  redescend pas). F3 le vérifie à l'écran (production, commandes, bloc,
  cartes 1 à 5), F4 au palier 6, F5 après rechargement. Seuls le bouton et la
  jauge partent au palier 6 : c'est voulu, il n'y a plus de palier.
- **L'état est-il atteignable ?** `decouvertes.paliers > froid.palier` ne
  l'est pas encore en jeu : il le deviendra avec le quench du lot SUPRA.
  `defautDeForme` l'accepte déjà, et `FROID T1` (point 2) le fait voyager.

**Corrigé avant la PR** :

- **L'espace des textes du bloc** était une espace ordinaire, pas U+00A0 :
  corrigé avant le premier `npm run voir`.
- **Le pire cas de F4 ne testait pas ce qu'il disait.** À 10⁴⁰⁰ J **pile**,
  « Tout acheter » au palier 6 dépense tout en Collisionneurs et laisse 0 J :
  le 26ᵉ lot coûte exactement 1e400 J, et les ~1e385 J déjà dépensés se
  perdent dans les 14 à 15 chiffres d'une addition de `Decimal`
  (`1e400 − 1e385` rend `1e400`). La capture montrait donc « 0 J » et des
  cartes vides : juste, mais ce n'était pas le pire cas. L'étape fait
  maintenant passer un jour de cascade puis remet 10⁴⁰⁰ J. Ce comportement de
  « Tout acheter » est celui du lot MACHINES (la plus chère d'abord) ; il ne
  se voit qu'à un nombre rond tombé pile sur un prix, en mode test. Pas
  corrigé ici.

---

## 7. Ce qui contredit ce brief

1. **Palier 5 : −0,5 %, pas −0,6 %.** 1 741,5 s pour une cible de 1 751 s
   (29 min 11 s), c'est −0,54 %, qui s'arrondit à −0,5 %. Le temps lui-même
   est exactement celui du brief (1 741 500 ms) ; seul l'arrondi du brief
   diffère.
2. **`FROID T1` lit `SAVE_VERSION`** là où le brief écrit
   `saveVersion === 3`. C'est la règle que le brief pose lui-même (§4) :
   aucun test n'écrit en dur un numéro de version qu'il n'a pas construit.
   Aujourd'hui les deux sont égaux ; au lot SUPRA, `FROID T1` n'aura pas à
   être réancré. Il reste falsifiable, et c'est vérifié : `SAVE_VERSION`
   laissé à 2, la v2 n'est pas migrée et le test tombe au point 1 (« 1.
   l'état est incomplet : « froid.palier » manque… »).
3. **T2a tombe au point 2, une assertion plus tôt** que le prix et le ×16 que
   cite le brief : « les 8 machines à 0 achat » est vérifié avant. Le prix
   (1e10) et le ×16 annoncés sont bien ceux qu'on obtient, relevés par un
   script jetable sous la même falsification.
4. **Le tableau des paliers de `MESURE.md`** n'a pas la forme du tableau de
   contrôle du brief (§6.2 et §5.2) : une ligne par palier joué.
5. **La mesure dure 20 s ici**, pas 25 s ; toujours sous la minute.

---

## 8. À tester sur ton téléphone, en 10 minutes

**Après la fusion**, attends que l'action « Pages » soit verte (onglet
Actions, une minute environ). Options doit afficher **0.3.0 · build 3** ;
sinon, relance l'appli.

1. **Ta partie du 28/09 s'ouvre, avec tes machines.** Elle est migrée en v3 ;
   l'ancienne est gardée à côté, telle quelle. Si tu avais déjà acheté une
   Turbine, le bloc froid est déjà là.
2. **Mode test → Nouvelle partie.** Achète jusqu'à la première Turbine : le
   bloc froid apparaît. Est-ce clair, sans explication ?
3. **Mode test, énergie `1e9`** : le bouton s'allume. Lis l'aperçu, puis
   refroidis. Comprends-tu ce qui s'est passé ?
4. **Rachète tes machines** : sens-tu le ×2 ?
5. **Continue au moins jusqu'au palier 2 sans le mode test** (une dizaine de
   minutes). Le rythme te va ?
6. **Mode test : énergie au seuil, puis Refroidir, jusqu'à 1,5 K.** La fin
   est-elle claire ?
7. **Quitte 5 minutes au milieu d'un palier, puis reviens** : le bandeau
   s'affiche, et le bouton s'allume si le seuil est passé.

Tes retours vont dans `RETOURS.md`.
