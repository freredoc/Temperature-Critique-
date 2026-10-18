# BRIEF — lot FROID

Quatrième lot de **Température Critique**. Il donne au jeu son verbe :
**refroidir**. Six paliers de froid, de 300 K à 1,5 K. Chaque palier coûte un
seuil d'énergie et remet la partie à 10 J sans machines. En échange, toutes
les machines produisent deux fois plus, et une machine de plus se débloque.
Les machines 5 à 8 arrivent ainsi, une par palier.

Le joueur automatique apprend à refroidir. Les paliers 1 à 5 du plan
deviennent **mesurables**, face aux temps de la simulation du 23/09.

Ce brief applique le plan `claude/DESIGN-TEMPERATURE-CRITIQUE.md` v5 (§6.1,
§6.2, §11.4 et §16.2, lot 4). Tout ce qu'il faut en est recopié ici.

---

## MODÈLE ET EFFORT

**Opus 5, effort extra**, le plancher du projet :

- `SAVE_VERSION` bouge (2 → 3), et la partie d'Ethan en version 2 est sur
  son téléphone depuis le 28/09 ;
- la règle du palier (§3) est celle que l'équilibrage de la couche 1
  mesurera.

Fable 5 : **peu pertinent**.

---

## 0. Geste zéro

1. Lire `CLAUDE.md` en entier, puis `rapports/RAPPORT-lotJOUEUR-AUTO.md`.
   `PASSATION-2026-09-27.md` (racine) est périmé : `CLAUDE.md` et les rapports
   font foi.
2. **Lister** la racine, `src/` et ses sous-dossiers, `tools/`, `test/` et
   `mesures/`.
3. `npm ci && npm run check`, puis consigner la sortie. Référence, d'après
   `CLAUDE.md` du 02/10 :
   - version · build : **0.2.0 · build 2** ;
   - `SAVE_VERSION` : **2** ;
   - **6 tests** ;
   - la garde lit **12 fichiers** ;
   - `dist/index.html` : **189 877 octets**.

   Une base rouge, on s'arrête et on le dit.
4. `npm run voir` : **22 étapes** (`TC_CHROMIUM=<chemin>` au besoin).
   `npm run mesure` : `mesures/MESURE.md` doit ressortir **identique** à celui
   du dépôt. Consigner.
5. Créer la branche **`claude/froid-paliers`**.
6. Copier ce brief tel quel dans `rapports/BRIEF-lotFROID.md`.

---

## 1. Ce que tu verras (pour Ethan)

- **Au bout d'une minute environ**, quand tu achètes ta première Turbine, un
  bloc apparaît sous l'énergie :
  - « **300 K · ambiante** » ;
  - l'objectif : « Prochain palier : 194,65 K, glace carbonique. Il faut
    1,00e9 J. » ;
  - une jauge qui se remplit à mesure que l'énergie monte ;
  - un bouton « **Refroidir à 194,65 K** », grisé.
- **À 1,00e9 J**, le bouton s'allume. Dessous, ce que tu gagnes et ce que tu
  perds : « Tu repars de 10 J, sans machines. En échange : toutes les machines
  ×2, et une nouvelle machine : Réseau. »
- **Tu touches le bouton** :
  - l'énergie retombe à 10 J et tes machines à zéro ;
  - le bloc affiche « 194,65 K · glace carbonique » ;
  - toutes les machines produisent **×2** ;
  - la carte **Réseau** apparaît, marquée NOUVEAU.
- **Les cartes déjà vues restent là**, à zéro : tu les rachètes vite, elles
  produisent deux fois plus.
- **Six paliers** : 194,65 K (glace carbonique), 77,36 K (azote liquide),
  27,1 K (néon liquide), 20,28 K (hydrogène liquide), 4,22 K (hélium liquide)
  et 1,5 K (hélium pompé).
- **Une machine de plus à chaque palier, jusqu'à la 8ᵉ** :
  - Réseau au palier 1 ;
  - **Cyclotron** au palier 2 ;
  - **Synchrotron** au palier 3 ;
  - Collisionneur au palier 4.
- **À 1,5 K**, le jeu dit que la suite viendra avec la supraconductivité :
  c'est le lot SUPRA.
- **Temps attendus**, d'après le joueur automatique qui achète tout dès qu'il
  peut : palier 1 en 3 min 42 s, palier 5 en 29 min, palier 6 en 37 min 34 s.
  Un vrai joueur, qui ne touche pas quatre fois par seconde, ira un peu moins
  vite.

---

## 2. Les données — `src/data/froid.js`, fichier neuf

```js
// Les paliers de froid (plan §6.2). Les températures sont celles des vrais
// fluides : sublimation du CO₂, ébullition de l'azote, du néon, de
// l'hydrogène et de l'hélium à pression ambiante, hélium pompé.
// `seuil` : l'énergie qu'il faut pour descendre À ce palier.
export const PALIERS = [
  { palier: 0, technique: "Ambiante",          kelvins: 300 },
  { palier: 1, technique: "Glace carbonique",  kelvins: 194.65, seuil: "1e9"  },
  { palier: 2, technique: "Azote liquide",     kelvins: 77.36,  seuil: "1e15" },
  { palier: 3, technique: "Néon liquide",      kelvins: 27.1,   seuil: "1e22" },
  { palier: 4, technique: "Hydrogène liquide", kelvins: 20.28,  seuil: "1e30" },
  { palier: 5, technique: "Hélium liquide",    kelvins: 4.22,   seuil: "1e39" },
  { palier: 6, technique: "Hélium pompé",      kelvins: 1.5,    seuil: "1e44" },
];
export const MULTIPLICATEUR_PALIER = 2;   // toutes les machines, cumulatif
export const ENERGIE_APRES_PALIER = "10";
```

- Les **seuils** sont des chaînes, comme les coûts des machines : ils ne
  deviennent des `Decimal` qu'une fois, dans `src/sim/froid.js`.
- Les **températures** sont des `Number`. Ce sont des constantes affichées et
  comparées, pas des ressources qui grandissent. L'affichage passe par
  `formater`, donc « 27,1 K » et non « 27,10 K » : c'est accepté.

**Les noms 6 et 7 sont tranchés** (Ethan, 02/10) : **Cyclotron** et
**Synchrotron**. Dans `src/data/machines.js`, le commentaire « Les noms 6 et 7
sont une proposition, en attente d'Ethan » devient « Les noms 6 et 7 sont
tranchés par Ethan le 02/10 ». Rien d'autre ne change dans ce fichier.

---

## 3. La règle — `src/sim/froid.js`, fichier neuf

### 3.1 Les fonctions

- **`seuilSuivant(etat)`** : le seuil du palier `palier + 1` (un `Decimal`),
  ou `null` au palier 6.
- **`peutRefroidir(etat)`** : `seuilSuivant` non nul, et
  `energie.gte(seuilSuivant)`. **Égal suffit.**
- **`refroidir(etat)`**. Si `peutRefroidir` est faux, elle rend `false` et ne
  touche à rien. Sinon, dans cet ordre :
  1. `froid.palier` + 1 ;
  2. énergie = `ENERGIE_APRES_PALIER` ;
  3. **chaque machine** : `quantite` = 0 **et `achetees` = 0** (le prix et le
     ×2 par lot repartent du début) ;
  4. `decouvertes.paliers = max(decouvertes.paliers, froid.palier)`.

  Elle rend `true`. `decouvertes.machines` **ne bouge pas**.
- **`apercuRefroidir(etat)`** : ce que le prochain palier apporte, pour
  l'écran (P5 : un aperçu avant chaque choix). Rend `null` au palier 6, sinon :
  - `palier`, `kelvins` et `technique` du palier suivant ;
  - le multiplicateur de palier **après** ;
  - le numéro de la machine nouvellement débloquée, ou `null` quand on va
    aux paliers 5 et 6.

  Elle **ne recalcule rien** : elle appelle les deux fonctions « au palier »
  de `machines.js` (§3.2) avec `palier + 1`.

### 3.2 Ce qui change dans `src/sim/machines.js`

Deux fonctions neuves, qui ne lisent qu'un numéro de palier :

- **`machinesDebloqueesAuPalier(p)`** = `min(8, MACHINES_AU_DEPART + p)`.
  Soit 4, 5, 6, 7, 8, 8, 8 du palier 0 au palier 6.
- **`multiplicateurDePalier(p)`** = `MULTIPLICATEUR_PALIER ^ p`, un `Decimal`.

Et deux fonctions existantes qui s'en servent :

- **`machinesDebloquees(etat)`** = `machinesDebloqueesAuPalier(froid.palier)`.
- **`multiplicateur(etat, n)`** = `2 ^ floor(achetees / 10)` ×
  `multiplicateurDePalier(froid.palier)`. C'est **le seul endroit** où les
  multiplicateurs se composent (`CLAUDE.md`). Le lot SUPRA y ajoutera le sien.

⚠ **LES IMPORTS VONT DANS UN SEUL SENS : `froid.js` → `machines.js`**, jamais
l'inverse. `machines.js` lit `etat.froid.palier` et `src/data/froid.js`, sans
importer `src/sim/froid.js`. Ainsi :
- la règle « une machine de plus par palier » n'existe qu'à un endroit ;
- l'aperçu la réutilise au lieu de la recopier ;
- `refroidir` remet les machines à zéro en écrivant directement dans
  `etat.machines`.

⚠ **AUCUN PALIER NE PASSE PAR `avancer`.** Refroidir est un geste du joueur
(plan §6.2 : « c'est le joueur qui appuie »). Le Régulateur, qui refroidira
tout seul, arrive au lot SUPRA. Le rattrapage hors ligne ne refroidit donc
jamais : l'énergie s'accumule au-delà du seuil, et le joueur refroidit en
revenant.

---

## 4. L'état — `SAVE_VERSION` 2 → 3

`etatInitial` gagne :

```js
froid: { palier: 0 },
decouvertes: { machines: 0, paliers: 0 },   // `paliers` est neuf
```

- **`decouvertes.paliers`** est le plus haut palier jamais atteint. Il ne
  redescend jamais. Le lot SUPRA remettra `froid.palier` à 0 à chaque quench,
  mais ce qui a été vu ne doit pas disparaître.
- **`migrations[2]`** ajoute `froid: { palier: 0 }` et
  `decouvertes.paliers = 0`, **sans toucher à rien d'autre**. Comme
  `migrations[1]`, elle écrit la forme de son époque en toutes lettres.
- **`defautDeForme`** vérifie en plus :
  - `froid.palier` : un entier de 0 à 6 ;
  - `decouvertes.paliers` : un entier de 0 à 6, et **≥ `froid.palier`**.

  Un code refusé **nomme le champ fautif**.

⚠ **LA PARTIE D'ETHAN EST EN VERSION 2**, sur son téléphone, depuis le
28/09. Elle doit s'ouvrir migrée, avec sa copie d'avant migration (le
mécanisme du lot MACHINES s'applique tel quel, clé
`temperature-critique:sauvegarde-v2:…`).

⚠ **DEUX ANCRES À RÉANCRER, PAS À ASSOUPLIR** :

- **`MACHINES T1`** attend `saveVersion === 2` après la migration d'une v1.
  Une v1 devient désormais une v3 : l'assertion lit `SAVE_VERSION`. Le reste
  du test ne change pas.
- **L'étape M8 de `npm run voir`** attend `saveVersion` 2 après sauvegarde :
  elle lit `SAVE_VERSION`, importé de `src/sim/sauvegarde.js`. Son titre dit
  « réécrite dans la version courante ».

`SOCLE T1` lit déjà `SAVE_VERSION + 1` et ne bouge pas. **Règle pour
`CLAUDE.md`** : aucun test ne doit écrire en dur un numéro de version qu'il
n'a pas construit lui-même.

---

## 5. L'écran

### 5.1 Le bloc froid

Dans `src/index.html`, **entre `.tete` et `#aide-debut`** :

```html
<section id="froid" class="froid" data-devoile="froid" aria-label="Froid" hidden>
  <p class="froid-temperature">…</p>             <!-- « 300 K · ambiante » -->
  <p id="froid-explication" data-devoile="froid-explication" hidden>…</p>
  <p id="objectif" class="objectif">…</p>
  <div id="froid-suivant" data-devoile="froid-suivant" hidden>
    <div class="jauge" role="progressbar" aria-label="Vers le prochain palier"
         aria-valuemin="0" aria-valuemax="100"><div class="jauge-remplie"></div></div>
    <button type="button" id="refroidir" class="bouton-principal">…</button>
    <p id="apercu-refroidir" class="aide">…</p>
  </div>
</section>
```

`src/ui/froid.js`, fichier neuf, écrit les textes et branche le bouton. Il
lit `src/sim/froid.js`, `src/sim/machines.js` (`multiplicateurDePalier`) et
`src/data/froid.js`, et **ne calcule aucune règle**. Comme les cartes, **il n'écrit un texte que s'il a changé**.

**Les textes :**

| Élément | Texte |
|---|---|
| température | « 300 K · ambiante » : `formater(kelvins)`, « K », puis la technique en minuscules |
| explication (dès le palier 1) | « Plus il fait froid, moins le cuivre résiste : toutes les machines ×2 par palier. Ici : ×4. » (le multiplicateur de palier courant) |
| objectif, seuil pas atteint | « Prochain palier : 77,36 K, azote liquide. Il faut 1,00e15 J. » |
| objectif, seuil atteint | « Tu peux refroidir à 77,36 K. » |
| objectif, palier 6 | « 1,5 K : le plus froid pour l'instant. La suite viendra avec la supraconductivité. » |
| bouton | « Refroidir à 77,36 K », `disabled` tant que `peutRefroidir` est faux |
| aperçu, avec machine neuve | « Tu repars de 10 J, sans machines. En échange : toutes les machines ×2, et une nouvelle machine : Cyclotron. » |
| aperçu, sans machine neuve (paliers 5 et 6) | « Tu repars de 10 J, sans machines. En échange : toutes les machines ×2. » |

**La jauge** se remplit en échelle logarithmique, de 10 J au seuil :
- part = `log10(énergie / 10) / log10(seuil / 10)`, bornée entre 0 et 1 ;
- `log10()` de `Decimal` rend un `Number` : c'est permis, ce n'est pas
  `Number(decimal)` ;
- largeur en %, arrondie au demi-pourcent, écrite seulement si elle change,
  avec `aria-valuenow` ;
- remplissage `cyan-graphe`, fond `surface-2`, bord `trait`.

Une jauge linéaire resterait à 0 % pendant presque tout le palier.

**Pas de confirmation en deux temps** : le bouton ne s'allume qu'au seuil, et
l'aperçu dit ce qu'on perd. C'est le geste répété de la couche ; deux touchers
à chaque fois seraient une longueur.

### 5.2 Le dévoilement — `src/data/devoilement.js`

| id | condition |
|---|---|
| `froid` | `decouvertes.machines >= 3 \|\| decouvertes.paliers >= 1` |
| `froid-explication` | `decouvertes.paliers >= 1` |
| `froid-suivant` | `froid.palier < 6` |

- **Le bloc arrive avec la première Turbine** (~1 min 9 s), et non à 1 % du
  seuil comme l'esquissait la v1 du plan. Une condition sur l'énergie
  ferait clignoter le bloc : l'énergie redescend à chaque achat. Celle-ci
  lit `decouvertes`, qui ne redescend jamais. **Écart au plan à déclarer.**
- **Les cartes 5 à 8 n'ont rien à faire** : leur condition existante
  (`n <= machinesDebloquees(etat) && decouvertes.machines >= n − 1`) les
  ouvre d'elle-même quand `machinesDebloquees` grandit.
- ⚠ **RIEN DE CE QUI A ÉTÉ VU NE DISPARAÎT APRÈS UN PALIER** :
  - les cartes ;
  - la ligne de production (elle affiche « +0 J/s ») ;
  - les commandes d'achat ;
  - le bloc froid.

### 5.3 La mise en page

- Le bloc **n'est pas collé en haut** : seule `.tete` l'est.
- **Aucun débordement horizontal à 360 px**, même à 10⁴⁰⁰ J, au palier 6,
  avec huit cartes.
- **Les 16 couleurs seulement.**
- Le bouton reprend `.bouton-principal`.

---

## 6. Le joueur automatique

### 6.1 La stratégie `froid`

Dans `tools/joueur-auto/strategies.js` : à chaque décision, **d'abord
`refroidir(etat)` si possible, puis `toutAcheter(etat)`**. Elle rend les
unités achetées. Phrase pour l'en-tête : « à chaque décision, le joueur
refroidit dès que le seuil est atteint, puis achète tout ce que son énergie
paie, de la machine la plus chère à la moins chère. »

`machines` reste telle quelle : c'est elle que `JOUEUR-AUTO T1` utilise.

### 6.2 Ce que `partie.js` relève en plus

- **Les paliers** : à chaque décision, le palier avant et après `agir`.
  Chaque changement donne `{ palier, ms }`.
- **L'option `jusquaPalier`** : la partie s'arrête à la décision où ce palier
  est atteint. `jusqua` (énergie) et `dureeMaxMs` restent ; le premier atteint
  arrête la partie.
- **Les écarts, en deux mesures** (chaque achat est rangé dans le palier où
  il a lieu, après un éventuel refroidissement à la même décision) :
  - **l'écart entre deux achats d'un même palier** : le maximum, avec ses
    bornes et son palier. C'est la mesure de la simulation du 23/09, celle du
    plafond de 31 s ;
  - **l'attente du seuil** : du dernier achat d'un palier au refroidissement
    suivant, par palier.

  Dans un palier, le joueur ne peut plus rien acheter et regarde la jauge
  monter. C'est une autre chose qu'un trou entre deux achats.

### 6.3 La partie de référence (`lancer.js`)

| Option | Valeur |
|---|---|
| stratégie | **`froid`** |
| `cadenceMs` | 250 |
| `jusquaPalier` | **6** |
| `dureeMaxMs` | 2 h |
| instantanés | **1e9, 1e15, 1e30, 1e44 J**, soit juste avant les paliers 1, 2, 4 et 6, avec 4, 5, 7 puis 8 machines en marche |
| absences | 1 h, 8 h, 24 h |

### 6.4 `MESURE.md` et `cibles.js`

1. **Repères face au plan** :

   | Repère | Cible | Source |
   |---|---|---|
   | Palier 1 atteint | 223,5 s | simulation du 23/09 |
   | Palier 2 atteint | 8 min 58 s (538 s) | idem |
   | Palier 3 atteint | 14 min 42 s (882 s) | idem |
   | Palier 4 atteint | 21 min 41 s (1 301 s) | idem |
   | Palier 5 atteint | 29 min 11 s (1 751 s) | plan §6.5 |
   | Plus long écart entre deux achats d'un même palier | plafond 31 s | plan §6.5 |

   Le palier 1 se lit désormais au **refroidissement**, et non plus à la
   décade 10⁹ J.
2. **Les paliers** : un tableau, une ligne par palier :
   - température et technique ;
   - atteint à ;
   - durée du palier ;
   - machines débloquées ;
   - écart max entre deux achats ;
   - attente du seuil.
3. **La montée du premier palier** : les décades **10¹ à 10⁹ J seulement**.
   Plus haut, l'énergie repart de 10 J à chaque palier : une décade n'y
   voudrait plus rien dire.
4. **Les premiers achats** : les 8 machines.
5. **Le hors ligne** : comme au lot 3, sur les quatre instantanés.
   - ⚠ Avec 7 et 8 machines, l'écart **varie un peu avec la durée** :
     −1,8 % à 1 h, −2,1 % à 24 h. La phrase « l'écart ne change pas avec la
     durée » de `rapport.js` doit donc **dire la vérité** et basculer sur
     « change un peu ». Elle est déjà calculée sur les chiffres : vérifier son
     seuil, et le dire au rapport.
6. **Pas encore mesurable** :
   - **le palier 6**. Sa cible du plan (~35 min 36 s) supposait le ×10 de la
     supraconductivité, qui n'existe pas encore. La mesure (37 min 34 s)
     s'affiche dans le tableau des paliers, **sans verdict** ;
   - et le reste : NbTi, matériaux, Graal, couche 1.

### 6.5 Les valeurs de contrôle

Calculées le 02/10 **avec le vrai code de `main`**, sous Node, sur lequel
une version de brouillon de la règle du §3 a été greffée. Recoupées en Python
à une décision près : le flottant de Python tranche autrement quand l'énergie
tombe **pile** sur un prix. **C'est le code du jeu qui fait foi.**

| Palier | Atteint à (ms) | Durée du palier (s) | Écart max entre deux achats | Attente du seuil |
|---|---|---|---|---|
| 1 | **222 750** | 222,75 | 19,25 s (49,75–69) | 25 s |
| 2 | **536 250** | 313,5 | 12,75 s | 10 s |
| 3 | **878 500** | 342,25 | 10,5 s | **66 s** (812,5–878,5) |
| 4 | **1 295 250** | 416,75 | **30,75 s** (1 147,25–1 178) | 20,75 s |
| 5 | **1 741 500** | 446,25 | 14,25 s | 15,75 s |
| 6 | **2 254 250** | 512,75 | 16,25 s | 7 s |

- Les écarts et les attentes sont ceux **du palier qui précède** la ligne.
  Exemple : la ligne 4 porte le palier 3, de 878,5 à 1 295,25 s.
- Écarts au plan : −0,3 %, −0,3 %, −0,4 %, −0,4 %, −0,6 %. **Tout dans la
  cible.**
- Plus long écart entre deux achats : **30,75 s**, sous le plafond de 31 s.
  C'est exactement la valeur de la simulation du 23/09.

| Mesure | Valeur |
|---|---|
| Premiers achats (s) | Dynamo 0 · Alternateur 33,5 · Turbine 69 · Centrale 128,5 · Réseau 334,75 · Cyclotron 643,5 · Synchrotron 979,75 · Collisionneur 1 392 |
| Décades 10¹ … 10⁹ J (s) | celles du lot 3, inchangées : 10 · 33,5 · 54,2 · 69 · 114,35 · 128,3 · 180,7 · 202,35 · 222,75 |

| Hors ligne, rattrapé / pas-à-pas | 1 h | 8 h | 24 h |
|---|---|---|---|
| 1e9 J (222,75 s, palier 0, 4 machines) | 0,99431 | 0,99405 | 0,99402 |
| 1e15 J (536,15 s, palier 1, 5 machines) | 0,99108 | 0,99018 | 0,99008 |
| 1e30 J (1 295,1 s, palier 3, 7 machines) | 0,98249 | 0,97964 | 0,97933 |
| 1e44 J (2 254,15 s, palier 5, 8 machines) | 0,97657 | 0,97295 | 0,97253 |

Soit **−0,6 %, −1,0 %, −2,1 % et −2,7 % à 24 h**. C'est la loi
k(k − 1)/(2N) : 8 machines donnent 2,8 %.

Durée sous Node : **25 s environ**, surtout le hors ligne de 24 h avec 8
machines. Toujours sous la minute.

- ⚠ **CE NE SONT PAS DES TESTS** : c'est le contrôle de ce lot. Le rapport
  donne un tableau **attendu / obtenu**. Un écart, on trouve pourquoi avant la
  PR.

---

## 7. `npm run voir`, prolongé

Les 22 étapes restent (M8 réancrée, §4). Les **6 nouvelles** se placent avant
la dernière (« zéro erreur… ») et repartent d'un **stockage vidé**.

1. **F1. Le bloc arrive avec la Turbine.**
   - Partie neuve, mode test (7 touchers : la page a été rechargée),
     énergie 1e7 : le bloc froid est **caché**.
   - Toucher Dynamo, Alternateur, Turbine : le bloc paraît. Il affiche
     « 300 K · ambiante » et l'objectif « … Il faut 1,00e9 J. », et le bouton
     est `disabled`.
   - Toucher Centrale.
2. **F2. Énergie 1e9.**
   - Le bouton s'allume, l'objectif dit « Tu peux refroidir à 194,65 K. ».
   - L'aperçu nomme « Réseau ».
   - Aucun débordement horizontal.
   - Capture `froid.png`.
3. **F3. Toucher « Refroidir ».**
   - « 10 J », « 194,65 K · glace carbonique », « +0 J/s ».
   - Cartes visibles 1 à 5.
   - La carte Dynamo : « 0 · ×2 · lot 0/10 » et « 10 J ».
   - La carte Réseau : NOUVEAU et « 1,00e9 J ».
   - L'explication dit « Ici : ×2. ».
4. **F4. Jusqu'au palier 6.**
   - Pour chaque seuil 1e15, 1e22, 1e30, 1e39, 1e44 : énergie au seuil, puis
     Refroidir.
   - Attendu : « 1,5 K · hélium pompé », l'objectif du palier 6, le bouton et
     la jauge cachés, et l'explication « Ici : ×64. ».
   - Aucun débordement horizontal. Capture `palier6.png`.
5. **F5. « Sauvegarder maintenant », rechargement** : toujours « 1,5 K »,
   bloc visible, sans bouton.
6. **F6. La partie d'Ethan (v2).** Construire, côté Node dans `voir.js`, une
   enveloppe **v2 écrite en toutes lettres** :
   - 3 dynamos achetées, 1 alternateur, énergie 500 ;
   - `decouvertes.machines` à 2, `modeAchat` « un » ;
   - `sauveLe` à `Date.now()` ;
   - les clés dans l'ordre de `etatInitial` de MACHINES (`meta`, `temps`,
     `energie`, `machines`, `decouvertes`, `preferences`).

   La passer par `serialiser` : c'est exactement le texte qu'écrivait
   MACHINES, puisque `serialiser` n'a pas changé (« 500 » s'écrit
   `{"$d":"5e2"}`). L'écrire sous la clé de sauvegarde depuis `/atelier`,
   puis ouvrir le jeu. Attendu :
   - aucun bandeau orange ;
   - les quantités sont là ;
   - pas de bloc froid (aucune Turbine achetée) ;
   - la copie `temperature-critique:sauvegarde-v2:…` vaut ce texte au caractère
     près ;
   - après « Sauvegarder maintenant », `saveVersion` vaut `SAVE_VERSION`.

**28 étapes** en tout.

---

## 8. Les deux tests — `test/froid.test.js`

### `FROID T1` — la partie v2 s'ouvre en v3, et le palier voyage

**Montage et assertions.**

1. Une enveloppe **v2 exactement comme MACHINES l'écrit** :
   - `saveVersion: 2`, `build: 2`, `sauveLe: 2_000` ;
   - `meta: { creeLe: 1_000, modeTestUtilise: false }` ;
   - `temps: { totalMs: 90_000 }` ;
   - `energie: new Decimal("12345.678")` ;
   - 8 machines, la Dynamo à `quantite` 1 500 et `achetees` 12, l'Alternateur
     à 3 et 3, les autres à 0 ;
   - `decouvertes: { machines: 2 }`, `preferences: { modeAchat: "lot" }`.

   Elle passe par `serialiser` puis `relire`. Attendu :
   - `ok`, `saveVersion === 3`, `migreeDepuis === 2` ;
   - `froid.palier === 0`, `decouvertes.paliers === 0` ;
   - **tout le reste intact** : énergie, les deux machines, `decouvertes.machines`
     à 2, `modeAchat` à `"lot"`, `totalMs` à 90 000.
2. Un état neuf avec `froid.palier = 4` et `decouvertes.paliers = 5`, passé
   par `importer(exporter(…))` : les deux reviennent tels quels.
3. Deux refus, chacun nommant son champ :
   - `froid.palier = 7` : le message nomme `froid.palier` (vérifié **avant**
     `decouvertes.paliers`) ;
   - `froid.palier = 4` avec `decouvertes.paliers = 3` : le message nomme
     `decouvertes.paliers`.

**Falsification, à exécuter une fois puis à défaire.**

- Retirer `migrations[2]` : le point 1 tombe (« la migration 2 → 3 manque »).
- La migration écrit `palier: "0"` (une chaîne) : le point 1 tombe, par le
  refus de forme.
- Retirer le contrôle `decouvertes.paliers ≥ froid.palier` : le point 3 tombe.

### `FROID T2` — le palier suit la règle

**Montage.** `etatInitial(0)`, puis :
- Dynamo à `quantite` 123 et `achetees` 37 ;
- `decouvertes.machines = 4` ;
- énergie à `new Decimal("999999999")`.

**Assertions**, vérifiées le 02/10 sur le brouillon :

1. `refroidir` rend `false` ; rien ne bouge : palier 0, énergie `.eq` la
   valeur posée, la Dynamo à 123 et 37.
2. L'énergie passe à `1e9`, et `refroidir` rend `true`. Attendu :
   - palier 1, énergie 10 ;
   - **les 8 machines à `quantite` 0 et `achetees` 0** ;
   - `decouvertes.paliers` 1 et `decouvertes.machines` **toujours 4** ;
   - `machinesDebloquees` 5 ;
   - `prix(e, 1)` = 10, `prix(e, 5)` = 1e9 ;
   - `multiplicateur(e, 1)` = 2.
3. `refroidir` à nouveau : `false` (10 J < 1e15).
4. `acheter(e, 1)`, puis `avancer(e, 1000)` : énergie **2** (une Dynamo ×2).
5. La Dynamo à `achetees` 10 : `multiplicateur(e, 1)` = **4**.
6. Pour chaque seuil 1e15, 1e22, 1e30, 1e39 et 1e44 : énergie au seuil, puis
   `refroidir` rend `true`. Attendu :
   - palier 6 et `decouvertes.paliers` 6 ;
   - `machinesDebloquees` 8 ;
   - `multiplicateur(e, 1)` = **64** (les achats sont repartis de zéro, donc
     2⁶ seul) ;
   - `seuilSuivant` `null`, `apercuRefroidir` `null`.
7. Énergie à 1e400 : `refroidir` rend `false`, et le palier reste 6.

**Falsification, à exécuter une fois puis à défaire.**

- `achetees` non remis à zéro : le point 2 tombe (prix 1e10, ×16).
- Le ×2 non cumulatif (×2 dès le palier 1, sans puissance) : le point 6
  tombe (×2 au lieu de ×64).
- Le seuil d'un cran trop loin (`palier + 2`) : le point 2 tombe.
- `machinesDebloquees` inchangé : le point 2 tombe (4 au lieu de 5).

---

## 9. `RETOURS.md`, `CLAUDE.md`, la copie du plan

**`RETOURS.md`.** Ranger les retours d'Ethan, **au format du fichier**
(« - [date] écran : … · ce qui se passe : … · ce que j'attendais : … »).
Relevés par Claude sur ses captures du 28/09, acceptés par Ethan le 02/10
(« Oui tout est ok ») :

- **Ergonomie** :
  - [28/09] écran : principal · ce qui se passe : l'énergie change de
    longueur sans cesse (« 6 J », « 5,05 J », « 4,15 J ») · ce que
    j'attendais : des joules entiers sous 1000 J ;
  - [28/09] écran : cartes · ce qui se passe : « X1 », le × de la police
    ressemble à un X, et « 1 · X1 · lot 1/10 » est dense · ce que
    j'attendais : une ligne qu'un nouveau joueur lit sans aide ;
  - [28/09] écran : boutons de prix · ce qui se passe : le « J » de Pixelify
    Sans ressemble à un C à l'envers · ce que j'attendais : un J lisible.
- **Textes** :
  - [28/09] écran : carte Dynamo · ce qui se passe : « produit l'énergie » ·
    ce que j'attendais : « produit de l'énergie ».

**Ne pas les corriger dans ce lot** : c'est le travail du lot RETOURS-C1.

**`CLAUDE.md`** :

- **L'état** :
  - dernier lot FROID ;
  - version et build ;
  - `SAVE_VERSION` 3 ;
  - **8 tests**, `voir` en 28 étapes ;
  - taille de `dist` ;
  - la ligne Mesure.
- **La ligne Rendu** disait encore « pas encore sur le téléphone » : c'est
  faux depuis le 28/09 (Ethan a joué sur son téléphone).
- **L'architecture** :
  - `froid.js`, et l'ordre des imports ;
  - refroidir est un geste du joueur, jamais dans `avancer` ;
  - `decouvertes.paliers` ;
  - la règle des versions dans les tests (§4).

**La copie du plan**, à la racine. Deux remplacements, au texte près, pour
qu'elle reste identique à l'original du projet :

§6.1, remplacer :

```
- Noms provisoires : Dynamo, Alternateur, Turbine, Centrale, Réseau, Réacteur,
  Accélérateur, Collisionneur.
```

par :

```
- Noms (tranchés le 02/10) : Dynamo, Alternateur, Turbine, Centrale, Réseau,
  Cyclotron, Synchrotron, Collisionneur.
```

§18, remplacer :

```
5. **Les noms des 8 machines** (Dynamo, Alternateur, Turbine, Centrale, Réseau,
   Réacteur, Accélérateur, Collisionneur, pour l'instant). « Réacteur » fait
   doublon avec les réacteurs de la couche 2, donc il faut le renommer.
```

par :

```
5. ~~Les noms des 8 machines~~ : **tranchés le 02/10** : Dynamo, Alternateur,
   Turbine, Centrale, Réseau, Cyclotron, Synchrotron, Collisionneur.
```

---

## 10. Ce qui n'est PAS dans ce lot

- **La supraconductivité** : le matériau, Tc, le ×10, le quench et les
  Webers. C'est le lot SUPRA, avec le Régulateur qui refroidit tout seul.
- **Les retours d'Ethan** (§9) : ils sont rangés ici, pas corrigés.
- **Une confirmation en deux temps** du bouton (§5.1).
- **Corriger l'écart hors ligne** : il atteint −2,7 % avec 8 machines, et il
  est mesuré. **Ethan décide** (arbitrage du plafond).
- **Un raccourci « palier » dans le mode test** : énergie puis Refroidir
  suffisent.

---

## 11. Versionnage

- **La version et le build bougent ensemble**, au numéro disponible.
- **`SAVE_VERSION` passe de 2 à 3** (§4).
- **`npm run mesure` est relancé**, et `mesures/MESURE.md` versionné.

---

## 12. Le rapport — `rapports/RAPPORT-lotFROID.md`

1. **Le geste zéro.**
2. **`npm run check`** : 8 tests, la garde, et la taille de `dist` ventilée,
   avec l'écart par poste.
3. **T1 et T2** : les assertions, et les **sept falsifications**.
4. **`npm run voir`** : 28 étapes, avec les captures `froid.png` et
   `palier6.png` **regardées**.
5. **`npm run mesure`** :
   - le texte complet ;
   - la durée ;
   - le tableau **attendu / obtenu** du §6.5 ;
   - ce que dit désormais la phrase sur la durée de l'absence.
6. **Les écarts déclarés** :
   - le bloc qui arrive avec la Turbine ;
   - le palier 1 lu au refroidissement ;
   - « 27,1 K ».
7. **Ce qui contredit ce brief.**
8. **« À tester sur ton téléphone, en 10 minutes »** :
   1. Ta partie du 28/09 s'ouvre, avec tes machines.
   2. Mode test → Nouvelle partie. Achète jusqu'à la première Turbine : le
      bloc froid apparaît. Est-ce clair, sans explication ?
   3. Mode test, énergie `1e9` : le bouton s'allume. Lis l'aperçu, puis
      refroidis. Comprends-tu ce qui s'est passé ?
   4. Rachète tes machines : sens-tu le ×2 ?
   5. Continue au moins jusqu'au palier 2 **sans le mode test** (une
      dizaine de minutes). Le rythme te va ?
   6. Mode test : énergie au seuil, puis Refroidir, jusqu'à 1,5 K. La fin
      est-elle claire ?
   7. Quitte 5 minutes au milieu d'un palier, puis reviens : le bandeau
      s'affiche, et le bouton s'allume si le seuil est passé.

   Tes retours vont dans `RETOURS.md`.

⚠ **RELECTURE HOSTILE AVANT LA PR** :
- qui d'autre écrit `froid.palier` et `decouvertes.paliers` ?
- `refroidir` remet-elle **tout** ce qui doit l'être, et **rien** d'autre ?
- un palier peut-il être franchi sans que le joueur appuie ?
- une carte, une ligne ou un bouton déjà vu peut-il disparaître après un
  palier ?

⚠ **Branche `claude/froid-paliers`. Claude Code ouvre la PR, Ethan fusionne.**
