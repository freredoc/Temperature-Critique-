# BRIEF — lot JOUEUR-AUTO

Troisième lot de **Température Critique**. Il construit le **joueur
automatique** : un outil qui joue la simulation pure sous Node, sans écran, en
quelques secondes, avec une stratégie écrite noir sur blanc, et qui écrit un
rapport des temps mesurés face aux cibles du plan.

**Le jeu ne change pas d'un octet.** Tout se passe dans `tools/`, `test/` et
`mesures/`.

Ce brief applique le plan `claude/DESIGN-TEMPERATURE-CRITIQUE.md` v5 (§13,
§14 et §16.2, lot 3). Tout ce qu'il faut en est recopié ici.

---

## MODÈLE ET EFFORT

**Opus 5, effort extra**, le plancher du projet. Toutes les décisions
d'équilibrage des lots suivants reposeront sur cet instrument. Un instrument
qui ment sans bruit, c'est exactement le piège qu'Ethan a vécu sur ses deux
autres jeux : des calculs faux, qui obligent à rééquilibrer et à recommencer
la partie de test.

Fable 5 : **peu pertinent**.

---

## 0. Geste zéro

1. Lire `CLAUDE.md` en entier, puis `rapports/RAPPORT-lotMACHINES.md`.
   ⚠ `PASSATION-2026-09-27.md`, à la racine, date d'**avant** MACHINES : son
   état (§3, §5, §10) est dépassé. `CLAUDE.md` et les rapports font foi.
2. **Lister** la racine, `src/sim/`, `src/data/`, `tools/` et `test/`.
3. `npm ci && npm run check`, puis consigner la sortie. Référence, d'après le
   rapport MACHINES et `CLAUDE.md` du 28/09 :
   - version · build : **0.2.0 · build 2** ;
   - `SAVE_VERSION` : **2** ;
   - **4 tests** ;
   - `dist/index.html` : **189 877 octets**.

   **Noter le SHA-256 de `dist/index.html`** : à la fin du lot, il doit être
   le même (§10). Une base rouge, on s'arrête et on le dit.
4. **Pages sert-il le jeu ?** Le 28/09 au matin, non : l'adresse affichait le
   README rendu par GitHub (mode legacy), pas le jeu. Ethan doit régler la
   source sur « GitHub Actions ». Vérifier sans dépendre des droits :
   `curl -sL https://freredoc.github.io/Temperature-Critique-/ | grep -c 'valeur-energie'`.
   **1 : c'est le jeu ; 0 : ce n'est pas le jeu.** Si `curl` n'atteint pas
   `github.io`, le dire. Consigner le résultat **en tête du rapport**, sans
   s'arrêter : ce lot n'en dépend pas.
5. `npm run voir` doit passer ses **22 étapes** (`TC_CHROMIUM=<chemin>` si
   Chromium est déjà installé ailleurs). Consigner.
6. Créer la branche **`claude/joueur-auto`**.
7. Copier ce brief tel quel dans `rapports/BRIEF-lotJOUEUR-AUTO.md`.

---

## 1. Ce que tu verras (pour Ethan)

- **Dans le jeu : rien de neuf.** Options affiche toujours **0.2.0 · build 2**.
- **Dans le dépôt, sur GitHub** : un fichier **`mesures/MESURE.md`**, qui se
  lit comme un bulletin. Par exemple :

  > Le seuil du palier 1 (10⁹ J) est atteint en **3 min 42 s**. Le plan visait
  > 3 min 43 s : écart −0,3 %, **dans la cible**. Plus long moment sans rien
  > pouvoir acheter : **19 s** (plafond du plan : 31 s).

- **À chaque lot qui touche au jeu**, ce fichier est recalculé. La PR montre
  alors ce qui a bougé dans les temps, ligne par ligne.

---

## 2. Ce qu'est le joueur automatique

Le plan (§13) le décrit ainsi : il « joue la simulation pure, sans écran, en
accéléré, avec une stratégie simple et écrite noir sur blanc. Il produit un
rapport des temps réels face aux cibles ». Et « chaque lot qui ajoute une
mécanique ajoute sa stratégie au joueur automatique ».

C'est un **outil permanent**, demandé par Ethan. Il vit dans
`tools/joueur-auto/` et se lance par **`npm run mesure`**. Il reste **hors de
`npm run check`** : il deviendra lent quand il jouera des jours de jeu. Seuls
ses deux tests entrent dans `check`.

Trois règles, toutes vérifiées par la suite :

⚠ **IL NE RÉIMPLÉMENTE AUCUNE RÈGLE DU JEU.** Il appelle les fonctions de
`src/sim/` : `etatInitial`, `avancer`, `toutAcheter`, `rattraper`…
S'il calculait un prix ou une production lui-même, il mesurerait sa propre
copie du jeu, pas le jeu. C'est la première question de la relecture hostile.

⚠ **IL EST DÉTERMINISTE.** Mêmes options, même texte, au caractère près :
- ni horloge, ni hasard ;
- **aucun état gardé au niveau du module** entre deux appels ;
- ni date ni durée d'exécution dans le rapport.

Au lot 7, il tournera des dizaines de fois dans un même processus. Un reste
d'une mesure dans la suivante fausserait tout l'équilibrage, sans erreur.

⚠ **IL AVANCE AU PAS DU JEU.** Il utilise `PAS_MS` (`src/data/constantes.js`,
50 ms), jamais un autre pas. Le hors ligne, lui, passe par `rattraper`,
exactement comme dans le jeu.

---

## 3. La structure — `tools/joueur-auto/`

La découpe est une proposition : tu peux la changer si tu le dis au rapport.
**La frontière, elle, est imposée** : `lancer.js` est le seul fichier impur.

| Fichier | Rôle | Pur ? |
|---|---|---|
| `partie.js` | `jouer(options)` : une partie neuve, `etatInitial(0)`. Toutes les `cadenceMs` de temps de jeu, la stratégie agit, puis `avancer(etat, PAS_MS)` × (`cadenceMs / PAS_MS`). Après **chaque** pas de 50 ms, les événements se relèvent. Arrêt au seuil `jusqua` (énergie) ou à `dureeMaxMs`. Rend un journal. | oui |
| `strategies.js` | Une stratégie par mécanique : `machines(etat)` appelle `toutAcheter(etat)` et rend le nombre d'unités achetées. Le lot FROID ajoutera « refroidir dès que le seuil est atteint ». | oui |
| `horsligne.js` | `mesurerHorsLigne(etat, ms)` (§6, T2). | oui |
| `cibles.js` | Les cibles du plan, avec leur source et le lot qui les rendra mesurables (§4.4). | oui |
| `rapport.js` | `rediger(resultats, entete)` : le texte Markdown de `MESURE.md`. | oui |
| `mesurer.js` | `mesurer(options, entete)` : `jouer`, puis le hors ligne sur les instantanés, puis `rediger`. Rend le texte. | oui |
| `lancer.js` | Lit version et build dans `package.json`, appelle `mesurer` avec les options de référence, écrit `mesures/MESURE.md`, affiche le texte et **la durée d'exécution dans la console seulement**. | **non** |

Dans `package.json` : `"mesure": "node tools/joueur-auto/lancer.js"`.

**Le journal** ne garde que des événements, jamais un état par pas :
- la **première fois** que l'énergie atteint 10ᵏ J, relevée après chaque pas
  de 50 ms ;
- le **premier achat** de chaque machine ;
- le **plus long écart entre deux achats**. C'est le temps entre deux
  décisions de la stratégie qui ont chacune acheté au moins une unité, avec
  ses deux bornes ;
- les **instantanés** demandés : un clone par `deserialiser(serialiser(etat))`
  au premier pas où l'énergie atteint le seuil ;
- **l'état final** : énergie, et quantité et achats de chaque machine ;
- le temps d'arrivée, ou « non atteint » si `dureeMaxMs` passe avant.

**Les nombres.** On obéit à la règle de `CLAUDE.md` : un `Decimal` ne devient
du texte que par `formater`. Les décades se lisent avec `energie.log10()` et
les comparaisons avec `gte`, jamais avec `Number(decimal)`. Les durées sont des
`Number` en ms entières. `cadenceMs` doit être un multiple de `PAS_MS`, sinon
on lève une erreur.

---

## 4. La partie de référence, et `mesures/MESURE.md`

### 4.1 Les options de référence

| Option | Valeur | Pourquoi |
|---|---|---|
| stratégie | `machines` | la seule mécanique du jeu aujourd'hui |
| `cadenceMs` | **250** | la cadence de la simulation du 23/09, qui a calé le plan |
| `jusqua` | **1e9 J** | le seuil du palier 1 (plan §6.2), le premier objectif du jeu |
| `dureeMaxMs` | 2 h de jeu | garde-fou |
| instantanés | 1e3, 1e6, 1e9 J | début, milieu et fin de la montée |
| absences | 1 h, 8 h, 24 h | un trajet, une nuit, une journée |

### 4.2 Le contenu de `MESURE.md`

**L'en-tête** : « Mesure — Température Critique 0.2.0 · build 2 », la
stratégie en une phrase et la cadence. **Ni date, ni durée d'exécution.**
L'en-tête, c'est tout ce qui précède la première ligne qui commence par
« ## » (T1 s'en sert).

1. **Repères face au plan**. Colonnes : repère · mesuré · cible · écart ·
   verdict.
   - Verdict : « dans la cible » si l'écart tient dans **±20 %** (plan §14),
     sinon « hors cible ».
   - Pour un plafond : « sous le plafond » ou « au-dessus ».
   - Durées : `formaterDuree` et, entre parenthèses, les secondes exactes
     (« 3 min 42 s (222,75 s) »).
   - Pourcentages : **à une décimale** (« −0,3 % »), sans `Number(decimal)`.
2. **Les décades** : le temps pour atteindre 10¹ à 10⁹ J.
3. **Les premiers achats**, machine par machine.
4. **Le hors ligne (P6)**. Pour chaque instantané et chaque absence :
   - le gain rattrapé ;
   - le gain de l'appli laissée ouverte sans toi (pas-à-pas de 50 ms) ;
   - leur écart en %.

   Une phrase dit ce que c'est : « quand tu reviens, le jeu te rend X % de
   moins que s'il était resté ouvert ». **Pas de verdict** : Ethan n'a pas
   encore chiffré la cible (arbitrage 6 du plan).
5. **Pas encore mesurable** : les cibles de `cibles.js` qu'aucune mécanique
   ne permet encore de mesurer, avec le lot qui les rendra mesurables.

Le texte s'adresse à Ethan : des phrases courtes, aucun nom de fonction.

### 4.3 Les valeurs de contrôle

Calculées le 28/09 de deux façons, qui donnent **les mêmes valeurs** :
- en Python, avec les règles du jeu ;
- avec **le vrai code de `src/sim/` de `main`** sous Node.

Avec les options de référence :

| Mesure | Valeur |
|---|---|
| **10⁹ J atteint** | **222 750 ms** (3 min 42,75 s) |
| Décades 10¹ … 10⁹ J (s) | 10 · 33,5 · 54,2 · 69 · 114,35 · 128,3 · 180,7 · 202,35 · 222,75 |
| Premiers achats (s) | Dynamo 0 · Alternateur 33,5 · Turbine 69 · Centrale 128,5 |
| **Plus long écart entre deux achats** | **19,25 s**, de 49,75 s à 69 s (l'attente de la première Turbine) |
| État final | dynamos 8 597 479,44 (30 achetées) · alternateurs 91 818,3 (20) · turbines 1 331,5 (10) · centrales 10 (10) · énergie 1 002 544 326,5 J |

| Hors ligne : gain rattrapé / gain pas-à-pas | 1 h | 8 h | 24 h |
|---|---|---|---|
| instantané 10³ J (54,2 s) | 0,99902 | 0,99900 | 0,99900 |
| instantané 10⁶ J (128,3 s) | 0,99710 | 0,99701 | 0,99701 |
| instantané 10⁹ J (222,75 s) | 0,99431 | 0,99405 | 0,99402 |

Soit, à une décimale, **−0,1 %, −0,3 % et −0,6 %**, quelle que soit l'absence.
C'est la loi k(k − 1)/(2N) : l'écart dépend du nombre de machines actives dans
la cascade (2, 3 puis 4), pas de la durée.

- ⚠ **CE NE SONT PAS DES TESTS** : la règle du projet interdit les tests
  d'équilibrage, et ces nombres bougeront au lot 7. C'est le **contrôle de ce
  lot**. Si ton rapport en diffère, le joueur ne joue pas les règles du jeu :
  trouver pourquoi **avant** la PR. Le rapport donne le tableau attendu /
  obtenu.
- **Pourquoi 222,75 s et non les 223,5 s du plan ?** La simulation du 23/09
  avançait par pas de 250 ms, le jeu par pas de 50 ms : une cascade intégrée
  plus finement monte un peu plus vite. L'écart est de **−0,3 %** : c'est
  normal, et c'est la première ligne du rapport.
- Les durées de calcul mesurées sous Node : environ 0,1 s pour la partie, et
  moins de 10 s pour tout le hors ligne. **`npm run mesure` doit rester sous
  une minute** ; la console affiche sa durée.

### 4.4 `cibles.js` : les cibles du plan

Recopiées ici. Chaque ligne porte sa source et le lot qui la rendra
mesurable.

| Repère | Cible | Source | Mesurable dès |
|---|---|---|---|
| Seuil du palier 1 (10⁹ J), partie neuve, 4 machines | 223,5 s | simulation du 23/09 (plan v1 §6.2) | **ce lot** |
| Plus long écart sans achat possible | plafond 31 s | plan §6.5 | **ce lot** |
| Palier 2 atteint | 8 min 58 s | simulation du 23/09 | FROID (lot 4) |
| Palier 3 atteint | 14 min 42 s | idem | FROID |
| Palier 4 atteint | 21 min 41 s | idem | FROID |
| Palier 5 atteint, transition du plomb | 29 min 11 s | plan §6.5 | FROID, puis SUPRA (lot 5) |
| Palier 6 atteint | ~35 min 36 s | simulation du 23/09 | FROID |
| Premier matériau (NbTi) | 35,6 min | plan v1 §6.2 | SUPRA |
| Un nouveau matériau toutes les… | 34 à 52 min | plan §6.5 | SUPRA |
| Le Graal | ~5 h (301,4 min) | plan §6.5 | SUPRA |
| Couche 1 entière | ~5 h | plan §4.1 | SUPRA |

Les paliers de la simulation du 23/09 supposent la règle du plan (§6.2) :
retour à 10 J et zéro machine, ×2 cumulatif, une machine de plus. Le lot FROID
les mesurera avec cette même partie de référence.

---

## 5. La garde — `tools/garde-sim.js`

Elle protège déjà `src/sim/`. Elle protège désormais aussi
**`tools/joueur-auto/`, sauf `lancer.js`** :

- les mêmes noms interdits que pour `src/sim/`, plus `process`, pour ces
  fichiers seulement ;
- **les imports** de ces fichiers ne peuvent venir que de :
  - `./…` (le joueur lui-même) ;
  - `../../src/sim/…` et `../../src/data/…` ;
  - `../../src/ui/format.js`, qui est pur.

  Tout autre import fait échouer `npm run check` : `node:fs`, `src/ui/ecran.js`,
  `src/main.js`… Le message nomme le fichier et la ligne.

La ligne finale devient : « garde-sim : src/sim/ et tools/joueur-auto/ sont
purs (N fichiers lus). »

---

## 6. Les deux tests — `test/joueur-auto.test.js`

### `JOUEUR-AUTO T1` — deux mesures de suite donnent le même texte

**Montage.** Des options réduites, pour aller vite :
- stratégie `machines` et cadence 250 ms ;
- jusqu'à 1e6 J, avec un instantané à 1e3 J ;
- une absence de 600 000 ms ;
- l'en-tête `{ version: "test", build: 0 }`.

Dans le **même processus** :

1. `A1 = mesurer(A)` ;
2. `B = mesurer(A avec cadenceMs: 1000)` ;
3. `A2 = mesurer(A)`.

**Assertions.**

1. `A2 === A1`, au caractère près.
2. `B` et `A1` **privés de leur en-tête** (§4.2) diffèrent. L'en-tête affiche
   la cadence demandée ; ce point vérifie que la cadence change **la mesure**
   elle-même. Calculé : 10⁶ J arrive à 130,5 s au lieu de 128,3 s.

Aucune assertion sur un temps : ce serait un test d'équilibrage.

**Falsification, à exécuter une fois puis à défaire.**

- Un état de module qui survit entre deux appels. Par exemple, l'ensemble des
  machines « déjà vues » pour les premiers achats, déclaré hors de `jouer` :
  le premier point tombe.
- La cadence ignorée, avec 250 écrit en dur dans `partie.js` : le deuxième
  point tombe, même si l'en-tête affiche encore « 1000 ms ».

### `JOUEUR-AUTO T2` — l'instrument du hors ligne compare les bonnes choses

**Montage.** `etatInitial(0)`, puis :
- énergie à 0 ;
- `quantite` de la Dynamo à 10 et de l'Alternateur à 10, avec `achetees` à 0
  (donc ×1).

Puis `mesurerHorsLigne(etat, 3_600_000)`.

**Assertions** (écart relatif ≤ 1e-9 pour les deux gains) :

1. `gainRattrape` = **64 771 200 J**. C'est `rattraper` : 1000 pas de 3,6 s.
2. `gainPasAPas` = **64 835 100 J**. Ce sont 72 000 pas de 50 ms.
3. **L'état d'entrée n'a pas bougé** : énergie 0, quantités 10 et 10,
   `temps.totalMs` 0.

Les deux valeurs sont exactes, calculées le 28/09 :
- en fractions, en Python : `aT + bT²(N − 1) / (2N)`, avec a = b = 10,
  T = 3600 s, et N = 1000 ou 72 000 ;
- retrouvées au joule près avec le vrai code du jeu.

**Falsification, à exécuter une fois puis à défaire.**

- Le pas-à-pas remplacé par `rattraper` : le deuxième point tombe (64 771 200).
- Pas de clone, les deux calculs sur le même objet : le deuxième ou le
  troisième point tombe.
- Le rattrapé fait d'un seul `avancer(etat, 3_600_000)` : le premier point
  tombe (36 000 J : en un seul pas, l'Alternateur ne profite pas à l'énergie).

**Et la garde, falsifiée une fois** :
- `Date.now()` dans `rapport.js` fait échouer `npm run check` ;
- un import de `../../src/ui/ecran.js` dans `partie.js` aussi.

---

## 7. La copie du plan à la racine du dépôt

`DESIGN-TEMPERATURE-CRITIQUE.md`, à la racine, est une copie antérieure à une
correction. Elle dit encore que le hors ligne est « exact ». **Deux
remplacements, au texte près**, rien d'autre :

**§11.3**, remplacer la ligne :

```
  automatismes actifs. C'est exact, parce que la simulation est déterministe.
```

par :

```
  automatismes actifs, **par grands pas (1000 au plus, comme AD)**. Ce n'est
  **pas exact** : un grand pas n'intègre pas une cascade comme mille petits.
  Corrigé le 24/09 au soir (lot SOCLE), et l'écart se mesure avec le joueur
  automatique.
```

**§13**, remplacer la ligne :

```
  sous Node, ce qui rend les tests falsifiables et le hors ligne exact.
```

par :

```
  sous Node, ce qui rend les tests falsifiables et le hors ligne reproductible
  (même résultat à chaque fois, mais approché, voir §11.3).
```

---

## 8. `CLAUDE.md` et `README.md`

**`CLAUDE.md`** :

- **Les commandes** : `npm run mesure` (joueur automatique, `mesures/MESURE.md`,
  hors de `check`).
- **L'architecture** : les trois règles du §2, et la frontière pur/impur du
  §3.
- **Deux règles nouvelles** :
  - tout lot qui touche `src/sim/` ou `src/data/` relance `npm run mesure`,
    versionne `mesures/MESURE.md`, et cite l'écart dans son rapport ;
  - tout lot qui ajoute une mécanique ajoute sa stratégie, et fait passer ses
    cibles de « pas encore mesurable » à mesurées.
- **L'état** :
  - dernier lot JOUEUR-AUTO ;
  - **6 tests** ;
  - version, build, `SAVE_VERSION` et taille de `dist` inchangés.

**`README.md`** : `npm run mesure` dans le tableau des commandes.

---

## 9. Ce qui n'est PAS dans ce lot

- **Aucun changement du jeu** : rien dans `src/`, et `dist/index.html`
  identique à l'octet (§10).
- **La stratégie des paliers** : lot FROID.
- **Corriger l'écart hors ligne** : ce lot le mesure, Ethan décidera.
- **D'autres profils de joueur** (« un toucher toutes les 5 s ») : la cadence
  est un paramètre, ça suffit pour l'instant.
- **Des graphiques** ; **`npm run mesure` dans la CI**.
- **Les noms des machines 6 et 7** : Ethan n'a pas tranché.

---

## 10. Versionnage

- **Le jeu ne change pas**, donc **ni la version, ni le build, ni
  `SAVE_VERSION` ne bougent**. Le build affiché dans Options doit continuer de
  dire à Ethan qu'il n'y a rien de neuf à tester.
- **Preuve** : le SHA-256 de `dist/index.html` en fin de lot est **celui du
  geste zéro**. Le rapport donne les deux.

---

## 11. Le rapport — `rapports/RAPPORT-lotJOUEUR-AUTO.md`

1. **Le geste zéro** :
   - la base, le SHA-256 de `dist` ;
   - **l'état de Pages en tête** (le jeu, ou pas) ;
   - `voir` avant travail.
2. **`npm run check`** : 6 tests, la garde élargie (nombre de fichiers lus),
   le SHA-256 de `dist` inchangé.
3. **T1 et T2** : les assertions, et les **cinq falsifications de test plus
   les deux de la garde**, exécutées puis défaites.
4. **`npm run mesure`** :
   - le texte complet de `MESURE.md` ;
   - la durée d'exécution ;
   - le tableau **attendu / obtenu** des valeurs de contrôle (§4.3).
5. **`npm run voir`** : toujours 22 étapes, rien n'a changé à l'écran.
6. **Les écarts déclarés**, et **ce qui contredit ce brief**.
7. **« À tester sur ton téléphone, en 10 minutes »** :
   1. **Rien de neuf dans le jeu.** Si l'adresse du jeu montre « 10 J » et
      « 0.2.0 · build 2 », fais le test du lot MACHINES (les 8 points de son
      rapport). Sinon, règle d'abord Pages : Settings → Pages → Source →
      GitHub Actions, puis Actions → Pages → Run workflow.
   2. **Ouvre `mesures/MESURE.md` sur GitHub**, depuis ton téléphone. Le
      comprends-tu sans aide ? Qu'est-ce qui te manque ?

   Tes retours vont dans `RETOURS.md`.

⚠ **RELECTURE HOSTILE AVANT LA PR** :
- le joueur calcule-t-il quelque part un prix, une production ou un seuil
  lui-même ?
- deux appels de `mesurer` partagent-ils quoi que ce soit ?
- le hors ligne passe-t-il par `rattraper`, et le pas-à-pas par `PAS_MS` ?

⚠ **Branche `claude/joueur-auto`. Claude Code ouvre la PR, Ethan fusionne.**
