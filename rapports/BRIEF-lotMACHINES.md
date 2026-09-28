# BRIEF — lot MACHINES

Deuxième lot de **Température Critique**. Il donne au jeu sa première
mécanique : **huit machines en cascade**. La machine 1 produit de l'énergie,
et chaque machine n produit la machine n − 1. C'est la mécanique des
dimensions d'Antimatter Dimensions, avec ses tables de coûts, sous licence
MIT.

À la fin du lot, on achète une Dynamo et l'énergie monte. Puis un Alternateur
apparaît, et ainsi de suite jusqu'à la quatrième machine. **Les machines 5 à 8
existent dans les données, mais restent verrouillées** : c'est le lot FROID
qui les ouvrira, une par palier.

Ce brief applique le plan `claude/DESIGN-TEMPERATURE-CRITIQUE.md` v5 (§6.1 et
§16.2, lot 2). Tout ce qu'il faut en est recopié ici.

---

## MODÈLE ET EFFORT

**Opus 5, effort extra**, le plancher du projet. Deux raisons :

- le lot **fait bouger `SAVE_VERSION`**, et la sauvegarde de test d'Ethan
  existe déjà sur son téléphone ;
- la règle de production posée ici (§4) est celle que le joueur automatique
  (lot 3) et tout l'équilibrage mesureront. Une règle floue ici fausse toutes
  les mesures suivantes.

Fable 5 : **peu pertinent**. La mécanique est celle d'AD, reprise telle
quelle.

---

## 0. Geste zéro

1. Lire `CLAUDE.md` en entier, puis `PASSATION-2026-09-27.md` à la racine s'il
   y est, puis `rapports/RAPPORT-lotSOCLE.md`.
2. **Lister** la racine, `src/`, `src/data/`, `src/sim/`, `src/ui/`, `tools/`
   et `test/`.
3. `npm ci && npm run check`, puis consigner la sortie. Référence, d'après le
   rapport SOCLE et `CLAUDE.md` du 27/09 :
   - version · build : **0.1.0 · build 1** ;
   - `SAVE_VERSION` : **1** ;
   - **2 tests** ;
   - `dist/index.html` : **172 907 octets**.

   Une base rouge, on s'arrête et on le dit.
4. **Vérifier que Pages publie bien par GitHub Actions** : `gh api
   repos/freredoc/Temperature-Critique-/pages` doit donner `build_type:
   workflow`. Au SOCLE, il donnait `legacy`. Si c'est encore le cas, l'écrire
   **en tête du rapport** : Ethan joue alors une page qui n'est pas le jeu.
5. `npm run voir`, qui doit passer ses 14 étapes **avant** de toucher quoi que
   ce soit. Consigner.
6. Créer la branche **`claude/machines-cascade`**.
7. Copier ce brief tel quel dans `rapports/BRIEF-lotMACHINES.md`.

---

## 1. Ce que tu verras à l'écran (pour Ethan)

- **Au lancement d'une nouvelle partie**, en haut de l'écran : « 10 J » en
  orange, dessous « Une dynamo produit de l'énergie. », puis **une seule
  carte** : **DYNAMO**, avec un bouton « 10 J ».
- **Tu touches le bouton** : l'énergie tombe à 0 J, puis remonte d'elle-même,
  et une ligne « +1 J/s » apparaît sous l'énergie. La carte **ALTERNATEUR**
  apparaît, marquée **NOUVEAU**. Elle dit « produit des dynamos ».
- **Chaque carte montre** :
  - combien tu en as ;
  - son multiplicateur (×1, ×2, ×4…) ;
  - où tu en es du lot de 10 (« lot 7/10 ») ;
  - le prix ;
  - le temps d'attente à ce rythme (« dans 12 s », « ~3 min », « plus
    tard »).
- **Tous les 10 achats d'une même machine**, sa production **double**, et son
  prix fait un bond.
- **Après la deuxième machine achetée**, deux commandes apparaissent :
  - un choix **« ×1 » / « Jusqu'à 10 »** (acheter une par une, ou compléter
    le lot d'un coup) ;
  - un bouton **« TOUT ACHETER »**.
- **Quatre machines au plus** dans ce lot : Dynamo, Alternateur, Turbine,
  Centrale. Les quatre suivantes arriveront avec le froid.

---

## 2. Les données — `src/data/machines.js`, fichier neuf

```js
// Coûts de base et facteurs : ceux d'Antimatter Dimensions (MIT, © 2017 IvarK),
// BASE_COSTS et BASE_COST_MULTIPLIERS de src/core/dimensions/antimatter-dimension.js
// (lignes 337 et 339), relevés le 23/09/2026 et revérifiés le 27/09 :
// https://github.com/IvarK/AntimatterDimensionsSourceCode
export const MACHINES = [
  { id: 1, nom: "Dynamo",        pluriel: "dynamos",        cout: "10",   facteur: "1e3"  },
  { id: 2, nom: "Alternateur",   pluriel: "alternateurs",   cout: "100",  facteur: "1e4"  },
  { id: 3, nom: "Turbine",       pluriel: "turbines",       cout: "1e4",  facteur: "1e5"  },
  { id: 4, nom: "Centrale",      pluriel: "centrales",      cout: "1e6",  facteur: "1e6"  },
  { id: 5, nom: "Réseau",        pluriel: "réseaux",        cout: "1e9",  facteur: "1e8"  },
  { id: 6, nom: "Cyclotron",     pluriel: "cyclotrons",     cout: "1e13", facteur: "1e10" },
  { id: 7, nom: "Synchrotron",   pluriel: "synchrotrons",   cout: "1e18", facteur: "1e12" },
  { id: 8, nom: "Collisionneur", pluriel: "collisionneurs", cout: "1e24", facteur: "1e15" },
];
export const TAILLE_LOT = 10;         // le prix change et la production double tous les 10 achats
export const MULTIPLICATEUR_LOT = 2;
export const MACHINES_AU_DEPART = 4;  // le lot FROID en ajoutera une par palier
```

- **Les coûts et les facteurs sont des chaînes**, transformées en `Decimal`
  une fois pour toutes. `1e24` ne s'écrit pas exactement en `Number`.
- ⚠ **LES NOMS 6 ET 7 SONT UNE PROPOSITION DU 27/09**, à confirmer par Ethan.
  Le plan avait « Réacteur » en 6, qui fait doublon avec les réacteurs de la
  couche 2, et « Accélérateur » en 7. S'il en choisit d'autres, **seules les
  colonnes `nom` et `pluriel` changent**. Aucun nom de machine ne doit
  apparaître ailleurs dans le code.

---

## 3. L'état — `src/sim/etat.js`, et `SAVE_VERSION` 1 → 2

`etatInitial(creeLe)` gagne trois champs :

```js
machines: MACHINES.map(() => ({ quantite: new Decimal(0), achetees: 0 })),
decouvertes: { machines: 0 },         // le plus haut numéro de machine jamais acheté
preferences: { modeAchat: "un" },     // "un" | "lot"
```

- **`quantite`** : ce qu'on possède, achats **et** production (un `Decimal`).
- **`achetees`** : les seuls achats (un `Number` entier). **C'est `achetees`,
  et jamais `quantite`, qui fixe le prix et le multiplicateur.** C'est la règle
  d'AD.
- **`decouvertes.machines`** ne redescend jamais. Le lot FROID remettra les
  machines à zéro à chaque palier, mais les cartes déjà vues ne doivent pas
  disparaître (§6).
- **`preferences.modeAchat`** est sauvegardé : c'est un choix du joueur, pas un
  réglage de test.

**`SAVE_VERSION` passe de 1 à 2**, avec **`migrations[1]`**. Celle-ci ajoute
les trois champs à leur valeur initiale, **sans toucher à rien d'autre** : une
énergie à 10⁴⁰⁰ reste à 10⁴⁰⁰, une partie marquée « test » le reste.

**`defautDeForme`** (`src/sim/sauvegarde.js`) vérifie en plus :

- `machines` est un tableau de **8** entrées ;
- chaque `quantite` est un `Decimal` fini et ≥ 0 ;
- chaque `achetees` est un entier sûr ≥ 0 ;
- `decouvertes.machines` est un entier de 0 à 8 ;
- `preferences.modeAchat` vaut `"un"` ou `"lot"`.

Un code d'import qui ne passe pas est **refusé en nommant le champ fautif**.

⚠ **`SOCLE T1` ANCRE LE NUMÉRO DE VERSION DANS SON EXPRESSION RÉGULIÈRE** :
`/version 2.*plus récente/`, écrit quand `SAVE_VERSION + 1` valait 2. Il vaudra
3. Le réancrer sur `SAVE_VERSION + 1` calculé, et non sur un 3 en dur. Le
prochain bump ne devra rien retoucher. C'est son rôle, pas un effet de bord :
le dire au rapport.

⚠ **LA SAUVEGARDE D'ETHAN EST EN VERSION 1**, sur son téléphone, sans doute à
10⁴⁰⁰ J après le test du SOCLE. Elle doit s'ouvrir, migrée, au premier
lancement de ce build. C'est ce que vérifie `MACHINES T1`.

**Une copie d'avant migration.** C'est le premier bump de `SAVE_VERSION`,
donc le bon moment pour la poser. Une migration fausse qui passerait `defautDeForme`
écraserait la partie à la sauvegarde suivante. Donc :

- `relire` dit d'où vient l'enveloppe : `{ ok: true, enveloppe, migreeDepuis }`,
  avec `migreeDepuis` = la version lue si elle était inférieure à
  `SAVE_VERSION`, sinon `null` ;
- au **chargement** (pas à l'import : le code est déjà sa propre copie), si
  `migreeDepuis` n'est pas `null`, `src/ui/stockage.js` copie le texte lu tel
  quel sous `temperature-critique:sauvegarde-v<version>:<date ISO>`, **avant**
  toute écriture ;
- si la copie échoue, `ecritureBloquee` se pose, avec un bandeau : c'est la
  règle du SOCLE, on n'écrase jamais ce qu'on n'a pas su mettre de côté.

Chaque bump suivant en profite sans rien retoucher.

---

## 4. La simulation — `src/sim/machines.js`, fichier neuf, et `avancer`

### 4.1 Les règles, toutes

- **Prix de la prochaine unité** de la machine n :
  `cout(n) × facteur(n) ^ floor(achetees(n) / TAILLE_LOT)`.
- **Multiplicateur** de la machine n :
  `MULTIPLICATEUR_LOT ^ floor(achetees(n) / TAILLE_LOT)`. Le lot FROID y
  ajoutera le ×2 par palier. C'est donc **ici, et nulle part ailleurs**, que
  les multiplicateurs se composent : prévoir une fonction
  `multiplicateur(etat, n)`.
- **Production, par seconde** : la machine 1 donne
  `quantite(1) × mult(1)` joules, et la machine n ≥ 2 donne
  `quantite(n) × mult(n)` machines n − 1.
- **Machines débloquées** : `machinesDebloquees(etat)` rend
  `MACHINES_AU_DEPART` dans ce lot. Une machine au-delà ne s'achète pas, et ne
  produit pas.

⚠ **UN ÉCART VOULU AVEC AD : PAS DE DIVISION PAR 10.** Dans AD, une dimension
ne produit la précédente qu'au dixième (`diff / 10`, ligne 664 du même
fichier), et une vitesse de tick s'y ajoute. Ici, la machine n produit la
machine n − 1 **au plein**, sans tick : c'est la règle de la simulation du
23/09 qui a calé tout le plan. Si tu lis le code d'AD, **ne « corrige » pas
vers AD** : le jeu deviendrait dix fois plus lent par étage de la cascade, sans
que personne l'ait décidé.

### 4.2 `avancer(etat, dtMs)` : Euler explicite, sur les valeurs du DÉBUT du pas

`avancer` appelle `produire(etat, dtMs)`, qui :

1. calcule **toutes** les productions à partir des quantités **d'avant le
   pas**, avec `secondes = dtMs / 1000` ;
2. puis les ajoute : l'énergie d'abord, les machines ensuite.

⚠ **C'EST LA RÈGLE DE LA SIMULATION DU 23/09**, celle qui a mesuré le Graal à
~5 h et la transition du plomb à 29 min 11 s. Faire l'inverse, laisser la
Dynamo profiter des dynamos produites dans le même pas, donnerait un autre
jeu, plus rapide sans que personne l'ait décidé. `MACHINES T2` l'attrape.

⚠ **UN GRAND PAS SOUS-ESTIME UNE CASCADE**, et c'est accepté. Le rattrapage
hors ligne fait au plus 1000 pas : une semaine donne des pas de 10 min, et
Euler explicite sous-estime alors ce qu'une cascade aurait produit. Le jeu est
donc un peu **plus avare hors ligne** qu'en jeu. Ce lot ne le corrige pas, et
**ne doit pas** le corriger (pas de sous-pas cachés, pas de formule fermée). Le
joueur automatique mesurera l'écart au lot 3, puis Ethan décidera. Le dire au
rapport.

### 4.3 Les achats

Les achats sont des fonctions pures, appelées par l'écran :

- **`acheter(etat, n)`** achète **une** unité si la machine est débloquée et
  si l'énergie suffit. Elle retire le prix de l'énergie, puis ajoute 1 à
  `quantite` **et** à `achetees`. Elle met à jour
  `decouvertes.machines = max(…, n)` et rend `true` ou `false`.
- **`acheterLot(etat, n)`** achète **le reste du lot en cours**
  (`TAILLE_LOT − achetees % TAILLE_LOT` unités, au prix courant), **si et
  seulement si** l'énergie suffit pour tout. C'est le « Until 10 » d'AD : pas
  de lot partiel.
- **`toutAcheter(etat)`** va de la plus haute machine débloquée à la plus
  basse. Pour chacune, il achète tant que l'énergie suffit. C'est le « Max
  all » d'AD, et **exactement** la stratégie de la simulation du 23/09.
  - ⚠ **Il avance lot par lot, pas unité par unité.** Calculé le 27/09 : à
    10⁴⁰⁰ J, il fait **3 786 achats** (1 328 dynamos, 999 alternateurs, 799
    turbines, 660 centrales). Le prix ne change qu'en fin de lot : acheter
    d'un coup `k = min(reste du lot, floor(énergie / prix))` unités donne
    **exactement** le même état que la boucle unité par unité, en ~450 tours
    au lieu de 3 786. Garde : jamais d'énergie négative (si `k × prix` dépasse
    l'énergie à cause de l'arrondi, `k − 1`). `npm run voir` chronomètre
    l'appel (§8) : **moins de 50 ms**.
- **Aucun achat ne passe par `avancer`** dans ce lot. L'Assistant d'achat, qui
  achètera tout seul, arrive avec le Labo au lot SUPRA.

⚠ **LA PRÉCISION DE `Decimal` EST CELLE D'UN `Number`, SOIT ~16 CHIFFRES.**
Avec 10⁴⁰⁰ J, payer 10 J ne change pas l'énergie. C'est normal, et identique
dans AD. Ne rien « corriger ».

---

## 5. L'écran

### 5.1 La structure

`src/index.html` : **après** le `<p class="energie">`, en éléments frères
(**jamais dedans** : `npm run voir` lit le texte entier de `.energie` et y
attend exactement « 10 J »), ajouter :

- la ligne de production (`[data-devoile="production"]`) ;
- la ligne d'aide (`[data-devoile="aide-debut"]`) ;
- les commandes d'achat (`[data-devoile="commandes-achat"]`) : les deux
  boutons de mode, avec `aria-pressed`, et « TOUT ACHETER » ;
- un conteneur vide `#machines`.

`src/ui/machines.js`, fichier neuf, **crée les 8 cartes à partir de
`MACHINES`**, une par machine, avec `data-devoile="machine-<id>"`. **Il le fait
avant la vérification du dévoilement** de `monterEcran` (§6).

⚠ **`#valeur-energie`, `.energie` ET « 10 J » NE CHANGENT PAS** : les étapes
1, 2, 5, 6 et 8 de `npm run voir`, et deux de ses vérifications « + », les
lisent.

### 5.2 Une carte

La maquette « 2 · Couche 1 en cours » est dans le projet Claude, **que tu ne
vois pas** : tout ce qu'il en faut est ici. Référence : **360 px de large**.

- **À gauche** :
  - le nom, en Pixelify 15 px, en capitales (CSS `text-transform` : la donnée
    reste « Dynamo »), avec « NOUVEAU » en cyan tant que
    `decouvertes.machines < n` (pas `achetees`, que le lot FROID remettra à
    zéro) ;
  - la ligne « `formater(quantite.floor())` · ×mult · lot k/10 » ;
  - la ligne « produit l'énergie » ou « produit des `<pluriel de n−1>` ».
- **À droite** :
  - le bouton de prix : `formater(prix)` suivi de « J », ou le prix du reste du
    lot en mode « Jusqu'à 10 » ;
  - sous le bouton, l'attente.
- **Le bouton** est un vrai `<button>`, `disabled` quand l'énergie ne suffit
  pas. `aria-label` : « Acheter : Dynamo, 10 J ».
- **En mode « Jusqu'à 10 »**, le bouton affiche le prix du reste du lot
  (`reste × prix`, le prix ne bougeant pas dans un lot), et il est `disabled`
  tant que l'énergie ne couvre pas **tout** le reste.
- **L'attente** porte sur le prix affiché. Elle se calcule dans `src/ui/`
  avec la production d'énergie courante, **jamais dans `src/sim/`** :
  - rien quand on peut payer ;
  - « dans N s » sous une minute ;
  - « ~N min » sous une heure ;
  - « plus tard » au-delà, ou si la production est nulle.
- **La carte qu'on peut presque payer** (moins de 10 s d'attente) a une bordure
  orange (`orange`) ; les autres, la bordure `trait`.
- **Aucun texte ne se recalcule s'il n'a pas changé** : c'est le motif de
  `energieAffichee` dans `ecran.js`. Huit cartes réécrites 60 fois par seconde
  feraient chauffer le téléphone.

### 5.3 La ligne de production

« +`formater(production d'énergie par seconde)` J/s », en `texte-2`, sous
l'énergie.

### 5.4 La mise en page

`.principal` n'est plus centré verticalement. L'énergie reste en haut, en
56 px, avec la ligne de production. Ce bloc **reste collé en haut**
(`position: sticky`, fond `fond`) quand la liste des cartes défile dessous : on
achète en regardant l'énergie. **Aucun débordement horizontal
à 360 px**, même à 10⁴⁰⁰ J et avec des quantités de 10¹⁰⁰ : `npm run voir` le
vérifie. **Seules les 16 couleurs de la palette** : le build refuse les autres.

---

## 6. Le dévoilement — `src/data/devoilement.js`

Les entrées ajoutées :

| id | condition |
|---|---|
| `aide-debut` | `decouvertes.machines === 0` |
| `production` | `decouvertes.machines >= 1` (et non « production > 0 » : le lot FROID remettra la production à zéro à chaque palier, et la ligne clignoterait) |
| `commandes-achat` | `decouvertes.machines >= 2` |
| `machine-1` | toujours vraie |
| `machine-n` (n ≥ 2) | `n <= machinesDebloquees(etat)` **et** `decouvertes.machines >= n − 1` |

- Les entrées `machine-n` sont **générées à partir de `MACHINES`**, pas
  écrites à la main huit fois.
- ⚠ **UNE CARTE VUE NE DISPARAÎT PLUS.** C'est pour cela que la condition lit
  `decouvertes.machines`, qui ne redescend jamais, et non `achetees`, que le
  lot FROID remettra à zéro. Une carte qui clignoterait à chaque palier serait
  exactement ce que P1 interdit.

---

## 7. Les licences

La section « Antimatter Dimensions — MIT » de `LICENCES-TIERCES.md`, réservée
au SOCLE, reçoit :

- le **texte complet** de la licence, recopié depuis
  `https://raw.githubusercontent.com/IvarK/AntimatterDimensionsSourceCode/master/LICENSE`
  (MIT, © 2017 IvarK) ;
- une ligne qui dit **ce qui est repris** : les deux tables `BASE_COSTS` et
  `BASE_COST_MULTIPLIERS`, et la règle « prix ×facteur et production ×2 tous
  les 10 achats ». Aucun code d'AD n'est copié.

---

## 8. `npm run voir`, prolongé

Les 14 étapes existantes restent, et doivent passer. Les 8 nouvelles se
placent **avant la dernière** (« zéro erreur dans la console… »), pour qu'elle
les couvre aussi.

⚠ **L'ÉTAPE « + SAUVEGARDE DE VERSION FUTURE » BLOQUE L'ÉCRITURE** jusqu'au
prochain chargement (`ecritureBloquee`, voulu). La première nouvelle étape
repart donc d'un stockage vidé, sinon la 7ᵉ ne pourrait rien sauvegarder.

⚠ **SOUS 1000 J, L'ÉNERGIE S'AFFICHE AVEC 3 DÉCIMALES** (« 0,05 J » dès le
premier pas de 50 ms). Un « 0 J » exact ne se lit donc pas de façon fiable :
les étapes lisent des bornes, pas des égalités, quand le jeu tourne.

1. **Partie neuve** : depuis `/atelier`, retirer la clé de sauvegarde, puis
   ouvrir le jeu. « 10 J », la ligne d'aide, et **une seule** carte visible
   (Dynamo). Pas de ligne de production, pas de commandes d'achat. Capture
   `debut.png`.
2. **Toucher Dynamo** : juste après, l'énergie est **sous 2 J** ; la ligne
   « +1 J/s » apparaît ; la carte Alternateur apparaît, marquée NOUVEAU ; la
   ligne d'aide disparaît.
3. **Mode test** (7 touchers, la page a été rechargée) **« +1 min »** :
   l'énergie gagne **au moins 60 J**, et au plus 60 J + les secondes réelles
   écoulées pendant l'étape + 1. Une seule Dynamo, sans cascade : le
   rattrapage est exact ici.
4. **Énergie `1e6`** (mode test), puis **9 touchers** sur Dynamo : la carte
   montre « 10 · ×2 · lot 0/10 » et le prix « 10 000 J ». Les commandes
   d'achat restent cachées (une seule machine découverte).
5. **Toucher Alternateur** : les commandes d'achat apparaissent. Choisir
   « Jusqu'à 10 » : le bouton Alternateur affiche « 900 J » (9 × 100), le
   bouton Dynamo « 100 000 J » (10 × 10 000). Revenir à « ×1 ».
6. **Énergie `1e400`, « TOUT ACHETER »**, touché dans un `page.evaluate` qui
   chronomètre `bouton.click()` avec `performance.now()` (le gestionnaire est
   synchrone) : **moins de 50 ms**, à consigner. La Centrale affiche **660**
   (elle n'a pas de producteur : sa quantité ne bouge plus). **Les cartes 5 à 8
   restent cachées**, et il n'y a aucun débordement horizontal
   (`document.documentElement.scrollWidth ≤ innerWidth`). Capture
   `couche1.png`.
7. **« Sauvegarder maintenant », puis rechargement** : la Centrale affiche
   toujours 660, et les 4 cartes sont là.
8. **La sauvegarde de version 1** : depuis `/atelier`, écrire sous la clé de
   sauvegarde le texte exact qu'écrivait le SOCLE :
   `{"saveVersion":1,"build":1,"sauveLe":<Date.now()>,"etat":{"meta":{"creeLe":1000,"modeTestUtilise":true},"temps":{"totalMs":5000},"energie":{"$d":"1e400"}}}`,
   puis ouvrir le jeu. Attendu : « 1,00e400 J », aucun bandeau orange, la
   seule carte Dynamo et la ligne d'aide (rien de découvert) ; la copie
   `temperature-critique:sauvegarde-v1:…` existe et vaut ce texte au
   caractère près ; après « Sauvegarder maintenant », la sauvegarde est en
   `saveVersion` 2.

---

## 9. Les deux tests

### `MACHINES T1` — la sauvegarde de version 1 s'ouvre, et la nouvelle forme voyage

**Montage.**

1. Une enveloppe **exactement comme le SOCLE l'écrivait** :
   ```js
   { saveVersion: 1, build: 1, sauveLe: 2_000,
     etat: { meta: { creeLe: 1_000, modeTestUtilise: true },
             temps: { totalMs: 5_000 }, energie: new Decimal("1e400") } }
   ```
   passée par `serialiser` puis `relire`.
2. Un état neuf avec la machine 3 à `quantite = new Decimal("1.23e45")` et
   `achetees = 37`, et `decouvertes.machines = 3`, passé par
   `importer(exporter(…))`.
3. Le même, avec `machines` réduit à 7 entrées, passé à `importer`.

**Assertions.**

1. La relecture réussit, avec :
   - `saveVersion === 2` et `migreeDepuis === 1` ;
   - 8 machines, chacune avec une `quantite` `Decimal` nulle et `achetees ===
     0` ;
   - `decouvertes.machines === 0`, `modeAchat === "un"` ;
   - l'énergie `.eq(1e400)` ;
   - `modeTestUtilise === true` ;
   - `totalMs === 5000`.
2. `quantite` revient `instanceof Decimal`, égale à 1,23 × 10⁴⁵, et `achetees
   === 37`.
3. Refus (`ok: false`), avec un message qui nomme `machines`.

**Falsification, à exécuter une fois puis à défaire.**

- Retirer `migrations[1]` : le premier point tombe (« la migration 1 → 2
  manque »).
- Faire écrire `0` (un `Number`) au lieu de `new Decimal(0)` par
  `etatInitial` : le deuxième point tombe (refus de forme sur `quantite`, pour
  les machines autres que la 3).
- Retirer la vérification de forme des machines : le troisième point tombe.

### `MACHINES T2` — la cascade suit la règle, au joule près

**Montage.** `etatInitial(0)`, puis `energie = new Decimal(1000)`.

1. `acheter(e, 1)` neuf fois, puis `acheter(e, 2)` une fois.
2. `avancer(e, 1000)` : **un seul** pas d'une seconde.
3. `acheter(e, 1)` une fois (la 10ᵉ Dynamo).
4. `avancer(e, 1000)`.

**Assertions**, valeurs calculées à part le 27/09 :

| Après | énergie | dynamos (`quantite`) | dynamos (`achetees`) | prix Dynamo | mult Dynamo |
|---|---|---|---|---|---|
| étape 1 | 810 | 9 | 9 | 10 | 1 |
| étape 2 | **819** | **10** | **9** | **10** | **1** |
| étape 3 | 809 | 11 | 10 | **10 000** | **2** |
| étape 4 | **831** | 12 | 10 | 10 000 | 2 |

**Falsification, à exécuter une fois puis à défaire.**

- **Euler sur les valeurs de fin de pas** (les dynamos produites comptent dans
  le même pas) : 820 au lieu de 819 à l'étape 2.
- **Prix ou multiplicateur calculés sur `quantite`** : à l'étape 2, 10
  dynamos au lieu de 9 achetées, donc prix 10 000 et mult 2 au lieu de 10 et
  1.
- **Le ×2 à 11 achats au lieu de 10** : 820 au lieu de 831 à l'étape 4.

Le rapport donne le résultat des trois.

---

## 10. Ce qui n'est PAS dans ce lot

- **Les paliers de froid**, et donc les machines 5 à 8 : lot FROID. La
  température, la ligne Objectif et le ×2 par palier viennent avec lui.
- **Les automatismes** (Assistant d'achat) et **le Labo** : lot SUPRA.
- **Le joueur automatique** : lot 3, le suivant. Mais `acheter`,
  `acheterLot`, `toutAcheter` et `avancer` doivent être utilisables sous
  Node, sans écran : c'est lui qui les appellera.
- **Corriger la sous-estimation hors ligne** (§4.2) : elle se mesure d'abord.
- **Les succès, le carnet, les onglets.**
- **Toucher aux symboles** absents des polices : Ethan n'a pas encore tranché
  (`RETOURS.md` est vide).
- **Toucher à `formater`**, même si les décimales qui défilent sous 1000 J
  surprennent : la question est posée à Ethan (§12, point 7).

---

## 11. Versionnage et rendu

- **La version et le build bougent ensemble**, avec le numéro disponible au
  moment de l'exécution. Le brief n'en propose aucun.
- **`SAVE_VERSION` passe de 1 à 2** (§3).
- **`CLAUDE.md` est mis à jour** :
  - le tableau « L'état » ;
  - dans l'architecture, la règle d'Euler sur les valeurs du début du pas,
    `achetees` qui fixe prix et multiplicateur, `decouvertes` qui ne
    redescend jamais, et les cartes générées depuis `MACHINES`.
- **Le rendu se voit** (§8), ou se déclare non vu.

---

## 12. Le rapport — `rapports/RAPPORT-lotMACHINES.md`

1. **Le geste zéro** : la base, le mode de Pages, `voir` avant travail.
2. **`npm run check`** : **4 tests**, et la taille de `dist/index.html`
   ventilée comme au SOCLE, avec l'écart par poste.
3. **T1 et T2** : les assertions, et les six falsifications exécutées.
4. **`npm run voir`** : les 22 étapes, la durée de « TOUT ACHETER » à
   10⁴⁰⁰ J, les captures.
5. **Les écarts déclarés** :
   - la sous-estimation hors ligne ;
   - le réancrage de `SOCLE T1` ;
   - l'absence de division par 10 (écart voulu avec AD, §4.1) ;
   - les noms 6 et 7 en attente d'Ethan.
6. **Ce qui contredit ce brief.**
7. **« À tester sur ton téléphone, en 10 minutes »**, au minimum :
   1. Ta partie du SOCLE s'ouvre, et l'énergie est toujours là.
   2. Mode test → Nouvelle partie : « 10 J », une seule carte Dynamo.
   3. Achète une Dynamo : l'énergie remonte, l'Alternateur apparaît.
   4. Achète jusqu'à 10 dynamos : ×2, et le prix saute.
   5. Achète un Alternateur : les dynamos se multiplient toutes seules.
   6. Essaie « Jusqu'à 10 » et « TOUT ACHETER ».
   7. Lis les cartes à bout de bras : les nombres se lisent-ils bien ? Et
      sous 1000 J, l'énergie défile avec des décimales (« 12,35 J ») : ça te
      gêne, ou c'est vivant ?
   8. Quitte l'appli 5 min, puis reviens : le bandeau d'absence, et l'énergie
      a monté.

   Tes retours vont dans `RETOURS.md`.

⚠ **RELECTURE HOSTILE AVANT LA PR** : qui d'autre écrit ce champ ? qui d'autre
lit cet état ? cet état est-il seulement atteignable ?

⚠ **Branche `claude/machines-cascade`. Claude Code ouvre la PR, Ethan
fusionne.**
